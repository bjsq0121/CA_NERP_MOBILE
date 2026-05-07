import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSashDrawingUrl,
  buildSashMeta,
  buildSashScreenText,
  mergeSashDrawingFiles,
  normalizeSashRows,
  resolveWindEstiNo,
} from './estimateDetail.js'

test('resolveWindEstiNo reads wind estimate number from supported header response shapes', () => {
  assert.equal(resolveWindEstiNo({ wEstiNo: 'EE1', resultData: { wEstiNo: 'EE2' } }), 'EE1')
  assert.equal(resolveWindEstiNo({ resultData: { wEstiNo: 'EE2' } }), 'EE2')
  assert.equal(resolveWindEstiNo({ resultData: { WEstiNo: 'EE3' } }), 'EE3')
})

test('normalizeSashRows deduplicates rows by estimate identity', () => {
  const rows = normalizeSashRows({
    resultList: [
      { estiNo: 'EE1', estiNos: '1', estiSeq: '1', mdlCd: 'A' },
      { estiNo: 'EE1', estiNos: '1', estiSeq: '1', mdlCd: 'A-duplicate' },
      { estiNo: 'EE1', estiNos: '1', estiSeq: '2', mdlCd: 'B' },
    ],
  })

  assert.equal(rows.length, 2)
  assert.equal(rows[0].mdlCd, 'A')
  assert.equal(rows[1].mdlCd, 'B')
})

test('buildSashDrawingUrl uses drawing file fields when available', () => {
  assert.equal(
    buildSashDrawingUrl({ srvFileNm: 'DRWG001', fileExtNm: 'png' }),
    '/data/drwg/sash/DRWG001.png'
  )
  assert.equal(buildSashDrawingUrl({ drwgFilePath: '/data/drwg/sash/A.svg' }), '/data/drwg/sash/A.svg')
  assert.equal(buildSashDrawingUrl({ drwgCd: 'DW-01' }), '')
})

test('buildSashMeta separates quantity and bsmf display values', () => {
  const meta = buildSashMeta({ qty: 3, bsmfOrdUtmNm: '틀짝망', bsmfOrdUtmCd: '104' })
  assert.equal(meta.qtyText, '3')
  assert.equal(meta.bsmfText, '틀짝망')
})

test('buildSashScreenText resolves screen code names from common code list', () => {
  const screenList = [
    { commCdId: '9', commCdNm: '일반망', addInfo1: '일반' },
    { commCdVal: '10', commCdNm: '방범망', addInfo1: '방범' },
  ]

  assert.equal(buildSashScreenText({ screenTypeNm: '저장명' }, screenList), '저장명')
  assert.equal(buildSashScreenText({ screenType: '10' }, screenList), '방범망')
  assert.equal(buildSashScreenText({ screenType: '9' }, screenList), '일반망')
  assert.equal(buildSashScreenText({ mdlNm: '프레임/일반망/단창' }, screenList), '일반망')
  assert.equal(buildSashScreenText({}, screenList), '-')
})

test('mergeSashDrawingFiles fills missing image fields from model drawings', () => {
  const rows = [
    { mdlCd: 'M1', wintydiCd: 'W1', ventLoc: 'L', estiSeq: '1' },
    { mdlCd: 'M1', wintydiCd: 'W2', ventLoc: 'R', estiSeq: '2' },
    { mdlCd: 'M2', wintydiCd: 'W1', ventLoc: 'L', srvFileNm: 'KEEP', fileExtNm: 'jpg' },
  ]

  const merged = mergeSashDrawingFiles(rows, {
    M1: [
      { mdlCd: 'M1', wintydiCd: 'W1', ventLoc: 'R', srvFileNm: 'WRONG_VENT', fileExtNm: 'png' },
      { mdlCd: 'M1', wintydiCd: 'W1', ventLoc: 'L', srvFileNm: 'MATCH', fileExtNm: 'png' },
      { mdlCd: 'M1', wintydiCd: 'W2', ventLoc: 'L', srvFileNm: 'SAME_WINTYDI', fileExtNm: 'png' },
    ],
  })

  assert.equal(buildSashDrawingUrl(merged[0]), '/data/drwg/sash/MATCH.png')
  assert.equal(buildSashDrawingUrl(merged[1]), '/data/drwg/sash/SAME_WINTYDI.png')
  assert.equal(buildSashDrawingUrl(merged[2]), '/data/drwg/sash/KEEP.jpg')
})
