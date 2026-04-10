<template>
  <div>
    <h2 class="page-title">거래처 목록</h2>
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />
      <div class="field">
        <label>거래처명 검색</label>
        <input v-model="keyword" placeholder="거래처명 또는 코드" @keyup.enter="search" />
      </div>
      <button class="btn" :disabled="loading || !selectedBzpc.bzpc" @click="search">
        {{ loading ? '조회 중...' : '조회' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div v-if="!loading && !rows.length" class="empty">조회된 거래처가 없습니다.</div>
    <div v-for="row in rows" :key="row.dplcCd" class="list-row">
      <div class="title">{{ row.dplcNm || row.dplcCdNm }}</div>
      <div class="meta">
        <span class="badge">{{ row.dplcCd }}</span>
        <span v-if="row.bzpcNm">{{ row.bzpcNm }}</span>
        <span v-if="row.repNm">대표 {{ row.repNm }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import BzpcSelector from '../components/BzpcSelector.vue'
import { searchClientList } from '../api/client'

const auth = useAuthStore()
const selectedBzpc = ref({ bzpc: '', bzpcNm: '' })
const keyword = ref('')
const loading = ref(false)
const error = ref('')
const rows = ref([])

onMounted(() => {
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
      searchDplcScn: '02',
      searchBztcSt: '01',
      searchDplcNm: keyword.value || '',
      curPage: 1,
      perPage: 50,
    }
    const { data } = await searchClientList(payload)
    rows.value = data?.resultList || []
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '조회 실패'
  } finally {
    loading.value = false
  }
}
</script>
