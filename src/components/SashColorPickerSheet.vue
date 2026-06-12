<template>
  <div v-if="visible" class="modal-mask" @click.self="$emit('close')">
    <div class="modal-sheet color-picker-sheet">
      <div class="quick-config-head">
        <h3>{{ target === 'outer' ? '외부색상 검색' : '내부색상 검색' }}</h3>
        <button type="button" class="btn secondary" @click="$emit('close')">닫기</button>
      </div>

      <div class="color-picker-search">
        <div class="field">
          <label>색상그룹</label>
          <select v-model="filter.colorCd">
            <option value="">전체</option>
            <option
              v-for="group in colorGroups"
              :key="group.commCdVal || group.commCdId"
              :value="group.commCdVal || group.commCdId"
            >
              {{ group.commCdNm }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>색상명</label>
          <input
            v-model.trim="filter.colorNm"
            type="search"
            placeholder="색상명 입력"
            enterkeyhint="search"
            @keyup.enter="searchFirstPage"
          />
        </div>
        <button type="button" class="btn accent color-picker-submit" :disabled="loading" @click="searchFirstPage">
          조회
        </button>
      </div>

      <div v-if="error" class="quick-config-error">{{ error }}</div>
      <div v-if="loading" class="empty quick-config-empty">색상 목록 불러오는 중...</div>
      <div v-else-if="!colors.length" class="empty quick-config-empty">조회된 색상이 없습니다.</div>
      <div v-else class="color-picker-list">
        <button
          v-for="row in colors"
          :key="row.commCdVal || row.commCdId"
          type="button"
          class="color-picker-card"
          @click="$emit('select', row)"
        >
          <div>
            <strong>{{ row.commCdNm || row.commCdVal || row.commCdId }}</strong>
            <span>{{ row.commCdVal || row.commCdId }}</span>
          </div>
          <small v-if="colorMeta(row)">{{ colorMeta(row) }}</small>
        </button>
      </div>

      <div v-if="hasPaging" class="color-picker-paging">
        <button type="button" class="btn secondary" :disabled="loading || curPage <= 1" @click="movePage(curPage - 1)">
          이전
        </button>
        <span>{{ curPage }} / {{ totalPages }}</span>
        <button type="button" class="btn secondary" :disabled="loading || curPage >= totalPages" @click="movePage(curPage + 1)">
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { searchCodeList, searchColorSearch } from '../api/estimate'

const props = defineProps({
  visible: { type: Boolean, default: false },
  target: { type: String, default: 'inner' },
  bftydiCd: { type: String, default: '' },
  mtrlCo: { type: String, default: '' },
})

defineEmits(['close', 'select'])

const filter = ref({
  colorCd: '',
  colorNm: '',
})
const colorGroups = ref([])
const colors = ref([])
const loading = ref(false)
const error = ref('')
const curPage = ref(1)
const perPage = ref(30)
const totalCount = ref(0)

const normalizedMtrlCo = computed(() => String(props.mtrlCo || '').trim().toUpperCase())
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / perPage.value)))
const hasPaging = computed(() => totalCount.value > perPage.value)

async function loadColorGroups() {
  const { data } = await searchCodeList('976')
  colorGroups.value = data?.resultList || []
}

function resolveKccAsaYn() {
  return props.bftydiCd === '119' && ['KC', 'LX'].includes(normalizedMtrlCo.value) ? 'Y' : ''
}

function resolveCaAsaYn() {
  return props.bftydiCd === '119' && normalizedMtrlCo.value === 'CA' ? 'Y' : ''
}

async function loadColors() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await searchColorSearch({
      curPage: curPage.value,
      perPage: perPage.value,
      commCdGrpId: '975',
      addInfo1: '976',
      addInfo2: filter.value.colorCd,
      addInfo9: resolveCaAsaYn(),
      commCdNm: filter.value.colorNm,
      estiType: 'P',
      kccAsaYn: resolveKccAsaYn(),
    })
    colors.value = data?.resultList || []
    totalCount.value = Number(data?.totalCount || data?.totCnt || colors.value.length || 0)
  } catch (e) {
    colors.value = []
    totalCount.value = 0
    error.value = e?.response?.data?.message || e.message || '색상 목록을 조회하지 못했습니다.'
  } finally {
    loading.value = false
  }
}

async function searchFirstPage() {
  curPage.value = 1
  await loadColors()
}

async function movePage(page) {
  curPage.value = Math.min(Math.max(1, page), totalPages.value)
  await loadColors()
}

function colorMeta(row = {}) {
  return [row.addInfo10, row.addInfo16, row.addInfo39].filter(Boolean).join(' / ')
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return
    let colorGroupErrorMessage = ''
    try {
      if (!colorGroups.value.length) await loadColorGroups()
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || '색상그룹을 조회하지 못했습니다.'
      colorGroupErrorMessage = error.value
      colorGroups.value = []
    }
    await searchFirstPage()
    if (colorGroupErrorMessage && !error.value) error.value = colorGroupErrorMessage
  },
  { immediate: true }
)
</script>
