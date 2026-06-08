<template>
  <button
    type="button"
    class="sash-list-card"
    :class="{ 'is-selected': selected }"
    @click="$emit('select')"
  >
    <div class="sash-list-card-head">
      <div class="sash-list-card-title">
        <strong>{{ modelText || '-' }}</strong>
        <span>{{ windowTypeText || '-' }}</span>
      </div>
      <div class="sash-list-card-badges">
        <span class="sash-seq">#{{ sequenceText || '-' }}</span>
        <span :class="statusClass">{{ statusText }}</span>
      </div>
    </div>

    <div class="sash-list-card-meta">
      <span>{{ sizeText || '-' }}</span>
      <span>수량 {{ qtyText || '-' }}</span>
      <span>{{ colorText || '-' }}</span>
      <span>{{ bsmfText || '-' }}</span>
    </div>

    <div v-if="props.optionChips.length" class="sash-list-chip-row">
      <span v-for="chip in props.optionChips" :key="chip" class="sash-list-chip">{{ chip }}</span>
    </div>

    <div class="sash-list-card-total">
      <span>합계</span>
      <strong>{{ totalText }}원</strong>
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  selected: { type: Boolean, default: false },
  modelText: { type: String, default: '' },
  windowTypeText: { type: String, default: '' },
  sequenceText: { type: [String, Number], default: '' },
  statusText: { type: String, default: '' },
  statusClass: { type: String, default: 'badge' },
  sizeText: { type: String, default: '' },
  qtyText: { type: [String, Number], default: '' },
  colorText: { type: String, default: '' },
  bsmfText: { type: String, default: '' },
  optionChips: { type: Array, default: () => [] },
  totalText: { type: String, default: '0' },
})

defineEmits(['select'])
</script>
