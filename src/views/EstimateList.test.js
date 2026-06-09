import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'EstimateList.vue'), 'utf8')
const newSource = readFileSync(resolve(currentDir, 'EstimateNew.vue'), 'utf8')
const stylesSource = readFileSync(resolve(currentDir, '../styles.css'), 'utf8')
const estimateApiSource = readFileSync(resolve(currentDir, '../api/estimate.js'), 'utf8')
const routerSource = readFileSync(resolve(currentDir, '../router/index.js'), 'utf8')
const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
const editSourcePath = resolve(currentDir, 'EstimateEdit.vue')
const editSource = existsSync(editSourcePath) ? readFileSync(editSourcePath, 'utf8') : ''

test('EstimateList restores the selected branch for admins and keeps non-admin default branch', () => {
  assert.match(source, /import \{ loadSelectedBzpc, saveSelectedBzpc \} from '\.\.\/utils\/selectedBzpcStorage'/)
  assert.match(source, /if \(!auth\.isAdmin && auth\.bzpc\) \{[\s\S]*bzpc: auth\.bzpc[\s\S]*bzpcNm: auth\.bzpcNm[\s\S]*vkbur: auth\.vkbur[\s\S]*vkgrp: auth\.vkgrp[\s\S]*search\(\)[\s\S]*return[\s\S]*\}/)
  assert.match(source, /const saved = loadSelectedBzpc\(\)/)
  assert.match(source, /if \(saved\?\.bzpc\) \{[\s\S]*selectedBzpc\.value = saved[\s\S]*search\(\)[\s\S]*\}/)
  assert.match(source, /saveSelectedBzpc\(v\)/)
  assert.doesNotMatch(source, /sessionStorage\.setItem\('mobile_selected_bzpc'/)
})

test('EstimateNew locks the branch from shared selected branch storage', () => {
  assert.match(newSource, /import \{ loadSelectedBzpc \} from '\.\.\/utils\/selectedBzpcStorage'/)
  assert.match(newSource, /const saved = loadSelectedBzpc\(\)/)
  assert.match(newSource, /if \(saved\?\.bzpc\) \{[\s\S]*selectedBzpc\.value = saved[\s\S]*bzpcLocked\.value = true[\s\S]*\}/)
  assert.doesNotMatch(newSource, /sessionStorage\.getItem\('mobile_selected_bzpc'\)/)
})

test('global design tokens expose the B2B mobile app palette aliases', () => {
  const tokens = [
    '--bg: #f6f8fb',
    '--surface: #ffffff',
    '--surface-soft: #f9fafb',
    '--text-main: #111827',
    '--text-sub: #6b7280',
    '--border: #e5e7eb',
    '--primary: #2563eb',
    '--primary-dark: #1d4ed8',
    '--success: #16a34a',
    '--warning: #f59e0b',
    '--danger: #dc2626',
  ]
  for (const token of tokens) assert.match(stylesSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(stylesSource, /\.card\s*\{[\s\S]*border-radius:\s*var\(--radius-lg\)/)
  assert.match(stylesSource, /\.btn\s*\{[\s\S]*min-height:\s*44px/)
  assert.match(stylesSource, /\.badge\s*\{[\s\S]*border-radius:\s*var\(--radius-full\)/)
})

test('EstimateList renders B2B estimate rows as clear touch cards', () => {
  assert.match(source, /class="estimate-list-page"/)
  assert.match(source, /class="card estimate-filter-card"/)
  assert.match(source, /class="estimate-card"/)
  assert.match(source, /class="estimate-card-head"/)
  assert.match(source, /class="estimate-card-title"/)
  assert.match(source, /class="estimate-card-meta"/)
  assert.match(source, /class="estimate-card-grades"/)
  assert.match(source, /class="estimate-card-amount"/)
  assert.match(source, /formatEstimateAmount\(row\)/)
  assert.match(source, /상태/)
  assert.doesNotMatch(source, /시공비|철거비|프로모션|소비자/)
})

test('EstimateList displays customer discount grade chips from header rows', () => {
  assert.match(source, /buildGradeChips\(row\)/)
  assert.match(source, /gradeValue\(row,\s*'dplcDcGrdNm',\s*'dplcDcGrd'\)/)
  for (const key of [
    'dplcDcGrdNm',
    'dplcDcGrdDoorNm',
    'dplcDcGrdGlasNm',
    'dplcDcGrdMoldNm',
    'dplcDcGrdPannelNm',
    'dplcDcGrdOtherCompNm',
    'dplcDcGrdDtbtMtrlNm',
    'dplcDcGrdDtbtGoodsNm',
  ]) {
    assert.match(source, new RegExp(key))
  }
  for (const key of [
    'buildCrossGradeChips',
    '크로스',
    'dplcDcGrdDoorCr',
    'dplcDcGrdMoldCr',
    'dplcDcGrdDtbtMtrlCr',
    'dplcDcGrdDtbtGoodsCr',
  ]) {
    assert.doesNotMatch(source, new RegExp(key))
  }
  assert.match(stylesSource, /\.estimate-card-grades\s*\{[\s\S]*flex-wrap:\s*wrap/)
  assert.match(stylesSource, /\.estimate-grade-chip/)
  assert.doesNotMatch(source, /시공비|철거비|프로모션|소비자/)
})

test('EstimateList exposes a demo-ready hero with summary metrics and new estimate CTA', () => {
  assert.match(source, /class="page-hero-card estimate-list-hero"/)
  assert.match(source, /샤시 공급견적|통합견적/)
  assert.match(source, /거래처별 모바일 견적을 빠르게 조회하고 작성합니다/)
  assert.match(source, /@click="goNewEstimate"/)
  assert.match(source, /신규 견적/)
  assert.match(source, /class="metric-grid"/)
  assert.match(source, /조회 결과/)
  assert.match(source, /{{ summaryMetrics\.total }}건/)
  assert.match(source, /작성중/)
  assert.match(source, /진행중/)
  assert.match(source, /summaryMetrics/)
  assert.match(source, /totalAmountText/)
})

test('EstimateList empty state includes a new estimate call to action', () => {
  assert.match(source, /class="empty empty-action"/)
  assert.match(source, /조회된 견적이 없습니다/)
  assert.match(source, /견적을 새로 작성/)
})

test('EstimateNew presents the header form as a guided mobile estimate flow', () => {
  assert.match(newSource, /class="page-title-row"/)
  assert.match(newSource, /class="page-subtitle"/)
  assert.match(newSource, /class="form-step-note"/)
  assert.match(newSource, /1\/3 기본정보/)
  for (const title of [
    '영업소/견적 기본정보',
    '거래처',
    '현장/배송정보',
    '주문/인수 정보',
    '비고',
  ]) {
    assert.match(newSource, new RegExp(title))
  }
  assert.match(newSource, /class="bottom-action-bar"/)
  assert.match(newSource, /견적 저장 후 샤시 추가|견적 저장/)
  assert.doesNotMatch(newSource, /견적 헤더 저장/)
})

test('EstimateNew adds web parity delivery branch header fields without removing existing header fields', () => {
  assert.match(estimateApiSource, /export function searchDvpcListSysAdmin\(payload\s*=\s*\{\}\)/)
  assert.match(estimateApiSource, /\/ItgEstiOne\/searchDvpcListSysAdmin/)
  assert.match(estimateApiSource, /export function searchDvpcCode\(payload\s*=\s*\{\}\)/)
  assert.match(estimateApiSource, /\/ItgEstiOne\/searchDvpcCode/)

  assert.match(newSource, /import \{ saveEstiHeader, searchDvpcCode, searchDvpcListSysAdmin \} from '\.\.\/api\/estimate'/)
  assert.match(newSource, /배송지점/)
  assert.match(newSource, /v-model="form\.headerSaveDvpc"/)
  assert.match(newSource, /dvpcOptions/)
  assert.match(newSource, /dvpcYn/)
  assert.match(newSource, /headerBasicDvpc/)
  assert.match(newSource, /searchDvpcListSysAdmin\(\{ bzpc: selectedBzpc\.value\.bzpc \}\)/)
  assert.match(newSource, /searchDvpcCode\(\{ bzpc: selectedBzpc\.value\.bzpc \}\)/)
  assert.match(newSource, /defaultDvpcVisibleBzpcYn/)
  assert.match(newSource, /defaultDvpc/)
  assert.match(newSource, /matchBranchDvpcOption/)
  assert.match(newSource, /if \(dvpcYn\.value === 'Y' && !form\.value\.headerSaveDvpc\)/)
  assert.match(newSource, /headerSaveDvpc:\s*stringValue\(form\.value\.headerSaveDvpc\)/)
  assert.match(newSource, /headerBasicDvpc:\s*stringValue\(form\.value\.headerBasicDvpc\)/)

  const shippingSectionIndex = newSource.indexOf('<div class="form-section-title">현장/배송정보</div>')
  const noteIndex = newSource.indexOf('v-model="form.dplcReqRemSrc"', shippingSectionIndex)
  const deliveryIndex = newSource.indexOf('v-model="form.headerSaveDvpc"', shippingSectionIndex)
  const remarkSectionIndex = newSource.indexOf('<div class="form-section-title">비고</div>')
  assert.ok(shippingSectionIndex > -1)
  assert.ok(noteIndex > shippingSectionIndex)
  assert.ok(deliveryIndex > shippingSectionIndex)
  assert.ok(remarkSectionIndex > deliveryIndex)
  assert.equal(newSource.indexOf('v-model="form.dplcReqRemSrc"', remarkSectionIndex), -1)

  for (const field of [
    'dplcReqRemSrc',
    'jobsNm',
    'dplcCrgrNm',
    'dplcCrgrTel',
    'dplcCrgrMobile',
    'ordrInfo',
    'unprInfo',
  ]) {
    assert.match(newSource, new RegExp(field))
  }
  assert.match(newSource, /담당자 전화번호/)
  assert.match(newSource, /담당자 휴대폰/)
})

test('EstimateNew lets users edit copied estimate header discount grades with saved grade codes', () => {
  assert.match(newSource, /import \{ searchClientGradeOptions \} from '\.\.\/api\/client'/)
  assert.match(newSource, /buildClientGradeOptionGroups/)
  assert.match(newSource, /gradeGroups/)
  assert.match(newSource, /normalGradeItems/)
  assert.match(newSource, /v-model="form\.dplcGrpGrade\[item\.field\]"/)
  assert.match(newSource, /searchClientGradeOptions\(\)/)
  assert.match(newSource, /buildEstimateGradePayload\(form\.value\.dplcGrpGrade\)/)
  assert.match(newSource, /validateEstimateGrades\(form\.value\.dplcGrpGrade\)/)
  assert.match(newSource, /validateEstimateRates\(ratePayload\)/)
  assert.doesNotMatch(newSource, /crossGradeItems|크로스 할인등급|gradeGroups\.value\.cross/)
  for (const field of [
    'dplcDcGrdDoorCr',
    'dplcDcGrdMoldCr',
    'dplcDcGrdDtbtMtrlCr',
    'dplcDcGrdDtbtGoodsCr',
    'dplcDoorCrRt',
    'dplcMoldCrRt',
    'dplcDtbtMtrlCrRt',
    'dplcDtbtGoodsCrRt',
  ]) {
    assert.doesNotMatch(newSource, new RegExp(field))
  }
  assert.doesNotMatch(newSource, /dplcGrpGrade\[item\.field\]\s*=\s*option\.rate/)
})

test('EstimateNew sends only normal 8 header grade rates and excludes S/cross options', () => {
  assert.match(newSource, /const ESTIMATE_GRADE_ITEMS = \[/)
  assert.match(newSource, /rateField:\s*'dplcRt'/)
  assert.match(newSource, /rateField:\s*'dplcDoorRt'/)
  assert.match(newSource, /rateField:\s*'dplcDtbtGoodsRt'/)
  assert.match(newSource, /selectedGradeRate\(item,\s*grades\[item\.field\],\s*fallbackRates\)/)
  assert.match(newSource, /const ratePayload = buildEstimateRatePayload\(form\.value\.dplcGrpGrade,\s*form\.value\.dplcRate\)/)
  assert.match(newSource, /\.\.\.ratePayload/)
  assert.match(newSource, /dplcRate:\s*ratePayload/)
  for (const field of [
    'dplcRt',
    'dplcDoorRt',
    'dplcPannelRt',
    'dplcOtherCompRt',
    'dplcGlasRt',
    'dplcMoldRt',
    'dplcDtbtMtrlRt',
    'dplcDtbtGoodsRt',
  ]) {
    assert.match(newSource, new RegExp(field))
  }
  for (const field of [
    'dplcDoorCrRt',
    'dplcMoldCrRt',
    'dplcDtbtMtrlCrRt',
    'dplcDtbtGoodsCrRt',
    'value="S"',
    'S등급',
  ]) {
    assert.doesNotMatch(newSource, new RegExp(field))
  }
})

test('EstimateEdit route and detail header edit action are wired for editable headers', () => {
  assert.match(routerSource, /path:\s*'\/estimates\/:itgEstiNo\/edit'/)
  assert.match(routerSource, /EstimateEdit\.vue/)
  assert.match(detailSource, /const canEditHeader = computed\(\(\) => \['0', '10'\]\.includes\(headerStatus\.value\)\)/)
  assert.match(detailSource, /v-if="canEditHeader"[\s\S]*헤더 수정/)
  assert.match(detailSource, /router\.push\(`\/estimates\/\$\{itgEstiNo\}\/edit`\)/)
})

test('EstimateEdit loads an existing header and saves only mobile-editable header fields', () => {
  assert.ok(editSource, 'EstimateEdit.vue should exist')
  assert.match(editSource, /import \{ saveEstiHeader, selectEstiHeader, searchDvpcCode, searchDvpcListSysAdmin \} from '\.\.\/api\/estimate'/)
  assert.match(editSource, /import \{ searchClientGradeOptions \} from '\.\.\/api\/client'/)
  assert.match(editSource, /buildClientGradeOptionGroups/)
  assert.match(editSource, /selectEstiHeader\(itgEstiNo\)/)
  assert.match(editSource, /saveEstiHeader\(payload\)/)
  assert.match(editSource, /itgEstiNo:\s*itgEstiNo/)
  assert.match(editSource, /router\.push\(`\/estimates\/\$\{itgEstiNo\}`\)/)
  assert.match(editSource, /const canSave = computed\(\(\) => \['0', '10'\]\.includes\(headerStatus\.value\)\)/)
  assert.match(editSource, /상태 20 이상에서는 견적 헤더를 수정할 수 없습니다|현재 상태에서는 견적 헤더를 수정할 수 없습니다/)

  for (const field of [
    'itgEstiNm',
    'estiVldDt',
    'delivryDt',
    'jobsNm',
    'dplcReqRemSrc',
    'dplcCrgrNm',
    'dplcCrgrTel',
    'dplcCrgrMobile',
    'headerSaveDvpc',
    'adr1',
    'adr2',
    'ordrInfo',
    'unprInfo',
    'remSrc',
  ]) {
    assert.match(editSource, new RegExp(field))
  }

  assert.match(editSource, /영업소/)
  assert.match(editSource, /거래처/)
  assert.match(editSource, /class="readonly-display"[\s\S]*form\.bzpcNm/)
  assert.match(editSource, /class="readonly-display"[\s\S]*form\.dplcNm/)
  assert.doesNotMatch(editSource, /DplcSearchModal/)
  assert.doesNotMatch(editSource, /BzpcSelector/)
  assert.match(editSource, /dplcGrpGrade/)
  assert.match(editSource, /dplcRate/)
  assert.match(editSource, /mapHeaderGrade\(row\)/)
  assert.match(editSource, /mapHeaderRate\(row\)/)
  assert.match(editSource, /buildEstimateGradePayload\(form\.value\.dplcGrpGrade\)/)
  assert.match(editSource, /buildEstimateRatePayload\(form\.value\.dplcGrpGrade,\s*form\.value\.dplcRate\)/)
  assert.match(editSource, /\.\.\.buildEstimateGradePayload\(form\.value\.dplcGrpGrade\)/)
  assert.match(editSource, /\.\.\.ratePayload/)
  assert.match(editSource, /dplcGrpGrade:\s*\{ \.\.\.form\.value\.dplcGrpGrade \}/)
  assert.match(editSource, /dplcRate:\s*ratePayload/)
  assert.match(editSource, /validateEstimateGrades\(form\.value\.dplcGrpGrade\)/)
  assert.match(editSource, /validateEstimateRates\(buildEstimateRatePayload\(form\.value\.dplcGrpGrade,\s*form\.value\.dplcRate\)\)/)
  assert.match(editSource, /할인등급 변경은 견적헤더 기준값을 수정합니다/)
  assert.doesNotMatch(editSource, /crossGradeItems|크로스 할인등급|gradeGroups\.value\.cross/)
  for (const field of [
    'dplcDcGrdDoorCr',
    'dplcDcGrdMoldCr',
    'dplcDcGrdDtbtMtrlCr',
    'dplcDcGrdDtbtGoodsCr',
    'dplcDoorCrRt',
    'dplcMoldCrRt',
    'dplcDtbtMtrlCrRt',
    'dplcDtbtGoodsCrRt',
  ]) {
    assert.doesNotMatch(editSource, new RegExp(field))
  }
  assert.doesNotMatch(editSource, /saveClient\(/)
  assert.doesNotMatch(editSource, /dplcGrpGrade\[item\.field\]\s*=\s*option\.rate/)
})

test('EstimateDetail exposes header edit action and a clear discount grade section title', () => {
  assert.match(detailSource, /v-if="canEditHeader"[\s\S]*헤더 수정/)
  assert.match(detailSource, /const canEditHeader = computed\(\(\) => \['0', '10'\]\.includes\(headerStatus\.value\)\)/)
  assert.match(detailSource, /<div class="section-title">할인등급<\/div>/)
  assert.match(detailSource, /class="estimate-grade-summary grade-row"/)
  for (const field of [
    'dplcDcGrdDoorCr',
    'dplcDcGrdMoldCr',
    'dplcDcGrdDtbtMtrlCr',
    'dplcDcGrdDtbtGoodsCr',
  ]) {
    assert.doesNotMatch(detailSource, new RegExp(field))
  }
})

test('EstimateDetail keeps summary and back in the title actions and header actions in the hero card', () => {
  const titleActionsStart = detailSource.indexOf('<div class="title-actions">')
  const titleActionsEnd = detailSource.indexOf('</div>', titleActionsStart)
  const titleActions = detailSource.slice(titleActionsStart, titleActionsEnd)
  assert.ok(titleActionsStart > -1)
  assert.match(titleActions, /견적요약/)
  assert.match(titleActions, /router\.push\(`\/estimates\/\$\{itgEstiNo\}\/sash-summary`\)/)
  assert.match(titleActions, /뒤로/)
  assert.doesNotMatch(titleActions, /헤더 수정|샤시 요약/)

  const heroStart = detailSource.indexOf('<section class="card estimate-detail-hero">')
  const heroEnd = detailSource.indexOf('</section>', heroStart)
  const heroSource = detailSource.slice(heroStart, heroEnd)
  assert.match(heroSource, /v-if="canEditHeader"[\s\S]*router\.push\(`\/estimates\/\$\{itgEstiNo\}\/edit`\)[\s\S]*헤더 수정/)
  assert.match(heroSource, /v-if="canAddItem"[\s\S]*:disabled="issuing"[\s\S]*@click="openItemSheet"[\s\S]*\+ 품목 추가/)

  const actionStart = detailSource.indexOf('<div class="estimate-action-row">')
  const actionEnd = detailSource.indexOf('</div>', actionStart)
  const actionSource = detailSource.slice(actionStart, actionEnd)
  assert.match(actionSource, /헤더 수정/)
  assert.match(actionSource, /\+ 품목 추가/)
  assert.doesNotMatch(actionSource, /샤시 요약|sash-summary/)
})

test('EstimateDetail does not duplicate estimate summary inside the sash list section', () => {
  const listPaneStart = detailSource.indexOf('<div class="card sash-list-pane">')
  const detailPaneStart = detailSource.indexOf('<div class="sash-detail-pane">', listPaneStart)
  const listPaneSource = detailSource.slice(listPaneStart, detailPaneStart)
  assert.ok(listPaneStart > -1)
  assert.doesNotMatch(listPaneSource, /견적요약|샤시 요약|sash-summary/)
})

test('EstimateDetail shows labeled project and customer estimate remarks in the header hero', () => {
  assert.match(detailSource, /class="estimate-header-info"/)
  assert.match(detailSource, /<span>거래처<\/span>[\s\S]*header\.dplcNm/)
  assert.match(detailSource, /<span>현장명<\/span>[\s\S]*header\.jobsNm/)
  assert.match(detailSource, /<span>고객견적비고<\/span>[\s\S]*header\.dplcReqRemSrc/)
  assert.doesNotMatch(detailSource, /v-if="header\.dplcReqRemSrc" class="estimate-hero-note"/)
  assert.match(stylesSource, /\.estimate-header-info\s*\{[\s\S]*grid-template-columns/)
  assert.match(stylesSource, /\.estimate-header-info-value\s*\{[\s\S]*white-space:\s*pre-wrap/)
})

test('sash detail and summary typography is large enough for mobile review', () => {
  assert.match(stylesSource, /\.sash-list-chip\s*\{[\s\S]*font-size:\s*12px/)
  assert.match(stylesSource, /\.sash-list-card-meta span\s*\{[\s\S]*font-size:\s*12px/)
  assert.match(stylesSource, /\.sash-panel-grid strong\s*\{[\s\S]*font-size:\s*14px/)
  assert.match(stylesSource, /\.sash-panel-amounts strong\s*\{[\s\S]*font-size:\s*14px/)
  assert.match(stylesSource, /\.sash-panel-section-title,[\s\S]*\.sash-panel-internal summary\s*\{[\s\S]*font-size:\s*13px/)
  assert.match(stylesSource, /\.summary-table td strong\s*\{[\s\S]*font-size:\s*12px/)
  assert.match(stylesSource, /\.summary-header-grid strong\s*\{[\s\S]*font-size:\s*14px/)
})
