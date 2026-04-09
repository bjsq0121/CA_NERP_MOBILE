import http from './index'

export function saveEstiHeader(payload) {
  return http.post('/mobile/esti/header/save', payload)
}

export function searchEstiHeaderList(payload) {
  return http.post('/mobile/esti/header/list', payload)
}

export function selectEstiHeader(itgEstiNo) {
  return http.post('/mobile/esti/header/detail', { itgEstiNo })
}

// 견적 헤더 저장 후 샤시/도어/유리 등 타입별 estiNo 발번
// itgTypeChk: "wind" | "door" | "glas" | "mold" | "buil" | "goods"
export function issueEstiNo(itgEstiNo, itgTypeChk = 'wind') {
  return http.post('/mobile/esti/header/issueEstiNo', { itgEstiNo, itgTypeChk })
}

// 모형/색상/공통코드 마스터
export function searchModelList(payload) {
  return http.post('/mobile/esti/model/list', payload)
}
// 모형 검색 콤보 데이터 (웹 searchModelComboAjax 동일, 샤시 전용 필터링)
export function searchModelCombo() {
  return http.post('/mobile/esti/model/combo', {})
}
export function searchColorList(payload = {}) {
  return http.post('/mobile/esti/color/list', payload)
}
export function searchCodeList(commCdGrpId) {
  return http.post('/mobile/esti/code/list', { commCdGrpId })
}
export function searchModelSf(searchMdlCd) {
  return http.post('/mobile/esti/model/sf', { searchMdlCd })
}
export function searchGlasList(payload) {
  // payload: { searchMdlCd, searchItgEstiNo?, searchEstiNo?, searchEstiNos?, searchEstiSeq? }
  return http.post('/mobile/esti/glas/list', typeof payload === 'string' ? { searchMdlCd: payload } : payload)
}
export function searchModelWintydi(mdlCd) {
  return http.post('/mobile/esti/model/wintydi', { mdlCd })
}
// 발주구분 — 공통코드 그룹 143 (addInfo2='Y' 가 샤시용)
// 매퍼 selectCdList 가 addInfo1~100 모두 반환하므로 클라이언트에서 필터링
export function searchSashOrdTypCd() {
  return http.post('/mobile/esti/code/list', { commCdGrpId: '143' })
}

// 샤시 견적
export function saveSashEsti(payload) {
  return http.post('/mobile/esti/sash/save', payload)
}
export function searchSashList(itgEstiNo) {
  return http.post('/mobile/esti/sash/list', { itgEstiNo })
}
export function selectSashDetail(payload) {
  return http.post('/mobile/esti/sash/detail', payload)
}
