<template>
  <div class="estimate-new-page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">신규 견적</h2>
        <p class="page-subtitle">거래처 기본정보를 저장한 뒤 샤시 항목을 추가합니다</p>
      </div>
    </div>

    <div class="form-step-note">
      <strong>1/3 기본정보</strong>
      <span>거래처 선택 후 샤시 항목을 추가합니다</span>
    </div>

    <!-- 1. 영업소 + 견적 기본 -->
    <div class="card">
      <div class="form-section-title">영업소/견적 기본정보</div>
      <BzpcSelector v-model="selectedBzpc" :locked="bzpcLocked" />

      <div class="field">
        <label>견적제목 *</label>
        <input ref="titleInput" v-model="form.itgEstiNm" placeholder="견적 제목" />
      </div>

      <div class="row-flex">
        <div class="field">
          <label>견적유효일 *</label>
          <input v-model="form.estiVldDt" type="date" />
        </div>
        <div class="field">
          <label>납품예정일</label>
          <input v-model="form.delivryDt" type="date" />
        </div>
      </div>
    </div>

    <!-- 2. 거래처 -->
    <div class="card">
      <div class="form-section-title">거래처</div>
      <div class="field">
        <label>거래처 *</label>
        <input
          ref="dplcInput"
          readonly
          data-clickable
          :value="dplcDisplay"
          :placeholder="selectedBzpc.bzpc ? '터치해서 거래처 검색' : '먼저 영업소를 선택하세요'"
          :style="{ cursor: selectedBzpc.bzpc ? 'pointer' : 'not-allowed' }"
          @click="openDplcSearch"
        />
      </div>

      <template v-if="form.dplcCd">
        <div class="row-flex">
          <div class="field">
            <label>담당자</label>
            <input v-model="form.dplcCrgrNm" />
          </div>
          <div class="field">
            <label>담당자 휴대폰</label>
            <input v-model="form.dplcCrgrMobile" />
          </div>
        </div>
        <div class="row-flex">
          <div class="field">
            <label>담당자 전화번호</label>
            <input v-model="form.dplcCrgrTel" />
          </div>
          <div class="field">
            <label>월 신용한도</label>
            <input readonly :value="form.monCreditLimit ? Number(form.monCreditLimit).toLocaleString() + '원' : '-'" />
          </div>
        </div>

        <div class="form-subsection-title">견적 할인등급</div>
        <div class="grade-edit-grid">
          <div v-for="item in normalGradeItems" :key="item.field" class="field">
            <label>{{ item.label }}</label>
            <select v-model="form.dplcGrpGrade[item.field]">
              <option value="">선택</option>
              <option v-for="option in item.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </template>
    </div>

    <!-- 3. 현장 / 배송정보 -->
    <div class="card">
      <div class="form-section-title">현장/배송정보</div>
      <div class="field">
        <label>현장명</label>
        <input v-model="form.jobsNm" placeholder="현장명"/>
      </div>
      <div class="field">
        <label>고객요청 비고</label>
        <textarea v-model="form.dplcReqRemSrc" rows="2" />
      </div>
      <div class="field">
        <label>배송지점</label>
        <select v-model="form.headerSaveDvpc" :disabled="!selectedBzpc.bzpc || loadingDvpc" @change="selectHeaderDvpc">
          <option value="">선택</option>
          <option v-for="option in dvpcOptions" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>주소</label>
        <input v-model="form.adr1" placeholder="기본주소" />
      </div>
      <div class="field">
        <label>상세주소</label>
        <input v-model="form.adr2" />
      </div>
    </div>

    <!-- 4. 인수/주문자 -->
    <div class="card">
      <div class="form-section-title">주문/인수 정보</div>
      <div class="field">
        <label>주문자 / 연락처</label>
        <input v-model="form.ordrInfo" placeholder="주문자명 / 010-0000-0000" />
      </div>
      <div class="field">
        <label>인수자 / 연락처</label>
        <input v-model="form.unprInfo" />
      </div>
    </div>

    <!-- 5. 비고 -->
    <div class="card">
      <div class="form-section-title">비고</div>
      <div class="field">
        <label>비고</label>
        <textarea v-model="form.remSrc" rows="2" />
      </div>
    </div>

    <!-- 저장 -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="result" class="success-msg">{{ result }}</div>
    <div class="bottom-action-spacer"></div>
    <div class="bottom-action-bar">
      <button class="btn accent" :disabled="loading" @click="submit">
        {{ loading ? '저장 중...' : '견적 저장 후 샤시 추가' }}
      </button>
    </div>

    <DplcSearchModal
      ref="dplcModal"
      :bzpc="selectedBzpc.bzpc"
      :bzpc-nm="selectedBzpc.bzpcNm"
      @select="onDplcPick"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BzpcSelector from '../components/BzpcSelector.vue'
import DplcSearchModal from '../components/DplcSearchModal.vue'
import { searchClientGradeOptions } from '../api/client'
import { saveEstiHeader, searchDvpcCode, searchDvpcListSysAdmin } from '../api/estimate'
import { buildClientGradeOptionGroups } from '../utils/clientGradeOptions'
import { loadSelectedBzpc } from '../utils/selectedBzpcStorage'

const router = useRouter()

function today() { return new Date().toISOString().slice(0, 10) }
function plusDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const selectedBzpc = ref({ bzpc: '', bzpcNm: '' })
const bzpcLocked = ref(false)
const titleInput = ref(null)
const dplcInput = ref(null)

// 견적 목록에서 선택한 영업소가 있으면 고정
onMounted(async () => {
  await loadGradeOptions()
  const saved = loadSelectedBzpc()
  if (saved?.bzpc) {
    selectedBzpc.value = saved
    bzpcLocked.value = true
  }
})
const dplcModal = ref(null)
const loading = ref(false)
const loadingDvpc = ref(false)
const error = ref('')
const result = ref('')
const dvpcOptions = ref([])
const dvpcYn = ref('')
const gradeGroups = ref(buildClientGradeOptionGroups({ resultList: [], resultListCross: [] }))

const form = ref({
  itgEstiNm: '',
  estiVldDt: plusDays(7),
  delivryDt: today(),

  dplcCd: '',
  dplcNm: '',
  dplcCrgrNm: '',
  dplcCrgrTel: '',
  dplcCrgrMobile: '',
  monCreditLimit: '',
  headerSaveDvpc: '',
  headerBasicDvpc: '',
  adr1: '',
  adr2: '',

  jobsNm: '',
  dplcReqRemSrc: '',
  remSrc: '',
  ordrInfo: '',
  unprInfo: '',

  dplcGrpGrade: {
    dplcDcGrd: '', dplcDcGrdDoor: '', dplcDcGrdPannel: '', dplcDcGrdOtherComp: '',
    dplcDcGrdGlas: '', dplcDcGrdMold: '', dplcDcGrdDtbtMtrl: '', dplcDcGrdDtbtGoods: '',
  },
  dplcRate: {
    dplcRt: '', dplcDoorRt: '', dplcPannelRt: '', dplcOtherCompRt: '',
    dplcGlasRt: '', dplcMoldRt: '', dplcDtbtMtrlRt: '', dplcDtbtGoodsRt: '',
  },
})

const dplcDisplay = computed(() => (form.value.dplcCd ? `${form.value.dplcNm} (${form.value.dplcCd})` : ''))

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

watch(
  () => selectedBzpc.value.bzpc,
  async (next, prev) => {
    if (prev && next !== prev) clearDplc()
    await loadDeliveryBranches()
  }
)

function openDplcSearch() {
  if (!selectedBzpc.value.bzpc) return
  dplcModal.value?.open()
}

async function loadGradeOptions() {
  try {
    const { data } = await searchClientGradeOptions()
    gradeGroups.value = buildClientGradeOptionGroups(data || {})
  } catch (_) {
    gradeGroups.value = buildClientGradeOptionGroups({ resultList: [], resultListCross: [] })
  }
}

function clearDplc() {
  Object.assign(form.value, {
    dplcCd: '', dplcNm: '', dplcCrgrNm: '', dplcCrgrTel: '', dplcCrgrMobile: '',
    monCreditLimit: '', adr1: '', adr2: '', ordrInfo: '',
  })
  form.value.dplcGrpGrade = buildEmptyEstimateGrade()
  form.value.dplcRate = buildEmptyEstimateRate()
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

function matchBranchDvpcOption() {
  const branchName = stringValue(selectedBzpc.value.bzpcNm)
  if (!branchName) return null
  return dvpcOptions.value.find((option) => option.text === branchName) || null
}

function setHeaderDvpc(value, forceBasic = false) {
  const next = stringValue(value)
  form.value.headerSaveDvpc = next
  form.value.headerBasicDvpc = forceBasic || dvpcYn.value === 'Y' ? next : ''
}

function selectHeaderDvpc() {
  setHeaderDvpc(form.value.headerSaveDvpc, true)
}

function applyFallbackDvpc() {
  const matchedDvpc = matchBranchDvpcOption()
  const fallback = matchedDvpc?.value || dvpcOptions.value[0]?.value || ''
  setHeaderDvpc(fallback, dvpcYn.value === 'Y')
}

function applyCustomerDefaultDvpc(row = {}) {
  const defaultDvpcVisibleBzpcYn = stringValue(row.defaultDvpcVisibleBzpcYn)
  const defaultDvpc = stringValue(row.defaultDvpc)
  if (defaultDvpcVisibleBzpcYn === 'Y' && defaultDvpc && dvpcYn.value === 'Y') {
    setHeaderDvpc(defaultDvpc, true)
    return
  }
  applyFallbackDvpc()
}

async function loadDeliveryBranches() {
  dvpcOptions.value = []
  dvpcYn.value = ''
  setHeaderDvpc('')
  if (!selectedBzpc.value.bzpc) return

  loadingDvpc.value = true
  try {
    const listResponse = await searchDvpcListSysAdmin({ bzpc: selectedBzpc.value.bzpc })
    dvpcOptions.value = normalizeDvpcOptions(listResponse.data)

    const codeResponse = await searchDvpcCode({ bzpc: selectedBzpc.value.bzpc })
    const resultList = codeResponse.data?.resultList || {}
    dvpcYn.value = stringValue(resultList.dvpcYn)
    const defaultDvpc = stringValue(resultList.dvpc)

    if (defaultDvpc && defaultDvpc !== 'N') {
      setHeaderDvpc(defaultDvpc, dvpcYn.value === 'Y')
    } else {
      applyFallbackDvpc()
    }
  } catch (_) {
    dvpcOptions.value = []
    dvpcYn.value = ''
    setHeaderDvpc('')
  } finally {
    loadingDvpc.value = false
  }
}

function onDplcPick(row) {
  form.value.dplcCd = row.dplcCd || ''
  form.value.dplcNm = row.dplcNm || row.dplcCdNm || ''

  form.value.dplcCrgrNm = row.dplcCrgrNm || row.billCrgr || row.repNm || ''
  form.value.dplcCrgrTel = row.dplcCrgrCcpc || row.billCrgrTel || row.tel || ''
  form.value.dplcCrgrMobile = row.dplcCrgrMobile || row.billCrgrMobile || row.repMobile || ''

  form.value.monCreditLimit = row.monCreditLimit || ''
  form.value.adr1 = row.adr1 || ''
  form.value.adr2 = row.adr2 || ''
  applyCustomerDefaultDvpc(row)

  if (!form.value.ordrInfo && form.value.dplcCrgrNm) {
    form.value.ordrInfo = form.value.dplcCrgrNm
  }

  form.value.dplcGrpGrade = {
    dplcDcGrd: stringValue(firstValue(row, 'dcGrd', 'dplcDcGrd')),
    dplcDcGrdDoor: stringValue(firstValue(row, 'dcGrdDoor', 'dplcDcGrdDoor')),
    dplcDcGrdPannel: stringValue(firstValue(row, 'dcGrdPannel', 'dplcDcGrdPannel')),
    dplcDcGrdOtherComp: stringValue(firstValue(row, 'dcGrdOtherComp', 'dplcDcGrdOtherComp', 'dcGrdEtc')),
    dplcDcGrdGlas: stringValue(firstValue(row, 'dcGrdGlas', 'dplcDcGrdGlas')),
    dplcDcGrdMold: stringValue(firstValue(row, 'dcGrdMold', 'dplcDcGrdMold', 'dcGrdMlng')),
    dplcDcGrdDtbtMtrl: stringValue(firstValue(row, 'dcGrdDtbtMtrl', 'dplcDcGrdDtbtMtrl', 'dplcMstDcGrdDtbtMtrl', 'dcGrdMtrl')),
    dplcDcGrdDtbtGoods: stringValue(firstValue(row, 'dcGrdDtbtGoods', 'dplcDcGrdDtbtGoods', 'dplcMstDcGrdDtbtGoods', 'dcGrdProd')),
  }

  form.value.dplcRate = {
    dplcRt: stringValue(firstValue(row, 'dplcRt', 'addInfo1')),
    dplcDoorRt: stringValue(firstValue(row, 'dplcDoorRt', 'addInfo5')),
    dplcPannelRt: stringValue(firstValue(row, 'dplcPannelRt', 'addInfo2')),
    dplcOtherCompRt: stringValue(firstValue(row, 'dplcOtherCompRt', 'dplcEtcRt', 'addInfo3')),
    dplcGlasRt: stringValue(firstValue(row, 'dplcGlasRt', 'addInfo12')),
    dplcMoldRt: stringValue(firstValue(row, 'dplcMoldRt', 'dplcMlngRt', 'addInfo13')),
    dplcDtbtMtrlRt: stringValue(firstValue(row, 'dplcDtbtMtrlRt', 'dplcMtrlRt', 'addInfo14')),
    dplcDtbtGoodsRt: stringValue(firstValue(row, 'dplcDtbtGoodsRt', 'dplcProdRt', 'addInfo15')),
  }
}

function buildEmptyEstimateGrade() {
  return {
    dplcDcGrd: '',
    dplcDcGrdDoor: '',
    dplcDcGrdPannel: '',
    dplcDcGrdOtherComp: '',
    dplcDcGrdGlas: '',
    dplcDcGrdMold: '',
    dplcDcGrdDtbtMtrl: '',
    dplcDcGrdDtbtGoods: '',
  }
}

function buildEmptyEstimateRate() {
  return {
    dplcRt: '',
    dplcDoorRt: '',
    dplcPannelRt: '',
    dplcOtherCompRt: '',
    dplcGlasRt: '',
    dplcMoldRt: '',
    dplcDtbtMtrlRt: '',
    dplcDtbtGoodsRt: '',
  }
}

function stringValue(value) {
  return String(value ?? '').trim()
}

function firstValue(row = {}, ...keys) {
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

async function focusDplcInput() {
  await nextTick()
  dplcInput.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  dplcInput.value?.focus?.({ preventScroll: true })
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

async function submit() {
  error.value = ''
  result.value = ''

  if (!selectedBzpc.value.bzpc) return (error.value = '영업소를 선택하세요')
  if (!form.value.itgEstiNm) {
    error.value = '견적제목을 입력하세요'
    await focusTitleInput()
    return
  }
  if (!form.value.dplcCd) {
    error.value = '거래처를 선택하세요'
    await focusDplcInput()
    return
  }
  const gradeError = validateEstimateGrades(form.value.dplcGrpGrade)
  if (gradeError) return (error.value = gradeError)
  const ratePayload = buildEstimateRatePayload(form.value.dplcGrpGrade, form.value.dplcRate)
  const rateError = validateEstimateRates(ratePayload)
  if (rateError) return (error.value = rateError)
  if (!form.value.estiVldDt)    return (error.value = '견적유효일을 선택하세요')
  if (dvpcYn.value === 'Y' && !form.value.headerSaveDvpc) return (error.value = '배송지점을 선택하세요')

  loading.value = true
  try {
    const payload = {
      ...form.value,
      ...buildEstimateGradePayload(form.value.dplcGrpGrade),
      ...ratePayload,
      dplcRate: ratePayload,
      bzpc: selectedBzpc.value.bzpc,
      bzpcNm: selectedBzpc.value.bzpcNm,
      headerSaveDvpc: stringValue(form.value.headerSaveDvpc),
      headerBasicDvpc: stringValue(form.value.headerBasicDvpc),
      estiVldDt: form.value.estiVldDt.replace(/-/g, ''),
      delivryDt: form.value.delivryDt ? form.value.delivryDt.replace(/-/g, '') : '',
    }
    const { data } = await saveEstiHeader(payload)
    if (data.resultCd !== 'save.ok' && data.resultCd !== 'save.success') {
      error.value = data.resultMessage || '저장 실패'
      return
    }

    const itgEstiNo = data.itgEstiNo
    result.value = `저장 완료. 견적번호 ${itgEstiNo} — 상세 화면으로 이동...`
    setTimeout(() => router.push(`/estimates/${itgEstiNo}`), 700)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '저장 실패'
  } finally {
    loading.value = false
  }
}
</script>
