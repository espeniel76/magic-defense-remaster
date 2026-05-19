# 매직디펜스

나는 지금부터 게임을 만들거야.

1. 장르: 디펜스게임
2. 환경:모바일
3. 디바이스: 안드로이드
4. 연령: 전체이용가

나는 게임을 만들고 싶다. 그런데, 나는 컴퓨터 언어도 모르고 게임을 어떻게 개발하는지도 모른다. 하지만, 요즘 ai 를 이용해서 이걸 몰라도 많이들 만들더라.

그래서, 좀 막연하게 게임을 만들고 싶다는 생각을 했고, 대충 위와같은 게임을 만드려고 했다. 세세한건, 너가 진행하면서 나한테 제시해 주고 정했으면 좋겠어.

슈퍼파워스를 이용해서, 너가 잘 구성하고 진행해봐

---

**배포 URL**: <https://static.gochon-isahoe.kr/magic-defense/index.html>

## 새 노트북 셋업

### 1. 필수 프로그램 설치

- [Git](https://git-scm.com/download/win)
- [Node.js](https://nodejs.org/) (LTS)
- [Python](https://www.python.org/downloads/) (3.10+)

### 2. 저장소 클론

```powershell
cd C:\Users\<사용자명>\git
git clone https://github.com/espeniel76/magic-defense.git 매직디펜스
cd 매직디펜스
```

### 3. 의존성 설치

```powershell
npm install
pip install boto3
```

### 4. `.env` 파일 작성

`.env`는 보안상 git에 올라가 있지 않습니다. 기존 노트북의 `.env`를 USB/카톡으로 가져와서 프로젝트 루트(`C:\...\매직디펜스\.env`)에 그대로 붙여넣기.

파일 형식:

```text
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_S3_BASE_URL=https://static.gochon-isahoe.kr
```

### 5. 동작 확인

```powershell
npm run dev
```

브라우저에서 <http://localhost:5173> 접속.

## 배포

```powershell
npx vite build --base=/magic-defense/
python upload_s3.py magic-defense
```

자동으로 S3 업로드 + CloudFront 캐시 무효화 (30~60초 뒤 전세계 반영).

## 테스트

```powershell
npm test
```

## 주요 폴더

- `src/scenes/` — 타이틀/게임/게임오버 등 화면
- `src/core/` — 게임 로직 (마법사, 적, 웨이브, 경제 등)
- `src/render/` — 화면 렌더링 (보드, 레인, 액션바)
- `src/config/gameConfig.js` — 모든 게임 밸런스 수치
- `upload_s3.py` — 빌드 결과 S3 업로드 + CF 캐시 무효화

## PWA 설치 (앱처럼 사용)

폰 크롬으로 위 배포 URL 접속 → 우측 상단 ⋮ → "앱 설치" / "홈 화면에 추가".
