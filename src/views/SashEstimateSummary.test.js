import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'SashEstimateSummary.vue'), 'utf8')
const routerSource = readFileSync(resolve(currentDir, '../router/index.js'), 'utf8')
const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
const stylesSource = readFileSync(resolve(currentDir, '../styles.css'), 'utf8')

test('SashEstimateSummary is routed from estimate detail as an internal B2B summary screen', () => {
  assert.match(routerSource, /\/estimates\/:itgEstiNo\/sash-summary/)
  assert.match(routerSource, /import\('\.\.\/views\/SashEstimateSummary\.vue'\)/)
  assert.match(detailSource, /샤시 요약/)
  assert.match(detailSource, /sash-summary/)
})

test('SashEstimateSummary loads header and sash rows from existing mobile APIs', () => {
  assert.match(source, /selectEstiHeader\(itgEstiNo\)/)
  assert.match(source, /searchSashList\(\{ itgEstiNo, estiNo: wEstiNo\.value \}\)/)
  assert.match(source, /normalizeSashRows\(sashData\)/)
  assert.match(source, /isGlassEstimateRow/)
})

test('SashEstimateSummary exposes B2B row specs and totals without internal fields', () => {
  const labels = [
    '샤시 견적 요약',
    '거래처명',
    '영업소',
    '견적번호',
    '견적일',
    '담당자',
    '견적상태',
    '총 견적금액',
    '샤시',
    '공급가',
    'VAT',
    '품목',
    '규격',
    '옵션',
    '금액',
    '비고:',
  ]

  for (const label of labels) assert.match(source, new RegExp(label))

  assert.doesNotMatch(source, /workDetail/)
  assert.doesNotMatch(source, /erp2Save/)
  assert.doesNotMatch(source, /innosysYn/)
  assert.doesNotMatch(source, /마진/)
  assert.doesNotMatch(source, /원가/)
})

test('SashEstimateSummary does not expose production remarks in B2B summary', () => {
  assert.doesNotMatch(source, /BF 생산옵션/)
  assert.doesNotMatch(source, /SF 생산옵션/)
  assert.doesNotMatch(source, /MF 생산옵션/)
  assert.doesNotMatch(source, /pdBfRemSrc/)
  assert.doesNotMatch(source, /pdSfRemSrc/)
  assert.doesNotMatch(source, /pdMfRemSrc/)
  assert.doesNotMatch(source, /hasProductionRemarks/)
  assert.doesNotMatch(source, /summary-production/)
})

test('SashEstimateSummary keeps print MVP and TODOs only for future sharing features', () => {
  assert.match(source, /window\.print\(\)/)
  assert.match(source, /TODO: shareToken/)
  assert.match(source, /TODO: 엑셀/)
  assert.match(source, /TODO: 거래처 확인/)
  assert.match(source, /TODO: 이미지\/JPG/)
})

test('SashEstimateSummary uses one compressed grid at every screen size', () => {
  assert.match(source, /class="card summary-table-wrap"/)
  assert.match(stylesSource, /\.summary-table-wrap/)
  assert.match(stylesSource, /\.summary-table-wrap\s*\{[\s\S]*display:\s*block/)
  assert.doesNotMatch(source, /summary-mobile-list/)
  assert.doesNotMatch(source, /summary-row-card/)
  assert.doesNotMatch(source, /summary-compact-list/)
  assert.doesNotMatch(stylesSource, /\.summary-mobile-list/)
  assert.doesNotMatch(stylesSource, /\.summary-row-card/)
  assert.doesNotMatch(stylesSource, /\.summary-compact-list/)
  assert.doesNotMatch(stylesSource, /overflow-x:\s*auto/)
  assert.match(stylesSource, /\.summary-table\s*\{[\s\S]*min-width:\s*0/)
  assert.doesNotMatch(stylesSource, /min-width:\s*1180px/)
  assert.match(stylesSource, /@media print[\s\S]*\.app-header[\s\S]*display:\s*none/)
  assert.match(stylesSource, /@media print[\s\S]*\.summary-print-action[\s\S]*display:\s*none/)
})

test('SashEstimateSummary uses simplified B2B table columns and compact mobile fields', () => {
  const columnLabels = ['NO', '품목', '규격', '옵션', '금액']
  for (const label of columnLabels) assert.match(source, new RegExp(`<th>${label}</th>`))

  assert.doesNotMatch(source, /<th>위치<\/th>/)
  assert.doesNotMatch(source, /<th>견적순번<\/th>/)
  assert.doesNotMatch(source, /<th>모형<\/th>/)
  assert.doesNotMatch(source, /<th>창형태<\/th>/)
  assert.doesNotMatch(source, /<th>수량<\/th>/)
  assert.doesNotMatch(source, /<th>내부색상<\/th>/)
  assert.doesNotMatch(source, /<th>외부색상<\/th>/)
  assert.doesNotMatch(source, /<th>색상<\/th>/)
  assert.doesNotMatch(source, /<th>틀짝망<\/th>/)
  assert.doesNotMatch(source, /<th>비고<\/th>/)
  assert.doesNotMatch(source, /<th>발주구분<\/th>/)
  assert.doesNotMatch(source, /<th>스크린<\/th>/)
  assert.doesNotMatch(source, /<th>VENT<\/th>/)
  assert.doesNotMatch(source, /<th>알유리<\/th>/)
  assert.doesNotMatch(source, /<th>안전망<\/th>/)
  assert.doesNotMatch(source, /<th>공급가<\/th>/)
  assert.doesNotMatch(source, /<th>VAT<\/th>/)
  assert.doesNotMatch(source, /<th>합계<\/th>/)
  assert.match(source, /colorText/)
  assert.match(source, /bsmfText/)
  assert.match(source, /customerOptionText/)
  assert.match(source, /class="summary-table-price-total"/)
  assert.match(source, /class="summary-table-price-sub"/)
  assert.match(source, /비고:\s*{{ row\.remarkText }}/)
})

test('SashEstimateSummary does not expose internal location codes such as R1 in B2B summary', () => {
  assert.doesNotMatch(source, /titleText/)
  assert.doesNotMatch(source, /locationText/)
  assert.doesNotMatch(source, /row\.locNm/)
  assert.doesNotMatch(source, /row\.windLocNm/)
  assert.doesNotMatch(source, /row\.remLocNm/)
  assert.doesNotMatch(source, /row\.locationNm/)
})

test('SashEstimateSummary normalizes color and window-type master names before rendering', () => {
  assert.match(source, /searchColorList/)
  assert.match(source, /searchModelWintydi/)
  assert.match(source, /commCdId:\s*row\.commCdId \|\| row\.commCdVal \|\| row\.colrCd \|\| row\.wintydiCd/)
  assert.match(source, /commCdNm:\s*row\.commCdNm \|\| row\.colrNm \|\| row\.wintydiNm/)
  assert.match(source, /function buildWindowTypeText/)
  assert.match(source, /function buildColorText/)
  assert.match(source, /function buildBsmfText/)
})
