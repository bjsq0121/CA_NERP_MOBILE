# 모바일 샤시 폼 - 웹 SashForm 대응표

분석 기준:

- 웹 기준 파일은 `CA_NERP2/vue/src/components/modal/order/sale/estimate/SashForm.vue`만 사용했다.
- `SashForm2.vue`는 사용하지 않는 파일이므로 제외했다.
- 웹 저장 API 래퍼는 `CA_NERP2/vue/src/api/salesMng/salesEsti/itgEstiOne.js`의 `saveCmplWinEsti()`를 기준으로 확인했다.
- 모바일 기준 파일은 `SashNew.vue`, `SashFormMain.vue`, `SashOptionVent.vue`, `SashOptionHandle.vue`, `SashOptionGlass.vue`, `SashOptionFactory.vue`, `sashPayload.js`, `sashOptions.js`이다.
- 백엔드 기본값 보강 여부는 `CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java`의 `saveSashEsti()`와 `fillSashDefaults()` 현재 구현을 기준으로 판단했다.

구현 업데이트:

- MEDIUM 대상 중 `windCloserMatYn`을 제외한 12개 필드는 모바일 UI, form 초기값, 수정 복원, `sashPayload.js` 전송 필드에 반영했다.
- `Yn` 계열은 프론트 payload에서 명시적으로 `N` 기본값을 보낸다.
- 선택값/타입 계열은 웹 기본값이 명확하지 않은 항목은 빈값으로 보낸다.
- `drwgCd`는 VENT 변경 시 `/ItgEstiOne/searchDrwgFileAjax` 결과에 유효한 도면코드가 있을 때만 payload에 넣는다. 도면 API 실패/도면 없음/화면 fallback 상황에서는 이전 VENT의 `drwgCd`를 저장하지 않도록 빈값으로 둔다.
- 상태 정책은 fail-closed로 정리했다. 헤더 또는 route에서 확정된 상태 `10`만 편집 가능하며, 상태 미확인/공백/API 실패/direct URL 접근은 저장 불가로 처리한다.
- 이번 MEDIUM 단계에서는 `MobileEstiService.fillSashDefaults()`를 수정하지 않았다.
- 수동 검증은 실행 가능한 체크리스트를 `docs/mobile-sash-manual-verification.md`의 "8-1. MEDIUM 옵션 12개 전용 검증 시나리오"에 추가했다.
- 2026-06-01 실제 검증은 모바일 신규 저장, 모바일 재조회, 모바일 수정 저장, 웹 조회 API 확인까지 완료했다. 웹 브라우저 화면 눈검증과 웹 저장 버튼 재저장은 아직 미완료다.

## 1. 웹 SashForm.vue 주요 입력 필드 목록

### 기본/규격

| 구분 | 웹 form 필드 | 화면 의미 | 모바일 form 여부 |
|---|---|---|---|
| 모형 | `form.model.code`, `form.model.name` | 모형명/모형코드 | 있음: `mdlCd`, `mdlNm` |
| 할인등급 | `dplcDcGrd` | 할인등급 | form에는 없음, 백엔드가 헤더에서 보강 |
| 창형태 | `wintydiCd` | 창형태 | 있음 |
| 틀짝망 | `net` | 틀짝망 주문단위 | 있음: `bsmfOrdUtmCd` |
| 발주구분 | `sashOrdTyp` | 발주구분 | 있음: `sashOrdTypCd` |
| 크기/수량 | `w`, `h`, `qty` | W/H/수량 | 있음 |
| 분할 크기 | `w1`~`w5`, `h1`~`h5`, `cs`, `cs1`~`cs5` | 창형태별 보조 치수 | 있음 |
| 색상 | `colorStd`, `colorInner`, `colorOut` | 색상 기준/내부/외부 | 있음: `crtnColrCd`, `insdColrCd`, `ousdColrCd` |
| 내/외 SF | `insdSf`, `ousdSf` | 내측/외측 SF 자재 | 있음 |
| 도면 | `drwgCd` | 도면코드 | 있음: VENT 도면 API 성공 시 `drwgCd` payload 전송, 실패 시 빈값 |
| 규격모형 제한 | `sashStandardYn`, `stndCdData.*` | 규격사양 검증 | 일부 있음: `sashStandardYn`, 프론트 검증 로직 |

### VENT/스크린/안전망/유리

| 구분 | 웹 form 필드 | 화면 의미 | 모바일 form 여부 |
|---|---|---|---|
| VENT | `vent` | VENT 위치 | 있음: `ventLoc` |
| 스크린 | `screen` | 스크린 종류 | 있음: `screenType` |
| 안전망 | `isAluMf` | 알루미늄망 여부 | 있음: `isAluMf` |
| 안전망 중앙 | `isAluMfMdl` | 알루미늄망 중앙 여부 | 있음: `aluMfMdlYn` |
| 안전망 핸들 | `aluMfHandleType`, `aluMfHndlH` | 안전망 핸들/높이 | 있음 |
| 알유리 | `alGlass` | 알유리견적 | 있음: `alGlass` |
| 실리콘 마감여부 | `glasAttachYn` | 영업소 특수창 유리 부착 후 출고/단가인상 옵션 | 있음 |
| 유리 승인 | `glasAdmsYn` | 유리 승인/적용 여부 | 있음: `glasAdmsYn` |
| 유리 자재 | `inSfGlas`, `ouSfGlas`, `inBfGlas`, `ouBfGlas` | SF/BF 내외측 유리 | 있음: `mtrlCds1`~`mtrlCds4` |

### 핸들/브래킷

| 구분 | 웹 form 필드/객체 | 화면 의미 | 모바일 form 여부 |
|---|---|---|---|
| 핸들 종류 | `insdHandleType`, `ousdHandleType` | 내/외측 핸들 | 있음 |
| 1층 핸들높이 | `handle.toggle`, `handle.inner`, `handle.outer` | 내/외 핸들높이 | 있음: `insdHndlHEnabled`, `insdHndlH`, `ousdHndlH` |
| 2층 핸들높이 | `handle.toggle2`, `handle.inner2`, `handle.outer2` | 2층 내/외 핸들높이 | 있음: `secondHndlHEnabled`, `insd2FHndlH`, `ousd2FHndlH` |
| 1층 브래킷 | `bracket.toggle`, `bracket.inner`, `bracket.outer` | 내/외 브래킷높이 | 있음 |
| 2층 브래킷 | `bracket.toggle2`, `bracket.inner2`, `bracket.outer2` | 2층 내/외 브래킷높이 | 있음 |

### BF 생산옵션

| 구분 | 웹 form/list | 화면 의미 | 모바일 form 여부 |
|---|---|---|---|
| BF 기본 | `bfDefaultList` | 직송, 렉별도출고, 절단바로, 배수홀, 통기홀, 휠링피스, ㄱㄴ용접, 4면포장, 스토퍼, KS마크, LX히든 | 대부분 있음 |
| 보강재 | `bfAmature` | BF 보강재 | 있음: `bfArmatureType` |
| 락 개수 | `bfLockCnt` | LX 락 개수 | 있음 |
| 랩핑 | `bfWrapping` | ㄱ/ㄷ 랩핑 | 있음 |
| 3면포장 | `bfThrSidePack` | 3면포장 | 있음 |
| 밀링 | `bfMillingWing`, `bfMillingDetail`, `bfMillingLoca` | 밀링유형/상세/위치 | 있음: `bfMillingType`, `bfMillingDetail`, 위치 4개 |
| 특수창 | `bfSpWinList`, `bfSideView` | FM/GB, SS, FIX, 풀다운핸들, 방향 | 있음 |
| 터닝도어 | `bfTurnDoorPull`, `bfTurnDoorOneSideWrap`, `bfOneSideWrapColrNm` | 터닝도어 당김/일면래핑 | 있음 |
| 케이스먼트 | `bfAptCmType`, `bfApt1pjMethod`, `bfApt2pjLoc`, `bfApt2pjMethod` | 케이스먼트 | 있음 |
| 터닝 제작 | `bfTurnDoorMakeMethodList`, `bfVentHoleLctn` | 문짝만 제작, 경첩+피스, 경첩타공위치 | 있음 |
| BF 아파트 | `bfWinCbMilling`, `bfAptDefaultList` | 통바밀링, 1FIX 타공, FM 3면, SP마감, 이형픽스, 실리콘마감 | 있음 |

### SF/MF 생산옵션

| 구분 | 웹 form/list | 화면 의미 | 모바일 form 여부 |
|---|---|---|---|
| SF 기본 | `sfDefaultList` | 직송, 렉별도출고, SP가로, 외주유리 | 있음 |
| SF 보강재 | `sfAmature`, `sfAptAmatureType` | SF 보강재/아파트 보강재 | 있음 |
| 윈드클로저 | `winCloser` | 내/외/2층 윈드클로저 | 있음: 내창/외창/2층내창/2층외창 |
| 로라 | `sfRoller` | 로라 | 있음 |
| 크리센트 | `sfCrecent`, `sfCreSize` | 크리고리/크기 | 있음 |
| 장식X | `deco1` | 내/외/2층 장식 없음 | 있음 |
| SF 옵션 | `sfOptionList` | 내부우측매립, MC1개요청, 반대타입, 매립가공, 핸들가공 | 있음 |
| 외짝 | `sfOutType0`~`sfOutType3` | 1W~4W 외짝 옵션 | 있음 |
| 손타 | `locaSonta`, `sfHandle` | 손타위치, 아파트 핸들 | 있음 |
| SF 통기홀 | `sfInsdVentHoleYn`, `sfOusdVentHoleYn` | 관리자용 SF 통기홀 | 있음 |
| MF 기본 | `mfDefaultList` | 직송, 렉별도출고, 4W용 CI | 있음 |
| MF 보강재 | `mfAmature`, `mfAptAmatureType` | MF 보강재/아파트 보강재 | 있음 |
| MF 핸들 | `mfHandle`, `mfHandleHsize` | 망핸들/높이 | 있음 |

## 2. 웹 저장 payload에 들어가는 필드 목록

웹은 `fnLayerSaveCmplWinEsti()`에서 `estiApi.saveCmplWinEsti(params)`로 `/ItgEstiOne/saveCmplWinEsti`를 호출한다.

### 기본/금액/식별

`itgEstiNo`, `estiNo`, `estiNos`, `estiSeq`, `inputId`, `updtId`, `mdlCd`, `bsmfOrdUtmCd`, `wintydiCd`, `ventLoc`, `crtnColrCd`, `ousdColrCd`, `insdColrCd`, `glasAdmsYn`, `rt`, `glasDblYn`, `qty`, `wSize`, `w0Size`, `hSize`, `h0Size`, `csSize`, `w1Size`, `w2Size`, `w3Size`, `w4Size`, `w5Size`, `h1Size`, `h2Size`, `h3Size`, `h4Size`, `h5Size`, `cs1Size`, `cs2Size`, `cs3Size`, `cs4Size`, `cs5Size`, `unpAplScn`, `saleUnp`, `m2Unp`, `ctgrCd`, `sizCd`, `bftydiCd`, `windLocCd`, `reqDt`, `bzpcWhotDt`, `reqTt`, `screenType`, `drwgCd`, `insdSf`, `ousdSf`, `remSrc`, `dplcDcGrd`, `sashOrdTypCd`, `appdocId`, `issueType`, `workDetail`, `erp2Save`, `innosysYn`.

### 유리/핸들/브래킷

`insdSfGlasMtrlCd`, `ousdSfGlasMtrlCd`, `insdBfGlasMtrlCd`, `ousdBfGlasMtrlCd`, `insdBrcktHMiddle`, `insdBrcktH`, `ousdBrcktH`, `insdHandleType`, `ousdHandleType`, `insd2FBrcktHMiddle`, `insd2FBrcktH`, `ousd2FBrcktH`, `insdHndlHMiddle`, `insdHndlH`, `ousdHndlH`, `insd2FHndlHMiddle`, `insd2FHndlH`, `ousd2FHndlH`, `glasStdalYn`, `glasAttachYn`.

### BF/SF/MF 옵션

`drnHoleYn`, `ventHoleYn`, `bfArmatureType`, `basedfillingPiecesYn`, `fillingPiecesYn`, `pdBfRemSrc`, `pdSfRemSrc`, `pdMfRemSrc`, `sfInsdVentHoleYn`, `sfOusdVentHoleYn`, `sfArmatureType`, `mfArmatureType`, `bfWeldNoneYn`, `bfMillingType`, `insdDeckNoneYn`, `ousdDeckNoneYn`, `insd2FDeckNoneYn`, `ousd2FDeckNoneYn`, `aluMfYn`, `aluMfHandleType`, `aluMfHndlH`, `aluMfMdlYn`, `bfThrSidePack`, `bfLxHiddenOptYn`, `bfLockCnt`, `windCloserMatYn`, `insdWindClsYn`, `ousdWindClsYn`, `insd2FWindClsYn`, `ousd2FWindClsYn`, `mfHandle`, `unqColrPolSaveYn`, `bfWeld`, `bfDirectShip`, `bfShipAddr`, `bfRackShip`, `bfWrapping`, `bfStopper`, `bfMillingUp`, `bfMillingDown`, `bfMillingLeft`, `bfMillingRight`, `bfMillingWing`, `bfMillingDetail`, `bfSideView`, `bfFmGbYn`, `bfFmGbShipYn`, `bfFmGbUpDownYn`, `bfFmGbRlYn`, `bfFmGbCutYn`, `bfFixBuild`, `bfFdHd`, `bfSsOpt`, `bfTurnDoorPullType`, `bfTurnDoorOneSideWrapType`, `bfOneSideWrapColrNm`, `bfAptCmType`, `bfApt1pjMethod`, `bfApt2pjLoc`, `bfApt2pjMethod`, `bfTurnDoorOnlyMakeYn`, `bfVentPiecesIncludeYn`, `bfVentHoleLctn`, `bfWinCbMilingType`, `bfWinOnefixUpHoleYn`, `bfWinFmThreeSideYn`, `bfWinTopBottomFmYn`, `bfWinSpDdlnShpmYn`, `bfIhyFixHghtDirYn`, `bfSlcnFnshYn`, `sfDirectShip`, `sfRackShip`, `sfLandscape`, `sfRoller`, `sfCreHook`, `sfCreSize`, `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfOppositeTypeYn`, `sfBrdProcYn`, `sfHandleProcYn`, `sfOutType0`, `sfOutType1`, `sfOutType2`, `sfOutType3`, `sfSontaLoca`, `sfShipAddr`, `sfOutGlasYn`, `sfOutGlasInfo`, `sfAptArmatureType`, `sfAptHandleType`, `mfDirectShip`, `mfRackShip`, `mfCi4wStickYn`, `mfHandleHsize`, `mfShipAddr`, `mfAptArmatureType`.

참고: 웹 코드에는 `bfForesidePack`, `bfKsmark` 저장 라인이 주석 처리되어 있으나 모바일 payload에는 포함되어 있다. 이 둘은 웹 저장 payload 기준으로는 필수 누락 필드가 아니다.

## 3. 모바일 form에 이미 있는 필드

### `SashFormMain.vue`

`mdlCd`, `mdlNm`, `mtrlCoNm`, `sizCd`, `wintydiCd`, `bsmfOrdUtmCd`, `insdSf`, `ousdSf`, `w`, `h`, `qty`, `w1`~`w5`, `h1`~`h5`, `cs`, `cs1`~`cs5`, `crtnColrCd`, `insdColrCd`, `ousdColrCd`.

### `SashOptionVent.vue`

`ventLoc`, `screenType`, `isAluMf`, `aluMfHandleType`, `aluMfMdlYn`, `aluMfHndlH`, `slcnFnshYn`.

### `SashOptionHandle.vue`

`alGlass`, `sashOrdTypCd`, `insdHandleType`, `ousdHandleType`, `insdHndlHEnabled`, `insdHndlH`, `ousdHndlHEnabled`, `ousdHndlH`, `secondHndlHEnabled`, `insd2FHndlH`, `ousd2FHndlH`, `insdBrcktHEnabled`, `insdBrcktH`, `ousdBrcktH`, `ousdBrcktHEnabled`, `insd2FBrcktH`, `ousd2FBrcktH`.

### `SashOptionGlass.vue`

`mtrlCds1`, `mtrlCds2`, `mtrlCds3`, `mtrlCds4`, `glasAttachYn`.

### `SashOptionFactory.vue`

`drnHoleYn`, `ventHoleYn`, `bfWeldNoneYn`, `bfWeld`, `fillingPiecesYn`, `basedfillingPiecesYn`, `bfRackShip`, `bfStopper`, `bfDirectShip`, `bfShipAddr`, `bfForesidePackYn`, `bfKsmarkYn`, `bfLxHiddenOptYn`, `bfArmatureType`, `bfLockCnt`, `bfWrapping`, `bfThrSidePack`, `bfMillingType`, `bfMillingDetail`, `bfMillingUp`, `bfMillingDown`, `bfMillingLeft`, `bfMillingRight`, `bfFmGbYn`, `bfFmGbShipYn`, `bfFmGbUpDownYn`, `bfFmGbRlYn`, `bfFmGbCutYn`, `bfSsOpt`, `bfFixBuild`, `bfFdHd`, `bfSideView`, `bfTurnDoorPullType`, `bfTurnDoorOneSideWrapType`, `bfOneSideWrapColrNm`, `bfAptCmType`, `bfApt1pjMethod`, `bfApt2pjLoc`, `bfApt2pjMethod`, `bfVentHoleLctn`, `bfWinCbMilingType`, `bfTurnDoorOnlyMakeYn`, `bfVentPiecesIncludeYn`, `bfWinOnefixUpHoleYn`, `bfWinFmThreeSideYn`, `bfWinTopBottomFmYn`, `bfWinSpDdlnShpmYn`, `bfIhyFixHghtDirYn`, `sfLandscape`, `sfArmatureType`, `sfOppositeTypeYn`, `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfBrdProcYn`, `sfHandleProcYn`, `sfRackShip`, `sfDirectShip`, `sfShipAddr`, `sfOutGlasYn`, `sfOutGlasInfo`, `winCloser`, `sfRoller`, `sfCreHook`, `sfCreSize`, `sfSontaLoca`, `sfAptArmatureType`, `sfAptHandleType`, `deco1`, `sfOutType`, `sfOutType0`, `sfOutType1`, `sfOutType2`, `sfOutType3`, `mfRackShip`, `mfCi4wStickYn`, `mfDirectShip`, `mfShipAddr`, `mfHandle`, `mfHandleHsize`, `mfArmatureType`, `mfAptArmatureType`.

### `SashNew.vue` 내부 상태/조회용

`bftydiCd`, `sizCd`, `ctgr2Cd`, `mtrlCoNm`, `sashGlasXMtrlYn`, `sashOrdTypCds`, `sashStandardYn`, `standardSpec`, 금액 표시 필드(`estiSalesUnpRt`, `estiSaleCst`, `estiSaleUnp`, `estiTotSaleUnp`, `estiTotSaleVat`, `estiTotSaleVatUnp`), 저장 후 조회 금액 원천 필드 일부(`bfSaleUnp`, `sfSaleUnp`, `mfSaleUnp`, `saleCstSum`, `sumConvCost`, `sumMtrlCost`, `rawAmt`, `convAmt`, `totSaleCst`, `totSum`), `remSrc`.

## 4. 모바일 payload에 이미 들어가는 필드

`src/utils/sashPayload.js`의 `buildSashSavePayload()`가 전송하는 필드:

### 기본/규격

`itgEstiNo`, `estiNo`, `estiNos`, `estiSeq`, `mdlCd`, `wintydiCd`, `bftydiCd`, `sizCd`, `bsmfOrdUtmCd`, `sashOrdTypCd`, `ctgrCd`, `windLocCd`, `rt`, `glasDblYn`, `unpAplScn`, `m2Unp`, `w0Size`, `h0Size`, `wSize`, `hSize`, `qty`, `w1Size`~`w5Size`, `h1Size`~`h5Size`, `csSize`, `cs1Size`~`cs5Size`, `crtnColrCd`, `insdColrCd`, `ousdColrCd`, `insdSf`, `ousdSf`, `ventLoc`, `screenType`, `remSrc`.

### 유리/안전망/핸들/브래킷

`aluMfYn`, `aluMfHandleType`, `aluMfMdlYn`, `aluMfHndlH`, `bfSlcnFnshYn`, `glasStdalYn`, `glasAttachYn`, `glasAdmsYn`, `insdHandleType`, `ousdHandleType`, `insdHndlHMiddle`, `insdHndlH`, `insd2FHndlHMiddle`, `insd2FHndlH`, `ousdHndlH`, `ousd2FHndlH`, `insdBrcktHMiddle`, `insdBrcktH`, `ousdBrcktH`, `insd2FBrcktHMiddle`, `insd2FBrcktH`, `ousd2FBrcktH`, `mtrlCds1`~`mtrlCds4`, `insdSfGlasMtrlCd`, `ousdSfGlasMtrlCd`, `insdBfGlasMtrlCd`, `ousdBfGlasMtrlCd`.

주의: `insd2FHndlH`, `ousd2FHndlH`는 독립 UI가 없으므로 신규 입력은 불가하다. 수정 저장에서 기존 DB 값을 빈 값으로 덮지 않도록 edit load 값 보존 용도로 payload에 포함한다.

### BF/SF/MF 옵션

`drnHoleYn`, `ventHoleYn`, `bfMillingType`, `bfArmatureType`, `bfLockCnt`, `bfWrapping`, `bfThrSidePack`, `bfMillingDetail`, `bfMillingUp`, `bfMillingDown`, `bfMillingLeft`, `bfMillingRight`, `bfWeldNoneYn`, `bfWeld`, `fillingPiecesYn`, `basedfillingPiecesYn`, `bfRackShip`, `bfStopper`, `bfDirectShip`, `bfShipAddr`, `bfForesidePack`, `bfKsmark`, `bfLxHiddenOptYn`, `bfSideView`, `bfFmGbYn`, `bfFmGbShipYn`, `bfFmGbUpDownYn`, `bfFmGbRlYn`, `bfFmGbCutYn`, `bfSsOpt`, `bfFixBuild`, `bfFdHd`, `bfTurnDoorPullType`, `bfTurnDoorOneSideWrapType`, `bfOneSideWrapColrNm`, `bfAptCmType`, `bfApt1pjMethod`, `bfApt2pjLoc`, `bfApt2pjMethod`, `bfVentHoleLctn`, `bfWinCbMilingType`, `bfTurnDoorOnlyMakeYn`, `bfVentPiecesIncludeYn`, `bfWinOnefixUpHoleYn`, `bfWinFmThreeSideYn`, `bfWinTopBottomFmYn`, `bfWinSpDdlnShpmYn`, `bfIhyFixHghtDirYn`, `sfLandscape`, `sfArmatureType`, `sfOppositeTypeYn`, `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfBrdProcYn`, `sfHandleProcYn`, `sfInsdVentHoleYn`, `sfOusdVentHoleYn`, `sfRackShip`, `sfDirectShip`, `sfShipAddr`, `sfOutGlasYn`, `sfOutGlasInfo`, `sfRoller`, `sfCreHook`, `sfCreSize`, `sfOutType`, `sfOutType0`, `sfOutType1`, `sfOutType2`, `sfOutType3`, `sfSontaLoca`, `sfAptArmatureType`, `sfAptHandleType`, `insdDeckNoneYn`, `ousdDeckNoneYn`, `insd2FDeckNoneYn`, `ousd2FDeckNoneYn`, `insdWindClsYn`, `ousdWindClsYn`, `insd2FWindClsYn`, `ousd2FWindClsYn`, `mfRackShip`, `mfCi4wStickYn`, `mfDirectShip`, `mfShipAddr`, `mfHandle`, `mfHandleHsize`, `mfArmatureType`, `mfAptArmatureType`.

## 5. 모바일 누락/구현 상태 필드

| 웹 payload 필드 | 웹 의미 | 모바일 form | 모바일 payload | 백엔드 기본값 | 판단 |
|---|---|---:|---:|---:|---|
| `inputId`, `updtId` | 작성/수정자 | 없음 | 없음 | 있음: 로그인 사용자로 세팅 | 문제 없음 |
| `dplcDcGrd` | 할인등급 | 없음 | 없음 | 있음: 헤더에서 조회 | 문제 없음 |
| `reqDt`, `bzpcWhotDt`, `reqTt` | 요청/출고 일자/시간 | 없음 | 없음 | 있음: 오늘/빈값 | 문제 없음 |
| `saleUnp` | 단가 | 없음 | 없음 | 있음: `0` | 문제 없음 |
| `drwgCd` | 도면코드 | 있음 | 있음 | 있음: 창형태+VENT로 조회 | HIGH 보강 완료: stale 도면코드 방지 |
| `appdocId` | 승인문서 | 없음 | 없음 | 빈값 | LOW 누락 |
| `issueType` | 이슈/승인 유형 | 없음 | 없음 | 빈값 | LOW 누락 |
| `workDetail`, `erp2Save`, `innosysYn` | 작업로그/ERP2 플래그/시스템 플래그 | 없음 | 없음 | 없음 | LOW 또는 서버 내부 처리 대상 |
| `unqColrPolSaveYn` | 유일색상 정책 저장 여부 | 없음 | 없음 | `N` | LOW 누락 |
| `glasAttachYn` | 실리콘 마감여부 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `basedfillingPiecesYn` | 견적테이블 휠링피스 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `pdBfRemSrc`, `pdSfRemSrc`, `pdMfRemSrc` | 생산비고 자동 생성 | 없음 | 자동 생성/기존값 보존 | 기존값 보존 | HIGH 1차 보강 완료: `sashPayload.js`에서 BF 밀링/기본옵션/특수창, SF 장식X/윈드클로저/외짝, MF 망핸들/안전망 비고 자동 생성 |
| `sfInsdVentHoleYn`, `sfOusdVentHoleYn` | SF 내/외 통기홀 | 있음 | 있음 | `N` | 구현 완료 |
| `sfArmatureType` | 일반 SF 보강재 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |
| `mfArmatureType` | 일반 MF 보강재 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |
| `insd2FHndlH`, `ousd2FHndlH` | 2층 내/외 핸들높이 | 있음 | 있음 | 빈값 | 구현 완료 |
| `bfMillingWing` | 웹 밀링유형 원 필드 | 없음 | 있음 | `bfMillingType`과 동일 | 구현 완료 |
| `windCloserMatYn` | 윈드클로저 자재 여부 | 없음 | 있음 | `N` | HIGH 범위에서 반영됨. 이번 MEDIUM 작업 제외 |
| `insd2FWindClsYn`, `ousd2FWindClsYn` | 2층 윈드클로저 | 있음 | 있음 | `N` | 구현 완료 |
| `bfVentHoleLctn` | BF 경첩타공위치 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |
| `bfWinCbMilingType` | BF 통바밀링 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |
| `sfInsideRightBrdYn` | SF 내부우측매립 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `sfMcOneReqYn` | SF MC1개 요청 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `sfBrdProcYn` | SF 매립가공 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `sfHandleProcYn` | SF 핸들가공 | 있음 | 있음 | `N` | MEDIUM 구현 완료 |
| `sfAptArmatureType` | SF 아파트 보강재 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |
| `sfAptHandleType` | SF 아파트 핸들 | 있음 | 있음 | 빈값 | MEDIUM 구현 완료 |

## 6. 누락 필드별 우선순위

### HIGH

| 필드 | 이유 |
|---|---|
| `pdBfRemSrc`, `pdSfRemSrc`, `pdMfRemSrc` | 1차 구현 완료. 웹 `remWrite()`, `optionMultiSelect()`, `optionWrite()` 중 모바일에 이미 있는 BF 밀링/기본옵션/특수창, SF 장식X/윈드클로저/외짝, MF 망핸들/안전망을 `sashPayload.js`에서 저장 직전 자동 생성한다. 웹 전체 옵션 자동 생성은 아직 남아 있다. |
| `insd2FHndlH`, `ousd2FHndlH` | 구현 완료. `SashOptionHandle.vue`에 2층 내/외 핸들높이 독립 UI를 추가했고 payload/save restore에 반영했다. |
| `bfMillingWing` | 구현 완료. `sashPayload.js`에서 `bfMillingType`과 같은 값으로 전송한다. |

### MEDIUM

상태: `windCloserMatYn`은 HIGH 범위에서 이미 반영된 것으로 보고 이번 MEDIUM 작업에서는 수정하지 않았다. 나머지 MEDIUM 대상 12개 필드는 프론트 구현과 payload 반영을 완료했다.

| 필드 | 이유 |
|---|---|
| `glasAttachYn` | 구현 완료. 웹 화면명은 `실리콘 마감여부`이며, `SashOptionGlass.vue` UI, form 기본 `false`, 수정 복원, payload `Y/N` 반영. |
| `basedfillingPiecesYn` | 구현 완료. `SashOptionFactory.vue` BF 기본 옵션, form 기본 `false`, 수정 복원, payload `Y/N` 반영. |
| `sfArmatureType`, `mfArmatureType` | 구현 완료. 생산옵션 영역에서 선택하고, 기본값은 빈값으로 payload에 명시한다. |
| `windCloserMatYn` | 이번 MEDIUM 작업 제외. HIGH 범위에서 `sashPayload.js`에 이미 반영된 상태로 본다. |
| `bfVentHoleLctn` | 구현 완료. BF 터닝도어/케이스먼트 영역에 경첩타공위치 입력을 추가했다. |
| `bfWinCbMilingType` | 구현 완료. BF 아파트 영역에 통바밀링 선택을 추가했다. 필드명은 웹/백엔드의 `Miling` 형태를 유지한다. |
| `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfBrdProcYn`, `sfHandleProcYn` | 구현 완료. SF 옵션 토글로 추가했고 payload 기본값은 모두 `N`이다. |
| `sfAptArmatureType`, `sfAptHandleType` | 구현 완료. SF 아파트 보강재/핸들 선택을 추가했고 기본값은 빈값이다. |

### MEDIUM 수동 검증 상태

체크리스트 작성 후 실제 `itgEstiNo` 기반 저장/조회 검증을 수행했다.

2026-06-01 확인 결과 백엔드 `http://localhost:2026`, 모바일 `http://localhost:5180`, 웹 `http://localhost:4831`이 응답했고, 모바일 로그인 계정으로 실제 데이터를 생성했다. 상세 기록은 `docs/mobile-sash-manual-verification.md`의 "G. 실제 검증 시도 결과 - 2026-06-01"을 기준으로 한다.

검증 식별자:

| 항목 | 값 |
|---|---|
| `itgEstiNo` | `TE2026060100003` |
| `estiNo` | `EE2026060100003` |
| `estiNos` | `1` |
| `estiSeq` | `1` |

| 검증 목표 | 확인 방법 | 상태 |
|---|---|---|
| 모바일 신규 저장 payload 12개 필드 포함 | `POST /mobile/esti/sash/save` request payload 확인 | 완료 |
| 모바일 상세 재조회 복원 | `POST /mobile/esti/sash/detail` 응답과 입력값 비교 | 완료 |
| 수정 저장 후 값 유지 | 같은 `estiSeq`로 `qty`만 `1 -> 2` 수정 저장 후 재조회 | 완료 |
| 웹 CA_NERP2 견적 상세 조회 | 같은 `itgEstiNo`, `estiNo`, `estiSeq`로 `searchEstiClWindInfoAjax` 조회 | API 기준 완료, 브라우저 화면 미확인 |
| 웹 재저장 후 모바일 값 유지 | `/ItgEstiOne/saveCmplWinEsti` 직접 호출 시도 | 미완료. HTTP 500 `MyBatisSystemException` |

남은 7단계 확인:

- 웹 브라우저에서 `TE2026060100003`을 열어 `SashForm.vue` 화면 표시를 직접 확인
- 웹 저장 버튼의 실제 Network payload로 `/ItgEstiOne/saveCmplWinEsti` 재검증
- 직접 API 호출 payload와 웹 화면 저장 payload 차이 비교

웹 화면에서 조건부 확인이 필요한 필드:

| 필드 | 주의사항 |
|---|---|
| `bfVentHoleLctn` | BF 터닝도어/케이스먼트 계열 조건에서만 화면 확인이 가능할 수 있다. |
| `bfWinCbMilingType` | BF 아파트/특수창 조건에서만 화면 확인이 가능할 수 있다. |
| `sfAptArmatureType`, `sfAptHandleType` | SF 아파트 옵션이 노출되는 모형에서만 화면 확인이 가능할 수 있다. |
| `sfArmatureType`, `mfArmatureType` | 웹 보강재 UI가 모형/자재 조건에 의해 비활성 또는 숨김 처리될 수 있다. |

화면에서 보이지 않는 경우 웹 조회 API 응답, 웹 저장 payload, 백엔드 프로시저 파라미터 로그의 원천 필드값으로 대체 확인한다.

### LOW

| 필드 | 이유 |
|---|---|
| `appdocId`, `issueType` | 승인/이슈 연계성 필드로 보이며 백엔드 빈값 기본으로 저장 가능하다. |
| `workDetail`, `erp2Save`, `innosysYn` | 웹 작업로그/시스템 플래그 성격이다. 모바일 서버에서 별도 처리하는 편이 적합하다. |
| `unqColrPolSaveYn` | 특수 색상 정책 플래그다. 백엔드 기본 `N`으로 저장 가능하다. |
| `sfInsdVentHoleYn`, `sfOusdVentHoleYn` | 구현 완료. `SashOptionFactory.vue` SF 영역에 내/외 통기홀 토글을 추가했고 payload 기본값은 `N`이다. |
| `insd2FWindClsYn`, `ousd2FWindClsYn` | 구현 완료. 윈드클로저 토글을 내창/외창/2층내창/2층외창으로 확장했고 payload 기본값은 `N`이다. |

## 7. 각 필드의 구현 위치 추천

| 필드/그룹 | 추천 위치 | 비고 |
|---|---|---|
| `insd2FHndlH`, `ousd2FHndlH` | `SashOptionHandle.vue`, `SashNew.vue`, `sashPayload.js` | 구현 완료. 2층 내/외 핸들높이 독립 UI와 payload를 추가했다. |
| `pdBfRemSrc`, `pdSfRemSrc`, `pdMfRemSrc` | `SashNew.vue` form 초기값, `sashPayload.js`, 편집 로드 매핑 완료. 1차 자동 생성은 `sashPayload.js`에 구현 | 모바일 프론트 UI는 추가하지 않았다. 저장 직전 payload에서 BF 밀링/기본옵션/특수창, SF 장식X/윈드클로저/외짝, MF 망핸들/안전망 비고를 생성한다. 자동 생성할 옵션이 없으면 수정 로드된 기존 비고를 보존한다. |
| `bfMillingWing` | `sashPayload.js` | `bfMillingType`과 같은 값을 같이 전송하도록 맞추는 것이 가장 작다. 편집 로드도 `bfMillingType`/`bfMillingWing` alias를 유지한다. |
| `windCloserMatYn` | `sashPayload.js` 또는 `MobileEstiService.fillSashDefaults()` | HIGH 범위에서 이미 반영된 것으로 보고 이번 MEDIUM 작업에서는 수정하지 않았다. |
| `glasAttachYn` | `SashOptionGlass.vue`, `SashNew.vue`, `sashPayload.js` | 구현 완료. 웹 화면명 `실리콘 마감여부`로 표시한다. 내부 필드명/도메인 주석의 유리부착 표현은 저장 필드명으로만 유지한다. |
| `basedfillingPiecesYn` | `SashOptionFactory.vue`, `SashNew.vue`, `sashPayload.js` | 구현 완료. 수정 로드에서 받아 payload로 되돌려 보낸다. |
| `sfArmatureType`, `mfArmatureType` | `SashOptionFactory.vue`, `SashNew.vue`, `sashPayload.js` | 구현 완료. BF 보강재와 같은 생산옵션 영역에 배치했다. |
| `bfVentHoleLctn` | `SashOptionFactory.vue`의 BF 터닝도어 영역, `SashNew.vue`, `sashPayload.js` | 구현 완료. |
| `bfWinCbMilingType` | `SashOptionFactory.vue`의 BF 아파트 영역, `SashNew.vue`, `sashPayload.js` | 구현 완료. 웹 필드명이 `Miling` 오타 형태이므로 백엔드 도메인명과 동일하게 맞췄다. |
| `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfBrdProcYn`, `sfHandleProcYn` | `SashOptionFactory.vue`의 SF 영역, `SashNew.vue`, `sashPayload.js` | 구현 완료. 기존 `sfOppositeTypeYn` 주변에 SF 옵션 그룹으로 추가했다. |
| `sfAptArmatureType`, `sfAptHandleType` | `SashOptionFactory.vue`의 SF 영역, `SashNew.vue`, `sashPayload.js` | 구현 완료. 모바일의 `mfAptArmatureType` 패턴과 맞췄다. |
| `appdocId`, `issueType`, `unqColrPolSaveYn` | 백엔드 기본 유지 또는 편집 로드 보존값 payload pass-through | 화면 입력보다는 조회값 보존/서버 처리 대상이다. |
| `sfInsdVentHoleYn`, `sfOusdVentHoleYn`, `insd2FWindClsYn`, `ousd2FWindClsYn` | `SashOptionFactory.vue`, `SashNew.vue`, `sashPayload.js` | 구현 완료. SF 통기홀과 2층 윈드클로저 토글을 추가했다. |
| `workDetail`, `erp2Save`, `innosysYn` | `MobileEstiService.saveSashEsti()` 내부 | 사용자/시스템 컨텍스트에서 서버가 채우는 편이 맞다. |

## 8. MobileEstiService.fillSashDefaults 보강 필요 여부

결론: HIGH 항목 중 생산비고는 1차 범위가 프론트 payload에서 보강되었다. 이번 MEDIUM 단계의 12개 필드는 프론트 payload에서 명시 기본값을 보내므로 `MobileEstiService.fillSashDefaults()` 보강 없이 진행했다.

현재 `MobileEstiService.saveSashEsti()`는 모바일 저장 안정성을 위해 이미 다음을 보강한다.

- `inputId`, `updtId`: 로그인 사용자로 세팅
- `estiNo`: 헤더의 `wEstiNo` 또는 신규 발번
- `dplcDcGrd`: 헤더에서 조회하고 `S` 등급 저장 차단
- `crtnColrCd`: `WH`
- `insdSf`, `ousdSf`: 모형 기준 자동 조회
- `mtrlCds1`~`mtrlCds4`: 유리자재 자동 조회
- 유리두께: 모형 기본 유리에서 조회
- `drwgCd`: `wintydiCd + ventLoc`로 자동 조회
- `reqDt`, `bzpcWhotDt`, `windLocCd`, 고정값/기본값 다수
- `fillSashDefaults()`: 약 170개 프로시저 파라미터 null 방지 기본값

추가 보강이 필요한 항목:

| 항목 | 필요 여부 | 권장 방식 |
|---|---:|---|
| `pdBfRemSrc`, `pdSfRemSrc`, `pdMfRemSrc` | 부분 완료 | 1차 범위는 프론트 payload에서 생성한다. 웹 전체 `optionWrite()` parity가 필요하면 서버 공통 함수 또는 백엔드 기본값 생성으로 확대 검토한다. |
| `bfMillingWing` | 필요 | `bfMillingType`이 있고 `bfMillingWing`이 비어 있으면 같은 값으로 세팅한다. |
| `windCloserMatYn` | 이번 단계 제외 | HIGH 범위에서 이미 반영된 것으로 보고 백엔드는 수정하지 않았다. |
| 2층 핸들높이 | 서버만으로는 한계 | 값 자체가 모바일에 없으므로 프론트 필드 추가가 필요하다. 서버는 빈값 기본만 가능하다. |
| `glasAttachYn`, `basedfillingPiecesYn`, `sfInsideRightBrdYn`, `sfMcOneReqYn`, `sfBrdProcYn`, `sfHandleProcYn` | 불필요 | 프론트 payload에서 명시적으로 `Y/N`을 보낸다. 미선택 기본값은 `N`이다. |
| `sfArmatureType`, `mfArmatureType`, `bfVentHoleLctn`, `bfWinCbMilingType`, `sfAptArmatureType`, `sfAptHandleType` | 불필요 | 프론트 payload에서 명시적으로 빈값 또는 선택값을 보낸다. |

우선 실행 순서 추천:

1. 생산비고 자동 생성 1차 범위의 실제 모바일 저장 후 웹 조회를 수행한다.
2. 웹 `optionWrite()` 전체 범위가 필요한 옵션을 업무 우선순위로 분리한다.
3. `appdocId`, `issueType`, `unqColrPolSaveYn` 등 고급 업무 필드의 모바일 노출 필요성을 확인한다.
4. LOW 항목은 실제 업무 사용 빈도 확인 후 별도 단계로 판단한다.
