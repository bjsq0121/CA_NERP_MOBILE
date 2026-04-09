import http from './index'

// estimate.vue 의 EstiDplcCardSection 과 동일한 엔드포인트
// 권한별 영업소 목록을 조회한다. 일반 USER는 자신의 vkgrp 만 보임.
export function searchBzpcChoice(params) {
  return http.post('/BzpcMng/searchBzpcChoiceAjax', {
    addInfoVkbur: 1,
    addInfoBzpc: '',
    gridAllItem: 'N',
    inTest: 'N',
    graderYn: 'N',
    homeWinYn: 'N',
    gridHccItemYn: 'N',
    gridHomeWinItemYn: 'N',
    ...params,
  })
}
