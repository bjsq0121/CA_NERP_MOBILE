<template>
  <details v-if="hasAnyGlas" class="card">
    <summary>유리 자재 (SF / BF)</summary>
    <div class="details-body">
      <div v-if="glas.sfIn.length || glas.sfOut.length" class="row-flex">
        <div v-if="glas.sfIn.length" class="field">
          <label>SF 유리 (내)</label>
          <select v-model="form.mtrlCds1">
            <option v-for="g in glas.sfIn" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
          </select>
        </div>
        <div v-if="glas.sfOut.length" class="field">
          <label>SF 유리 (외)</label>
          <select v-model="form.mtrlCds2">
            <option v-for="g in glas.sfOut" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
          </select>
        </div>
      </div>
      <div v-if="glas.bfIn.length || glas.bfOut.length" class="row-flex">
        <div v-if="glas.bfIn.length" class="field">
          <label>BF 유리 (내)</label>
          <select v-model="form.mtrlCds3">
            <option v-for="g in glas.bfIn" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
          </select>
        </div>
        <div v-if="glas.bfOut.length" class="field">
          <label>BF 유리 (외)</label>
          <select v-model="form.mtrlCds4">
            <option v-for="g in glas.bfOut" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
          </select>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  glas: { type: Object, default: () => ({ sfIn: [], sfOut: [], bfIn: [], bfOut: [] }) },
})

const hasAnyGlas = computed(() =>
  props.glas.sfIn.length || props.glas.sfOut.length ||
  props.glas.bfIn.length || props.glas.bfOut.length
)
</script>
