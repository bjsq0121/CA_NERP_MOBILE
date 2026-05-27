import test from 'node:test'
import assert from 'node:assert/strict'
import { compareSashParity } from './compare-sash-save-parity.mjs'

test('compareSashParity reports matching detail and amount as clean', () => {
  const result = compareSashParity({
    web: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000', hSize: '1000', mtrlCds1: 'G1' },
      amount: { estiTotSaleUnp: '1000', estiTotSaleVat: '100', estiTotSaleVatUnp: '1100' },
    },
    mobile: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000', hSize: '1000', mtrlCds1: 'G1' },
      amount: { estiTotSaleUnp: '1000', estiTotSaleVat: '100', estiTotSaleVatUnp: '1100' },
    },
  })

  assert.deepEqual(result.mismatches, [])
})

test('compareSashParity groups detail and amount mismatches', () => {
  const result = compareSashParity({
    web: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000' },
      amount: { estiTotSaleUnp: '1000' },
    },
    mobile: {
      detail: { mdlCd: '0161-01', wintydiCd: '02', bsmfOrdUtmCd: '102', wSize: '2100' },
      amount: { estiTotSaleUnp: '900' },
    },
  })

  assert.deepEqual(result.mismatches, [
    { group: 'detail', field: 'wintydiCd', web: '01', mobile: '02' },
    { group: 'detail', field: 'bsmfOrdUtmCd', web: '101', mobile: '102' },
    { group: 'detail', field: 'wSize', web: '2000', mobile: '2100' },
    { group: 'amount', field: 'estiTotSaleUnp', web: '1000', mobile: '900' },
  ])
})
