import test from 'node:test'
import assert from 'node:assert/strict'
import { compareSashParity, runSashParityCli } from './compare-sash-save-parity.mjs'

const usage = 'Usage: node scripts/compare-sash-save-parity.mjs web.json mobile.json\n'

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

test('compareSashParity compares known raw API size aliases', () => {
  const result = compareSashParity({
    web: {
      detail: { WSize: '2000', HSize: '1000', W1Size: '800', CS1Size: '50' },
      amount: {},
    },
    mobile: {
      detail: { WSize: '2100', HSize: '1000', W1Size: '900', CS1Size: '55' },
      amount: {},
    },
  })

  assert.deepEqual(result.mismatches, [
    { group: 'detail', field: 'wSize', web: '2000', mobile: '2100' },
    { group: 'detail', field: 'w1Size', web: '800', mobile: '900' },
    { group: 'detail', field: 'cs1Size', web: '50', mobile: '55' },
  ])
})

test('compareSashParity treats matching known aliases as equal when canonical and raw keys coexist', () => {
  const result = compareSashParity({
    web: { detail: { wSize: 'old', WSize: '2000' }, amount: {} },
    mobile: { detail: { WSize: '2000' }, amount: {} },
  })

  assert.deepEqual(result.mismatches, [])
})

test('runSashParityCli exits 2 with usage when invoked without JSON paths', () => {
  let stderr = ''
  const exitCode = runSashParityCli(['node', 'scripts/compare-sash-save-parity.mjs'], {
    stderr: { write: (text) => { stderr += text } },
  })

  assert.equal(exitCode, 2)
  assert.equal(stderr, usage)
})

test('runSashParityCli exits 2 with usage when invoked with one JSON path', () => {
  let stderr = ''
  const exitCode = runSashParityCli(['node', 'scripts/compare-sash-save-parity.mjs', 'web.json'], {
    stderr: { write: (text) => { stderr += text } },
  })

  assert.equal(exitCode, 2)
  assert.equal(stderr, usage)
})

test('import does not run CLI when argv entrypoint only shares the script basename', async () => {
  const originalArgv = process.argv
  const originalExit = process.exit
  let exitCode

  process.argv = ['node', '/tmp/compare-sash-save-parity.mjs']
  process.exit = (code) => {
    exitCode = code
    throw new Error(`unexpected process.exit(${code})`)
  }

  try {
    await import(`./compare-sash-save-parity.mjs?import-guard=${Date.now()}`)
  } finally {
    process.argv = originalArgv
    process.exit = originalExit
  }

  assert.equal(exitCode, undefined)
})
