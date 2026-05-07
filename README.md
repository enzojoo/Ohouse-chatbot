# 오집사 챗봇 내재화 — Mobile/Web Mockups

오늘의집 AI 챗봇(오집사) 내재화 Phase 4를 위한 인웹 위젯 mockup.
OHOUSE-DESIGN.md v0.4.2 토큰 + ICONS.md sprite 적용. 22개 화면 + 라이브 데모.

## 🔗 데모 URL

**[https://enzojoo.github.io/Ohouse-chatbot/](https://enzojoo.github.io/Ohouse-chatbot/)**

> GitHub Pages 활성화 후 위 URL에서 바로 확인 가능 (활성화 방법은 아래 참조).

## 구성

- **M00 인웹 진입** — 오늘의집 웹 메인 + 우하단 챗봇 위젯 (라이브 데모 활성)
- **M00b Launcher** — 닫힌 상태 + 알림 뱃지 variant
- **M01~M16 시퀀스** — 시작 / 첫인사 / 인증 / 로그인 / KMS / 주문 조회 / 배송 / 반품 / 클레임 상태 / 교환 / 취소 / 환불 내역 / 쿠폰 / 포인트 / 상담사 연결 / 문의내역
- **M17~M21 엣지** — 영업외 / 무응답 종료 / Critical 키워드 / 클레임 거절 / 모바일 풀스크린

## 라이브 데모 동작

메인 hero의 챗봇 위젯에서 모든 chip/카드/버튼 클릭 가능.
- 새 상담 → 첫 인사 → 빠른 메뉴(5종)
- 인증 모달 → 로그인 시뮬레이션 → 시나리오 분기
- 주문 카드 탭 → 의도에 따라 배송/반품
- 4단계 반품 폼 → 환불 확인 → 종료/NPS

> **주의** LLM 응답·실제 API는 미연동. UI 분기 시연용. AICX SDK 연동은 별도 작업.

## 다크 모드

우상단 토글 버튼으로 light ↔ dark 즉시 전환. OHOUSE 다크 토큰 자동 매핑, shadow → 1px border 변경.

## 파일

- `index.html` — GitHub Pages 진입점 (= chatbot-mockups.html)
- `chatbot-mockups.html` — 동일 파일 (작업 원본)

## 다음 단계

1. **Open Issue 13건 의사결정** (호칭 O1, 운영시간 O2, 비로그인 처리 O4, 비회원 인증 O13 등)
2. **디자이너 핸드오프** — Figma ODS 컴포넌트로 옮기기 (이 HTML이 spec 문서)
3. **AICX/ENG 연동** — SDK 임베드 + LLM/API 결합 (Phase 4 본 작업)

## 관련 문서

- 노션 마스터 문서: https://www.notion.so/ohouse/359a597878a081089821f1805520ba3b
- AI 챗봇 로드맵: https://www.notion.so/ohouse/2eaa597878a0805c9eb5e7c7246f4668
- Phase 1 Timeline: https://www.notion.so/ohouse/32ba597878a08180ad75d724489a92b8
