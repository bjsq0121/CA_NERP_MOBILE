import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSashSummaryRow,
  buildSashSummaryRows,
  buildSashSummaryTotals,
  buildSummaryAmount,
  buildSummaryBsmfText,
  buildSummaryColorText,
  buildSummaryOptionText,
  formatSummaryMoney,
  normalizeSummaryCodeList,
  sanitizeCustomerSummaryRow,
} from './sashEstimateSummary.js'

const context = {
  colorList: normalizeSummaryCodeList([
    { commCdVal: 'WH', commCdNm: '화이트' },
    { commCdVal: 'BK', commCdNm: '블랙' },
  ]),
  screenList: normalizeSummaryCodeList([
    { commCdVal: 'P', commCdNm: '일반망' },
    { commCdVal: 'A', commCdNm: '안전망' },
  ]),
  ventList: normalizeSummaryCodeList([
    { commCdVal: 'L', commCdNm: '좌' },
    { commCdVal: 'R', commCdNm: '우' },
  ]),
  bsmfList: normalizeSummaryCodeList([
    { commCdVal: '101', commCdNm: 'SET' },
    { commCdVal: '106', commCdNm: '짝망' },
  ]),
  materialList: normalizeSummaryCodeList([
    { commCdVal: 'SF01', commCdNm: 'SF 화이트바' },
    { commCdVal: 'SF02', commCdNm: 'SF 블랙바' },
    { commCdVal: 'G01', commCdNm: '투명유리' },
    { commCdVal: 'G02', commCdNm: '로이유리' },
    { commCdVal: 'H4', commCdNm: '없음' },
    { mtrlProdCd: 'SF03', mtrlProdNm: 'SF 그레이바' },
    { mtrlCd: 'BF01', mtrlNm: 'BF 보강바' },
    { glasCd: 'GL01', glasNm: '브론즈유리' },
    { mtrlProdCd: 'SF001', mtrlProdCdNm: 'SF 내부바 명칭' },
    { mtrlProdCd: 'SF002', mtrlProdCdNm: 'SF 외부바 명칭' },
    { mtrlCd: 'G001', mtrlCdNm: '내측 유리 명칭' },
    { mtrlCd: 'G002', mtrlCdNm: '외측 유리 명칭' },
  ]),
  wintydiNameMap: {
    'M1::W1': '단창',
  },
}

test('buildSummaryColorText prefers names and compresses equal inside outside colors', () => {
  assert.equal(buildSummaryColorText({ insdColrCd: 'WH', ousdColrCd: 'WH' }, context), '화이트')
  assert.equal(buildSummaryColorText({ insdColrCd: 'WH', ousdColrCd: 'BK' }, context), '내부 화이트 / 외부 블랙')
  assert.equal(buildSummaryColorText({ insdColrCd: 'CUSTOM', ousdColrCd: 'CUSTOM' }, context), '-')
  assert.equal(buildSummaryColorText({}, context), '-')
})

test('buildSummaryOptionText compresses customer-visible options and hides raw production fields', () => {
  const text = buildSummaryOptionText({
    screenType: 'P',
    ventLoc: 'L',
    glasStdalYn: 'Y',
    aluMfYn: 'Y',
    slcnFnshYn: 'Y',
    windCloserMatYn: 'Y',
    sfOutGlasYn: 'Y',
    mfHandleYn: 'Y',
    pdBfRemSrc: '렉별도출고',
    pdSfRemSrc: '내부생산비고',
    workDetail: '내부작업',
  }, context)

  assert.equal(text, '일반망, VENT 좌, 알유리, 안전망, 실리콘마감, 윈드클로저, 외주유리, 방충망핸들')
  assert.doesNotMatch(text, /렉별도출고|내부생산비고|내부작업/)
  assert.equal(buildSummaryOptionText({}, context), '기본')
})

test('buildSummaryOptionText shows material and glass names instead of raw codes', () => {
  const text = buildSummaryOptionText({
    insdSf: 'SF01',
    ousdSf: 'SF02',
    mtrlCds1: 'G01',
    mtrlCds2: 'G02',
    mtrlCds3: 'G01',
    mtrlCds4: 'G01',
    aluMfHandleType: 'H4',
  }, context)

  assert.match(text, /SF 내\/외 SF 화이트바 \/ SF 블랙바/)
  assert.match(text, /SF 유리 내\/외 투명유리 \/ 로이유리/)
  assert.match(text, /BF 유리 투명유리/)
  assert.match(text, /안전망핸들 없음/)
  assert.doesNotMatch(text, /SF01|SF02|G01|G02|H4/)
})

test('buildSummaryOptionText compresses equal inside outside material names', () => {
  assert.match(
    buildSummaryOptionText({
      insdSfNm: '공통바',
      ousdSfNm: '공통바',
      insdSfGlasMtrlNm: '복층유리',
      ousdSfGlasMtrlNm: '복층유리',
    }, context),
    /SF 내\/외 공통바, SF 유리 내\/외 복층유리/
  )
})

test('buildSummaryOptionText does not trust code-like name fields and remaps them through masters', () => {
  const text = buildSummaryOptionText({
    insdSf: 'SF01',
    insdSfNm: 'SF01',
    ousdSf: 'SF03',
    ousdSfNm: 'SF03',
    insdBf: 'BF01',
    insdBfNm: 'BF01',
    mtrlCds1: 'GL01',
    mtrlCds1Nm: 'GL01',
    mtrlCds2: 'G02',
    mtrlCds2Nm: '02',
    aluMfHandleType: '4',
    aluMfHandleTypeNm: '4',
  }, context)

  assert.match(text, /SF 내\/외 SF 화이트바 \/ SF 그레이바/)
  assert.match(text, /BF 내\/외 BF 보강바/)
  assert.match(text, /SF 유리 내\/외 브론즈유리 \/ 로이유리/)
  assert.match(text, /안전망핸들 없음/)
  assert.doesNotMatch(text, /SF01|SF03|BF01|GL01|G02|내\/외 02|핸들 4/)
})

test('buildSummaryOptionText supports actual material and glass API aliases', () => {
  const text = buildSummaryOptionText({
    insdSf: 'SF001',
    ousdSf: 'SF002',
    mtrlCds1: 'G001',
    mtrlCds2: 'G002',
  }, context)

  assert.match(text, /SF 내부바 명칭/)
  assert.match(text, /SF 외부바 명칭/)
  assert.match(text, /내측 유리 명칭/)
  assert.match(text, /외측 유리 명칭/)
  assert.doesNotMatch(text, /SF001|SF002|G001|G002/)
})

test('buildSummaryOptionText omits unknown material and glass codes instead of exposing them', () => {
  const text = buildSummaryOptionText({
    insdSf: 'UNKNOWN_SF',
    mtrlCds1: 'UNKNOWN_G',
  }, { materialList: [], glassList: [] })

  assert.equal(text, '기본')
  assert.doesNotMatch(text, /UNKNOWN_SF|UNKNOWN_G/)
})

test('buildSummaryOptionText maps safety handle codes to labels', () => {
  assert.match(buildSummaryOptionText({ aluMfHandleType: '2' }, context), /안전망핸들 일반/)
  assert.match(buildSummaryOptionText({ aluMfHandleType: '4' }, context), /안전망핸들 없음/)
  assert.doesNotMatch(buildSummaryOptionText({ aluMfHandleType: '4' }, context), /안전망핸들 4/)
})

test('buildSummaryBsmfText uses master name before falling back to code or dash', () => {
  assert.equal(buildSummaryBsmfText({ bsmfOrdUtmCd: '101' }, context), 'SET')
  assert.equal(buildSummaryBsmfText({ bsmfOrdUtmNm: '틀짝망' }, context), '틀짝망')
  assert.equal(buildSummaryBsmfText({ bsmfOrdUtmCd: '999' }, context), '-')
  assert.equal(buildSummaryBsmfText({}, context), '-')
})

test('buildSashSummaryRow remaps code-like window type names through the model window map', () => {
  const row = buildSashSummaryRow({
    mdlCd: 'M1',
    wintydiCd: '01',
    wintydiNm: '01',
  }, {
    wintydiNameMap: { 'M1::01': '단창' },
  }, 0)

  assert.equal(row.windowTypeText, '단창')
  assert.doesNotMatch(row.windowTypeText, /01/)
})

test('buildSummaryAmount uses server total first and falls back to supply plus vat', () => {
  assert.deepEqual(buildSummaryAmount({
    totSaleAmt: '1,000',
    vatAmt: '100',
    vatTotCstAmt: '1,050',
  }), { supply: 1000, vat: 100, total: 1050 })

  assert.deepEqual(buildSummaryAmount({
    sumSaleCst: '2,000',
    totVatAmt: '200',
  }), { supply: 2000, vat: 200, total: 2200 })

  assert.deepEqual(buildSummaryAmount({}), { supply: 0, vat: 0, total: 0 })
  assert.equal(formatSummaryMoney(1234567), '1,234,567')
})

test('buildSashSummaryRow returns only customer-safe summary fields', () => {
  const row = buildSashSummaryRow({
    estiNo: 'W1',
    estiNos: '1',
    estiSeq: '3',
    mdlCd: 'M1',
    mdlNm: '모형명',
    wintydiCd: 'W1',
    wSize: '1200',
    hSize: '1400',
    qty: '2',
    insdColrCd: 'WH',
    ousdColrCd: 'BK',
    bsmfOrdUtmCd: '101',
    screenType: 'P',
    ventLoc: 'R',
    glasStdalYn: 'Y',
    totSaleAmt: '3000',
    vatAmt: '300',
    pdBfRemSrc: '생산비고',
    workDetail: '내부작업',
    erp2Save: 'Y',
    innosysYn: 'Y',
    margin: '999',
    costAmt: '100',
    installCost: '시공비',
    promotionText: '프로모션',
  }, context, 0)

  assert.equal(row.modelText, 'M1 / 모형명')
  assert.equal(row.windowTypeText, '단창')
  assert.equal(row.sizeText, '1200 x 1400')
  assert.equal(row.qty, 2)
  assert.equal(row.colorText, '내부 화이트 / 외부 블랙')
  assert.equal(row.bsmfText, 'SET')
  assert.match(row.customerOptionText, /일반망/)
  assert.equal(row.total, 3300)

  const serialized = JSON.stringify(row)
  assert.doesNotMatch(serialized, /생산비고|내부작업|erp2Save|innosysYn|margin|costAmt|시공비|프로모션/)
})

test('buildSashSummaryRows and totals aggregate sanitized rows', () => {
  const rows = buildSashSummaryRows([
    { qty: '2', totSaleAmt: '1000', vatAmt: '100' },
    { qty: '3', vatTotCstAmt: '2200', totSaleAmt: '2000', vatAmt: '200' },
  ], context)
  const totals = buildSashSummaryTotals(rows)

  assert.equal(rows.length, 2)
  assert.deepEqual(totals, { rowCount: 2, qty: 5, supply: 3000, vat: 300, total: 3300 })
})

test('sanitizeCustomerSummaryRow drops internal and consumer-construction fields', () => {
  const result = sanitizeCustomerSummaryRow({
    modelText: 'M1',
    pdMfRemSrc: 'MF 비고',
    workDetail: '작업로그',
    erp2Save: 'Y',
    innosysYn: 'Y',
    marginRate: '10',
    costAmt: '100',
    demolitionCost: '철거비',
    ladderTruckCost: '사다리차',
    promotion: '프로모션',
  })

  assert.deepEqual(result, { modelText: 'M1' })
})
