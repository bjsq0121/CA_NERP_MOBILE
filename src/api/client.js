import http from './index'

// 거래처 목록 조회 — 모바일 전용 엔드포인트
// 실제 매퍼가 보는 키: searchDplcNm, searchDplcCd, searchBzno, bzpc, curPage, perPage
export function searchClientList(payload) {
  return http.post('/mobile/dplc/list', payload)
}

// 거래처 등록 — 모바일 전용 엔드포인트 (내부적으로 BzpcDplcMngService.saveBzpcDplc 위임)
export function saveClient(payload) {
  return http.post('/mobile/dplc/save', payload)
}
