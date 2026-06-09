<template>
  <div class="client-list-page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">거래처 목록</h2>
        <p class="page-subtitle">샤시 견적 거래처를 조회하고 관리합니다</p>
      </div>
      <div class="title-actions">
        <button type="button" class="btn secondary btn-sm" @click="goNew">거래처 등록</button>
      </div>
    </div>
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />
      <div class="row-flex">
        <div class="field">
          <label>거래처명</label>
          <input v-model="form.searchDplcNm" placeholder="거래처명" @keyup.enter="search" />
        </div>
        <div class="field">
          <label>거래처코드</label>
          <input v-model="form.searchDplcCd" placeholder="거래처코드" @keyup.enter="search" />
        </div>
      </div>
      <div class="row-flex">
        <div class="field">
          <label>사업자번호</label>
          <input v-model="form.searchBzno" inputmode="numeric" placeholder="사업자번호" @keyup.enter="search" />
        </div>
        <div class="field">
          <label>대표자명</label>
          <input v-model="form.searchDplcRepNm" placeholder="대표자명" @keyup.enter="search" />
        </div>
      </div>
      <button class="btn" :disabled="loading || !selectedBzpc.bzpc" @click="search">
        {{ loading ? '조회 중...' : '조회' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <div v-if="!loading && !rows.length" class="empty empty-action">
      <p>조회된 거래처가 없습니다.</p>
      <button type="button" class="btn secondary" @click="goNew">거래처 등록</button>
    </div>
    <div class="client-card-list">
      <button
        v-for="row in rows"
        :key="row.dplcCd"
        type="button"
        class="client-card"
        @click="goEdit(row)"
      >
        <div class="client-card-head">
          <div class="client-card-title">
            <strong>{{ row.dplcNm || row.dplcCdNm || '거래처명 없음' }}</strong>
            <span v-if="row.bzpcNm">{{ row.bzpcNm }}</span>
          </div>
          <span class="badge">{{ row.dplcCd }}</span>
        </div>
        <div class="client-card-meta">
          <span v-if="row.repNm">대표 {{ row.repNm }}</span>
          <span v-if="row.bzno">사업자 {{ row.bzno }}</span>
          <span v-if="row.dplcCrgrNm">담당 {{ row.dplcCrgrNm }}</span>
          <span v-if="row.dplcCrgrMobile || row.dplcCrgrCcpc">
            {{ row.dplcCrgrMobile || row.dplcCrgrCcpc }}
          </span>
        </div>
      </button>
    </div>
      </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BzpcSelector from '../components/BzpcSelector.vue'
import { searchClientList } from '../api/client'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const selectedBzpc = ref({ bzpc: '', bzpcNm: '', vkbur: '', vkgrp: '' })
const form = ref({
  searchDplcNm: String(route.query.searchDplcNm || ''),
  searchDplcCd: '',
  searchBzno: '',
  searchDplcRepNm: '',
})
const loading = ref(false)
const error = ref('')
const rows = ref([])

onMounted(() => {
  if (!auth.isAdmin && auth.bzpc) {
    selectedBzpc.value = {
      bzpc: auth.bzpc,
      bzpcNm: auth.bzpcNm,
      vkbur: auth.vkbur,
      vkburNm: auth.user?.vkburNm || '',
      vkgrp: auth.vkgrp,
      vkgrpNm: auth.user?.vkgrpNm || '',
    }
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
      searchDplcNm: form.value.searchDplcNm || '',
      searchDplcCd: form.value.searchDplcCd || '',
      searchBzno: form.value.searchBzno || '',
      searchDplcRepNm: form.value.searchDplcRepNm || '',
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

function goEdit(row) {
  if (!row?.dplcCd) return
  router.push({
    path: `/clients/${row.dplcCd}/edit`,
    query: { bzpc: row.bzpc || selectedBzpc.value.bzpc || '' },
  })
}

function goNew() {
  router.push('/clients/new')
}
</script>
