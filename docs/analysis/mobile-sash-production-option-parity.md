# Mobile sash production option parity analysis

Date: 2026-06-12

## 1. Scope/source files

This report compares the web sash estimate form with the current mobile sash estimate form. It is intentionally analysis-only; no runtime code changes are included.

Web reference:

- `/mnt/c/Projects/CA_NERP/workspace/CA_NERP2/vue/src/components/modal/order/sale/estimate/SashForm.vue`

Mobile files:

- `src/views/SashNew.vue`
- `src/components/SashOptionFactory.vue`
- `src/utils/sashPayload.js`
- `src/views/SashNew.test.js`
- `src/utils/sashPayload.test.js`

Out of scope:

- `SashForm2.vue`
- `EstimateDetail.vue`
- `EstimateList.vue`
- backend or mapper changes

## 2. Web BF/SF/MF production option inventory

### BF

`SashForm.vue` defines `bfDefaultList` with 직송, 렉별도출고, 절단바로(용접X), 배수홀, 통기홀, 상하휠링피스, ㄱㄴ용접, 4면포장, 스토퍼부착, KS마크, LX히든, 라인제로. The BF 통기홀 item is `bfDefaultList[4]`, column `VENT_HOLE_YN`, default `selected: false`, `disabled: true` (`SashForm.vue:2288-2300`).

Additional BF groups include:

- 락 개수: 1개, 2개
- 보강재: 기본, 4면
- 랩핑: ㄱ자, ㄷ자
- 3면포장: 백색, 래핑
- 밀링유형: 밀링안함, 반밀링, 날개
- 밀링상세: 전체, 내부, 외부, plus 부분 for 날개 in the UI flow
- 밀링위치: 상, 하, 좌, 우
- BF 특수창: FM-X,GB-X, FM/GB 길게 별도 출고, FM/GB상하작업, FM/GB좌우작업, FM상하일자절단, SS일자절단/연결구, FIX외부시공, 풀다운핸들
- 방향: 100면보이게, 40면 보이게
- 터닝도어: 좌경첩/우경첩, 당기는문/미는문, 일면래핑색상
- 케이스먼트: 1짝/2짝, 방식, 위치
- 문짝만 제작, 경첩/타공 위치, 통바밀링
- 아파트 BF: 1FIX 상부유리타공, FM/GB-X 3면, 상하부만 FM작업, SP마감출고, 이형픽스 높이 방향설정, 실리콘마감O

### SF

Web SF groups include:

- 기본: 직송, 렉별도출고, SP가로작업, 외주유리
- 크리고리
- 로라: 쌍로라, 조절로라
- 크리센트: 소, 대
- 장식X: 1층내, 1층외, 2층내, 2층외
- 윈드클로저: 내창, 외창, plus saved fields for 2층내/2층외
- SF 옵션: 내부우측매립, MC1개요청, 반대타입, 매립가공, 핸들가공
- 손타위치: 양면, 외부면, 2/3번 양면, 2/3번 내부, 좌측/우측, 좌측양면/우측양면
- 외짝: 1W/2W/3W/4W and per-window position options
- 아파트 SF 보강재: 4면보강
- 아파트 SF 핸들: 고정, 그립, 반자동, 크리센트+고정, 커플핸들, 양방향

### MF

Web MF groups include:

- 기본: 직송, 렉별도출고, 4W용 CI부착
- 방충망핸들: 없음, 매립
- MF 아파트 보강재: 4면보강
- ALU 안전망 related MF production remark is generated when safety net handle information exists.

## 3. Mobile BF/SF/MF production option inventory

Mobile `SashOptionFactory.vue` currently exposes the main parity fields:

### BF

- BF 기본: 배수홀, 통기홀, 절단바로, ㄱㄴ용접, 상하휠링피스, 기존 휠링피스, 렉별도출고, 스토퍼부착, 직송, 4면포장, KS마크, LX히든
- Selects: 보강재, 락 개수, 랩핑, 3면포장
- 밀링유형, 밀링상세, 밀링위치 상/하/좌/우
- BF 특수창, 방향, 터닝도어, 케이스먼트, 통바밀링, 아파트 BF options

The BF 통기홀 UI is bound to `form.ventHoleYn` and disabled by `!form.ventHoleEnabled` (`SashOptionFactory.vue:20-21`).

### SF

- SF 기본: SP 가로작업, 반대타입, 내부우측매립, MC1개요청, 매립가공, 핸들가공, 렉별도출고, 직송, 외주유리
- Selects/multi options: SF 보강재, 윈드클로저, 로라, 크리센트, 손타위치, 외짝, 아파트 보강재, 아파트 핸들, 장식X
- SF 통기홀: `sfInsdVentHoleYn`, `sfOusdVentHoleYn` are exposed as user-editable toggles without a visible auth condition (`SashOptionFactory.vue:266-267`).

### MF

- MF 기본: 렉별도출고, 4W용 CI부착, 직송
- Selects: MF 보강재, 망핸들, 망핸들높이, MF 아파트 보강재

Mobile also renders selected production options as summary chips. The chips are display-only and do not affect payload generation.

## 4. BF 통기홀 parity 분석

### Web behavior

Web BF 통기홀 defaults to disabled/off through `bfDefaultList[4]` (`SashForm.vue:2293`).

Web turns BF 통기홀 on and enables it in two cases:

1. Color selection with `addInfo10 === "Y"`:
   - Inner color applies for both single and double window.
   - Outer color applies only for double window.
   - Matching color sets `bfDefaultList[4].selected = true` and `disabled = false`.
   - Non-matching color sets selected false and disabled true (`SashForm.vue:4083-4091`).

2. Model/window type `bftydiCd === "119"`:
   - In model selection flow, ASA model sets BF 통기홀 selected true and disabled false (`SashForm.vue:4888-4891`, `4911-4913`).

Web save payload serializes `ventHoleYn` from `bfDefaultList[4].selected` (`SashForm.vue:3048-3049`, `8688-8711` found by search).

### Mobile behavior

Initial mobile form state matches web default: `ventHoleYn: false`, `ventHoleEnabled: false` (`SashNew.vue:241-243`).

Color selection behavior mostly matches web:

- `applyVentHoleColorRule()` sets `ventHoleEnabled = true` and `ventHoleYn = true` when `addInfo10 === "Y"` and target is inner or target is outer on double-window (`SashNew.vue:1108-1120`).
- Otherwise it clears/enables false (`SashNew.vue:1113-1115`).

ASA model behavior does not fully match web:

- `isVentHoleAllowed()` returns true when `bftydiCd === '119'` (`SashNew.vue:1374-1376`).
- `applyProductionOptionRules()` uses that to enable the toggle, but does not set `ventHoleYn = true` (`SashNew.vue:1387-1389`).
- `applyProductionOptionDefaults()` explicitly resets `form.value.ventHoleYn = false` on model pick (`SashNew.vue:1458-1461`).

Conclusion: mobile enables BF 통기홀 for ASA but does not auto-select it. This differs from web, which auto-selects ASA BF 통기홀.

## 5. SF 통기홀 parity 분석

### Web behavior

Web initializes `sfInsdVentHoleYn` and `sfOusdVentHoleYn` to `'N'` (`SashForm.vue` search hits around data init and reset).

Color popup selection applies SF 통기홀 only when `userAuthType == "SysAdm"`:

- Inner color with `addInfo16 == 'Y'` sets both `sfInsdVentHoleYn` and `sfOusdVentHoleYn` to `'Y'`; otherwise both are set to `'N'` (`SashForm.vue:4113-4120`).
- Outer color with `addInfo16 == 'Y'` sets only `sfOusdVentHoleYn` to `'Y'`; otherwise it is set to `'N'` (`SashForm.vue:4145-4150`).

Saved/edit-loaded values are restored from API result (`SashForm.vue` search hits around `6107-6116`).

### Mobile behavior

Mobile initializes both SF 통기홀 flags to false (`SashNew.vue:311-312`) and serializes them as `Y/N` in payload (`sashPayload.js:405-406`).

Mobile exposes both toggles directly in `SashOptionFactory.vue` without checking `userAuthType` or `SysAdm` (`SashOptionFactory.vue:266-267`). Mobile color selection currently preserves `addInfo16` metadata (`SashNew.vue` search hit), but the inspected logic does not use `addInfo16` to update `sfInsdVentHoleYn` or `sfOusdVentHoleYn`.

Conclusion: mobile differs from web in two ways:

- It allows all visible users to manually toggle SF 통기홀.
- It does not implement web's SysAdm-only `addInfo16` auto-setting behavior.

Whether this is a bug or intended mobile simplification requires product confirmation. From strict web parity, it is a mismatch.

## 6. 생산비고 pdBfRemSrc/pdSfRemSrc/pdMfRemSrc 생성 비교

### BF

Web `optionWrite()` excludes BF 배수홀, BF 통기홀, LX히든 from normal BF default remark loop. For 배수홀, it only writes `물구멍 X` when 배수홀이 off. For 통기홀, no production remark is generated (`SashForm.vue:7105-7133`).

Mobile `buildBfProductionRemark()` matches the important 통기홀 rule: it does not append `ventHoleYn` to `pdBfRemSrc`; it does append `물구멍 X` when `drnHoleYn` is explicitly no (`sashPayload.js:67-80`).

Known minor text differences:

- Mobile includes `기존 휠링피스` in BF remark when selected (`sashPayload.js:75-76`). Web sets/restores `basedfillingPiecesYn`, but the inspected web `optionWrite()` does not clearly add this text from `bfDefaultList`.
- Mobile chip labels are display-only and may use shorter labels than web remarks, but payload remark generation is separate.

### SF

Web SF production remark is built from deco, wind closer, SF default list, SF option list, 외짝, 로라, 크리센트, 크리고리, 손타위치, 보강재, LX/HC handle special text, and LX hidden derived text (`SashForm.vue:7022-7099`, `7407-7581`).

Mobile `buildSfProductionRemark()` covers the same major groups: deco, wind closer, 외짝, SP 가로작업, 렉별도출고, 직송, 외주유리 사양, 내부우측매립, MC1개요청, 반대타입, 매립가공, 핸들가공, 로라, 크리센트, 크리고리, 손타위치, 4면보강, LX/HC handle text, and LX hidden text (`sashPayload.js:153-205`).

SF 통기홀 is payload-only in both implementations and is not included in production remark generation.

### MF

Web MF remark uses MF 기본, 방충망핸들/높이, MF 아파트 보강재, and ALU safety-net handle text (`SashForm.vue:7591-7672`).

Mobile `buildMfProductionRemark()` covers direct ship, rack ship, 4W용 CI부착, 방충망핸들/높이, 4면보강, and safety-net handle text (`sashPayload.js:208-220` plus following safety-net block).

## 7. 확정 버그 / 의심 버그 / 의도된 차이 구분

### 확정 버그

1. ASA model BF 통기홀 auto-ON mismatch
   - Web: `bftydiCd === "119"` sets BF 통기홀 selected true and enabled.
   - Mobile: `bftydiCd === '119'` only enables the toggle through `isVentHoleAllowed()`, but `applyProductionOptionDefaults()` resets `ventHoleYn` to false.
   - Impact: ASA model save payload can send `ventHoleYn: 'N'` unless user manually toggles it, unlike web.

### 의심 버그

1. SF 통기홀 auth parity
   - Web updates SF 통기홀 from color `addInfo16` only for `SysAdm`.
   - Mobile exposes SF 통기홀 toggles to all visible users and does not apply `addInfo16` automatically.
   - Needs confirmation: mobile may intentionally expose more direct controls, but this is not web parity.

2. SF 통기홀 color auto-setting missing
   - Mobile preserves `addInfo16` in selected color metadata, so the data is available.
   - No matching logic updates `sfInsdVentHoleYn`/`sfOusdVentHoleYn` on color selection.

3. BF 통기홀 color clearing may override ASA allowance
   - Mobile `applyVentHoleColorRule()` clears `ventHoleYn` and disables it when selected color is not `addInfo10 === 'Y'`.
   - If the model is ASA (`bftydiCd === '119'`), web model rule selects/enables BF 통기홀. Need runtime confirmation whether a subsequent non-`addInfo10` color selection should be allowed to clear ASA 통기홀 in web. The inspected web color rule would clear it, but model selection also sets it. The effective order matters.

### 의도된 차이 가능성

1. Mobile production option chips
   - Chips are a mobile display aid, not a web behavior. They do not affect payload.

2. Mobile section split
   - Mobile splits BF/SF/MF into separate closed details sections. This is UX-only and does not affect parity.

## 8. 수정 제안

Recommended low-risk fixes, after approval:

1. Fix ASA BF 통기홀 default
   - In `applyProductionOptionDefaults(row)`, set `ventHoleYn` to true when `row.bftydiCd === '119'` or current `form.value.bftydiCd === '119'`.
   - Keep `ventHoleEnabled` controlled by `applyProductionOptionRules()`.
   - Add source/unit test asserting ASA model selection sets both enabled and selected.

2. Add a dedicated SF vent hole color rule only if web parity is required
   - Add a function similar to `applyVentHoleColorRule()`, but for `addInfo16`.
   - Apply only when current user auth is `SysAdm`, matching web.
   - For inner color: set both SF flags.
   - For outer color: set only outside SF flag.
   - This requires confirming whether mobile has reliable user auth group data in `SashNew.vue`.

3. Keep BF 통기홀 out of production remarks
   - No change recommended. Current mobile payload remark behavior matches web's exclusion of BF 통기홀 from `pdBfRemSrc`.

4. Keep save payload shape unchanged
   - Continue serializing `ventHoleYn`, `sfInsdVentHoleYn`, and `sfOusdVentHoleYn` as existing Y/N fields.

## 9. 필요한 테스트 목록

Add or update tests after implementation approval:

1. `src/views/SashNew.test.js`
   - ASA model (`bftydiCd === '119'`) selection sets `form.ventHoleYn = true`.
   - ASA model enables BF 통기홀.
   - Non-ASA model keeps BF 통기홀 disabled/off unless selected color `addInfo10 === 'Y'`.
   - Color `addInfo10 === 'Y'` still sets BF 통기홀 selected/enabled for inner and double-window outer cases.
   - Color without `addInfo10 === 'Y'` clears BF 통기홀 for non-ASA cases.

2. `src/utils/sashPayload.test.js`
   - `ventHoleYn: true` serializes to `Y`; false serializes to `N` (existing coverage already present).
   - BF production remark does not include `통기홀` when `ventHoleYn` is true.
   - BF production remark still includes `물구멍 X` when `drnHoleYn` is false.
   - SF vent hole flags serialize to Y/N (existing coverage already present).

3. If SF SysAdm parity is implemented:
   - SysAdm + inner color `addInfo16 === 'Y'` sets both SF vent hole fields.
   - SysAdm + outer color `addInfo16 === 'Y'` sets only outside SF vent hole field.
   - Non-SysAdm color selection does not auto-change SF vent hole fields.
   - Decide whether non-SysAdm should see disabled/hidden SF vent hole controls and test that policy.
