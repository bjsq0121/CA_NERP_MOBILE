function firstByCfgId(rows = []) {
  const map = new Map()
  for (const row of rows || []) {
    if (!row?.cfgId || map.has(row.cfgId)) continue
    map.set(row.cfgId, row)
  }
  return map
}

function optionsByCfgId(rows = []) {
  const map = new Map()
  for (const row of rows || []) {
    if (!row?.cfgId) continue
    const list = map.get(row.cfgId) || []
    list.push(row)
    map.set(row.cfgId, list)
  }
  return map
}

function toOptionMap(rows = []) {
  return rows.reduce((acc, row) => {
    if (row?.optKey) acc[row.optKey] = row.optValue
    return acc
  }, {})
}

function hasOwn(row, key) {
  return Object.prototype.hasOwnProperty.call(row || {}, key)
}

function isYn(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  return normalized === 'Y' || normalized === 'TRUE' || normalized === '1'
}

function textValue(value) {
  return value == null ? '' : String(value)
}

function firstText(row = {}, ...keys) {
  for (const key of keys) {
    const value = row[key]
    if (value !== '' && value != null) return String(value)
  }
  return ''
}

function setText(form, optionMap, field, key = field) {
  if (hasOwn(optionMap, key)) form[field] = textValue(optionMap[key])
}

function setYn(form, optionMap, field, key = field) {
  if (hasOwn(optionMap, key)) form[field] = isYn(optionMap[key])
}

function setOptionArray(form, optionMap, field, mapping) {
  if (!mapping.some(([key]) => hasOwn(optionMap, key))) return
  form[field] = mapping.filter(([key]) => isYn(optionMap[key])).map(([, value]) => value)
}

export function buildQuickConfigCards(data = {}) {
  const headers = data.headerList || data.resultData?.headerList || []
  const detailMap = firstByCfgId(data.detailList || data.resultData?.detailList || [])
  const optionMap = optionsByCfgId(data.optionList || data.resultData?.optionList || [])

  return headers.map((header) => {
    const detail = detailMap.get(header.cfgId) || {}
    const options = optionMap.get(header.cfgId) || []
    return {
      cfgId: header.cfgId,
      header,
      detail,
      options,
      optionMap: toOptionMap(options),
      raw: { header, detail, options },
    }
  })
}

function text(...values) {
  for (const value of values) {
    if (value !== '' && value != null) return String(value)
  }
  return ''
}

export function summarizeQuickConfigCard(card = {}) {
  const header = card.header || card
  const detail = card.detail || card
  const optionMap = card.optionMap || {}
  const modelText = text(detail.mdlNm, detail.mdlCd, '-')
  const shapeText = text(detail.wintydiNm, detail.wintydiCd, '-')
  const w = text(detail.wSize, detail.WSize)
  const h = text(detail.hSize, detail.HSize)
  const qty = text(detail.qty, detail.Qty)
  const sizeText = w || h
    ? `${w || '-'} x ${h || '-'}${qty ? ` / ${qty}개` : ''}`
    : '-'
  const insdColor = text(detail.insdColrNm, detail.insdColrCd)
  const ousdColor = text(detail.ousdColrNm, detail.ousdColrCd)
  const colorText = insdColor && ousdColor
    ? (insdColor === ousdColor ? insdColor : `${insdColor} / ${ousdColor}`)
    : text(insdColor, ousdColor, detail.crtnColrNm, detail.crtnColrCd, '-')
  const glassParts = [
    text(detail.insdSfGlasMtrlNm, detail.insdSfGlasMtrlCd),
    text(detail.ousdSfGlasMtrlNm, detail.ousdSfGlasMtrlCd),
    text(detail.insdBfGlasMtrlNm, detail.insdBfGlasMtrlCd),
    text(detail.ousdBfGlasMtrlNm, detail.ousdBfGlasMtrlCd),
  ].filter(Boolean)

  return {
    title: text(header.cfgNm, header.cfgId, '간편샤시'),
    modelText,
    shapeText,
    sizeText,
    colorText,
    screenText: text(detail.screenTypeNm, optionMap.screenType, detail.screenType, '-'),
    bsmfText: text(detail.bsmfOrdUtmNm, detail.bsmfOrdUtmCd, '-'),
    glassText: glassParts.length ? glassParts.join(' / ') : '-',
    noteText: text(detail.remSrc, header.remSrc),
  }
}

export function applyQuickConfigOptionsToForm(form = {}, card = {}) {
  const optionMap = card.optionMap || card.raw?.optionMap || card || {}
  const detail = card.detail || card.raw?.detail || {}

  const textFields = [
    'bfLockCnt',
    'bfWrapping',
    'bfThrSidePack',
    'bfMillingDetail',
    'bfSideView',
    'bfAptCmType',
    'bfApt1pjMethod',
    'bfApt2pjLoc',
    'bfApt2pjMethod',
    'bfShipAddr',
    'sfShipAddr',
    'sfOutGlasInfo',
    'sfOutType',
    'sfOutType0',
    'sfOutType1',
    'sfOutType2',
    'sfOutType3',
    'sfRoller',
    'sfCreSize',
    'mfShipAddr',
    'mfHandle',
    'mfHandleHsize',
    'screenType',
  ]
  for (const field of textFields) setText(form, optionMap, field)

  setText(form, optionMap, 'bfMillingType', 'bfMillingWing')
  setText(form, optionMap, 'bfTurnDoorPullType', 'bfTurnDoorPull')
  setText(form, optionMap, 'bfTurnDoorOneSideWrapType', 'bfTurnDoorOneSideWrap')
  setText(form, optionMap, 'bfWinCbMilingType', 'bfWinCbMilling')
  setText(form, optionMap, 'sfSontaLoca', 'locaSonta')
  setText(form, optionMap, 'sfAptArmatureType', 'sfAptAmatureType')
  setText(form, optionMap, 'mfAptArmatureType', 'mfAptAmatureType')

  const ynFields = [
    'fillingPiecesYn',
    'bfWeldNoneYn',
    'bfLxHiddenOptYn',
    'bfMillingUp',
    'bfMillingDown',
    'bfMillingLeft',
    'bfMillingRight',
    'bfWeld',
    'bfDirectShip',
    'bfRackShip',
    'bfStopper',
    'bfFmGbYn',
    'bfFmGbShipYn',
    'bfFmGbUpDownYn',
    'bfFmGbRlYn',
    'bfFmGbCutYn',
    'bfSsOpt',
    'bfFixBuild',
    'bfFdHd',
    'bfTurnDoorOnlyMakeYn',
    'bfVentPiecesIncludeYn',
    'bfWinOnefixUpHoleYn',
    'bfWinFmThreeSideYn',
    'bfWinTopBottomFmYn',
    'bfWinSpDdlnShpmYn',
    'bfIhyFixHghtDirYn',
    'sfDirectShip',
    'sfRackShip',
    'sfLandscape',
    'sfOutGlasYn',
    'sfCreHook',
    'sfInsideRightBrdYn',
    'sfMcOneReqYn',
    'sfOppositeTypeYn',
    'sfBrdProcYn',
    'sfHandleProcYn',
    'mfDirectShip',
    'mfRackShip',
    'mfCi4wStickYn',
  ]
  for (const field of ynFields) setYn(form, optionMap, field)

  setYn(form, optionMap, 'bfForesidePackYn', 'bfForesidePack')
  setYn(form, optionMap, 'bfKsmarkYn', 'bfKsmark')

  const aluMfYn = firstText(detail, 'aluMfYn') || firstText(optionMap, 'aluMfYn')
  if (aluMfYn) form.isAluMf = isYn(aluMfYn)
  const aluMfHandleType = firstText(detail, 'aluMfHandleType') || firstText(optionMap, 'aluMfHandleType')
  if (aluMfHandleType) form.aluMfHandleType = aluMfHandleType
  const aluMfMdlYn = firstText(detail, 'aluMfMdlYn') || firstText(optionMap, 'aluMfMdlYn')
  if (aluMfMdlYn) form.aluMfMdlYn = aluMfMdlYn
  const aluMfHndlH = firstText(detail, 'aluMfHndlH') || firstText(optionMap, 'aluMfHndlH')
  if (aluMfHndlH) form.aluMfHndlH = aluMfHndlH

  setOptionArray(form, optionMap, 'winCloser', [
    ['insdWindClsYn', 1],
    ['ousdWindClsYn', 2],
    ['insd2FWindClsYn', 3],
    ['ousd2FWindClsYn', 4],
  ])
  setOptionArray(form, optionMap, 'deco1', [
    ['insdDeckNoneYn', 1],
    ['ousdDeckNoneYn', 2],
    ['insd2FDeckNoneYn', 3],
    ['ousd2FDeckNoneYn', 4],
  ])

  return form
}
