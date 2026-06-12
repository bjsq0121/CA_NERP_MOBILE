# 모바일 샤시 신규/수정 저장 흐름 검증

분석 대상:

- `src/views/SashNew.vue`
- `src/views/EstimateDetail.vue`
- `src/utils/sashPayload.js`
- `src/utils/sashEditPreserve.js`
- `src/api/estimate.js`
- `CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java`

코드는 수정하지 않고 현재 흐름만 정리했다.

## 1. 신규 샤시 저장 흐름

1. `EstimateDetail.vue`가 견적 상세 진입 시 `selectEstiHeader(itgEstiNo)`로 헤더를 조회한다.
2. `resolveWindEstiNo(data)`로 헤더의 샤시 견적번호(`wEstiNo`)를 구한다.
3. `wEstiNo`가 있으면 `searchSashList({ itgEstiNo, estiNo: wEstiNo })`로 샤시 목록을 조회한다.
4. 사용자가 샤시 추가를 누르면 `addSash()`가 실행된다.
5. 이미 `wEstiNo`가 있으면 바로 `/estimates/sash/new?itgEstiNo=...&wEstiNo=...`로 이동한다.
6. `wEstiNo`가 없으면 `issueEstiNo(itgEstiNo, 'wind')`를 호출해 샤시 헤더 견적번호를 발번한 뒤 같은 신규 화면으로 이동한다.
7. `SashNew.vue`는 query에서 `itgEstiNo`, `wEstiNo`, `estiNos`를 읽는다. 신규 화면에는 `estiSeq` query가 없으므로 `isEditMode`는 false다.
8. `onMounted()`에서 `loadMasters()`만 실행하고 `loadEditData()`는 실행하지 않는다.
9. 사용자가 저장하면 `saveAndClose()` 또는 `saveAndAdd()`가 `submit()`을 호출한다.
10. `submit()`은 화면 검증 후 `buildPayload()`를 호출한다.
11. 신규 저장에서는 `editEstiSeq`가 빈 값이므로 `sashPayload.js`가 `estiSeq: ''`를 만든다.
12. `saveSashEsti(payload)`가 `/mobile/esti/sash/save`로 저장 요청을 보낸다.
13. `MobileEstiService.saveSashEsti()`는 `estiSeq`가 빈 값이면 `selectNextEstiSeq()`로 다음 순번을 발번하고 STEP1/STEP2 프로시저를 호출한다.

## 2. 기존 샤시 수정 진입 흐름

1. `EstimateDetail.vue`의 샤시 목록 카드 클릭 시 `openSash(row)`가 실행된다.
2. 상태코드 `stCd` 또는 `igStCd`가 없거나 `10`이면 편집 가능, 그 외는 readonly로 진입한다.
3. 클릭한 row를 `sessionStorage.mobile_sash_edit_row`에 저장한다. 현재 `SashNew.vue`는 상세 조회를 우선 사용하고, 이 값은 보조/과거 흐름 잔재 성격이다.
4. 라우터는 다음 query로 이동한다.
   - `itgEstiNo`
   - `wEstiNo: row.estiNo || row.windEstiNo || wEstiNo.value`
   - `estiNos: row.estiNos || '1'`
   - `estiSeq: row.estiSeq`
   - `readonly: editable ? '' : 'Y'`
5. `SashNew.vue`는 `editEstiSeq = route.query.estiSeq || ''`로 초기화한다.
6. `isEditMode = computed(() => !!editEstiSeq.value)`이므로 `estiSeq`가 있으면 수정 모드다.
7. `onMounted()`에서 `loadMasters()` 후 `loadEditData()`를 실행한다.

## 3. selectSashDetail 결과가 form으로 복원되는 흐름

`SashNew.vue`의 `loadEditData()` 흐름:

1. `sessionStorage.removeItem('mobile_sash_edit_row')`로 세션 row를 제거한다.
2. `selectSashDetail()` 호출 payload를 만든다.
   - `itgEstiNo: itgEstiNo.value`
   - `estiNo: wEstiNo.value`
   - `estiNos: estiNos.value`
   - `estiSeq: String(editEstiSeq.value)`
3. `/mobile/esti/sash/detail` 응답의 `data.resultData`를 `r`로 받는다.
4. `wSize`, `hSize`, `w1Size` 등 일부 필드는 Lombok/Jackson 대소문자 이슈를 고려해 `pick()`으로 여러 키 후보를 확인한다.
5. `Object.assign(form.value, { ... })`로 상세 row를 모바일 form 구조에 매핑한다.
6. 주요 복원 매핑:
   - 기본: `mdlCd`, `mdlNm`, `wintydiCd`, `bftydiCd`, `sizCd`, `bsmfOrdUtmCd`, `sashOrdTypCd`
   - 사이즈: `wSize/hSize`, `w1Size`~`w5Size`, `h1Size`~`h5Size`, `csSize`~`cs5Size`
   - 색상/SF: `insdColrCd`, `ousdColrCd`, `insdSf`, `ousdSf`
   - VENT/스크린/안전망: `ventLoc`, `screenType`, `aluMfYn`, `aluMfHandleType`, `aluMfMdlYn`, `aluMfHndlH`
   - 생산옵션: BF/SF/MF 옵션 다수
   - 유리: `mtrlCds1`~`mtrlCds4` 또는 `insdSfGlasMtrlCd` 등 alias
   - 금액 표시 원천: 일부 금액 필드와 `loadWindEstimateAmount()` 결과
7. `r.mdlCd`가 있으면 `captureSashEditValues(form.value)`로 저장 상세값 중 보존 대상 필드를 스냅샷한다.
8. `onModelPick({ ...r }, { preserveProductionOptions: true })`를 호출해 모형 기준 마스터/기본값을 다시 적용한다.
9. `restoreSashEditValues(form.value, savedEditValues)`로 상세 조회값이 모형 기본값에 덮이지 않도록 복원한다.
10. `applyProductionOptionRules()`와 `refreshDrawingFromCurrentSelection()`를 실행한다.
11. 마지막으로 `loadWindEstimateAmount()`가 `searchWindEstiAmt({ itgEstiNo, estiNo: wEstiNo, estiSeq })`로 금액 요약을 조회한다.

`sashEditPreserve.js`가 보존하는 필드는 분할치수, 유리 선택, VENT/스크린, SF, 색상, 틀짝망, 발주구분이다.

## 4. saveSashEsti payload 생성 흐름

`SashNew.vue` 저장 흐름:

1. `saveAndClose()`는 `submit()`을 그대로 호출한다.
2. `saveAndAdd()`는 `submit({ asNewSeq: true })`를 호출한다.
3. `submit()`은 다음 순서로 검증한다.
   - 분할치수: `validateSegmentSizes()`
   - 규격모형: `validateStandardModelSpec()`
   - 생산옵션: `validateProductionOptions()`
   - 필수값: `itgEstiNo`, `mdlCd`, `wintydiCd`, `bsmfOrdUtmCd`, `sashOrdTypCd`, W/H, 수량, 스크린, VENT, 색상, SF 등
4. `buildPayload({ asNewSeq })`가 `buildSashSavePayload()`를 호출한다.
5. `asNewSeq`가 false이면 `editEstiSeq.value`를 넘긴다.
6. `asNewSeq`가 true이면 `editEstiSeq`를 빈 값으로 넘긴다.
7. `buildSashSavePayload()`는 `form` 값을 저장 API 필드명으로 변환한다.
8. 저장 직전 `payload.ventLoc`가 없고 `ventOptions`가 있으면 첫 번째 VENT를 보정한다.
9. `saveSashEsti(payload)`는 `/mobile/esti/sash/save`로 POST한다.

`sashPayload.js`의 핵심 식별자 매핑:

```js
{
  itgEstiNo,
  estiNo: wEstiNo,
  estiNos,
  estiSeq: editEstiSeq || '',
}
```

## 5. itgEstiNo, estiNo, estiNos, estiSeq 세팅 방식

| 값 | 신규 진입 | 수정 진입 | 저장 payload | 백엔드 보정 |
|---|---|---|---|---|
| `itgEstiNo` | 상세 route param에서 query로 전달 | row 클릭 시 query로 전달 | 그대로 전송 | 접근권한 확인에 사용 |
| `estiNo` | `wEstiNo` query 사용. 없으면 `issueEstiNo()`로 발번 | `row.estiNo || row.windEstiNo || wEstiNo.value` | `estiNo: wEstiNo` | 비어 있거나 `"P"`이면 헤더에서 `wEstiNo` 재조회 또는 신규 발번 |
| `estiNos` | query 없으면 `'1'` | `row.estiNos || '1'` | 그대로 전송 | 비어 있으면 `'1'` |
| `estiSeq` | 없음, 빈 값 | `row.estiSeq` query | 저장 방식에 따라 빈 값 또는 기존 값 | 빈 값 또는 `"0"`이면 `selectNextEstiSeq()`로 신규 발번 |

## 6. 신규 저장과 수정 저장을 구분하는 조건

프론트 기준:

- `SashNew.vue`의 수정 모드 조건은 `!!editEstiSeq.value` 하나다.
- `editEstiSeq`는 최초 진입 시 `route.query.estiSeq || ''`로 세팅된다.
- 정상 수정 저장은 `saveAndClose()` -> `submit()` -> `buildPayload({ asNewSeq: false })` -> 기존 `editEstiSeq` 전송이다.
- 신규 저장은 `editEstiSeq`가 빈 값인 상태에서 저장하거나, `saveAndAdd()`처럼 의도적으로 `asNewSeq: true`를 넘겨 `editEstiSeq`를 비워 저장하는 경우다.

백엔드 기준:

- `MobileEstiService.saveSashEsti()`는 `param.getEstiSeq()`가 비었거나 `"0"`이면 신규로 판단해 다음 `estiSeq`를 발번한다.
- `estiSeq`가 있으면 별도 신규 발번을 하지 않고 해당 순번으로 프로시저를 호출한다.

## 7. 수정 시 estiSeq가 새로 생길 위험이 있는지

정상 수정 진입에서는 위험이 낮다. `EstimateDetail.vue.openSash(row)`가 `estiSeq: row.estiSeq`를 query로 넘기고, `SashNew.vue.saveAndClose()`가 기존 `editEstiSeq.value`를 payload에 유지하기 때문이다.

다만 다음 경우에는 새 `estiSeq`가 생길 수 있다.

| 경우 | 위험 |
|---|---|
| 수정 URL에 `estiSeq` query가 누락된 경우 | `isEditMode`가 false가 되고 신규 저장처럼 동작한다. 저장 시 백엔드가 새 순번을 발번한다. |
| `row.estiSeq`가 목록 row에 없거나 빈 값인 경우 | 수정 카드 클릭이어도 신규 화면처럼 진입한다. |
| 수정 화면에서 `saveAndAdd()`를 누르는 경우 | 의도적으로 `asNewSeq: true`가 적용되어 새 순번을 만든다. 버튼 라벨이 `견적추가`이므로 기능상 의도된 동작이다. |
| `loadEditData()`가 상세를 못 찾고도 사용자가 저장하는 경우 | `editEstiSeq`는 query 값이 유지되므로 새 순번은 생기지 않지만, 빈/기본 form으로 기존 순번을 덮을 위험이 있다. 현재는 상세 없음에 대한 명시적 차단이 없다. |
| 백엔드에서 `estiSeq`가 `"0"`으로 들어오는 경우 | 신규 발번 조건에 걸린다. 프론트는 query 값을 문자열로 보내므로 row 값이 `"0"`이면 새 순번이 생긴다. |

핵심 결론: `estiSeq` 누락 시 새로 생기는 것은 현재 설계상 백엔드 동작이다. 수정 저장 안전성은 `EstimateDetail` 목록 row가 항상 `estiSeq`를 갖고, 수정 URL이 `estiSeq`를 유지한다는 전제에 의존한다.

## 8. 현재 테스트로 검증되는 부분

### 프론트 테스트

- `src/utils/sashPayload.test.js`
  - 신규 payload에서 `estiSeq`가 빈 값으로 생성되는지 검증한다.
  - 수정 payload에서 `editEstiSeq: '7'`이 `payload.estiSeq: '7'`로 보존되는지 검증한다.
  - `estiNo`, `estiNos`, 색상, 치수, 주요 BF/SF/MF 옵션 매핑을 검증한다.

- `src/utils/sashEditPreserve.test.js`
  - 모형 기본값 재적용 후 분할치수와 유리 선택이 복원되는지 검증한다.
  - 의도적으로 빈 값으로 저장된 유리/VENT/스크린 값도 빈 값 그대로 유지되는지 검증한다.

- `src/views/SashNew.test.js`
  - `loadMasters()` 후 수정 모드에서 `loadEditData()`가 실행되는 구조를 정규식으로 검증한다.
  - 화면 하단/상단에 `editEstiSeq || '(신규)'`가 표시되는지 검증한다.
  - `saveAndAdd()`가 `submit({ asNewSeq: true })`를 호출하고 저장 후 `loadSavedEstimate(result.estiSeq)`로 방금 저장한 순번을 다시 로드하는지 검증한다.
  - `saveAndClose()`가 저장 후 상세로 돌아가는지 검증한다.
  - `buildPayload()`가 `editEstiSeq: asNewSeq ? '' : editEstiSeq.value`를 쓰는지 검증한다.
  - 각종 검증 로직(밀링 상세, 직송주소, 안전망, 규격모형, 유리X/실리콘마감 등)을 소스 정규식 수준으로 확인한다.

### 백엔드 테스트

- `MobileEstiServiceSashValidationTest`
  - 필수값 누락 시 프로시저 호출 전에 실패하는지 검증한다.
  - `S` 할인등급 저장 차단을 검증한다.
  - 저장 가능 상태가 아니면 프로시저를 호출하지 않는지 검증한다.
  - 신규 저장 시 `selectNextEstiSeq()` 결과가 `checkEnableSaveEsti()`의 key에 들어가는지 검증한다.
  - `issueEstiNo()`가 기존 샤시 견적번호를 재사용하는지 검증한다.
  - 헤더에 `wEstiNo`가 없을 때 저장된 샤시 견적번호 fallback을 검증한다.
  - `searchSashList()`가 헤더 또는 fallback으로 찾은 `wEstiNo`를 `windEstiNo`로 넘기는지 검증한다.

## 9. 추가 테스트가 필요한 부분

| 영역 | 필요한 테스트 |
|---|---|
| `EstimateDetail.openSash()` | row 클릭 시 `itgEstiNo`, `wEstiNo`, `estiNos`, `estiSeq`, `readonly` query가 정확히 만들어지는지 검증 필요 |
| `SashNew.loadEditData()` | `selectSashDetail` 결과가 주요 form 필드로 복원되는지 실제 함수 단위 또는 컴포넌트 테스트 필요 |
| 상세 없음 처리 | `selectSashDetail`이 null을 반환하면 저장을 차단하거나 에러 표시하는지 테스트 필요. 현재 차단 로직 없음 |
| 수정 저장 | `saveAndClose()`가 기존 `estiSeq`를 payload에 유지해 `/mobile/esti/sash/save`를 호출하는지 통합 테스트 필요 |
| 저장 후 추가 | 수정 화면에서 `saveAndAdd()`가 의도적으로 새 `estiSeq`를 만들고, 반환된 순번으로 route replace 후 재조회하는지 테스트 필요 |
| 백엔드 수정 저장 | `estiSeq`가 존재하는 payload에서는 `selectNextEstiSeq()`를 호출하지 않는지 테스트 필요 |
| 백엔드 신규 저장 | `estiSeq` 빈 값/`"0"` 각각에서 `selectNextEstiSeq()`가 호출되는지 명시 테스트 필요 |
| `estiNos` | `estiNos`가 `'1'`이 아닌 수정 row에서도 목록, 상세, 저장이 같은 차수를 유지하는지 테스트 필요 |
| 금액 재조회 | 수정 상세 로드 후 `searchWindEstiAmt`가 `itgEstiNo`, `estiNo`, `estiSeq`로 호출되는지 테스트 필요 |
| 세션 row | `sessionStorage.mobile_sash_edit_row` 저장/삭제가 현재 흐름에 실질 영향이 없는지 또는 fallback으로 쓸지 정책 테스트 필요 |

## 10. 의심되는 버그 또는 개선 포인트

1. 수정 상세 조회 실패 시 저장 차단이 없다.
   - `loadEditData()`에서 `resultData`가 없으면 그냥 return한다.
   - 이 상태에서 사용자가 저장하면 `editEstiSeq`가 유지된 채 빈 form 또는 기본 form으로 기존 순번을 덮을 가능성이 있다.
   - 개선: 수정 모드에서 상세가 없으면 `error`를 세팅하고 저장 버튼을 비활성화하는 편이 안전하다.

2. 수정 여부가 `estiSeq` query 하나에만 의존한다.
   - 목록 row나 URL에서 `estiSeq`가 빠지면 신규 저장이 된다.
   - 개선: 수정 진입 시 `estiSeq`가 없으면 상세 화면에서 진입을 막거나, `SashNew`에서 `wEstiNo`만 있고 `estiSeq`가 없는 편집 의심 상태를 명확히 처리한다.

3. `saveAndAdd()`가 수정 화면에서도 항상 새 순번을 만든다.
   - 기능명상 의도된 동작으로 보이지만 사용자는 “저장 후 계속 추가”와 “현재 수정 저장”을 혼동할 수 있다.
   - 개선: 수정 모드에서는 버튼 라벨을 더 명확히 하거나 확인 절차를 둔다.

4. `sessionStorage.mobile_sash_edit_row`는 저장하지만 `SashNew`에서 바로 제거한다.
   - 현재 실제 상세 복원은 API 기반이다.
   - 개선: 세션 row가 필요 없으면 제거하거나, `selectSashDetail` 실패 시 fallback으로 사용할지 정책을 정한다.

5. `statusBadgeClass()`에 `if (cd === '10') return 'badge'`가 중복되어 있다.
   - 기능 영향은 작지만 정리 대상이다.

6. `searchSashList()`는 `estiNos`를 `"1"`로 고정한다.
   - 프론트 수정 진입은 row의 `estiNos`를 넘기지만 목록 조회 자체는 백엔드에서 1차수 고정이다.
   - 다차수 견적을 모바일에서 다룰 계획이 있으면 목록 조회부터 `estiNos` 전달/반영이 필요하다.

7. `loadEditData()`의 alias 처리 범위가 일부 필드에 한정되어 있다.
   - `wSize/hSize`, 일부 분할치수는 대소문자 alias를 처리하지만 모든 저장 필드가 같은 수준으로 처리되지는 않는다.
   - 백엔드가 reflection map을 반환하므로 대부분 lowerCamelCase일 가능성이 높지만, 기존 응답 호환까지 고려하면 필드별 alias 정책을 정리할 필요가 있다.

8. 백엔드 수정 저장에서 `selectNextEstiSeq()` 미호출 테스트가 없다.
   - 현재 코드는 `estiSeq`가 있으면 신규 발번을 하지 않는 구조지만, 회귀 방지 테스트가 필요하다.

9. `estiNo` 보정은 강하지만 프론트와 서버 책임이 중복된다.
   - 프론트는 `wEstiNo`를 넘기고, 서버도 비어 있으면 헤더에서 재조회한다.
   - 안전망으로는 좋지만 문제 발생 시 원인 추적을 위해 저장 로그/응답에 최종 `estiNo`도 반환하면 디버깅이 쉬워진다.

10. 수정 화면에서 `readonly`는 저장 버튼을 숨기지만 직접 URL 조작 방어는 서버 상태 검증에 의존한다.
    - 서버의 `checkEnableSaveEsti()`가 최종 방어선이라 구조는 맞다.
    - 프론트 테스트는 readonly 진입과 버튼 숨김을 추가로 검증하는 편이 좋다.
