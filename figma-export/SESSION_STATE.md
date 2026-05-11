# Figma Export — 세션 상태 (2026-05-11)

## 현재 결과
- **Figma 파일**: https://www.figma.com/design/tcQBs58m4vjO0nwdJq7LW6
- **파일 이름**: 오집사 챗봇 Mockup v6
- **위치**: Bucketplace 조직 (planKey: `organization::1182502163736611081`)
- **총 191장 캡쳐 + 업로드 완료**

## 페이지 구조 (20개)
| 페이지 ID | 페이지 이름 | 구성 |
|---|---|---|
| 0:1 | 🏠 M-mockup 갤러리 | 메인 16 / 엣지 4 / Phase 3 16 (3 Sections) |
| 1:2 | 🎮 인터랙티브 데모 (M00) | S1~S14 순서 정렬, 이름 정리 완료 |
| 1:3 | 🎬 #1 배송 조회 | 정상 12 / 예외 2 |
| 1:4 | 🎬 #2 반품 접수 | 정상 14 / 예외 4 |
| 1:5 | 🎬 #3 주문 취소 | 정상 10 / 예외 3 |
| 1:6 | 🎬 #4 교환 접수 | 정상 8 / 예외 3 |
| 1:7 | 🎬 #5 배송지 변경 | 정상 6 / 예외 2 |
| 1:8 | 🎬 #6 배송일 변경 | 정상 4 / 예외 2 |
| 1:9 | 🎬 #7 포인트 | 정상 6 |
| 1:10 | 🎬 #8 쿠폰 | 정상 4 |
| 1:11 | 🎬 #9 배송지연 | 정상 6 / 예외 2 |
| 1:12 | 🎬 #10 배송분실 | 정상 5 / 예외 2 |
| 1:13 | 🎬 #11 포장/파손 | 정상 5 / 예외 3 |
| 1:14 | 🎬 #12 주문 정보 통합 | 정상 4 |
| 1:15 | 🎬 #13 AS | 정상 4 |
| 1:16 | 🎬 #14 회원 진입 | 정상 5 / 예외 1 |
| 1:17 | 🎬 #15 배송 기타 이슈 | 정상 7 |
| 1:18 | 🎬 #16 엣지 케이스 | 정상 6 |
| 1:19 | 🎬 #17 영수증/증빙 | 정상 6 |
| 1:20 | 🎬 #18 상품 문의 | 정상 5 |

## 워크플로 (재현 방법)
1. **HTML 수정** → `/Users/yb.joo/Documents/Ohouse-chatbot/chatbot-mockups.html`
2. **재캡쳐**: `cd figma-export && node capture.js` (Playwright 필요)
   - 결과: `figma-export/captures/*.png` (191장) + `manifest.json`
3. **Figma 업로드**: MCP `upload_assets` (5장씩 배치) + curl POST
4. **재배치**: MCP `use_figma` 플러그인 API로 페이지/Section/grid 정리

## 다음에 이어서 할 후보
1. **시나리오를 Part A/B/C/D/E로 더 세분화** — HTML의 scenario-part 구조와 1:1 매칭
2. **Section 색상 지정** — 카테고리별 컬러 (메인=초록, 엣지=노랑, Phase 3=빨강 등)
3. **Connector 라인** — 단계 간 화살표 (FigJam 또는 별도 흐름 다이어그램)
4. **커버 페이지 추가** — 첫 페이지에 인덱스/범례
5. **HTML mockup 추가 수정** → 재캡쳐 + Figma 재동기화

## 주의사항 / 학습한 것
- `upload_assets`로 업로드 시 **`scaleMode=FILL` + 프레임 기본 사이즈**가 다르면 이미지가 짤림. 업로드 후 `use_figma`로 **이미지 원본 비율(width/2, height/2 — deviceScaleFactor=2)로 리사이즈** 필수.
- `use_figma`에서 다른 페이지에 접근하려면 **`await page.loadAsync()`** 필수. 안 하면 children 빈 배열로 보임.
- `setCurrentPageAsync()` + `upload_assets`를 같은 메시지의 parallel 호출로 보내면 **page 전환과 업로드가 race condition** → 다른 페이지에 frame 생성됨. 페이지 전환은 별도 메시지로.
- `upload_assets`의 응답으로 받는 `placedOnNodeId`를 **각 파일에 매핑해서 추적**해야 사후 재배치 가능 (개별 POST 응답을 `/tmp/u_${i}.txt`로 저장 후 파싱).
- 코드의 명시적 `return` 문이 있어야 `use_figma`가 결과 반환. 단순 expression은 "no return value"로 표시됨.

## 파일/리소스
- HTML 소스: `/Users/yb.joo/Documents/Ohouse-chatbot/chatbot-mockups.html`
- 라이브: https://enzojoo.github.io/Ohouse-chatbot/
- 캡쳐 스크립트: `figma-export/capture.js`
- 매니페스트: `figma-export/manifest.json` (191 entries)
- 캡쳐 PNG: `figma-export/captures/000~190_*.png` (8.8MB)
- Figma 파일 key: `tcQBs58m4vjO0nwdJq7LW6`
