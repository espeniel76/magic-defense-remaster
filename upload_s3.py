"""upload_s3.py — dist/ 빌드 결과를 S3에 업로드
사용법: python upload_s3.py [prefix]
prefix 미지정 시 'magic-defense' 사용
"""
import boto3, os, mimetypes, sys

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
PUBLIC_PATH = sys.argv[1] if len(sys.argv) > 1 else 'magic-defense'
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
print(f'{BASE_URL}/{PUBLIC_PATH}/')
