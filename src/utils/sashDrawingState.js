import { buildSashDrawingUrl, findMatchingDrawing } from './estimateDetail.js'

export function normalizeDrwgFileAjaxResult(data = {}) {
  if (data?.resultData) return data.resultData
  if (Array.isArray(data?.resultList)) return data.resultList[0] || {}
  if (data?.resultList && typeof data.resultList === 'object') return data.resultList
  if (data?.srvFileNm || data?.fileExtNm || data?.drwgCd) return data
  return {}
}

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
