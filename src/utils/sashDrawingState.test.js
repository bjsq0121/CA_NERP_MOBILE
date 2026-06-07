import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveVentDrawingState } from './sashDrawingState.js'

test('resolveVentDrawingState updates drwgCd only when the new API drawing has drwgCd', () => {
  const result = resolveVentDrawingState({
    apiRow: { srvFileNm: 'VENT_B', fileExtNm: 'png', drwgCd: 'DRWG_B' },
    previousDrawing: { srvFileNm: 'VENT_A', fileExtNm: 'png', drwgCd: 'DRWG_A' },
  })

  assert.equal(result.selectedDrawing.srvFileNm, 'VENT_B')
  assert.equal(result.drwgCd, 'DRWG_B')
})

test('resolveVentDrawingState clears stale drwgCd while keeping previous drawing as display fallback', () => {
  const previousDrawing = { srvFileNm: 'VENT_A', fileExtNm: 'png', drwgCd: 'DRWG_A' }
  const result = resolveVentDrawingState({
    apiRow: {},
    previousDrawing,
    currentSelection: { mdlCd: 'M1', wintydiCd: 'W1', ventLoc: 'R' },
  })

  assert.equal(result.selectedDrawing, previousDrawing)
  assert.equal(result.drwgCd, '')
})

test('resolveVentDrawingState falls back to noImage and empty drwgCd when no drawing is available', () => {
  const result = resolveVentDrawingState({
    apiRow: {},
    currentSelection: { mdlCd: 'M1', wintydiCd: 'W1', ventLoc: 'R' },
  })

  assert.equal(result.selectedDrawing.drwgFilePath, '/data/drwg/sash/noImage.gif')
  assert.equal(result.drwgCd, '')
})
