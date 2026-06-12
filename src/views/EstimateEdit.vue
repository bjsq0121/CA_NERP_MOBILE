<template>
  <div class="estimate-edit-page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">견적 헤더 수정</h2>
        <p class="page-subtitle">현장 영업용 핵심 헤더 정보만 수정합니다</p>
      </div>
      <div class="title-actions">
        <button class="btn-back" @click="router.back()">뒤로</button>
      </div>
    </div>

    <div v-if="loading" class="empty">견적 헤더 불러오는 중...</div>
    <div v-else-if="!headerLoaded" class="empty">견적 헤더를 찾을 수 없습니다.</div>

    <template v-else>
      <div v-if="!canSave" class="card card-info">
        <div class="text-xs">현재 상태에서는 견적 헤더를 수정할 수 없습니다. 상태 20 이상 또는 상태 미확인 견적은 상세 확인만 가능합니다.</div>
      </div>

      <div class="card">
        <div class="form-section-title">영업소/거래처</div>
        <div class="row-flex">
          <div class="field">
            <label>영업소</label>
            <div class="readonly-display">{{ form.bzpcNm || form.bzpc || '-' }}</div>
          </div>
          <div class="field">
            <label>거래처</label>
            <div class="readonly-display">{{ form.dplcNm || form.dplcCd || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">견적 기본정보</div>
        <div class="field">
          <label>견적제목 *</label>
          <input ref="titleInput" v-model="form.itgEstiNm" :disabled="!canSave" />
        </div>
        <div class="row-flex">
          <div class="field">
            <label>견적유효일 *</label>
            <input v-model="form.estiVldDt" type="date" :disabled="!canSave" />
          </div>
          <div class="field">
            <label>납품예정일</label>
            <input v-model="form.delivryDt" type="date" :disabled="!canSave" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">담당자</div>
        <div class="field">
          <label>담당자</label>
          <input v-model="form.dplcCrgrNm" :disabled="!canSave" />
        </div>
        <div class="row-flex">
          <div class="field">
            <label>담당자 전화번호</label>
            <input v-model="form.dplcCrgrTel" :disabled="!canSave" />
          </div>
          <div class="field">
            <label>담당자 휴대폰</label>
            <input v-model="form.dplcCrgrMobile" :disabled="!canSave" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">견적 할인등급</div>
        <div class="grade-edit-grid">
          <div v-for="item in normalGradeItems" :key="item.field" class="field">
            <label>{{ item.label }}</label>
            <select v-model="form.dplcGrpGrade[item.field]" :disabled="!canSave">
              <option value="">선택</option>
              <option v-for="option in item.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="card-info text-xs">
          할인등급 변경은 견적헤더 기준값을 수정합니다. 이미 등록된 품목의 금액은 자동 재계산되지 않으며, 신규 품목부터 기본값으로 적용됩니다.
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">현장/배송정보</div>
        <div class="field">
          <label>현장명</label>
          <input v-model="form.jobsNm" :disabled="!canSave" />
        </div>
        <div class="field">
          <label>고객요청 비고</label>
          <textarea v-model="form.dplcReqRemSrc" rows="2" :disabled="!canSave" />
        </div>
        <div class="field">
          <label>배송지점</label>
          <select v-model="form.headerSaveDvpc" :disabled="!canSave || loadingDvpc" @change="selectHeaderDvpc">
            <option value="">선택</option>
            <option v-for="option in dvpcOptions" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>주소</label>
          <input v-model="form.adr1" :disabled="!canSave" />
        </div>
        <div class="field">
          <label>상세주소</label>
          <input v-model="form.adr2" :disabled="!canSave" />
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">주문/인수 정보</div>
        <div class="field">
          <label>주문자 / 연락처</label>
          <input v-model="form.ordrInfo" :disabled="!canSave" />
        </div>
        <div class="field">
          <label>인수자 / 연락처</label>
          <input v-model="form.unprInfo" :disabled="!canSave" />
        </div>
      </div>

      <div class="card">
        <div class="form-section-title">비고</div>
        <div class="field">
          <label>비고</label>
          <textarea v-model="form.remSrc" rows="2" :disabled="!canSave" />
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="result" class="success-msg">{{ result }}</div>
      <div class="bottom-action-spacer"></div>
      <div v-if="canSave" class="bottom-action-bar">
        <button class="btn accent" :disabled="saving" @click="submit">
          {{ saving ? '저장 중...' : '헤더 저장' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchClientGradeOptions } from '../api/client'
import { saveEstiHeader, selectEstiHeader, searchDvpcCode, searchDvpcListSysAdmin } from '../api/estimate'
import { buildClientGradeOptionGroups } from '../utils/clientGradeOptions'
import { UNKNOWN_STATUS, resolveEffectiveStatus } from '../utils/estimateStatus'

const route = useRoute()
const router = useRouter()
const itgEstiNo = String(route.params.itgEstiNo || '')

const loading = ref(false)
const saving = ref(false)
const loadingDvpc = ref(false)
const error = ref('')
const result = ref('')
const headerLoaded = ref(false)
const originalHeader = ref({})
const dvpcOptions = ref([])
const dvpcYn = ref('')
const gradeGroups = ref(buildClientGradeOptionGroups({ resultList: [], resultListCross: [] }))
const headerStatus = ref(UNKNOWN_STATUS)
const titleInput = ref(null)
const canSave = computed(() => ['0', '10'].includes(headerStatus.value))

const form = ref({
  itgEstiNm: '',
  estiVldDt: '',
  delivryDt: '',
  jobsNm: '',
  dplcReqRemSrc: '',
  dplcCrgrNm: '',
  dplcCrgrTel: '',
  dplcCrgrMobile: '',
  headerSaveDvpc: '',
  headerBasicDvpc: '',
  adr1: '',
  adr2: '',
  ordrInfo: '',
  unprInfo: '',
  remSrc: '',
  bzpc: '',
  bzpcNm: '',
  dplcCd: '',
  dplcNm: '',
  dplcGrpGrade: {
    dplcDcGrd: '',
    dplcDcGrdDoor: '',
    dplcDcGrdPannel: '',
    dplcDcGrdOtherComp: '',
    dplcDcGrdGlas: '',
    dplcDcGrdMold: '',
    dplcDcGrdDtbtMtrl: '',
    dplcDcGrdDtbtGoods: '',
  },
  dplcRate: {
    dplcRt: '',
    dplcDoorRt: '',
    dplcPannelRt: '',
    dplcOtherCompRt: '',
    dplcGlasRt: '',
    dplcMoldRt: '',
    dplcDtbtMtrlRt: '',
    dplcDtbtGoodsRt: '',
  },
})

const ESTIMATE_GRADE_ITEMS = [
  { field: 'dplcDcGrd', rateField: 'dplcRt', label: '샤시 *', groupKey: 'sash' },
  { field: 'dplcDcGrdDoor', rateField: 'dplcDoorRt', label: '도어', groupKey: 'door' },
  { field: 'dplcDcGrdPannel', rateField: 'dplcPannelRt', label: '판넬', groupKey: 'panel' },
  { field: 'dplcDcGrdOtherComp', rateField: 'dplcOtherCompRt', label: '타사', groupKey: 'tasa' },
  { field: 'dplcDcGrdGlas', rateField: 'dplcGlasRt', label: '알유리', groupKey: 'glass' },
  { field: 'dplcDcGrdMold', rateField: 'dplcMoldRt', label: '몰딩', groupKey: 'molding' },
  { field: 'dplcDcGrdDtbtMtrl', rateField: 'dplcDtbtMtrlRt', label: '유통자재', groupKey: 'material' },
  { field: 'dplcDcGrdDtbtGoods', rateField: 'dplcDtbtGoodsRt', label: '유통상품', groupKey: 'product' },
]

const normalGradeItems = computed(() => {
  const normal = gradeGroups.value.normal
  return ESTIMATE_GRADE_ITEMS.map((item) => ({ ...item, options: normal[item.groupKey] || [] }))
})

function stringValue(value) {
  return String(value ?? '').trim()
}

function toDateInput(value) {
  const text = stringValue(value).replace(/[-/.]/g, '')
  if (text.length >= 8) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  return stringValue(value).slice(0, 10)
}

function datePayload(value) {
  return stringValue(value).replace(/-/g, '')
}

function firstValue(row, ...keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (value != null && value !== '') return value
  }
  return ''
}

async function focusTitleInput() {
  await nextTick()
  titleInput.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  titleInput.value?.focus?.({ preventScroll: true })
}

async function loadGradeOptions() {
  try {
    const { data } = await searchClientGradeOptions()
    gradeGroups.value = buildClientGradeOptionGroups(data || {})
  } catch (_) {
    gradeGroups.value = buildClientGradeOptionGroups({ resultList: [], resultListCross: [] })
  }
}

function mapHeaderGrade(row = {}) {
  return {
    dplcDcGrd: stringValue(firstValue(row, 'dplcDcGrd', 'dcGrd')),
    dplcDcGrdDoor: stringValue(firstValue(row, 'dplcDcGrdDoor', 'dcGrdDoor')),
    dplcDcGrdPannel: stringValue(firstValue(row, 'dplcDcGrdPannel', 'dcGrdPannel')),
    dplcDcGrdOtherComp: stringValue(firstValue(row, 'dplcDcGrdOtherComp', 'dcGrdOtherComp', 'dcGrdEtc')),
    dplcDcGrdGlas: stringValue(firstValue(row, 'dplcDcGrdGlas', 'dcGrdGlas')),
    dplcDcGrdMold: stringValue(firstValue(row, 'dplcDcGrdMold', 'dcGrdMold', 'dcGrdMlng')),
    dplcDcGrdDtbtMtrl: stringValue(firstValue(row, 'dplcDcGrdDtbtMtrl', 'dcGrdDtbtMtrl', 'dcGrdMtrl')),
    dplcDcGrdDtbtGoods: stringValue(firstValue(row, 'dplcDcGrdDtbtGoods', 'dcGrdDtbtGoods', 'dcGrdProd')),
  }
}

function mapHeaderRate(row = {}) {
  return {
    dplcRt: stringValue(firstValue(row, 'dplcRt')),
    dplcDoorRt: stringValue(firstValue(row, 'dplcDoorRt')),
    dplcPannelRt: stringValue(firstValue(row, 'dplcPannelRt')),
    dplcOtherCompRt: stringValue(firstValue(row, 'dplcOtherCompRt', 'dplcEtcRt')),
    dplcGlasRt: stringValue(firstValue(row, 'dplcGlasRt')),
    dplcMoldRt: stringValue(firstValue(row, 'dplcMoldRt', 'dplcMlngRt')),
    dplcDtbtMtrlRt: stringValue(firstValue(row, 'dplcDtbtMtrlRt', 'dplcMtrlRt')),
    dplcDtbtGoodsRt: stringValue(firstValue(row, 'dplcDtbtGoodsRt', 'dplcProdRt')),
  }
}

function mapHeaderToForm(row = {}) {
  Object.assign(form.value, {
    itgEstiNm: stringValue(row.itgEstiNm),
    estiVldDt: toDateInput(row.estiVldDt),
    delivryDt: toDateInput(row.delivryDt),
    jobsNm: stringValue(row.jobsNm),
    dplcReqRemSrc: stringValue(row.dplcReqRemSrc),
    dplcCrgrNm: stringValue(row.dplcCrgrNm),
    dplcCrgrTel: stringValue(row.dplcCrgrTel),
    dplcCrgrMobile: stringValue(row.dplcCrgrMobile),
    headerSaveDvpc: stringValue(firstValue(row, 'headerSaveDvpc', 'dvpc')),
    headerBasicDvpc: stringValue(firstValue(row, 'headerBasicDvpc', 'dvpc')),
    adr1: stringValue(row.adr1),
    adr2: stringValue(row.adr2),
    ordrInfo: stringValue(row.ordrInfo),
    unprInfo: stringValue(row.unprInfo),
    remSrc: stringValue(row.remSrc),
    bzpc: stringValue(row.bzpc),
    bzpcNm: stringValue(row.bzpcNm),
    dplcCd: stringValue(row.dplcCd),
    dplcNm: stringValue(row.dplcNm),
    dplcGrpGrade: mapHeaderGrade(row),
    dplcRate: mapHeaderRate(row),
  })
}

function buildEstimateGradePayload(grades = {}) {
  return {
    dplcDcGrd: stringValue(grades.dplcDcGrd),
    dplcDcGrdDoor: stringValue(grades.dplcDcGrdDoor),
    dplcDcGrdPannel: stringValue(grades.dplcDcGrdPannel),
    dplcDcGrdOtherComp: stringValue(grades.dplcDcGrdOtherComp),
    dplcDcGrdGlas: stringValue(grades.dplcDcGrdGlas),
    dplcDcGrdMold: stringValue(grades.dplcDcGrdMold),
    dplcDcGrdDtbtMtrl: stringValue(grades.dplcDcGrdDtbtMtrl),
    dplcDcGrdDtbtGoods: stringValue(grades.dplcDcGrdDtbtGoods),
  }
}

function selectedGradeRate(item, gradeValue, fallbackRates = {}) {
  const option = (item.options || []).find((candidate) => candidate.value === gradeValue)
  return stringValue(option?.rate || fallbackRates[item.rateField])
}

function buildEstimateRatePayload(grades = {}, fallbackRates = {}) {
  return normalGradeItems.value.reduce((payload, item) => {
    payload[item.rateField] = selectedGradeRate(item, grades[item.field], fallbackRates)
    return payload
  }, {})
}

function validateEstimateGrades(grades = {}) {
  for (const item of normalGradeItems.value) {
    if (!stringValue(grades[item.field])) return `${item.label.replace(' *', '')} 할인등급을 선택하세요`
  }
  return ''
}

function validateEstimateRates(rates = {}) {
  for (const item of normalGradeItems.value) {
    if (!stringValue(rates[item.rateField])) return `${item.label.replace(' *', '')} 할인율을 확인하세요`
  }
  return ''
}

function normalizeDvpcOptions(data) {
  const rows = Array.isArray(data) ? data : Array.isArray(data?.resultList) ? data.resultList : []
  return rows
    .map((row) => ({
      text: stringValue(row.dvpcNm || row.text),
      value: stringValue(row.dvpc || row.value),
    }))
    .filter((option) => option.value)
}

function setHeaderDvpc(value, forceBasic = false) {
  const next = stringValue(value)
  form.value.headerSaveDvpc = next
  form.value.headerBasicDvpc = forceBasic || dvpcYn.value === 'Y' ? next : ''
}

function selectHeaderDvpc() {
  setHeaderDvpc(form.value.headerSaveDvpc, true)
}

async function loadDeliveryBranches() {
  if (!form.value.bzpc) return
  loadingDvpc.value = true
  try {
    const listResponse = await searchDvpcListSysAdmin({ bzpc: form.value.bzpc })
    dvpcOptions.value = normalizeDvpcOptions(listResponse.data)

    const codeResponse = await searchDvpcCode({ bzpc: form.value.bzpc })
    const resultList = codeResponse.data?.resultList || {}
    dvpcYn.value = stringValue(resultList.dvpcYn)

    if (!form.value.headerSaveDvpc) {
      const defaultDvpc = stringValue(resultList.dvpc)
      if (defaultDvpc && defaultDvpc !== 'N') setHeaderDvpc(defaultDvpc, dvpcYn.value === 'Y')
    }
  } catch (_) {
    dvpcOptions.value = []
    dvpcYn.value = ''
  } finally {
    loadingDvpc.value = false
  }
}

async function loadHeader() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await selectEstiHeader(itgEstiNo)
    const row = data?.resultData || null
    if (!row) return

    originalHeader.value = row
    headerStatus.value = resolveEffectiveStatus(row.stCd, row.igStCd)
    mapHeaderToForm(row)
    headerLoaded.value = true
    await loadDeliveryBranches()
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '견적 헤더 조회 실패'
  } finally {
    loading.value = false
  }
}

function buildPayload() {
  const ratePayload = buildEstimateRatePayload(form.value.dplcGrpGrade, form.value.dplcRate)
  return {
    itgEstiNo: itgEstiNo,
    itgEstiNm: stringValue(form.value.itgEstiNm),
    estiVldDt: datePayload(form.value.estiVldDt),
    delivryDt: datePayload(form.value.delivryDt),
    jobsNm: stringValue(form.value.jobsNm),
    dplcReqRemSrc: stringValue(form.value.dplcReqRemSrc),
    dplcCrgrNm: stringValue(form.value.dplcCrgrNm),
    dplcCrgrTel: stringValue(form.value.dplcCrgrTel),
    dplcCrgrMobile: stringValue(form.value.dplcCrgrMobile),
    headerSaveDvpc: stringValue(form.value.headerSaveDvpc),
    headerBasicDvpc: stringValue(form.value.headerBasicDvpc),
    dvpc: stringValue(form.value.headerSaveDvpc),
    adr1: stringValue(form.value.adr1),
    adr2: stringValue(form.value.adr2),
    ordrInfo: stringValue(form.value.ordrInfo),
    unprInfo: stringValue(form.value.unprInfo),
    remSrc: stringValue(form.value.remSrc),
    bzpc: stringValue(form.value.bzpc),
    bzpcNm: stringValue(form.value.bzpcNm),
    dplcCd: stringValue(form.value.dplcCd),
    dplcNm: stringValue(form.value.dplcNm),
    ...buildEstimateGradePayload(form.value.dplcGrpGrade),
    ...ratePayload,
    dplcGrpGrade: { ...form.value.dplcGrpGrade },
    dplcRate: ratePayload,
  }
}

async function submit() {
  error.value = ''
  result.value = ''

  if (!canSave.value) return (error.value = '현재 상태에서는 견적 헤더를 수정할 수 없습니다')
  if (!form.value.itgEstiNm) {
    error.value = '견적제목을 입력하세요'
    await focusTitleInput()
    return
  }
  if (!form.value.estiVldDt) return (error.value = '견적유효일을 선택하세요')
  const gradeError = validateEstimateGrades(form.value.dplcGrpGrade)
  if (gradeError) return (error.value = gradeError)
  const rateError = validateEstimateRates(buildEstimateRatePayload(form.value.dplcGrpGrade, form.value.dplcRate))
  if (rateError) return (error.value = rateError)
  if (dvpcYn.value === 'Y' && !form.value.headerSaveDvpc) return (error.value = '배송지점을 선택하세요')

  saving.value = true
  try {
    const payload = buildPayload()
    const { data } = await saveEstiHeader(payload)
    if (data.resultCd !== 'save.ok' && data.resultCd !== 'save.success') {
      error.value = data.resultMessage || '저장 실패'
      return
    }
    result.value = '저장 완료. 상세 화면으로 이동...'
    setTimeout(() => router.push(`/estimates/${itgEstiNo}`), 500)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '저장 실패'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadGradeOptions()
  await loadHeader()
})
</script>
