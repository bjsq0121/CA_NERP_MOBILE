<template>
  <details class="card" open>
    <summary>VENT / 스크린 / 안전망</summary>
    <div class="details-body">
      <div class="field">
        <label>VENT 위치</label>
        <select v-model="form.ventLoc">
          <option value="">없음</option>
          <option v-for="v in ventOptions" :key="v.commCdId" :value="v.commCdId">
            {{ v.commCdNm }}
          </option>
        </select>
        <div v-if="form.wintydiCd && !ventOptions.length" class="text-xs text-muted mt-xs">
          이 창형태에는 VENT 옵션이 없습니다
        </div>
      </div>

      <div class="row-flex option-row">
        <div class="field" style="flex:2">
          <label>스크린 종류</label>
          <select v-model="form.screenType">
            <option value="">선택</option>
            <option v-for="s in screenOptions" :key="s.commCdId" :value="s.commCdId">
              {{ s.commCdNm }}
            </option>
          </select>
        </div>
        <div class="field option-toggle-field">
          <label>안전망</label>
          <button
            type="button"
            class="toggle-btn"
            :class="form.isAluMf ? 'toggle-on' : 'toggle-off'"
            @click="$emit('toggleAluMf')"
          >{{ form.isAluMf ? 'ON' : 'OFF' }}</button>
        </div>
      </div>

      <div v-if="form.isAluMf" class="option-panel safety-panel">
        <div class="option-select-grid">
          <div class="field">
            <label>안전망 핸들</label>
            <select v-model="form.aluMfHandleType" @change="onAluMfHandleChange">
              <option value="">선택</option>
              <option v-for="h in aluMfHandleOptions" :key="h.commCdId" :value="h.commCdId">
                {{ h.commCdNm }}
              </option>
            </select>
          </div>
          <div class="field option-toggle-field">
            <label>안전망 높이</label>
            <button
              type="button"
              class="toggle-btn"
              :class="form.aluMfMdlYn === 'Y' ? 'toggle-on' : 'toggle-off'"
              @click="toggleAluMfHeight"
            >{{ form.aluMfMdlYn === 'Y' ? 'ON' : 'OFF' }}</button>
          </div>
          <div class="field">
            <label>높이</label>
            <input
              v-model.number="form.aluMfHndlH"
              type="number"
              inputmode="numeric"
              placeholder="mm"
              :disabled="form.aluMfMdlYn === 'Y'"
            />
          </div>
        </div>
      </div>

      <div class="field mt-sm">
        <label>실리콘 마감</label>
        <button
          type="button"
          class="toggle-btn"
          :class="form.slcnFnshYn ? 'toggle-on' : 'toggle-off'"
          :disabled="!siliconeFinishEnabled"
          style="max-width:120px"
          @click="toggleSiliconeFinish"
        >{{ form.slcnFnshYn ? 'ON' : 'OFF' }}</button>
      </div>
    </div>
  </details>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  aluMfHandleOptions: { type: Array, default: () => [] },
  form: { type: Object, required: true },
  ventOptions: { type: Array, default: () => [] },
  screenOptions: { type: Array, default: () => [] },
  siliconeFinishEnabled: { type: Boolean, default: true },
})
const { form, ventOptions, screenOptions, aluMfHandleOptions, siliconeFinishEnabled } = toRefs(props)

defineEmits(['toggleAluMf'])

function toggleAluMfHeight() {
  form.value.aluMfMdlYn = form.value.aluMfMdlYn === 'Y' ? 'N' : 'Y'
  if (form.value.aluMfMdlYn === 'Y') form.value.aluMfHndlH = null
}

function onAluMfHandleChange() {
  if (!form.value.aluMfHandleType) form.value.aluMfHndlH = null
}

function toggleSiliconeFinish() {
  if (!props.siliconeFinishEnabled) return
  form.value.slcnFnshYn = !form.value.slcnFnshYn
}
</script>
