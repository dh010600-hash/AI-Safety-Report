# 안전일지 작성기 — Netlify 배포 가이드

## 폴더 구조
- `public/index.html` — 웹사이트로 배포할 실제 페이지 (Netlify Functions를 호출하는 버전)
- `netlify/functions/` — AI 분석을 대신 처리하는 서버리스 함수 (API 키는 여기서만 사용됨, 브라우저에는 노출 안 됨)
  - `kakao-parse.js` — 카톡 붙여넣기 분석
  - `ai-suggest.js` — 안전지시사항 제안 (사진 포함)
  - `_lib.js` — 두 함수가 공유하는 Anthropic API 호출 로직
- `netlify.toml` — Netlify 빌드 설정 (publish=`public`, functions=`netlify/functions`)
- `safety-log-composer.html` — **건드리지 마세요.** 이건 Claude 아티팩트(claude.ai)에 그대로 게시되는 원본이고, 그쪽은 Netlify와 무관하게 계속 그대로 씁니다.

## 배포 방법 (택 1)

### A. Netlify 웹사이트에서 드래그 앤 드롭 (가장 빠름)
1. https://app.netlify.com 에서 로그인 → "Add new site" → "Deploy manually"
2. 이 폴더(`안전일지 프로젝트_2`) 전체를 통째로 드래그해서 올립니다. (Netlify가 `netlify.toml`을 읽어서 `public/`을 사이트로, `netlify/functions/`를 함수로 자동 인식합니다)
3. 배포된 사이트의 **Site settings → Environment variables**에서 추가:
   - Key: `ANTHROPIC_API_KEY`
   - Value: 발급받으신 실제 API 키 (여기에만 입력하세요. 저나 채팅창에 붙여넣지 마세요)
4. 환경변수 추가 후 **Deploys → Trigger deploy**로 한 번 다시 배포해야 함수에 키가 반영됩니다.

### B. GitHub 연동 (계속 수정하면서 쓸 거면 이 방법 추천)
1. 이 폴더를 GitHub 저장소로 올립니다 (원하시면 git init/커밋까지 도와드릴게요 — 다만 실제 push는 확인 후 진행합니다).
2. Netlify에서 "Add new site" → "Import an existing project" → 그 저장소 선택.
3. Build settings는 `netlify.toml`이 있어서 자동으로 잡힙니다 (Publish directory: `public`, Functions directory: `netlify/functions`).
4. 위 A-3과 동일하게 `ANTHROPIC_API_KEY` 환경변수를 등록합니다.

## 확인
- 배포된 사이트 URL로 들어가서 엑셀/PDF 저장 버튼이 바로 되는지 확인 (이건 API 키 없이도 됩니다).
- "AI로 분석해서 반영" / "AI 안전지시사항 제안" 버튼을 눌러서 결과가 오는지 확인합니다. 실패하면 상태 메시지에 원인이 뜹니다 (예: 키 미설정, Anthropic API 오류 등).

## 비용 관련
AI 버튼을 누를 때마다 등록하신 Anthropic API 키로 실제 과금이 발생합니다. 카톡 분석은 저렴한 모델(Haiku), 안전지시사항 제안은 조금 더 좋은 모델(Sonnet)을 씁니다. 사진은 전송 전에 자동으로 축소/압축해서 크기를 줄여둡니다.
