<template>
  <div>
    <h2 style="margin:4px 4px 12px;font-size:17px">거래처 등록</h2>
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />
      <div class="field">
        <label>거래처명 *</label>
        <input v-model="form.dplcNm" />
      </div>
      <div class="field">
        <label>거래처구분</label>
        <select v-model="form.dplcScn">
          <option value="02">매출처</option>
          <option value="01">매입처</option>
        </select>
      </div>
      <div class="field">
        <label>사용여부</label>
        <select v-model="form.useYn">
          <option value="Y">사용</option>
          <option value="N">미사용</option>
        </select>
      </div>
      <button class="btn" :disabled="loading || !canSubmit" @click="submit">
        {{ loading ? '저장 중...' : '저장' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="ok" class="error" style="color:#16a34a">저장되었습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BzpcSelector from '../components/BzpcSelector.vue'
import { saveClient } from '../api/client'

const router = useRouter()
const selectedBzpc = ref({ bzpc: '', bzpcNm: '' })
const form = ref({ dplcNm: '', dplcScn: '02', useYn: 'Y' })
const loading = ref(false)
const error = ref('')
const ok = ref(false)

const canSubmit = computed(() => !!selectedBzpc.value.bzpc && !!form.value.dplcNm)

async function submit() {
  error.value = ''
  ok.value = false
  loading.value = true
  try {
    const { data } = await saveClient({
      ...form.value,
      bzpc: selectedBzpc.value.bzpc,
      bzpcNm: selectedBzpc.value.bzpcNm,
    })
    if (data?.resultCd === 'save.ok' || data?.result === 'success') {
      ok.value = true
      setTimeout(() => router.push('/clients'), 600)
    } else {
      error.value = data?.resultMessage || data?.message || '저장 실패 (백엔드 응답 확인)'
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '저장 실패'
  } finally {
    loading.value = false
  }
}
</script>
