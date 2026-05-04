<template>
  <details class="card">
    <summary>핸들 (내부 / 외부)</summary>
    <div class="details-body">
      <div class="row-flex">
        <div class="field">
          <label>내부 핸들 종류</label>
          <select v-model="form.insdHandleType">
            <option value="">선택</option>
            <option v-for="h in handleOptions" :key="'i'+h.commCdId" :value="h.commCdId">{{ h.commCdNm }}</option>
          </select>
        </div>
        <div class="field">
          <label>
            내부 핸들 높이
            <button
              type="button"
              class="toggle-mini"
              :class="form.insdHndlHEnabled ? 'toggle-on' : 'toggle-off'"
              @click="toggleHndlH('insd')"
            >{{ form.insdHndlHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <input
            v-model.number="form.insdHndlH"
            type="number"
            placeholder="mm"
            :disabled="!form.insdHndlHEnabled"
          />
        </div>
      </div>
      <div class="row-flex">
        <div class="field">
          <label>외부 핸들 종류</label>
          <select v-model="form.ousdHandleType">
            <option value="">선택</option>
            <option v-for="h in handleOptions" :key="'o'+h.commCdId" :value="h.commCdId">{{ h.commCdNm }}</option>
          </select>
        </div>
        <div class="field">
          <label>
            외부 핸들 높이
            <button
              type="button"
              class="toggle-mini"
              :class="form.ousdHndlHEnabled ? 'toggle-on' : 'toggle-off'"
              @click="toggleHndlH('ousd')"
            >{{ form.ousdHndlHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <input
            v-model.number="form.ousdHndlH"
            type="number"
            placeholder="mm"
            :disabled="!form.ousdHndlHEnabled"
          />
        </div>
      </div>
    </div>
  </details>
</template>

<script setup>
const props = defineProps({
  form: { type: Object, required: true },
  handleOptions: { type: Array, default: () => [] },
})

function toggleHndlH(side) {
  if (side === 'insd') {
    props.form.insdHndlHEnabled = !props.form.insdHndlHEnabled
    if (!props.form.insdHndlHEnabled) props.form.insdHndlH = null
  } else {
    props.form.ousdHndlHEnabled = !props.form.ousdHndlHEnabled
    if (!props.form.ousdHndlHEnabled) props.form.ousdHndlH = null
  }
}
</script>
