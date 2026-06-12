<template>
  <details class="card" open>
    <summary>알유리 / 브래킷 / 핸들</summary>
    <fieldset :disabled="readonly" class="sash-readonly-fieldset">
    <div class="details-body">
      <div class="row-flex">
        <div class="field option-inline-field">
          <label>알유리견적</label>
          <button
            type="button"
            class="switch-toggle"
            :class="{ 'is-on': form.alGlass }"
            :aria-pressed="form.alGlass ? 'true' : 'false'"
            :disabled="!alGlassEnabled"
            @click="toggleAlGlass"
          >
            <span class="switch-track"><span class="switch-thumb"></span></span>
            <span class="switch-text">{{ form.alGlass ? 'ON' : 'OFF' }}</span>
          </button>
        </div>
        <div class="field">
          <label>발주구분 *</label>
          <select v-model="form.sashOrdTypCd">
            <option value="">선택</option>
            <option v-for="o in ordTypList" :key="o.commCdId" :value="o.commCdId">
              {{ o.commCdNm }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="row-flex">
        <div class="field">
          <label>내부 핸들 종류</label>
          <select class="sash-highlight-input" v-model="form.insdHandleType">
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
          <select class="sash-highlight-input" v-model="form.ousdHandleType">
            <option value="">선택</option>
            <option v-for="h in handleOptions" :key="'o'+h.commCdId" :value="h.commCdId">{{ h.commCdNm }}</option>
          </select>
        </div>
        <div class="field" :class="{ 'is-disabled': form.dblWindYn !== 'Y' }">
          <label>
            외부 핸들 높이
            <button
              type="button"
              class="toggle-mini"
              :class="form.ousdHndlHEnabled ? 'toggle-on' : 'toggle-off'"
              :disabled="form.dblWindYn !== 'Y'"
              @click="toggleHndlH('ousd')"
            >{{ form.ousdHndlHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <input
            v-model.number="form.ousdHndlH"
            type="number"
            placeholder="mm"
            :disabled="form.dblWindYn !== 'Y' || !form.ousdHndlHEnabled"
          />
        </div>
      </div>
      <div class="row-flex">
        <div class="field" :class="{ 'is-disabled': !secondFloorEnabled }">
          <label>
            핸들높이2
            <button
              type="button"
              class="toggle-mini"
              :class="form.secondHndlHEnabled ? 'toggle-on' : 'toggle-off'"
              :disabled="!secondFloorEnabled"
              @click="toggleHndlH('second')"
            >{{ form.secondHndlHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <div class="row-flex row-compact">
            <input v-model.number="form.insd2FHndlH" type="number" placeholder="내2 mm" :disabled="!secondFloorEnabled || !form.secondHndlHEnabled" />
            <input v-model.number="form.ousd2FHndlH" type="number" placeholder="외2 mm" :disabled="!secondFloorEnabled || !form.secondHndlHEnabled" />
          </div>
        </div>
      </div>
      <div class="row-flex">
        <div class="field">
          <label>
            브래킷높이
            <button
              type="button"
              class="toggle-mini"
              :class="form.insdBrcktHEnabled ? 'toggle-on' : 'toggle-off'"
              @click="toggleBracket('main')"
            >{{ form.insdBrcktHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <div class="row-flex row-compact">
            <input v-model.number="form.insdBrcktH" type="number" placeholder="내 mm" :disabled="!form.insdBrcktHEnabled" />
            <input v-model.number="form.ousdBrcktH" type="number" placeholder="외 mm" :disabled="!form.insdBrcktHEnabled" />
          </div>
        </div>
        <div class="field" :class="{ 'is-disabled': !secondFloorEnabled }">
          <label>
            브래킷높이2
            <button
              type="button"
              class="toggle-mini"
              :class="form.ousdBrcktHEnabled ? 'toggle-on' : 'toggle-off'"
              :disabled="!secondFloorEnabled"
              @click="toggleBracket('second')"
            >{{ form.ousdBrcktHEnabled ? 'ON' : 'OFF' }}</button>
          </label>
          <div class="row-flex row-compact">
            <input v-model.number="form.insd2FBrcktH" type="number" placeholder="내2 mm" :disabled="!secondFloorEnabled || !form.ousdBrcktHEnabled" />
            <input v-model.number="form.ousd2FBrcktH" type="number" placeholder="외2 mm" :disabled="!secondFloorEnabled || !form.ousdBrcktHEnabled" />
          </div>
        </div>
      </div>

      
      
    </div>
    </fieldset>
  </details>
</template>

<script setup>
const props = defineProps({
  form: { type: Object, required: true },
  handleOptions: { type: Array, default: () => [] },
  ordTypList: { type: Array, default: () => [] },
  alGlassEnabled: { type: Boolean, default: true },
  secondFloorEnabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
})

function toggleAlGlass() {
  if (!props.alGlassEnabled) return
  props.form.alGlass = !props.form.alGlass
}

function toggleHndlH(side) {
  if (side === 'insd') {
    props.form.insdHndlHEnabled = !props.form.insdHndlHEnabled
    props.form.ousdHndlHEnabled = props.form.insdHndlHEnabled
    if (!props.form.insdHndlHEnabled) {
      props.form.insdHndlH = null
      props.form.ousdHndlH = null
    }
  } else if (side === 'ousd') {
    if (props.form.dblWindYn !== 'Y') return
    props.form.ousdHndlHEnabled = !props.form.ousdHndlHEnabled
    if (!props.form.ousdHndlHEnabled) props.form.ousdHndlH = null
  } else {
    if (!props.secondFloorEnabled) return
    props.form.secondHndlHEnabled = !props.form.secondHndlHEnabled
    if (!props.form.secondHndlHEnabled) {
      props.form.insd2FHndlH = null
      props.form.ousd2FHndlH = null
    }
  }
}

function toggleBracket(type) {
  if (type === 'main') {
    props.form.insdBrcktHEnabled = !props.form.insdBrcktHEnabled
    if (!props.form.insdBrcktHEnabled) {
      props.form.insdBrcktH = null
      props.form.ousdBrcktH = null
    }
  } else {
    if (!props.secondFloorEnabled) return
    props.form.ousdBrcktHEnabled = !props.form.ousdBrcktHEnabled
    if (!props.form.ousdBrcktHEnabled) {
      props.form.insd2FBrcktH = null
      props.form.ousd2FBrcktH = null
    }
  }
}
</script>
