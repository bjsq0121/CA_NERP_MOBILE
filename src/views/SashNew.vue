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

    <!-- 필수 필드 -->
    <SashFormMain
      v-if="!pageLoading"
      :form="form"
      :wintydi-list="wintydiList"
      :wintydi-map="wintydiMap"
      :insd-sf-list="insdSfList"
      :ousd-sf-list="ousdSfList"
      :ord-typ-list="ordTypList"
      :color-list="colorList"
      :sync-ousd="syncOusd"
      @open-model="modelModal?.open()"
      @wintydi-change="onWintydiChange"
      @insd-color-change="onInsdColorChange"
      @ousd-color-change="onOusdColorChange"
    />

    <!-- 옵션: VENT / 스크린 / 안전망 -->
    <SashOptionVent
      :form="form"
      :vent-options="ventOptions"
      :screen-options="screenOptions"
      @toggle-alu-mf="toggleAluMf"
    />

    <!-- 옵션: 핸들 -->
    <SashOptionHandle :form="form" :handle-options="handleOptions" />

    <!-- 옵션: 유리 -->
    <SashOptionGlass :form="form" :glas="glas" />

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
import SashFormMain from '../components/SashFormMain.vue'
import SashOptionVent from '../components/SashOptionVent.vue'
import SashOptionHandle from '../components/SashOptionHandle.vue'
import SashOptionGlass from '../components/SashOptionGlass.vue'
import { saveSashEsti, searchColorList, searchModelSf, searchGlasList, searchCodeList, searchModelWintydi, searchSashOrdTypCd, selectSashDetail } from '../api/estimate'
import { buildSashSavePayload } from '../utils/sashPayload'

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

// --- Computed ---

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

const canSubmit = computed(
  () =>
    !!itgEstiNo.value && !!form.value.mdlCd && !!form.value.wintydiCd &&
    !!form.value.w && !!form.value.h && !!form.value.qty &&
    !!form.value.insdColrCd && !!form.value.insdSf &&
    (!ousdSfList.value.length || !!form.value.ousdSf)
)

// --- 코드 마스터 정규화 ---

const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))

// --- 초기 로드 ---

onMounted(async () => {
  if (isEditMode.value) {
    pageLoading.value = true
    try {
      await loadEditData()
    } catch (e) {
      error.value = '편집 데이터 로드 실패: ' + (e.message || '')
    }
  }

  try {
    await loadMasters()
  } catch (e) {
    error.value = '코드 마스터 로드 실패: ' + (e.message || '')
  } finally {
    pageLoading.value = false
  }
})

async function loadEditData() {
  sessionStorage.removeItem('mobile_sash_edit_row')
  const payload = {
    itgEstiNo: itgEstiNo.value,
    estiNo: wEstiNo.value,
    estiNos: route.query.estiNos || '1',
    estiSeq: String(editEstiSeq.value),
  }
  const { data } = await selectSashDetail(payload)
  let r = data?.resultData
  if (!r) return

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

async function loadMasters() {
  const [colorRes, ventRes, screenRes, handleRes, ordRes] = await Promise.all([
    searchColorList(),
    searchCodeList('48'),
    searchCodeList('379'),
    searchCodeList('378'),
    searchSashOrdTypCd(),
  ])
  colorList.value = normCd(colorRes.data?.resultList)
  ventAllList.value = normCd(ventRes.data?.resultList)
  screenAllList.value = normCd(screenRes.data?.resultList)
  handleAllList.value = normCd(handleRes.data?.resultList)
  ordTypList.value = normCd(ordRes.data?.resultList).filter((c) => c.addInfo2 === 'Y')
  if (ordTypList.value.length && !form.value.sashOrdTypCd) {
    form.value.sashOrdTypCd = ordTypList.value[0].commCdId
  }
}

// --- 모형 선택 ---

async function onModelPick(row) {
  form.value.mdlCd = row.mdlCd || ''
  form.value.mdlNm = row.mdlNm || ''
  form.value.mtrlCoNm = row.mtrlCoNm || ''
  form.value.bftydiCd = row.bftydiCd || ''
  form.value.sizCd = row.sizCd || ''
  form.value.bsmfOrdUtmCd = row.bsmfOrdUtmCd || ''
  pickedMdlMtrlCo.value = row.mtrlCo || ''

  await loadWintydiData(row)
  clearSizeFields()
  await loadSfAndGlas(row)
  applyColorDefaults()
  await ensureCodeMasters()
  applyVentDefault()
  applyScreenDefault()
  applyHandleDefault()
}

async function loadWintydiData(row) {
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
}

function clearSizeFields() {
  Object.assign(form.value, {
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  })
}

async function loadSfAndGlas(row) {
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
}

function applyColorDefaults() {
  form.value.crtnColrCd = 'WH'
  if (colorList.value.length) {
    const def = colorList.value[0].commCdId
    if (!form.value.insdColrCd || !colorList.value.some(c => c.commCdId === form.value.insdColrCd)) {
      form.value.insdColrCd = def
    }
    if (!form.value.ousdColrCd || !colorList.value.some(c => c.commCdId === form.value.ousdColrCd)) {
      form.value.ousdColrCd = def
    }
    syncOusd.value = form.value.insdColrCd === form.value.ousdColrCd
  }
}

async function ensureCodeMasters() {
  if (!ventAllList.value.length) {
    try {
      const [ventRes, screenRes] = await Promise.all([
        searchCodeList('48'),
        searchCodeList('379'),
      ])
      ventAllList.value = normCd(ventRes.data?.resultList)
      screenAllList.value = normCd(screenRes.data?.resultList)
    } catch (_) {}
  }
  if (!handleAllList.value.length) {
    try {
      const handleRes = await searchCodeList('378')
      handleAllList.value = normCd(handleRes.data?.resultList)
    } catch (_) {}
  }
}

// --- 이벤트 핸들러 ---

function onWintydiChange(val) {
  form.value.wintydiCd = val
  clearSizeFields()
  applyVentDefault()
}

function onInsdColorChange() {
  if (syncOusd.value) form.value.ousdColrCd = form.value.insdColrCd
}

function onOusdColorChange() {
  syncOusd.value = form.value.ousdColrCd === form.value.insdColrCd
}

function toggleAluMf() {
  form.value.isAluMf = !form.value.isAluMf
  applyScreenDefault()
}

// --- 옵션 기본값 적용 ---

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

function applyHandleDefault() {
  const opts = handleOptions.value
  const first = opts.length ? opts[0].commCdId : ''
  if (!form.value.insdHandleType || !opts.some(o => o.commCdId === form.value.insdHandleType)) {
    form.value.insdHandleType = first
  }
  if (!form.value.ousdHandleType || !opts.some(o => o.commCdId === form.value.ousdHandleType)) {
    form.value.ousdHandleType = first
  }
}

// --- 네비게이션 ---

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

// --- 저장 ---

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
    const payload = buildPayload()
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

function buildPayload() {
  return buildSashSavePayload({
    form: form.value,
    itgEstiNo: itgEstiNo.value,
    wEstiNo: wEstiNo.value,
    estiNos: route.query.estiNos || '1',
    editEstiSeq: editEstiSeq.value,
  })
}
</script>
