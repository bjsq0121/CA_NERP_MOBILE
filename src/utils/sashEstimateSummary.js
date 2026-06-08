import { buildSashMeta, buildSashScreenText } from './estimateDetail.js'

const firstValue = (...values) => values.find((value) => value != null && value !== '') || ''

const customerSummaryKeys = [
  'key',
  'no',
  'estiSeqText',
  'modelText',
  'windowTypeText',
  'sizeText',
  'qty',
  'qtyText',
  'colorText',
  'bsmfText',
  'customerOptionText',
  'supply',
  'vat',
  'total',
  'remarkText',
]

function normalizedCode(item = {}) {
  return firstValue(
    item.summaryCode,
    item.commCdId,
    item.commCdVal,
    item.colrCd,
    item.wintydiCd,
    item.mtrlProdCd,
    item.mtrlCd,
    item.glasCd,
    item.cd,
    item.code,
    item.value,
    item.id
  )
}

function normalizedName(item = {}) {
  return firstValue(
    item.summaryName,
    item.commCdNm,
    item.colrNm,
    item.wintydiNm,
    item.mtrlProdCdNm,
    item.mtrlProdNm,
    item.mtrlCdNm,
    item.mtrlNm,
    item.glasNm,
    item.cdNm,
    item.codeNm,
    item.name,
    item.label,
    item.text
  )
}

export function normalizeSummaryCodeList(rows = []) {
  const normalizedRows = rows.map((row) => {
    const summaryCode = normalizedCode(row)
    const summaryName = normalizedName(row)
    return {
      ...row,
      summaryCode,
      summaryName,
      commCdId: row.commCdId || summaryCode,
      commCdNm: row.commCdNm || summaryName,
    }
  })
  return normalizedRows
}

function normalizedText(value) {
  return String(value ?? '').trim()
}

function sameText(leftValue, rightValue) {
  return normalizedText(leftValue) !== '' && normalizedText(leftValue) === normalizedText(rightValue)
}

function collectKnownCodes(lists = []) {
  return lists
    .flat()
    .map((item) => normalizedCode(item))
    .filter(Boolean)
    .map((value) => String(value))
}

function looksLikeRawCode(value, knownCodes = []) {
  const text = normalizedText(value)
  if (!text) return false
  if (knownCodes.map(String).includes(text)) return true
  if (/^(Y|N|TRUE|FALSE)$/i.test(text)) return true
  if (/^R\d+$/i.test(text)) return true
  if (/^\d{1,4}$/.test(text)) return true
  if (/^[A-Z]{0,5}\d{1,6}[A-Z0-9_-]*$/i.test(text)) return true
  if (/^[A-Z0-9]{1,5}[-_][A-Z0-9_-]+$/i.test(text)) return true
  return false
}

function findCodeName(lists = [], value) {
  const code = normalizedText(value)
  if (!code) return ''
  for (const list of lists) {
    const matched = list.find((item) => sameText(normalizedCode(item), code))
    const matchedName = firstValue(normalizedName(matched), matched?.addInfo1)
    if (matchedName && !sameText(matchedName, code) && !looksLikeRawCode(matchedName, [code])) return matchedName
  }
  return ''
}

function isKnownCode(lists = [], value) {
  const code = normalizedText(value)
  if (!code) return false
  return lists.some((list) => list.some((item) => sameText(normalizedCode(item), code)))
}

function resolveCodeName(list = [], code, ...savedNames) {
  const savedName = firstValue(...savedNames)
  const rawCode = firstValue(code)
  if (rawCode) {
    const matchedName = findCodeName([list], rawCode)
    if (matchedName) return matchedName
  }
  if (savedName && (sameText(savedName, rawCode) || isKnownCode([list], savedName) || looksLikeRawCode(savedName, collectKnownCodes([list])))) {
    const remappedName = findCodeName([list], savedName)
    if (remappedName) return remappedName
    return '-'
  }
  return savedName || '-'
}

function amountNumber(...values) {
  for (const value of values) {
    if (value !== '' && value != null) return Number(String(value).replace(/,/g, '')) || 0
  }
  return 0
}

export function formatSummaryMoney(value) {
  return Number(value || 0).toLocaleString()
}

export function buildSummaryAmount(row = {}) {
  const supply = amountNumber(row.totCstAmtAddGlas, row.totSaleAmt, row.sumSaleCst, row.saleCst)
  const vat = amountNumber(row.vatAmt, row.totVatAmt)
  const explicitTotal = amountNumber(row.vatTotCstAmt, row.totAmt, row.chrgAmt)
  return {
    supply,
    vat,
    total: explicitTotal || supply + vat,
  }
}

function isYn(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return normalized === 'Y' || normalized === '1' || normalized === 'TRUE'
}

function resolveNamedSpec(row = {}, nameKeys = [], codeKeys = [], context = {}, slotLists = []) {
  const savedName = firstValue(...nameKeys.map((key) => row[key]))
  const code = firstValue(...codeKeys.map((key) => row[key]))

  const lists = [
    ...slotLists,
    context.materialList,
    context.glassList,
    context.handleList,
    context.commonList,
  ].filter(Array.isArray)
  const knownCodes = collectKnownCodes(lists)

  if (code) {
    const matchedName = findCodeName(lists, code)
    if (matchedName) return matchedName
  }

  if (savedName) {
    if (!sameText(savedName, code) && !isKnownCode(lists, savedName) && !looksLikeRawCode(savedName, [code, ...knownCodes])) {
      return savedName
    }

    const remappedName = findCodeName(lists, savedName)
    if (remappedName) return remappedName
  }

  if (code === '2') return '일반'
  if (code === '4') return '없음'
  return ''
}

function appendPairedSpec(parts, label, insideText, outsideText) {
  if (!insideText && !outsideText) return
  if (insideText && outsideText && insideText !== outsideText) {
    parts.push(`${label} ${insideText} / ${outsideText}`)
    return
  }
  parts.push(`${label} ${insideText || outsideText}`)
}

export function buildSummaryColorText(row = {}, context = {}) {
  const colorList = context.colorList || []
  const inside = resolveCodeName(colorList, firstValue(row.insdColrCd), row.insdColrNm)
  const outside = resolveCodeName(colorList, firstValue(row.ousdColrCd), row.ousdColrNm)
  const fallback = resolveCodeName(colorList, firstValue(row.color, row.colrCd, row.colr), row.colrNm)
  const insideText = inside === '-' ? fallback : inside
  const outsideText = outside === '-' ? fallback : outside
  if ((!insideText || insideText === '-') && (!outsideText || outsideText === '-')) return '-'
  if (insideText && outsideText && insideText !== '-' && outsideText !== '-' && insideText !== outsideText) {
    return `내부 ${insideText} / 외부 ${outsideText}`
  }
  return insideText !== '-' ? insideText : outsideText || '-'
}

export function buildSummaryBsmfText(row = {}, context = {}) {
  const metaText = buildSashMeta(row).bsmfText
  const code = firstValue(row.bsmfOrdUtmCd, row.bsmfCd)
  return resolveCodeName(
    context.bsmfList || [],
    code,
    row.bsmfOrdUtmNm,
    row.bsmfNm,
    row.bsmfOrdUtmCdNm,
    metaText === code ? '' : metaText
  )
}

export function buildSummaryOptionText(row = {}, context = {}) {
  const specLists = context.specLists || {}
  const screenText = resolveCodeName(
    context.screenList || [],
    firstValue(row.screenType, row.screen, row.screenCd, row.mfScreenType, row.SCREEN_TYPE),
    buildSashScreenText(row, context.screenList || []),
    row.screenTypeNm,
    row.screenTypeName,
    row.SCREEN_TYPE_NM,
    row.screenNm
  )
  const ventText = resolveCodeName(context.ventList || [], firstValue(row.ventLoc), row.ventLocNm, row.ventLocName)
  const parts = []

  if (screenText && screenText !== '-') parts.push(screenText)
  if (ventText && ventText !== '-') parts.push(`VENT ${ventText}`)
  if (isYn(row.glasStdalYn)) parts.push('알유리')
  if (isYn(row.aluMfYn)) parts.push('안전망')
  if (isYn(row.slcnFnshYn) || isYn(row.bfSlcnFnshYn)) parts.push('실리콘마감')
  if (isYn(row.windCloserMatYn) || isYn(row.insdWindClsYn) || isYn(row.ousdWindClsYn)) parts.push('윈드클로저')
  if (isYn(row.sfOutGlasYn)) parts.push('외주유리')
  if (isYn(row.mfHandleYn) || String(row.mfHandle || '') === '2') parts.push('방충망핸들')

  appendPairedSpec(
    parts,
    'SF 내/외',
    resolveNamedSpec(row, ['insdSfNm', 'insdSfMtrlNm', 'sfMatNm'], ['insdSf', 'insdSfMtrlCd', 'sfMatCd'], context, [specLists.sfInMaterialList]),
    resolveNamedSpec(row, ['ousdSfNm', 'ousdSfMtrlNm', 'sfOutMatNm'], ['ousdSf', 'ousdSfMtrlCd', 'sfOutMatCd'], context, [specLists.sfOutMaterialList])
  )
  appendPairedSpec(
    parts,
    'BF 내/외',
    resolveNamedSpec(row, ['insdBfNm', 'insdBfMtrlNm', 'bfMatNm'], ['insdBf', 'insdBfMtrlCd', 'bfMatCd'], context, [specLists.bfInMaterialList]),
    resolveNamedSpec(row, ['ousdBfNm', 'ousdBfMtrlNm', 'bfOutMatNm'], ['ousdBf', 'ousdBfMtrlCd', 'bfOutMatCd'], context, [specLists.bfOutMaterialList])
  )
  appendPairedSpec(
    parts,
    'SF 유리 내/외',
    resolveNamedSpec(row, ['insdSfGlasMtrlNm', 'insdSfGlasNm', 'mtrlCds1Nm'], ['mtrlCds1', 'insdSfGlasMtrlCd', 'insdSfGlasCd', 'sfGlasCd'], context, [specLists.sfInGlassList]),
    resolveNamedSpec(row, ['ousdSfGlasMtrlNm', 'ousdSfGlasNm', 'mtrlCds2Nm'], ['mtrlCds2', 'ousdSfGlasMtrlCd', 'ousdSfGlasCd', 'sfOutGlasCd'], context, [specLists.sfOutGlassList])
  )
  appendPairedSpec(
    parts,
    'BF 유리',
    resolveNamedSpec(row, ['insdBfGlasMtrlNm', 'insdBfGlasNm', 'mtrlCds3Nm'], ['mtrlCds3', 'insdBfGlasMtrlCd', 'insdBfGlasCd', 'bfGlasCd'], context, [specLists.bfInGlassList]),
    resolveNamedSpec(row, ['ousdBfGlasMtrlNm', 'ousdBfGlasNm', 'mtrlCds4Nm'], ['mtrlCds4', 'ousdBfGlasMtrlCd', 'ousdBfGlasCd', 'bfOutGlasCd'], context, [specLists.bfOutGlassList])
  )

  const safetyHandleText = resolveNamedSpec(
    row,
    ['aluMfHandleTypeNm', 'mfHandleNm', 'handleNm'],
    ['aluMfHandleType', 'mfHandle'],
    context
  )
  if (safetyHandleText) parts.push(`안전망핸들 ${safetyHandleText}`)

  return parts.length ? parts.join(', ') : '기본'
}

function buildSizeText(row = {}) {
  const wh = firstValue(row.wh)
  if (wh) return wh
  const w = firstValue(row.wSize, row.WSize, row.w0Size, row.w)
  const h = firstValue(row.hSize, row.HSize, row.h0Size, row.h)
  if (!w && !h) return '-'
  return `${w || '-'} x ${h || '-'}`
}

function buildWindowTypeText(row = {}, context = {}) {
  const code = firstValue(row.wintydiCd)
  const modelCode = firstValue(row.mdlCd, row.modelCd)
  const map = context.wintydiNameMap || {}
  const mappedName = firstValue(map[`${modelCode}::${code}`], map[code])
  if (mappedName && !looksLikeRawCode(mappedName, [code])) return mappedName
  const savedName = firstValue(row.wintydiNm, row.wintydiName)
  if (savedName && !sameText(savedName, code) && !looksLikeRawCode(savedName, [code])) return savedName
  return '-'
}

export function sanitizeCustomerSummaryRow(row = {}) {
  return Object.fromEntries(
    customerSummaryKeys
      .filter((key) => row[key] != null)
      .map((key) => [key, row[key]])
  )
}

export function buildSashSummaryRow(row = {}, context = {}, index = 0) {
  const qty = amountNumber(row.qty, row.Qty, row.QTY)
  const amount = buildSummaryAmount(row)
  const modelCode = firstValue(row.mdlCd, row.modelCd)
  const modelName = firstValue(row._displayMdlNm, row.mdlNm, row.modelNm)

  return sanitizeCustomerSummaryRow({
    key: `${firstValue(row.estiNo, row.windEstiNo, 'sash')}_${firstValue(row.estiNos, '1')}_${firstValue(row.estiSeq, index + 1)}`,
    no: index + 1,
    estiSeqText: firstValue(row.estiSeq, index + 1),
    modelText: [modelCode, modelName].filter(Boolean).join(' / ') || '-',
    windowTypeText: buildWindowTypeText(row, context),
    sizeText: buildSizeText(row),
    qty,
    qtyText: qty ? String(qty) : '-',
    colorText: buildSummaryColorText(row, context),
    bsmfText: buildSummaryBsmfText(row, context),
    customerOptionText: buildSummaryOptionText(row, context),
    supply: amount.supply,
    vat: amount.vat,
    total: amount.total,
    remarkText: firstValue(row.remSrc, row.estiRemSrc, '-'),
  })
}

export function buildSashSummaryRows(rows = [], context = {}) {
  return rows.map((row, index) => buildSashSummaryRow(row, context, index))
}

export function buildSashSummaryTotals(rows = []) {
  return rows.reduce((acc, row) => {
    acc.rowCount += 1
    acc.qty += Number(row.qty || 0)
    acc.supply += Number(row.supply || 0)
    acc.vat += Number(row.vat || 0)
    acc.total += Number(row.total || 0)
    return acc
  }, { rowCount: 0, qty: 0, supply: 0, vat: 0, total: 0 })
}

export function isGlassEstimateRow(row = {}) {
  return row.ctgr2Cd === 'P8' || row.ctgrCd === 'P8' || row.ctgr2Nm === '알유리'
}
