"""upload_s3.py — dist/ 빌드 결과를 S3에 업로드 + CloudFront 캐시 무효화
사용법: python upload_s3.py [prefix]
prefix 미지정 시 'magic-defense' 사용
"""
import boto3, os, mimetypes, sys, time

CLOUDFRONT_DIST_ID = 'E37OA58O8GG9O6'

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

PROJ = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(PROJ, 'dist')

env = {}
with open(os.path.join(PROJ, '.env'), 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

os.environ['AWS_ACCESS_KEY_ID'] = env['AWS_ACCESS_KEY_ID']
os.environ['AWS_SECRET_ACCESS_KEY'] = env['AWS_SECRET_ACCESS_KEY']
os.environ['AWS_DEFAULT_REGION'] = env['AWS_REGION']

BUCKET = env['AWS_BUCKET_NAME']
BASE_URL = env['AWS_S3_BASE_URL']
# CloudFront 배포가 OriginPath=/publish 로 설정돼 있어, S3 키는 publish/ 아래에 둬야
# 도메인의 같은 경로로 접근됨. 사용자에게는 도메인 기준 경로(예: magic-defense)만 받는다.
PUBLIC_PATH = sys.argv[1] if len(sys.argv) > 1 else 'magic-defense-remaster'
S3_PREFIX = f'publish/{PUBLIC_PATH}'

if not os.path.exists(DIST):
    print('ERROR: dist/ 가 없습니다. 먼저 `npm run build` 실행하세요.')
    sys.exit(1)

s3 = boto3.client('s3')
uploaded = 0

for root, dirs, files in os.walk(DIST):
    for f in files:
        local_path = os.path.join(root, f)
        rel_path = os.path.relpath(local_path, DIST).replace(os.sep, '/')
        s3_key = f'{S3_PREFIX}/{rel_path}'
        content_type, _ = mimetypes.guess_type(local_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        if content_type == 'text/html':
            content_type = 'text/html; charset=utf-8'
        s3.upload_file(local_path, BUCKET, s3_key, ExtraArgs={'ContentType': content_type})
        uploaded += 1
        print(f'  ok  {s3_key}')

print(f'\n=== {uploaded}개 파일 업로드 완료 ===')

# CloudFront 캐시 무효화 — 안 하면 엣지가 옛 버전을 계속 서빙함
print('CloudFront 캐시 무효화 중...')
cf = boto3.client('cloudfront', region_name='us-east-1')
inv = cf.create_invalidation(
    DistributionId=CLOUDFRONT_DIST_ID,
    InvalidationBatch={
        'Paths': {'Quantity': 1, 'Items': [f'/{PUBLIC_PATH}/*']},
        'CallerReference': f'{PUBLIC_PATH}-{int(time.time())}',
    },
)
print(f'  invalidation: {inv["Invalidation"]["Id"]} (보통 30~60초)')
# 하위 폴더 주소(끝 슬래시)는 CloudFront가 index.html을 안 붙여 403이 남.
# 그래서 바로 열리는 전체 주소를 출력한다.
print(f'\n{BASE_URL}/{PUBLIC_PATH}/index.html')
