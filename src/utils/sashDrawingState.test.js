import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDrwgFileAjaxResult, resolveVentDrawingState } from './sashDrawingState.js'

test('resolveVentDrawingState updates drwgCd only when the new API drawing has drwgCd', () => {
  const result = resolveVentDrawingState({
    apiRow: { srvFileNm: 'VENT_B', fileExtNm: 'png', drwgCd: 'DRWG_B' },
    previousDrawing: { srvFileNm: 'VENT_A', fileExtNm: 'png', drwgCd: 'DRWG_A' },
  })

  assert.equal(result.selectedDrawing.srvFileNm, 'VENT_B')
  assert.equal(result.drwgCd, 'DRWG_B')
})

test('normalizeDrwgFileAjaxResult accepts object-shaped resultList from searchDrwgFileAjax', () => {
  const result = normalizeDrwgFileAjaxResult({
    resultList: { srvFileNm: 'VENT_OBJECT', fileExtNm: 'png', drwgCd: 'DRWG_OBJECT' },
  })

  assert.equal(result.srvFileNm, 'VENT_OBJECT')
  assert.equal(result.fileExtNm, 'png')
  assert.equal(result.drwgCd, 'DRWG_OBJECT')
})

test('resolveVentDrawingState uses object resultList API row over previous drawing when file exists', () => {
  const apiRow = normalizeDrwgFileAjaxResult({
    resultList: { srvFileNm: 'VENT_NEW', fileExtNm: 'png', drwgCd: 'DRWG_NEW' },
  })
  const result = resolveVentDrawingState({
    apiRow,
    previousDrawing: { srvFileNm: 'VENT_OLD', fileExtNm: 'png', drwgCd: 'DRWG_OLD' },
  })

  assert.equal(result.selectedDrawing.srvFileNm, 'VENT_NEW')
  assert.equal(result.drwgCd, 'DRWG_NEW')
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
