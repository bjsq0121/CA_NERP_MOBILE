import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyQuickConfigOptionsToForm,
  buildQuickConfigCards,
  summarizeQuickConfigCard,
} from './sashQuickConfig.js'

test('buildQuickConfigCards joins header detail and option rows by cfgId', () => {
  const cards = buildQuickConfigCards({
    headerList: [
      { cfgId: 'Q1', cfgNm: '거실 기본', mtrlCo: 'HW', useYn: 'Y' },
      { cfgId: 'Q2', cfgNm: '안방', mtrlCo: 'LX', useYn: 'Y' },
    ],
    detailList: [
      { cfgId: 'Q1', mdlCd: 'M1', mdlNm: '모델1', wSize: '1000', hSize: '1200', qty: '2' },
      { cfgId: 'Q2', mdlCd: 'M2', mdlNm: '모델2' },
    ],
    optionList: [
      { cfgId: 'Q1', optKey: 'screenType', optValue: '10' },
      { cfgId: 'Q1', optKey: 'aluMfYn', optValue: 'Y' },
      { cfgId: 'Q2', optKey: 'screenType', optValue: '20' },
    ],
  })

  assert.equal(cards.length, 2)
  assert.equal(cards[0].cfgId, 'Q1')
  assert.equal(cards[0].detail.mdlCd, 'M1')
  assert.deepEqual(cards[0].optionMap, { screenType: '10', aluMfYn: 'Y' })
  assert.equal(cards[1].optionMap.screenType, '20')
})

test('summarizeQuickConfigCard returns compact mobile display text', () => {
  const summary = summarizeQuickConfigCard({
    header: { cfgNm: '거실 기본' },
    detail: {
      mdlNm: '수퍼세이브',
      mdlCd: 'M1',
      wintydiNm: '이중창',
      wSize: '1000',
      hSize: '1200',
      qty: '2',
      insdColrNm: '화이트',
      ousdColrNm: '블랙',
      screenTypeNm: '방범망',
    },
    optionMap: {},
  })

  assert.equal(summary.modelText, '수퍼세이브')
  assert.equal(summary.shapeText, '이중창')
  assert.equal(summary.sizeText, '1000 x 1200 / 2개')
  assert.equal(summary.colorText, '화이트 / 블랙')
  assert.equal(summary.screenText, '방범망')
})

test('applyQuickConfigOptionsToForm maps saved BF SF MF options into mobile form fields', () => {
  const form = {
    w: 1111,
    h: 2222,
    qty: 3,
    bfMillingType: '0',
    bfMillingDetail: '',
    bfMillingUp: false,
    bfMillingDown: false,
    bfMillingLeft: false,
    bfMillingRight: false,
    fillingPiecesYn: false,
    bfDirectShip: false,
    bfShipAddr: '',
    sfDirectShip: false,
    sfShipAddr: '',
    mfDirectShip: false,
    mfShipAddr: '',
    sfInsideRightBrdYn: false,
    sfOutType: '',
    sfOutType1: '',
    sfSontaLoca: '',
    sfAptArmatureType: '',
    mfAptArmatureType: '',
    deco1: [],
    winCloser: [],
    mfRackShip: false,
    mfCi4wStickYn: false,
    isAluMf: false,
    aluMfHandleType: '',
    aluMfMdlYn: 'Y',
    aluMfHndlH: null,
    screenType: '',
  }

  applyQuickConfigOptionsToForm(form, {
    wSize: '9999',
    hSize: '8888',
    qty: '9',
    optionMap: {
      fillingPiecesYn: 'Y',
      bfMillingWing: '2',
      bfMillingDetail: '4',
      bfMillingUp: 'Y',
      bfMillingRight: 'Y',
      bfDirectShip: 'Y',
      bfShipAddr: 'BF 주소',
      sfDirectShip: 'Y',
      sfShipAddr: 'SF 주소',
      sfInsideRightBrdYn: 'Y',
      sfOutType: '1',
      sfOutType1: '3',
      locaSonta: '7',
      sfAptAmatureType: 'F',
      insdWindClsYn: 'Y',
      ousd2FWindClsYn: 'Y',
      insdDeckNoneYn: 'Y',
      ousd2FDeckNoneYn: 'Y',
      mfRackShip: 'Y',
      mfCi4wStickYn: 'Y',
      mfDirectShip: 'Y',
      mfShipAddr: 'MF 주소',
      mfAptAmatureType: 'F',
      aluMfYn: 'Y',
      aluMfHandleType: '2',
      aluMfMdlYn: 'N',
      aluMfHndlH: '1200',
      screenType: '10',
    },
  })

  assert.equal(form.w, 1111)
  assert.equal(form.h, 2222)
  assert.equal(form.qty, 3)
  assert.equal(form.fillingPiecesYn, true)
  assert.equal(form.bfMillingType, '2')
  assert.equal(form.bfMillingDetail, '4')
  assert.equal(form.bfMillingUp, true)
  assert.equal(form.bfMillingDown, false)
  assert.equal(form.bfMillingRight, true)
  assert.equal(form.bfDirectShip, true)
  assert.equal(form.bfShipAddr, 'BF 주소')
  assert.equal(form.sfDirectShip, true)
  assert.equal(form.sfShipAddr, 'SF 주소')
  assert.equal(form.sfInsideRightBrdYn, true)
  assert.equal(form.sfOutType, '1')
  assert.equal(form.sfOutType1, '3')
  assert.equal(form.sfSontaLoca, '7')
  assert.equal(form.sfAptArmatureType, 'F')
  assert.deepEqual(form.winCloser, [1, 4])
  assert.deepEqual(form.deco1, [1, 4])
  assert.equal(form.mfRackShip, true)
  assert.equal(form.mfCi4wStickYn, true)
  assert.equal(form.mfDirectShip, true)
  assert.equal(form.mfShipAddr, 'MF 주소')
  assert.equal(form.mfAptArmatureType, 'F')
  assert.equal(form.isAluMf, true)
  assert.equal(form.aluMfHandleType, '2')
  assert.equal(form.aluMfMdlYn, 'N')
  assert.equal(form.aluMfHndlH, '1200')
  assert.equal(form.screenType, '10')
})

test('applyQuickConfigOptionsToForm prefers detail safety net values over stale option rows', () => {
  const form = {
    isAluMf: false,
    aluMfHandleType: '',
    aluMfMdlYn: 'Y',
    aluMfHndlH: null,
  }

  applyQuickConfigOptionsToForm(form, {
    detail: {
      aluMfYn: 'Y',
      aluMfHandleType: '3',
      aluMfMdlYn: 'N',
      aluMfHndlH: '1300',
    },
    optionMap: {
      aluMfYn: 'N',
      aluMfHandleType: '2',
      aluMfMdlYn: 'Y',
      aluMfHndlH: '900',
    },
  })

  assert.equal(form.isAluMf, true)
  assert.equal(form.aluMfHandleType, '3')
  assert.equal(form.aluMfMdlYn, 'N')
  assert.equal(form.aluMfHndlH, '1300')
})

test('applyQuickConfigOptionsToForm normalizes Y/N-like option values consistently', () => {
  const truthyValues = ['Y', 'y', '1', 'TRUE', true]
  for (const value of truthyValues) {
    const form = { fillingPiecesYn: false, isAluMf: false }
    applyQuickConfigOptionsToForm(form, {
      optionMap: {
        fillingPiecesYn: value,
        aluMfYn: value,
      },
    })

    assert.equal(form.fillingPiecesYn, true, `${String(value)} should enable option field`)
    assert.equal(form.isAluMf, true, `${String(value)} should enable safety net`)
  }

  const falseyValues = ['N', 'n', '0', 'FALSE', false]
  for (const value of falseyValues) {
    const form = { fillingPiecesYn: true, isAluMf: true }
    applyQuickConfigOptionsToForm(form, {
      optionMap: {
        fillingPiecesYn: value,
        aluMfYn: value,
      },
    })

    assert.equal(form.fillingPiecesYn, false, `${String(value)} should disable option field`)
    assert.equal(form.isAluMf, false, `${String(value)} should disable safety net`)
  }
})
