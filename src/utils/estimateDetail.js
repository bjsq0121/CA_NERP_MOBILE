const firstValue = (...values) => values.find((value) => value != null && value !== '') || ''

export function resolveWindEstiNo(headerResponse) {
  const header = headerResponse?.resultData || {}
  return firstValue(
    headerResponse?.wEstiNo,
    header?.wEstiNo,
    header?.WEstiNo,
    header?.windEstiNo,
    header?.estiNo
  )
}

export function normalizeSashRows(response) {
  const raw = response?.resultList || response?.data?.resultList || []
  const seen = new Map()
  for (const row of raw) {
    const estiNo = row.estiNo || row.windEstiNo || ''
    const estiNos = row.estiNos || '1'
    const estiSeq = row.estiSeq || '0'
    const key = `${estiNo}_${estiNos}_${estiSeq}`
    if (!seen.has(key)) seen.set(key, row)
  }
  return Array.from(seen.values())
}

export function buildSashDrawingUrl(row = {}) {
  if (row.drwgFilePath) return row.drwgFilePath
  if (row.srvFileNm && row.fileExtNm) return `/data/drwg/sash/${row.srvFileNm}.${row.fileExtNm}`
  if (row.fileNm && row.fileExtNm) return `/data/drwg/sash/${row.fileNm}.${row.fileExtNm}`
  return ''
}

function hasDrawingFile(row = {}) {
  return Boolean(buildSashDrawingUrl(row))
}

export function findMatchingDrawing(row, drawings = []) {
  const usable = drawings.filter(hasDrawingFile)
  if (!usable.length) return null

  const exact = usable.find((item) =>
    item.wintydiCd === row.wintydiCd && item.ventLoc === row.ventLoc
  )
  if (exact) return exact

  const sameWindowType = usable.find((item) => item.wintydiCd === row.wintydiCd)
  if (sameWindowType) return sameWindowType

  return usable[0]
}

export function mergeSashDrawingFiles(rows = [], drawingsByMdlCd = {}) {
  return rows.map((row) => {
    if (hasDrawingFile(row)) return row

    const match = findMatchingDrawing(row, drawingsByMdlCd[row.mdlCd] || [])
    if (!match) return row

    return {
      ...row,
      srvFileNm: match.srvFileNm || row.srvFileNm,
      fileExtNm: match.fileExtNm || row.fileExtNm,
      drwgFilePath: match.drwgFilePath || row.drwgFilePath,
    }
  })
}

export function buildSashMeta(row = {}) {
  const qty = firstValue(row.qty, row.Qty, row.QTY)
  const bsmf = firstValue(
    row.bsmfOrdUtmNm,
    row.bsmfNm,
    row.bsmfOrdUtmCdNm,
    row.bsmfOrdUtmCd,
    row.bsmfCd
  )
  return {
    qtyText: qty === '' ? '-' : String(qty),
    bsmfText: bsmf || '-',
  }
}

export function buildSashScreenText(row = {}, screenList = []) {
  const savedName = firstValue(row.screenTypeNm, row.screenTypeName, row.SCREEN_TYPE_NM, row.screenNm)
  if (savedName) return savedName

  const screenType = firstValue(row.screenType, row.screen, row.screenCd, row.mfScreenType, row.SCREEN_TYPE)
  if (screenType) {
    const matched = screenList.find((item) =>
      String(firstValue(item.commCdId, item.commCdVal)) === String(screenType)
    )

    if (matched) return firstValue(matched.commCdNm, matched.addInfo1, screenType) || '-'
  }

  const modelText = firstValue(row.mdlNm, row.MDL_NM, row.modelNm)
  const embedded = screenList.find((item) => {
    const name = firstValue(item.commCdNm, item.addInfo1, item.addInfo2)
    return name && String(modelText).includes(String(name))
  })

  return firstValue(embedded?.commCdNm, embedded?.addInfo1, screenType) || '-'
}
