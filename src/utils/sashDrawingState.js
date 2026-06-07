import { buildSashDrawingUrl, findMatchingDrawing } from './estimateDetail.js'

export function resolveVentDrawingState({
  apiRow = {},
  previousDrawing = null,
  fallbackDrawings = [],
  currentSelection = {},
} = {}) {
  if (buildSashDrawingUrl(apiRow)) {
    return {
      selectedDrawing: apiRow,
      drwgCd: apiRow.drwgCd || '',
    }
  }

  return {
    selectedDrawing: previousDrawing || findMatchingDrawing(currentSelection, fallbackDrawings) || {
      drwgFilePath: '/data/drwg/sash/noImage.gif',
    },
    drwgCd: '',
  }
}
