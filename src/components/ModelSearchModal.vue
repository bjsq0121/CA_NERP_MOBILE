<template>
  <teleport to="body">
    <div v-if="visible" class="modal-mask" @click.self="close">
      <div class="modal-sheet modal-sheet-tall">
        <h3>모형 검색</h3>

        <!-- 자재회사 -->
        <div class="filter-section">
          <div class="filter-label">자재회사</div>
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

        <!-- 이중창구분 -->
        <div class="filter-section">
          <div class="filter-label">이중창구분</div>
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

        <!-- 카테고리 -->
        <div class="filter-section">
          <div class="filter-label">카테고리</div>
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

        <!-- 모형명/코드 검색 -->
        <div class="search-row">
          <input v-model="filter.keyword" placeholder="모형명 / 모형코드 검색" @keyup.enter="doSearch" />
          <button class="btn" :disabled="loading" @click="doSearch">검색</button>
        </div>

        <!-- 상세 필터 -->
        <details class="filter-section">
          <summary>상세 필터</summary>
          <div class="detail-filter-body">
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
            <button class="btn secondary btn-xs" @click="resetFilter">필터 초기화</button>
          </div>
        </details>

        <!-- 뷰 모드 + 건수 -->
        <div class="results-bar">
          <span class="results-count">{{ totalRows }}건</span>
          <div class="view-toggle">
            <button class="view-btn" :class="{ active: viewMode === 'image' }" @click="viewMode = 'image'">도면</button>
            <button class="view-btn" :class="{ active: viewMode === 'text' }" @click="viewMode = 'text'">텍스트</button>
          </div>
        </div>

        <!-- 결과 목록 -->
        <div class="results-scroll">
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
                <div class="model-name">{{ item.mdlNm }}</div>
                <div class="model-code">{{ item.mdlCd }}</div>
                <div class="model-badges">
                  <span v-if="item.ctgr2Nm" class="badge">{{ item.ctgr2Nm }}</span>
                  <span v-if="item.bftydiNm" class="badge">{{ item.bftydiNm }}</span>
                  <span v-if="item.sizNm" class="badge">{{ item.sizNm }}</span>
                  <span v-if="item.mtrlCoNm" class="badge">{{ item.mtrlCoNm }}</span>
                  <span v-if="item.dblWindYnNm" class="badge">{{ item.dblWindYnNm }}</span>
                </div>
                <div class="model-detail-text">
                  창형태 {{ item.wintydiNm || item.wintydiCd || '-' }}
                  / 틀짝망 {{ item.bsmfNm || '-' }}
                  / VENT {{ item.ventLocNm || item.ventLoc || '-' }}
                </div>
              </div>
            </div>
          </template>

          <!-- 텍스트 뷰 -->
          <template v-if="viewMode === 'text' && !loading">
            <div v-for="item in rows" :key="'t_' + item.mdlCd + '_' + item.wintydiCd" class="bzpc-row" @click="pick(item)">
              <div class="nm">{{ item.mdlNm }} ({{ item.mdlCd }})</div>
              <div class="cd">
                {{ item.mtrlCoNm || '-' }} / {{ item.ctgr2Nm || '-' }} / {{ item.bftydiNm || '-' }}
                / {{ item.dblWindYnNm || '-' }} / 창형태 {{ item.wintydiNm || '-' }}
              </div>
            </div>
          </template>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn secondary btn-sm" :disabled="page <= 1" @click="goPage(page - 1)">이전</button>
          <span class="page-info">{{ page }} / {{ totalPages }}</span>
          <button class="btn secondary btn-sm" :disabled="page >= totalPages" @click="goPage(page + 1)">다음</button>
        </div>

        <button class="btn secondary modal-footer" @click="close">닫기</button>
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

const corpList = ref([])
const dblopnList = ref([])
const categoryList = ref([])
const bftydiList = ref([])
const sizList = ref([])

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
    const { data } = await searchModelCombo()
    const norm = (list, labelKey = 'label', codeKey = 'code') =>
      (list || []).map((x) => ({ ...x, v: x[codeKey], t: x[labelKey] }))

    corpList.value = norm(data.mtrlCoResultList)
    dblopnList.value = norm(data.dblopnResultList)
    categoryList.value = norm(data.ctgr2ResultList).filter((c) => c.addInfo2 === 'P' && c.addInfo3 === 'P')
    bftydiList.value = norm(data.bftydiResultList).filter((c) => c.addInfo1 === 'P')
    sizList.value = norm(data.sizResultList)
  } catch (e) {
    // combo load fail
  }
}

function doSearch() {
  page.value = 1
  search()
}

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
