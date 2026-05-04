import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSashSavePayload } from './sashPayload.js'

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
      slcnFnshYn: true,
      insdHandleType: 'H1',
      ousdHandleType: 'H2',
      insdHndlH: 900,
      ousdHndlH: '',
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
  assert.equal(payload.w0Size, '2000')
  assert.equal(payload.h0Size, '1000')
  assert.equal(payload.qty, '2')
  assert.equal(payload.w2Size, '')
  assert.equal(payload.w5Size, '0')
  assert.equal(payload.cs5Size, '5')
  assert.equal(payload.crtnColrCd, 'WH')
  assert.equal(payload.ousdColrCd, 'WH')
  assert.equal(payload.aluMfYn, 'N')
  assert.equal(payload.bfSlcnFnshYn, 'Y')
  assert.equal(payload.mtrlCds4, '')
})

test('buildSashSavePayload preserves edit sequence and outside color', () => {
  const payload = buildSashSavePayload({
    form: {
      mdlCd: '2162-01',
      wintydiCd: '03',
      bftydiCd: '',
      sizCd: '',
      bsmfOrdUtmCd: '',
      sashOrdTypCd: '',
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
      slcnFnshYn: false,
      insdHandleType: '',
      ousdHandleType: '',
      insdHndlH: null,
      ousdHndlH: null,
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
  assert.equal(payload.bfSlcnFnshYn, 'N')
})
