<template>
  <teleport to="body">
    <div v-if="visible" class="modal-mask" @click.self="close">
      <div class="modal-sheet modal-sheet-tall">
        <h3>거래처 검색</h3>
        <div class="modal-subtitle">영업소: {{ bzpcNm || bzpc || '(미선택)' }}</div>

        <div class="field">
          <label>거래처명</label>
          <input v-model="form.searchDplcNm" placeholder="거래처명" @keyup.enter="search" />
        </div>
        <div class="field">
          <label>사업자번호</label>
          <input v-model="form.searchBzno" placeholder="사업자번호 (숫자만)" @keyup.enter="search" />
        </div>
        <div class="row-flex">
          <button class="btn secondary" @click="reset">초기화</button>
          <button class="btn" :disabled="loading || !bzpc" @click="search">
            {{ loading ? '조회 중...' : '조회' }}
          </button>
        </div>
        <div v-if="error" class="error">{{ error }}</div>

        <div class="mt-md">
          <div v-if="loading" class="empty">불러오는 중...</div>
          <div v-else-if="!rows.length" class="empty">결과가 없습니다.</div>
          <div v-for="row in rows" :key="row.dplcCd" class="bzpc-row" @click="pick(row)">
            <div class="nm">{{ row.dplcNm || row.dplcCdNm }}</div>
            <div class="cd">
              {{ row.dplcCd }}
              <span v-if="row.bzno"> / 사업자 {{ row.bzno }}</span>
              <span v-if="row.repNm"> / 대표 {{ row.repNm }}</span>
            </div>
            <div v-if="row.monCreditLimit != null" class="cd">
              신용한도: {{ Number(row.monCreditLimit).toLocaleString() }}원
            </div>
          </div>
        </div>

        <button class="btn secondary mt-md" @click="close">닫기</button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'
import { searchClientList } from '../api/client'

const props = defineProps({
  bzpc: { type: String, default: '' },
  bzpcNm: { type: String, default: '' },
})
const emit = defineEmits(['select'])

const visible = ref(false)
const loading = ref(false)
const error = ref('')
const rows = ref([])
const form = ref({ searchDplcNm: '', searchBzno: '' })

function open() {
  visible.value = true
  rows.value = []
  search()
}
function close() { visible.value = false }
function reset() {
  form.value = { searchDplcNm: '', searchBzno: '' }
  rows.value = []
}

async function search() {
  if (!props.bzpc) {
    error.value = '먼저 영업소를 선택하세요'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const payload = {
      searchBzpc: props.bzpc,
      searchDplcScn: '02',
      searchBztcSt: '01',
      ...form.value,
      curPage: 1,
      perPage: 50,
    }
    const { data } = await searchClientList(payload)
    rows.value = data?.resultList || []
    if (!rows.value.length) error.value = '조회된 거래처가 없습니다.'
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '조회 실패'
  } finally {
    loading.value = false
  }
}

function pick(row) {
  emit('select', row)
  close()
}

defineExpose({ open, close })
</script>
