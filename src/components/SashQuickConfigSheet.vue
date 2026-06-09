<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-sheet quick-config-sheet">
      <div class="quick-config-head">
        <div>
          <h3>간편샤시 불러오기</h3>
          <p>웹에서 등록한 샤시 간편견적 목록입니다.</p>
        </div>
        <button type="button" class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="quick-config-search">
        <input
          v-model.trim="keyword"
          type="search"
          placeholder="설정명, 모형, 창형태 검색"
          @keyup.enter="loadList"
        />
        <button type="button" class="btn secondary" :disabled="loading" @click="loadList">
          {{ loading ? '조회중' : '조회' }}
        </button>
      </div>

      <div v-if="error" class="quick-config-error">{{ error }}</div>
      <div v-if="loading" class="empty quick-config-empty">간편샤시 목록 불러오는 중...</div>
      <div v-else-if="!cards.length" class="empty quick-config-empty">등록된 간편샤시가 없습니다.</div>

      <div v-else class="quick-config-list">
        <button
          v-for="card in cards"
          :key="card.cfgId"
          type="button"
          class="quick-config-card"
          @click="$emit('select', card)"
        >
          <div class="quick-config-title-row">
            <strong>{{ summarize(card).title }}</strong>
            <span>{{ card.header.mtrlCoNm || card.header.mtrlCo || '-' }}</span>
          </div>
          <div class="quick-config-spec-grid">
            <div>
              <span>모형</span>
              <strong>{{ summarize(card).modelText }}</strong>
            </div>
            <div>
              <span>창형태</span>
              <strong>{{ summarize(card).shapeText }}</strong>
            </div>
            <div>
              <span>색상</span>
              <strong>{{ summarize(card).colorText }}</strong>
            </div>
            <div>
              <span>망</span>
              <strong>{{ summarize(card).screenText }}</strong>
            </div>
            <div class="quick-config-spec-wide">
              <span>유리</span>
              <strong>{{ summarize(card).glassText }}</strong>
            </div>
          </div>
          <div v-if="summarize(card).noteText" class="quick-config-note">
            {{ summarize(card).noteText }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { searchSashQuickConfigList } from '../api/estimate'
import { buildQuickConfigCards, summarizeQuickConfigCard } from '../utils/sashQuickConfig'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'select'])

const keyword = ref('')
const loading = ref(false)
const error = ref('')
const cards = ref([])

function summarize(card) {
  return summarizeQuickConfigCard(card)
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await searchSashQuickConfigList({
      searchKeyword: keyword.value,
      searchUseYn: 'Y',
      startRowNum: 0,
      endRowNum: 100,
    })
    if (data?.errMsg) {
      error.value = data.errMsg
      cards.value = []
      return
    }
    cards.value = buildQuickConfigCards(data)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '간편샤시 목록 조회 실패'
    cards.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible && !cards.value.length) loadList()
  },
  { immediate: true }
)
</script>

<style scoped>
.quick-config-sheet {
  max-height: min(82vh, 720px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.quick-config-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.quick-config-head h3 {
  margin: 0;
  font-size: 18px;
}
.quick-config-head p {
  margin: 4px 0 0;
  color: var(--c-text-muted);
  font-size: 12px;
}
.btn-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--c-border-light);
  color: var(--c-text-secondary);
  font-size: 22px;
  line-height: 1;
}
.quick-config-search {
  display: flex;
  gap: 8px;
}
.quick-config-search input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.quick-config-error {
  background: var(--c-danger-bg);
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 12px;
}
.quick-config-empty {
  padding: 28px 0;
}
.quick-config-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}
.quick-config-card {
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 12px;
  box-shadow: var(--shadow-xs);
}
.quick-config-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.quick-config-title-row strong {
  font-size: 15px;
  color: var(--c-text);
}
.quick-config-title-row span {
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  padding: 2px 8px;
  background: var(--c-accent-bg);
  color: var(--c-accent);
  font-size: 11px;
  font-weight: 700;
}
.quick-config-spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.quick-config-spec-grid div {
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.quick-config-spec-grid span {
  display: block;
  color: var(--c-text-muted);
  font-size: 10px;
  font-weight: 800;
}
.quick-config-spec-grid strong {
  display: block;
  margin-top: 2px;
  color: var(--c-text);
  font-size: 12px;
  font-weight: 850;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.quick-config-spec-wide {
  grid-column: 1 / -1;
}
.quick-config-note {
  margin-top: 8px;
  color: var(--c-text-muted);
  font-size: 11px;
  white-space: pre-wrap;
}
</style>
