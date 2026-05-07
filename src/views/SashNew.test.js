import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'SashNew.vue'), 'utf8')
const formMainSource = readFileSync(resolve(currentDir, '../components/SashFormMain.vue'), 'utf8')

test('SashNew loads bsmf order unit options from common code group 405', () => {
  assert.match(source, /searchCodeList\('405'\)/)
})

test('SashNew restores all CS special condition fields in edit mode', () => {
  assert.match(source, /cs3:\s*r\.cs3Size \? Number\(r\.cs3Size\) : null/)
  assert.match(source, /cs4:\s*r\.cs4Size \? Number\(r\.cs4Size\) : null/)
  assert.match(source, /cs5:\s*r\.cs5Size \? Number\(r\.cs5Size\) : null/)
})

test('SashNew keeps bsmf and order type required before save', () => {
  assert.match(source, /!!form\.value\.bsmfOrdUtmCd\s*&&\s*!!form\.value\.sashOrdTypCd/)
  assert.match(source, /if \(!form\.value\.sashOrdTypCd\) return failSubmit\('발주구분을 선택하세요'\)/)
})

test('SashNew renders order type next to al-glass instead of the main form', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /알유리견적[\s\S]*발주구분/)
  assert.match(handleSource, /v-model="form\.sashOrdTypCd"/)
  assert.doesNotMatch(formMainSource, /<label>발주구분 \*<\/label>/)
})

test('SashNew restores al-glass and bracket height fields in edit mode', () => {
  assert.match(source, /alGlass:\s*r\.glasStdalYn === 'Y'/)
  assert.match(source, /glasAdmsYn:\s*r\.glasAdmsYn \|\| 'Y'/)
  assert.match(source, /insdBrcktHEnabled:\s*r\.insdBrcktHMiddle === 'Y'/)
  assert.match(source, /ousdBrcktHEnabled:\s*r\.insd2FBrcktHMiddle === 'Y'/)
})

test('SashNew enables second-floor bracket and handle only for two-floor window types', () => {
  assert.match(source, /addInfo5:\s*it\.addInfo5/)
  assert.match(source, /const isSecondFloorEnabled = computed\(\(\) => String\(wintydiMap\.value\[form\.value\.wintydiCd\]\?\.floorInfo \|\| ''\)\.includes\('\/'\)\)/)
  assert.match(source, /:second-floor-enabled="isSecondFloorEnabled"/)
})

test('SashNew resolves bsmf order unit from selected model without guessing the first option', () => {
  assert.match(source, /resolveBsmfOrdUtmCd\(row,\s*bsmfList\.value\)/)
  assert.doesNotMatch(source, /form\.value\.bsmfOrdUtmCd\s*=\s*bsmfList\.value\[0\]\.commCdId/)
})

test('SashNew does not clear saved bsmf code while reloading an existing sash', () => {
  assert.match(source, /await loadMasters\(\)[\s\S]*if \(isEditMode\.value\) \{[\s\S]*await loadEditData\(\)/)
  assert.match(source, /if \(resolvedBsmf \|\| !form\.value\.bsmfOrdUtmCd\) form\.value\.bsmfOrdUtmCd = resolvedBsmf/)
})

test('SashNew shows only add-estimate and save actions for editable mode', () => {
  assert.match(source, />\s*견적추가\s*</)
  assert.match(source, />\s*저장\s*</)
  assert.doesNotMatch(source, /샤시 견적 저장/)
  assert.doesNotMatch(source, /수정 저장/)
  assert.doesNotMatch(source, /저장 \+ 추가/)
  assert.doesNotMatch(source, /\+ 샤시 추가/)
})

test('SashNew places estimate identifiers at the bottom and production options after glass options', () => {
  const topInfoIndex = source.indexOf('<div class="card card-info">')
  const formIndex = source.indexOf('<SashFormMain')
  assert.ok(topInfoIndex === -1 || topInfoIndex > formIndex)

  const glassIndex = source.indexOf('<SashOptionGlass')
  const factoryIndex = source.indexOf('<SashOptionFactory')
  const metaIndex = source.indexOf('class="sash-bottom-meta"')
  assert.ok(glassIndex > -1)
  assert.ok(factoryIndex > -1)
  assert.ok(glassIndex < factoryIndex)
  assert.ok(metaIndex > factoryIndex)
  assert.match(source, /통합견적번호:\s*{{ itgEstiNo \|\| '\(없음\)' }}/)
  assert.match(source, /견적번호:\s*{{ wEstiNo \|\| '\(없음\)' }}/)
  assert.match(source, /견적차수:\s*{{ estiNos \|\| '1' }}/)
  assert.match(source, /견적순번:\s*{{ editEstiSeq \|\| '\(신규\)' }}/)
})

test('SashNew title follows web estimate detail wording and shows sequence separately', () => {
  assert.match(source, /<h2 class="page-title">견적상세<\/h2>/)
  assert.match(source, /class="page-subtitle"[\s\S]*견적순번:\s*{{ editEstiSeq \|\| '\(신규\)' }}/)
  assert.doesNotMatch(source, /샤시 견적 #/)
})

test('SashNew add-estimate saves as a new sequence, while save keeps current sequence', () => {
  assert.match(source, /async function saveAndAdd\(\)[\s\S]*const result = await submit\(\{ asNewSeq: true \}\)[\s\S]*if \(result\.ok\) await loadSavedEstimate\(result\.estiSeq\)/)
  assert.match(source, /async function saveAndClose\(\)[\s\S]*const result = await submit\(\)[\s\S]*if \(result\.ok\) goBack\(\)/)
  assert.match(source, /editEstiSeq: asNewSeq \? '' : editEstiSeq\.value/)
  assert.match(source, /return \{ ok: true, estiSeq: savedSeq\.value \}[\s\S]*catch/)
})

test('SashNew reloads the newly added estimate after add-estimate', () => {
  assert.match(source, /async function loadSavedEstimate\(estiSeq\)/)
  assert.match(source, /editEstiSeq\.value = String\(estiSeq \|\| ''\)/)
  assert.match(source, /await loadEditData\(\)/)
  const replaceStart = source.indexOf('async function loadSavedEstimate')
  const replaceEnd = source.indexOf('await loadEditData()', replaceStart)
  const replaceBlock = source.slice(replaceStart, replaceEnd)
  assert.match(replaceBlock, /estiSeq: editEstiSeq\.value/)
  assert.doesNotMatch(replaceBlock, /readonly/)
})

test('SashFormMain option labels show names without appending codes', () => {
  assert.doesNotMatch(formMainSource, /{{\s*w\.commCdNm\s*}}\s*\({{\s*w\.commCdId\s*}}\)/)
  assert.doesNotMatch(formMainSource, /{{\s*b\.commCdNm\s*}}\s*\({{\s*b\.commCdId\s*}}\)/)
  assert.match(formMainSource, /{{\s*w\.commCdNm\s*}}/)
  assert.match(formMainSource, /{{\s*b\.commCdNm\s*}}/)
  assert.match(formMainSource, /{{\s*sfDisplayName\(s\)\s*}}/)
})

test('SashOptionHandle exposes al-glass but not glasAdmsYn as a separate UI toggle', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /알유리견적/)
  assert.match(handleSource, /class="switch-toggle"/)
  assert.match(handleSource, /class="switch-track"/)
  assert.doesNotMatch(handleSource, /유리포함/)
  assert.doesNotMatch(handleSource, /form\.glasAdmsYn = form\.glasAdmsYn/)
})

test('SashNew disables al-glass estimate toggle for unsupported model categories', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(source, /ctgr2Cd:\s*''/)
  assert.match(source, /ctgr2Cd:\s*r\.ctgr2Cd \|\| ''/)
  assert.match(source, /form\.value\.ctgr2Cd = row\.ctgr2Cd \|\| ''/)
  assert.match(source, /const alGlassEnabled = computed\(\(\) => \['P2', 'P3', 'P4', 'P5'\]\.includes\(form\.value\.ctgr2Cd\)\)/)
  assert.match(source, /:al-glass-enabled="alGlassEnabled"/)
  assert.match(source, /if \(!alGlassEnabled\.value\) form\.value\.alGlass = false/)
  assert.match(source, /if \(form\.value\.alGlass && !alGlassEnabled\.value\) return failSubmit\('알유리견적을 선택할 수 없는 모형입니다'\)/)
  assert.match(handleSource, /alGlassEnabled:\s*\{ type: Boolean, default: true \}/)
  assert.match(handleSource, /:disabled="!alGlassEnabled"/)
  assert.match(handleSource, /if \(!props\.alGlassEnabled\) return/)
})

test('SashOptionHandle disables bracket height inputs when bracket toggle is off', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /:disabled="!form\.insdBrcktHEnabled"/)
  assert.match(handleSource, /:disabled="!secondFloorEnabled \|\| !form\.ousdBrcktHEnabled"/)
  assert.match(handleSource, /if \(!props\.form\.insdBrcktHEnabled\) \{[\s\S]*props\.form\.insdBrcktH = null[\s\S]*props\.form\.ousdBrcktH = null/)
})

test('SashOptionHandle bracket toggles use only ON/OFF text without middle label', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.doesNotMatch(handleSource, /중간/)
  assert.match(handleSource, /form\.insdBrcktHEnabled \? 'ON' : 'OFF'/)
  assert.match(handleSource, /form\.ousdBrcktHEnabled \? 'ON' : 'OFF'/)
})

test('SashOptionVent aligns screen select and safety net toggle heights', () => {
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(ventSource, /class="row-flex option-row"/)
  assert.match(ventSource, /class="field option-toggle-field"/)
  assert.doesNotMatch(ventSource, /align-items:flex-end/)
})

test('SashNew renders BF SF MF option section and restores saved factory options', () => {
  const factorySource = readFileSync(resolve(currentDir, '../components/SashOptionFactory.vue'), 'utf8')
  assert.match(source, /import SashOptionFactory/)
  assert.match(source, /<SashOptionFactory :form="form" \/>/)
  assert.match(factorySource, /생산옵션/)
  assert.match(factorySource, /배수홀/)
  assert.match(factorySource, /밀링유형/)
  assert.match(factorySource, /보강재/)
  assert.match(factorySource, /락 개수/)
  assert.match(factorySource, /랩핑/)
  assert.match(factorySource, /3면포장/)
  assert.match(factorySource, /밀링유형상세/)
  assert.match(factorySource, /밀링위치/)
  assert.match(factorySource, /반대타입/)
  assert.match(factorySource, /SP 가로작업/)
  assert.match(factorySource, /4W용 CI부착/)
  assert.match(source, /drnHoleYn:\s*r\.drnHoleYn !== 'N'/)
  assert.match(source, /bfMillingType:\s*stringifyOptionValue\(r\.bfMillingType \|\| r\.bfmillingWing \|\| '0'\)/)
  assert.match(source, /bfArmatureType:\s*r\.bfArmatureType \|\| ''/)
  assert.match(source, /bfLockCnt:\s*r\.bfLockCnt \|\| ''/)
  assert.match(source, /bfWrapping:\s*r\.bfWrapping \|\| ''/)
  assert.match(source, /bfThrSidePack:\s*r\.bfThrSidePack \|\| ''/)
  assert.match(source, /bfMillingDetail:\s*r\.bfMillingDetail \|\| ''/)
  assert.match(source, /bfMillingUp:\s*r\.bfMillingUp === 'Y'/)
  assert.match(source, /bfDirectShip:\s*r\.bfDirectShip === 'Y'/)
  assert.match(source, /sfLandscape:\s*r\.sfLandscape === 'Y'/)
  assert.match(source, /sfOppositeTypeYn:\s*r\.sfOppositeTypeYn === 'Y'/)
  assert.match(source, /mfCi4wStickYn:\s*r\.mfCi4wStickYn === 'Y'/)
})

test('SashOptionFactory includes extended BF SF MF production options from web sash form', () => {
  const factorySource = readFileSync(resolve(currentDir, '../components/SashOptionFactory.vue'), 'utf8')
  assert.match(factorySource, /4면포장/)
  assert.match(factorySource, /KS마크/)
  assert.match(factorySource, /LX히든/)
  assert.match(factorySource, /FM-X,GB-X/)
  assert.match(factorySource, /100면보이게/)
  assert.match(factorySource, /터닝도어/)
  assert.match(factorySource, /케이스먼트/)
  assert.match(factorySource, /1FIX/)
  assert.match(factorySource, /외주유리/)
  assert.match(factorySource, /윈드클로저/)
  assert.match(factorySource, /로라/)
  assert.match(factorySource, /크리센트/)
  assert.match(factorySource, /장식X/)
  assert.match(factorySource, /손타위치/)
  assert.match(factorySource, /망핸들/)
  assert.match(factorySource, /망핸들높이/)
  assert.match(factorySource, /MF 아파트/)
})

test('SashNew applies production option defaults without turning direct ship on', () => {
  assert.match(source, /async function applyProductionStandardRules/)
  assert.match(source, /import \{[^}]*searchCodeDetail[^}]*\} from/)
  assert.match(source, /searchCodeDetail\('12', '019'\)/)
  assert.match(source, /form\.value\.drnHoleYn = !String\(row\.drnHoleDefaultOffYn \|\| ''\)\.includes\('Y'\)/)
  assert.match(source, /form\.value\.bfMillingType = stringifyOptionValue\(row\.bfMillingType \|\| row\.bfmillingWing \|\| '0'\)/)
  assert.match(source, /form\.value\.bfMillingDetail = ''/)
  assert.match(source, /form\.value\.sfOppositeTypeYn = row\.sfOppositeTypeYn === 'Y'/)
  assert.match(source, /form\.value\.bfDirectShip = false/)
  assert.match(source, /form\.value\.sfDirectShip = false/)
  assert.match(source, /form\.value\.mfDirectShip = false/)
})

test('SashNew validates BF milling detail when milling is selected', () => {
  assert.match(source, /if \(form\.value\.bfMillingType !== '0' && !form\.value\.bfMillingDetail\) return failSubmit\('밀링유형상세를 선택하세요'\)/)
})

test('SashNew validates additional production option requirements from web sash form', () => {
  const factorySource = readFileSync(resolve(currentDir, '../components/SashOptionFactory.vue'), 'utf8')
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(source, /searchCodeList\('387'\)/)
  assert.match(source, /aluMfHandleList/)
  assert.match(source, /:alu-mf-handle-options="aluMfHandleList"/)
  assert.match(source, /bfOneSideWrapColrNm:\s*r\.bfOneSideWrapColrNm \|\| ''/)
  assert.match(source, /aluMfHandleType:\s*r\.aluMfHandleType \|\| ''/)
  assert.match(source, /aluMfMdlYn:\s*r\.aluMfMdlYn \|\| 'Y'/)
  assert.match(source, /aluMfHndlH:\s*r\.aluMfHndlH \? Number\(r\.aluMfHndlH\) : null/)
  assert.match(source, /function validateProductionOptions/)
  assert.match(source, /const productionError = validateProductionOptions\(\)/)
  assert.match(source, /if \(productionError\) return failSubmit\(productionError\)/)
  assert.match(source, /if \(form\.value\.bfTurnDoorOneSideWrapType && !form\.value\.bfOneSideWrapColrNm\) return '터닝도어 일면래핑색상을 입력하세요'/)
  assert.match(source, /if \(form\.value\.isAluMf && form\.value\.aluMfMdlYn !== 'Y' && !form\.value\.aluMfHndlH\) return '안전망 높이를 입력하세요'/)
  assert.match(source, /clearMillingOptions\(\)/)
  assert.match(factorySource, /v-model\.trim="form\.bfOneSideWrapColrNm"/)
  assert.match(ventSource, /aluMfHandleOptions/)
  assert.match(ventSource, /v-model="form\.aluMfHandleType"/)
  assert.match(ventSource, /v-model\.number="form\.aluMfHndlH"/)
  assert.match(ventSource, /form\.aluMfMdlYn === 'Y' \? 'ON' : 'OFF'/)
})

test('SashNew blocks safety net selection when selected model is not safety-net capable', () => {
  const modalSource = readFileSync(resolve(currentDir, '../components/ModelSearchModal.vue'), 'utf8')
  assert.match(modalSource, /aluMdlYn/)
  assert.match(source, /aluMdlYn:\s*''/)
  assert.match(source, /aluMdlYn:\s*r\.aluMdlYn \|\| ''/)
  assert.match(source, /form\.value\.aluMdlYn = normalizeYn\(row\.aluMdlYn\)/)
  assert.match(source, /function isSafetyNetModel/)
  assert.match(source, /if \(!isSafetyNetModel\(\)\) \{[\s\S]*error\.value = '안전망 모형이 아닙니다'[\s\S]*return[\s\S]*\}/)
  assert.match(source, /if \(form\.value\.isAluMf && !isSafetyNetModel\(\)\) return failSubmit\('안전망 모형이 아닙니다'\)/)
})

test('SashNew validates SF out-sash position and glass finish restrictions from web form', () => {
  const factorySource = readFileSync(resolve(currentDir, '../components/SashOptionFactory.vue'), 'utf8')
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(source, /sfOutType:\s*''/)
  assert.match(source, /sfOutType:\s*r\.sfOutType \|\| ''/)
  assert.match(source, /sashGlasXMtrlYn:\s*r\.sashGlasXMtrlYn \|\| ''/)
  assert.match(source, /sashOrdTypCds:\s*r\.sashOrdTypCds \|\| r\.glasXMtrlExceptionCds \|\| ''/)
  assert.match(source, /function validateSfOutType/)
  assert.match(source, /if \(form\.value\.sfOutType && !hasSfOutPosition\(\)\) return 'SF 외짝 선택 시 창별 위치도 선택하세요'/)
  assert.match(source, /function selectedGlassItems/)
  assert.match(source, /function hasGlassXSelection/)
  assert.match(source, /function hasGlassExcludedSelection/)
  assert.match(source, /function isSiliconeFinishAllowedByBsmf/)
  assert.match(source, /const siliconeFinishEnabled = computed/)
  assert.match(source, /if \(hasGlassXSelection\(\) && !canUseGlassX\(\)\) return '유리X 자재를 선택할 수 없습니다'/)
  assert.match(source, /if \(!siliconeFinishEnabled\.value\) form\.value\.slcnFnshYn = false/)
  assert.match(factorySource, /v-model="form\.sfOutType"/)
  assert.match(factorySource, /<option value="4">1W<\/option>/)
  assert.match(ventSource, /siliconeFinishEnabled:\s*\{ type: Boolean, default: true \}/)
  assert.match(ventSource, /:disabled="!siliconeFinishEnabled"/)
  assert.match(ventSource, /function toggleSiliconeFinish/)
})

test('SashNew shows readonly amount summary at bottom of detail', () => {
  const amountIndex = source.indexOf('class="sash-amount-summary"')
  const metaIndex = source.indexOf('class="sash-bottom-meta"')
  assert.ok(amountIndex > -1)
  assert.ok(metaIndex > amountIndex)
  assert.match(source, /searchWindEstiAmt/)
  assert.match(source, /async function loadWindEstimateAmount\(\)/)
  assert.match(source, /const amountRow = data\?\.resultList\?\.\[0\] \|\| \{\}/)
  assert.match(source, /await loadWindEstimateAmount\(\)/)
  assert.match(source, /const hasAmountSummary = computed/)
  assert.match(source, /function amountText/)
  assert.match(source, /estiSalesUnpRt:\s*amountRow\.estiSalesUnpRt \|\| ''/)
  assert.match(source, /estiTotSaleVatUnp:\s*amountRow\.estiTotSaleVatUnp \|\| ''/)
  assert.match(source, /총금액[\s\S]*{{ amountText\(form\.estiTotSaleVatUnp\) }}/)
  assert.doesNotMatch(source, /v-model="form\.estiTotSaleVatUnp"/)
})

test('OptionToggle gives on off disabled states distinct styling', () => {
  const toggleSource = readFileSync(resolve(currentDir, '../components/common/OptionToggle.vue'), 'utf8')
  assert.match(toggleSource, /:disabled="disabled"/)
  assert.match(toggleSource, /\.option-toggle\.toggle-on/)
  assert.match(toggleSource, /\.option-toggle\.toggle-off/)
  assert.match(toggleSource, /\.option-toggle:disabled/)
})

test('SashNew validates direct ship addresses before save', () => {
  assert.match(source, /if \(form\.value\.bfDirectShip && !form\.value\.bfShipAddr\) return failSubmit\('BF 직송주소를 입력하세요'\)/)
  assert.match(source, /if \(form\.value\.sfDirectShip && !form\.value\.sfShipAddr\) return failSubmit\('SF 직송주소를 입력하세요'\)/)
  assert.match(source, /if \(form\.value\.mfDirectShip && !form\.value\.mfShipAddr\) return failSubmit\('MF 직송주소를 입력하세요'\)/)
})

test('SashNew blocks common web sash validation gaps before save', () => {
  assert.match(source, /validateSegmentSizes\(\)/)
  assert.match(source, /if \(!form\.value\.screenType\) return failSubmit\('스크린을 선택하세요'\)/)
  assert.match(source, /if \(!form\.value\.ventLoc\) return failSubmit\('VENT를 선택하세요'\)/)
  assert.match(source, /if \(form\.value\.isAluMf && form\.value\.wintydiCd === '4W'\) return failSubmit\('4W제품은 안전망을 선택할 수 없습니다'\)/)
  assert.match(source, /if \(form\.value\.bftydiCd === '113' && \(form\.value\.insdHandleType === '2' \|\| form\.value\.ousdHandleType === '2'\)\) return failSubmit\('발코니창은 매립핸들이 불가능합니다'\)/)
  assert.match(source, /if \(\(form\.value\.insdHandleType === '2' \|\| form\.value\.ousdHandleType === '2'\) && pickedMdlMtrlCo\.value !== 'CA'\) return failSubmit\('자재회사가 청암일 경우에만 매립핸들을 선택할 수 있습니다'\)/)
}
)

test('SashNew validates standard model specification from common code group 188', () => {
  assert.match(source, /standardSpec:\s*\{\}/)
  assert.match(source, /searchCodeDetail\('188',\s*form\.value\.mdlCd\)/)
  assert.match(source, /function applyStandardSpec/)
  assert.match(source, /function validateStandardModelSpec/)
  assert.match(source, /const standardError = validateStandardModelSpec\(\)/)
  assert.match(source, /if \(standardError\) return failSubmit\(standardError\)/)
  assert.match(source, /if \(spec\.wintydiCd && spec\.wintydiCd !== form\.value\.wintydiCd\) return '창형태를 규격사양으로 선택하세요'/)
  assert.match(source, /if \(spec\.bsmfOrdUtmCd && spec\.bsmfOrdUtmCd !== form\.value\.bsmfOrdUtmCd\) return '틀짝망을 규격사양으로 선택하세요'/)
  assert.match(source, /if \(spec\.screenType && spec\.screenType !== form\.value\.screenType\) return '스크린을 규격사양으로 선택하세요'/)
  assert.match(source, /if \(spec\.insdHandleType && spec\.insdHandleType !== form\.value\.insdHandleType\) return '내측 핸들을 규격사양으로 선택하세요'/)
  assert.match(source, /if \(spec\.sfInsdGlassMtrlCd && shouldValidateSfGlass\(\) && !includesSpecValue\(spec\.sfInsdGlassMtrlCd,\s*form\.value\.mtrlCds1\)\) return 'SF내측유리를 규격사양으로 선택하세요'/)
}
)

test('SashNew shows model drawing preview below main form and refreshes it from model drawings', () => {
  assert.match(formMainSource, /class="sash-form-drawing-row"/)
  assert.match(formMainSource, /class="sash-drawing-inline"/)
  assert.doesNotMatch(source, /모형 그림/)
  assert.doesNotMatch(formMainSource, /모형 그림/)
  assert.match(source, /:drawing-url="sashDrawingUrl"/)
  assert.match(source, /:drawing-fallback="currentWintydiName"/)
  assert.match(source, /sashDrawingUrl/)
  assert.match(source, /hydrateModelDrawing\(row\)/)
  assert.match(source, /refreshDrawingFromCurrentSelection\(\)/)
  assert.match(source, /searchModelList\(/)
})

test('EstimateDetail sash list shows drawing, separated quantity bsmf, and status', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /class="sash-thumb"/)
  assert.match(detailSource, /buildSashDrawingUrl\(row\)/)
  assert.match(detailSource, /buildSashMeta\(row\)\.qtyText/)
  assert.match(detailSource, /buildSashMeta\(row\)\.bsmfText/)
  assert.match(detailSource, /statusBadgeClass\(row\)/)
})

test('EstimateDetail resolves screen type names and shows loading while opening sash detail', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /searchCodeList\('379'\)/)
  assert.match(detailSource, /buildSashScreenText\(row,\s*screenList\)/)
  assert.match(detailSource, /openingSash/)
  assert.match(detailSource, /샤시 상세 불러오는 중/)
})
