import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSafetyNetHandleOptions, normalizeSafetyNetHandleValue, resolveBsmfOrdUtmCd } from './sashOptions.js'

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

test('normalizeSafetyNetHandleOptions keeps only general and none options from common code 387', () => {
  const result = normalizeSafetyNetHandleOptions([
    { commCdId: '1', commCdNm: '없음-구코드' },
    { commCdVal: '2', commCdNm: '일반' },
    { commCdVal: '3', commCdNm: '특수' },
    { commCdVal: '4', commCdNm: '없음' },
    { commCdVal: '5', commCdNm: '기타' },
  ])

  assert.deepEqual(result.map((item) => item.commCdId), ['2', '4'])
  assert.deepEqual(result.map((item) => item.commCdNm), ['일반', '없음'])
})

test('normalizeSafetyNetHandleOptions deduplicates legacy none value 1 as selection value 4', () => {
  const result = normalizeSafetyNetHandleOptions([
    { commCdId: '1', commCdNm: '없음' },
    { commCdVal: '4', commCdNm: '없음' },
  ])

  assert.deepEqual(result, [{ commCdId: '4', commCdVal: '4', commCdNm: '없음' }])
  assert.equal(normalizeSafetyNetHandleValue('1'), '4')
  assert.equal(normalizeSafetyNetHandleValue('4'), '4')
  assert.equal(normalizeSafetyNetHandleValue('2'), '2')
})
