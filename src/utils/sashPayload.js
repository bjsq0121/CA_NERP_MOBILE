const stringifyValue = (value) => (value == null || value === '' ? '' : String(value))
const isYn = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase()
  return normalized === 'Y' || normalized === 'TRUE' || normalized === '1'
}
const isExplicitNo = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase()
  return value === false || normalized === 'N' || normalized === 'FALSE' || normalized === '0'
}
const yn = (value) => (isYn(value) ? 'Y' : 'N')
const includesOption = (values, option) => (values || []).map(String).includes(String(option))
const hasValue = (value) => value != null && value !== ''

const millingDetailText = { 1: '전체', 2: '내부', 3: '외부', 4: '부분' }
const wrappingText = { 1: 'ㄱ자', 2: 'ㄷ자' }
const threeSidePackText = { 1: '백색', 2: '래핑' }
const sideViewText = { 1: '100면보이게', 2: '40면 보이게' }
const turnDoorPullText = { 1: '좌경첩(내부-미는문)', 2: '우경첩(내부-미는문)' }
const turnDoorOneSideWrapText = { 1: '당기는문', 2: '미는문' }
const casementCountText = { 1: '케이스먼트:1짝', 2: '케이스먼트:2짝' }
const casementMethodText = { 1: '밀때좌경', 2: '밀때우경' }
const casementLocText = { 1: '양측', 2: '좌측', 3: '우측' }
const bfWinCbMillingText = { 1: '상부만밀링(FM,GB없음)', 2: 'FM바없이 통바밀링' }
const sfRollerText = { 1: '쌍로라', 2: '조절로라' }
const sfCreSizeText = { 1: '소', 3: '대' }
const sfSontaText = { 1: '양면', 2: '외부면', 3: '2,3번 양면', 4: '2,3번 내부', 5: '좌측양면', 6: '우측양면', 7: '좌측', 8: '우측' }
const sfOutTypeText = { 4: '1W', 1: '2W', 2: '3W', 3: '4W' }
const sfOutPositionText = {
  0: { 1: '장식X', 2: 'MC미부착' },
  1: { 1: '크리창', 2: '고리창', 3: '크리창(반대타입)', 4: '고리창(반대타입)' },
  2: { 1: '1번창', 2: '2번창', 3: '3번창' },
  3: { 1: '1번창', 2: '2번창', 3: '3번창', 4: '4번창' },
}
const safetyNetHandleText = { 1: '없음', 2: '일반', 4: '없음' }

function appendComma(parts, value) {
  if (value) parts.push(value)
}

function combineProductionRemark(existing, generated) {
  const saved = stringifyValue(existing).trim()
  const auto = stringifyValue(generated).trim()
  if (!saved) return auto
  if (!auto) return saved
  if (saved.includes(auto)) return saved
  return `${saved},${auto}`
}

function buildBfMillingRemark(form) {
  const bfMillingType = stringifyValue(form.bfMillingType || '0')
  if (bfMillingType === '0') return ''

  const prefix = bfMillingType === '1' ? '반밀링' : bfMillingType === '2' ? '날개' : ''
  if (!prefix) return ''

  const detail = millingDetailText[stringifyValue(form.bfMillingDetail)] || ''
  const locations = [
    isYn(form.bfMillingUp) ? '상' : '',
    isYn(form.bfMillingDown) ? '하' : '',
    isYn(form.bfMillingLeft) ? '좌' : '',
    isYn(form.bfMillingRight) ? '우' : '',
  ].join('')

  return `${prefix}${detail}${locations ? ` ${locations}` : ' '}`.trimEnd()
}

function buildBfProductionRemark(form) {
  const parts = []

  appendComma(parts, buildBfMillingRemark(form))
  appendComma(parts, isYn(form.bfDirectShip) ? '직송' : '')
  appendComma(parts, isYn(form.bfRackShip) ? '렉별도출고' : '')
  appendComma(parts, isYn(form.bfWeldNoneYn) ? '절단바로(용접X)' : '')
  appendComma(parts, isExplicitNo(form.drnHoleYn) ? '물구멍 X' : '')
  appendComma(parts, isYn(form.fillingPiecesYn) ? '상하휠링피스' : '')
  appendComma(parts, isYn(form.basedfillingPiecesYn) ? '기존 휠링피스' : '')
  appendComma(parts, isYn(form.bfWeld) ? 'ㄱㄴ용접' : '')
  appendComma(parts, isYn(form.bfForesidePackYn) ? '4면포장' : '')
  appendComma(parts, isYn(form.bfStopper) ? '스토퍼부착' : '')
  appendComma(parts, isYn(form.bfKsmarkYn) ? 'KS마크' : '')

  appendComma(parts, isYn(form.bfFmGbYn) ? 'FM-X,GB-X' : '')
  appendComma(parts, isYn(form.bfFmGbShipYn) ? 'FM/GB 길게 별도 출고' : '')
  appendComma(parts, isYn(form.bfFmGbUpDownYn) ? 'FM/GB상하작업' : '')
  appendComma(parts, isYn(form.bfFmGbRlYn) ? 'FM/GB좌우작업' : '')
  appendComma(parts, isYn(form.bfFmGbCutYn) ? 'FM상하일자절단' : '')
  appendComma(parts, isYn(form.bfSsOpt) ? 'SS일자절단,연결구' : '')
  appendComma(parts, isYn(form.bfFixBuild) ? 'FIX외부시공' : '')
  appendComma(parts, isYn(form.bfFdHd) ? '풀다운핸들' : '')

  appendComma(parts, stringifyValue(form.bfArmatureType) === 'F' ? '보강재:4면' : '')
  appendComma(parts, wrappingText[stringifyValue(form.bfWrapping)] ? `랩핑:${wrappingText[stringifyValue(form.bfWrapping)]}` : '')
  appendComma(parts, threeSidePackText[stringifyValue(form.bfThrSidePack)] ? `3면포장:${threeSidePackText[stringifyValue(form.bfThrSidePack)]}` : '')
  appendComma(parts, sideViewText[stringifyValue(form.bfSideView)] || '')
  appendComma(parts, turnDoorPullText[stringifyValue(form.bfTurnDoorPullType)] || '')
  appendComma(parts, turnDoorOneSideWrapText[stringifyValue(form.bfTurnDoorOneSideWrapType)] || '')
  appendComma(parts, form.bfTurnDoorOneSideWrapType && form.bfOneSideWrapColrNm ? `일면래핑색상:${stringifyValue(form.bfOneSideWrapColrNm)}` : '')
  appendComma(parts, casementCountText[stringifyValue(form.bfAptCmType)] || '')
  if (stringifyValue(form.bfAptCmType) === '1') {
    appendComma(parts, casementMethodText[stringifyValue(form.bfApt1pjMethod)] || '')
  }
  if (stringifyValue(form.bfAptCmType) === '2') {
    appendComma(parts, casementLocText[stringifyValue(form.bfApt2pjLoc)] || '')
    appendComma(parts, casementMethodText[stringifyValue(form.bfApt2pjMethod)] || '')
  }
  appendComma(parts, isYn(form.bfTurnDoorOnlyMakeYn) ? '문짝만 제작' : '')
  appendComma(parts, isYn(form.bfVentPiecesIncludeYn) ? '경첩+피스포함' : '')
  appendComma(parts, form.bfVentHoleLctn ? `경첩타공위치:${stringifyValue(form.bfVentHoleLctn)}` : '')
  appendComma(parts, bfWinCbMillingText[stringifyValue(form.bfWinCbMilingType)] || '')
  appendComma(parts, isYn(form.bfWinOnefixUpHoleYn) ? '1FIX 상부유리타공' : '')
  appendComma(parts, isYn(form.bfWinFmThreeSideYn) ? 'FM,GB-X 3면' : '')
  appendComma(parts, isYn(form.bfWinTopBottomFmYn) ? '상하부만 FM작업' : '')
  appendComma(parts, isYn(form.bfWinSpDdlnShpmYn) ? 'SP마감출고' : '')
  appendComma(parts, isYn(form.bfIhyFixHghtDirYn) ? '이형픽스 방향설정' : '')

  return parts.join(',')
}

function buildSfDecoRemark(form) {
  const labels = [
    includesOption(form.deco1, 1) ? '1층내,' : '',
    includesOption(form.deco1, 2) ? '1층외,' : '',
    includesOption(form.deco1, 3) ? '2층내,' : '',
    includesOption(form.deco1, 4) ? '2층외,' : '',
  ].join('')

  return labels ? `장식X${labels}` : ''
}

function buildSfWindCloserRemark(form) {
  const labels = [
    includesOption(form.winCloser, 1) ? '내창' : '',
    includesOption(form.winCloser, 2) ? '외창' : '',
    includesOption(form.winCloser, 3) ? '2층내창' : '',
    includesOption(form.winCloser, 4) ? '2층외창' : '',
  ].join('')

  return labels ? `윈드클로저:${labels}` : ''
}

function buildSfOutRemark(form) {
  const sfOutType = stringifyValue(form.sfOutType)
  if (!sfOutType) return ''

  const outLabel = sfOutTypeText[sfOutType]
  const positionKey = sfOutType === '4' ? '0' : sfOutType
  const formField = sfOutType === '4' ? 'sfOutType0' : `sfOutType${sfOutType}`
  const position = sfOutPositionText[positionKey]?.[stringifyValue(form[formField])]

  return outLabel && position ? `외짝${outLabel}_${position}` : ''
}

function buildSfProductionRemark(form) {
  const parts = []
  const deco = buildSfDecoRemark(form)
  const windCloser = buildSfWindCloserRemark(form)

  if (deco && windCloser) {
    parts.push(`${deco} ${windCloser}`)
  } else {
    appendComma(parts, deco)
    appendComma(parts, windCloser)
  }

  appendComma(parts, buildSfOutRemark(form))
  appendComma(parts, isYn(form.sfLandscape) ? 'SP 가로작업' : '')
  appendComma(parts, isYn(form.sfRackShip) ? '렉별도출고' : '')
  appendComma(parts, isYn(form.sfDirectShip) ? '직송' : '')
  appendComma(parts, isYn(form.sfOutGlasYn) && form.sfOutGlasInfo ? `유리사양:${stringifyValue(form.sfOutGlasInfo)}` : '')
  appendComma(parts, isYn(form.sfInsideRightBrdYn) ? '내부우측매립' : '')
  appendComma(parts, isYn(form.sfMcOneReqYn) ? 'MC1개요청' : '')
  appendComma(parts, isYn(form.sfOppositeTypeYn) ? '반대타입' : '')
  appendComma(parts, isYn(form.sfBrdProcYn) ? '매립가공' : '')
  appendComma(parts, isYn(form.sfHandleProcYn) ? '핸들가공' : '')
  appendComma(parts, sfRollerText[stringifyValue(form.sfRoller)] || '')
  appendComma(parts, sfCreSizeText[stringifyValue(form.sfCreSize)] ? `크리센트:${sfCreSizeText[stringifyValue(form.sfCreSize)]}` : '')
  appendComma(parts, isYn(form.sfCreHook) ? '크리고리' : '')
  appendComma(parts, sfSontaText[stringifyValue(form.sfSontaLoca)] ? `손타위치:${sfSontaText[stringifyValue(form.sfSontaLoca)]}` : '')
  appendComma(parts, stringifyValue(form.sfAptArmatureType) === 'F' ? '보강재:4면보강' : '')
  const mtrlCo = stringifyValue(form.mtrlCo || form.mtrlCoNm).toUpperCase()
  if (mtrlCo.includes('LX')) {
    if (stringifyValue(form.insdHandleType) === '5') {
      appendComma(parts, '커플핸들(주벤트)')
    } else {
      const hasOusdHandle = isYn(form.dblWindYn)
      const ousdHandleType = hasOusdHandle ? stringifyValue(form.ousdHandleType) : ''
      if (stringifyValue(form.insdHandleType) === '4' && ousdHandleType === '4') {
        appendComma(parts, '반자동핸들')
      } else if (stringifyValue(form.insdHandleType) === '6' && ousdHandleType === '6') {
        appendComma(parts, '그립핸들')
      } else {
        appendComma(parts, stringifyValue(form.insdHandleType) === '4' ? (hasOusdHandle ? '내부: 반자동핸들' : '반자동핸들') : '')
        appendComma(parts, stringifyValue(form.insdHandleType) === '6' ? (hasOusdHandle ? '내부: 그립핸들' : '그립핸들') : '')
        appendComma(parts, ousdHandleType === '4' ? '외부: 반자동핸들' : '')
        appendComma(parts, ousdHandleType === '6' ? '외부: 그립핸들' : '')
      }
    }
  } else if (mtrlCo.includes('HC') && stringifyValue(form.insdHandleType) === '5') {
    appendComma(parts, '양방향핸들')
  }
  if (isYn(form.bfLxHiddenOptYn)) {
    appendComma(parts, includesOption(form.winCloser, 1) ? '(윈드클로저,안전스토퍼,기밀캡)' : '(안전스토퍼,기밀캡)')
  }

  return parts.join(',')
}

function buildMfProductionRemark(form) {
  const parts = []

  appendComma(parts, isYn(form.mfDirectShip) ? '직송' : '')
  appendComma(parts, isYn(form.mfRackShip) ? '렉별도출고' : '')
  appendComma(parts, isYn(form.mfCi4wStickYn) ? '4W용 CI부착' : '')

  if (stringifyValue(form.mfHandle) === '2') {
    parts.push(`방충망핸들${hasValue(form.mfHandleHsize) ? ` 핸들 하 ${stringifyValue(form.mfHandleHsize)}` : ''}`)
  }

  if (stringifyValue(form.mfAptArmatureType) === 'F') {
    parts.push('보강재:4면보강')
  }

  if (isYn(form.isAluMf) && stringifyValue(form.aluMfMdlYn || 'Y') !== 'Y') {
    const handleText = stringifyValue(form.aluMfHandleTypeNm) || safetyNetHandleText[stringifyValue(form.aluMfHandleType)]
    if (handleText && handleText !== '없음') {
      parts.push(`안전망핸들:${handleText}${hasValue(form.aluMfHndlH) ? ` 핸들 하 ${stringifyValue(form.aluMfHndlH)}` : ''}`)
    }
  }

  return parts.join(',')
}

function buildProductionRemarks(form) {
  return {
    pdBfRemSrc: buildBfProductionRemark(form),
    pdSfRemSrc: buildSfProductionRemark(form),
    pdMfRemSrc: buildMfProductionRemark(form),
  }
}

const REQUIRED_SAVE_FIELDS = [
  ['itgEstiNo', ({ itgEstiNo }) => itgEstiNo],
  ['estiNo', ({ wEstiNo }) => wEstiNo],
  ['mdlCd', ({ form }) => form?.mdlCd],
  ['wintydiCd', ({ form }) => form?.wintydiCd],
  ['bsmfOrdUtmCd', ({ form }) => form?.bsmfOrdUtmCd],
  ['sashOrdTypCd', ({ form }) => form?.sashOrdTypCd],
  ['w', ({ form }) => form?.w],
  ['h', ({ form }) => form?.h],
  ['qty', ({ form }) => form?.qty],
  ['insdColrCd', ({ form }) => form?.insdColrCd],
  ['insdSf', ({ form }) => form?.insdSf],
]

function assertRequiredSaveFields(context) {
  for (const [fieldName, getter] of REQUIRED_SAVE_FIELDS) {
    const value = getter(context)
    if (value == null || value === '' || value === 0) {
      throw new Error(`Missing required sash save field: ${fieldName}`)
    }
  }
}

export function buildSashSavePayload({ form, itgEstiNo, wEstiNo, estiNos = '1', editEstiSeq = '' }) {
  assertRequiredSaveFields({ form, itgEstiNo, wEstiNo })
  const bfMillingType = stringifyValue(form.bfMillingType || '0')
  const productionRemarks = buildProductionRemarks(form)
  const isSafetyNetSelected = isYn(form.isAluMf)
  const insdWindClsYn = yn(includesOption(form.winCloser, 1))
  const mainHandleHeightSpecified = !!form.insdHndlHEnabled || hasValue(form.insdHndlH) || hasValue(form.ousdHndlH)
  const secondHandleHeightSpecified = !!form.secondHndlHEnabled || hasValue(form.insd2FHndlH) || hasValue(form.ousd2FHndlH)
  const mainBracketHeightSpecified = !!form.insdBrcktHEnabled || hasValue(form.insdBrcktH) || hasValue(form.ousdBrcktH)
  const secondBracketHeightSpecified = !!form.ousdBrcktHEnabled || hasValue(form.insd2FBrcktH) || hasValue(form.ousd2FBrcktH)

  return {
    itgEstiNo,
    estiNo: wEstiNo,
    estiNos,
    estiSeq: editEstiSeq || '',

    mdlCd: form.mdlCd,
    wintydiCd: form.wintydiCd,
    bftydiCd: form.bftydiCd,
    sizCd: form.sizCd,
    bsmfOrdUtmCd: form.bsmfOrdUtmCd,
    sashOrdTypCd: form.sashOrdTypCd,
    ctgrCd: 'P',
    windLocCd: '01',
    rt: 1,
    glasDblYn: 'Y',
    unpAplScn: '01',
    m2Unp: '0',
    issueType: stringifyValue(form.issueType),
    appdocId: stringifyValue(form.appdocId),
    unqColrPolSaveYn: yn(form.unqColrPolSaveYn),

    w0Size: stringifyValue(form.w),
    h0Size: stringifyValue(form.h),
    wSize: stringifyValue(form.w),
    hSize: stringifyValue(form.h),
    qty: stringifyValue(form.qty),
    w1Size: stringifyValue(form.w1),
    w2Size: stringifyValue(form.w2),
    w3Size: stringifyValue(form.w3),
    w4Size: stringifyValue(form.w4),
    w5Size: stringifyValue(form.w5),
    h1Size: stringifyValue(form.h1),
    h2Size: stringifyValue(form.h2),
    h3Size: stringifyValue(form.h3),
    h4Size: stringifyValue(form.h4),
    h5Size: stringifyValue(form.h5),
    csSize: stringifyValue(form.cs),
    cs1Size: stringifyValue(form.cs1),
    cs2Size: stringifyValue(form.cs2),
    cs3Size: stringifyValue(form.cs3),
    cs4Size: stringifyValue(form.cs4),
    cs5Size: stringifyValue(form.cs5),

    crtnColrCd: 'WH',
    insdColrCd: form.insdColrCd,
    ousdColrCd: form.ousdColrCd || form.insdColrCd,

    insdSf: form.insdSf,
    ousdSf: form.ousdSf,
    ventLoc: form.ventLoc || '',
    drwgCd: stringifyValue(form.drwgCd),
    screenType: form.screenType,
    aluMfYn: isSafetyNetSelected ? 'Y' : 'N',
    aluMfHandleType: isSafetyNetSelected ? stringifyValue(form.aluMfHandleType) : '',
    aluMfMdlYn: isSafetyNetSelected ? stringifyValue(form.aluMfMdlYn || 'Y') : 'N',
    aluMfHndlH: isSafetyNetSelected && form.aluMfMdlYn !== 'Y' ? stringifyValue(form.aluMfHndlH) : '',
    bfSlcnFnshYn: yn(form.slcnFnshYn),
    drnHoleYn: yn(form.drnHoleYn),
    ventHoleYn: yn(form.ventHoleYn),
    bfMillingType,
    bfMillingWing: bfMillingType,
    bfArmatureType: stringifyValue(form.bfArmatureType),
    bfLockCnt: stringifyValue(form.bfLockCnt),
    bfWrapping: stringifyValue(form.bfWrapping),
    bfThrSidePack: stringifyValue(form.bfThrSidePack),
    bfMillingDetail: bfMillingType !== '0' ? stringifyValue(form.bfMillingDetail) : '',
    bfMillingUp: bfMillingType !== '0' ? yn(form.bfMillingUp) : 'N',
    bfMillingDown: bfMillingType !== '0' ? yn(form.bfMillingDown) : 'N',
    bfMillingLeft: bfMillingType !== '0' ? yn(form.bfMillingLeft) : 'N',
    bfMillingRight: bfMillingType !== '0' ? yn(form.bfMillingRight) : 'N',
    bfWeldNoneYn: yn(form.bfWeldNoneYn),
    bfWeld: yn(form.bfWeld),
    fillingPiecesYn: yn(form.fillingPiecesYn),
    basedfillingPiecesYn: yn(form.basedfillingPiecesYn),
    bfRackShip: yn(form.bfRackShip),
    bfStopper: yn(form.bfStopper),
    bfDirectShip: yn(form.bfDirectShip),
    bfShipAddr: isYn(form.bfDirectShip) ? stringifyValue(form.bfShipAddr) : '',
    bfForesidePack: yn(form.bfForesidePackYn),
    bfKsmark: yn(form.bfKsmarkYn),
    bfLxHiddenOptYn: yn(form.bfLxHiddenOptYn),
    bfSideView: stringifyValue(form.bfSideView),
    bfFmGbYn: yn(form.bfFmGbYn),
    bfFmGbShipYn: yn(form.bfFmGbShipYn),
    bfFmGbUpDownYn: yn(form.bfFmGbUpDownYn),
    bfFmGbRlYn: yn(form.bfFmGbRlYn),
    bfFmGbCutYn: yn(form.bfFmGbCutYn),
    bfSsOpt: yn(form.bfSsOpt),
    bfFixBuild: yn(form.bfFixBuild),
    bfFdHd: yn(form.bfFdHd),
    bfTurnDoorPullType: stringifyValue(form.bfTurnDoorPullType),
    bfTurnDoorOneSideWrapType: stringifyValue(form.bfTurnDoorOneSideWrapType),
    bfOneSideWrapColrNm: form.bfTurnDoorOneSideWrapType ? stringifyValue(form.bfOneSideWrapColrNm) : '',
    bfAptCmType: stringifyValue(form.bfAptCmType),
    bfApt1pjMethod: stringifyValue(form.bfApt1pjMethod),
    bfApt2pjLoc: stringifyValue(form.bfApt2pjLoc),
    bfApt2pjMethod: stringifyValue(form.bfApt2pjMethod),
    bfVentHoleLctn: stringifyValue(form.bfVentHoleLctn),
    bfWinCbMilingType: stringifyValue(form.bfWinCbMilingType),
    bfTurnDoorOnlyMakeYn: yn(form.bfTurnDoorOnlyMakeYn),
    bfVentPiecesIncludeYn: yn(form.bfVentPiecesIncludeYn),
    bfWinOnefixUpHoleYn: yn(form.bfWinOnefixUpHoleYn),
    bfWinFmThreeSideYn: yn(form.bfWinFmThreeSideYn),
    bfWinTopBottomFmYn: yn(form.bfWinTopBottomFmYn),
    bfWinSpDdlnShpmYn: yn(form.bfWinSpDdlnShpmYn),
    bfIhyFixHghtDirYn: yn(form.bfIhyFixHghtDirYn),
    sfLandscape: yn(form.sfLandscape),
    sfArmatureType: stringifyValue(form.sfArmatureType),
    sfOppositeTypeYn: yn(form.sfOppositeTypeYn),
    sfInsideRightBrdYn: yn(form.sfInsideRightBrdYn),
    sfMcOneReqYn: yn(form.sfMcOneReqYn),
    sfBrdProcYn: yn(form.sfBrdProcYn),
    sfHandleProcYn: yn(form.sfHandleProcYn),
    sfRackShip: yn(form.sfRackShip),
    sfDirectShip: yn(form.sfDirectShip),
    sfShipAddr: isYn(form.sfDirectShip) ? stringifyValue(form.sfShipAddr) : '',
    sfOutGlasYn: yn(form.sfOutGlasYn),
    sfOutGlasInfo: isYn(form.sfOutGlasYn) ? stringifyValue(form.sfOutGlasInfo) : '',
    sfRoller: stringifyValue(form.sfRoller),
    sfCreHook: yn(form.sfCreHook),
    sfCreSize: stringifyValue(form.sfCreSize),
    sfOutType: stringifyValue(form.sfOutType),
    sfOutType0: stringifyValue(form.sfOutType0),
    sfOutType1: stringifyValue(form.sfOutType1),
    sfOutType2: stringifyValue(form.sfOutType2),
    sfOutType3: stringifyValue(form.sfOutType3),
    sfSontaLoca: stringifyValue(form.sfSontaLoca),
    sfInsdVentHoleYn: yn(form.sfInsdVentHoleYn),
    sfOusdVentHoleYn: yn(form.sfOusdVentHoleYn),
    sfAptArmatureType: stringifyValue(form.sfAptArmatureType),
    sfAptHandleType: stringifyValue(form.sfAptHandleType),
    insdDeckNoneYn: yn(includesOption(form.deco1, 1)),
    ousdDeckNoneYn: yn(includesOption(form.deco1, 2)),
    insd2FDeckNoneYn: yn(includesOption(form.deco1, 3)),
    ousd2FDeckNoneYn: yn(includesOption(form.deco1, 4)),
    windCloserMatYn: insdWindClsYn,
    insdWindClsYn,
    ousdWindClsYn: yn(includesOption(form.winCloser, 2)),
    insd2FWindClsYn: yn(includesOption(form.winCloser, 3)),
    ousd2FWindClsYn: yn(includesOption(form.winCloser, 4)),
    mfRackShip: yn(form.mfRackShip),
    mfCi4wStickYn: yn(form.mfCi4wStickYn),
    mfDirectShip: yn(form.mfDirectShip),
    mfShipAddr: isYn(form.mfDirectShip) ? stringifyValue(form.mfShipAddr) : '',
    mfHandle: stringifyValue(form.mfHandle),
    mfHandleHsize: form.mfHandle ? stringifyValue(form.mfHandleHsize) : '',
    mfArmatureType: stringifyValue(form.mfArmatureType),
    mfAptArmatureType: stringifyValue(form.mfAptArmatureType),
    glasStdalYn: yn(form.alGlass),
    glasAttachYn: yn(form.glasAttachYn),
    glasAdmsYn: form.glasAdmsYn || 'Y',

    insdHandleType: form.insdHandleType,
    ousdHandleType: form.ousdHandleType,
    insdHndlHMiddle: mainHandleHeightSpecified ? 'N' : 'Y',
    insdHndlH: mainHandleHeightSpecified ? stringifyValue(form.insdHndlH) : '',
    insd2FHndlHMiddle: secondHandleHeightSpecified ? 'N' : (form.secondFloorEnabled ? 'Y' : 'N'),
    insd2FHndlH: secondHandleHeightSpecified ? stringifyValue(form.insd2FHndlH) : '',
    ousdHndlH: mainHandleHeightSpecified ? stringifyValue(form.ousdHndlH) : '',
    ousd2FHndlH: secondHandleHeightSpecified ? stringifyValue(form.ousd2FHndlH) : '',

    insdBrcktHMiddle: mainBracketHeightSpecified ? 'N' : 'Y',
    insdBrcktH: mainBracketHeightSpecified ? stringifyValue(form.insdBrcktH) : '',
    insd2FBrcktHMiddle: secondBracketHeightSpecified ? 'N' : (form.secondFloorEnabled ? 'Y' : 'N'),
    ousdBrcktH: mainBracketHeightSpecified ? stringifyValue(form.ousdBrcktH) : '',
    insd2FBrcktH: secondBracketHeightSpecified ? stringifyValue(form.insd2FBrcktH) : '',
    ousd2FBrcktH: secondBracketHeightSpecified ? stringifyValue(form.ousd2FBrcktH) : '',

    mtrlCds1: stringifyValue(form.mtrlCds1),
    mtrlCds2: stringifyValue(form.mtrlCds2),
    mtrlCds3: stringifyValue(form.mtrlCds3),
    mtrlCds4: stringifyValue(form.mtrlCds4),
    insdSfGlasMtrlCd: stringifyValue(form.mtrlCds1),
    ousdSfGlasMtrlCd: stringifyValue(form.mtrlCds2),
    insdBfGlasMtrlCd: stringifyValue(form.mtrlCds3),
    ousdBfGlasMtrlCd: stringifyValue(form.mtrlCds4),

    remSrc: form.remSrc,
    pdBfRemSrc: combineProductionRemark(form.pdBfRemSrc, productionRemarks.pdBfRemSrc),
    pdSfRemSrc: combineProductionRemark(form.pdSfRemSrc, productionRemarks.pdSfRemSrc),
    pdMfRemSrc: combineProductionRemark(form.pdMfRemSrc, productionRemarks.pdMfRemSrc),
  }
}
