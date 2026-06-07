<template>
  <div class="card">
    <!-- 모형 -->
    <div class="field">
      <label>모형 *</label>
      <input
        readonly
        data-clickable
        :value="modelDisplay"
        placeholder="터치해서 모형 검색"
        @click="$emit('openModel')"
      />
      <div v-if="form.mdlCd" class="text-xs mt-xs">
        자재사 {{ form.mtrlCoNm || '-' }} / 사이즈코드 {{ form.sizCd || '-' }}
      </div>
    </div>

    <!-- 창형태 -->
    <div class="sash-form-drawing-row">
      <div class="sash-form-drawing-controls">
        <div class="row-flex">
          <div class="field">
            <label>창형태 *</label>
            <select :value="form.wintydiCd" @change="$emit('wintydiChange', $event.target.value)">
              <option value="">선택</option>
              <option v-for="w in wintydiList" :key="w.commCdId" :value="w.commCdId">
                {{ w.commCdNm }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>틀짝망 *</label>
            <select v-model="form.bsmfOrdUtmCd">
              <option value="">선택</option>
              <option v-for="b in bsmfList" :key="b.commCdId" :value="b.commCdId">
                {{ b.commCdNm }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="sash-drawing-inline">
        <img
          v-if="drawingUrl"
          :src="drawingUrl"
          alt=""
          loading="lazy"
          @error="$emit('drawingError')"
        />
        <div v-else class="sash-drawing-inline-fallback">
          <span>{{ drawingFallback || '샤시' }}</span>
        </div>
      </div>
    </div>

    <!-- SF 자재 -->
    <div class="row-flex">
      <div class="field">
        <label>SF내 자재 *</label>
        <select v-model="form.insdSf">
          <option value="">선택</option>
          <option v-for="s in insdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
            {{ sfDisplayName(s) }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>SF외 자재 {{ ousdSfList.length ? '*' : '' }}</label>
        <select v-model="form.ousdSf" :disabled="!ousdSfList.length">
          <option value="">{{ ousdSfList.length ? '선택' : '해당없음' }}</option>
          <option v-for="s in ousdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
            {{ sfDisplayName(s) }}
          </option>
        </select>
      </div>
    </div>

    <!-- 사이즈 W/H/수량 -->
    <div class="row-flex">
      <div class="field">
        <label>W (폭) *</label>
        <input
          :value="form.w ?? ''"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          autocomplete="off"
          enterkeyhint="next"
          @input="setFourDigitNumber('w', $event)"
        />
      </div>
      <div class="field">
        <label>H (높이) *</label>
        <input
          :value="form.h ?? ''"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          autocomplete="off"
          enterkeyhint="next"
          @input="setFourDigitNumber('h', $event)"
        />
      </div>
      <div class="field field-qty">
        <label>수량 *</label>
        <input v-model.number="form.qty" type="number" inputmode="numeric" min="1" />
      </div>
    </div>

    <!-- 추가 W -->
    <div v-if="cntW > 1" class="row-flex">
      <div v-if="cntW > 1" class="field">
        <label>W1</label>
        <input :value="form.w1 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('w1', $event)" />
      </div>
      <div v-if="cntW > 2" class="field">
        <label>W2</label>
        <input :value="form.w2 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('w2', $event)" />
      </div>
      <div v-if="cntW > 3" class="field">
        <label>W3</label>
        <input :value="form.w3 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('w3', $event)" />
      </div>
    </div>
    <div v-if="cntW > 4" class="row-flex">
      <div v-if="cntW > 4" class="field">
        <label>W4</label>
        <input :value="form.w4 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('w4', $event)" />
      </div>
      <div v-if="cntW > 5" class="field">
        <label>W5</label>
        <input :value="form.w5 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('w5', $event)" />
      </div>
    </div>

    <!-- 추가 H -->
    <div v-if="cntH > 1" class="row-flex">
      <div v-if="cntH > 1" class="field">
        <label>H1</label>
        <input :value="form.h1 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('h1', $event)" />
      </div>
      <div v-if="cntH > 2" class="field">
        <label>H2</label>
        <input :value="form.h2 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('h2', $event)" />
      </div>
      <div v-if="cntH > 3" class="field">
        <label>H3</label>
        <input :value="form.h3 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('h3', $event)" />
      </div>
    </div>
    <div v-if="cntH > 4" class="row-flex">
      <div v-if="cntH > 4" class="field">
        <label>H4</label>
        <input :value="form.h4 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('h4', $event)" />
      </div>
      <div v-if="cntH > 5" class="field">
        <label>H5</label>
        <input :value="form.h5 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('h5', $event)" />
      </div>
    </div>

    <!-- 특수조건 CS -->
    <div v-if="cntCS > 0" class="mt-sm">
      <div class="field-cs-label">특수조건 (사이즈 mm)</div>
      <div class="row-flex">
        <div v-if="cntCS > 0" class="field">
          <label>CS</label>
          <input :value="form.cs ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs', $event)" />
        </div>
        <div v-if="cntCS > 1" class="field">
          <label>CS1</label>
          <input :value="form.cs1 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs1', $event)" />
        </div>
        <div v-if="cntCS > 2" class="field">
          <label>CS2</label>
          <input :value="form.cs2 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs2', $event)" />
        </div>
      </div>
      <div v-if="cntCS > 3" class="row-flex">
        <div v-if="cntCS > 3" class="field">
          <label>CS3</label>
          <input :value="form.cs3 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs3', $event)" />
        </div>
        <div v-if="cntCS > 4" class="field">
          <label>CS4</label>
          <input :value="form.cs4 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs4', $event)" />
        </div>
        <div v-if="cntCS > 5" class="field">
          <label>CS5</label>
          <input :value="form.cs5 ?? ''" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" enterkeyhint="next" @input="setFourDigitNumber('cs5', $event)" />
        </div>
      </div>
    </div>

    <!-- 색상 -->
    <div class="row-flex row-compact">
      <div class="field" style="max-width:80px">
        <label>기본색상</label>
        <input :value="form.crtnColrCd" readonly />
      </div>
      <div class="field">
        <label>내부색상 *</label>
        <select v-model="form.insdColrCd" @change="$emit('insdColorChange')">
          <option value="">선택</option>
          <option v-for="c in colorList" :key="'i'+c.commCdId" :value="c.commCdId">
            {{ c.commCdNm }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>
          외부색상
          <span v-if="syncOusd" class="sync-badge">동기화</span>
        </label>
        <select v-model="form.ousdColrCd" @change="$emit('ousdColorChange')">
          <option v-for="c in colorList" :key="'o'+c.commCdId" :value="c.commCdId">
            {{ c.commCdNm }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  wintydiList: { type: Array, default: () => [] },
  wintydiMap: { type: Object, default: () => ({}) },
  bsmfList: { type: Array, default: () => [] },
  insdSfList: { type: Array, default: () => [] },
  ousdSfList: { type: Array, default: () => [] },
  colorList: { type: Array, default: () => [] },
  syncOusd: { type: Boolean, default: true },
  drawingUrl: { type: String, default: '' },
  drawingFallback: { type: String, default: '' },
})

defineEmits(['openModel', 'wintydiChange', 'insdColorChange', 'ousdColorChange', 'drawingError'])

const modelDisplay = computed(() => (props.form.mdlCd ? `${props.form.mdlNm} (${props.form.mdlCd})` : ''))

function setFourDigitNumber(field, event) {
  const digits = String(event.target.value || '').replace(/\D/g, '').slice(0, 4)
  event.target.value = digits
  props.form[field] = digits ? Number(digits) : null
}

const cntInfo = computed(() => props.wintydiMap[props.form.wintydiCd] || {})
const cntW = computed(() => Number(cntInfo.value.cntW) || 0)
const cntH = computed(() => Number(cntInfo.value.cntH) || 0)
const cntCS = computed(() => Number(cntInfo.value.cntCS) || 0)

const sfDisplayName = (item) => item.mtrlProdNm || item.mtrlNm || item.prodNm || item.commCdNm || item.mtrlProdCd
</script>
