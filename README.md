# CA NERP Mobile

CA NERP 웹 ERP 시스템의 모바일 견적 프로그램. Vue3 + Vite 기반.

## 기술 스택

- **Frontend**: Vue 3.5 + Vite 5 + Vue Router 4 + Pinia 2
- **HTTP**: Axios (JWT Bearer 인증)
- **Backend**: CA_NERP2 Spring Boot (Oracle DB) — 모바일 전용 컨트롤러/서비스 레이어

## 프로젝트 구조

```
src/
├── main.js                    # 앱 진입점
├── App.vue                    # 레이아웃 (헤더/탭바/섹션탭)
├── styles.css                 # 모바일 전용 CSS
├── router/index.js            # 라우터 + 인증 가드
├── stores/auth.js             # Pinia 인증 스토어 (JWT + 유저정보 + bzpc)
├── api/
│   ├── index.js               # Axios 인스턴스 (프록시 + 401 핸들링)
│   ├── auth.js                # /mobile/auth/login, verify
│   ├── estimate.js            # 견적 헤더/샤시/모형/색상/유리/코드 API
│   ├── bzpc.js                # 영업소 선택 API
│   └── client.js              # 거래처 조회/등록 API
├── components/
│   ├── BzpcSelector.vue       # 영업소 선택 (ADMIN=모달, USER=고정)
│   ├── DplcSearchModal.vue    # 거래처 검색 모달
│   └── ModelSearchModal.vue   # 모형 검색 모달 (필터+도면+텍스트 뷰)
└── views/
    ├── Login.vue              # 로그인
    ├── EstimateList.vue       # 견적 목록 (영업소별, 날짜 필터)
    ├── EstimateNew.vue        # 견적 헤더 신규 작성
    ├── EstimateDetail.vue     # 견적 상세 (헤더정보 + 샤시목록 + 추가버튼)
    ├── SashNew.vue            # 샤시 견적 작성/편집
    ├── ClientList.vue         # 거래처 목록
    └── ClientNew.vue          # 거래처 등록
```

## 주요 기능

### 로그인
- `POST /mobile/auth/login` (JWT)
- 토큰 + 유저정보(bzpc, vkgrp, role) localStorage 영속
- ADMIN/USER 권한 분기

### 영업소(bzpc) 권한 처리
- **USER**: 본인 bzpc 자동 고정
- **ADMIN**: 바텀시트 모달로 영업소 검색·선택 (`/BzpcMng/searchBzpcChoiceAjax`)
- 견적 헤더 저장/조회 시 searchBzpc 자동 적용

### 견적 헤더
- 신규: 거래처 검색 → 자동 채움(담당자/주소/할인등급/가율 8종) → 저장
- 저장 후 자동으로 상세 화면(`/estimates/:itgEstiNo`)으로 이동
- 목록: 영업소+날짜 필터, 카드 클릭→상세

### 샤시 견적
- **견적 상세**에서 `+ 샤시` 버튼 → wEstiNo 자동 발번(issueEstiNo, idempotent) → SashNew 이동
- **복합키**: `(itgEstiNo, estiNo, estiNos, estiSeq)` — estiSeq는 `selectNextEstiSeq` 매퍼로 정확한 MAX+1 채번
- **모형 검색**: 자재회사(버튼)/이중창(버튼)/카테고리(버튼)/키워드 필터 + 도면/텍스트 뷰 전환
- **자동 채움**: 모형 선택 시 → 창형태(모형별 제한) → SF내/외 → VENT → 스크린 → 핸들 → 유리(SF/BF) → 색상(내/외 동기화) 자동 선택
- **W1~W5/H1~H5/CS~CS5**: 창형태 코드의 `addInfo1/2/3`(cntW/cntH/cntCS)에 따라 동적 노출
- **상세옵션 토글**: VENT/스크린/안전망, 핸들(종류+높이ON/OFF), 유리(모형별 조건부), 실리콘마감
- **편집 모드**: 목록에서 클릭 → selectSashDetail(reflection Map) → 기존 데이터 자동 로드
- **프로시저**: STEP1(틀짝망/자재 셋업) → STEP2(수량/금액 계산) — 백엔드 `fillSashDefaults`가 ~150개 옵션 안전 디폴트 채움

### 견적 상세 표시
- 품명 스펙: `BF225R/SF115G/MF115D/5투/5투/스텐방충망/2W_정` (기존 매퍼 활용)
- 색상: `백+백` (매퍼 조립)
- 규격: `2000×1000`
- 가격: 공급가/VAT/합계
- estiSeq 단위 dedupe (매퍼가 자재별 다중행 반환하므로)

## 백엔드 모바일 전용 엔드포인트

| 엔드포인트 | 설명 |
|---|---|
| `POST /mobile/auth/login` | 로그인 (JWT) |
| `POST /mobile/auth/verify` | 토큰 검증 |
| `POST /mobile/esti/header/save` | 견적 헤더 저장 |
| `POST /mobile/esti/header/list` | 견적 헤더 목록 |
| `POST /mobile/esti/header/detail` | 견적 헤더 단건 (wEstiNo reflection) |
| `POST /mobile/esti/header/issueEstiNo` | 견적번호 발번 (idempotent) |
| `POST /mobile/esti/sash/save` | 샤시 견적 저장 |
| `POST /mobile/esti/sash/list` | 샤시 견적 목록 (searchEstiAjax 재사용) |
| `POST /mobile/esti/sash/detail` | 샤시 견적 단건 (reflection Map) |
| `POST /mobile/esti/model/list` | 모형 검색 |
| `POST /mobile/esti/model/wintydi` | 모형별 창형태 코드 |
| `POST /mobile/esti/model/sf` | 모형별 SF 자재 |
| `POST /mobile/esti/model/combo` | 모형 검색 콤보 데이터 |
| `POST /mobile/esti/glas/list` | 모형별 유리 자재 |
| `POST /mobile/esti/code/list` | 공통코드 조회 |
| `POST /mobile/esti/color/list` | 색상 코드 조회 |
| `POST /mobile/dplc/list` | 거래처 목록 |
| `POST /mobile/dplc/save` | 거래처 등록 |

## 해결한 주요 이슈

### Lombok-Jackson 직렬화
- `wEstiNo` / `wSize` / `hSize` 등 Java 필드 → Lombok `getWSize()` → Jackson `"WSize"` 키 변형
- **해결**: `selectEstiHeader`는 reflection 으로 wEstiNo 직접 읽기, `selectSashDetail`은 reflection Map 전체 변환

### Oracle JDBC NULL 처리
- MyBatis `#{field}` 에 Java null 전달 시 `setNull(jdbcType=OTHER)` → `ORA-17004`
- **해결**: 매퍼 호출 전 빈 문자열 또는 적절한 디폴트 세팅

### CORS 프록시
- Vite dev 서버 → 백엔드 CORS `allowedOrigins`에 5180 없음 → 403
- **해결**: Vite proxy 에서 Origin 헤더를 `http://localhost:4830` (웹 프론트)으로 재작성

### 프로시저 파라미터 차이
- 모바일이 웹보다 옵션이 적어 STEP1/STEP2 프로시저에 NULL/빈값 다수
- **해결**: `fillSashDefaults` 메서드가 ~150개 안전 디폴트 채움 + drwgCd 자동 조회 + 유리두께 자동 조회 + drnHoleYn='Y' 디폴트

### estiSeq 채번
- 모바일이 잘못된 매퍼(searchWindEstiAmt) 사용 → 0건 반환 → 항상 1
- **해결**: 웹과 동일하게 `selectNextEstiSeq(WindEstiH)` 매퍼 사용 (MAX+1 정확 채번)

## 실행 방법

```bash
# Windows PowerShell (백엔드가 localhost:2026 인 경우)
cd C:\Projects\CA_NERP\workspace\CA_NERP_MOBILE_TWO
npm install
npm run dev
# → http://localhost:5180/
```

### 환경 설정 (.env)
```
VITE_BACKEND_ORIGIN=http://localhost:2026
VITE_API_BASE=/api
```

Vite 프록시가 `/api/*` → 백엔드, `/data/*` → 도면 이미지 경로를 자동 프록시합니다.

## 향후 작업

- [ ] 도어/유리/몰딩 견적 추가 (EstimateDetail 의 `+ 도어` 등 버튼 활성화)
- [ ] BF/SF/MF 상세 옵션 카드 추가 (직송/배수홀/통기홀/락/래핑/밀링 등)
- [ ] 거래처 등록 폼 상세화 (사업자번호/대표자/주소/연락처)
- [ ] 회계증빙서류/영세율/선입금 (견적 헤더 2차 필드)
- [ ] 영업사원 배분 (1/2/3 + 비율)
- [ ] 견적 상태 변경 (장바구니→주문)
- [ ] 권한별 자재회사 필터 (addInfo4~9 auth store 연동)
- [ ] 디버그 패널 제거 (SashNew 노란 카드)
