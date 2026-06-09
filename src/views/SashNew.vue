<template>
  <div>
    <div v-if="pageLoading" class="loading-center">
      <div class="loading-text">견적 데이터 불러오는 중...</div>
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <div class="page-title-row sash-header">
        <div class="sash-header-title">
          <h2 class="page-title">{{ isEditMode ? '샤시 항목 수정' : '샤시 항목 추가' }}</h2>
          <div class="page-subtitle">견적순번: {{ editEstiSeq || '(신규)' }}</div>
        </div>
        <div class="sash-header-actions title-actions">
          <button class="btn secondary btn-quick-config" :disabled="isReadonly" @click="openQuickSashSheet">간편견적</button>
          <button class="sash-header-back btn-back" @click="goBack">뒤로</button>
        </div>
      </div>

      <!-- 필수 필드 -->
      <div class="card">
        <div class="form-section-title">할인등급</div>
        <div class="field">
          <label>할인등급 *</label>
          <select v-model="form.dplcDcGrd" :disabled="isReadonly">
            <option value="">선택</option>
            <option
              v-for="grade in discountGradeList"
              :key="grade.commCdId"
              :value="grade.commCdVal || grade.commCdId"
            >
              {{ grade.commCdNm || grade.commCdVal || grade.commCdId }}
            </option>
          </select>
        </div>
      </div>

      <SashFormMain
        :form="form"
        :wintydi-list="wintydiList"
        :wintydi-map="wintydiMap"
        :bsmf-list="bsmfList"
        :insd-sf-list="insdSfList"
        :ousd-sf-list="ousdSfList"
        :color-list="colorList"
        :sync-ousd="syncOusd"
        :drawing-url="sashDrawingUrl"
        :drawing-fallback="currentWintydiName"
        @open-model="modelModal?.open()"
        @wintydi-change="onWintydiChange"
        @insd-color-change="onInsdColorChange"
        @ousd-color-change="onOusdColorChange"
        @drawing-error="drawingImageError = true"
      />

      <!-- 옵션: VENT / 스크린 / 안전망 -->
      <SashOptionVent
        :form="form"
        :vent-options="ventOptions"
        :screen-options="screenOptions"
        :alu-mf-handle-options="aluMfHandleList"
        :silicone-finish-enabled="siliconeFinishEnabled"
        @toggle-alu-mf="toggleAluMf"
        @vent-change="onVentChange"
      />

      <!-- 옵션: 핸들 -->
      <SashOptionHandle
        :form="form"
        :handle-options="handleOptions"
        :ord-typ-list="ordTypList"
        :al-glass-enabled="alGlassEnabled"
        :second-floor-enabled="isSecondFloorEnabled"
      />

      <!-- 옵션: 유리 -->
      <SashOptionGlass :form="form" :glas="glas" />

      <!-- 옵션: BF / SF / MF -->
      <SashOptionFactory :form="form" />

      <!-- 비고 -->
      <div class="card">
        <div class="field">
          <label>견적비고</label>
          <textarea v-model="form.remSrc" rows="2" />
        </div>
      </div>

      <!-- readonly: 조회 모드 -->
      <div v-if="isReadonly" class="card card-info">
        <div class="text-xs">현재 상태에서는 샤시 항목을 수정할 수 없습니다. 상세 확인만 가능합니다.</div>
      </div>

      <div v-if="hasAmountSummary" class="sash-amount-summary">
        <div class="amount-summary-title">금액</div>
        <div class="amount-grid">
          <div>
            <span>요율</span>
            <strong>{{ amountText(form.estiSalesUnpRt) }}</strong>
          </div>
          <div>
            <span>원가</span>
            <strong>{{ amountText(form.estiSaleCst) }}</strong>
          </div>
          <div>
            <span>단가</span>
            <strong>{{ amountText(form.estiSaleUnp) }}</strong>
          </div>
          <div>
            <span>공급가액</span>
            <strong>{{ amountText(form.estiTotSaleUnp) }}</strong>
          </div>
          <div>
            <span>부가세</span>
            <strong>{{ amountText(form.estiTotSaleVat) }}</strong>
          </div>
          <div>
            <span>총금액</span>
            <strong>{{ amountText(form.estiTotSaleVatUnp) }}</strong>
          </div>
        </div>
      </div>

      <!-- 저장/추가 버튼 (편집 가능할 때만) -->
      <template v-if="!isReadonly">
        <div class="bottom-action-spacer"></div>
        <div class="bottom-action-bar sash-action-bar">
          <button class="btn accent" :disabled="loading || !canSubmit" @click="saveAndAdd">
            {{ loading ? '저장 중...' : '저장 후 항목 추가' }}
          </button>
          <button class="btn" :disabled="loading || !canSubmit" @click="saveAndClose">
            {{ loading ? '저장 중...' : '저장하고 상세로' }}
          </button>
        </div>
      </template>

      <div v-if="error" class="card card-error">{{ error }}</div>

      <div v-if="alertMessage" class="modal-mask" @click.self="closeAlert">
        <div class="modal-sheet alert-sheet">
          <h3>안내</h3>
          <p class="alert-message">{{ alertMessage }}</p>
          <button type="button" class="btn accent" @click="closeAlert">확인</button>
        </div>
      </div>

      <SashQuickConfigSheet
        v-if="showQuickConfigSheet"
        :visible="showQuickConfigSheet"
        @close="closeQuickSashSheet"
        @select="handleQuickSashSelect"
      />

      <details class="sash-bottom-meta">
        <summary>견적 식별정보</summary>
        <div>
          <span>통합견적번호: {{ itgEstiNo || '(없음)' }}</span>
          <span>견적번호: {{ wEstiNo || '(없음)' }}</span>
          <span>견적차수: {{ estiNos || '1' }}</span>
          <span>견적순번: {{ editEstiSeq || '(신규)' }}</span>
        </div>
      </details>

      <ModelSearchModal ref="modelModal" @select="onModelPick" />
    </template>
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
import SashOptionFactory from '../components/SashOptionFactory.vue'
import SashQuickConfigSheet from '../components/SashQuickConfigSheet.vue'
import { saveSashEsti, searchColorList, searchModelList, searchModelSf, searchGlasList, searchCodeList, searchCodeDetail, searchModelWintydi, searchSashOrdTypCd, searchWindEstiAmt, selectSashDetail, selectEstiHeader, searchDrwgFileAjax } from '../api/estimate'
import { buildSashSavePayload } from '../utils/sashPayload'
import { normalizeSafetyNetHandleOptions, normalizeSafetyNetHandleValue, resolveBsmfOrdUtmCd } from '../utils/sashOptions'
import { captureSashEditValues, restoreSashEditValues } from '../utils/sashEditPreserve'
import { buildSashDrawingUrl, findMatchingDrawing } from '../utils/estimateDetail'
import { UNKNOWN_STATUS, isEditableHeaderStatus, isEditableStatus, resolveEffectiveStatus } from '../utils/estimateStatus'
import { normalizeDrwgFileAjaxResult, resolveVentDrawingState } from '../utils/sashDrawingState'
import { applyQuickConfigOptionsToForm } from '../utils/sashQuickConfig'

const route = useRoute()
const router = useRouter()
const modelModal = ref(null)

const itgEstiNo = ref(route.query.itgEstiNo || '')
const wEstiNo = ref(route.query.wEstiNo || '')
const estiNos = ref(route.query.estiNos || '1')
const editEstiSeq = ref(route.query.estiSeq || '')
const isEditMode = computed(() => !!editEstiSeq.value)
const headerStatus = ref(UNKNOWN_STATUS)
const estimateStatus = ref(UNKNOWN_STATUS)
const isReadonly = computed(
  () =>
    route.query.readonly === 'Y' ||
    !(isEditMode.value ? isEditableStatus(headerStatus.value) : isEditableHeaderStatus(headerStatus.value)) ||
    (isEditMode.value && !isEditableStatus(estimateStatus.value))
)

const wintydiList = ref([])
const wintydiMap = ref({})
const ventAllList = ref([])
const screenAllList = ref([])
const handleAllList = ref([])
const aluMfHandleList = ref([])
const ordTypList = ref([])
const bsmfList = ref([])
const colorList = ref([])
const pickedMdlMtrlCo = ref('')
const estimateHeader = ref({})
const discountGradeList = ref([])

const form = ref({
  mdlCd: '', mdlNm: '', wintydiCd: '', mtrlCoNm: '',
  bftydiCd: '', sizCd: '', ctgr2Cd: '', bsmfOrdUtmCd: '',
  dplcDcGrd: '',
  dblWindYn: '',
  w: null, h: null, qty: 1,
  w1: null, w2: null, w3: null, w4: null, w5: null,
  h1: null, h2: null, h3: null, h4: null, h5: null,
  cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  crtnColrCd: 'WH',
  insdColrCd: '', ousdColrCd: '',
  insdSf: '', ousdSf: '',
  sashOrdTypCd: '',
  ventLoc: '', screenType: '',
  drwgCd: '',
  isAluMf: false,
  aluMdlYn: '',
  aluMfHandleType: '',
  aluMfHandleTypeNm: '',
  aluMfMdlYn: 'Y',
  aluMfHndlH: null,
  slcnFnshYn: false,
  sashGlasXMtrlYn: '',
  sashOrdTypCds: '',
  drnHoleYn: true,
  ventHoleYn: false,
  ventHoleEnabled: false,
  bfMillingType: '0',
  bfArmatureType: '',
  bfLockCnt: '',
  bfWrapping: '',
  bfThrSidePack: '',
  bfMillingDetail: '',
  bfMillingUp: false,
  bfMillingDown: false,
  bfMillingLeft: false,
  bfMillingRight: false,
  bfWeldNoneYn: false,
  bfWeld: false,
  fillingPiecesYn: false,
  basedfillingPiecesYn: false,
  bfRackShip: false,
  bfStopper: false,
  bfDirectShip: false,
  bfShipAddr: '',
  bfForesidePackYn: false,
  bfKsmarkYn: false,
  bfLxHiddenOptYn: false,
  bfSideView: '',
  bfFmGbYn: false,
  bfFmGbShipYn: false,
  bfFmGbUpDownYn: false,
  bfFmGbRlYn: false,
  bfFmGbCutYn: false,
  bfSsOpt: false,
  bfFixBuild: false,
  bfFdHd: false,
  bfTurnDoorPullType: '',
  bfTurnDoorOneSideWrapType: '',
  bfOneSideWrapColrNm: '',
  bfAptCmType: '',
  bfApt1pjMethod: '',
  bfApt2pjLoc: '',
  bfApt2pjMethod: '',
  bfVentHoleLctn: '',
  bfWinCbMilingType: '',
  bfTurnDoorOnlyMakeYn: false,
  bfVentPiecesIncludeYn: false,
  bfWinOnefixUpHoleYn: false,
  bfWinFmThreeSideYn: false,
  bfWinTopBottomFmYn: false,
  bfWinSpDdlnShpmYn: false,
  bfIhyFixHghtDirYn: false,
  sfLandscape: false,
  sfArmatureType: '',
  sfOppositeTypeYn: false,
  sfInsideRightBrdYn: false,
  sfMcOneReqYn: false,
  sfBrdProcYn: false,
  sfHandleProcYn: false,
  sfRackShip: false,
  sfDirectShip: false,
  sfShipAddr: '',
  sfOutGlasYn: false,
  sfOutGlasInfo: '',
  sfRoller: '',
  sfCreHook: false,
  sfCreSize: '',
  sfOutType: '',
  sfOutType0: '',
  sfOutType1: '',
  sfOutType2: '',
  sfOutType3: '',
  sfSontaLoca: '',
  sfInsdVentHoleYn: false,
  sfOusdVentHoleYn: false,
  sfAptArmatureType: '',
  sfAptHandleType: '',
  deco1: [],
  winCloser: [],
  mfRackShip: false,
  mfCi4wStickYn: false,
  mfDirectShip: false,
  mfShipAddr: '',
  mfHandle: '',
  mfHandleHsize: '',
  mfArmatureType: '',
  mfAptArmatureType: '',
  alGlass: false,
  glasAttachYn: false,
  glasAdmsYn: 'Y',
  issueType: '',
  appdocId: '',
  unqColrPolSaveYn: false,
  sashStandardYn: '',
  standardSpec: {},
  uplmNrmW: '', uplmNrmH: '', llmtNrmW: '', llmtNrmH: '',
  uplmNrmW1: '', uplmNrmW2: '', uplmNrmW3: '', uplmNrmW4: '', uplmNrmW5: '',
  uplmNrmH1: '', uplmNrmH2: '', uplmNrmH3: '', uplmNrmH4: '', uplmNrmH5: '',
  llmtNrmW1: '', llmtNrmW2: '', llmtNrmW3: '', llmtNrmW4: '', llmtNrmW5: '',
  llmtNrmH1: '', llmtNrmH2: '', llmtNrmH3: '', llmtNrmH4: '', llmtNrmH5: '',
  insdHandleType: '', ousdHandleType: '',
  insdHndlHEnabled: false, ousdHndlHEnabled: false, secondHndlHEnabled: false,
  insdHndlH: null, ousdHndlH: null,
  insdBrcktHEnabled: false, ousdBrcktHEnabled: false,
  secondFloorEnabled: false,
  insdBrcktH: null, ousdBrcktH: null,
  insd2FHndlH: null, ousd2FHndlH: null,
  insd2FBrcktH: null, ousd2FBrcktH: null,
  mtrlCds1: '', mtrlCds2: '', mtrlCds3: '', mtrlCds4: '',
  estiSalesUnpRt: '', estiSaleCst: '', estiSaleUnp: '',
  estiTotSaleUnp: '', estiTotSaleVat: '', estiTotSaleVatUnp: '',
  bfSaleUnp: '', sfSaleUnp: '', mfSaleUnp: '',
  saleCstSum: '', sumConvCost: '', sumMtrlCost: '',
  rawAmt: '', convAmt: '', totSaleCst: '', totSum: '',
  pdBfRemSrc: '', pdSfRemSrc: '', pdMfRemSrc: '',
  remSrc: '',
})

const insdSfList = ref([])
const ousdSfList = ref([])
const glas = ref({ sfIn: [], sfOut: [], bfIn: [], bfOut: [] })

const loading = ref(false)
const pageLoading = ref(false)
const error = ref('')
const savedSeq = ref('')
const alertMessage = ref('')
const showQuickConfigSheet = ref(false)
const syncOusd = ref(true)
const modelDrawings = ref([])
const selectedDrawing = ref(null)
const drawingImageError = ref(false)

// --- Computed ---

const ventOptions = computed(() =>
  ventAllList.value.filter((v) => v.addInfo1 === '30' && v.addInfo2 === form.value.wintydiCd)
)

const screenOptions = computed(() => {
  const target = form.value.isAluMf ? 'ALU' : 'PVC'
  const exact = screenAllList.value.filter((s) => String(s.addInfo4 || '').toUpperCase() === target)
  if (exact.length) return exact
  return screenAllList.value
})

const handleOptions = computed(() => {
  const isCheckMtrlCo = ['HC', 'HW', 'LX'].includes(pickedMdlMtrlCo.value)
  return handleAllList.value.filter((h) => isCheckMtrlCo || h.addInfo7 !== 'Y')
})

const isSecondFloorEnabled = computed(() => String(wintydiMap.value[form.value.wintydiCd]?.floorInfo || '').includes('/'))
const currentWintydiName = computed(() => wintydiList.value.find((item) => item.commCdId === form.value.wintydiCd)?.commCdNm || form.value.wintydiCd || '')
const sashDrawingUrl = computed(() => (drawingImageError.value ? '' : buildSashDrawingUrl(selectedDrawing.value || {})))
const alGlassEnabled = computed(() => ['P2', 'P3', 'P4', 'P5'].includes(form.value.ctgr2Cd))
const siliconeFinishEnabled = computed(() => isSiliconeFinishAllowedByBsmf() && !hasGlassExcludedSelection())
const hasAmountSummary = computed(() =>
  [
    form.value.estiSalesUnpRt,
    form.value.estiSaleCst,
    form.value.estiSaleUnp,
    form.value.estiTotSaleUnp,
    form.value.estiTotSaleVat,
    form.value.estiTotSaleVatUnp,
  ].some((value) => value !== '' && value != null)
)

const canSubmit = computed(
  () =>
    !!itgEstiNo.value && !!form.value.mdlCd && !!form.value.wintydiCd &&
    !!form.value.bsmfOrdUtmCd && !!form.value.sashOrdTypCd &&
    !!form.value.dplcDcGrd &&
    !!form.value.w && !!form.value.h && !!form.value.qty &&
    !!form.value.screenType && !!form.value.ventLoc &&
    !!form.value.insdColrCd && !!form.value.insdSf &&
    !!form.value.insdHandleType && !!form.value.ousdHandleType &&
    (!ousdSfList.value.length || !!form.value.ousdSf)
)

// --- 코드 마스터 정규화 ---

const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))

// --- 초기 로드 ---

onMounted(async () => {
  pageLoading.value = true
  try {
    await loadEstimateStatus()
    await loadMasters()
    if (isEditMode.value) {
      await loadEditData()
    }
  } catch (e) {
    error.value = (isEditMode.value ? '편집 데이터 로드 실패: ' : '코드 마스터 로드 실패: ') + (e.message || '')
  } finally {
    pageLoading.value = false
  }
})

async function loadEstimateStatus() {
  headerStatus.value = UNKNOWN_STATUS
  estimateStatus.value = UNKNOWN_STATUS
  estimateHeader.value = {}
  if (!itgEstiNo.value) return
  try {
    const { data } = await selectEstiHeader(itgEstiNo.value)
    const header = data?.resultData || {}
    estimateHeader.value = header
    headerStatus.value = resolveEffectiveStatus(header.stCd, header.igStCd)
    estimateStatus.value = headerStatus.value
  } catch (_) {
    estimateHeader.value = {}
    headerStatus.value = UNKNOWN_STATUS
    estimateStatus.value = UNKNOWN_STATUS
  }
}

async function loadEditData() {
  sessionStorage.removeItem('mobile_sash_edit_row')
  const payload = {
    itgEstiNo: itgEstiNo.value,
    estiNo: wEstiNo.value,
    estiNos: estiNos.value,
    estiSeq: String(editEstiSeq.value),
  }
  const { data } = await selectSashDetail(payload)
  let r = data?.resultData
  if (!r) return

  const rowStatus = resolveEffectiveStatus(r.stCd, r.igStCd)
  estimateStatus.value = rowStatus === UNKNOWN_STATUS ? headerStatus.value : rowStatus

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
  r.cs3Size = pick('cs3Size', 'CS3Size')
  r.cs4Size = pick('cs4Size', 'CS4Size')
  r.cs5Size = pick('cs5Size', 'CS5Size')

  Object.assign(form.value, {
    mdlCd: r.mdlCd || '',
    mdlNm: r.mdlNm || '',
    wintydiCd: r.wintydiCd || '',
    mtrlCoNm: r.mtrlCoNm || '',
    bftydiCd: r.bftydiCd || '',
    sizCd: r.sizCd || '',
    ctgr2Cd: r.ctgr2Cd || '',
    dplcDcGrd: r.dplcDcGrd || '',
    dblWindYn: r.dblWindYn || '',
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
    cs3: r.cs3Size ? Number(r.cs3Size) : null,
    cs4: r.cs4Size ? Number(r.cs4Size) : null,
    cs5: r.cs5Size ? Number(r.cs5Size) : null,
    insdColrCd: r.insdColrCd || '',
    ousdColrCd: r.ousdColrCd || '',
    insdSf: r.insdSf || '',
    ousdSf: r.ousdSf || '',
    ventLoc: r.ventLoc || '',
    screenType: r.screenType || '',
    drwgCd: r.drwgCd || '',
    isAluMf: isYnValue(r.aluMfYn),
    aluMdlYn: normalizeYn(r.aluMdlYn),
    aluMfHandleType: normalizeSafetyNetHandleValue(r.aluMfHandleType) || r.aluMfHandleType || '',
    aluMfHandleTypeNm: r.aluMfHandleTypeNm || '',
    aluMfMdlYn: r.aluMfMdlYn || 'Y',
    aluMfHndlH: r.aluMfHndlH ? Number(r.aluMfHndlH) : null,
    sashGlasXMtrlYn: r.sashGlasXMtrlYn || '',
    sashOrdTypCds: r.sashOrdTypCds || r.glasXMtrlExceptionCds || '',
    drnHoleYn: !isExplicitNo(r.drnHoleYn),
    ventHoleYn: isYnValue(r.ventHoleYn),
    ventHoleEnabled: isYnValue(r.ventHoleYn) || isVentHoleAllowed(),
    bfMillingType: stringifyOptionValue(r.bfMillingType || r.bfmillingWing || '0'),
    bfArmatureType: r.bfArmatureType || '',
    bfLockCnt: r.bfLockCnt || '',
    bfWrapping: r.bfWrapping || '',
    bfThrSidePack: r.bfThrSidePack || '',
    bfMillingDetail: r.bfMillingDetail || '',
    bfMillingUp: r.bfMillingUp === 'Y',
    bfMillingDown: r.bfMillingDown === 'Y',
    bfMillingLeft: r.bfMillingLeft === 'Y',
    bfMillingRight: r.bfMillingRight === 'Y',
    bfWeldNoneYn: r.bfWeldNoneYn === 'Y',
    bfWeld: r.bfWeld === 'Y',
    fillingPiecesYn: r.fillingPiecesYn === 'Y',
    basedfillingPiecesYn: r.basedfillingPiecesYn === 'Y',
    bfRackShip: r.bfRackShip === 'Y',
    bfStopper: r.bfStopper === 'Y',
    bfDirectShip: r.bfDirectShip === 'Y',
    bfShipAddr: r.bfShipAddr || '',
    bfForesidePackYn: r.bfForesidePack === 'Y',
    bfKsmarkYn: r.bfKsmark === 'Y',
    bfLxHiddenOptYn: r.bfLxHiddenOptYn === 'Y',
    bfSideView: r.bfSideView || '',
    bfFmGbYn: r.bfFmGbYn === 'Y',
    bfFmGbShipYn: r.bfFmGbShipYn === 'Y',
    bfFmGbUpDownYn: r.bfFmGbUpDownYn === 'Y',
    bfFmGbRlYn: r.bfFmGbRlYn === 'Y',
    bfFmGbCutYn: r.bfFmGbCutYn === 'Y',
    bfSsOpt: r.bfSsOpt === 'Y',
    bfFixBuild: r.bfFixBuild === 'Y',
    bfFdHd: r.bfFdHd === 'Y',
    bfTurnDoorPullType: r.bfTurnDoorPullType || '',
    bfTurnDoorOneSideWrapType: r.bfTurnDoorOneSideWrapType || '',
    bfOneSideWrapColrNm: r.bfOneSideWrapColrNm || '',
    bfAptCmType: r.bfAptCmType || '',
    bfApt1pjMethod: r.bfApt1pjMethod || '',
    bfApt2pjLoc: r.bfApt2pjLoc || '',
    bfApt2pjMethod: r.bfApt2pjMethod || '',
    bfVentHoleLctn: r.bfVentHoleLctn || '',
    bfWinCbMilingType: r.bfWinCbMilingType || '',
    bfTurnDoorOnlyMakeYn: r.bfTurnDoorOnlyMakeYn === 'Y',
    bfVentPiecesIncludeYn: r.bfVentPiecesIncludeYn === 'Y',
    bfWinOnefixUpHoleYn: r.bfWinOnefixUpHoleYn === 'Y',
    bfWinFmThreeSideYn: r.bfWinFmThreeSideYn === 'Y',
    bfWinTopBottomFmYn: r.bfWinTopBottomFmYn === 'Y',
    bfWinSpDdlnShpmYn: r.bfWinSpDdlnShpmYn === 'Y',
    bfIhyFixHghtDirYn: r.bfIhyFixHghtDirYn === 'Y',
    sfLandscape: r.sfLandscape === 'Y',
    sfArmatureType: r.sfArmatureType || '',
    sfOppositeTypeYn: r.sfOppositeTypeYn === 'Y',
    sfInsideRightBrdYn: r.sfInsideRightBrdYn === 'Y',
    sfMcOneReqYn: r.sfMcOneReqYn === 'Y',
    sfBrdProcYn: r.sfBrdProcYn === 'Y',
    sfHandleProcYn: r.sfHandleProcYn === 'Y',
    sfRackShip: r.sfRackShip === 'Y',
    sfDirectShip: r.sfDirectShip === 'Y',
    sfShipAddr: r.sfShipAddr || '',
    sfOutGlasYn: r.sfOutGlasYn === 'Y',
    sfOutGlasInfo: r.sfOutGlasInfo || '',
    sfRoller: r.sfRoller || '',
    sfCreHook: r.sfCreHook === 'Y',
    sfCreSize: r.sfCreSize || '',
    sfOutType: r.sfOutType || '',
    sfOutType0: r.sfOutType0 || '',
    sfOutType1: r.sfOutType1 || '',
    sfOutType2: r.sfOutType2 || '',
    sfOutType3: r.sfOutType3 || '',
    sfSontaLoca: r.sfSontaLoca || '',
    sfAptArmatureType: r.sfAptArmatureType || '',
    sfAptHandleType: r.sfAptHandleType || '',
    deco1: [
      r.insdDeckNoneYn === 'Y' ? 1 : '',
      r.ousdDeckNoneYn === 'Y' ? 2 : '',
      r.insd2FDeckNoneYn === 'Y' ? 3 : '',
      r.ousd2FDeckNoneYn === 'Y' ? 4 : '',
    ].filter(Boolean),
    winCloser: [
      r.insdWindClsYn === 'Y' ? 1 : '',
      r.ousdWindClsYn === 'Y' ? 2 : '',
      r.insd2FWindClsYn === 'Y' ? 3 : '',
      r.ousd2FWindClsYn === 'Y' ? 4 : '',
    ].filter(Boolean),
    mfRackShip: r.mfRackShip === 'Y',
    mfCi4wStickYn: r.mfCi4wStickYn === 'Y',
    mfDirectShip: r.mfDirectShip === 'Y',
    mfShipAddr: r.mfShipAddr || '',
    mfHandle: r.mfHandle || '',
    mfHandleHsize: r.mfHandleHsize || '',
    mfArmatureType: r.mfArmatureType || '',
    mfAptArmatureType: r.mfAptArmatureType || r.mfAptAmatureType || '',
    alGlass: isYnValue(r.glasStdalYn),
    glasAttachYn: isYnValue(r.glasAttachYn),
    glasAdmsYn: r.glasAdmsYn || 'Y',
    issueType: r.issueType || '',
    appdocId: r.appdocId || '',
    unqColrPolSaveYn: isYnValue(r.unqColrPolSaveYn),
    insdHandleType: r.insdHandleType || '',
    ousdHandleType: r.ousdHandleType || '',
    insdHndlHEnabled: r.insdHndlHMiddle === 'N',
    ousdHndlHEnabled: r.insdHndlHMiddle === 'N',
    secondHndlHEnabled: r.insd2FHndlHMiddle === 'N',
    insdHndlH: r.insdHndlHMiddle === 'N' ? (r.insdHndlH ? Number(r.insdHndlH) : null) : null,
    ousdHndlH: r.insdHndlHMiddle === 'N' ? (r.ousdHndlH ? Number(r.ousdHndlH) : null) : null,
    insd2FHndlH: r.insd2FHndlH ? Number(r.insd2FHndlH) : null,
    ousd2FHndlH: r.ousd2FHndlH ? Number(r.ousd2FHndlH) : null,
    insdBrcktHEnabled: r.insdBrcktHMiddle === 'N',
    ousdBrcktHEnabled: r.insd2FBrcktHMiddle === 'N',
    secondFloorEnabled: isSecondFloorEnabled.value,
    insdBrcktH: r.insdBrcktH ? Number(r.insdBrcktH) : null,
    ousdBrcktH: r.ousdBrcktH ? Number(r.ousdBrcktH) : null,
    insd2FBrcktH: r.insd2FBrcktH ? Number(r.insd2FBrcktH) : null,
    ousd2FBrcktH: r.ousd2FBrcktH ? Number(r.ousd2FBrcktH) : null,
    sfInsdVentHoleYn: r.sfInsdVentHoleYn === 'Y',
    sfOusdVentHoleYn: r.sfOusdVentHoleYn === 'Y',
    mtrlCds1: r.mtrlCds1 || r.insdSfGlasMtrlCd || '',
    mtrlCds2: r.mtrlCds2 || r.ousdSfGlasMtrlCd || '',
    mtrlCds3: r.mtrlCds3 || r.insdBfGlasMtrlCd || '',
    mtrlCds4: r.mtrlCds4 || r.ousdBfGlasMtrlCd || '',
    estiSalesUnpRt: '',
    estiSaleCst: '',
    estiSaleUnp: '',
    estiTotSaleUnp: '',
    estiTotSaleVat: '',
    estiTotSaleVatUnp: '',
    bfSaleUnp: r.bfSaleUnp || '',
    sfSaleUnp: r.sfSaleUnp || '',
    mfSaleUnp: r.mfSaleUnp || '',
    saleCstSum: r.saleCstSum || '',
    sumConvCost: r.sumConvCost || '',
    sumMtrlCost: r.sumMtrlCost || '',
    rawAmt: r.rawAmt || '',
    convAmt: r.convAmt || '',
    totSaleCst: r.totSaleCst || '',
    totSum: r.totSum || '',
    pdBfRemSrc: r.pdBfRemSrc || '',
    pdSfRemSrc: r.pdSfRemSrc || '',
    pdMfRemSrc: r.pdMfRemSrc || '',
    remSrc: r.remSrc || '',
  })
  if (r.mdlCd) {
    const savedEditValues = captureSashEditValues(form.value)
    await onModelPick({ ...r }, { preserveProductionOptions: true })
    restoreSashEditValues(form.value, savedEditValues)
    if (r.dplcDcGrd) form.value.dplcDcGrd = r.dplcDcGrd
    applyProductionOptionRules()
    refreshDrawingFromCurrentSelection()
  }
  await loadWindEstimateAmount()
}

async function loadWindEstimateAmount() {
  Object.assign(form.value, {
    estiSalesUnpRt: '',
    estiSaleCst: '',
    estiSaleUnp: '',
    estiTotSaleUnp: '',
    estiTotSaleVat: '',
    estiTotSaleVatUnp: '',
  })
  if (!itgEstiNo.value || !wEstiNo.value || !editEstiSeq.value) return

  try {
    const { data } = await searchWindEstiAmt({
      itgEstiNo: itgEstiNo.value,
      estiNo: wEstiNo.value,
      estiSeq: editEstiSeq.value,
    })
    const amountRow = data?.resultList?.[0] || {}
    Object.assign(form.value, {
      estiSalesUnpRt: amountRow.estiSalesUnpRt || '',
      estiSaleCst: amountRow.estiSaleCst || '',
      estiSaleUnp: amountRow.estiSaleUnp || '',
      estiTotSaleUnp: amountRow.estiTotSaleUnp || '',
      estiTotSaleVat: amountRow.estiTotSaleVat || '',
      estiTotSaleVatUnp: amountRow.estiTotSaleVatUnp || '',
    })
  } catch (_) {}
}

async function loadMasters() {
  const [colorRes, ventRes, screenRes, handleRes, aluMfHandleRes, ordRes, bsmfRes, gradeRes] = await Promise.all([
    searchColorList(),
    searchCodeList('48'),
    searchCodeList('379'),
    searchCodeList('378'),
    searchCodeList('387'),
    searchSashOrdTypCd(),
    searchCodeList('405'),
    searchCodeList('20'),
  ])
  colorList.value = normCd(colorRes.data?.resultList)
  ventAllList.value = normCd(ventRes.data?.resultList)
  screenAllList.value = normCd(screenRes.data?.resultList)
  handleAllList.value = normCd(handleRes.data?.resultList)
  aluMfHandleList.value = normalizeSafetyNetHandleOptions(normCd(aluMfHandleRes.data?.resultList))
  ordTypList.value = normCd(ordRes.data?.resultList).filter((c) => c.addInfo2 === 'Y')
  bsmfList.value = normCd(bsmfRes.data?.resultList)
  discountGradeList.value = normCd(gradeRes.data?.resultList).filter((c) => c.commCdVal !== 'S')
  normalizeBsmfSelection()
  if (ordTypList.value.length && !form.value.sashOrdTypCd) {
    form.value.sashOrdTypCd = ordTypList.value[0].commCdId
  }
  applyHeaderDiscountGrade()
}

function firstDiscountGradeValue() {
  const first = discountGradeList.value[0]
  return first ? (first.commCdVal || first.commCdId || '') : ''
}

function resolveHeaderDiscountGrade(row = {}) {
  const header = estimateHeader.value || {}
  const defaultGrade = firstValue(header, 'dplcDcGrd', 'dcGrd')
  const pannelYn = firstValue(row, 'pannelYn', 'panelYn')
  const mtrlCo = String(firstValue(row, 'mtrlCo') || pickedMdlMtrlCo.value || '').trim().toUpperCase()

  if (isYnValue(pannelYn)) {
    return firstValue(header, 'dplcDcGrdPannel', 'dcGrdPannel') || defaultGrade || firstDiscountGradeValue()
  }
  if (mtrlCo && mtrlCo !== 'CA' && mtrlCo !== 'HC') {
    return firstValue(header, 'dplcDcGrdOtherComp', 'dcGrdOtherComp') || defaultGrade || firstDiscountGradeValue()
  }
  return defaultGrade || firstDiscountGradeValue()
}

function applyHeaderDiscountGrade(row = {}, { force = false } = {}) {
  if (!force && form.value.dplcDcGrd) return
  form.value.dplcDcGrd = resolveHeaderDiscountGrade(row)
}

// --- 모형 선택 ---

async function onModelPick(row, { preserveProductionOptions = false } = {}) {
  form.value.mdlCd = row.mdlCd || ''
  form.value.mdlNm = row.mdlNm || ''
  form.value.mtrlCoNm = row.mtrlCoNm || ''
  form.value.bftydiCd = row.bftydiCd || ''
  form.value.sizCd = row.sizCd || ''
  form.value.ctgr2Cd = row.ctgr2Cd || ''
  form.value.dblWindYn = row.dblWindYn || ''
  form.value.sashStandardYn = row.standardYn || row.sashStandardYn || ''
  form.value.aluMdlYn = normalizeYn(row.aluMdlYn)
  form.value.sashGlasXMtrlYn = row.sashGlasXMtrlYn || ''
  form.value.sashOrdTypCds = row.sashOrdTypCds || row.glasXMtrlExceptionCds || ''
  form.value.uplmNrmW = row.uplmNrmW || ''
  form.value.uplmNrmH = row.uplmNrmH || ''
  form.value.llmtNrmW = row.llmtNrmW || ''
  form.value.llmtNrmH = row.llmtNrmH || ''
  for (let index = 1; index <= 5; index += 1) {
    form.value[`uplmNrmW${index}`] = row[`uplmNrmW${index}`] || ''
    form.value[`uplmNrmH${index}`] = row[`uplmNrmH${index}`] || ''
    form.value[`llmtNrmW${index}`] = row[`llmtNrmW${index}`] || ''
    form.value[`llmtNrmH${index}`] = row[`llmtNrmH${index}`] || ''
  }
  const resolvedBsmf = resolveBsmfOrdUtmCd(row, bsmfList.value)
  if (resolvedBsmf || !form.value.bsmfOrdUtmCd) form.value.bsmfOrdUtmCd = resolvedBsmf
  pickedMdlMtrlCo.value = row.mtrlCo || ''
  if (!preserveProductionOptions) applyHeaderDiscountGrade(row, { force: true })

  await loadWintydiData(row)
  clearSizeFields()
  await loadSfAndGlas(row)
  applyColorDefaults()
  await ensureCodeMasters()
  normalizeBsmfSelection()
  await applyStandardSpec()
  await applyProductionStandardRules(row)
  if (preserveProductionOptions) {
    applyProductionOptionRules()
  } else {
    applyProductionOptionDefaults(row)
  }
  applyVentDefault()
  applyScreenDefault()
  applyHandleDefault()
  await hydrateModelDrawing(row)
}

function openQuickSashSheet() {
  if (isReadonly.value) return
  error.value = ''
  showQuickConfigSheet.value = true
}

function closeQuickSashSheet() {
  showQuickConfigSheet.value = false
}

async function handleQuickSashSelect(card) {
  showQuickConfigSheet.value = false
  await applyQuickSashConfig(card)
}

function firstValue(row = {}, ...keys) {
  for (const key of keys) {
    const value = row[key]
    if (value !== '' && value != null) return value
  }
  return ''
}

function numberValue(row = {}, ...keys) {
  const value = firstValue(row, ...keys)
  if (value === '') return null
  const numeric = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(numeric) ? numeric : null
}

function setIfPresent(row, field, ...keys) {
  const value = firstValue(row, ...keys)
  if (value !== '') form.value[field] = value
}

function quickConfigOptionMap(card = {}) {
  return card.optionMap || card.raw?.optionMap || {}
}

function applyQuickConfigSafetyOptions(detail = {}, card = {}) {
  const optionMap = quickConfigOptionMap(card)
  const aluMfYn = firstValue(detail, 'aluMfYn') || firstValue(optionMap, 'aluMfYn')
  if (aluMfYn !== '') form.value.isAluMf = isYnValue(aluMfYn)

  const handleType = firstValue(detail, 'aluMfHandleType') || firstValue(optionMap, 'aluMfHandleType')
  if (handleType !== '') form.value.aluMfHandleType = normalizeSafetyNetHandleValue(handleType) || handleType

  const mdlYn = firstValue(detail, 'aluMfMdlYn') || firstValue(optionMap, 'aluMfMdlYn')
  if (mdlYn !== '') form.value.aluMfMdlYn = mdlYn

  const hndlH = numberValue(detail, 'aluMfHndlH') ?? numberValue(optionMap, 'aluMfHndlH')
  if (hndlH != null) form.value.aluMfHndlH = hndlH
}

async function applyQuickSashConfig(card = {}) {
  const detail = card.detail || card.raw?.detail || card.raw || card
  const header = card.header || card.raw?.header || {}
  if (!detail.mdlCd) {
    showError('간편견적에 모형 정보가 없습니다')
    return
  }

  loading.value = true
  try {
    resetSafetyNetOptions()
    await onModelPick(detail)
    setIfPresent(detail, 'bsmfOrdUtmCd', 'bsmfOrdUtmCd')
    setIfPresent(detail, 'ventLoc', 'ventLoc')
    applyQuickConfigSafetyOptions(detail, card)
    setIfPresent(detail, 'screenType', 'screenType')
    setIfPresent(detail, 'crtnColrCd', 'crtnColrCd')
    setIfPresent(detail, 'insdColrCd', 'insdColrCd')
    setIfPresent(detail, 'ousdColrCd', 'ousdColrCd')
    setIfPresent(detail, 'insdSf', 'insdSf')
    setIfPresent(detail, 'ousdSf', 'ousdSf')
    setIfPresent(detail, 'mtrlCds1', 'insdSfGlasMtrlCd')
    setIfPresent(detail, 'mtrlCds2', 'ousdSfGlasMtrlCd')
    setIfPresent(detail, 'mtrlCds3', 'insdBfGlasMtrlCd')
    setIfPresent(detail, 'mtrlCds4', 'ousdBfGlasMtrlCd')
    setIfPresent(detail, 'bfArmatureType', 'bfArmatureType')
    setIfPresent(detail, 'sfArmatureType', 'sfArmatureType')
    setIfPresent(detail, 'mfArmatureType', 'mfArmatureType')
    setIfPresent(detail, 'insdHandleType', 'insdHandleType')
    setIfPresent(detail, 'ousdHandleType', 'ousdHandleType')
    form.value.alGlass = isYnValue(detail.glasStdalYn)
    form.value.glasAttachYn = isYnValue(detail.glasAttachYn)
    form.value.drnHoleYn = !isExplicitNo(detail.drnHoleYn)
    form.value.ventHoleYn = isYnValue(detail.ventHoleYn)
    applyQuickConfigOptionsToForm(form.value, card)
    syncOusd.value = form.value.insdColrCd === form.value.ousdColrCd
    form.value.secondFloorEnabled = isSecondFloorEnabled.value
    await updateDrawingFileByVent({ keepDisplayFallback: true })
    applyProductionOptionRules()
    normalizeQuickConfigSelections()
    await updateDrawingFileByVent({ keepDisplayFallback: true })
    showNotice(`간편견적 '${header.cfgNm || card.cfgId || detail.cfgId}'을 불러왔습니다`)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '간편견적 적용 실패'
  } finally {
    loading.value = false
  }
}

async function loadWintydiData(row) {
  try {
    const { data } = await searchModelWintydi(row.mdlCd)
    const list = (data?.resultList || []).map((it) => ({
      commCdId: it.commCdVal || it.commCdId,
      commCdNm: it.commCdNm,
      addInfo1: it.addInfo1, addInfo2: it.addInfo2, addInfo3: it.addInfo3, addInfo4: it.addInfo4, addInfo5: it.addInfo5,
    }))
    wintydiList.value = list
    const map = {}
    for (const it of list) map[it.commCdId] = { cntW: it.addInfo1, cntH: it.addInfo2, cntCS: it.addInfo3, sfWinCnt: it.addInfo4, floorInfo: it.addInfo5 }
    wintydiMap.value = map
    const rowWin = row.wintydiCd
    form.value.wintydiCd = (rowWin && map[rowWin]) ? rowWin : (list[0]?.commCdId ?? '')
  } catch (e) {
    wintydiList.value = []
    wintydiMap.value = {}
    form.value.wintydiCd = ''
  }
  form.value.secondFloorEnabled = isSecondFloorEnabled.value
  applyProductionOptionRules()
  refreshDrawingFromCurrentSelection()
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

async function onWintydiChange(val) {
  form.value.wintydiCd = val
  form.value.secondFloorEnabled = isSecondFloorEnabled.value
  if (!form.value.secondFloorEnabled) clearSecondFloorOptionFields()
  applyProductionOptionRules()
  clearSizeFields()
  applyVentDefault()
  await updateDrawingFileByVent({ keepDisplayFallback: true })
}

async function onVentChange(val) {
  form.value.ventLoc = val
  await updateDrawingFileByVent({ keepDisplayFallback: true })
}

function clearSecondFloorOptionFields() {
  form.value.ousdBrcktHEnabled = false
  form.value.insd2FBrcktH = null
  form.value.ousd2FBrcktH = null
  form.value.secondHndlHEnabled = false
  form.value.insd2FHndlH = null
  form.value.ousd2FHndlH = null
}

function onInsdColorChange() {
  if (syncOusd.value) form.value.ousdColrCd = form.value.insdColrCd
}

function onOusdColorChange() {
  syncOusd.value = form.value.ousdColrCd === form.value.insdColrCd
}

function toggleAluMf() {
  if (!form.value.isAluMf) {
    const safetyNetError = validateSafetyNetSelection()
    if (safetyNetError) {
      showError(safetyNetError)
      return
    }
    form.value.isAluMf = true
    form.value.aluMfMdlYn = 'Y'
    if (!form.value.aluMfHandleType && aluMfHandleList.value.length) {
      form.value.aluMfHandleType = safetyNetHandleValue(aluMfHandleList.value[0])
      syncSafetyNetHandleName()
    }
  } else {
    resetSafetyNetOptions()
  }
  applyScreenDefault()
}

// --- 옵션 기본값 적용 ---

function applyVentDefault() {
  const opts = ventOptions.value
  if (!form.value.ventLoc || !opts.some(o => o.commCdId === form.value.ventLoc)) {
    form.value.ventLoc = opts.length ? opts[0].commCdId : ''
  }
}

async function hydrateModelDrawing(row = {}) {
  drawingImageError.value = false
  if (buildSashDrawingUrl(row)) {
    selectedDrawing.value = row
    return
  }
  if (!row.mdlCd) {
    modelDrawings.value = []
    selectedDrawing.value = null
    form.value.drwgCd = ''
    return
  }

  try {
    const { data } = await searchModelList({
      searchMdlCd: row.mdlCd,
      searchUseYn: 'Y',
      startRowNum: 0,
      endRowNum: 99,
    })
    modelDrawings.value = data?.resultList || []
  } catch (_) {
    modelDrawings.value = []
  }
  await updateDrawingFileByVent({ keepDisplayFallback: true })
}

function refreshDrawingFromCurrentSelection() {
  drawingImageError.value = false
  selectedDrawing.value = findMatchingDrawing({
    mdlCd: form.value.mdlCd,
    wintydiCd: form.value.wintydiCd,
    ventLoc: form.value.ventLoc,
  }, modelDrawings.value)
}

async function updateDrawingFileByVent({ keepDisplayFallback = true } = {}) {
  drawingImageError.value = false
  const previousDrawing = keepDisplayFallback ? selectedDrawing.value : null
  form.value.drwgCd = ''

  const currentSelection = {
    mdlCd: form.value.mdlCd,
    wintydiCd: form.value.wintydiCd,
    ventLoc: form.value.ventLoc,
  }

  let apiRow = {}
  if (form.value.wintydiCd && form.value.ventLoc) {
    try {
      const { data } = await searchDrwgFileAjax({
        wintydiCd: form.value.wintydiCd,
        ventLoc: form.value.ventLoc,
      })
      apiRow = normalizeDrwgFileAjaxResult(data)
    } catch (_) {
      apiRow = {}
    }
  }

  const nextState = resolveVentDrawingState({
    apiRow,
    previousDrawing,
    fallbackDrawings: modelDrawings.value,
    currentSelection,
  })
  selectedDrawing.value = nextState.selectedDrawing
  form.value.drwgCd = nextState.drwgCd
}

function applyScreenDefault() {
  const opts = screenOptions.value
  if (!form.value.screenType || !opts.some(o => o.commCdId === form.value.screenType)) {
    form.value.screenType = opts.length ? opts[0].commCdId : ''
  }
}

function normalizeBsmfSelection() {
  if (!bsmfList.value.length) return
  if (form.value.bsmfOrdUtmCd && !bsmfList.value.some(o => o.commCdId === form.value.bsmfOrdUtmCd)) form.value.bsmfOrdUtmCd = ''
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

function normalizeCurrentSelections() {
  normalizeBsmfSelection()
  applyVentDefault()
  applyScreenDefault()
  applyHandleDefault()
  if (form.value.isAluMf && form.value.aluMfHandleType) {
    form.value.aluMfHandleType = normalizeSafetyNetHandleValue(form.value.aluMfHandleType) || form.value.aluMfHandleType
    const exists = aluMfHandleList.value.some((option) => safetyNetHandleValue(option) === form.value.aluMfHandleType)
    if (!exists) form.value.aluMfHandleType = aluMfHandleList.value.length ? safetyNetHandleValue(aluMfHandleList.value[0]) : ''
  }
  syncSafetyNetHandleName()
}

function normalizeQuickConfigSelections() {
  normalizeCurrentSelections()
}

function normalizeBeforeSubmit() {
  applyProductionOptionRules()
  normalizeCurrentSelections()
}

function stringifyOptionValue(value) {
  return value == null || value === '' ? '0' : String(value)
}

function normalizeYn(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  return normalized === 'Y' || normalized === 'TRUE' || normalized === '1' ? 'Y' : 'N'
}

function isYnValue(value) {
  return normalizeYn(value) === 'Y'
}

function isExplicitNo(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  return value === false || normalized === 'N' || normalized === 'FALSE' || normalized === '0'
}

function isSafetyNetModel() {
  return form.value.aluMdlYn === 'Y'
}

function isSafetyNetBsmfAllowed() {
  return ['101', '106', '107', '105'].includes(String(form.value.bsmfOrdUtmCd))
}

function isFourWWindow() {
  return String(wintydiMap.value[form.value.wintydiCd]?.sfWinCnt || '') === '4W'
}

function selectedColorInfo(kind) {
  const code = kind === 'outer' ? form.value.ousdColrCd : form.value.insdColrCd
  return colorList.value.find((item) => item.commCdId === code || item.commCdVal === code) || null
}

function isSafetyNetColorAllowed(kind) {
  const color = selectedColorInfo(kind)
  if (!color || color.addInfo39 == null) return true
  return color.addInfo39 === 'Y'
}

function isDoubleWindow() {
  return form.value.dblWindYn === 'Y'
}

function validateSafetyNetSelection() {
  if (!isSafetyNetBsmfAllowed()) return '선택하신 틀짝망코드에서는 안전망을 선택할 수 없습니다.'
  if (!isSafetyNetModel()) return '안전망 모형이 아닙니다'
  if (isFourWWindow()) return '4W제품은 안전망을 선택할 수 없습니다'
  if (isDoubleWindow() && !isSafetyNetColorAllowed('outer')) return '안전망은 외부창 색상이 안전망가능색상일때만 선택할 수 있습니다.'
  if (!isDoubleWindow() && !isSafetyNetColorAllowed('inner')) return '안전망은 내부창 색상이 안전망가능색상일때만 선택할 수 있습니다.'
  return ''
}

function showNotice(message) {
  error.value = ''
  alertMessage.value = message
}

function showError(message) {
  resetSafetyNetOptions()
  error.value = message
  alertMessage.value = message
}

function closeAlert() {
  alertMessage.value = ''
}

function resetSafetyNetOptions() {
  form.value.isAluMf = false
  form.value.aluMfHandleType = ''
  form.value.aluMfHandleTypeNm = ''
  form.value.aluMfMdlYn = 'Y'
  form.value.aluMfHndlH = null
}

function safetyNetHandleValue(option) {
  return normalizeSafetyNetHandleValue(option?.commCdVal || option?.commCdId) || option?.commCdVal || option?.commCdId || ''
}

function syncSafetyNetHandleName() {
  if (!form.value.isAluMf || !form.value.aluMfHandleType) {
    form.value.aluMfHandleTypeNm = ''
    return
  }
  const selected = aluMfHandleList.value.find((option) => safetyNetHandleValue(option) === form.value.aluMfHandleType)
  form.value.aluMfHandleTypeNm = selected?.commCdNm || ''
}

function isVentHoleAllowed() {
  return form.value.bftydiCd === '119'
}

function isSiliconeFinishAllowedByBsmf() {
  return ['101', '102', '103', '107'].includes(String(form.value.bsmfOrdUtmCd))
}

function applyProductionOptionRules() {
  form.value.ventHoleEnabled = isVentHoleAllowed() || form.value.ventHoleYn
  if (!form.value.ventHoleEnabled) form.value.ventHoleYn = false
  if (!alGlassEnabled.value) form.value.alGlass = false
  if (!siliconeFinishEnabled.value) form.value.slcnFnshYn = false
  if (!form.value.bfTurnDoorOneSideWrapType) form.value.bfOneSideWrapColrNm = ''
  if (form.value.bfMillingType === '0') clearMillingOptions()
  if (!isSafetyNetModel()) {
    resetSafetyNetOptions()
  } else if (!form.value.isAluMf) {
    resetSafetyNetOptions()
  } else if (form.value.aluMfMdlYn === 'Y') {
    form.value.aluMfHndlH = null
  }
}

function clearMillingOptions() {
  form.value.bfMillingDetail = ''
  form.value.bfMillingUp = false
  form.value.bfMillingDown = false
  form.value.bfMillingLeft = false
  form.value.bfMillingRight = false
}

async function applyProductionStandardRules(row = {}) {
  try {
    const { data } = await searchCodeDetail('12', '019')
    const list = normCd(data?.resultList)
    const offRow = list.find((item) => item.commCdId === '019')
    const offCodes = String(offRow?.addInfo1 || '').split(',').map((code) => code.trim()).filter(Boolean)
    row.drnHoleDefaultOffYn = offCodes.includes(row.mdlCd || form.value.mdlCd) ? 'Y' : 'N'
  } catch (_) {
    row.drnHoleDefaultOffYn = 'N'
  }
}

async function applyStandardSpec() {
  form.value.standardSpec = {}
  if (form.value.sashStandardYn !== 'Y' || !form.value.mdlCd) return

  try {
    const { data } = await searchCodeDetail('188', form.value.mdlCd)
    const row = data?.resultData || data?.resultList?.[0] || data || {}
    form.value.standardSpec = {
      dplcDcGrd: row.addInfo14 || '',
      wintydiCd: row.addInfo15 || '',
      wSize: row.addInfo16 || '',
      hSize: row.addInfo17 || '',
      bsmfOrdUtmCd: row.addInfo18 || '',
      insdColrCd: row.addInfo19 || '',
      ousdColrCd: row.addInfo20 || '',
      screenType: row.addInfo21 || '',
      insdHandleType: row.addInfo22 || '',
      ousdHandleType: row.addInfo23 || '',
      sfInsdGlassMtrlCd: row.addInfo26 || '',
      sfOusdGlassMtrlCd: row.addInfo27 || '',
      bfInsdGlassMtrlCd: row.addInfo28 || '',
      bfOusdGlassMtrlCd: row.addInfo29 || '',
      bfArmatureTypeYn: row.addInfo30 || '',
      ventHoleYn: row.addInfo31 || '',
      bfMillingType: row.addInfo32 || '',
      bfWeldNoneYn: row.addInfo33 || '',
      sfArmatureTypeYn: row.addInfo34 || '',
      sfRollerTypeYn: row.addInfo35 || '',
      mfArmatureTypeYn: row.addInfo36 || '',
    }
  } catch (_) {
    form.value.standardSpec = {}
  }
}

function applyProductionOptionDefaults(row = {}) {
  form.value.drnHoleYn = !String(row.drnHoleDefaultOffYn || '').includes('Y')
  form.value.ventHoleYn = false
  form.value.bfMillingType = stringifyOptionValue(row.bfMillingType || row.bfmillingWing || '0')
  form.value.bfArmatureType = ''
  form.value.bfLockCnt = ''
  form.value.bfWrapping = ''
  form.value.bfThrSidePack = ''
  form.value.bfMillingDetail = ''
  form.value.bfMillingUp = false
  form.value.bfMillingDown = false
  form.value.bfMillingLeft = false
  form.value.bfMillingRight = false
  form.value.basedfillingPiecesYn = false
  form.value.glasAttachYn = false
  form.value.bfVentHoleLctn = ''
  form.value.bfWinCbMilingType = ''
  form.value.sfArmatureType = ''
  form.value.mfArmatureType = ''
  form.value.sfOppositeTypeYn = row.sfOppositeTypeYn === 'Y'
  form.value.bfDirectShip = false
  form.value.sfDirectShip = false
  form.value.mfDirectShip = false
  form.value.bfShipAddr = ''
  form.value.sfShipAddr = ''
  form.value.mfShipAddr = ''
  Object.assign(form.value, {
    bfForesidePackYn: false,
    bfKsmarkYn: false,
    bfLxHiddenOptYn: false,
    bfSideView: '',
    bfFmGbYn: false,
    bfFmGbShipYn: false,
    bfFmGbUpDownYn: false,
    bfFmGbRlYn: false,
    bfFmGbCutYn: false,
    bfSsOpt: false,
    bfFixBuild: false,
    bfFdHd: false,
    bfTurnDoorPullType: '',
    bfTurnDoorOneSideWrapType: '',
    bfOneSideWrapColrNm: '',
    bfAptCmType: '',
    bfApt1pjMethod: '',
    bfApt2pjLoc: '',
    bfApt2pjMethod: '',
    bfTurnDoorOnlyMakeYn: false,
    bfVentPiecesIncludeYn: false,
    bfWinOnefixUpHoleYn: false,
    bfWinFmThreeSideYn: false,
    bfWinTopBottomFmYn: false,
    bfWinSpDdlnShpmYn: false,
    bfIhyFixHghtDirYn: false,
    sfInsideRightBrdYn: false,
    sfMcOneReqYn: false,
    sfBrdProcYn: false,
    sfHandleProcYn: false,
    sfOutGlasYn: false,
    sfOutGlasInfo: '',
    sfRoller: '',
    sfCreHook: false,
    sfCreSize: '',
    sfOutType: '',
    sfOutType0: '',
    sfOutType1: '',
    sfOutType2: '',
    sfOutType3: '',
    sfSontaLoca: '',
    sfInsdVentHoleYn: false,
    sfOusdVentHoleYn: false,
    sfAptArmatureType: '',
    sfAptHandleType: '',
    deco1: [],
    winCloser: [],
    mfHandle: '',
    mfHandleHsize: '',
    mfAptArmatureType: '',
    isAluMf: false,
    aluMfHandleType: '',
    aluMfMdlYn: 'Y',
    aluMfHndlH: null,
  })
  applyProductionOptionRules()
}

// --- 네비게이션 ---

function goBack() {
  router.push(`/estimates/${itgEstiNo.value}`)
}

async function loadSavedEstimate(estiSeq) {
  savedSeq.value = ''
  error.value = ''
  editEstiSeq.value = String(estiSeq || '')
  try {
    sessionStorage.removeItem('mobile_sash_edit_row')
  } catch (_) {}
  await router.replace({
    path: '/estimates/sash/new',
    query: {
      itgEstiNo: itgEstiNo.value,
      wEstiNo: wEstiNo.value,
      estiNos: estiNos.value,
      estiSeq: editEstiSeq.value,
    },
  })
  await loadEditData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// --- 저장 ---

async function saveAndAdd() {
  const result = await submit({ asNewSeq: true })
  if (result.ok) await loadSavedEstimate(result.estiSeq)
}

async function saveAndClose() {
  const result = await submit()
  if (result.ok) goBack()
}

async function submit({ asNewSeq = false } = {}) {
  error.value = ''
  savedSeq.value = ''

  if (isReadonly.value) return failSubmit('현재 수정할 수 없는 상태입니다')

  normalizeBeforeSubmit()
  await updateDrawingFileByVent({ keepDisplayFallback: true })

  const segmentError = validateSegmentSizes()
  if (segmentError) return failSubmit(segmentError)
  const standardError = validateStandardModelSpec()
  if (standardError) return failSubmit(standardError)
  const productionError = validateProductionOptions()
  if (productionError) return failSubmit(productionError)

  if (!itgEstiNo.value) return failSubmit('통합견적번호가 없습니다')
  if (!form.value.mdlCd) return failSubmit('모형을 선택하세요')
  if (!form.value.wintydiCd) return failSubmit('창형태를 선택하세요')
  if (!form.value.bsmfOrdUtmCd) return failSubmit('틀짝망을 선택하세요')
  if (!form.value.sashOrdTypCd) return failSubmit('발주구분을 선택하세요')
  if (!form.value.dplcDcGrd) return failSubmit('할인등급을 선택하세요')
  if (form.value.dplcDcGrd === 'S') return failSubmit('S등급은 샤시 견적 저장이 불가합니다. 견적헤더 할인등급을 수정하세요.')
  if (!form.value.w || !form.value.h) return failSubmit('W/H 사이즈를 입력하세요')
  if (!form.value.qty || form.value.qty < 1) return failSubmit('수량을 1 이상 입력하세요')
  if (form.value.alGlass && !alGlassEnabled.value) return failSubmit('알유리견적을 선택할 수 없는 모형입니다')
  if (!form.value.screenType) return failSubmit('스크린을 선택하세요')
  if (!form.value.ventLoc) return failSubmit('VENT를 선택하세요')
  if (form.value.isAluMf) {
    const safetyNetError = validateSafetyNetSelection()
    if (safetyNetError) return failSubmit(safetyNetError)
  }
  if (form.value.bftydiCd === '113' && (form.value.insdHandleType === '2' || form.value.ousdHandleType === '2')) return failSubmit('발코니창은 매립핸들이 불가능합니다')
  if ((form.value.insdHandleType === '2' || form.value.ousdHandleType === '2') && pickedMdlMtrlCo.value !== 'CA') return failSubmit('자재회사가 청암일 경우에만 매립핸들을 선택할 수 있습니다')
  if (!form.value.insdColrCd) return failSubmit('내부 색상을 선택하세요')
  if (!form.value.insdSf) return failSubmit('SF내 자재를 선택하세요')
  if (ousdSfList.value.length && !form.value.ousdSf) return failSubmit('SF외 자재를 선택하세요')
  if (form.value.bfMillingType !== '0' && !form.value.bfMillingDetail) return failSubmit('밀링유형상세를 선택하세요')
  if (form.value.bfDirectShip && !form.value.bfShipAddr) return failSubmit('BF 직송주소를 입력하세요')
  if (form.value.sfDirectShip && !form.value.sfShipAddr) return failSubmit('SF 직송주소를 입력하세요')
  if (form.value.mfDirectShip && !form.value.mfShipAddr) return failSubmit('MF 직송주소를 입력하세요')
  if (form.value.sfOutGlasYn && !form.value.sfOutGlasInfo) return failSubmit('유리사양을 입력하세요')
  if (form.value.mfHandle === '2' && !form.value.mfHandleHsize) return failSubmit('망핸들높이를 입력하세요')

  loading.value = true
  try {
    const payload = buildPayload({ asNewSeq })
    if (!payload.ventLoc && ventOptions.value.length) {
      payload.ventLoc = ventOptions.value[0].commCdId
      form.value.ventLoc = payload.ventLoc
    }
    const { data } = await saveSashEsti(payload)
    if (data.resultCd === 'save.ok' || data.resultCd === 'save.success' || data.resultCd === 'procedure complete') {
      savedSeq.value = data.estiSeq || payload.estiSeq || '저장됨'
      const verifyResult = await verifySavedSashEstimate(savedSeq.value)
      if (!verifyResult.ok) showNotice(`저장은 되었으나 재조회 확인 실패: ${verifyResult.message}`)
      return { ok: true, estiSeq: savedSeq.value, verifyOk: verifyResult.ok }
    } else {
      error.value = saveErrorMessage(data)
      return { ok: false }
    }
  } catch (e) {
    console.error('Sash save failed', e)
    error.value = exceptionErrorMessage(e)
    return { ok: false }
  } finally {
    loading.value = false
  }
}

function saveErrorMessage(data = {}) {
  return `저장 실패\nresultCd: ${data.resultCd || '(없음)'}\nmessage: ${data.resultMessage || data.message || '(없음)'}`
}

function exceptionErrorMessage(e) {
  const serverMessage = e?.response?.data?.message || e?.response?.data?.resultMessage
  return `예외 발생\n${serverMessage || e?.message || '저장 중 오류가 발생했습니다'}`
}

function failSubmit(message) {
  error.value = message
  return { ok: false }
}

function savedSashRowFromResponse(data = {}) {
  if (data?.resultData) return data.resultData
  if (Array.isArray(data?.resultList)) return data.resultList[0] || null
  if (data?.estiSeq) return data
  return null
}

async function verifySavedSashEstimate(estiSeq) {
  const targetSeq = String(estiSeq || '').trim()
  if (!targetSeq || targetSeq === '저장됨') return { ok: false, message: '저장 순번을 확인할 수 없습니다' }

  try {
    const { data } = await selectSashDetail({
      itgEstiNo: itgEstiNo.value,
      estiNo: wEstiNo.value,
      estiNos: estiNos.value,
      estiSeq: targetSeq,
    })
    const row = savedSashRowFromResponse(data)
    const confirmedSeq = String(row?.estiSeq || '').trim()
    if (confirmedSeq && confirmedSeq === targetSeq) {
      return { ok: true, alGlassChecked: form.value.alGlass || row?.glasStdalYn === 'Y' }
    }
    return { ok: false, message: '저장 행을 다시 조회하지 못했습니다' }
  } catch (_) {
    return { ok: false, message: '저장 행 재조회 중 오류가 발생했습니다' }
  }
}

function amountText(value) {
  if (value === '' || value == null) return '-'
  const numberValue = Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(numberValue)) return String(value)
  return numberValue.toLocaleString('ko-KR')
}

function validateSegmentSizes() {
  const cntInfo = wintydiMap.value[form.value.wintydiCd] || {}
  const cntW = Number(cntInfo.cntW) || 0
  const cntH = Number(cntInfo.cntH) || 0
  const cntCS = Number(cntInfo.cntCS) || 0

  const wError = validateSizeRange('W', 'w', 'llmtNrmW', 'uplmNrmW')
  if (wError) return wError
  const hError = validateSizeRange('H', 'h', 'llmtNrmH', 'uplmNrmH')
  if (hError) return hError

  for (let index = 1; index < cntW; index += 1) {
    const field = `w${index}`
    if (form.value[field] === '' || form.value[field] == null) return `W${index} 사이즈를 입력하세요`
    const rangeError = validateSizeRange(`W${index}`, field, `llmtNrmW${index}`, `uplmNrmW${index}`)
    if (rangeError) return rangeError
  }

  for (let index = 1; index < cntH; index += 1) {
    const field = `h${index}`
    if (form.value[field] === '' || form.value[field] == null) return `H${index} 사이즈를 입력하세요`
    const rangeError = validateSizeRange(`H${index}`, field, `llmtNrmH${index}`, `uplmNrmH${index}`)
    if (rangeError) return rangeError
  }

  for (let index = 0; index < cntCS; index += 1) {
    const field = index === 0 ? 'cs' : `cs${index}`
    const label = index === 0 ? 'CS' : `CS${index}`
    if (form.value[field] === '' || form.value[field] == null) return `${label} 사이즈를 입력하세요`
  }

  return ''
}

function validateSizeRange(label, valueField, lowerField, upperField) {
  const value = Number(form.value[valueField])
  const lower = Number(form.value[lowerField])
  const upper = Number(form.value[upperField])
  if (form.value[lowerField] !== '' && Number.isFinite(lower) && value < lower) return `${label} 사이즈는 ${form.value[lowerField]} 이상 입력하세요`
  if (form.value[upperField] !== '' && Number.isFinite(upper) && value > upper) return `${label} 사이즈는 ${form.value[upperField]} 이하 입력하세요`
  return ''
}

function includesSpecValue(specValue, currentValue) {
  if (!specValue || !currentValue) return false
  return String(specValue).split(',').map((item) => item.trim()).filter(Boolean).includes(String(currentValue))
}

function shouldValidateSfGlass() {
  return ['101', '102', '104', '106'].includes(String(form.value.bsmfOrdUtmCd))
}

function shouldValidateBfGlass() {
  return ['101', '102', '103', '107'].includes(String(form.value.bsmfOrdUtmCd))
}

function selectedGlassItems() {
  return [
    [glas.value.sfIn, form.value.mtrlCds1],
    [glas.value.sfOut, form.value.mtrlCds2],
    [glas.value.bfIn, form.value.mtrlCds3],
    [glas.value.bfOut, form.value.mtrlCds4],
  ].map(([list, code]) => (list || []).find((item) => String(item.mtrlCd) === String(code))).filter(Boolean)
}

function isGlassXMaterial(item) {
  return String(item?.mtrlNm || '').replace(/\s/g, '').includes('유리X')
}

function isGlassExcludedMaterial(item) {
  return String(item?.etc || item?.addInfo1 || '') === '3' || String(item?.mtrlNm || '').includes('유리제외')
}

function hasGlassXSelection() {
  return selectedGlassItems().some(isGlassXMaterial)
}

function hasGlassExcludedSelection() {
  return selectedGlassItems().some(isGlassExcludedMaterial)
}

function canUseGlassX() {
  if (form.value.sashGlasXMtrlYn !== 'Y') return true
  const allowedOrderTypes = String(form.value.sashOrdTypCds || '').split(',').map((code) => code.trim()).filter(Boolean)
  return allowedOrderTypes.includes(String(form.value.sashOrdTypCd))
}

function hasSfOutPosition() {
  return !!(form.value.sfOutType0 || form.value.sfOutType1 || form.value.sfOutType2 || form.value.sfOutType3)
}

function validateSfOutType() {
  if (form.value.sfOutType && !hasSfOutPosition()) return 'SF 외짝 선택 시 창별 위치도 선택하세요'
  return ''
}

function validateStandardModelSpec() {
  if (form.value.sashStandardYn !== 'Y') return ''
  const spec = form.value.standardSpec || {}

  if (spec.wintydiCd && spec.wintydiCd !== form.value.wintydiCd) return '창형태를 규격사양으로 선택하세요'
  if (spec.dplcDcGrd && spec.dplcDcGrd !== form.value.dplcDcGrd) return '할인등급을 다시 선택하세요'
  if (spec.wSize && String(spec.wSize) !== String(form.value.w)) return 'W치수를 규격사양으로 입력하세요'
  if (spec.hSize && String(spec.hSize) !== String(form.value.h)) return 'H치수를 규격사양으로 입력하세요'
  if (spec.bsmfOrdUtmCd && spec.bsmfOrdUtmCd !== form.value.bsmfOrdUtmCd) return '틀짝망을 규격사양으로 선택하세요'
  if (spec.insdColrCd && spec.insdColrCd !== form.value.insdColrCd) return '내부창색상을 규격사양으로 선택하세요'
  if (spec.ousdColrCd && spec.ousdColrCd !== form.value.ousdColrCd) return '외부창색상을 규격사양으로 선택하세요'
  if (spec.screenType && spec.screenType !== form.value.screenType) return '스크린을 규격사양으로 선택하세요'
  if (spec.insdHandleType && spec.insdHandleType !== form.value.insdHandleType) return '내측 핸들을 규격사양으로 선택하세요'
  if (spec.ousdHandleType && spec.ousdHandleType !== form.value.ousdHandleType) return '외측 핸들을 규격사양으로 선택하세요'
  if (spec.sfInsdGlassMtrlCd && shouldValidateSfGlass() && !includesSpecValue(spec.sfInsdGlassMtrlCd, form.value.mtrlCds1)) return 'SF내측유리를 규격사양으로 선택하세요'
  if (spec.sfOusdGlassMtrlCd && shouldValidateSfGlass() && !includesSpecValue(spec.sfOusdGlassMtrlCd, form.value.mtrlCds2)) return 'SF외측유리를 규격사양으로 선택하세요'
  if (spec.bfInsdGlassMtrlCd && shouldValidateBfGlass() && !includesSpecValue(spec.bfInsdGlassMtrlCd, form.value.mtrlCds3)) return 'BF내측유리를 규격사양으로 선택하세요'
  if (spec.bfOusdGlassMtrlCd && shouldValidateBfGlass() && !includesSpecValue(spec.bfOusdGlassMtrlCd, form.value.mtrlCds4)) return 'BF외측유리를 규격사양으로 선택하세요'
  if (spec.bfArmatureTypeYn === 'N' && form.value.bfArmatureType) return 'BF보강재를 규격사양으로 선택하세요'
  if (spec.ventHoleYn === 'N' && form.value.ventHoleYn) return 'BF통기홀을 규격사양으로 선택하세요'
  if (spec.bfMillingType && spec.bfMillingType !== 'Y' && spec.bfMillingType !== 'N' && form.value.bfMillingType !== '0' && spec.bfMillingType !== form.value.bfMillingType) return 'BF밀링유형을 규격사양으로 선택하세요'
  if (spec.bfWeldNoneYn === 'N' && form.value.bfWeldNoneYn) return 'BF절단바로를 규격사양으로 선택하세요'
  if (spec.sfArmatureTypeYn === 'N' && form.value.sfArmatureType) return 'SF보강재를 규격사양으로 선택하세요'
  if (spec.sfRollerTypeYn === 'N' && form.value.sfRoller) return 'SF로라를 규격사양으로 선택하세요'
  if (spec.mfArmatureTypeYn === 'N' && form.value.mfArmatureType) return 'MF보강재를 규격사양으로 선택하세요'

  return ''
}

function validateProductionOptions() {
  const sfOutError = validateSfOutType()
  if (sfOutError) return sfOutError
  if (hasGlassXSelection() && !canUseGlassX()) return '유리X 자재를 선택할 수 없습니다'
  if (form.value.slcnFnshYn && !isSiliconeFinishAllowedByBsmf()) return '선택하신 틀짝망에서는 실리콘마감을 선택할 수 없습니다'
  if (form.value.slcnFnshYn && hasGlassExcludedSelection()) return '실리콘마감은 유리제외 옵션을 선택할 수 없습니다'
  if (form.value.bfTurnDoorOneSideWrapType && !form.value.bfOneSideWrapColrNm) return '터닝도어 일면래핑색상을 입력하세요'
  if (form.value.isAluMf && form.value.aluMfMdlYn !== 'Y' && !form.value.aluMfHndlH) return '안전망 높이를 입력하세요'
  return ''
}

function buildPayload({ asNewSeq = false } = {}) {
  syncSafetyNetHandleName()
  return buildSashSavePayload({
    form: form.value,
    itgEstiNo: itgEstiNo.value,
    wEstiNo: wEstiNo.value,
    estiNos: estiNos.value,
    editEstiSeq: asNewSeq ? '' : editEstiSeq.value,
  })
}
</script>

<style scoped>
.sash-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 8px;
}

.sash-header-title {
  min-width: 0;
}

.sash-header-title .page-title,
.sash-header-title .page-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sash-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  justify-self: end;
  white-space: nowrap;
}

.sash-header-back {
  width: 40px;
  min-width: 40px;
  height: 32px;
  padding: 0;
  flex-shrink: 0;
}

.sash-header .btn-quick-config {
  height: 32px;
  padding: 0 8px;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}
</style>
