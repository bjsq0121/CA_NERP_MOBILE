# Mobile Sash Save Parity Handoff

작성일: 2026-05-28

## 현재 상태

- 모바일 sash 저장 parity 작업은 `master`에 로컬 병합 완료.
- 임시 worktree `.worktrees/mobile-sash-save-parity` 제거 완료.
- feature branch `mobile-sash-save-parity` 삭제 완료.
- 현재 `master` HEAD: `c84f59e fix: compare sash alias value sets`

## 반영된 내용

- 편집 모드에서 모델 데이터를 다시 불러올 때 기존 입력값 보존.
  - 대상: 세부 치수, CS, 유리 자재, 환기 위치, 방충망, 내/외부 SF, 색상, 제작 단위, 주문 유형.
  - 관련 파일:
    - `src/views/SashNew.vue`
    - `src/utils/sashEditPreserve.js`
    - `src/utils/sashEditPreserve.test.js`

- 모바일 저장 payload를 웹 `SashForm` 저장 결과에 더 가깝게 보정.
  - 추가 고정값: `ctgrCd`, `windLocCd`, `rt`, `glasDblYn`, `unpAplScn`, `m2Unp`
  - 추가 alias: `wSize`, `hSize`, `insdSfGlasMtrlCd`, `ousdSfGlasMtrlCd`, `insdBfGlasMtrlCd`, `ousdBfGlasMtrlCd`
  - 관련 파일:
    - `src/utils/sashPayload.js`
    - `src/utils/sashPayload.test.js`

- 웹/모바일 저장 결과 비교용 로컬 스크립트 추가.
  - 실행: `npm run compare:sash -- web.json mobile.json`
  - alias 혼재 케이스도 비교 가능하도록 보정.
  - 관련 파일:
    - `scripts/compare-sash-save-parity.mjs`
    - `scripts/compare-sash-save-parity.test.mjs`

- 첫 parity gap 문서 추가.
  - `docs/analysis/2026-05-27-mobile-sash-parity-gaps.md`

## 검증 결과

병합 후 `master`에서 직접 확인함.

```bash
npm test
```

- 결과: 통과
- 테스트: 6/6 pass

```bash
npm run build
```

- 결과: 통과
- Vite production build 완료

## 현재 작업트리 주의사항

아래 항목은 이번 sash parity 병합 전부터 남아 있던 기존 사용자 변경으로 보임. 건드리지 않았음.

```text
 M vite.config.js
?? .codex
?? deploy/
?? docs/analysis/2026-05-04-mobile-sash-validation.md
?? docs/superpowers/plans/2026-05-04-sash-validation-hardening.md
```

이 파일 자체도 새로 추가한 handoff 문서라서 아직 commit되지 않은 상태일 수 있음.

## 다음에 할 일

1. 실제 ERP 데이터로 웹 저장 결과와 모바일 저장 결과를 각각 캡처한다.
2. 아래 명령으로 결과를 비교한다.

```bash
npm run compare:sash -- web.json mobile.json
```

3. 비교 결과 mismatch가 남으면 `docs/analysis/2026-05-27-mobile-sash-parity-gaps.md`에 추가하고 payload 또는 편집 복원 로직을 보정한다.
4. 실측 비교까지 끝나기 전에는 "웹과 100% 동일"이라고 확정하지 않는다. 현재는 웹 저장 구조에 맞춘 1차 보정과 로컬 검증 완료 상태다.

## 2026-05-29 추가 메모: 현재 앱 상태와 PWA 전환

현재 프로젝트는 모바일 화면용 Vue/Vite 웹앱에 가깝다. 아직 PWA 또는 Capacitor 앱으로 구성된 상태는 아니다.

확인 내용:

- `package.json`에 `vite-plugin-pwa`, `workbox`, `@capacitor/*` 의존성이 없음.
- `capacitor.config.*` 파일 없음.
- service worker 등록 코드 없음.
- manifest 설정 없음.
- 현재는 Vue/Vite SPA를 모바일 UI로 만든 구조.

구분:

- 모바일화된 웹앱: 현재 상태. 모바일 화면에 맞춘 웹앱.
- PWA: 웹앱에 manifest, service worker, HTTPS 배포, 아이콘, 캐싱 정책을 추가해서 브라우저에서 설치 가능하게 만든 형태.
- Capacitor 앱: 웹앱을 Android/iOS 네이티브 앱 껍데기로 감싼 형태. APK/AAB/IPA 배포나 네이티브 기기 기능 연동이 필요할 때 사용.

Capacitor가 없어도 PWA라고 할 수 있다. 반대로 Capacitor로 감싼다고 해서 자동으로 PWA가 되는 것은 아니며, 하이브리드 네이티브 앱에 더 가깝다.

PWA로 가기 위한 작업:

1. `vite-plugin-pwa` 설치.
2. 앱 manifest 추가.
   - 앱 이름
   - short name
   - `start_url`
   - `display: "standalone"`
   - `theme_color`
   - `background_color`
   - 192x192, 512x512 아이콘
   - 가능하면 maskable icon
3. service worker 추가.
   - 앱 shell, JS/CSS, 아이콘 캐싱.
   - API는 우선 네트워크 요청 유지.
   - 네트워크 실패 시 명확한 오류 표시.
4. HTTPS 환경에 배포.
   - service worker와 설치 조건 때문에 운영은 HTTPS 필요.
   - `localhost`는 개발용 예외.
5. 운영 환경에서 `/api`와 `/data/**` 접근 경로 정리.
   - 현재 `vite.config.js`의 `/api` proxy와 `/data` 이미지 서빙은 개발 서버용 동작.
   - PWA 배포 시 운영 서버나 리버스 프록시에서 동일 경로를 제공해야 함.
6. 로그인 세션/쿠키가 standalone 모드에서도 정상 동작하는지 확인.
7. 캐싱으로 오래된 JS/화면이 남지 않도록 update 전략 확인.
8. Android 홈 화면 설치 테스트 및 Chrome DevTools Application/Lighthouse PWA 조건 확인.

PWA 작업 시 예상 변경 파일:

```text
package.json
vite.config.js
index.html
public/manifest.webmanifest
public/icons/icon-192.png
public/icons/icon-512.png
src/main.js 또는 PWA 등록 관련 설정
```

현실적인 1차 PWA 목표:

- 앱 UI 리소스는 캐싱.
- ERP API는 항상 네트워크 요청.
- 완전 오프라인 견적 작성은 별도 설계로 미룸.
- 홈 화면 설치와 모바일 브라우저/standalone 실행 안정성부터 확인.
