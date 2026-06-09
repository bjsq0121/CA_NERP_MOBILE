import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildSashSummaryRow, normalizeSummaryCodeList } from '../utils/sashEstimateSummary.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'SashEstimateSummary.vue'), 'utf8')
const routerSource = readFileSync(resolve(currentDir, '../router/index.js'), 'utf8')
const detailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
const stylesSource = readFileSync(resolve(currentDir, '../styles.css'), 'utf8')
const summaryUtilSource = readFileSync(resolve(currentDir, '../utils/sashEstimateSummary.js'), 'utf8')

test('SashEstimateSummary route remains available without requiring a header-card shortcut', () => {
  assert.match(routerSource, /\/estimates\/:itgEstiNo\/sash-summary/)
  assert.match(routerSource, /import\('\.\.\/views\/SashEstimateSummary\.vue'\)/)
  assert.doesNotMatch(detailSource, /estimate-action-row[\s\S]*샤시 요약/)
})

test('SashEstimateSummary loads header and sash rows from existing mobile APIs', () => {
  assert.match(source, /selectEstiHeader\(itgEstiNo\)/)
  assert.match(source, /searchSashList\(\{ itgEstiNo, estiNo: wEstiNo\.value \}\)/)
  assert.match(source, /normalizeSashRows\(sashData\)/)
  assert.match(source, /isGlassEstimateRow/)
  assert.match(source, /selectSashDetail/)
  assert.match(source, /hydrateSashSummaryRows/)
  assert.match(source, /mergeSashDetailRow/)
  assert.match(source, /searchModelSf/)
  assert.match(source, /searchGlasList/)
  assert.match(source, /loadSummarySpecNameLists/)
  assert.match(source, /buildSashSummaryRows/)
  assert.match(source, /buildSashSummaryTotals/)
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
  assert.match(source, /normalizeSummaryCodeList/)
  assert.match(summaryUtilSource, /function normalizedCode/)
  assert.match(summaryUtilSource, /item\.mtrlProdCd/)
  assert.match(summaryUtilSource, /item\.mtrlCd/)
  assert.match(summaryUtilSource, /item\.glasCd/)
  assert.match(summaryUtilSource, /function normalizedName/)
  assert.match(summaryUtilSource, /item\.mtrlProdCdNm/)
  assert.match(summaryUtilSource, /item\.mtrlCdNm/)
  assert.match(summaryUtilSource, /item\.glasNm/)
  assert.match(summaryUtilSource, /function buildWindowTypeText/)
  assert.match(summaryUtilSource, /buildSummaryColorText/)
  assert.match(summaryUtilSource, /buildSummaryBsmfText/)
})

test('SashEstimateSummary rendered summary row values expose names and hide raw/internal fields', () => {
  const row = buildSashSummaryRow({
    mdlCd: 'M1',
    mdlNm: '모형명',
    wintydiCd: 'W1',
    wSize: '1200',
    hSize: '1400',
    qty: '1',
    insdColrCd: 'WH',
    ousdColrCd: 'BK',
    screenType: 'S1',
    ventLoc: 'L',
    insdSf: 'SF01',
    ousdSf: 'SF02',
    mtrlCds1: 'G01',
    mtrlCds2: 'G02',
    pdBfRemSrc: 'BF 생산 내부비고',
    pdSfRemSrc: 'SF 생산 내부비고',
    pdMfRemSrc: 'MF 생산 내부비고',
    workDetail: '작업로그',
    costAmt: '10',
    marginRate: '20',
  }, {
    colorList: normalizeSummaryCodeList([
      { commCdVal: 'WH', commCdNm: '화이트' },
      { commCdVal: 'BK', commCdNm: '블랙' },
    ]),
    screenList: normalizeSummaryCodeList([{ commCdVal: 'S1', commCdNm: '일반망' }]),
    ventList: normalizeSummaryCodeList([{ commCdVal: 'L', commCdNm: '좌' }]),
    materialList: normalizeSummaryCodeList([
      { commCdVal: 'SF01', commCdNm: 'SF 화이트바' },
      { commCdVal: 'SF02', commCdNm: 'SF 블랙바' },
      { commCdVal: 'G01', commCdNm: '투명유리' },
      { commCdVal: 'G02', commCdNm: '로이유리' },
    ]),
    wintydiNameMap: { 'M1::W1': '단창' },
  }, 0)

  const renderedText = [
    row.modelText,
    row.windowTypeText,
    row.sizeText,
    row.colorText,
    row.bsmfText,
    row.customerOptionText,
    row.remarkText,
  ].join(' ')

  assert.match(renderedText, /모형명/)
  assert.match(renderedText, /단창/)
  assert.match(renderedText, /화이트/)
  assert.match(renderedText, /블랙/)
  assert.match(renderedText, /일반망/)
  assert.match(renderedText, /VENT 좌/)
  assert.match(renderedText, /SF 화이트바/)
  assert.match(renderedText, /SF 블랙바/)
  assert.match(renderedText, /투명유리/)
  assert.match(renderedText, /로이유리/)
  assert.doesNotMatch(renderedText, /SF01|SF02|G01|G02|S1|WH|BK/)
  assert.doesNotMatch(renderedText, /생산 내부비고|작업로그|costAmt|marginRate|원가|마진/)
})
