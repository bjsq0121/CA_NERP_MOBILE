import test from 'node:test'
import assert from 'node:assert/strict'
import {
  UNKNOWN_STATUS,
  isEditableHeaderStatus,
  isEditableStatus,
  isReadonlyStatus,
  normalizeOptionalStatusCd,
  normalizeStatusCd,
  resolveEffectiveStatus,
} from './estimateStatus.js'

test('estimate status policy only allows status 10 to edit', () => {
  assert.equal(isEditableStatus('10'), true)
  assert.equal(isEditableStatus('0'), false)
  assert.equal(isEditableStatus('20'), false)
  assert.equal(isEditableStatus('50'), false)
  assert.equal(isEditableStatus('BAD'), false)
  assert.equal(isEditableStatus(''), false)
  assert.equal(isEditableStatus(null), false)
})

test('estimate header status allows 0, 10, and 20 for adding new items', () => {
  assert.equal(isEditableHeaderStatus('0'), true)
  assert.equal(isEditableHeaderStatus('10'), true)
  assert.equal(isEditableHeaderStatus('20'), true)
  assert.equal(isEditableHeaderStatus(UNKNOWN_STATUS), false)
  assert.equal(isEditableHeaderStatus(''), false)
  assert.equal(isEditableHeaderStatus(null), false)
})

test('estimate status policy fails closed when status is missing', () => {
  assert.equal(normalizeStatusCd(''), UNKNOWN_STATUS)
  assert.equal(normalizeStatusCd(null), UNKNOWN_STATUS)
  assert.equal(normalizeOptionalStatusCd(null), '')
  assert.equal(resolveEffectiveStatus('', null, undefined), UNKNOWN_STATUS)
  assert.equal(resolveEffectiveStatus('', '20', '10'), '20')
})

test('estimate readonly status is only numeric status 50 or higher', () => {
  assert.equal(isReadonlyStatus('50'), true)
  assert.equal(isReadonlyStatus('60'), true)
  assert.equal(isReadonlyStatus('20'), false)
  assert.equal(isReadonlyStatus('10'), false)
  assert.equal(isReadonlyStatus('BAD'), false)
  assert.equal(isReadonlyStatus(''), false)
})
