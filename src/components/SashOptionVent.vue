<template>
  <details class="card">
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

      <div class="row-flex" style="align-items:flex-end">
        <div class="field" style="flex:2">
          <label>스크린 종류</label>
          <select v-model="form.screenType">
            <option value="">선택</option>
            <option v-for="s in screenOptions" :key="s.commCdId" :value="s.commCdId">
              {{ s.commCdNm }}
            </option>
          </select>
        </div>
        <div class="field" style="flex:1;max-width:120px">
          <label>안전망</label>
          <button
            type="button"
            class="toggle-btn"
            :class="form.isAluMf ? 'toggle-on' : 'toggle-off'"
            @click="$emit('toggleAluMf')"
          >{{ form.isAluMf ? 'ON' : 'OFF' }}</button>
        </div>
      </div>

      <div class="field mt-sm">
        <label>실리콘 마감</label>
        <button
          type="button"
          class="toggle-btn"
          :class="form.slcnFnshYn ? 'toggle-on' : 'toggle-off'"
          style="max-width:120px"
          @click="form.slcnFnshYn = !form.slcnFnshYn"
        >{{ form.slcnFnshYn ? 'ON' : 'OFF' }}</button>
      </div>
    </div>
  </details>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  ventOptions: { type: Array, default: () => [] },
  screenOptions: { type: Array, default: () => [] },
})

defineEmits(['toggleAluMf'])
</script>
