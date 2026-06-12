<template>
  <div class="estimate-list-page">
    <div class="page-hero-card estimate-list-hero">
      <div class="page-hero-main">
        <div>
          <h2 class="page-title">통합견적</h2>
          <p class="page-subtitle">거래처별 모바일 견적을 빠르게 조회하고 작성합니다</p>
        </div>
        <div class="page-hero-actions">
          <button type="button" class="btn accent" @click="goNewEstimate">신규 견적</button>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric-card">
          <span>조회 결과</span>
          <strong>{{ summaryMetrics.total }}건</strong>
        </div>
        <div class="metric-card">
          <span>작성중</span>
          <strong>{{ summaryMetrics.draft }}건</strong>
        </div>
        <div class="metric-card">
          <span>진행중</span>
          <strong>{{ summaryMetrics.progress }}건</strong>
        </div>
        <div class="metric-card metric-card-wide">
          <span>총 견적금액</span>
          <strong>{{ totalAmountText }}</strong>
        </div>
      </div>
    </div>

    <div class="card estimate-filter-card">
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
        <input v-model="keyword" placeholder="제목/현장 검색" @keyup.enter="search" />
      </div>
      <button class="btn" :disabled="loading || !selectedBzpc.bzpc" @click="search">
        {{ loading ? '조회 중...' : '조회' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div class="estimate-list-result-head" v-if="rows.length">
      <span>조회 결과</span>
      <strong>{{ rows.length }}건</strong>
    </div>

    <div v-if="!loading && !rows.length" class="empty empty-action">
      <p>조회된 견적이 없습니다.</p>
      <button type="button" class="btn secondary" @click="goNewEstimate">견적을 새로 작성</button>
    </div>
    <div class="estimate-card-list">
      <button
        v-for="row in rows"
        :key="row.itgEstiNo"
        type="button"
        class="estimate-card"
        @click="goDetail(row)"
      >
        <div class="estimate-card-head">
          <div class="estimate-card-title">
            <strong>{{ row.itgEstiNm || '(제목없음)' }}</strong>
            <span>{{ row.dplcNm || '거래처 미지정' }}</span>
          </div>
          <span class="badge">{{ row.stNm || row.igStNm || '상태' }}</span>
        </div>

        <div class="estimate-card-meta">
          <span>견적번호: {{ row.itgEstiNo }}</span>
          <span v-if="row.jobsNm">현장명: {{ row.jobsNm }}</span>
          <span v-if="row.dplcReqRemSrc" class="estimate-card-meta-note">고객비고: {{ row.dplcReqRemSrc }}</span>
          <span v-if="row.bzpcNm">영업소: {{ row.bzpcNm }}</span>
        </div>

        <div v-if="buildGradeChips(row).length" class="estimate-card-grades">
          <span class="estimate-grade-label">할인등급</span>
          <span
            v-for="chip in buildGradeChips(row)"
            :key="chip.label"
            class="estimate-grade-chip"
          >
            {{ chip.label }} {{ chip.value }}
          </span>
        </div>

        <div class="estimate-card-foot">
          <div class="estimate-card-dates">
            <span>등록 {{ formatDt(row.inputDtm) }}</span>
            <span v-if="row.estiVldDt">유효 {{ formatDate(row.estiVldDt) }}</span>
          <span v-if="row.delivryDt">납품예정 {{ formatDate(row.delivryDt) }}</span>
          </div>
          <div class="estimate-card-amount">
            <span>총액</span>
            <strong>{{ formatEstimateAmount(row) }}</strong>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BzpcSelector from '../components/BzpcSelector.vue'
import { searchEstiHeaderList } from '../api/estimate'
import { loadSelectedBzpc, saveSelectedBzpc } from '../utils/selectedBzpcStorage'

const auth = useAuthStore()
const router = useRouter()
function goDetail(row) {
  if (row?.itgEstiNo) router.push(`/estimates/${row.itgEstiNo}`)
}
function goNewEstimate() {
  router.push('/estimates/new')
}
const selectedBzpc = ref({ bzpc: '', bzpcNm: '', vkbur: '', vkgrp: '' })
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
function formatDate(s) {
  if (!s) return ''
  const t = String(s).replace(/[-/.]/g, '')
  if (t.length >= 8) return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}`
  if (String(s).includes('-')) return String(s).slice(0, 10)
  return String(s)
}
function formatDt(s) { return s ? String(s).slice(0, 10) : '' }
function amountNumber(...values) {
  for (const value of values) {
    if (value !== '' && value != null) return Number(String(value).replace(/,/g, '')) || 0
  }
  return 0
}
function formatEstimateAmount(row = {}) {
  const amount = amountNumber(row.totCstAmt, row.vatTotCstAmt, row.totAmt, row.chrgAmt, row.estAmt, row.sumAmt)
  return amount ? `${amount.toLocaleString()}원` : '-'
}

function statusValue(row = {}) {
  return [row.stNm, row.igStNm, row.stCd, row.igStCd].map((value) => String(value ?? '').trim()).filter(Boolean)
}

function isDraftStatus(row = {}) {
  return statusValue(row).some((value) => value === '0' || value === '00' || value.includes('작성') || value.includes('임시'))
}

function isProgressStatus(row = {}) {
  return statusValue(row).some((value) => value === '10' || value === '20' || value.includes('진행') || value.includes('견적'))
}

const summaryMetrics = computed(() => {
  const draft = rows.value.filter(isDraftStatus).length
  const progress = rows.value.filter((row) => !isDraftStatus(row) && isProgressStatus(row)).length
  return {
    total: rows.value.length,
    draft,
    progress,
  }
})

const totalAmountText = computed(() => {
  const total = rows.value.reduce(
    (sum, row) => sum + amountNumber(row.totCstAmt, row.vatTotCstAmt, row.totAmt, row.chrgAmt, row.estAmt, row.sumAmt),
    0
  )
  return total ? `${total.toLocaleString()}원` : '-'
})

function gradeValue(row, nameKey, codeKey) {
  const name = String(row?.[nameKey] ?? '').trim()
  const code = String(row?.[codeKey] ?? '').trim()
  if (name && name !== code) return name
  return code
}

function buildGradeChips(row = {}) {
  return [
    { label: '샤시', value: gradeValue(row, 'dplcDcGrdNm', 'dplcDcGrd') },
    { label: '도어', value: gradeValue(row, 'dplcDcGrdDoorNm', 'dplcDcGrdDoor') },
    { label: '알유리', value: gradeValue(row, 'dplcDcGrdGlasNm', 'dplcDcGrdGlas') },
    { label: '몰딩', value: gradeValue(row, 'dplcDcGrdMoldNm', 'dplcDcGrdMold') },
    { label: '판넬', value: gradeValue(row, 'dplcDcGrdPannelNm', 'dplcDcGrdPannel') },
    { label: '타사', value: gradeValue(row, 'dplcDcGrdOtherCompNm', 'dplcDcGrdOtherComp') },
    { label: '유통자재', value: gradeValue(row, 'dplcDcGrdDtbtMtrlNm', 'dplcDcGrdDtbtMtrl') },
    { label: '유통상품', value: gradeValue(row, 'dplcDcGrdDtbtGoodsNm', 'dplcDcGrdDtbtGoods') },
  ].filter((chip) => chip.value)
}

onMounted(() => {
  if (!auth.isAdmin && auth.bzpc) {
    selectedBzpc.value = {
      bzpc: auth.bzpc,
      bzpcNm: auth.bzpcNm,
      vkbur: auth.vkbur,
      vkburNm: auth.vkburNm,
      vkgrp: auth.vkgrp,
      vkgrpNm: auth.vkgrpNm,
    }
    return
  }

  const saved = loadSelectedBzpc()
  if (saved?.bzpc) {
    selectedBzpc.value = saved
  }
})

watch(selectedBzpc, (v) => {
  if (v?.bzpc) {
    // 신규 견적에서 영업소 고정용
    saveSelectedBzpc(v)
    search()
  }
})

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
