<template>
  <teleport to="body">
    <div v-if="visible" class="modal-mask" @click.self="close">
      <div class="modal-sheet" style="max-height:95vh;padding-bottom:0">
        <h3 style="margin-bottom:8px">모형 검색</h3>

        <!-- ─── 자재회사 (버튼형, 항상 노출) ─── -->
        <div style="margin-bottom:6px">
          <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px">자재회사</div>
          <div class="btn-group">
            <button
              class="chip" :class="{ active: filter.searchMtrlCoCd === '' }"
              @click="filter.searchMtrlCoCd = ''; doSearch()"
            >전체</button>
            <button
              v-for="c in corpList" :key="c.v"
              class="chip" :class="{ active: filter.searchMtrlCoCd === c.v }"
              @click="filter.searchMtrlCoCd = c.v; doSearch()"
            >{{ c.t }}</button>
          </div>
        </div>

        <!-- ─── 이중창구분 (버튼형, 항상 노출) ─── -->
        <div style="margin-bottom:6px">
          <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px">이중창구분</div>
          <div class="btn-group">
            <button
              class="chip" :class="{ active: filter.searchDblopnCd === '' }"
              @click="filter.searchDblopnCd = ''; doSearch()"
            >전체</button>
            <button
              v-for="c in dblopnList" :key="c.v"
              class="chip" :class="{ active: filter.searchDblopnCd === c.v }"
              @click="filter.searchDblopnCd = c.v; doSearch()"
            >{{ c.t }}</button>
          </div>
        </div>

        <!-- ─── 카테고리 (버튼형, 항상 노출) ─── -->
        <div style="margin-bottom:6px">
          <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px">카테고리</div>
          <div class="btn-group">
            <button
              class="chip" :class="{ active: filter.searchCtgr2Cd === '' }"
              @click="filter.searchCtgr2Cd = ''; doSearch()"
            >전체</button>
            <button
              v-for="c in categoryList" :key="c.v"
              class="chip" :class="{ active: filter.searchCtgr2Cd === c.v }"
              @click="filter.searchCtgr2Cd = c.v; doSearch()"
            >{{ c.t }}</button>
          </div>
        </div>

        <!-- ─── 모형명/코드 검색 (항상 노출) ─── -->
        <div class="filter-row" style="margin-bottom:6px">
          <input v-model="filter.keyword" placeholder="모형명 / 모형코드 검색" style="flex:1" @keyup.enter="doSearch" />
          <button class="btn" style="width:auto;padding:7px 14px;font-size:12px;flex-shrink:0" :disabled="loading" @click="doSearch">검색</button>
        </div>

        <!-- ─── 상세 필터 (접힘) ─── -->
        <details style="margin-bottom:6px">
          <summary style="cursor:pointer;font-size:11px;color:#0ea5e9;font-weight:600">상세 필터</summary>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
            <!-- 카테고리는 상단 버튼으로 이동됨 -->
            <div class="filter-row">
              <label>창틀형태</label>
              <select v-model="filter.searchBftydiCd" @change="onDetailFilterChange">
                <option value="">전체</option>
                <option v-for="c in bftydiList" :key="c.v" :value="c.v">{{ c.t }}</option>
              </select>
            </div>
            <div class="filter-row">
              <label>BF종류</label>
              <select v-model="filter.searchSizCd" @change="onDetailFilterChange">
                <option value="">전체</option>
                <option v-for="c in sizList" :key="c.v" :value="c.v">{{ c.t }}</option>
              </select>
            </div>
            <div class="filter-row">
              <label>규격여부</label>
              <select v-model="filter.searchStandardYn" @change="onDetailFilterChange">
                <option value="">전체</option>
                <option value="Y">규격</option>
                <option value="N">비규격</option>
              </select>
            </div>
            <div class="filter-row">
              <label>단종여부</label>
              <select v-model="filter.searchDiscontYn" @change="onDetailFilterChange">
                <option value="N">단종 제외</option>
                <option value="">전체</option>
                <option value="Y">단종만</option>
              </select>
            </div>
            <div class="filter-row">
              <label>사용여부</label>
              <select v-model="filter.searchUseYn" @change="onDetailFilterChange">
                <option value="Y">사용</option>
                <option value="">전체</option>
                <option value="N">미사용</option>
              </select>
            </div>
            <button class="btn secondary" style="padding:6px;font-size:11px" @click="resetFilter">필터 초기화</button>
          </div>
        </details>

        <!-- 뷰 모드 + 건수 -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;color:#64748b">{{ totalRows }}건</span>
          <div style="display:flex;gap:4px">
            <button class="view-btn" :class="{ active: viewMode === 'image' }" @click="viewMode = 'image'">도면</button>
            <button class="view-btn" :class="{ active: viewMode === 'text' }" @click="viewMode = 'text'">텍스트</button>
          </div>
        </div>

        <!-- ─── 결과 목록 ─── -->
        <div style="overflow-y:auto;max-height:45vh;min-height:160px">
          <div v-if="loading" style="text-align:center;padding:40px"><div class="loading-spinner"></div></div>
          <div v-else-if="!rows.length" class="empty">결과가 없습니다.</div>

          <!-- 도면 뷰 -->
          <template v-if="viewMode === 'image' && !loading">
            <div v-for="item in rows" :key="item.mdlCd + '_' + item.wintydiCd + '_' + item.ventLoc" class="model-card" @click="pick(item)">
              <div class="model-img-wrap">
                <img :src="getImageSrc(item)" @error="handleImageError($event)" class="model-img" />
                <div v-if="!item._imgOk" class="model-img-ph">도면없음</div>
              </div>
              <div class="model-info">
                <div style="font-weight:600;font-size:13px">{{ item.mdlNm }}</div>
                <div style="font-size:11px;color:#64748b">{{ item.mdlCd }}</div>
                <div class="model-badges">
                  <span v-if="item.ctgr2Nm" class="badge">{{ item.ctgr2Nm }}</span>
                  <span v-if="item.bftydiNm" class="badge">{{ item.bftydiNm }}</span>
                  <span v-if="item.sizNm" class="badge">{{ item.sizNm }}</span>
                  <span v-if="item.mtrlCoNm" class="badge">{{ item.mtrlCoNm }}</span>
                  <span v-if="item.dblWindYnNm" class="badge">{{ item.dblWindYnNm }}</span>
                </div>
                <div style="font-size:10px;color:#94a3b8;margin-top:3px">
                  창형태 {{ item.wintydiNm || item.wintydiCd || '-' }}
                  · 틀짝망 {{ item.bsmfNm || '-' }}
                  · VENT {{ item.ventLocNm || item.ventLoc || '-' }}
                </div>
              </div>
            </div>
          </template>

          <!-- 텍스트 뷰 -->
          <template v-if="viewMode === 'text' && !loading">
            <div v-for="item in rows" :key="'t_' + item.mdlCd + '_' + item.wintydiCd" class="bzpc-row" @click="pick(item)">
              <div class="nm">{{ item.mdlNm }} ({{ item.mdlCd }})</div>
              <div class="cd">
                {{ item.mtrlCoNm || '-' }} · {{ item.ctgr2Nm || '-' }} · {{ item.bftydiNm || '-' }}
                · {{ item.dblWindYnNm || '-' }} · 창형태 {{ item.wintydiNm || '-' }}
              </div>
            </div>
          </template>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" style="display:flex;justify-content:center;gap:6px;padding:8px 0">
          <button class="btn secondary" style="width:auto;padding:6px 12px;font-size:12px" :disabled="page <= 1" @click="goPage(page - 1)">이전</button>
          <span style="font-size:12px;color:#64748b;line-height:32px">{{ page }} / {{ totalPages }}</span>
          <button class="btn secondary" style="width:auto;padding:6px 12px;font-size:12px" :disabled="page >= totalPages" @click="goPage(page + 1)">다음</button>
        </div>

        <button class="btn secondary" style="margin-top:4px;margin-bottom:8px" @click="close">닫기</button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { searchModelList, searchModelCombo } from '../api/estimate'

const emit = defineEmits(['select'])
const visible = ref(false)
const loading = ref(false)
const rows = ref([])
const viewMode = ref('image')

// 필터 옵션 마스터
const corpList = ref([])      // 자재회사 (981, addInfo10='Y' 만 = 샤시전용)
const dblopnList = ref([])    // 이중창구분 (29)
const categoryList = ref([])  // 카테고리 (392)
const bftydiList = ref([])    // 창틀형태 (28)
const sizList = ref([])       // BF종류 (377)

const filter = ref({
  keyword: '',
  searchMtrlCoCd: '',
  searchDblopnCd: '',
  searchCtgr2Cd: '',
  searchBftydiCd: '',
  searchSizCd: '',
  searchStandardYn: '',
  searchDiscontYn: 'N',
  searchUseYn: 'Y',
})

const page = ref(1)
const perPage = ref(30)
const totalRows = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / perPage.value)))

let comboLoaded = false

async function open() {
  visible.value = true
  rows.value = []
  page.value = 1
  if (!comboLoaded) {
    await loadCombo()
    comboLoaded = true
  }
  doSearch()
}
function close() { visible.value = false }

function resetFilter() {
  Object.assign(filter.value, {
    keyword: '', searchMtrlCoCd: '', searchDblopnCd: '', searchCtgr2Cd: '',
    searchBftydiCd: '', searchSizCd: '', searchStandardYn: '',
    searchDiscontYn: 'N', searchUseYn: 'Y',
  })
  page.value = 1
  doSearch()
}

async function loadCombo() {
  try {
    // 웹 /ModelLayer/searchModelComboAjax 와 동일 — 백엔드가 샤시 전용 필터링 완료 후 반환
    const { data } = await searchModelCombo()
    const norm = (list, labelKey = 'label', codeKey = 'code') =>
      (list || []).map((x) => ({ ...x, v: x[codeKey], t: x[labelKey] }))

    // 자재회사: 백엔드가 addInfo10='Y' 필터 + 코드 981 이미 적용
    // 모바일에서 권한별 추가 필터 (addInfo4~9) 는 사용자 auth store 연동 후 활성화
    corpList.value = norm(data.mtrlCoResultList)

    // 이중창구분: 코드 29
    dblopnList.value = norm(data.dblopnResultList)

    // 카테고리: 코드 392 (addInfo2='P' && addInfo3='P' 만)
    categoryList.value = norm(data.ctgr2ResultList).filter((c) => c.addInfo2 === 'P' && c.addInfo3 === 'P')

    // 창틀형태: 코드 28 (addInfo1='P' 만)
    bftydiList.value = norm(data.bftydiResultList).filter((c) => c.addInfo1 === 'P')

    // BF종류: 코드 377
    sizList.value = norm(data.sizResultList)
  } catch (e) {
    console.error('combo load fail', e)
  }
}

function doSearch() {
  page.value = 1
  search()
}

// 상세 필터 select 변경 시 — 검색만 실행, 버튼 필터(자재회사/이중창/카테고리) 유지
function onDetailFilterChange() {
  page.value = 1
  search()
}

async function search() {
  loading.value = true
  try {
    const f = filter.value
    const startRow = (page.value - 1) * perPage.value
    const { data } = await searchModelList({
      searchMdlNm: f.keyword || '',
      searchMtrlCoCd: f.searchMtrlCoCd || '',
      searchDblopnCd: f.searchDblopnCd || '',
      searchCtgr2Cd: f.searchCtgr2Cd || '',
      searchBftydiCd: f.searchBftydiCd || '',
      searchSizCd: f.searchSizCd || '',
      searchStandardYn: f.searchStandardYn || '',
      searchDiscontYn: f.searchDiscontYn || '',
      searchUseYn: f.searchUseYn || 'Y',
      startRowNum: startRow,
      endRowNum: startRow + perPage.value - 1,
    })
    // 이미지 로드 상태 추적용 플래그
    rows.value = (data?.resultList || []).map((r) => ({ ...r, _imgOk: !!(r.srvFileNm && r.fileExtNm) }))
    totalRows.value = data?.totalCount || rows.value.length
  } catch (e) {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function goPage(p) { page.value = p; search() }

function getImageSrc(item) {
  if (item.srvFileNm && item.fileExtNm) return `/data/drwg/sash/${item.srvFileNm}.${item.fileExtNm}`
  return ''
}
function handleImageError(e) {
  e.target.style.display = 'none'
  // 해당 row 의 _imgOk 을 false 로 → placeholder 표시
  const card = e.target.closest('.model-card')
  if (card) {
    const ph = card.querySelector('.model-img-ph')
    if (ph) ph.style.display = 'flex'
  }
}

function pick(item) {
  if (item.convUnpYn === 'N') { alert('가공비가 없는 모형입니다.'); return }
  emit('select', item)
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.filter-row { display: flex; align-items: center; gap: 6px; }
.filter-row label { font-size: 11px; font-weight: 600; color: #64748b; min-width: 60px; flex-shrink: 0; }
.filter-row select, .filter-row input { flex: 1; padding: 7px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; min-width: 0; }
.btn-group { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { padding: 5px 10px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font-size: 11px; cursor: pointer; color: #475569; }
.chip.active { background: #1f2a44; color: #fff; border-color: #1f2a44; }
.view-btn { padding: 4px 10px; border: 0; border-radius: 6px; font-size: 11px; cursor: pointer; background: #e5e7eb; color: #1f2a44; }
.view-btn.active { background: #1f2a44; color: #fff; }
.model-card { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
.model-card:active { background: #f8fafc; }
.model-img-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.model-img { width: 80px; height: 80px; object-fit: contain; border-radius: 6px; background: #f1f5f9; }
.model-img-ph { display: none; position: absolute; inset: 0; background: #f1f5f9; border-radius: 6px; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; }
.model-info { flex: 1; min-width: 0; }
.model-badges { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
</style>
