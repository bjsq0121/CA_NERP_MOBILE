import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { UNKNOWN_STATUS, isEditableHeaderStatus, isEditableStatus } from '../utils/estimateStatus.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'SashNew.vue'), 'utf8')
const formMainSource = readFileSync(resolve(currentDir, '../components/SashFormMain.vue'), 'utf8')
const quickConfigSheetSource = readFileSync(resolve(currentDir, '../components/SashQuickConfigSheet.vue'), 'utf8')

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

test('SashNew validates model size lower and upper limits when model data provides them', () => {
  assert.match(source, /uplmNrmW:\s*'',\s*uplmNrmH:\s*'',\s*llmtNrmW:\s*'',\s*llmtNrmH:\s*''/)
  assert.match(source, /form\.value\.uplmNrmW = row\.uplmNrmW \|\| ''/)
  assert.match(source, /validateSizeRange\('W', 'w', 'llmtNrmW', 'uplmNrmW'\)/)
  assert.match(source, /validateSizeRange\(`W\$\{index\}`, field, `llmtNrmW\$\{index\}`, `uplmNrmW\$\{index\}`\)/)
  assert.match(source, /validateSizeRange\('H', 'h', 'llmtNrmH', 'uplmNrmH'\)/)
})

test('SashNew renders order type next to al-glass instead of the main form', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /알유리견적[\s\S]*발주구분/)
  assert.match(handleSource, /v-model="form\.sashOrdTypCd"/)
  assert.doesNotMatch(formMainSource, /<label>발주구분 \*<\/label>/)
})

test('SashNew restores al-glass and bracket height fields in edit mode', () => {
  assert.match(source, /alGlass:\s*isYnValue\(r\.glasStdalYn\)/)
  assert.match(source, /glasAdmsYn:\s*r\.glasAdmsYn \|\| 'Y'/)
  assert.match(source, /issueType:\s*r\.issueType \|\| ''/)
  assert.match(source, /appdocId:\s*r\.appdocId \|\| ''/)
  assert.match(source, /unqColrPolSaveYn:\s*isYnValue\(r\.unqColrPolSaveYn\)/)
  assert.match(source, /insdBrcktHEnabled:\s*r\.insdBrcktHMiddle === 'N'/)
  assert.match(source, /ousdBrcktHEnabled:\s*r\.insd2FBrcktHMiddle === 'N'/)
  assert.match(source, /insdHndlHEnabled:\s*r\.insdHndlHMiddle === 'N'/)
  assert.match(source, /ousdHndlHEnabled:\s*r\.insdHndlHMiddle === 'N'/)
  assert.match(source, /secondHndlHEnabled:\s*r\.insd2FHndlHMiddle === 'N'/)
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

test('SashNew exposes quick config loading next to the back action', () => {
  assert.match(source, /import SashQuickConfigSheet from '\.\.\/components\/SashQuickConfigSheet\.vue'/)
  assert.match(source, /import \{ applyQuickConfigOptionsToForm \} from '\.\.\/utils\/sashQuickConfig'/)
  assert.match(source, /간편견적/)
  assert.match(source, /@click="openQuickSashSheet"/)
  assert.match(source, /v-if="showQuickConfigSheet"/)
  assert.match(source, /@select="handleQuickSashSelect"/)
  assert.match(source, /async function applyQuickSashConfig/)
  assert.match(source, /applyQuickConfigOptionsToForm\(form\.value, card\)/)
})

test('SashNew turns on quick config safety net before applying screen type', () => {
  const start = source.indexOf('async function applyQuickSashConfig')
  const safetyIndex = source.indexOf('applyQuickConfigSafetyOptions(detail, card)', start)
  const screenIndex = source.indexOf("setIfPresent(detail, 'screenType', 'screenType')", start)
  const unsafeDetailSafetyIndex = source.indexOf("form.value.isAluMf = detail.aluMfYn === 'Y'", start)

  assert.ok(start > -1)
  assert.ok(safetyIndex > -1)
  assert.ok(screenIndex > -1)
  assert.ok(safetyIndex < screenIndex)
  assert.equal(unsafeDetailSafetyIndex, -1)
})

test('SashNew resets stale safety net state before each quick config apply', () => {
  const start = source.indexOf('async function applyQuickSashConfig')
  const resetIndex = source.indexOf('resetSafetyNetOptions()', start)
  const modelPickIndex = source.indexOf('await onModelPick(detail)', start)
  const safetyIndex = source.indexOf('applyQuickConfigSafetyOptions(detail, card)', start)

  assert.ok(start > -1)
  assert.ok(resetIndex > -1)
  assert.ok(modelPickIndex > -1)
  assert.ok(safetyIndex > -1)
  assert.ok(resetIndex < modelPickIndex)
  assert.ok(resetIndex < safetyIndex)
})

test('SashNew quick config success notice does not reset safety net options', () => {
  const start = source.indexOf('async function applyQuickSashConfig')
  const successIndex = source.indexOf("showNotice(`간편견적 '${header.cfgNm || card.cfgId || detail.cfgId}'을 불러왔습니다`)", start)
  const resetBetweenApplyAndSuccess = source
    .slice(source.indexOf('applyQuickConfigSafetyOptions(detail, card)', start), successIndex)
    .includes('resetSafetyNetOptions()')

  assert.ok(successIndex > -1)
  assert.equal(resetBetweenApplyAndSuccess, false)
  assert.doesNotMatch(source, /showAlert\(`간편견적/)
  assert.match(source, /function showNotice\(message\)[\s\S]*error\.value = ''[\s\S]*alertMessage\.value = message/)
  assert.match(source, /function showError\(message\)[\s\S]*resetSafetyNetOptions\(\)[\s\S]*error\.value = message[\s\S]*alertMessage\.value = message/)
})

test('SashNew normalizes quick config selections after applying all quick config values', () => {
  const start = source.indexOf('async function applyQuickSashConfig')
  const applyOptionsIndex = source.indexOf('applyQuickConfigOptionsToForm(form.value, card)', start)
  const rulesIndex = source.indexOf('applyProductionOptionRules()', applyOptionsIndex)
  const normalizeIndex = source.indexOf('normalizeQuickConfigSelections()', rulesIndex)
  const successIndex = source.indexOf("showNotice(`간편견적 '${header.cfgNm || card.cfgId || detail.cfgId}'을 불러왔습니다`)", start)

  assert.ok(start > -1)
  assert.ok(applyOptionsIndex > -1)
  assert.ok(rulesIndex > applyOptionsIndex)
  assert.ok(normalizeIndex > rulesIndex)
  assert.ok(successIndex > normalizeIndex)
  assert.match(source, /function normalizeQuickConfigSelections\(\)[\s\S]*normalizeCurrentSelections\(\)/)
  assert.match(source, /function normalizeCurrentSelections\(\)[\s\S]*normalizeBsmfSelection\(\)[\s\S]*applyVentDefault\(\)[\s\S]*applyScreenDefault\(\)[\s\S]*applyHandleDefault\(\)/)
})

test('SashNew keeps validation read-only and normalizes separately before submit', () => {
  const validateStart = source.indexOf('function validateProductionOptions()')
  const validateEnd = source.indexOf('function buildPayload', validateStart)
  const validateBody = source.slice(validateStart, validateEnd)
  const submitStart = source.indexOf('async function submit')
  const segmentIndex = source.indexOf('const segmentError = validateSegmentSizes()', submitStart)
  const normalizeIndex = source.indexOf('normalizeBeforeSubmit()', submitStart)

  assert.ok(validateStart > -1)
  assert.doesNotMatch(validateBody, /applyProductionOptionRules\(\)/)
  assert.match(source, /function normalizeBeforeSubmit\(\)[\s\S]*applyProductionOptionRules\(\)[\s\S]*normalizeCurrentSelections\(\)/)
  assert.ok(normalizeIndex > -1)
  assert.ok(normalizeIndex < segmentIndex)
})

test('SashNew does not expose raw save response JSON in user-facing errors', () => {
  assert.match(source, /function saveErrorMessage\(data = \{\}\)/)
  assert.match(source, /function exceptionErrorMessage\(e\)/)
  assert.doesNotMatch(source, /error\.value = `저장 실패[\s\S]*JSON\.stringify/)
  assert.doesNotMatch(source, /error\.value = `예외 발생[\s\S]*JSON\.stringify/)
})

test('SashQuickConfigSheet bounds quick config list requests', () => {
  assert.match(quickConfigSheetSource, /startRowNum:\s*0/)
  assert.match(quickConfigSheetSource, /endRowNum:\s*100/)
})

test('SashNew keeps all edit fields behind page loading until detail restoration finishes', () => {
  const loadingIndex = source.indexOf('<div v-if="pageLoading" class="loading-center">')
  const loadedTemplateIndex = source.indexOf('<template v-else>')
  const firstOptionIndex = source.indexOf('<SashOptionVent')
  const remarkIndex = source.indexOf('<label>견적비고</label>')
  const loadedTemplateEndIndex = source.indexOf('</template>', remarkIndex)
  const scriptIndex = source.indexOf('<script setup>')

  assert.ok(loadingIndex > -1)
  assert.ok(loadedTemplateIndex > loadingIndex)
  assert.ok(firstOptionIndex > loadedTemplateIndex)
  assert.ok(remarkIndex > loadedTemplateIndex)
  assert.ok(loadedTemplateEndIndex > remarkIndex)
  assert.ok(loadedTemplateEndIndex < scriptIndex)
  assert.doesNotMatch(source, /<SashFormMain\s+v-if="!pageLoading"/)
})

test('SashNew screen options fall back when ALU PVC addInfo4 filter has no exact rows', () => {
  assert.match(source, /const exact = screenAllList\.value\.filter\(\(s\) => String\(s\.addInfo4 \|\| ''\)\.toUpperCase\(\) === target\)/)
  assert.match(source, /if \(exact\.length\) return exact/)
  assert.match(source, /return screenAllList\.value/)
})

test('SashNew header keeps quick config and back actions on the right while title ellipsizes', () => {
  assert.match(source, /class="page-title-row sash-header"/)
  assert.match(source, /class="sash-header-title"/)
  assert.match(source, /class="sash-header-actions title-actions"/)
  assert.match(source, /class="btn secondary btn-quick-config"[\s\S]*간편견적[\s\S]*class="sash-header-back btn-back"[\s\S]*뒤로/)
  assert.match(source, /\.sash-header\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto/)
  assert.match(source, /\.sash-header-title\s*\{[\s\S]*min-width:\s*0/)
  assert.match(source, /\.sash-header-title\s+\.page-title[\s\S]*white-space:\s*nowrap[\s\S]*text-overflow:\s*ellipsis/)
  assert.match(source, /\.sash-header-actions\s*\{[\s\S]*display:\s*flex[\s\S]*justify-self:\s*end[\s\S]*white-space:\s*nowrap/)
  assert.match(source, /\.sash-header-back\s*\{[\s\S]*width:\s*40px[\s\S]*height:\s*32px[\s\S]*flex-shrink:\s*0/)
  assert.match(source, /\.sash-header\s+\.btn-quick-config\s*\{[\s\S]*height:\s*32px[\s\S]*padding:\s*0 8px[\s\S]*font-size:\s*11px[\s\S]*white-space:\s*nowrap/)
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

test('SashFormMain uses iPad Safari compatible numeric text inputs for main W and H', () => {
  assert.match(formMainSource, /:value="form\.w \?\? ''"[\s\S]*type="text"[\s\S]*inputmode="numeric"[\s\S]*pattern="\[0-9\]\*"[\s\S]*maxlength="4"[\s\S]*autocomplete="off"[\s\S]*enterkeyhint="next"[\s\S]*@input="setFourDigitNumber\('w', \$event\)"/)
  assert.match(formMainSource, /:value="form\.h \?\? ''"[\s\S]*type="text"[\s\S]*inputmode="numeric"[\s\S]*pattern="\[0-9\]\*"[\s\S]*maxlength="4"[\s\S]*autocomplete="off"[\s\S]*enterkeyhint="next"[\s\S]*@input="setFourDigitNumber\('h', \$event\)"/)
  assert.match(formMainSource, /function setFourDigitNumber\(field, event\)[\s\S]*replace\(\/\\D\/g, ''\)[\s\S]*slice\(0, 4\)[\s\S]*props\.form\[field\] = digits \? Number\(digits\) : null/)
})

test('SashFormMain uses iPad Safari compatible numeric text inputs for segment and CS size fields', () => {
  const fields = ['w1', 'w2', 'w3', 'w4', 'w5', 'h1', 'h2', 'h3', 'h4', 'h5', 'cs', 'cs1', 'cs2', 'cs3', 'cs4', 'cs5']

  for (const field of fields) {
    const pattern = new RegExp(`:value="form\\.${field} \\?\\? ''"[\\s\\S]*type="text"[\\s\\S]*inputmode="numeric"[\\s\\S]*pattern="\\[0-9\\]\\*"[\\s\\S]*maxlength="4"[\\s\\S]*autocomplete="off"[\\s\\S]*enterkeyhint="next"[\\s\\S]*@input="setFourDigitNumber\\('${field}', \\$event\\)"`)
    assert.match(formMainSource, pattern, `${field} should use iPad Safari compatible numeric text input`)
  }
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

test('SashOptionHandle enables outside handle height by double-window status, not second-floor status', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /:disabled="form\.dblWindYn !== 'Y' \|\| !form\.ousdHndlHEnabled"/)
  assert.match(handleSource, /if \(props\.form\.dblWindYn !== 'Y'\) return/)
  assert.doesNotMatch(handleSource, /!secondFloorEnabled \|\| !form\.ousdHndlHEnabled/)
})

test('SashOptionHandle exposes independent second-floor handle height controls', () => {
  const handleSource = readFileSync(resolve(currentDir, '../components/SashOptionHandle.vue'), 'utf8')
  assert.match(handleSource, /핸들높이2/)
  assert.match(handleSource, /form\.secondHndlHEnabled/)
  assert.match(handleSource, /v-model\.number="form\.insd2FHndlH"/)
  assert.match(handleSource, /v-model\.number="form\.ousd2FHndlH"/)
  assert.match(handleSource, /toggleHndlH\('second'\)/)
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
  assert.match(source, /drnHoleYn:\s*!isExplicitNo\(r\.drnHoleYn\)/)
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
  assert.match(factorySource, /2층내창/)
  assert.match(factorySource, /2층외창/)
  assert.match(factorySource, /SF 통기홀/)
  assert.match(factorySource, /내측 통기홀/)
  assert.match(factorySource, /외측 통기홀/)
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
  assert.match(source, /aluMfHandleType:\s*normalizeSafetyNetHandleValue\(r\.aluMfHandleType\) \|\| r\.aluMfHandleType \|\| ''/)
  assert.match(source, /aluMfHandleTypeNm:\s*r\.aluMfHandleTypeNm \|\| ''/)
  assert.match(source, /aluMfMdlYn:\s*r\.aluMfMdlYn \|\| 'Y'/)
  assert.match(source, /aluMfHndlH:\s*r\.aluMfHndlH \? Number\(r\.aluMfHndlH\) : null/)
  assert.match(source, /function syncSafetyNetHandleName/)
  assert.match(source, /form\.value\.aluMfHandleTypeNm = selected\?\.commCdNm \|\| ''/)
  assert.match(source, /syncSafetyNetHandleName\(\)\s*\n\s*return buildSashSavePayload/)
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
  assert.match(ventSource, /<label>중간고정<\/label>/)
  assert.match(ventSource, /<label>높이<\/label>/)
  assert.match(ventSource, /form\.aluMfMdlYn === 'Y' \? 'ON' : 'OFF'/)
})

test('SashNew uses web common-code values for safety-net handle options', () => {
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(ventSource, /:value="safetyNetHandleValue\(h\)"/)
  assert.match(ventSource, /function safetyNetHandleValue\(option\)/)
  assert.match(source, /form\.value\.aluMfHandleType = safetyNetHandleValue\(aluMfHandleList\.value\[0\]\)/)
})

test('SashOptionVent treats safety-net handle code 4 as none like web SashForm', () => {
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(ventSource, /if \(form\.value\.aluMfHandleType === '4'\)/)
  assert.match(ventSource, /form\.value\.aluMfHndlH = null/)
  assert.match(ventSource, /form\.value\.aluMfMdlYn = 'Y'/)
  assert.match(ventSource, /:disabled="!form\.aluMfHandleType \|\| form\.aluMfHandleType === '4' \|\| form\.aluMfMdlYn === 'Y'"/)
})

test('SashNew blocks safety net selection when selected model is not safety-net capable', () => {
  const modalSource = readFileSync(resolve(currentDir, '../components/ModelSearchModal.vue'), 'utf8')
  assert.match(modalSource, /aluMdlYn/)
  assert.match(source, /aluMdlYn:\s*''/)
  assert.match(source, /aluMdlYn:\s*normalizeYn\(r\.aluMdlYn\)/)
  assert.match(source, /form\.value\.aluMdlYn = normalizeYn\(row\.aluMdlYn\)/)
  assert.match(source, /const normalized = String\(value \?\? ''\)\.trim\(\)\.toUpperCase\(\)/)
  assert.match(source, /normalized === 'Y' \|\| normalized === 'TRUE' \|\| normalized === '1'/)
  assert.match(source, /function isSafetyNetModel/)
  assert.match(source, /function validateSafetyNetSelection\(\)/)
  assert.match(source, /if \(!isSafetyNetModel\(\)\) return '안전망 모형이 아닙니다'/)
  assert.match(source, /const safetyNetError = validateSafetyNetSelection\(\)/)
  assert.match(source, /if \(safetyNetError\) \{[\s\S]*showError\(safetyNetError\)[\s\S]*return[\s\S]*\}/)
  assert.match(source, /if \(safetyNetError\) return failSubmit\(safetyNetError\)/)
  assert.match(source, /v-if="alertMessage" class="modal-mask"/)
  assert.match(source, /alertMessage\.value = message/)
})

test('SashNew validates safety net options with web SashForm rules', () => {
  assert.match(source, /function isSafetyNetBsmfAllowed\(\)/)
  assert.match(source, /\['101', '106', '107', '105'\]\.includes\(String\(form\.value\.bsmfOrdUtmCd\)\)/)
  assert.match(source, /선택하신 틀짝망코드에서는 안전망을 선택할 수 없습니다\./)
  assert.match(source, /function isFourWWindow\(\)/)
  assert.match(source, /addInfo4:\s*it\.addInfo4/)
  assert.match(source, /wintydiMap\.value\[form\.value\.wintydiCd\]\?\.sfWinCnt/)
  assert.match(source, /4W제품은 안전망을 선택할 수 없습니다/)
  assert.match(source, /function isSafetyNetColorAllowed/)
  assert.match(source, /addInfo39/)
  assert.match(source, /안전망은 외부창 색상이 안전망가능색상일때만 선택할 수 있습니다\./)
  assert.match(source, /안전망은 내부창 색상이 안전망가능색상일때만 선택할 수 있습니다\./)
})

test('SashNew production defaults clear safety net toggle and dependent fields', () => {
  const defaultsStart = source.indexOf('function applyProductionOptionDefaults')
  const defaultsBlock = source.slice(defaultsStart, source.indexOf('applyProductionOptionRules()', defaultsStart))

  assert.ok(defaultsStart > -1)
  assert.match(defaultsBlock, /isAluMf:\s*false/)
  assert.match(defaultsBlock, /aluMfHandleType:\s*''/)
  assert.match(defaultsBlock, /aluMfMdlYn:\s*'Y'/)
  assert.match(defaultsBlock, /aluMfHndlH:\s*null/)
})

test('SashNew does not clear safety-net model capability while applying option defaults', () => {
  const defaultsStart = source.indexOf('function applyProductionOptionDefaults')
  const defaultsEnd = source.indexOf('applyProductionOptionRules()', defaultsStart)
  const defaultsBlock = source.slice(defaultsStart, defaultsEnd)
  assert.ok(defaultsStart > -1)
  assert.doesNotMatch(defaultsBlock, /aluMdlYn:\s*''/)
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
  assert.match(source, /if \(form\.value\.isAluMf\) \{[\s\S]*const safetyNetError = validateSafetyNetSelection\(\)[\s\S]*if \(safetyNetError\) return failSubmit\(safetyNetError\)/)
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
  assert.match(source, /bfArmatureTypeYn:\s*row\.addInfo30 \|\| ''/)
  assert.match(source, /ventHoleYn:\s*row\.addInfo31 \|\| ''/)
  assert.match(source, /bfMillingType:\s*row\.addInfo32 \|\| ''/)
  assert.match(source, /bfWeldNoneYn:\s*row\.addInfo33 \|\| ''/)
  assert.match(source, /sfArmatureTypeYn:\s*row\.addInfo34 \|\| ''/)
  assert.match(source, /sfRollerTypeYn:\s*row\.addInfo35 \|\| ''/)
  assert.match(source, /mfArmatureTypeYn:\s*row\.addInfo36 \|\| ''/)
  assert.match(source, /BF보강재를 규격사양으로 선택하세요/)
  assert.match(source, /BF통기홀을 규격사양으로 선택하세요/)
  assert.match(source, /BF밀링유형을 규격사양으로 선택하세요/)
  assert.match(source, /BF절단바로를 규격사양으로 선택하세요/)
  assert.match(source, /SF보강재를 규격사양으로 선택하세요/)
  assert.match(source, /SF로라를 규격사양으로 선택하세요/)
  assert.match(source, /MF보강재를 규격사양으로 선택하세요/)
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
  assert.match(detailSource, /SashDetailPanel/)
  assert.match(detailSource, /buildSashDrawingUrl\(row\)/)
  assert.match(detailSource, /buildSashMeta\(row\)\.qtyText/)
  assert.match(detailSource, /buildSashMeta\(row\)\.bsmfText/)
  assert.match(detailSource, /statusBadgeClass\(row\)/)
})

test('EstimateDetail separates al-glass rows from editable sash rows', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /알유리 견적/)
  assert.match(detailSource, /const glassRows = ref\(\[\]\)/)
  assert.match(detailSource, /function isGlassEstimateRow\(row = \{\}\)/)
  assert.match(detailSource, /row\.ctgr2Cd === 'P8'/)
  assert.match(detailSource, /glassRows\.value = rows\.filter\(isGlassEstimateRow\)/)
  assert.match(detailSource, /const sashOnlyRows = rows\.filter\(\(row\) => !isGlassEstimateRow\(row\)\)/)
  assert.match(detailSource, /const detailRows = await hydrateSashDetailRows\(sashOnlyRows\)/)
  assert.match(detailSource, /sashRows\.value = await hydrateSashDrawingFiles\(detailRows\)/)
})

test('EstimateDetail fails closed unless header and rows are editable status 10', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /import \{ UNKNOWN_STATUS, isEditableHeaderStatus, isEditableStatus, resolveEffectiveStatus \} from '\.\.\/utils\/estimateStatus'/)
  assert.match(detailSource, /const headerStatus = computed\(\(\) => resolveEffectiveStatus\(header\.value\?\.stCd, header\.value\?\.igStCd\)\)/)
  assert.match(detailSource, /const canAddItem = computed\(\(\) => isEditableHeaderStatus\(headerStatus\.value\)\)/)
  assert.match(detailSource, /v-if="canAddItem"/)
  assert.match(detailSource, /function isSashEditable\(row\)/)
  assert.match(detailSource, /return isEditableStatus\(headerStatus\.value\) && isEditableStatus\(cd\)/)
  assert.match(detailSource, /const editable = isSashEditable\(row\)/)
  assert.match(detailSource, /readonly: editable \? '' : 'Y'/)
  assert.match(detailSource, /stCd: cd === UNKNOWN_STATUS \? '' : cd/)
  assert.doesNotMatch(detailSource, /if \(!sashRows\.value\.length\) return true/)
  assert.doesNotMatch(detailSource, /sashRows\.value\.every/)
})

test('EstimateDetail shows total summary and category amount summary before item sections', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /class="card estimate-detail-hero"/)
  assert.match(detailSource, /estimate-hero-status/)
  assert.match(detailSource, /estimateTotals\.total/)
  assert.match(detailSource, /categoryTotals\.sash/)
  assert.match(detailSource, /categoryTotals\.glass/)
  assert.match(detailSource, /const estimateTotals = computed\(\(\) => sumRows\(\[\.\.\.sashRows\.value, \.\.\.glassRows\.value\]\)\)/)
  assert.match(detailSource, /function rowSupply\(row\)/)
  assert.match(detailSource, /function rowTotal\(row\)/)
})

test('EstimateDetail uses a single add-item action sheet instead of exposing every category button', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /\+ 품목 추가/)
  assert.match(detailSource, /const showItemSheet = ref\(false\)/)
  assert.match(detailSource, /function openItemSheet\(\)/)
  assert.match(detailSource, /function closeItemSheet\(\)/)
  assert.match(detailSource, /v-if="showItemSheet" class="modal-mask"/)
  assert.match(detailSource, /품목 추가[\s\S]*샤시[\s\S]*알유리 직접입력[\s\S]*몰딩[\s\S]*도어[\s\S]*유통자재[\s\S]*패키지/)
  assert.doesNotMatch(detailSource, /간편샤시/)
  assert.doesNotMatch(detailSource, /SashQuickConfigSheet/)
  assert.doesNotMatch(detailSource, /\+ 도어 \(준비중\)/)
  assert.doesNotMatch(detailSource, /\+ 유리 \(준비중\)/)
  assert.doesNotMatch(detailSource, /\+ 몰딩 \(준비중\)/)
})

test('EstimateDetail keeps sash card primary fields compact and moves options into details', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const cardSource = readFileSync(resolve(currentDir, '../components/SashListCard.vue'), 'utf8')
  const panelSource = readFileSync(resolve(currentDir, '../components/SashDetailPanel.vue'), 'utf8')
  assert.match(panelSource, /<summary>내부 생산정보<\/summary>/)
  assert.match(detailSource, /buildGlassSummary\(row\)/)
  assert.match(detailSource, /buildProductionSummary\(row\)/)
  assert.match(detailSource, /buildProductionRemarkSummary\(row\)/)
  assert.match(detailSource, /row\.pdBfRemSrc \? `BF \$\{row\.pdBfRemSrc\}` : ''/)
  assert.match(detailSource, /row\.pdSfRemSrc \? `SF \$\{row\.pdSfRemSrc\}` : ''/)
  assert.match(detailSource, /row\.pdMfRemSrc \? `MF \$\{row\.pdMfRemSrc\}` : ''/)
  assert.match(cardSource, /sizeText/)
  assert.match(cardSource, /qtyText/)
  assert.match(cardSource, /bsmfText/)
  assert.match(cardSource, /colorText/)
})

test('EstimateDetail shows sash window type and customer option chips on compact list cards', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const cardSource = readFileSync(resolve(currentDir, '../components/SashListCard.vue'), 'utf8')
  assert.match(detailSource, /:window-type-text="buildWindowTypeText\(row\)"/)
  assert.match(cardSource, /class="sash-list-chip-row"/)
  assert.match(cardSource, /v-for="chip in props\.optionChips"/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*VENT/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*스크린/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*알유리/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*안전망/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*실리콘마감/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*윈드클로저/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*외주유리/)
  assert.match(detailSource, /buildCustomerOptionChips\(row\)[\s\S]*방충망핸들/)
})

test('EstimateDetail splits option details into customer size material and internal production sections', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const panelSource = readFileSync(resolve(currentDir, '../components/SashDetailPanel.vue'), 'utf8')
  assert.match(panelSource, /고객확인/)
  assert.match(panelSource, /규격 상세/)
  assert.match(panelSource, /자재\/하드웨어/)
  assert.match(panelSource, /내부 생산정보/)
  assert.match(detailSource, /buildCustomerConfirmItems\(row\)/)
  assert.match(detailSource, /buildSizeDetailItems\(row\)/)
  assert.match(detailSource, /buildMaterialHardwareItems\(row\)/)
  assert.match(detailSource, /buildInternalProductionItems\(row\)/)
  assert.match(detailSource, /`W\$\{index\}`/)
  assert.match(detailSource, /`H\$\{index\}`/)
  assert.match(detailSource, /`CS\$\{index\}`/)
  assert.match(detailSource, /SF 내/)
  assert.match(detailSource, /BF 외/)
  assert.match(detailSource, /핸들높이/)
  assert.match(detailSource, /브래킷/)
  assert.match(detailSource, /직송/)
})

test('EstimateDetail does not render raw internal save fields and keeps production remarks out of summary', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const summarySource = readFileSync(resolve(currentDir, 'SashEstimateSummary.vue'), 'utf8')
  assert.doesNotMatch(detailSource, /workDetail/)
  assert.doesNotMatch(detailSource, /erp2Save/)
  assert.doesNotMatch(detailSource, /innosysYn/)
  assert.doesNotMatch(summarySource, /pdBfRemSrc/)
  assert.doesNotMatch(summarySource, /pdSfRemSrc/)
  assert.doesNotMatch(summarySource, /pdMfRemSrc/)
  assert.doesNotMatch(summarySource, /직송/)
  assert.doesNotMatch(summarySource, /생산비고/)
})

test('EstimateDetail marks generated al-glass cards as readonly automatic rows', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /자동생성/)
  assert.match(detailSource, /읽기전용/)
  assert.match(detailSource, /class="sash-card sash-card-readonly"/)
  assert.match(detailSource, /샤시 저장 시 생성된 알유리 견적입니다/)
  assert.match(detailSource, /샤시 수정 화면으로 이동하지 않습니다/)
})

test('EstimateDetail selects sash cards instead of opening edit route directly', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /import SashListCard from '\.\.\/components\/SashListCard\.vue'/)
  assert.match(detailSource, /import SashDetailPanel from '\.\.\/components\/SashDetailPanel\.vue'/)
  assert.match(detailSource, /const selectedSashKey = ref\(''\)/)
  assert.match(detailSource, /function selectSash\(row\)/)
  assert.match(detailSource, /@select="selectSash\(row\)"/)
  assert.match(detailSource, /@edit="editSash\(selectedSashRow\)"/)
  assert.match(detailSource, /async function editSash\(row\)/)
  assert.doesNotMatch(detailSource, /@click="openSash\(row\)"/)
})

test('EstimateDetail remounts selected sash detail panel and image by selected row drawing URL', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const panelSource = readFileSync(resolve(currentDir, '../components/SashDetailPanel.vue'), 'utf8')
  assert.match(detailSource, /<SashDetailPanel[\s\S]*:key="sashRowKey\(selectedSashRow\)"/)
  assert.match(panelSource, /<img[\s\S]*:key="drawingUrl"/)
})

test('EstimateDetail sends every right-panel section from selectedSashRow', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const expectedBindings = [
    /:drawing-url="sashDrawingUrl\(selectedSashRow\)"/,
    /:supply-text="fmtPrice\(rowSupply\(selectedSashRow\)\)"/,
    /:vat-text="fmtPrice\(rowVat\(selectedSashRow\)\)"/,
    /:total-text="fmtPrice\(rowTotal\(selectedSashRow\)\)"/,
    /:option-chips="buildCustomerOptionChips\(selectedSashRow\)"/,
    /:customer-items="buildCustomerConfirmItems\(selectedSashRow\)"/,
    /:size-items="buildSizeDetailItems\(selectedSashRow\)"/,
    /:material-items="buildMaterialHardwareItems\(selectedSashRow\)"/,
    /:internal-items="buildInternalProductionItems\(selectedSashRow\)"/,
    /@edit="editSash\(selectedSashRow\)"/,
  ]
  for (const binding of expectedBindings) assert.match(detailSource, binding)
})

test('EstimateDetail hydrates list rows with sash detail before drawing and panel mapping', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /selectSashDetail/)
  assert.match(detailSource, /mergeSashDetailRow/)
  assert.match(detailSource, /async function hydrateSashDetailRows\(rows\)/)
  assert.match(detailSource, /await selectSashDetail\(\{[\s\S]*itgEstiNo,[\s\S]*estiNo: row\.estiNo \|\| row\.windEstiNo \|\| wEstiNo\.value,[\s\S]*estiNos: row\.estiNos \|\| '1',[\s\S]*estiSeq: row\.estiSeq,[\s\S]*\}\)/)
  assert.match(detailSource, /return mergeSashDetailRow\(row, detail\)/)
  assert.match(detailSource, /const detailRows = await hydrateSashDetailRows\(sashOnlyRows\)/)
  assert.match(detailSource, /sashRows\.value = await hydrateSashDrawingFiles\(detailRows\)/)
})

test('EstimateDetail hydrates model drawings even when saved row already has an image', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /filter\(\(row\) => row\.mdlCd\)/)
  assert.doesNotMatch(detailSource, /row\.mdlCd && !buildSashDrawingUrl\(row\)/)
})

test('EstimateDetail uses mobile detail panel and tablet split view classes', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  const stylesSource = readFileSync(resolve(currentDir, '../styles.css'), 'utf8')
  assert.match(detailSource, /class="sash-detail-layout"/)
  assert.match(detailSource, /class="card sash-list-pane"/)
  assert.match(detailSource, /class="sash-detail-pane"/)
  assert.match(detailSource, /<SashDetailPanel/)
  assert.match(stylesSource, /@media \(min-width:\s*900px\)[\s\S]*\.sash-detail-layout/)
  assert.match(stylesSource, /grid-template-columns:\s*minmax\(320px,\s*420px\)\s*minmax\(0,\s*1fr\)/)
})

test('SashListCard keeps list rows compact and excludes internal production details', () => {
  const cardSource = readFileSync(resolve(currentDir, '../components/SashListCard.vue'), 'utf8')
  assert.match(cardSource, /defineEmits\(\['select'\]\)/)
  assert.match(cardSource, /@click="\$emit\('select'\)"/)
  assert.match(cardSource, /props\.optionChips/)
  assert.match(cardSource, /totalText/)
  assert.match(cardSource, /모형|modelText/)
  assert.match(cardSource, /창형태|windowTypeText/)
  assert.match(cardSource, /W x H|sizeText/)
  assert.match(cardSource, /수량|qtyText/)
  assert.match(cardSource, /색상|colorText/)
  assert.match(cardSource, /틀짝망|bsmfText/)
  assert.doesNotMatch(cardSource, /pdBfRemSrc|pdSfRemSrc|pdMfRemSrc/)
  assert.doesNotMatch(cardSource, /직송|생산비고|workDetail|erp2Save|innosysYn/)
})

test('SashDetailPanel owns edit action and keeps internal production info collapsed', () => {
  const panelSource = readFileSync(resolve(currentDir, '../components/SashDetailPanel.vue'), 'utf8')
  assert.match(panelSource, /defineEmits\(\['edit', 'image-error'\]\)/)
  assert.match(panelSource, /@click="\$emit\('edit'\)"/)
  assert.match(panelSource, /v-if="editable"/)
  assert.match(panelSource, /도면/)
  assert.match(panelSource, /공급가/)
  assert.match(panelSource, /고객확인/)
  assert.match(panelSource, /규격 상세/)
  assert.match(panelSource, /자재\/하드웨어/)
  assert.match(panelSource, /<details v-if="internalItems\.length" class="sash-panel-section sash-panel-internal"/)
  assert.match(panelSource, /내부 생산정보/)
})

test('SashNew declares and restores MEDIUM parity fields instead of relying on dynamic v-model properties', () => {
  const mediumFields = [
    'glasAttachYn',
    'basedfillingPiecesYn',
    'sfArmatureType',
    'mfArmatureType',
    'bfVentHoleLctn',
    'bfWinCbMilingType',
    'sfInsideRightBrdYn',
    'sfMcOneReqYn',
    'sfBrdProcYn',
    'sfHandleProcYn',
    'sfAptArmatureType',
    'sfAptHandleType',
    'drwgCd',
  ]

  for (const field of mediumFields) {
    assert.match(source, new RegExp(`${field}:`), `${field} missing from form defaults or edit restore`)
  }
  assert.match(source, /glasAttachYn:\s*isYnValue\(r\.glasAttachYn\)/)
  assert.match(source, /basedfillingPiecesYn:\s*r\.basedfillingPiecesYn === 'Y'/)
  assert.match(source, /sfInsideRightBrdYn:\s*r\.sfInsideRightBrdYn === 'Y'/)
  assert.match(source, /sfAptHandleType:\s*r\.sfAptHandleType \|\| ''/)
})

test('SashOptionGlass labels glasAttachYn with the web SashForm screen text', () => {
  const glassSource = readFileSync(resolve(currentDir, '../components/SashOptionGlass.vue'), 'utf8')
  assert.match(glassSource, /v-model="form\.glasAttachYn" label="실리콘 마감여부"/)
  assert.doesNotMatch(glassSource, /label="유리부착"/)
})

test('SashNew uses drawing API state to prevent stale drwgCd after VENT changes', () => {
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(source, /searchDrwgFileAjax/)
  assert.match(source, /normalizeDrwgFileAjaxResult/)
  assert.match(source, /resolveVentDrawingState/)
  assert.match(source, /async function updateDrawingFileByVent/)
  assert.match(source, /form\.value\.drwgCd = ''/)
  assert.match(source, /apiRow = normalizeDrwgFileAjaxResult\(data\)/)
  assert.match(source, /form\.value\.drwgCd = nextState\.drwgCd/)
  assert.match(source, /async function onVentChange\(val\)[\s\S]*await updateDrawingFileByVent\(\{ keepDisplayFallback: true \}\)/)
  assert.doesNotMatch(source, /function applyVentDefault\(\)[\s\S]*updateDrawingFileByVent\(\{ keepDisplayFallback: true \}\)[\s\S]*function hydrateModelDrawing/)
  assert.match(source, /@vent-change="onVentChange"/)
  assert.match(ventSource, /@change="\$emit\('ventChange', form\.ventLoc\)"/)
})

test('SashNew filters safety-net handle options to web-visible general and none values', () => {
  const ventSource = readFileSync(resolve(currentDir, '../components/SashOptionVent.vue'), 'utf8')
  assert.match(source, /searchCodeList\('387'\)/)
  assert.match(source, /normalizeSafetyNetHandleOptions\(normCd\(aluMfHandleRes\.data\?\.resultList\)\)/)
  assert.match(source, /normalizeSafetyNetHandleValue\(r\.aluMfHandleType\)/)
  assert.match(source, /normalizeSafetyNetHandleValue\(handleType\)/)
  assert.match(source, /function safetyNetHandleValue\(option\)[\s\S]*normalizeSafetyNetHandleValue/)
  assert.match(ventSource, /if \(form\.value\.aluMfHandleType === '4'\)/)
  assert.match(ventSource, /form\.value\.aluMfHndlH = null/)
  assert.match(ventSource, /form\.value\.aluMfMdlYn = 'Y'/)
})

test('SashNew fails closed for readonly or unknown estimate status', () => {
  assert.match(source, /import \{ UNKNOWN_STATUS, isEditableHeaderStatus, isEditableStatus, resolveEffectiveStatus \} from '\.\.\/utils\/estimateStatus'/)
  assert.match(source, /const headerStatus = ref\(UNKNOWN_STATUS\)/)
  assert.match(source, /const estimateStatus = ref\(UNKNOWN_STATUS\)/)
  assert.match(source, /const isReadonly = computed\([\s\S]*route\.query\.readonly === 'Y'[\s\S]*isEditMode\.value \? isEditableStatus\(headerStatus\.value\) : isEditableHeaderStatus\(headerStatus\.value\)[\s\S]*isEditMode\.value && !isEditableStatus\(estimateStatus\.value\)/)
  assert.match(source, /async function loadEstimateStatus\(\)/)
  assert.match(source, /headerStatus\.value = UNKNOWN_STATUS[\s\S]*estimateStatus\.value = UNKNOWN_STATUS/)
  assert.match(source, /headerStatus\.value = resolveEffectiveStatus\(header\.stCd, header\.igStCd\)/)
  assert.match(source, /estimateStatus\.value = headerStatus\.value/)
  assert.match(source, /catch \(_\) \{[\s\S]*headerStatus\.value = UNKNOWN_STATUS[\s\S]*estimateStatus\.value = UNKNOWN_STATUS/)
  assert.match(source, /if \(isReadonly\.value\) return failSubmit\('현재 수정할 수 없는 상태입니다'\)/)
  assert.doesNotMatch(source, /resolveEffectiveStatus\(route\.query\.stCd/)
})

test('SashNew trusts API status over route query for editability', () => {
  assert.match(source, /const rowStatus = resolveEffectiveStatus\(r\.stCd, r\.igStCd\)/)
  assert.match(source, /estimateStatus\.value = rowStatus === UNKNOWN_STATUS \? headerStatus\.value : rowStatus/)

  const headerStatusIndex = source.indexOf('isEditMode.value ? isEditableStatus(headerStatus.value) : isEditableHeaderStatus(headerStatus.value)')
  const rowStatusIndex = source.indexOf('isEditMode.value && !isEditableStatus(estimateStatus.value)')
  assert.ok(headerStatusIndex > -1)
  assert.ok(rowStatusIndex > headerStatusIndex)

  assert.doesNotMatch(source, /headerStatus\.value = resolveEffectiveStatus\(route\.query\.stCd/)
  assert.doesNotMatch(source, /estimateStatus\.value = resolveEffectiveStatus\(route\.query\.stCd/)
})

test('SashNew status policy allows header 20 for new sash but only status 10 for row edits', () => {
  const canSave = ({ headerStatus, rowStatus = UNKNOWN_STATUS, isEditMode = false, queryReadonly = false }) => {
    const estimateStatus = rowStatus === UNKNOWN_STATUS ? headerStatus : rowStatus
    return !(
      queryReadonly ||
      !(isEditMode ? isEditableStatus(headerStatus) : isEditableHeaderStatus(headerStatus)) ||
      (isEditMode && !isEditableStatus(estimateStatus))
    )
  }

  assert.equal(canSave({ headerStatus: '0' }), true, 'header 0 + new is editable before first item')
  assert.equal(canSave({ headerStatus: '10' }), true, 'header 10 + new is editable')
  assert.equal(canSave({ headerStatus: '20' }), true, 'header 20 + new is editable')
  assert.equal(canSave({ headerStatus: UNKNOWN_STATUS }), false, 'header UNKNOWN + new is readonly')
  assert.equal(canSave({ headerStatus: '' }), false, 'blank header + new is readonly')
  assert.equal(canSave({ headerStatus: '10', rowStatus: '10', isEditMode: true }), true, 'header 10 + row 10 is editable')
  assert.equal(canSave({ headerStatus: '10', rowStatus: '20', isEditMode: true }), false, 'header 10 + row 20 is readonly')
  assert.equal(canSave({ headerStatus: '20', rowStatus: '10', isEditMode: true }), false, 'header 20 + row 10 is readonly')
  assert.equal(canSave({ headerStatus: '0', rowStatus: '10', isEditMode: true }), false, 'header 0 does not allow editing an existing row')
  assert.equal(canSave({ headerStatus: '10', rowStatus: UNKNOWN_STATUS, isEditMode: true }), true, 'header 10 + row UNKNOWN falls back to header')
  assert.equal(canSave({ headerStatus: UNKNOWN_STATUS }), false, 'route query stCd=10 cannot override API failure')
})

test('EstimateDetail resolves screen type names and shows loading while opening sash detail', () => {
  const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
  assert.match(detailSource, /searchCodeList\('379'\)/)
  assert.match(detailSource, /buildSashScreenText\(row,\s*screenList\.value\)/)
  assert.match(detailSource, /openingSash/)
  assert.match(detailSource, /샤시 상세 불러오는 중/)
})

test('SashNew captures and restores saved edit values around model master reload', () => {
  assert.match(source, /import \{ captureSashEditValues, restoreSashEditValues \} from '\.\.\/utils\/sashEditPreserve'/)
  assert.match(source, /const savedEditValues = captureSashEditValues\(form\.value\)/)
  assert.match(source, /await onModelPick\(\{ \.\.\.r \}, \{ preserveProductionOptions: true \}\)/)
  assert.match(source, /restoreSashEditValues\(form\.value, savedEditValues\)/)
  assert.ok(source.indexOf('const savedEditValues = captureSashEditValues(form.value)') < source.indexOf('await onModelPick({ ...r }, { preserveProductionOptions: true })'))
  assert.ok(source.indexOf('await onModelPick({ ...r }, { preserveProductionOptions: true })') < source.indexOf('restoreSashEditValues(form.value, savedEditValues)'))
})
