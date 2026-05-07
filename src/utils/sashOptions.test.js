import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveBsmfOrdUtmCd } from './sashOptions.js'

const bsmfList = [
  { commCdId: '101', commCdNm: 'SET' },
  { commCdId: '102', commCdNm: '틀짝' },
  { commCdId: '106', commCdNm: '짝망' },
]

test('resolveBsmfOrdUtmCd keeps a valid direct code from the model row', () => {
  assert.equal(resolveBsmfOrdUtmCd({ bsmfOrdUtmCd: '102', bsmfNm: 'SET' }, bsmfList), '102')
})

test('resolveBsmfOrdUtmCd maps model bsmf name to common code 405', () => {
  assert.equal(resolveBsmfOrdUtmCd({ bsmfNm: '짝망' }, bsmfList), '106')
})

test('resolveBsmfOrdUtmCd leaves unresolved model bsmf empty instead of guessing first option', () => {
  assert.equal(resolveBsmfOrdUtmCd({ bsmfNm: '내창X' }, bsmfList), '')
  assert.equal(resolveBsmfOrdUtmCd({}, bsmfList), '')
})
