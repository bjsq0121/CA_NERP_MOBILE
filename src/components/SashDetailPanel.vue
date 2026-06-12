<template>
  <article class="sash-detail-panel">
    <header class="sash-panel-head">
      <div>
        <div class="sash-panel-eyebrow">샤시 상세</div>
        <h3>{{ modelText || '-' }}</h3>
        <p>{{ windowTypeText || '-' }} · #{{ sequenceText || '-' }}</p>
      </div>
      <div class="sash-panel-actions">
        <span :class="statusClass">{{ statusText }}</span>
        <button type="button" :class="['btn btn-xs', editable ? 'accent' : 'secondary']" @click="$emit('edit')">
          {{ editable ? '수정' : '상세보기' }}
        </button>
      </div>
    </header>

    <div class="sash-panel-drawing">
      <div class="sash-panel-section-title">도면</div>
      <div class="sash-panel-drawing-box">
        <img
          v-if="drawingUrl"
          :key="drawingUrl"
          :src="drawingUrl"
          alt=""
          loading="eager"
          fetchpriority="high"
          decoding="async"
          @error="$emit('image-error')"
        />
        <div v-else class="sash-panel-drawing-fallback">{{ fallbackText || '샤시' }}</div>
      </div>
    </div>

    <section class="sash-panel-amounts">
      <div>
        <span>공급가</span>
        <strong>{{ supplyText }}원</strong>
      </div>
      <div>
        <span>VAT</span>
        <strong>{{ vatText }}원</strong>
      </div>
      <div class="is-total">
        <span>합계</span>
        <strong>{{ totalText }}원</strong>
      </div>
    </section>

    <section class="sash-panel-section">
      <div class="sash-panel-section-title">고객확인</div>
      <div v-if="props.optionChips.length" class="sash-list-chip-row panel-chip-row">
        <span v-for="chip in props.optionChips" :key="chip" class="sash-list-chip">{{ chip }}</span>
      </div>
      <div class="sash-panel-grid">
        <div v-for="item in customerItems" :key="`customer_${item.label}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section v-if="sizeItems.length" class="sash-panel-section">
      <div class="sash-panel-section-title">규격 상세</div>
      <div class="sash-panel-grid">
        <div v-for="item in sizeItems" :key="`size_${item.label}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section v-if="materialItems.length" class="sash-panel-section">
      <div class="sash-panel-section-title">자재/하드웨어</div>
      <div class="sash-panel-grid">
        <div v-for="item in materialItems" :key="`material_${item.label}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <details v-if="internalItems.length" class="sash-panel-section sash-panel-internal">
      <summary>내부 생산정보</summary>
      <div class="sash-panel-grid">
        <div v-for="item in internalItems" :key="`internal_${item.label}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </details>
  </article>
</template>

<script setup>
const props = defineProps({
  modelText: { type: String, default: '' },
  windowTypeText: { type: String, default: '' },
  sequenceText: { type: [String, Number], default: '' },
  statusText: { type: String, default: '' },
  statusClass: { type: String, default: 'badge' },
  editable: { type: Boolean, default: false },
  drawingUrl: { type: String, default: '' },
  fallbackText: { type: String, default: '' },
  supplyText: { type: String, default: '0' },
  vatText: { type: String, default: '0' },
  totalText: { type: String, default: '0' },
  optionChips: { type: Array, default: () => [] },
  customerItems: { type: Array, default: () => [] },
  sizeItems: { type: Array, default: () => [] },
  materialItems: { type: Array, default: () => [] },
  internalItems: { type: Array, default: () => [] },
})

defineEmits(['edit', 'image-error'])
</script>
