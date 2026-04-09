<template>
  <div>
    <div class="field">
      <label>영업소 (BZPC)</label>
      <!-- 일반 USER: 본인 bzpc 고정 / ADMIN: 클릭해서 선택 -->
      <input
        readonly
        :value="displayValue"
        :placeholder="auth.isAdmin ? '영업소를 선택하세요' : ''"
        :style="{ background: auth.isAdmin ? '#fff' : '#f1f5f9', cursor: auth.isAdmin ? 'pointer' : 'not-allowed' }"
        @click="auth.isAdmin && open()"
      />
    </div>

    <teleport to="body">
      <div v-if="visible" class="modal-mask" @click.self="visible = false">
        <div class="modal-sheet">
          <h3>영업소 선택</h3>
          <div class="field" style="margin-bottom:8px">
            <input v-model="keyword" placeholder="영업소명 검색" />
          </div>
          <div v-if="loading" class="empty">불러오는 중...</div>
          <div v-else-if="!filtered.length" class="empty">결과가 없습니다.</div>
          <div v-else>
            <div v-for="row in filtered" :key="row.bzpc" class="bzpc-row" @click="pick(row)">
              <div class="nm">{{ row.bzpcNm }}</div>
              <div class="cd">{{ row.bzpc }} · {{ row.vkburNm || row.vkbur }}</div>
            </div>
          </div>
          <button class="btn secondary" style="margin-top:12px" @click="visible = false">닫기</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { searchBzpcChoice } from '../api/bzpc'

const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()
const visible = ref(false)
const loading = ref(false)
const list = ref([])
const keyword = ref('')

const displayValue = computed(() => {
  const v = props.modelValue
  if (!v?.bzpc) return ''
  return `${v.bzpcNm || ''} (${v.bzpc})`
})

const filtered = computed(() => {
  if (!keyword.value) return list.value
  const k = keyword.value.toLowerCase()
  return list.value.filter((r) => (r.bzpcNm || '').toLowerCase().includes(k) || (r.bzpc || '').toLowerCase().includes(k))
})

// 일반 USER는 본인 bzpc 자동 세팅
onMounted(() => {
  if (!auth.isAdmin && auth.bzpc && !props.modelValue?.bzpc) {
    emit('update:modelValue', { bzpc: auth.bzpc, bzpcNm: auth.bzpcNm })
  }
})

watch(
  () => auth.user,
  () => {
    if (!auth.isAdmin && auth.bzpc) emit('update:modelValue', { bzpc: auth.bzpc, bzpcNm: auth.bzpcNm })
  }
)

async function open() {
  visible.value = true
  if (list.value.length) return
  loading.value = true
  try {
    // ADMIN: vkgrp 제한 없이, 단 자신의 사업장 범위 내
    const { data } = await searchBzpcChoice({
      searchVkbur: auth.vkbur || '',
      searchVkgrp: auth.isAdmin ? '' : auth.vkgrp,
    })
    list.value = data?.resultList || data?.gridData || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function pick(row) {
  emit('update:modelValue', { bzpc: row.bzpc, bzpcNm: row.bzpcNm })
  visible.value = false
}
</script>
