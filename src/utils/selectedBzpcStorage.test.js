import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SELECTED_BZPC_STORAGE_KEY,
  loadSelectedBzpc,
  normalizeSelectedBzpc,
  saveSelectedBzpc,
} from './selectedBzpcStorage.js'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
  }
}

test('saveSelectedBzpc stores only bzpc and bzpcNm', () => {
  const storage = memoryStorage()

  saveSelectedBzpc({ bzpc: 101, bzpcNm: '서울', extra: 'ignore' }, storage)

  assert.equal(
    storage.getItem(SELECTED_BZPC_STORAGE_KEY),
    JSON.stringify({ bzpc: '101', bzpcNm: '서울' })
  )
})

test('loadSelectedBzpc restores a valid saved branch', () => {
  const storage = memoryStorage({
    [SELECTED_BZPC_STORAGE_KEY]: JSON.stringify({ bzpc: 'B01', bzpcNm: '본점' }),
  })

  assert.deepEqual(loadSelectedBzpc(storage), { bzpc: 'B01', bzpcNm: '본점' })
})

test('loadSelectedBzpc returns null for broken JSON', () => {
  const storage = memoryStorage({
    [SELECTED_BZPC_STORAGE_KEY]: '{broken',
  })

  assert.equal(loadSelectedBzpc(storage), null)
})

test('normalizeSelectedBzpc rejects values without bzpc', () => {
  assert.equal(normalizeSelectedBzpc(null), null)
  assert.equal(normalizeSelectedBzpc({ bzpcNm: '본점' }), null)
  assert.equal(normalizeSelectedBzpc({ bzpc: '' }), null)
})
