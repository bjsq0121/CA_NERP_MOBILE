<template>
  <div>
    <h2 style="margin:4px 4px 12px;font-size:17px">견적 목록</h2>
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />
      <div class="row-flex">
        <div class="field">
          <label>시작일</label>
          <input v-model="startDate" type="date" />
        </div>
        <div class="field">
          <label>종료일</label>
          <input v-model="endDate" type="date" />
        </div>
      </div>
      <div class="field">
        <label>견적제목 검색</label>
        <input v-model="keyword" placeholder="제목/현장 검색" />
      </div>
      <button class="btn" :disabled="loading || !selectedBzpc.bzpc" @click="search">
        {{ loading ? '조회 중...' : '조회' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div v-if="!loading && !rows.length" class="empty">조회된 견적이 없습니다.</div>
    <div
      v-for="row in rows"
      :key="row.itgEstiNo"
      class="list-row"
      style="cursor:pointer"
      @click="goDetail(row)"
    >
      <div class="title">{{ row.itgEstiNm || '(제목없음)' }}</div>
      <div class="meta">
        <span class="badge">{{ row.itgEstiNo }}</span>
        <span>{{ row.dplcNm }}</span>
        <span v-if="row.jobsNm">· {{ row.jobsNm }}</span>
      </div>
      <div class="meta">
        <span>등록 {{ formatDt(row.inputDtm) }}</span>
        <span v-if="row.estiVldDt">· 유효 {{ formatDate(row.estiVldDt) }}</span>
        <span v-if="row.bzpcNm">· {{ row.bzpcNm }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BzpcSelector from '../components/BzpcSelector.vue'
import { searchEstiHeaderList } from '../api/estimate'

const auth = useAuthStore()
const router = useRouter()
function goDetail(row) {
  if (row?.itgEstiNo) router.push(`/estimates/${row.itgEstiNo}`)
}
const selectedBzpc = ref({ bzpc: '', bzpcNm: '' })
const startDate = ref(daysAgo(1))
const endDate = ref(today())
const keyword = ref('')
const loading = ref(false)
const error = ref('')
const rows = ref([])

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
function formatDate(s) { if (!s) return ''; const t = String(s).replace(/-/g, ''); return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}` }
function formatDt(s) { return s ? String(s).slice(0, 10) : '' }

onMounted(() => {
  // 일반 USER는 본인 bzpc 자동 세팅 → 즉시 조회
  if (!auth.isAdmin && auth.bzpc) {
    selectedBzpc.value = { bzpc: auth.bzpc, bzpcNm: auth.bzpcNm }
    search()
  }
})

watch(selectedBzpc, (v) => { if (v?.bzpc) search() })

async function search() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      searchBzpc: selectedBzpc.value.bzpc,
      searchVkbur: auth.vkbur || '',
      searchDtType: '5',
      searchEstiStrtDt: startDate.value.replace(/-/g, ''),
      searchEstiEndDt: endDate.value.replace(/-/g, ''),
      searchItgEstiNm: keyword.value || '',
      searchStCdA: 'Y',
      curPage: 1,
      perPage: 30,
    }
    const { data } = await searchEstiHeaderList(payload)
    rows.value = data?.resultList || []
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '조회 실패'
  } finally {
    loading.value = false
  }
}
</script>
