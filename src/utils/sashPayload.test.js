import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSashSavePayload } from './sashPayload.js'

function requiredForm(overrides = {}) {
  return {
    mdlCd: '0161-01',
    wintydiCd: '01',
    bftydiCd: 'BF',
    sizCd: 'S',
    bsmfOrdUtmCd: '101',
    sashOrdTypCd: '10',
    w: 2000,
    h: 1000,
    qty: 1,
    insdColrCd: 'WH',
    ousdColrCd: 'WH',
    insdSf: 'SF-IN',
    ousdSf: 'SF-OUT',
    ventLoc: 'L',
    screenType: 'PVC',
    deco1: [],
    winCloser: [],
    ...overrides,
  }
}

test('buildSashSavePayload maps required sash fields for a new estimate', () => {
  const payload = buildSashSavePayload({
    form: {
      mdlCd: '0161-01',
      wintydiCd: '01',
      bftydiCd: 'BF',
      sizCd: 'S',
      bsmfOrdUtmCd: '101',
      sashOrdTypCd: '10',
      w: 2000,
      h: 1000,
      qty: 2,
      w1: 1000,
      w2: '',
      w3: null,
      w4: undefined,
      w5: 0,
      h1: 500,
      h2: '',
      h3: null,
      h4: undefined,
      h5: 0,
      cs: 10,
      cs1: '',
      cs2: null,
      cs3: undefined,
      cs4: 0,
      cs5: 5,
      insdColrCd: 'WH',
      ousdColrCd: '',
      insdSf: 'SF-IN',
      ousdSf: 'SF-OUT',
      ventLoc: 'L',
      screenType: 'PVC',
      isAluMf: false,
      aluMfHandleType: '',
      aluMfMdlYn: 'Y',
      aluMfHndlH: '',
      slcnFnshYn: true,
      drnHoleYn: true,
      ventHoleYn: true,
      bfMillingType: '2',
      bfArmatureType: 'F',
      bfLockCnt: '2',
      bfWrapping: '1',
      bfThrSidePack: '2',
      bfMillingDetail: '4',
      bfMillingUp: true,
      bfMillingDown: false,
      bfMillingLeft: true,
      bfMillingRight: false,
      bfWeldNoneYn: true,
      bfWeld: true,
      fillingPiecesYn: true,
      bfRackShip: true,
      bfStopper: true,
      bfDirectShip: true,
      bfShipAddr: 'BF address',
      bfForesidePackYn: true,
      bfKsmarkYn: true,
      bfLxHiddenOptYn: true,
      bfSideView: '1',
      bfFmGbYn: true,
      bfFmGbShipYn: true,
      bfFmGbUpDownYn: true,
      bfFmGbRlYn: true,
      bfFmGbCutYn: true,
      bfSsOpt: true,
      bfFixBuild: true,
      bfFdHd: true,
      bfTurnDoorPullType: '1',
      bfTurnDoorOneSideWrapType: '2',
      bfOneSideWrapColrNm: '다크그레이',
      bfAptCmType: '1',
      bfApt1pjMethod: '2',
      bfApt2pjLoc: '3',
      bfApt2pjMethod: '1',
      bfTurnDoorOnlyMakeYn: true,
      bfVentPiecesIncludeYn: true,
      bfWinOnefixUpHoleYn: true,
      bfWinFmThreeSideYn: true,
      bfWinTopBottomFmYn: true,
      bfWinSpDdlnShpmYn: true,
      bfIhyFixHghtDirYn: true,
      sfLandscape: true,
      sfOppositeTypeYn: true,
      sfRackShip: true,
      sfDirectShip: true,
      sfShipAddr: 'SF address',
      sfOutGlasYn: true,
      sfOutGlasInfo: '24T 로이',
      sfRoller: '1',
      sfCreHook: true,
      sfCreSize: '3',
      sfOutType: '4',
      sfOutType0: '1',
      sfOutType1: '2',
      sfOutType2: '3',
      sfOutType3: '4',
      sfSontaLoca: '8',
      deco1: ['1', 3],
      winCloser: [1, '2'],
      mfRackShip: true,
      mfCi4wStickYn: true,
      mfDirectShip: true,
      mfShipAddr: 'MF address',
      mfHandle: '2',
      mfHandleHsize: 1234,
      mfAptArmatureType: 'F',
      alGlass: true,
      glasAdmsYn: 'Y',
      insdHandleType: 'H1',
      ousdHandleType: 'H2',
      insdHndlHEnabled: true,
      ousdHndlHEnabled: false,
      insdHndlH: 900,
      ousdHndlH: '',
      insdBrcktHEnabled: false,
      ousdBrcktHEnabled: true,
      insdBrcktH: 800,
      ousdBrcktH: 850,
      secondFloorEnabled: true,
      insd2FBrcktH: 700,
      ousd2FBrcktH: 750,
      mtrlCds1: 'G1',
      mtrlCds2: 'G2',
      mtrlCds3: '',
      mtrlCds4: null,
      remSrc: 'memo',
    },
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
    estiNos: '1',
    editEstiSeq: '',
  })

  assert.equal(payload.itgEstiNo, 'ITG001')
  assert.equal(payload.estiNo, 'W001')
  assert.equal(payload.estiNos, '1')
  assert.equal(payload.estiSeq, '')
  assert.equal(payload.bsmfOrdUtmCd, '101')
  assert.equal(payload.w0Size, '2000')
  assert.equal(payload.h0Size, '1000')
  assert.equal(payload.qty, '2')
  assert.equal(payload.wSize, '2000')
  assert.equal(payload.hSize, '1000')
  assert.equal(payload.ctgrCd, 'P')
  assert.equal(payload.windLocCd, '01')
  assert.equal(payload.rt, 1)
  assert.equal(payload.glasDblYn, 'Y')
  assert.equal(payload.unpAplScn, '01')
  assert.equal(payload.m2Unp, '0')
  assert.equal(payload.insdSfGlasMtrlCd, 'G1')
  assert.equal(payload.ousdSfGlasMtrlCd, 'G2')
  assert.equal(payload.insdBfGlasMtrlCd, '')
  assert.equal(payload.ousdBfGlasMtrlCd, '')
  assert.equal(payload.w2Size, '')
  assert.equal(payload.w5Size, '0')
  assert.equal(payload.cs5Size, '5')
  assert.equal(payload.crtnColrCd, 'WH')
  assert.equal(payload.ousdColrCd, 'WH')
  assert.equal(payload.aluMfYn, 'N')
  assert.equal(payload.aluMfHandleType, '')
  assert.equal(payload.aluMfMdlYn, 'N')
  assert.equal(payload.aluMfHndlH, '')
  assert.equal(payload.bfSlcnFnshYn, 'Y')
  assert.equal(payload.drnHoleYn, 'Y')
  assert.equal(payload.ventHoleYn, 'Y')
  assert.equal(payload.bfMillingType, '2')
  assert.equal(payload.bfArmatureType, 'F')
  assert.equal(payload.bfLockCnt, '2')
  assert.equal(payload.bfWrapping, '1')
  assert.equal(payload.bfThrSidePack, '2')
  assert.equal(payload.bfMillingDetail, '4')
  assert.equal(payload.bfMillingUp, 'Y')
  assert.equal(payload.bfMillingDown, 'N')
  assert.equal(payload.bfMillingLeft, 'Y')
  assert.equal(payload.bfMillingRight, 'N')
  assert.equal(payload.bfWeldNoneYn, 'Y')
  assert.equal(payload.bfWeld, 'Y')
  assert.equal(payload.fillingPiecesYn, 'Y')
  assert.equal(payload.bfRackShip, 'Y')
  assert.equal(payload.bfStopper, 'Y')
  assert.equal(payload.bfDirectShip, 'Y')
  assert.equal(payload.bfShipAddr, 'BF address')
  assert.equal(payload.bfForesidePack, 'Y')
  assert.equal(payload.bfKsmark, 'Y')
  assert.equal(payload.bfLxHiddenOptYn, 'Y')
  assert.equal(payload.bfSideView, '1')
  assert.equal(payload.bfFmGbYn, 'Y')
  assert.equal(payload.bfFmGbShipYn, 'Y')
  assert.equal(payload.bfFmGbUpDownYn, 'Y')
  assert.equal(payload.bfFmGbRlYn, 'Y')
  assert.equal(payload.bfFmGbCutYn, 'Y')
  assert.equal(payload.bfSsOpt, 'Y')
  assert.equal(payload.bfFixBuild, 'Y')
  assert.equal(payload.bfFdHd, 'Y')
  assert.equal(payload.bfTurnDoorPullType, '1')
  assert.equal(payload.bfTurnDoorOneSideWrapType, '2')
  assert.equal(payload.bfOneSideWrapColrNm, '다크그레이')
  assert.equal(payload.bfAptCmType, '1')
  assert.equal(payload.bfApt1pjMethod, '2')
  assert.equal(payload.bfApt2pjLoc, '3')
  assert.equal(payload.bfApt2pjMethod, '1')
  assert.equal(payload.bfTurnDoorOnlyMakeYn, 'Y')
  assert.equal(payload.bfVentPiecesIncludeYn, 'Y')
  assert.equal(payload.bfWinOnefixUpHoleYn, 'Y')
  assert.equal(payload.bfWinFmThreeSideYn, 'Y')
  assert.equal(payload.bfWinTopBottomFmYn, 'Y')
  assert.equal(payload.bfWinSpDdlnShpmYn, 'Y')
  assert.equal(payload.bfIhyFixHghtDirYn, 'Y')
  assert.equal(payload.sfLandscape, 'Y')
  assert.equal(payload.sfOppositeTypeYn, 'Y')
  assert.equal(payload.sfRackShip, 'Y')
  assert.equal(payload.sfDirectShip, 'Y')
  assert.equal(payload.sfShipAddr, 'SF address')
  assert.equal(payload.sfOutGlasYn, 'Y')
  assert.equal(payload.sfOutGlasInfo, '24T 로이')
  assert.equal(payload.sfRoller, '1')
  assert.equal(payload.sfCreHook, 'Y')
  assert.equal(payload.sfCreSize, '3')
  assert.equal(payload.sfOutType, '4')
  assert.equal(payload.sfOutType0, '1')
  assert.equal(payload.sfOutType1, '2')
  assert.equal(payload.sfOutType2, '3')
  assert.equal(payload.sfOutType3, '4')
  assert.equal(payload.sfSontaLoca, '8')
  assert.equal(payload.insdDeckNoneYn, 'Y')
  assert.equal(payload.insd2FDeckNoneYn, 'Y')
  assert.equal(payload.insdWindClsYn, 'Y')
  assert.equal(payload.ousdWindClsYn, 'Y')
  assert.equal(payload.mfRackShip, 'Y')
  assert.equal(payload.mfCi4wStickYn, 'Y')
  assert.equal(payload.mfDirectShip, 'Y')
  assert.equal(payload.mfShipAddr, 'MF address')
  assert.equal(payload.mfHandle, '2')
  assert.equal(payload.mfHandleHsize, '1234')
  assert.equal(payload.mfAptArmatureType, 'F')
  assert.equal(payload.glasStdalYn, 'Y')
  assert.equal(payload.glasAdmsYn, 'Y')
  assert.equal(payload.insdHndlHMiddle, 'N')
  assert.equal(payload.insdHndlH, '900')
  assert.equal(payload.insd2FHndlHMiddle, 'Y')
  assert.equal(payload.ousdHndlH, '')
  assert.equal(payload.insdBrcktHMiddle, 'N')
  assert.equal(payload.insdBrcktH, '800')
  assert.equal(payload.ousdBrcktH, '850')
  assert.equal(payload.insd2FBrcktHMiddle, 'N')
  assert.equal(payload.insd2FBrcktH, '700')
  assert.equal(payload.ousd2FBrcktH, '750')
  assert.equal(payload.mtrlCds4, '')
})

test('buildSashSavePayload preserves edit sequence and outside color', () => {
  const payload = buildSashSavePayload({
    form: {
      mdlCd: '2162-01',
      wintydiCd: '03',
      bftydiCd: '',
      sizCd: '',
      bsmfOrdUtmCd: '101',
      sashOrdTypCd: '10',
      w: 1800,
      h: 900,
      qty: 1,
      insdColrCd: 'IV',
      ousdColrCd: 'BK',
      insdSf: 'SF1',
      ousdSf: '',
      ventLoc: '',
      screenType: '',
      isAluMf: true,
      aluMfHandleType: '2',
      aluMfMdlYn: 'N',
      aluMfHndlH: 950,
      slcnFnshYn: false,
      drnHoleYn: false,
      ventHoleYn: false,
      bfMillingType: '',
      bfArmatureType: '',
      bfLockCnt: '',
      bfWrapping: '',
      bfThrSidePack: '',
      bfMillingDetail: 'unused detail',
      bfMillingUp: true,
      bfMillingDown: true,
      bfMillingLeft: true,
      bfMillingRight: true,
      bfWeldNoneYn: false,
      bfWeld: false,
      fillingPiecesYn: false,
      bfRackShip: false,
      bfStopper: false,
      bfDirectShip: false,
      bfShipAddr: 'unused BF',
      bfForesidePackYn: false,
      bfKsmarkYn: false,
      bfLxHiddenOptYn: false,
      bfSideView: '',
      bfFmGbYn: false,
      bfFmGbShipYn: false,
      bfFmGbUpDownYn: false,
      bfFmGbRlYn: false,
      bfFmGbCutYn: false,
      bfSsOpt: false,
      bfFixBuild: false,
      bfFdHd: false,
      bfTurnDoorPullType: '',
      bfTurnDoorOneSideWrapType: '',
      bfOneSideWrapColrNm: 'unused wrap color',
      bfAptCmType: '',
      bfApt1pjMethod: '',
      bfApt2pjLoc: '',
      bfApt2pjMethod: '',
      bfTurnDoorOnlyMakeYn: false,
      bfVentPiecesIncludeYn: false,
      bfWinOnefixUpHoleYn: false,
      bfWinFmThreeSideYn: false,
      bfWinTopBottomFmYn: false,
      bfWinSpDdlnShpmYn: false,
      bfIhyFixHghtDirYn: false,
      sfLandscape: false,
      sfOppositeTypeYn: false,
      sfRackShip: false,
      sfDirectShip: false,
      sfShipAddr: 'unused SF',
      sfOutGlasYn: false,
      sfOutGlasInfo: 'unused glass',
      sfRoller: '',
      sfCreHook: false,
      sfCreSize: '',
      sfOutType: '',
      sfOutType0: '',
      sfOutType1: '',
      sfOutType2: '',
      sfOutType3: '',
      sfSontaLoca: '',
      deco1: [],
      winCloser: [],
      mfRackShip: false,
      mfCi4wStickYn: false,
      mfDirectShip: false,
      mfShipAddr: 'unused MF',
      mfHandle: '',
      mfHandleHsize: 'unused',
      mfAptArmatureType: '',
      alGlass: false,
      insdHandleType: '',
      ousdHandleType: '',
      insdHndlHEnabled: false,
      ousdHndlHEnabled: false,
      insdHndlH: null,
      ousdHndlH: null,
      secondFloorEnabled: false,
      insdBrcktHEnabled: false,
      ousdBrcktHEnabled: true,
      insdBrcktH: 800,
      ousdBrcktH: 850,
      insd2FBrcktH: 700,
      ousd2FBrcktH: 750,
      mtrlCds1: '',
      mtrlCds2: '',
      mtrlCds3: '',
      mtrlCds4: '',
      remSrc: '',
    },
    itgEstiNo: 'ITG002',
    wEstiNo: 'W002',
    estiNos: '2',
    editEstiSeq: '7',
  })

  assert.equal(payload.estiNos, '2')
  assert.equal(payload.estiSeq, '7')
  assert.equal(payload.ousdColrCd, 'BK')
  assert.equal(payload.aluMfYn, 'Y')
  assert.equal(payload.aluMfHandleType, '2')
  assert.equal(payload.aluMfMdlYn, 'N')
  assert.equal(payload.aluMfHndlH, '950')
  assert.equal(payload.bfSlcnFnshYn, 'N')
  assert.equal(payload.drnHoleYn, 'N')
  assert.equal(payload.ventHoleYn, 'N')
  assert.equal(payload.bfMillingType, '0')
  assert.equal(payload.bfArmatureType, '')
  assert.equal(payload.bfLockCnt, '')
  assert.equal(payload.bfWrapping, '')
  assert.equal(payload.bfThrSidePack, '')
  assert.equal(payload.bfMillingDetail, '')
  assert.equal(payload.bfMillingUp, 'N')
  assert.equal(payload.bfMillingDown, 'N')
  assert.equal(payload.bfMillingLeft, 'N')
  assert.equal(payload.bfMillingRight, 'N')
  assert.equal(payload.bfWeldNoneYn, 'N')
  assert.equal(payload.sfOppositeTypeYn, 'N')
  assert.equal(payload.bfDirectShip, 'N')
  assert.equal(payload.bfShipAddr, '')
  assert.equal(payload.bfForesidePack, 'N')
  assert.equal(payload.bfSideView, '')
  assert.equal(payload.bfOneSideWrapColrNm, '')
  assert.equal(payload.bfTurnDoorOnlyMakeYn, 'N')
  assert.equal(payload.sfDirectShip, 'N')
  assert.equal(payload.sfShipAddr, '')
  assert.equal(payload.sfOutGlasYn, 'N')
  assert.equal(payload.sfOutGlasInfo, '')
  assert.equal(payload.insdDeckNoneYn, 'N')
  assert.equal(payload.insdWindClsYn, 'N')
  assert.equal(payload.mfDirectShip, 'N')
  assert.equal(payload.mfShipAddr, '')
  assert.equal(payload.mfHandle, '')
  assert.equal(payload.mfHandleHsize, '')
  assert.equal(payload.mfAptArmatureType, '')
  assert.equal(payload.glasStdalYn, 'N')
  assert.equal(payload.insdHndlHMiddle, 'Y')
  assert.equal(payload.insdHndlH, '')
  assert.equal(payload.insd2FHndlHMiddle, 'N')
  assert.equal(payload.ousdHndlH, '')
  assert.equal(payload.insd2FBrcktHMiddle, 'N')
  assert.equal(payload.insdBrcktHMiddle, 'N')
  assert.equal(payload.insdBrcktH, '800')
  assert.equal(payload.ousdBrcktH, '850')
  assert.equal(payload.insd2FBrcktH, '700')
  assert.equal(payload.ousd2FBrcktH, '750')
})

test('buildSashSavePayload includes estimate identifiers for a new sash save', () => {
  const payload = buildSashSavePayload({
    form: requiredForm(),
    itgEstiNo: 'ITG-NEW',
    wEstiNo: 'W-NEW',
  })

  assert.equal(payload.itgEstiNo, 'ITG-NEW')
  assert.equal(payload.estiNo, 'W-NEW')
  assert.equal(payload.estiNos, '1')
  assert.equal(payload.estiSeq, '')
})

test('buildSashSavePayload automatically saves height middle flags as N when handle or bracket heights exist', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      secondFloorEnabled: true,
      insdHndlHEnabled: false,
      ousdHndlHEnabled: false,
      insdHndlH: 910,
      ousdHndlH: 920,
      insd2FHndlH: 930,
      ousd2FHndlH: 940,
      insdBrcktHEnabled: false,
      ousdBrcktHEnabled: false,
      insdBrcktH: 810,
      ousdBrcktH: 820,
      insd2FBrcktH: 830,
      ousd2FBrcktH: 840,
    }),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
  })

  assert.equal(payload.insdHndlHMiddle, 'N')
  assert.equal(payload.insdHndlH, '910')
  assert.equal(payload.ousdHndlH, '920')
  assert.equal(payload.insd2FHndlHMiddle, 'N')
  assert.equal(payload.insd2FHndlH, '930')
  assert.equal(payload.ousd2FHndlH, '940')
  assert.equal(payload.insdBrcktHMiddle, 'N')
  assert.equal(payload.insdBrcktH, '810')
  assert.equal(payload.ousdBrcktH, '820')
  assert.equal(payload.insd2FBrcktHMiddle, 'N')
  assert.equal(payload.insd2FBrcktH, '830')
  assert.equal(payload.ousd2FBrcktH, '840')
})

test('buildSashSavePayload saves outside handle and second bracket middle flags as N when their heights exist', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      secondFloorEnabled: false,
      insdHndlHEnabled: false,
      ousdHndlHEnabled: false,
      ousdHndlH: 925,
      insd2FBrcktH: 835,
      ousd2FBrcktH: 845,
    }),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
  })

  assert.equal(payload.insdHndlHMiddle, 'N')
  assert.equal(payload.ousdHndlH, '925')
  assert.equal(payload.insd2FBrcktHMiddle, 'N')
  assert.equal(payload.insd2FBrcktH, '835')
  assert.equal(payload.ousd2FBrcktH, '845')
})

test('buildSashSavePayload keeps edit sequence for an existing sash save', () => {
  const payload = buildSashSavePayload({
    form: requiredForm(),
    itgEstiNo: 'ITG-EDIT',
    wEstiNo: 'W-EDIT',
    estiNos: '2',
    editEstiSeq: '9',
  })

  assert.equal(payload.itgEstiNo, 'ITG-EDIT')
  assert.equal(payload.estiNo, 'W-EDIT')
  assert.equal(payload.estiNos, '2')
  assert.equal(payload.estiSeq, '9')
})

test('buildSashSavePayload rejects missing required save fields before creating payload', () => {
  assert.throws(
    () => buildSashSavePayload({
      form: requiredForm({ mdlCd: '' }),
      itgEstiNo: 'ITG001',
      wEstiNo: 'W001',
    }),
    /mdlCd/
  )
  assert.throws(
    () => buildSashSavePayload({
      form: requiredForm({ w: null }),
      itgEstiNo: 'ITG001',
      wEstiNo: 'W001',
    }),
    /w/
  )
  assert.throws(
    () => buildSashSavePayload({
      form: requiredForm(),
      itgEstiNo: '',
      wEstiNo: 'W001',
    }),
    /itgEstiNo/
  )
}
)

test('buildSashSavePayload includes high-risk web parity fields', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      bfMillingType: '2',
      bfMillingDetail: '4',
      bfMillingUp: true,
      winCloser: [1, 3, 4],
      sfInsdVentHoleYn: true,
      sfOusdVentHoleYn: true,
      pdBfRemSrc: 'BF note',
      pdSfRemSrc: 'SF note',
      pdMfRemSrc: 'MF note',
      secondFloorEnabled: true,
      secondHndlHEnabled: true,
      insd2FHndlH: 1100,
      ousd2FHndlH: 1200,
    }),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
  })

  assert.equal(payload.bfMillingWing, '2')
  assert.equal(payload.windCloserMatYn, 'Y')
  assert.equal(payload.insdWindClsYn, 'Y')
  assert.equal(payload.ousdWindClsYn, 'N')
  assert.equal(payload.insd2FWindClsYn, 'Y')
  assert.equal(payload.ousd2FWindClsYn, 'Y')
  assert.equal(payload.sfInsdVentHoleYn, 'Y')
  assert.equal(payload.sfOusdVentHoleYn, 'Y')
  assert.equal(payload.pdBfRemSrc, 'BF note,날개부분 상')
  assert.equal(payload.pdSfRemSrc, 'SF note,윈드클로저:내창2층내창2층외창')
  assert.equal(payload.pdMfRemSrc, 'MF note')
  assert.equal(payload.insd2FHndlH, '1100')
  assert.equal(payload.ousd2FHndlH, '1200')
})

test('buildSashSavePayload generates BF production remarks from milling, default, and special options', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      bfMillingType: '2',
      bfMillingDetail: '4',
      bfMillingUp: true,
      bfMillingLeft: true,
      bfWeldNoneYn: true,
      fillingPiecesYn: true,
      basedfillingPiecesYn: true,
      bfRackShip: true,
      bfStopper: true,
      drnHoleYn: false,
      bfArmatureType: 'F',
      bfWrapping: '2',
      bfThrSidePack: '1',
      bfFmGbYn: true,
      bfFmGbShipYn: true,
      bfSsOpt: true,
      bfSideView: '2',
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(
    payload.pdBfRemSrc,
    '날개부분 상좌,렉별도출고,절단바로(용접X),물구멍 X,상하휠링피스,기존 휠링피스,스토퍼부착,FM-X,GB-X,FM/GB 길게 별도 출고,SS일자절단,연결구,보강재:4면,랩핑:ㄷ자,3면포장:백색,40면 보이게'
  )
})

test('buildSashSavePayload generates SF production remarks from deco, wind closer, and one-sash options', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      deco1: [1, 3],
      winCloser: [1, 2, 3, 4],
      sfOutType: '2',
      sfOutType2: '3',
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(payload.pdSfRemSrc, '장식X1층내,2층내, 윈드클로저:내창외창2층내창2층외창,외짝3W_3번창')
})

test('buildSashSavePayload generates MF production remarks from screen handle and safety-net handle options', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      isAluMf: true,
      aluMfMdlYn: 'N',
      aluMfHandleType: '2',
      aluMfHndlH: 900,
      mfHandle: '2',
      mfHandleHsize: 1234,
      mfRackShip: true,
      mfCi4wStickYn: true,
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(payload.pdMfRemSrc, '렉별도출고,4W용 CI부착,방충망핸들 핸들 하 1234,안전망핸들:일반 핸들 하 900')
})

test('buildSashSavePayload uses selected safety-net handle master name in MF production remarks', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      isAluMf: true,
      aluMfMdlYn: 'N',
      aluMfHandleType: '2',
      aluMfHandleTypeNm: '고급핸들',
      aluMfHndlH: 900,
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(payload.pdMfRemSrc, '안전망핸들:고급핸들 핸들 하 900')
})

test('buildSashSavePayload preserves existing production remarks when no auto remark option is selected', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      pdBfRemSrc: '기존 BF 비고',
      pdSfRemSrc: '기존 SF 비고',
      pdMfRemSrc: '기존 MF 비고',
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(payload.pdBfRemSrc, '기존 BF 비고')
  assert.equal(payload.pdSfRemSrc, '기존 SF 비고')
  assert.equal(payload.pdMfRemSrc, '기존 MF 비고')
})

test('buildSashSavePayload merges existing production remarks with generated web parity remarks', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      pdBfRemSrc: '기존 BF 비고',
      pdSfRemSrc: '기존 SF 비고',
      pdMfRemSrc: '기존 MF 비고',
      bfRackShip: true,
      sfRackShip: true,
      mfRackShip: true,
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.equal(payload.pdBfRemSrc, '기존 BF 비고,렉별도출고')
  assert.equal(payload.pdSfRemSrc, '기존 SF 비고,렉별도출고')
  assert.equal(payload.pdMfRemSrc, '기존 MF 비고,렉별도출고')
})

test('buildSashSavePayload generates additional web optionWrite production remarks', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      bfTurnDoorPullType: '1',
      bfTurnDoorOneSideWrapType: '2',
      bfOneSideWrapColrNm: '블랙',
      bfAptCmType: '2',
      bfApt2pjLoc: '3',
      bfApt2pjMethod: '1',
      bfTurnDoorOnlyMakeYn: true,
      bfVentPiecesIncludeYn: true,
      bfVentHoleLctn: '120',
      bfWinCbMilingType: '1',
      bfWinOnefixUpHoleYn: true,
      bfWinFmThreeSideYn: true,
      bfWinTopBottomFmYn: true,
      bfWinSpDdlnShpmYn: true,
      bfIhyFixHghtDirYn: true,
      bfLxHiddenOptYn: true,
      sfLandscape: true,
      sfRackShip: true,
      sfDirectShip: true,
      sfOutGlasYn: true,
      sfOutGlasInfo: '24T 로이',
      sfInsideRightBrdYn: true,
      sfMcOneReqYn: true,
      sfOppositeTypeYn: true,
      sfBrdProcYn: true,
      sfHandleProcYn: true,
      sfRoller: '2',
      sfCreSize: '3',
      sfCreHook: true,
      sfSontaLoca: '8',
      sfAptArmatureType: 'F',
      mtrlCoNm: 'LX',
      dblWindYn: 'Y',
      insdHandleType: '4',
      ousdHandleType: '6',
      isAluMf: true,
      aluMfMdlYn: 'N',
      aluMfHandleType: '2',
      aluMfHndlH: 900,
    }),
    itgEstiNo: 'ITG-REM',
    wEstiNo: 'W-REM',
  })

  assert.match(payload.pdBfRemSrc, /좌경첩\(내부-미는문\)/)
  assert.match(payload.pdBfRemSrc, /미는문/)
  assert.match(payload.pdBfRemSrc, /일면래핑색상:블랙/)
  assert.match(payload.pdBfRemSrc, /케이스먼트:2짝/)
  assert.match(payload.pdBfRemSrc, /우측/)
  assert.match(payload.pdBfRemSrc, /밀때좌경/)
  assert.match(payload.pdBfRemSrc, /문짝만 제작/)
  assert.match(payload.pdBfRemSrc, /경첩\+피스포함/)
  assert.match(payload.pdBfRemSrc, /경첩타공위치:120/)
  assert.match(payload.pdBfRemSrc, /상부만밀링\(FM,GB없음\)/)
  assert.match(payload.pdBfRemSrc, /1FIX 상부유리타공/)
  assert.match(payload.pdBfRemSrc, /FM,GB-X 3면/)
  assert.match(payload.pdBfRemSrc, /상하부만 FM작업/)
  assert.match(payload.pdBfRemSrc, /SP마감출고/)
  assert.match(payload.pdBfRemSrc, /이형픽스 방향설정/)
  assert.match(payload.pdSfRemSrc, /SP 가로작업/)
  assert.match(payload.pdSfRemSrc, /렉별도출고/)
  assert.match(payload.pdSfRemSrc, /직송/)
  assert.match(payload.pdSfRemSrc, /유리사양:24T 로이/)
  assert.match(payload.pdSfRemSrc, /내부우측매립/)
  assert.match(payload.pdSfRemSrc, /MC1개요청/)
  assert.match(payload.pdSfRemSrc, /반대타입/)
  assert.match(payload.pdSfRemSrc, /매립가공/)
  assert.match(payload.pdSfRemSrc, /핸들가공/)
  assert.match(payload.pdSfRemSrc, /조절로라/)
  assert.match(payload.pdSfRemSrc, /크리센트:대/)
  assert.match(payload.pdSfRemSrc, /크리고리/)
  assert.match(payload.pdSfRemSrc, /손타위치:우측/)
  assert.match(payload.pdSfRemSrc, /보강재:4면보강/)
  assert.match(payload.pdSfRemSrc, /내부: 반자동핸들/)
  assert.match(payload.pdSfRemSrc, /외부: 그립핸들/)
  assert.match(payload.pdSfRemSrc, /\(윈드클로저,안전스토퍼,기밀캡\)|\(안전스토퍼,기밀캡\)/)
  assert.match(payload.pdMfRemSrc, /안전망핸들:일반 핸들 하 900/)
})

test('buildSashSavePayload defaults SF vent hole and second-floor wind closer fields to N', () => {
  const payload = buildSashSavePayload({
    form: requiredForm(),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
  })

  assert.equal(payload.sfInsdVentHoleYn, 'N')
  assert.equal(payload.sfOusdVentHoleYn, 'N')
  assert.equal(payload.insd2FWindClsYn, 'N')
  assert.equal(payload.ousd2FWindClsYn, 'N')
})

test('buildSashSavePayload uses web SashForm save field names for shared fields', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      alGlass: true,
      glasAttachYn: true,
      bfArmatureType: 'F',
      bfMillingType: '1',
      bfMillingDetail: '2',
      bfTurnDoorPullType: '1',
      sfOppositeTypeYn: true,
      mfHandle: '2',
      mfHandleHsize: 950,
    }),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
  })

  const webFieldNames = [
    'sashOrdTypCd',
    'bsmfOrdUtmCd',
    'wintydiCd',
    'ventLoc',
    'screenType',
    'glasStdalYn',
    'glasAttachYn',
    'bfArmatureType',
    'bfMillingType',
    'bfMillingWing',
    'bfMillingDetail',
    'bfTurnDoorPullType',
    'sfOppositeTypeYn',
    'mfHandle',
    'mfHandleHsize',
  ]

  for (const fieldName of webFieldNames) {
    assert.ok(Object.prototype.hasOwnProperty.call(payload, fieldName), `${fieldName} missing from payload`)
  }
  assert.ok(!Object.prototype.hasOwnProperty.call(payload, 'sashOrdTyp'))
  assert.ok(!Object.prototype.hasOwnProperty.call(payload, 'bfTurnDoorPull'))
})

test('buildSashSavePayload preserves hidden web sash save fields while editing', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      issueType: 'TAX',
      appdocId: 'APP-20260605',
      unqColrPolSaveYn: true,
    }),
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
    editEstiSeq: '7',
  })

  assert.equal(payload.issueType, 'TAX')
  assert.equal(payload.appdocId, 'APP-20260605')
  assert.equal(payload.unqColrPolSaveYn, 'Y')
})

test('buildSashSavePayload includes medium-priority web parity fields with explicit values', () => {
  const payload = buildSashSavePayload({
    form: requiredForm({
      glasAttachYn: true,
      basedfillingPiecesYn: true,
      sfArmatureType: 'F',
      mfArmatureType: 'F',
      bfVentHoleLctn: '820',
      bfWinCbMilingType: '2',
      sfInsideRightBrdYn: true,
      sfMcOneReqYn: true,
      sfBrdProcYn: true,
      sfHandleProcYn: true,
      sfAptArmatureType: 'F',
      sfAptHandleType: '3',
    }),
    itgEstiNo: 'ITG-MED',
    wEstiNo: 'W-MED',
  })

  assert.equal(payload.glasAttachYn, 'Y')
  assert.equal(payload.basedfillingPiecesYn, 'Y')
  assert.equal(payload.sfArmatureType, 'F')
  assert.equal(payload.mfArmatureType, 'F')
  assert.equal(payload.bfVentHoleLctn, '820')
  assert.equal(payload.bfWinCbMilingType, '2')
  assert.equal(payload.sfInsideRightBrdYn, 'Y')
  assert.equal(payload.sfMcOneReqYn, 'Y')
  assert.equal(payload.sfBrdProcYn, 'Y')
  assert.equal(payload.sfHandleProcYn, 'Y')
  assert.equal(payload.sfAptArmatureType, 'F')
  assert.equal(payload.sfAptHandleType, '3')
})

test('buildSashSavePayload defaults medium-priority fields explicitly when not selected', () => {
  const payload = buildSashSavePayload({
    form: requiredForm(),
    itgEstiNo: 'ITG-MED-DEFAULT',
    wEstiNo: 'W-MED-DEFAULT',
  })

  assert.equal(payload.glasAttachYn, 'N')
  assert.equal(payload.basedfillingPiecesYn, 'N')
  assert.equal(payload.sfArmatureType, '')
  assert.equal(payload.mfArmatureType, '')
  assert.equal(payload.bfVentHoleLctn, '')
  assert.equal(payload.bfWinCbMilingType, '')
  assert.equal(payload.sfInsideRightBrdYn, 'N')
  assert.equal(payload.sfMcOneReqYn, 'N')
  assert.equal(payload.sfBrdProcYn, 'N')
  assert.equal(payload.sfHandleProcYn, 'N')
  assert.equal(payload.sfAptArmatureType, '')
  assert.equal(payload.sfAptHandleType, '')
})

test('buildSashSavePayload normalizes Y/N-like form values before serializing', () => {
  const truthyPayload = buildSashSavePayload({
    form: requiredForm({
      drnHoleYn: 'y',
      ventHoleYn: '1',
      glasAttachYn: 'TRUE',
      bfDirectShip: true,
      bfShipAddr: 'BF address',
    }),
    itgEstiNo: 'ITG-YN',
    wEstiNo: 'W-YN',
  })

  assert.equal(truthyPayload.drnHoleYn, 'Y')
  assert.equal(truthyPayload.ventHoleYn, 'Y')
  assert.equal(truthyPayload.glasAttachYn, 'Y')
  assert.equal(truthyPayload.bfDirectShip, 'Y')
  assert.equal(truthyPayload.bfShipAddr, 'BF address')

  const falseyPayload = buildSashSavePayload({
    form: requiredForm({
      drnHoleYn: 'N',
      ventHoleYn: '0',
      glasAttachYn: 'FALSE',
      bfDirectShip: 'N',
      bfShipAddr: 'SHOULD_HIDE',
    }),
    itgEstiNo: 'ITG-YN-FALSE',
    wEstiNo: 'W-YN-FALSE',
  })

  assert.equal(falseyPayload.drnHoleYn, 'N')
  assert.equal(falseyPayload.ventHoleYn, 'N')
  assert.equal(falseyPayload.glasAttachYn, 'N')
  assert.equal(falseyPayload.bfDirectShip, 'N')
  assert.equal(falseyPayload.bfShipAddr, '')
})
