# 모바일 샤시 저장 결과 웹 조회 수동 검증 절차

목적: `CA_NERP_MOBILE_TWO`에서 신규/수정 저장한 샤시 견적이 `CA_NERP2` 웹 견적 화면에서 같은 `itgEstiNo` 기준으로 정상 조회되는지 확인한다.

기준:

- 모바일: `CA_NERP_MOBILE_TWO`
- 웹: `CA_NERP2/vue`
- 백엔드: `CA_NERP2`
- 웹 샤시 기준 파일: `SashForm.vue`
- `SashForm2.vue`는 사용하지 않는다.

## 1. 백엔드 실행 방법

백엔드는 `CA_NERP2` Spring Boot 애플리케이션을 실행한다. 모바일 Vite 기본 설정은 백엔드를 `http://localhost:2026`으로 프록시한다.

```bash
cd /mnt/c/Projects/CA_NERP/workspace/CA_NERP2
./gradlew bootRun
```

Windows에서 실행하는 경우:

```powershell
cd C:\Projects\CA_NERP\workspace\CA_NERP2
.\gradlew.bat bootRun
```

확인:

- 백엔드가 `localhost:2026`에서 응답하는지 확인한다.
- 다른 포트로 실행하는 경우 모바일 `.env`의 `VITE_BACKEND_ORIGIN`을 실제 백엔드 주소로 맞춘다.
- 로그 디렉터리: `CA_NERP2/logs`

## 2. 모바일 Vite 실행 방법

```bash
cd /mnt/c/Projects/CA_NERP/workspace/CA_NERP_MOBILE_TWO
npm install
npm run dev
```

기본 접속:

```text
http://localhost:5180/
```

관련 설정:

- `.env`: `VITE_BACKEND_ORIGIN=http://localhost:2026`
- `vite.config.js`: `/api/*`를 백엔드로 프록시하고 `/data/*`는 도면 이미지 경로로 제공한다.
- Vite 프록시는 백엔드 CORS 회피를 위해 `Origin`/`Referer`를 `http://localhost:4830`으로 보낸다.

## 3. 웹 Vue 실행 방법

```bash
cd /mnt/c/Projects/CA_NERP/workspace/CA_NERP2/vue
npm install
npm run dev
```

기본 접속:

```text
http://localhost:4831/
```

`VUE_APP_PORT`가 지정되어 있으면 해당 포트를 사용한다.

## 4. 모바일에서 견적 헤더 생성하는 절차

1. 모바일 앱 `http://localhost:5180/`에 로그인한다.
2. 관리자 계정이면 필요한 영업소를 선택한다.
3. 견적 목록 화면에서 신규 견적 작성을 선택한다.
4. 거래처를 검색해 선택한다.
5. 현장명, 납기/비고 등 필수 헤더 정보를 입력한다.
6. 견적 헤더를 저장한다.
7. 저장 후 견적 상세 화면으로 이동되는지 확인한다.
8. 화면 또는 URL에서 `itgEstiNo`를 기록한다.

기록할 값:

```text
itgEstiNo:
거래처:
현장명:
작성자/영업소:
```

## 5. 모바일에서 샤시 견적 생성하는 절차

1. 모바일 견적 상세 화면에서 `+ 샤시` 또는 샤시 추가 버튼을 누른다.
2. `wEstiNo`가 없으면 `/mobile/esti/header/issueEstiNo`가 호출되어 샤시 견적번호가 발번된다.
3. 샤시 작성 화면에서 모형을 선택한다.
4. 창형태, 틀짝망, 발주구분, W/H, 수량을 확인한다.
5. 색상, VENT, 스크린, SF/BF 유리를 확인한다.
6. 필요 시 핸들, 브래킷, 안전망, 알유리, 생산옵션을 입력한다.
7. `저장`을 눌러 견적 상세로 돌아가거나, `견적추가`를 눌러 저장 후 같은 샤시를 다시 연다.
8. 저장 성공 후 목록 카드에 신규 `estiSeq`가 표시되는지 확인한다.

저장 시 확인할 API:

- `POST /mobile/esti/sash/save`
- 백엔드 내부 STEP1: `saveItgEstiProcCall`
- 백엔드 내부 STEP2: `saveItgEstiProcCall2`
- 금액 조회: `POST /ItgEstiOne/searchWindEstiAmt`

기록할 값:

```text
itgEstiNo:
wEstiNo / estiNo:
estiNos:
estiSeq:
모형:
창형태:
틀짝망:
W x H:
수량:
```

## 6. 모바일에서 다시 열어 수정하는 절차

1. 모바일 견적 상세 화면으로 돌아간다.
2. 방금 저장한 샤시 카드의 `estiSeq`를 확인한다.
3. 샤시 카드를 눌러 상세 수정 화면으로 진입한다.
4. 화면 상단/하단의 견적순번이 기존 `estiSeq`와 같은지 확인한다.
5. `selectSashDetail` 결과로 기존 값이 복원되는지 확인한다.
6. 수정할 항목을 하나 이상 변경한다.
   - 예: 수량, 색상, VENT, 스크린, 생산옵션 중 하나
7. `저장`을 누른다.
8. 모바일 견적 상세 목록으로 돌아와 같은 `estiSeq` 행이 갱신되었는지 확인한다.

주의:

- 수정 저장은 기존 `estiSeq`를 payload에 유지해야 한다.
- `견적추가`는 의도적으로 새 `estiSeq`를 생성하는 흐름이다. 수정 검증 시에는 `저장` 버튼을 사용한다.

## 7. 웹 CA_NERP2에서 같은 itgEstiNo로 조회하는 절차

1. 웹 `CA_NERP2/vue`에 로그인한다.
2. 통합견적/견적관리 화면으로 이동한다.
3. 모바일에서 기록한 `itgEstiNo`로 조회한다.
4. 견적 헤더가 모바일에서 저장한 거래처/현장명으로 표시되는지 확인한다.
5. 샤시 견적 목록 또는 견적 상세 그리드에서 같은 `estiNo`, `estiNos`, `estiSeq` 행을 찾는다.
6. 해당 행을 열어 웹 샤시 폼 기준 상세값을 확인한다.
7. 모바일에서 수정 저장한 항목이 웹 조회 결과에 반영되었는지 비교한다.

웹에서 조회되지 않으면 먼저 확인할 것:

- 모바일과 웹이 같은 DB/백엔드를 바라보는지
- `itgEstiNo`, `estiNo`, `estiNos`, `estiSeq`가 정확한지
- 저장 API 응답이 `save.ok`였는지
- 백엔드 STEP1/STEP2 프로시저 오류가 없었는지

## 8. 비교해야 할 항목

아래 항목은 모바일 저장 직후 화면, 모바일 재조회 화면, 웹 CA_NERP2 조회 화면을 나란히 비교한다.

| 항목 | 모바일 저장/수정 화면 | 모바일 목록/재조회 | 웹 CA_NERP2 조회 | 판정 |
|---|---|---|---|---|
| 품명 | 모형명/모형코드 | 샤시 카드 품명 | 웹 견적 품명 | 일치/불일치 |
| 규격 | W x H, 분할치수 | 샤시 카드 규격 | 웹 규격 | 일치/불일치 |
| 수량 | `qty` | 목록 수량 | 웹 수량 | 일치/불일치 |
| 색상 | 내부/외부 색상 | 목록 색상 | 웹 색상 | 일치/불일치 |
| VENT | `ventLoc` | 목록 VENT | 웹 VENT | 일치/불일치 |
| 스크린 | `screenType` | 목록 스크린 | 웹 스크린 | 일치/불일치 |
| 유리 | SF/BF 내외 유리 | 상세 재조회 유리 | 웹 유리 | 일치/불일치 |
| 핸들 | 내/외 핸들, 높이 | 목록 핸들 | 웹 핸들 | 일치/불일치 |
| 생산옵션 | BF/SF/MF 옵션 | 상세 재조회 옵션 | 웹 생산옵션/비고 | 일치/불일치 |
| 공급가 | 금액 요약 공급가 | 목록 공급가 | 웹 공급가 | 일치/불일치 |
| VAT | 금액 요약 VAT | 목록 VAT | 웹 VAT | 일치/불일치 |
| 합계 | 금액 요약 총금액 | 목록 합계 | 웹 합계 | 일치/불일치 |

금액 비교 기준:

- 모바일 상세 하단 금액은 `/ItgEstiOne/searchWindEstiAmt` 결과다.
- 웹도 같은 견적순번 기준 금액을 조회해야 한다.
- 반올림/표시 포맷 차이가 있으면 원천 숫자 기준으로 비교한다.

## 8-1. MEDIUM 옵션 12개 전용 검증 시나리오

이 시나리오는 모바일 MEDIUM 옵션 12개가 신규 저장, 상세 재조회, 수정 저장, 웹 조회, 웹 재저장 이후에도 유지되는지 확인한다.

검증 대상 필드:

| 필드 | 모바일 입력 위치 | 웹 SashForm 기준 위치 | 저장값 예시 | 미선택 기본값 |
|---|---|---|---|---|
| `glasAttachYn` | 유리 자재 > 유리부착 | 유리부착 | `Y` | `N` |
| `basedfillingPiecesYn` | 생산옵션 > BF 기본 > 기존 휠링피스 | BF 기본 옵션 | `Y` | `N` |
| `sfArmatureType` | 생산옵션 > SF > SF 보강재 | SF 보강재 | `F` | 빈값 |
| `mfArmatureType` | 생산옵션 > MF > MF 보강재 | MF 보강재 | `F` | 빈값 |
| `bfVentHoleLctn` | 생산옵션 > BF 터닝도어/케이스먼트 > 경첩타공위치 | 터닝 제작 경첩타공위치 | `820` | 빈값 |
| `bfWinCbMilingType` | 생산옵션 > BF 아파트 > 통바밀링 | BF 아파트 통바밀링 | `2` | 빈값 |
| `sfInsideRightBrdYn` | 생산옵션 > SF > 내부우측매립 | SF 옵션 | `Y` | `N` |
| `sfMcOneReqYn` | 생산옵션 > SF > MC1개요청 | SF 옵션 | `Y` | `N` |
| `sfBrdProcYn` | 생산옵션 > SF > 매립가공 | SF 옵션 | `Y` | `N` |
| `sfHandleProcYn` | 생산옵션 > SF > 핸들가공 | SF 옵션 | `Y` | `N` |
| `sfAptArmatureType` | 생산옵션 > SF > SF 아파트 보강재 | SF 아파트 보강재 | `F` | 빈값 |
| `sfAptHandleType` | 생산옵션 > SF > SF 아파트 핸들 | SF 아파트 핸들 | `3` | 빈값 |

### A. 신규 저장 payload 확인

1. 브라우저 개발자도구 Network 탭을 연다.
2. 모바일에서 신규 견적 헤더와 샤시를 생성한다.
3. 샤시 저장 전 위 12개 필드를 모두 예시값으로 입력한다.
4. `POST /mobile/esti/sash/save` 요청 payload를 확인한다.
5. 아래 필드가 모두 포함되는지 체크한다.

| 필드 | 기대값 | payload 확인 |
|---|---:|---|
| `glasAttachYn` | `Y` | OK/NG |
| `basedfillingPiecesYn` | `Y` | OK/NG |
| `sfArmatureType` | `F` | OK/NG |
| `mfArmatureType` | `F` | OK/NG |
| `bfVentHoleLctn` | `820` | OK/NG |
| `bfWinCbMilingType` | `2` | OK/NG |
| `sfInsideRightBrdYn` | `Y` | OK/NG |
| `sfMcOneReqYn` | `Y` | OK/NG |
| `sfBrdProcYn` | `Y` | OK/NG |
| `sfHandleProcYn` | `Y` | OK/NG |
| `sfAptArmatureType` | `F` | OK/NG |
| `sfAptHandleType` | `3` | OK/NG |

미선택 기본값 검증도 별도 1건 수행한다. 같은 필드를 모두 미선택/빈값으로 저장했을 때 `Yn` 계열은 `N`, 선택값 계열은 빈값으로 payload에 포함되어야 한다.

### B. 모바일 상세 재조회 복원 확인

1. 저장 성공 후 견적 상세 목록으로 돌아간다.
2. 방금 저장한 샤시의 `estiSeq`를 기록한다.
3. 같은 샤시를 다시 연다.
4. `POST /mobile/esti/sash/detail` 응답에 12개 필드가 포함되는지 확인한다.
5. 모바일 화면의 각 입력값이 저장값과 같은지 확인한다.

| 필드 | 상세 응답 기대값 | 모바일 화면 복원 |
|---|---:|---|
| `glasAttachYn` | `Y` | OK/NG |
| `basedfillingPiecesYn` | `Y` | OK/NG |
| `sfArmatureType` | `F` | OK/NG |
| `mfArmatureType` | `F` | OK/NG |
| `bfVentHoleLctn` | `820` | OK/NG |
| `bfWinCbMilingType` | `2` | OK/NG |
| `sfInsideRightBrdYn` | `Y` | OK/NG |
| `sfMcOneReqYn` | `Y` | OK/NG |
| `sfBrdProcYn` | `Y` | OK/NG |
| `sfHandleProcYn` | `Y` | OK/NG |
| `sfAptArmatureType` | `F` | OK/NG |
| `sfAptHandleType` | `3` | OK/NG |

### C. 수정 저장 유지 확인

1. 모바일 상세 재조회 화면에서 MEDIUM 옵션은 그대로 둔다.
2. 수량 또는 비고처럼 unrelated 필드 1개만 수정한다.
3. `저장` 버튼을 누른다. `견적추가` 버튼을 사용하지 않는다.
4. `POST /mobile/esti/sash/save` payload의 `estiSeq`가 기존 값과 같은지 확인한다.
5. 같은 payload에 12개 MEDIUM 필드가 기존 저장값으로 유지되어 들어가는지 확인한다.
6. 저장 후 다시 열어 12개 값이 유지되는지 확인한다.

### D. 웹 CA_NERP2 조회 확인

1. 웹 CA_NERP2에서 같은 `itgEstiNo`로 견적을 조회한다.
2. 같은 `estiNo`, `estiNos`, `estiSeq` 샤시 행을 연다.
3. 웹 `SashForm.vue` 기준 화면에서 아래 항목을 확인한다.

| 필드 | 웹 확인 방법 | 판정 |
|---|---|---|
| `glasAttachYn` | 유리부착 체크 상태 | OK/NG/확인불가 |
| `basedfillingPiecesYn` | BF 기본/휠링피스 관련 옵션 또는 조회 API 원천값 | OK/NG/확인불가 |
| `sfArmatureType` | SF 보강재 선택값 | OK/NG/확인불가 |
| `mfArmatureType` | MF 보강재 선택값 | OK/NG/확인불가 |
| `bfVentHoleLctn` | 경첩타공위치 입력값 | OK/NG/확인불가 |
| `bfWinCbMilingType` | 통바밀링 선택값 | OK/NG/확인불가 |
| `sfInsideRightBrdYn` | SF 옵션 내부우측매립 | OK/NG/확인불가 |
| `sfMcOneReqYn` | SF 옵션 MC1개요청 | OK/NG/확인불가 |
| `sfBrdProcYn` | SF 옵션 매립가공 | OK/NG/확인불가 |
| `sfHandleProcYn` | SF 옵션 핸들가공 | OK/NG/확인불가 |
| `sfAptArmatureType` | SF 아파트 보강재 | OK/NG/확인불가 |
| `sfAptHandleType` | SF 아파트 핸들 | OK/NG/확인불가 |

웹 화면에서 특정 필드가 모형/창형태 조건 때문에 노출되지 않으면 `확인불가`로 기록하고, 웹 조회 API 응답 또는 백엔드 로그의 원천 필드로 대체 확인한다.

### E. 웹 재저장 후 모바일 값 유지 확인

1. 웹에서 같은 샤시 상세를 연다.
2. MEDIUM 12개 필드를 의도적으로 변경하지 않고 저장한다.
3. 웹 저장 API `POST /ItgEstiOne/saveCmplWinEsti` payload에 12개 필드가 어떤 값으로 전송되는지 기록한다.
4. 모바일에서 같은 `estiSeq`를 다시 열어 12개 값이 유지되는지 확인한다.
5. 웹 저장 payload에서 특정 필드가 빠지거나 기본값으로 덮이면 이상 필드로 기록한다.

### F. 결과 기록 양식

```text
검증일:
검증자:
환경:
  백엔드:
  모바일:
  웹:

itgEstiNo:
estiNo:
estiNos:
estiSeq:

신규 저장 payload 12개 필드 포함 여부:
모바일 상세 재조회 복원 여부:
수정 저장 후 유지 여부:
웹 CA_NERP2 조회 여부:
웹 재저장 후 모바일 유지 여부:

정상 필드:

이상 필드:

웹 화면에서 확인 불가한 필드:

후속 조치 필요 항목:
```

### G. 실제 검증 시도 결과 - 2026-06-01

이번 기록은 유효한 모바일 로그인 계정으로 실제 모바일 신규 저장, 모바일 상세 재조회, 모바일 수정 저장, 웹 조회 API 확인까지 수행한 결과다. 웹 브라우저 화면에서 `SashForm.vue`를 직접 열어 눈으로 확인한 것은 아니며, 웹 `searchEstiClWindInfoAjax` 응답 원천값으로 웹 조회 가능 여부를 확인했다.

검증 메타:

| 항목 | 값 |
|---|---|
| 검증 일시 | 2026-06-01 18:18:27 KST |
| 백엔드 URL/포트 | `http://localhost:2026` |
| 모바일 URL/포트 | `http://localhost:5180` |
| 웹 URL/포트 | `http://localhost:4831` |
| 백엔드 상태 | 응답 확인. 모바일 로그인 및 저장 API 호출 성공 |
| 모바일 상태 | `http://localhost:5180/` HTTP 200 확인 |
| 웹 상태 | `http://localhost:4831/` HTTP 200 확인 |
| 모바일 로그인 사용자 | `논산영업소`, `USER`, `A101 / 완성(논산)`, `G102 / 중부권영업본부` |
| 테스트 거래처 | `0000102372 / #(부실)(유)미광기업`, 할인등급 `D` |
| 테스트 모형 | `0161-19 / [ASA]BF-250RC`, 창형태 `01 / 2W_정`, 틀짝망 `101` |
| 검증 방식 | 모바일/웹 백엔드 API 직접 호출. 브라우저 Network/UI 눈검증은 미수행 |

식별자:

| 항목 | 값 |
|---|---|
| `itgEstiNo` | `TE2026060100003` |
| `estiNo` | `EE2026060100003` |
| `estiNos` | `1` |
| `estiSeq` | `1` |

실제 검증 결과:

| 단계 | 결과 |
|---|---|
| 모바일 신규 저장 결과 | 성공. `POST /mobile/esti/sash/save` 응답 `save.ok`, `estiSeq=1` |
| 모바일 재조회 결과 | 성공. `POST /mobile/esti/sash/detail`에서 MEDIUM 12개 필드 기대값 확인 |
| 모바일 수정 저장 결과 | 성공. unrelated 필드인 `qty`만 `1 -> 2`로 변경 후 `save.ok`, 동일 `estiSeq=1` 유지 |
| 수정 후 모바일 재조회 | 성공. `qty=2`, MEDIUM 12개 필드 유지 |
| 웹 조회 결과 | 성공. `POST /ItgEstiOne/searchEstiClWindInfoAjax` 응답 `resultList[0]`에서 MEDIUM 12개 필드 기대값 확인 |
| 금액 조회 | 성공. `POST /ItgEstiOne/searchWindEstiAmt` 응답 기준 공급가/VAT/합계 확인 |
| 웹 재저장 후 모바일 재조회 | 미완료. `POST /ItgEstiOne/saveCmplWinEsti` 직접 호출은 HTTP 500 `MyBatisSystemException` 발생 |

API 확인 결과:

| 확인 항목 | 결과 |
|---|---|
| `POST /mobile/auth/login` | 성공. JWT 발급 |
| `POST /mobile/dplc/list` | 성공. 테스트 거래처 선택 |
| `POST /mobile/esti/header/save` | 성공. `itgEstiNo=TE2026060100003` 생성 |
| `POST /mobile/esti/header/issueEstiNo` | 성공. `estiNo=EE2026060100003` 생성 |
| `POST /mobile/esti/sash/save` 신규 | 성공. `save.ok` |
| `POST /mobile/esti/sash/detail` 신규 재조회 | 성공. 12개 필드 확인 |
| `POST /mobile/esti/sash/save` 수정 | 성공. `save.ok`, `estiSeq=1` 유지 |
| `POST /ItgEstiOne/searchEstiClWindInfoAjax` | 성공. 웹 조회 원천값에서 12개 필드 확인 |
| `POST /ItgEstiOne/searchWindEstiAmt` | 성공. 금액 응답 확인 |
| `POST /ItgEstiOne/saveCmplWinEsti` | 실패. HTTP 500 `MyBatisSystemException` |

MEDIUM 12개 필드별 검증 상태:

| 필드 | 입력값 | 모바일 신규 저장 payload | 모바일 재조회 | 모바일 수정 저장 유지 | 웹 조회 API | 비고 |
|---|---:|---|---|---|---|---|
| `glasAttachYn` | `Y` | OK | OK | OK | OK |  |
| `basedfillingPiecesYn` | `Y` | OK | OK | OK | OK |  |
| `sfArmatureType` | `F` | OK | OK | OK | OK |  |
| `mfArmatureType` | `F` | OK | OK | OK | OK |  |
| `bfVentHoleLctn` | `820` | OK | OK | OK | OK |  |
| `bfWinCbMilingType` | `2` | OK | OK | OK | OK | 웹 필드명 `Miling` 유지 |
| `sfInsideRightBrdYn` | `Y` | OK | OK | OK | OK |  |
| `sfMcOneReqYn` | `Y` | OK | OK | OK | OK |  |
| `sfBrdProcYn` | `Y` | OK | OK | OK | OK |  |
| `sfHandleProcYn` | `Y` | OK | OK | OK | OK |  |
| `sfAptArmatureType` | `F` | OK | OK | OK | OK |  |
| `sfAptHandleType` | `3` | OK | OK | OK | OK |  |

주요 조회값:

| 항목 | 값 |
|---|---|
| 품명 | `[ASA]BF-250RC` |
| 규격 | `1200 x 1000` |
| 수량 | 신규 `1`, 수정 후 `2` |
| 색상 | 내부 `71 / 백/백`, 외부 `71 / 백/백` |
| VENT | `02` |
| 스크린 | `2` |
| 유리 | `mtrlCds1=GPDA06CCL05CL05161P`, `mtrlCds2=GPDA06CCL05CL05161P` |
| 공급가 | `536000` (`searchWindEstiAmt.estiTotSaleUnp`) |
| VAT | `53600` (`searchWindEstiAmt.estiTotSaleVat`) |
| 합계 | `589600` (`searchWindEstiAmt.estiTotSaleVatUnp`) |

웹 화면에서 확인 불가한 필드:

- 웹 브라우저에서 `SashForm.vue` 상세 화면을 직접 열어 눈으로 확인하지는 못했다.
- 따라서 "웹 화면 표시" 판정은 미완료이며, 아래 12개 필드는 웹 조회 API 원천값으로만 확인했다.

API 응답으로만 확인한 필드:

- `glasAttachYn`
- `basedfillingPiecesYn`
- `sfArmatureType`
- `mfArmatureType`
- `bfVentHoleLctn`
- `bfWinCbMilingType`
- `sfInsideRightBrdYn`
- `sfMcOneReqYn`
- `sfBrdProcYn`
- `sfHandleProcYn`
- `sfAptArmatureType`
- `sfAptHandleType`

이상 항목:

- 웹 재저장 검증은 실패했다. `searchEstiClWindInfoAjax` row를 기반으로 `/ItgEstiOne/saveCmplWinEsti`를 직접 호출했으나 HTTP 500 `MyBatisSystemException`이 발생했다.
- 웹 UI에서 실제 저장 버튼을 눌러 생성되는 payload와 직접 API payload가 다를 수 있으므로, 이 실패만으로 웹 화면 저장 기능 오류라고 단정하지 않는다.
- 웹 브라우저 화면에서 조건부 UI 노출 여부는 아직 확인하지 못했다.

후속 조치:

- 웹 브라우저로 `TE2026060100003`을 조회해 `SashForm.vue` 화면에서 12개 필드의 실제 표시 여부를 눈으로 확인한다.
- 웹 화면 저장 버튼의 실제 Network payload로 `/ItgEstiOne/saveCmplWinEsti`를 재검증한다.
- 웹 저장 payload와 직접 API payload 차이를 비교해 500 원인을 분리한다.

## 9. 이상 발생 시 확인할 로그/API

### 브라우저 개발자도구

모바일:

- `POST /mobile/esti/header/save`
- `POST /mobile/esti/header/detail`
- `POST /mobile/esti/header/issueEstiNo`
- `POST /mobile/esti/sash/save`
- `POST /mobile/esti/sash/list`
- `POST /mobile/esti/sash/detail`
- `POST /ItgEstiOne/searchWindEstiAmt`

웹:

- `POST /ItgEstiOne/searchEstiAjax`
- `POST /ItgEstiOne/searchEstiClWindInfoAjax`
- `POST /ItgEstiOne/searchWindEstiAmt`
- 웹 저장 비교가 필요하면 `POST /ItgEstiOne/saveCmplWinEsti`

확인할 request key:

```text
itgEstiNo
estiNo / windEstiNo
estiNos
estiSeq
mdlCd
wintydiCd
bsmfOrdUtmCd
sashOrdTypCd
wSize / hSize
qty
glasAttachYn
basedfillingPiecesYn
sfArmatureType
mfArmatureType
bfVentHoleLctn
bfWinCbMilingType
sfInsideRightBrdYn
sfMcOneReqYn
sfBrdProcYn
sfHandleProcYn
sfAptArmatureType
sfAptHandleType
```

### 백엔드 로그

`MobileEstiService` 로그에서 확인할 메시지:

- `[Mobile Esti] issueEstiNo`
- `[Mobile Sash] searchSashList`
- `[Mobile Sash] selectSashDetail params`
- `[Mobile Sash] ===== 프로시저 호출 파라미터 =====`
- `[Mobile Sash] estiSeq 채번`
- `[Mobile Sash] 저장 완료`
- `[Mobile Sash] 저장 실패`

주요 확인 포인트:

- 신규 저장인데 `estiSeq`가 정상 채번되었는지
- 수정 저장인데 기존 `estiSeq`가 유지되었는지
- `estiNo`가 `P`나 빈 값으로 남지 않았는지
- `drwgCd`, 유리두께, 유리자재 자동 보정이 실패하지 않았는지
- STEP1/STEP2 후 `errMsg`가 없는지

### 직접 API 재현 예시

로그인 토큰이 있는 경우 모바일 상세 단건 조회:

```bash
curl -X POST http://localhost:2026/mobile/esti/sash/detail \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"itgEstiNo":"<ITG>","estiNo":"<W_ESTI_NO>","estiNos":"1","estiSeq":"<SEQ>"}'
```

금액 조회:

```bash
curl -X POST http://localhost:2026/ItgEstiOne/searchWindEstiAmt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"itgEstiNo":"<ITG>","estiNo":"<W_ESTI_NO>","estiSeq":"<SEQ>"}'
```

## 10. 생산비고 1차 자동 생성 검증 상태 - 2026-06-04

상태: payload 단위 테스트 완료, 실제 모바일 저장 후 웹 조회 미완료.

2026-06-04 현재 WSL 포트 확인 결과 백엔드 `2026`, 모바일 Vite, 웹 Vue 개발 서버가 실행 중이지 않아 실제 `itgEstiNo` 생성/저장/웹 조회 검증은 수행하지 않았다. 체크리스트 완료를 실제 검증 완료로 표시하지 않는다.

1차 자동 생성 대상:

| 구분 | 모바일 선택값 | 생성 대상 비고 |
|---|---|---|
| BF | 밀링유형/상세/위치 | `pdBfRemSrc`: `반밀링...` 또는 `날개...` + `상/하/좌/우` |
| BF | 기본옵션 | `pdBfRemSrc`: `직송`, `렉별도출고`, `절단바로(용접X)`, `물구멍 X`, `상하휠링피스`, `기존 휠링피스`, `ㄱㄴ용접`, `4면포장`, `스토퍼부착`, `KS마크` |
| BF | 특수창/포장/보강 | `pdBfRemSrc`: `FM-X,GB-X`, `FM/GB 길게 별도 출고`, `FM/GB상하작업`, `FM/GB좌우작업`, `FM상하일자절단`, `SS일자절단,연결구`, `FIX외부시공`, `풀다운핸들`, `보강재:4면`, `랩핑:*`, `3면포장:*`, `100면보이게/40면 보이게` |
| SF | 장식X | `pdSfRemSrc`: `장식X1층내,1층외,2층내,2층외,` |
| SF | 윈드클로저 | `pdSfRemSrc`: `윈드클로저:내창외창2층내창2층외창` |
| SF | 외짝 | `pdSfRemSrc`: `외짝1W_*`, `외짝2W_*`, `외짝3W_*`, `외짝4W_*` |
| MF | 망핸들 | `pdMfRemSrc`: `방충망핸들`, 높이 입력 시 `핸들 하 <값>` |
| MF | 안전망 | `pdMfRemSrc`: `안전망핸들:일반`, 높이 입력 시 `핸들 하 <값>` |

실제 저장 후 웹 조회 시 추가 확인할 항목:

| 항목 | 확인 위치 | 상태 |
|---|---|---|
| 저장 payload의 `pdBfRemSrc` | 모바일 Network `POST /mobile/esti/sash/save` | 미완료 |
| 저장 payload의 `pdSfRemSrc` | 모바일 Network `POST /mobile/esti/sash/save` | 미완료 |
| 저장 payload의 `pdMfRemSrc` | 모바일 Network `POST /mobile/esti/sash/save` | 미완료 |
| DB 저장값 | `TWE_ESTI_CL_WIND_INFO` 또는 웹 조회 API 응답 | 미완료 |
| 웹 화면 표시 | CA_NERP2 `SashForm.vue` 기준 견적 상세 | 미완료 |

## 11. known issue 목록

1. 모바일 저장 payload는 웹 `SashForm.vue` 전체 옵션을 100% 포함하지 않는다.
   - 생산비고는 1차 자동 생성만 완료했다.
   - 웹 `optionWrite()` 전체 옵션, 일부 특수 가공 옵션, 일부 2층/특수 옵션은 아직 웹과 차이가 날 수 있다.

2. 수정 여부는 `estiSeq` 유지에 의존한다.
   - 수정 화면 URL 또는 목록 row에서 `estiSeq`가 누락되면 신규 순번으로 저장될 수 있다.

3. `견적추가` 버튼은 수정 화면에서도 새 순번 저장 흐름이다.
   - 기존 순번 수정 검증 시 반드시 `저장` 버튼을 사용한다.

4. 웹과 모바일의 표시 필드명이 다르다.
   - 모바일은 `mtrlCds1`~`mtrlCds4`, payload는 `insdSfGlasMtrlCd` 등으로 변환한다.
   - 웹은 `inSfGlas`, `ouSfGlas`, `inBfGlas`, `ouBfGlas` 계열 form 값을 저장 payload로 변환한다.

5. 도면 이미지는 개발환경 경로 의존성이 있다.
   - 모바일 Vite는 `/data/*`를 `C:/Projects/ca_erp/workspace/CA_ERP/WebContent/data` 또는 `/mnt/c/Projects/ca_erp/workspace/CA_ERP/WebContent/data`에서 제공한다.
   - 도면이 안 보이면 저장 자체보다 이미지 경로 문제일 수 있다.

6. 금액은 저장 직후 프로시저 결과와 별도 금액 조회 결과를 비교해야 한다.
   - 모바일 상세 하단 금액은 `searchWindEstiAmt` 별도 호출 결과다.
   - 목록 금액, 상세 금액, 웹 그리드 금액의 표시 기준이 다르면 같은 API 기준으로 다시 비교한다.

7. 다차수(`estiNos != 1`) 흐름은 별도 검증이 필요하다.
   - 현재 모바일 주요 흐름은 `estiNos: '1'`을 기본값으로 사용한다.

8. 권한/영업소가 다르면 웹에서 같은 견적이 보이지 않을 수 있다.
   - 모바일 로그인 사용자와 웹 로그인 사용자의 영업소/권한을 맞춘다.

9. 백엔드가 다른 DB를 바라보면 웹 조회가 불가능하다.
   - 모바일 Vite의 `VITE_BACKEND_ORIGIN`, 웹 프론트의 API 대상, 백엔드 DB 접속 설정을 동시에 확인한다.

10. `SashForm2.vue`는 검증 기준이 아니다.
    - 웹 화면 비교 기준은 `SashForm.vue`와 `/ItgEstiOne/saveCmplWinEsti`, 조회 API다.

11. MEDIUM 옵션 일부는 웹 화면 조건부 노출 항목이다.
    - 모형/창형태 조건에 따라 `sfAptArmatureType`, `sfAptHandleType`, `bfWinCbMilingType`, `bfVentHoleLctn` 등이 화면에 보이지 않을 수 있다.
    - 이 경우 웹 조회 API 응답, 저장 payload, 백엔드 프로시저 파라미터 로그로 원천값을 대체 확인한다.
