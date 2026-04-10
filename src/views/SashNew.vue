<template>
  <div>
    <div v-if="pageLoading" class="loading-center">
      <div class="loading-text">견적 데이터 불러오는 중...</div>
      <div class="loading-spinner"></div>
    </div>
    <div v-else class="page-title-row">
      <h2 class="page-title">{{ isReadonly ? `샤시 견적 #${editEstiSeq} 조회` : isEditMode ? `샤시 견적 #${editEstiSeq} 편집` : '샤시 견적 작성' }}</h2>
      <button class="btn-back" @click="router.push(`/estimates/${itgEstiNo}`)">뒤로</button>
    </div>

    <div class="card card-info">
      <div class="sash-info">
        <div class="sash-label">통합견적번호 / 샤시견적번호</div>
        <div class="sash-value">{{ itgEstiNo }}</div>
        <div class="text-xs">wEstiNo: {{ wEstiNo || '(없음)' }}</div>
      </div>
    </div>

    <!-- 필수 -->
    <div v-if="!pageLoading" class="card">
      <!-- 모형 -->
      <div class="field">
        <label>모형 *</label>
        <input
          readonly
          data-clickable
          :value="modelDisplay"
          placeholder="터치해서 모형 검색"
          @click="modelModal?.open()"
        />
        <div v-if="form.mdlCd" class="text-xs mt-xs">
          자재사 {{ form.mtrlCoNm || '-' }} / 사이즈코드 {{ form.sizCd || '-' }}
        </div>
      </div>

      <!-- 창형태 -->
      <div class="field">
        <label>창형태 *</label>
        <select v-model="form.wintydiCd" @change="onWintydiChange">
          <option value="">선택</option>
          <option v-for="w in wintydiList" :key="w.commCdId" :value="w.commCdId">
            {{ w.commCdNm }} ({{ w.commCdId }})
          </option>
        </select>
        <div v-if="form.wintydiCd" class="text-xs text-info mt-xs">
          입력가능: W={{ cntW }}개, H={{ cntH }}개, CS={{ cntCS }}개
        </div>
      </div>

      <!-- SF 자재 -->
      <div class="row-flex">
        <div class="field">
          <label>SF내 자재 *</label>
          <select v-model="form.insdSf">
            <option value="">선택</option>
            <option v-for="s in insdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
              {{ s.mtrlProdCd }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>SF외 자재 {{ ousdSfList.length ? '*' : '' }}</label>
          <select v-model="form.ousdSf" :disabled="!ousdSfList.length">
            <option value="">{{ ousdSfList.length ? '선택' : '해당없음' }}</option>
            <option v-for="s in ousdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
              {{ s.mtrlProdCd }}
            </option>
          </select>
        </div>
      </div>

      <!-- 사이즈 W/H/수량 -->
      <div class="row-flex">
        <div class="field">
          <label>W (폭) *</label>
          <input v-model.number="form.w" type="number" inputmode="numeric" />
        </div>
        <div class="field">
          <label>H (높이) *</label>
          <input v-model.number="form.h" type="number" inputmode="numeric" />
        </div>
        <div class="field field-qty">
          <label>수량 *</label>
          <input v-model.number="form.qty" type="number" inputmode="numeric" min="1" />
        </div>
      </div>

      <!-- 추가 W -->
      <div v-if="cntW > 1" class="row-flex">
        <div v-if="cntW > 1" class="field"><label>W1</label><input v-model.number="form.w1" type="number" /></div>
        <div v-if="cntW > 2" class="field"><label>W2</label><input v-model.number="form.w2" type="number" /></div>
        <div v-if="cntW > 3" class="field"><label>W3</label><input v-model.number="form.w3" type="number" /></div>
      </div>
      <div v-if="cntW > 4" class="row-flex">
        <div v-if="cntW > 4" class="field"><label>W4</label><input v-model.number="form.w4" type="number" /></div>
        <div v-if="cntW > 5" class="field"><label>W5</label><input v-model.number="form.w5" type="number" /></div>
      </div>

      <!-- 추가 H -->
      <div v-if="cntH > 1" class="row-flex">
        <div v-if="cntH > 1" class="field"><label>H1</label><input v-model.number="form.h1" type="number" /></div>
        <div v-if="cntH > 2" class="field"><label>H2</label><input v-model.number="form.h2" type="number" /></div>
        <div v-if="cntH > 3" class="field"><label>H3</label><input v-model.number="form.h3" type="number" /></div>
      </div>
      <div v-if="cntH > 4" class="row-flex">
        <div v-if="cntH > 4" class="field"><label>H4</label><input v-model.number="form.h4" type="number" /></div>
        <div v-if="cntH > 5" class="field"><label>H5</label><input v-model.number="form.h5" type="number" /></div>
      </div>

      <!-- 특수조건 CS -->
      <div v-if="cntCS > 0" class="mt-sm">
        <div class="field-cs-label">특수조건 (사이즈 mm)</div>
        <div class="row-flex">
          <div v-if="cntCS > 0" class="field"><label>CS</label><input v-model.number="form.cs" type="number" /></div>
          <div v-if="cntCS > 1" class="field"><label>CS1</label><input v-model.number="form.cs1" type="number" /></div>
          <div v-if="cntCS > 2" class="field"><label>CS2</label><input v-model.number="form.cs2" type="number" /></div>
        </div>
        <div v-if="cntCS > 3" class="row-flex">
          <div v-if="cntCS > 3" class="field"><label>CS3</label><input v-model.number="form.cs3" type="number" /></div>
          <div v-if="cntCS > 4" class="field"><label>CS4</label><input v-model.number="form.cs4" type="number" /></div>
          <div v-if="cntCS > 5" class="field"><label>CS5</label><input v-model.number="form.cs5" type="number" /></div>
        </div>
      </div>

      <!-- 발주구분 -->
      <div class="field">
        <label>발주구분 *</label>
        <select v-model="form.sashOrdTypCd">
          <option value="">선택</option>
          <option v-for="o in ordTypList" :key="o.commCdId" :value="o.commCdId">
            {{ o.commCdNm }}
          </option>
        </select>
      </div>

      <!-- 색상: 기본(고정 WH) / 내부 / 외부 -->
      <div class="row-flex row-compact">
        <div class="field" style="max-width:80px">
          <label>기본색상</label>
          <input :value="form.crtnColrCd" readonly />
        </div>
        <div class="field">
          <label>내부색상 *</label>
          <select v-model="form.insdColrCd" @change="onInsdColorChange">
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
          <select v-model="form.ousdColrCd" @change="onOusdColorChange">
            <option v-for="c in colorList" :key="'o'+c.commCdId" :value="c.commCdId">
              {{ c.commCdNm }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 상세 옵션 1: VENT / 스크린 / 안전망 -->
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
              @click="toggleAluMf"
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

    <!-- 상세 옵션 2: 핸들 -->
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
                @click="toggleInsdHndlH"
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
                @click="toggleOusdHndlH"
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

    <!-- 상세 옵션 3: 유리 -->
    <details class="card" v-if="hasAnyGlas">
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

    <!-- 비고 -->
    <div class="card">
      <div class="field">
        <label>견적비고</label>
        <textarea v-model="form.remSrc" rows="2" />
      </div>
    </div>

    <!-- readonly: 조회 모드 -->
    <div v-if="isReadonly" class="card card-info">
      <div class="text-xs">이 견적은 현재 수정할 수 없는 상태입니다.</div>
    </div>

    <!-- 저장/추가 버튼 (편집 가능할 때만) -->
    <template v-else-if="!savedSeq">
      <div class="row-flex">
        <button class="btn" :disabled="loading || !canSubmit" @click="submit">
          {{ loading ? '저장 중...' : isEditMode ? '수정 저장' : '샤시 견적 저장' }}
        </button>
        <button v-if="isEditMode" class="btn accent" :disabled="loading || !canSubmit" @click="submitAndAdd">
          {{ loading ? '저장 중...' : '저장 + 추가' }}
        </button>
      </div>
    </template>

    <!-- 저장 성공 후 선택 -->
    <div v-if="savedSeq" class="card card-success">
      <div class="fw-700 mb-sm">샤시 견적 저장 완료 (#{{ savedSeq }})</div>
      <div class="row-flex">
        <button class="btn accent" @click="addAnother">+ 샤시 추가</button>
        <button class="btn secondary" @click="goBack">목록으로</button>
      </div>
    </div>

    <div v-if="error" class="card card-error">{{ error }}</div>

    <ModelSearchModal ref="modelModal" @select="onModelPick" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModelSearchModal from '../components/ModelSearchModal.vue'
import { saveSashEsti, searchColorList, searchModelSf, searchGlasList, searchCodeList, searchModelWintydi, searchSashOrdTypCd, selectSashDetail } from '../api/estimate'

const route = useRoute()
const router = useRouter()
const modelModal = ref(null)

const itgEstiNo = ref(route.query.itgEstiNo || '')
const wEstiNo = ref(route.query.wEstiNo || '')
const editEstiSeq = ref(route.query.estiSeq || '')
const isEditMode = computed(() => !!editEstiSeq.value)
const isReadonly = computed(() => route.query.readonly === 'Y')

const wintydiList = ref([])
const wintydiMap = ref({})
const ventAllList = ref([])
const screenAllList = ref([])
const handleAllList = ref([])
const ordTypList = ref([])
const colorList = ref([])
const pickedMdlMtrlCo = ref('')

const form = ref({
  mdlCd: '', mdlNm: '', wintydiCd: '', mtrlCoNm: '',
  bftydiCd: '', sizCd: '', bsmfOrdUtmCd: '',
  w: null, h: null, qty: 1,
  w1: null, w2: null, w3: null, w4: null, w5: null,
  h1: null, h2: null, h3: null, h4: null, h5: null,
  cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  crtnColrCd: 'WH',
  insdColrCd: '', ousdColrCd: '',
  insdSf: '', ousdSf: '',
  sashOrdTypCd: '',
  ventLoc: '', screenType: '',
  isAluMf: false,
  slcnFnshYn: false,
  insdHandleType: '', ousdHandleType: '',
  insdHndlHEnabled: false, ousdHndlHEnabled: false,
  insdHndlH: null, ousdHndlH: null,
  mtrlCds1: '', mtrlCds2: '', mtrlCds3: '', mtrlCds4: '',
  remSrc: '',
})

const insdSfList = ref([])
const ousdSfList = ref([])
const glas = ref({ sfIn: [], sfOut: [], bfIn: [], bfOut: [] })

const loading = ref(false)
const pageLoading = ref(false)
const error = ref('')
const savedSeq = ref('')
const syncOusd = ref(true)

const modelDisplay = computed(() => (form.value.mdlCd ? `${form.value.mdlNm} (${form.value.mdlCd})` : ''))

const cntInfo = computed(() => wintydiMap.value[form.value.wintydiCd] || {})
const cntW = computed(() => Number(cntInfo.value.cntW) || 0)
const cntH = computed(() => Number(cntInfo.value.cntH) || 0)
const cntCS = computed(() => Number(cntInfo.value.cntCS) || 0)

const ventOptions = computed(() =>
  ventAllList.value.filter((v) => v.addInfo1 === '30' && v.addInfo2 === form.value.wintydiCd)
)

const screenOptions = computed(() => {
  const target = form.value.isAluMf ? 'ALU' : 'PVC'
  return screenAllList.value.filter((s) => s.addInfo4 === target)
})

const handleOptions = computed(() => {
  const isCheckMtrlCo = ['HC', 'HW', 'LX'].includes(pickedMdlMtrlCo.value)
  return handleAllList.value.filter((h) => isCheckMtrlCo || h.addInfo7 !== 'Y')
})

const hasAnyGlas = computed(() => glas.value.sfIn.length || glas.value.sfOut.length || glas.value.bfIn.length || glas.value.bfOut.length)

const canSubmit = computed(
  () =>
    !!itgEstiNo.value && !!form.value.mdlCd && !!form.value.wintydiCd &&
    !!form.value.w && !!form.value.h && !!form.value.qty &&
    !!form.value.insdColrCd && !!form.value.insdSf &&
    (!ousdSfList.value.length || !!form.value.ousdSf)
)

onMounted(async () => {
  if (isEditMode.value) {
    pageLoading.value = true
    try {
      sessionStorage.removeItem('mobile_sash_edit_row')
      const payload = {
        itgEstiNo: itgEstiNo.value,
        estiNo: wEstiNo.value,
        estiNos: route.query.estiNos || '1',
        estiSeq: String(editEstiSeq.value),
      }
      const { data } = await selectSashDetail(payload)
      let r = data?.resultData

      if (r) {
        const pick = (...keys) => {
          for (const k of keys) {
            if (r[k] != null && r[k] !== '') return r[k]
          }
          return null
        }
        r.wSize = pick('wSize', 'WSize', 'w_size', 'W_SIZE')
        r.hSize = pick('hSize', 'HSize', 'h_size', 'H_SIZE')
        r.w1Size = pick('w1Size', 'W1Size')
        r.w2Size = pick('w2Size', 'W2Size')
        r.w3Size = pick('w3Size', 'W3Size')
        r.w4Size = pick('w4Size', 'W4Size')
        r.w5Size = pick('w5Size', 'W5Size')
        r.h1Size = pick('h1Size', 'H1Size')
        r.h2Size = pick('h2Size', 'H2Size')
        r.h3Size = pick('h3Size', 'H3Size')
        r.h4Size = pick('h4Size', 'H4Size')
        r.h5Size = pick('h5Size', 'H5Size')
        Object.assign(form.value, {
          mdlCd: r.mdlCd || '',
          mdlNm: r.mdlNm || '',
          wintydiCd: r.wintydiCd || '',
          mtrlCoNm: r.mtrlCoNm || '',
          bftydiCd: r.bftydiCd || '',
          sizCd: r.sizCd || '',
          bsmfOrdUtmCd: r.bsmfOrdUtmCd || '',
          sashOrdTypCd: r.sashOrdTypCd || '',
          w: r.wSize ? Number(r.wSize) : null,
          h: r.hSize ? Number(r.hSize) : null,
          qty: r.qty ? Number(r.qty) : 1,
          w1: r.w1Size ? Number(r.w1Size) : null,
          w2: r.w2Size ? Number(r.w2Size) : null,
          w3: r.w3Size ? Number(r.w3Size) : null,
          w4: r.w4Size ? Number(r.w4Size) : null,
          w5: r.w5Size ? Number(r.w5Size) : null,
          h1: r.h1Size ? Number(r.h1Size) : null,
          h2: r.h2Size ? Number(r.h2Size) : null,
          h3: r.h3Size ? Number(r.h3Size) : null,
          h4: r.h4Size ? Number(r.h4Size) : null,
          h5: r.h5Size ? Number(r.h5Size) : null,
          cs: r.csSize ? Number(r.csSize) : null,
          cs1: r.cs1Size ? Number(r.cs1Size) : null,
          cs2: r.cs2Size ? Number(r.cs2Size) : null,
          insdColrCd: r.insdColrCd || '',
          ousdColrCd: r.ousdColrCd || '',
          insdSf: r.insdSf || '',
          ousdSf: r.ousdSf || '',
          ventLoc: r.ventLoc || '',
          screenType: r.screenType || '',
          insdHandleType: r.insdHandleType || '',
          ousdHandleType: r.ousdHandleType || '',
          mtrlCds1: r.mtrlCds1 || r.insdSfGlasMtrlCd || '',
          mtrlCds2: r.mtrlCds2 || r.ousdSfGlasMtrlCd || '',
          mtrlCds3: r.mtrlCds3 || r.insdBfGlasMtrlCd || '',
          mtrlCds4: r.mtrlCds4 || r.ousdBfGlasMtrlCd || '',
          remSrc: r.remSrc || '',
        })
        if (r.mdlCd) await onModelPick({ ...r })
      }
    } catch (e) {
      error.value = '편집 데이터 로드 실패: ' + (e.message || '')
    }
  }

  try {
    const [colorRes, ventRes, screenRes, handleRes, ordRes] = await Promise.all([
      searchColorList(),
      searchCodeList('48'),
      searchCodeList('379'),
      searchCodeList('378'),
      searchSashOrdTypCd(),
    ])
    const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))
    colorList.value = normCd(colorRes.data?.resultList)
    ventAllList.value = normCd(ventRes.data?.resultList)
    screenAllList.value = normCd(screenRes.data?.resultList)
    handleAllList.value = normCd(handleRes.data?.resultList)
    ordTypList.value = normCd(ordRes.data?.resultList).filter((c) => c.addInfo2 === 'Y')
    if (ordTypList.value.length && !form.value.sashOrdTypCd) {
      form.value.sashOrdTypCd = ordTypList.value[0].commCdId
    }
  } catch (e) {
    error.value = '코드 마스터 로드 실패: ' + (e.message || '')
  } finally {
    pageLoading.value = false
  }
})

async function onModelPick(row) {
  form.value.mdlCd = row.mdlCd || ''
  form.value.mdlNm = row.mdlNm || ''
  form.value.mtrlCoNm = row.mtrlCoNm || ''
  form.value.bftydiCd = row.bftydiCd || ''
  form.value.sizCd = row.sizCd || ''
  form.value.bsmfOrdUtmCd = row.bsmfOrdUtmCd || ''
  pickedMdlMtrlCo.value = row.mtrlCo || ''

  try {
    const { data } = await searchModelWintydi(row.mdlCd)
    const list = (data?.resultList || []).map((it) => ({
      commCdId: it.commCdVal || it.commCdId,
      commCdNm: it.commCdNm,
      addInfo1: it.addInfo1, addInfo2: it.addInfo2, addInfo3: it.addInfo3,
    }))
    wintydiList.value = list
    const map = {}
    for (const it of list) map[it.commCdId] = { cntW: it.addInfo1, cntH: it.addInfo2, cntCS: it.addInfo3 }
    wintydiMap.value = map
    const rowWin = row.wintydiCd
    form.value.wintydiCd = (rowWin && map[rowWin]) ? rowWin : (list[0]?.commCdId ?? '')
  } catch (e) {
    wintydiList.value = []
    wintydiMap.value = {}
    form.value.wintydiCd = ''
  }

  Object.assign(form.value, {
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  })

  try {
    const [sfRes, glasRes] = await Promise.all([
      searchModelSf(row.mdlCd).catch(() => ({ data: {} })),
      searchGlasList({
        searchMdlCd: row.mdlCd,
        searchItgEstiNo: itgEstiNo.value,
        searchEstiNo: wEstiNo.value,
        searchEstiNos: '1',
        searchEstiSeq: '1',
      }).catch(() => ({ data: {} })),
    ])
    insdSfList.value = sfRes.data?.insdSf || sfRes.data?.resultList || []
    ousdSfList.value = sfRes.data?.ousdSf || sfRes.data?.resultList3 || []
    // 편집 모드에서 기존 SF자재 유지
    if (!form.value.insdSf || !insdSfList.value.some(s => s.mtrlProdCd === form.value.insdSf)) {
      if (insdSfList.value.length) form.value.insdSf = insdSfList.value[0].mtrlProdCd
    }
    if (ousdSfList.value.length) {
      if (!form.value.ousdSf || !ousdSfList.value.some(s => s.mtrlProdCd === form.value.ousdSf)) {
        form.value.ousdSf = ousdSfList.value[0].mtrlProdCd
      }
    } else {
      form.value.ousdSf = ''
    }

    glas.value = {
      sfIn: glasRes.data?.resultList || [],
      sfOut: glasRes.data?.resultList3 || [],
      bfIn: glasRes.data?.resultList5 || [],
      bfOut: glasRes.data?.resultList7 || [],
    }
    if (glas.value.sfIn.length)  form.value.mtrlCds1 = glas.value.sfIn[0].mtrlCd
    if (glas.value.sfOut.length) form.value.mtrlCds2 = glas.value.sfOut[0].mtrlCd
    if (glas.value.bfIn.length)  form.value.mtrlCds3 = glas.value.bfIn[0].mtrlCd
    if (glas.value.bfOut.length) form.value.mtrlCds4 = glas.value.bfOut[0].mtrlCd
  } catch (e) {}

  form.value.crtnColrCd = 'WH'
  if (colorList.value.length) {
    const def = colorList.value[0].commCdId
    // 편집 모드에서 기존 색상 유지
    if (!form.value.insdColrCd || !colorList.value.some(c => c.commCdId === form.value.insdColrCd)) {
      form.value.insdColrCd = def
    }
    if (!form.value.ousdColrCd || !colorList.value.some(c => c.commCdId === form.value.ousdColrCd)) {
      form.value.ousdColrCd = def
    }
    syncOusd.value = form.value.insdColrCd === form.value.ousdColrCd
  }

  // ventAllList가 아직 로드 안 됐으면 여기서 직접 로드
  if (!ventAllList.value.length) {
    try {
      const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))
      const [ventRes, screenRes] = await Promise.all([
        searchCodeList('48'),
        searchCodeList('379'),
      ])
      ventAllList.value = normCd(ventRes.data?.resultList)
      screenAllList.value = normCd(screenRes.data?.resultList)
    } catch (_) {}
  }

  applyVentDefault()
  applyScreenDefault()

  if (!handleAllList.value.length) {
    try {
      const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))
      const handleRes = await searchCodeList('378')
      handleAllList.value = normCd(handleRes.data?.resultList)
    } catch (_) {}
  }
  applyHandleDefault()
}

function applyHandleDefault() {
  const opts = handleOptions.value
  const first = opts.length ? opts[0].commCdId : ''
  // 기존 값이 옵션에 있으면 유지, 없으면 첫 번째로 세팅
  if (!form.value.insdHandleType || !opts.some(o => o.commCdId === form.value.insdHandleType)) {
    form.value.insdHandleType = first
  }
  if (!form.value.ousdHandleType || !opts.some(o => o.commCdId === form.value.ousdHandleType)) {
    form.value.ousdHandleType = first
  }
}

function onWintydiChange() {
  Object.assign(form.value, {
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  })
  applyVentDefault()
}

function applyVentDefault() {
  const opts = ventOptions.value
  if (!form.value.ventLoc || !opts.some(o => o.commCdId === form.value.ventLoc)) {
    form.value.ventLoc = opts.length ? opts[0].commCdId : ''
  }
}
function applyScreenDefault() {
  const opts = screenOptions.value
  if (!form.value.screenType || !opts.some(o => o.commCdId === form.value.screenType)) {
    form.value.screenType = opts.length ? opts[0].commCdId : ''
  }
}

function toggleAluMf() {
  form.value.isAluMf = !form.value.isAluMf
  applyScreenDefault()
}

function toggleInsdHndlH() {
  form.value.insdHndlHEnabled = !form.value.insdHndlHEnabled
  if (!form.value.insdHndlHEnabled) form.value.insdHndlH = null
}
function toggleOusdHndlH() {
  form.value.ousdHndlHEnabled = !form.value.ousdHndlHEnabled
  if (!form.value.ousdHndlHEnabled) form.value.ousdHndlH = null
}

function onInsdColorChange() {
  if (syncOusd.value) form.value.ousdColrCd = form.value.insdColrCd
}
function onOusdColorChange() {
  syncOusd.value = form.value.ousdColrCd === form.value.insdColrCd
}

function goBack() {
  router.push(`/estimates/${itgEstiNo.value}`)
}

function addAnother() {
  savedSeq.value = ''
  error.value = ''
  editEstiSeq.value = ''
  Object.assign(form.value, {
    w: null, h: null, qty: 1,
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
    remSrc: '',
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitAndAdd() {
  await submit()
  if (savedSeq.value) addAnother()
}

async function submit() {
  error.value = ''
  savedSeq.value = ''

  if (!itgEstiNo.value) return (error.value = '통합견적번호가 없습니다')
  if (!form.value.mdlCd) return (error.value = '모형을 선택하세요')
  if (!form.value.wintydiCd) return (error.value = '창형태를 선택하세요')
  if (!form.value.w || !form.value.h) return (error.value = 'W/H 사이즈를 입력하세요')
  if (!form.value.qty || form.value.qty < 1) return (error.value = '수량을 1 이상으로 입력하세요')
  if (!form.value.insdColrCd) return (error.value = '내부 색상을 선택하세요')
  if (!form.value.insdSf) return (error.value = 'SF내 자재를 선택하세요')
  if (ousdSfList.value.length && !form.value.ousdSf) return (error.value = 'SF외 자재를 선택하세요')

  loading.value = true
  try {
    const f = form.value
    const s = (v) => (v == null || v === '' ? '' : String(v))
    const payload = {
      itgEstiNo: itgEstiNo.value,
      estiNo: wEstiNo.value,
      estiNos: route.query.estiNos || '1',
      estiSeq: editEstiSeq.value || '',

      mdlCd: f.mdlCd,
      wintydiCd: f.wintydiCd,
      bftydiCd: f.bftydiCd,
      sizCd: f.sizCd,
      bsmfOrdUtmCd: f.bsmfOrdUtmCd,
      sashOrdTypCd: f.sashOrdTypCd,

      w0Size: s(f.w),
      h0Size: s(f.h),
      qty: s(f.qty),
      w1Size: s(f.w1), w2Size: s(f.w2), w3Size: s(f.w3), w4Size: s(f.w4), w5Size: s(f.w5),
      h1Size: s(f.h1), h2Size: s(f.h2), h3Size: s(f.h3), h4Size: s(f.h4), h5Size: s(f.h5),
      csSize: s(f.cs), cs1Size: s(f.cs1), cs2Size: s(f.cs2),
      cs3Size: s(f.cs3), cs4Size: s(f.cs4), cs5Size: s(f.cs5),

      crtnColrCd: 'WH',
      insdColrCd: f.insdColrCd,
      ousdColrCd: f.ousdColrCd || f.insdColrCd,

      insdSf: f.insdSf,
      ousdSf: f.ousdSf,
      ventLoc: f.ventLoc || '',
      screenType: f.screenType,
      aluMfYn: f.isAluMf ? 'Y' : 'N',
      bfSlcnFnshYn: f.slcnFnshYn ? 'Y' : 'N',

      insdHandleType: f.insdHandleType,
      ousdHandleType: f.ousdHandleType,
      insdHndlH: s(f.insdHndlH),
      ousdHndlH: s(f.ousdHndlH),

      mtrlCds1: f.mtrlCds1, mtrlCds2: f.mtrlCds2,
      mtrlCds3: f.mtrlCds3, mtrlCds4: f.mtrlCds4,

      remSrc: f.remSrc,
    }
    // ventLoc이 비면 첫 번째 VENT 옵션으로 자동 채움 (STEP1 프로시저 NULL 방지)
    if (!payload.ventLoc && ventOptions.value.length) {
      payload.ventLoc = ventOptions.value[0].commCdId
      form.value.ventLoc = payload.ventLoc
    }
    const { data } = await saveSashEsti(payload)
    if (data.resultCd === 'save.ok' || data.resultCd === 'save.success' || data.resultCd === 'procedure complete') {
      savedSeq.value = data.estiSeq || '저장됨'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      error.value = `저장 실패\nresultCd: ${data.resultCd}\nmessage: ${data.resultMessage || '(없음)'}\nresponse: ${JSON.stringify(data, null, 2)}`
    }
  } catch (e) {
    error.value = `예외 발생\n${e.message || ''}\n${JSON.stringify(e?.response?.data, null, 2)}`
  } finally {
    loading.value = false
  }
}
</script>
