# Mobile Sash Validation Matrix

## Scope

This document tracks the first stabilization pass for `CA_NERP_MOBILE_TWO` as the mobile frontend connected to `/mnt/c/Projects/CA_NERP/workspace/CA_NERP2`.

The immediate goal is to make sash estimate save/edit behavior repeatable before adding door, glass, molding, order conversion, or broader mobile ERP flows.

## Integration Map

| Flow | Frontend | API | CA_NERP2 backend | Expected side effect |
|---|---|---|---|---|
| Login | `src/views/Login.vue`, `src/stores/auth.js` | `POST /mobile/auth/login` | `MobileAuthController.login` | JWT returned and saved in `ca_nerp_mobile_auth` |
| Verify auth | `src/api/auth.js` | `POST /mobile/auth/verify` | `MobileAuthController.verify` | Token user info restored |
| Select sales office | `src/components/BzpcSelector.vue` | `POST /BzpcMng/searchBzpcChoiceAjax` | existing `BzpcMngController` flow | Office list filtered by authority |
| Search client | `src/components/DplcSearchModal.vue` | `POST /mobile/dplc/list` | `MobileDplcController.searchDplcList` -> `MobileDplcService.searchDplcList` | Existing `BzpcDplcMngService.searchBzpcDplcAjax` result returned |
| Save estimate header | `src/views/EstimateNew.vue` | `POST /mobile/esti/header/save` | `MobileEstiController.saveEstiHeader` -> `MobileEstiService.saveEstiHeader` | `TWE_ITG_ESTI_H` header saved through existing service |
| Issue sash number | `src/views/EstimateDetail.vue` | `POST /mobile/esti/header/issueEstiNo` | `MobileEstiController.issueEstiNo` -> `MobileEstiService.issueEstiNo` | Wind estimate header number created for `wEstiNo` |
| Load sash masters | `src/views/SashNew.vue` | `/mobile/esti/model/*`, `/mobile/esti/code/list`, `/mobile/esti/color/list`, `/mobile/esti/glas/list` | `MobileEstiController` plus existing model/estimate services | Model, window type, SF, glass, code, color options returned |
| Save sash | `src/views/SashNew.vue`, `src/utils/sashPayload.js` | `POST /mobile/esti/sash/save` | `MobileEstiController.saveSashEsti` -> `MobileEstiService.saveSashEsti` | `saveItgEstiProcCall` then `saveItgEstiProcCall2` execute STEP1/STEP2 |
| List sash | `src/views/EstimateDetail.vue` | `POST /mobile/esti/sash/list` | `MobileEstiService.searchSashList` | Existing `searchEstiAjax` result deduped by frontend |
| Edit sash detail | `src/views/SashNew.vue` | `POST /mobile/esti/sash/detail` | `MobileEstiService.selectSashDetail` | `EstiClWindInfo` returned as reflection map |

## Manual Validation Cases

| Case | Input | Expected result | Status |
|---|---|---|---|
| Login succeeds | Known active ERP user ID/password | `/estimates` opens, token saved | Not run |
| Header save succeeds | Sales office, client, title, valid date | `resultCd=save.ok`, `itgEstiNo` returned | Not run |
| Sash number issue is idempotent | Same `itgEstiNo`, `itgTypeChk=wind` twice | First call returns `issue.ok`; repeat should not create a duplicate wind header | Not run |
| New sash save succeeds | Valid model, W/H, qty, colors, SF material | `resultCd=save.ok`, `estiSeq` returned | Not run |
| Sash list displays one row per sequence | Header with at least one sash | Duplicate material rows are collapsed in `EstimateDetail.vue` | Not run |
| Edit sash loads existing values | Open list row with `estiSeq` | W/H, colors, SF, glass, vent, handle fields load | Not run |
| Edit save preserves sequence | Save existing row | Same `estiSeq` is sent, no new sequence created | Not run |

## Current Automated Coverage

| Test | Command | Coverage |
|---|---|---|
| Sash payload mapping | `npm test -- src/utils/sashPayload.test.js` | Verifies new-save and edit-save payload keys sent to `/mobile/esti/sash/save` |
| Production build | `npm run build` | Verifies Vue/Vite compilation |

## Known Risks

| Risk | Why it matters | Next action |
|---|---|---|
| `issueEstiNo` reuse path has commented existing wind lookup | Re-entering sash creation after a wind number exists may return `estiNo.use` instead of reusing the number | Validate manually, then fix in `CA_NERP2` if reproduced |
| `searchSashList` does not pass `windEstiNo` | Existing comments say mapper may need wind estimate number; current behavior depends on mapper filters | Validate with real saved sash row |
| Mobile and web option coverage differ | Missing BF/SF/MF options can alter STEP1/STEP2 procedure result | Compare one known web ERP sash estimate against mobile payload and result |
| Backend logs are verbose for save parameters | Useful during validation but noisy for normal use | Keep during stabilization, remove or lower level later |
