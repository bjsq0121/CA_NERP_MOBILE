const firstValue = (...values) => values.find((value) => value != null && value !== '') || ''

function codeText(value) {
  return String(value ?? '').trim()
}

function sameCode(leftValue, rightValue) {
  const left = codeText(leftValue)
  const right = codeText(rightValue)
  return left !== '' && right !== '' && left === right
}

const detailRawFieldKeys = [
  'wintydiCd',
  'ventLoc',
  'drwgCd',
  'bftydiCd',
  'sizCd',
  'crtnColrCd',
  'insdColrCd',
  'ousdColrCd',
  'bsmfOrdUtmCd',
  'sashOrdTypCd',
  'screenType',
  'glasStdalYn',
  'glasAttachYn',
  'aluMfYn',
  'aluMdlYn',
  'aluMfHandleType',
  'aluMfHandleTypeNm',
  'aluMfMdlYn',
  'aluMfHndlH',
  'slcnFnshYn',
  'bfSlcnFnshYn',
  'windCloserMatYn',
  'insdWindClsYn',
  'ousdWindClsYn',
  'sfOutGlasYn',
  'mfHandleYn',
  'mfHandle',
  'insdSf',
  'ousdSf',
  'insdBf',
  'ousdBf',
  'mtrlCds1',
  'mtrlCds2',
  'mtrlCds3',
  'mtrlCds4',
  'insdSfNm',
  'ousdSfNm',
  'insdBfNm',
  'ousdBfNm',
  'insdSfMtrlNm',
  'ousdSfMtrlNm',
  'insdBfMtrlNm',
  'ousdBfMtrlNm',
  'insdSfGlasMtrlNm',
  'ousdSfGlasMtrlNm',
  'insdBfGlasMtrlNm',
  'ousdBfGlasMtrlNm',
  'mtrlCds1Nm',
  'mtrlCds2Nm',
  'mtrlCds3Nm',
  'mtrlCds4Nm',
  'hdlInsd',
  'hdlOusd',
  'insdHandleType',
  'ousdHandleType',
  'insdHandleTypeNm',
  'ousdHandleTypeNm',
  'insdHndlH',
  'ousdHndlH',
  'insd2FHndlH',
  'ousd2FHndlH',
  'insdBrcktH',
  'ousdBrcktH',
  'insd2FBrcktH',
  'ousd2FBrcktH',
  'bfArmatureType',
  'sfArmatureType',
  'mfArmatureType',
  'bfMillingType',
  'drnHoleYn',
  'ventHoleYn',
  'sfInsdVentHoleYn',
  'sfOusdVentHoleYn',
  'remSrc',
  'pdBfRemSrc',
  'pdSfRemSrc',
  'pdMfRemSrc',
  'bfDirectShip',
  'sfDirectShip',
  'mfDirectShip',
  'bfRackShip',
  'sfRackShip',
  'mfRackShip',
  'bfShipAddr',
  'sfShipAddr',
  'mfShipAddr',
  'wSize',
  'hSize',
  'WSize',
  'HSize',
  'w0Size',
  'h0Size',
  'csSize',
  'CSSize',
  'cs',
]

for (let index = 1; index <= 5; index += 1) {
  detailRawFieldKeys.push(
    `w${index}Size`,
    `W${index}Size`,
    `w${index}`,
    `h${index}Size`,
    `H${index}Size`,
    `h${index}`,
    `cs${index}Size`,
    `CS${index}Size`,
    `cs${index}`
  )
}

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

export function mergeSashDetailRow(listRow = {}, detailRow = {}) {
  const detail = Object.fromEntries(
    Object.entries(detailRow || {}).filter(([, value]) => value != null && value !== '')
  )
  const merged = { ...detail, ...listRow }
  for (const key of detailRawFieldKeys) {
    const value = detailRow?.[key]
    if (value != null && value !== '') merged[key] = value
  }
  return merged
}

export function buildSashDrawingUrl(row = {}) {
  if (row._displayDrwgFilePath) return row._displayDrwgFilePath
  if (row._displaySrvFileNm && row._displayFileExtNm) {
    return `/data/drwg/sash/${row._displaySrvFileNm}.${row._displayFileExtNm}`
  }
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
    sameCode(item.wintydiCd, row.wintydiCd) && sameCode(item.ventLoc, row.ventLoc)
  )
  if (exact) return exact

  const sameWindowType = usable.find((item) => sameCode(item.wintydiCd, row.wintydiCd))
  if (sameWindowType) return sameWindowType

  return usable[0]
}

function isExactVentDrawingMatch(row = {}, drawing = {}) {
  return sameCode(drawing.wintydiCd, row.wintydiCd) && sameCode(drawing.ventLoc, row.ventLoc)
}

export function mergeSashDrawingFiles(rows = [], drawingsByMdlCd = {}) {
  return rows.map((row) => {
    const match = findMatchingDrawing(row, drawingsByMdlCd[row.mdlCd] || [])
    if (!match) return row

    const isExact = isExactVentDrawingMatch(row, match)
    const displayMdlNm = isExact ? firstValue(match.mdlNm, match.MDL_NM, match.modelNm) : ''

    if (isExact) {
      return {
        ...row,
        _displaySrvFileNm: match.srvFileNm || match.fileNm || row._displaySrvFileNm,
        _displayFileExtNm: match.fileExtNm || row._displayFileExtNm,
        _displayDrwgFilePath: match.drwgFilePath || row._displayDrwgFilePath,
        _displayDrwgCd: match.drwgCd || row._displayDrwgCd,
        ...(displayMdlNm ? { _displayMdlNm: displayMdlNm } : {}),
      }
    }

    if (hasDrawingFile(row)) return row

    return {
      ...row,
      srvFileNm: match.srvFileNm || row.srvFileNm,
      fileExtNm: match.fileExtNm || row.fileExtNm,
      drwgFilePath: match.drwgFilePath || row.drwgFilePath,
      ...(displayMdlNm ? { _displayMdlNm: displayMdlNm } : {}),
    }
  })
}

export function buildSashModelText(row = {}) {
  return firstValue(row.mdlNm, row.MDL_NM, row.modelNm, row._displayMdlNm, row.mdlCd) || '-'
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
