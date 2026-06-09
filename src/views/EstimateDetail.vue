<template>
  <div>
    <div v-if="openingSash" class="route-loading-mask">
      <div class="route-loading-panel">
        <div class="loading-text">샤시 상세 불러오는 중...</div>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <div class="page-title-row">
      <h2 class="page-title">견적 상세</h2>
      <div class="title-actions">
        <button class="btn secondary btn-xs" @click="router.push(`/estimates/${itgEstiNo}/sash-summary`)">견적요약</button>
        <button class="btn-back" @click="router.back()">뒤로</button>
      </div>
    </div>

    <div v-if="loading" class="empty">불러오는 중...</div>
    <div v-else-if="!header" class="empty">견적을 찾을 수 없습니다.</div>
    <template v-else>
      <section class="card estimate-detail-hero">
        <div class="estimate-hero-main">
          <div>
            <div class="detail-label">통합견적번호</div>
            <div class="detail-value">{{ header.itgEstiNo }}</div>
            <div class="detail-title">{{ header.itgEstiNm || header.dplcNm || '견적 상세' }}</div>
          </div>
          <div class="estimate-hero-status">
            <span class="badge">{{ statusLabel(header) }}</span>
            <strong>{{ fmtPrice(estimateTotals.total) }}원</strong>
          </div>
        </div>

        <div class="estimate-hero-meta">
          <span>{{ header.dplcNm || '-' }}</span>
          <span>{{ header.bzpcNm || header.bzpc || '-' }}</span>
          <span>등록 {{ formatDt(header.inputDtm) }}</span>
          <span v-if="header.estiVldDt">유효 {{ formatDate(header.estiVldDt) }}</span>
        </div>

        <div class="estimate-header-info">
          <div>
            <span>거래처</span>
            <strong>{{ header.dplcNm || '-' }}</strong>
          </div>
          <div>
            <span>현장명</span>
            <strong>{{ header.jobsNm || '-' }}</strong>
          </div>
          <div class="estimate-header-info-wide">
            <span>고객견적비고</span>
            <strong class="estimate-header-info-value">{{ header.dplcReqRemSrc || '-' }}</strong>
          </div>
        </div>

        <div class="section-title">할인등급</div>
        <div class="estimate-grade-summary grade-row">
          <div v-for="item in headerGradeItems" :key="item.label" class="grade-item">
            <span class="grade-label">{{ item.label }}</span>
            <span class="grade-value">{{ item.value || '-' }}</span>
          </div>
        </div>

        <div class="summary-amounts">
          <div>
            <span>공급가</span>
            <strong>{{ fmtPrice(estimateTotals.supply) }}원</strong>
          </div>
          <div>
            <span>VAT</span>
            <strong>{{ fmtPrice(estimateTotals.vat) }}원</strong>
          </div>
        </div>
        <div class="category-summary">
          <span>샤시 {{ fmtPrice(categoryTotals.sash) }}원</span>
          <span>알유리 {{ fmtPrice(categoryTotals.glass) }}원</span>
          <span>{{ sashRows.length + glassRows.length }}개 품목</span>
        </div>
        <div class="estimate-action-row">
          <button v-if="canEditHeader" class="btn secondary" @click="router.push(`/estimates/${itgEstiNo}/edit`)">헤더 수정</button>
          <button v-if="canAddItem" class="btn accent" :disabled="issuing" @click="openItemSheet">
            {{ issuing ? '준비 중...' : '+ 품목 추가' }}
          </button>
        </div>
        <div v-if="issueError" class="error">{{ issueError }}</div>
      </section>

      <!-- 샤시 견적 목록 -->
      <section class="sash-detail-layout">
        <div class="card sash-list-pane">
          <div class="section-title">
            샤시 견적 {{ sashRows.length ? `(${sashRows.length})` : '' }}
          </div>
          <div v-if="!sashRows.length" class="empty" style="padding:20px 0">등록된 샤시 견적이 없습니다.</div>
          <SashListCard
            v-for="row in sashRows"
            :key="sashRowKey(row)"
            :selected="sashRowKey(row) === sashRowKey(selectedSashRow)"
            :model-text="buildSashModelText(row)"
            :window-type-text="buildWindowTypeText(row)"
            :sequence-text="row.estiSeq"
            :status-text="statusLabel(row)"
            :status-class="statusBadgeClass(row)"
            :size-text="buildSize(row)"
            :qty-text="buildSashMeta(row).qtyText"
            :color-text="buildColor(row)"
            :bsmf-text="buildBsmfText(row)"
            :option-chips="buildListOptionChips(row)"
            :total-text="fmtPrice(rowTotal(row))"
            @select="selectSash(row)"
          />
        </div>
        <div class="sash-detail-pane">
          <SashDetailPanel
            v-if="selectedSashRow"
            :key="sashRowKey(selectedSashRow)"
            :model-text="buildSashModelText(selectedSashRow)"
            :window-type-text="buildWindowTypeText(selectedSashRow)"
            :sequence-text="selectedSashRow.estiSeq"
            :status-text="statusLabel(selectedSashRow)"
            :status-class="statusBadgeClass(selectedSashRow)"
            :editable="isSashEditable(selectedSashRow)"
            :drawing-url="sashDrawingUrl(selectedSashRow)"
            :fallback-text="buildWindowTypeText(selectedSashRow)"
            :supply-text="fmtPrice(rowSupply(selectedSashRow))"
            :vat-text="fmtPrice(rowVat(selectedSashRow))"
            :total-text="fmtPrice(rowTotal(selectedSashRow))"
            :option-chips="buildCustomerOptionChips(selectedSashRow)"
            :customer-items="buildCustomerConfirmItems(selectedSashRow)"
            :size-items="buildSizeDetailItems(selectedSashRow)"
            :material-items="buildMaterialHardwareItems(selectedSashRow)"
            :internal-items="buildInternalProductionItems(selectedSashRow)"
            @edit="editSash(selectedSashRow)"
            @image-error="handleSashImageError(selectedSashRow)"
          />
          <div v-else class="card sash-detail-empty">
            샤시를 선택하면 상세 정보가 표시됩니다.
          </div>
        </div>
      </section>

      <!-- 샤시 저장 시 생성된 알유리 견적 목록 -->
      <div class="card">
        <div class="section-title">
          알유리 견적 {{ glassRows.length ? `(${glassRows.length})` : '' }}
        </div>
        <div v-if="!glassRows.length" class="empty" style="padding:20px 0">등록된 알유리 견적이 없습니다.</div>
        <div
          v-for="row in glassRows"
          :key="`${row.estiNo || 'glass'}_${row.estiSeq}`"
          class="sash-card sash-card-readonly"
        >
          <div class="sash-card-header">
            <span class="sash-model">{{ row.mdlNm || row.mtrlNm || row.mtrlCd || '알유리' }}</span>
            <span class="sash-seq">#{{ row.estiSeq }}</span>
            <span class="badge badge-soft">자동생성</span>
            <span class="badge badge-dark">읽기전용</span>
            <span :class="statusBadgeClass(row)">{{ statusLabel(row) }}</span>
          </div>
          <div class="readonly-note">샤시 저장 시 생성된 알유리 견적입니다. 샤시 수정 화면으로 이동하지 않습니다.</div>
          <div class="sash-specs">
            <div class="sash-spec">
              <span class="sash-spec-label">사이즈</span>
              <span class="sash-spec-value">{{ buildSize(row) }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">수량</span>
              <span class="sash-spec-value">{{ row.qty || '-' }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">구분</span>
              <span class="sash-spec-value">{{ row.ctgr2Nm || '알유리' }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">색상</span>
              <span class="sash-spec-value">{{ row.color || row.colrNm || '-' }}</span>
            </div>
          </div>
          <div class="sash-price-row">
            <div class="sash-price">
              <span class="sash-price-label">공급가</span>
              <span class="sash-price-value">{{ fmtPrice(row.totCstAmtAddGlas || row.totSaleAmt || row.sumSaleCst) }}</span>
            </div>
            <div class="sash-price">
              <span class="sash-price-label">VAT</span>
              <span class="sash-price-value">{{ fmtPrice(row.vatAmt || row.totVatAmt) }}</span>
            </div>
            <div class="sash-price sash-price-total">
              <span class="sash-price-label">합계</span>
              <span class="sash-price-value">{{ fmtPrice(row.vatTotCstAmt || row.totAmt || row.chrgAmt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showItemSheet" class="modal-mask" @click.self="closeItemSheet">
        <div class="modal-sheet">
          <h3>품목 추가</h3>
          <button class="sheet-row" :disabled="issuing" @click="addSash">
            <span>
              <strong>샤시</strong>
              <small>샤시 견적 작성</small>
            </span>
            <em>사용 가능</em>
          </button>
          <button class="sheet-row" disabled>
            <span>
              <strong>알유리 직접입력</strong>
              <small>자동생성 알유리와 별도 화면으로 확장 예정</small>
            </span>
            <em>준비중</em>
          </button>
          <button class="sheet-row" disabled>
            <span><strong>몰딩</strong><small>추후 추가</small></span>
            <em>준비중</em>
          </button>
          <button class="sheet-row" disabled>
            <span><strong>도어</strong><small>추후 추가</small></span>
            <em>준비중</em>
          </button>
          <button class="sheet-row" disabled>
            <span><strong>유통자재</strong><small>추후 추가</small></span>
            <em>준비중</em>
          </button>
          <button class="sheet-row" disabled>
            <span><strong>패키지</strong><small>추후 추가</small></span>
            <em>준비중</em>
          </button>
          <button class="btn secondary modal-footer" @click="closeItemSheet">닫기</button>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  selectEstiHeader,
  searchCodeList,
  searchColorList,
  searchGlasList,
  searchModelList,
  searchModelSf,
  searchModelWintydi,
  searchSashList,
  selectSashDetail,
  issueEstiNo,
} from '../api/estimate'
import SashDetailPanel from '../components/SashDetailPanel.vue'
import SashListCard from '../components/SashListCard.vue'
import {
  buildSashDrawingUrl,
  buildSashMeta,
  buildSashModelText,
  mergeSashDetailRow,
  mergeSashDrawingFiles,
  normalizeSashRows,
  resolveWindEstiNo,
} from '../utils/estimateDetail'
import { UNKNOWN_STATUS, isEditableHeaderStatus, isEditableStatus, resolveEffectiveStatus } from '../utils/estimateStatus'

const route = useRoute()
const router = useRouter()
const itgEstiNo = route.params.itgEstiNo

const header = ref(null)
const wEstiNo = ref('')
const sashRows = ref([])
const glassRows = ref([])
const screenList = ref([])
const ventList = ref([])
const colorList = ref([])
const bsmfList = ref([])
const handleList = ref([])
const sashPanelNameMaps = ref({})
const loading = ref(false)
const issuing = ref(false)
const openingSash = ref(false)
const showItemSheet = ref(false)
const issueError = ref('')
const selectedSashKey = ref('')

const headerStatus = computed(() => resolveEffectiveStatus(header.value?.stCd, header.value?.igStCd))
const canEditHeader = computed(() => ['0', '10'].includes(headerStatus.value))

// 품목 추가는 헤더 0/10/20 상태에서 가능. 상태 미확인은 fail-closed.
const canAddItem = computed(() => isEditableHeaderStatus(headerStatus.value))

const estimateTotals = computed(() => sumRows([...sashRows.value, ...glassRows.value]))
const categoryTotals = computed(() => ({
  sash: sumRows(sashRows.value).total,
  glass: sumRows(glassRows.value).total,
}))
const headerGradeItems = computed(() => {
  const h = header.value || {}
  return [
    { label: '샤시', value: formatGradeValue(h, 'dplcDcGrd', 'dplcDcGrdNm') },
    { label: '도어', value: formatGradeValue(h, 'dplcDcGrdDoor', 'dplcDcGrdDoorNm') },
    { label: '판넬', value: formatGradeValue(h, 'dplcDcGrdPannel', 'dplcDcGrdPannelNm') },
    { label: '타사', value: formatGradeValue(h, 'dplcDcGrdOtherComp', 'dplcDcGrdOtherCompNm') },
    { label: '알유리', value: formatGradeValue(h, 'dplcDcGrdGlas', 'dplcDcGrdGlasNm') },
    { label: '몰딩', value: formatGradeValue(h, 'dplcDcGrdMold', 'dplcDcGrdMoldNm') },
    { label: '유통자재', value: formatGradeValue(h, 'dplcDcGrdDtbtMtrl', 'dplcDcGrdDtbtMtrlNm') },
    { label: '유통상품', value: formatGradeValue(h, 'dplcDcGrdDtbtGoods', 'dplcDcGrdDtbtGoodsNm') },
  ]
})
const selectedSashRow = computed(() =>
  sashRows.value.find((row) => sashRowKey(row) === selectedSashKey.value) || sashRows.value[0] || null
)

// 상태 코드 → 표시 이름
function statusLabel(row) {
  const cd = resolveEffectiveStatus(row.stCd, row.igStCd, headerStatus.value)
  if (cd === UNKNOWN_STATUS) return '상태미확인'
  if (row.stNm) return row.stNm
  const map = { '10': '견적', '20': '장바구니', '50': '주문', '51': '수주', '65': '절단', '66': '생산', '80': '출고', '90': '완료' }
  return map[cd] || cd
}

// 상태 코드 → 배지 CSS
function statusBadgeClass(row) {
  const cd = resolveEffectiveStatus(row.stCd, row.igStCd, headerStatus.value)
  if (cd === '10') return 'badge'
  if (cd === '20') return 'badge badge-warn'
  if (cd === '50' || cd === '51') return 'badge badge-success'
  return 'badge badge-dark'
}

function formatDate(s) {
  if (!s) return ''
  const t = String(s).replace(/[-/.]/g, '')
  if (t.length >= 8) return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}`
  if (String(s).includes('-')) return String(s).slice(0, 10)
  return String(s)
}
function formatDt(s) { return s ? String(s).slice(0, 10) : '' }
function fmtPrice(v) { return Number(v || 0).toLocaleString() }

function formatGradeValue(row, codeKey, nameKey) {
  const code = firstText(row?.[codeKey])
  const name = firstText(row?.[nameKey])
  if (name && name !== code) return name
  return code || '-'
}

function amountNumber(...values) {
  for (const value of values) {
    if (value !== '' && value != null) return Number(String(value).replace(/,/g, '')) || 0
  }
  return 0
}

function rowSupply(row) {
  return amountNumber(row.totCstAmtAddGlas, row.totSaleAmt, row.sumSaleCst)
}

function rowVat(row) {
  return amountNumber(row.vatAmt, row.totVatAmt)
}

function rowTotal(row) {
  const explicit = amountNumber(row.vatTotCstAmt, row.totAmt, row.chrgAmt)
  return explicit || rowSupply(row) + rowVat(row)
}

function sashRowKey(row = {}) {
  if (!row) return ''
  const sequence = row.estiSeq || [
    row.mdlCd,
    row.wintydiCd,
    row.ventLoc,
    row.wSize || row.WSize || row.w0Size,
    row.hSize || row.HSize || row.h0Size,
    row.qty,
  ].filter((value) => value != null && value !== '').join('_')
  return `${row.estiNo || row.windEstiNo || wEstiNo.value || 'sash'}_${row.estiNos || '1'}_${sequence || 'row'}`
}

function selectSash(row) {
  selectedSashKey.value = sashRowKey(row)
}

function isSashEditable(row) {
  const cd = resolveEffectiveStatus(row?.stCd, row?.igStCd, headerStatus.value)
  return isEditableStatus(headerStatus.value) && isEditableStatus(cd)
}

function sumRows(rows) {
  return rows.reduce((acc, row) => {
    acc.supply += rowSupply(row)
    acc.vat += rowVat(row)
    acc.total += rowTotal(row)
    return acc
  }, { supply: 0, vat: 0, total: 0 })
}

function buildSize(row) {
  if (row.wh) return row.wh
  const w = row.wSize || row.WSize || row.w0Size || ''
  const h = row.hSize || row.HSize || row.h0Size || ''
  if (!w && !h) return '-'
  return `${w} x ${h}`
}

function buildColor(row) {
  const base = resolveNamedSpec({ row, nameKeys: ['crtnColrNm'], codeKeys: ['crtnColrCd'], lists: [colorList.value] })
  const inside = resolveNamedSpec({ row, nameKeys: ['insdColrNm'], codeKeys: ['insdColrCd'], lists: [colorList.value] })
  const outside = resolveNamedSpec({ row, nameKeys: ['ousdColrNm'], codeKeys: ['ousdColrCd'], lists: [colorList.value] })
  const fallback = resolveNamedSpec({ row, nameKeys: ['color', 'colrNm'], codeKeys: ['colrCd'], lists: [colorList.value] })
  const parts = []
  if (base && base !== '-') parts.push(`기준 ${base}`)
  if (inside && outside && inside !== outside) parts.push(`내 ${inside}/외 ${outside}`)
  else if (inside && inside !== '-') parts.push(inside)
  else if (outside && outside !== '-') parts.push(outside)
  if (!parts.length && fallback && fallback !== '-') parts.push(fallback)
  return parts.join(' · ') || '-'
}

function buildHandle(row) {
  const inner = row.hdlInsd || ''
  const outer = row.hdlOusd || ''
  if (!inner && !outer) return '-'
  if (inner === outer || !outer) return inner
  if (!inner) return outer
  return `${inner}/${outer}`
}

function firstText(...values) {
  const value = values.find((item) => item != null && item !== '')
  return value == null ? '' : String(value)
}

function normalizeDisplayCodeList(rows = []) {
  return rows.map((row) => {
    const summaryCode = firstText(
      row.summaryCode,
      row.commCdId,
      row.commCdVal,
      row.colrCd,
      row.wintydiCd,
      row.mtrlProdCd,
      row.mtrlCd,
      row.glasCd,
      row.cd,
      row.code,
      row.value,
      row.id
    )
    const summaryName = firstText(
      row.summaryName,
      row.commCdNm,
      row.colrNm,
      row.wintydiNm,
      row.mtrlProdCdNm,
      row.mtrlProdNm,
      row.mtrlCdNm,
      row.mtrlNm,
      row.glasNm,
      row.cdNm,
      row.codeNm,
      row.name,
      row.label,
      row.text
    )
    return {
      ...row,
      summaryCode,
      summaryName,
      commCdId: row.commCdId || summaryCode,
      commCdNm: row.commCdNm || summaryName,
    }
  })
}

function normalizedText(value) {
  return String(value ?? '').trim()
}

function sameText(leftValue, rightValue) {
  return normalizedText(leftValue) !== '' && normalizedText(leftValue) === normalizedText(rightValue)
}

function itemCode(item = {}) {
  return firstText(item.summaryCode, item.commCdId, item.commCdVal)
}

function itemName(item = {}) {
  return firstText(item.summaryName, item.commCdNm, item.addInfo1)
}

function collectKnownCodes(lists = []) {
  return lists.flat().map(itemCode).filter(Boolean).map(String)
}

function looksLikeRawCode(value, knownCodes = []) {
  const text = normalizedText(value)
  if (!text) return false
  if (knownCodes.map(String).includes(text)) return true
  if (/^(Y|N|TRUE|FALSE)$/i.test(text)) return true
  if (/^R\d+$/i.test(text)) return true
  if (/^\d{1,4}$/.test(text)) return true
  if (/^[A-Z]{0,5}\d{1,6}[A-Z0-9_-]*$/i.test(text)) return true
  if (/^[A-Z0-9]{1,5}[-_][A-Z0-9_-]+$/i.test(text)) return true
  return false
}

function findCodeName(lists = [], value) {
  const code = normalizedText(value)
  if (!code) return ''
  for (const list of lists.filter(Array.isArray)) {
    const matched = list.find((item) => sameText(itemCode(item), code))
    const name = itemName(matched)
    if (name && !sameText(name, code) && !looksLikeRawCode(name, [code])) return name
  }
  return ''
}

function isKnownCode(lists = [], value) {
  const code = normalizedText(value)
  if (!code) return false
  return lists.filter(Array.isArray).some((list) => list.some((item) => sameText(itemCode(item), code)))
}

function resolveNamedSpec({ row = {}, nameKeys = [], codeKeys = [], lists = [], allowCodeFallback = false, codeLabels = {} } = {}) {
  const code = firstText(...codeKeys.map((key) => row[key]))
  const savedName = firstText(...nameKeys.map((key) => row[key]))
  const safeLists = lists.filter(Array.isArray)
  const knownCodes = collectKnownCodes(safeLists)

  if (code) {
    const mappedName = findCodeName(safeLists, code)
    if (mappedName) return mappedName
    if (codeLabels[code]) return codeLabels[code]
  }

  if (savedName) {
    if (!sameText(savedName, code) && !isKnownCode(safeLists, savedName) && !looksLikeRawCode(savedName, [code, ...knownCodes])) {
      return savedName
    }
    const remappedName = findCodeName(safeLists, savedName)
    if (remappedName) return remappedName
    if (codeLabels[savedName]) return codeLabels[savedName]
  }

  return allowCodeFallback ? code : ''
}

function isYnValue(value) {
  return String(value || '').toUpperCase() === 'Y'
}

function yesNo(value) {
  return isYnValue(value) ? 'Y' : 'N'
}

function yesNoAny(...values) {
  return values.some(isYnValue) ? 'Y' : 'N'
}

function addItem(items, label, value) {
  const text = firstText(value)
  if (text && text !== '-') items.push({ label, value: text })
}

function buildWindowTypeText(row) {
  const modelCode = firstText(row.mdlCd, row.modelCd)
  const code = firstText(row.wintydiCd)
  const map = sashPanelNameMaps.value.wintydiNameMap || {}
  const mappedName = firstText(map[`${modelCode}::${code}`], map[code])
  if (mappedName && !looksLikeRawCode(mappedName, [code])) return mappedName
  const savedName = firstText(row.wintydiNm, row.wintydiName)
  if (savedName && !sameText(savedName, code) && !looksLikeRawCode(savedName, [code])) return savedName
  return '-'
}

function getWintydiInfo(row = {}) {
  const modelCode = firstText(row.mdlCd, row.modelCd)
  const code = firstText(row.wintydiCd)
  const map = sashPanelNameMaps.value.wintydiInfoMap || {}
  return map[`${modelCode}::${code}`] || map[code] || {}
}

function isSingleWindow(row = {}) {
  const info = getWintydiInfo(row)
  const sfWinCnt = firstText(row.sfWinCnt, row.wintydiSfWinCnt, info.sfWinCnt, info.addInfo4)
  const sfWinCntText = sfWinCnt.toUpperCase()
  const dblWindYn = firstText(row.dblWindYn, row.doubleWindowYn).toUpperCase()
  const windowTypeText = firstText(buildWindowTypeText(row), row.wintydiNm, row.wintydiName)

  if (dblWindYn === 'N') return true
  if (dblWindYn === 'Y') return false
  if (sfWinCntText === '4W' || sfWinCntText === '4') return false
  if (/^[123]W?$/.test(sfWinCntText)) return true
  if (windowTypeText.includes('단창')) return true
  return false
}

function shouldShowSfOutside(row = {}) {
  if (isSingleWindow(row)) return false
  const info = getWintydiInfo(row)
  const sfWinCnt = firstText(row.sfWinCnt, row.wintydiSfWinCnt, info.sfWinCnt, info.addInfo4).toUpperCase()
  if (sfWinCnt === '4W' || sfWinCnt === '4') return true

  const maps = sashPanelNameMaps.value
  const outsideName = resolveNamedSpec({
    row,
    nameKeys: ['ousdSfNm', 'ousdSfMtrlNm', 'sfOutMatNm'],
    codeKeys: ['ousdSf', 'ousdSfMtrlCd', 'sfOutMatCd'],
    lists: [maps.sfOutMaterialList, maps.materialList],
  })
  return Boolean(outsideName)
}

function buildOrderTypeText(row) {
  return firstText(row.sashOrdTypNm, row.sashOrdTypCdNm, row.sashOrdTypName, row.sashOrdTypCd, '-')
}

function buildVentText(row) {
  return resolveNamedSpec({
    row,
    nameKeys: ['ventLocNm', 'ventLocName'],
    codeKeys: ['ventLoc'],
    lists: [ventList.value],
  }) || '-'
}

function buildScreenText(row) {
  return resolveNamedSpec({
    row,
    nameKeys: ['screenTypeNm', 'screenTypeName', 'SCREEN_TYPE_NM', 'screenNm'],
    codeKeys: ['screenType', 'screen', 'screenCd', 'mfScreenType', 'SCREEN_TYPE'],
    lists: [screenList.value],
  }) || '-'
}

function buildBsmfText(row) {
  const metaText = buildSashMeta(row).bsmfText
  return resolveNamedSpec({
    row,
    nameKeys: ['bsmfOrdUtmNm', 'bsmfNm', 'bsmfOrdUtmCdNm'],
    codeKeys: ['bsmfOrdUtmCd', 'bsmfCd'],
    lists: [bsmfList.value],
  }) || (looksLikeRawCode(metaText) ? '-' : metaText)
}

function buildCustomerOptionChips(row) {
  const chips = []
  const vent = buildVentText(row)
  const screen = buildScreenText(row)
  if (vent && vent !== '-') chips.push(`VENT ${vent}`)
  if (screen && screen !== '-') chips.push(screen)
  if (isYnValue(row.glasStdalYn)) chips.push('알유리')
  if (isYnValue(row.aluMfYn)) chips.push('안전망')
  if (isYnValue(row.slcnFnshYn) || isYnValue(row.bfSlcnFnshYn)) chips.push('실리콘마감')
  if (isYnValue(row.windCloserMatYn) || isYnValue(row.insdWindClsYn) || isYnValue(row.ousdWindClsYn)) chips.push('윈드클로저')
  if (isYnValue(row.sfOutGlasYn)) chips.push('외주유리')
  if (isYnValue(row.mfHandleYn) || String(row.mfHandle || '') === '2') chips.push('방충망핸들')
  return chips
}

function buildListOptionChips(row) {
  const chips = []
  const vent = buildVentText(row)
  const screen = buildScreenText(row)
  if (vent && vent !== '-') chips.push(`VENT ${vent}`)
  if (screen && screen !== '-') chips.push(screen)
  if (isYnValue(row.glasStdalYn)) chips.push('알유리')
  if (isYnValue(row.aluMfYn)) chips.push('안전망')
  return chips
}

function buildCustomerConfirmItems(row) {
  const items = []
  addItem(items, 'VENT', buildVentText(row))
  addItem(items, '스크린', buildScreenText(row))
  addItem(items, '알유리', yesNo(row.glasStdalYn))
  addItem(items, '안전망', yesNo(row.aluMfYn))
  addItem(items, '실리콘 마감', yesNoAny(row.slcnFnshYn, row.bfSlcnFnshYn))
  addItem(items, '윈드클로저', yesNoAny(row.windCloserMatYn, row.insdWindClsYn, row.ousdWindClsYn))
  addItem(items, '외주유리', yesNo(row.sfOutGlasYn))
  addItem(items, '견적비고', firstText(row.remSrc, '-'))
  return items
}

function buildSizeDetailItems(row) {
  const items = []
  addItem(items, 'W/H', buildSize(row))
  for (let index = 1; index <= 5; index += 1) {
    addItem(items, `W${index}`, firstText(row[`w${index}Size`], row[`W${index}Size`], row[`w${index}`]))
  }
  for (let index = 1; index <= 5; index += 1) {
    addItem(items, `H${index}`, firstText(row[`h${index}Size`], row[`H${index}Size`], row[`h${index}`]))
  }
  addItem(items, 'CS', firstText(row.csSize, row.CSSize, row.cs))
  for (let index = 1; index <= 5; index += 1) {
    addItem(items, `CS${index}`, firstText(row[`cs${index}Size`], row[`CS${index}Size`], row[`cs${index}`]))
  }
  return items.filter((item) => item.value !== '-')
}

function buildMaterialHardwareItems(row) {
  const items = []
  const maps = sashPanelNameMaps.value
  const showSfOutside = shouldShowSfOutside(row)
  const showOutsideGlass = !isSingleWindow(row)
  addItem(items, 'SF 내', resolveNamedSpec({ row, nameKeys: ['insdSfNm', 'insdSfMtrlNm', 'sfMatNm'], codeKeys: ['insdSf', 'insdSfMtrlCd', 'sfMatCd'], lists: [maps.sfInMaterialList, maps.materialList] }))
  if (showSfOutside) {
    addItem(items, 'SF 외', resolveNamedSpec({ row, nameKeys: ['ousdSfNm', 'ousdSfMtrlNm', 'sfOutMatNm'], codeKeys: ['ousdSf', 'ousdSfMtrlCd', 'sfOutMatCd'], lists: [maps.sfOutMaterialList, maps.materialList] }))
  }
  addItem(items, 'BF 내', resolveNamedSpec({ row, nameKeys: ['insdBfNm', 'insdBfMtrlNm', 'bfMatNm'], codeKeys: ['insdBf', 'insdBfMtrlCd', 'bfMatCd'], lists: [maps.bfInMaterialList, maps.materialList] }))
  addItem(items, 'BF 외', resolveNamedSpec({ row, nameKeys: ['ousdBfNm', 'ousdBfMtrlNm', 'bfOutMatNm'], codeKeys: ['ousdBf', 'ousdBfMtrlCd', 'bfOutMatCd'], lists: [maps.bfOutMaterialList, maps.materialList] }))
  addItem(items, 'SF 유리 내', resolveNamedSpec({ row, nameKeys: ['insdSfGlasMtrlNm', 'insdSfGlasNm', 'mtrlCds1Nm'], codeKeys: ['mtrlCds1', 'insdSfGlasMtrlCd', 'insdSfGlasCd', 'sfGlasCd'], lists: [maps.sfInGlassList, maps.glassList] }))
  if (showOutsideGlass) {
    addItem(items, 'SF 유리 외', resolveNamedSpec({ row, nameKeys: ['ousdSfGlasMtrlNm', 'ousdSfGlasNm', 'mtrlCds2Nm'], codeKeys: ['mtrlCds2', 'ousdSfGlasMtrlCd', 'ousdSfGlasCd', 'sfOutGlasCd'], lists: [maps.sfOutGlassList, maps.glassList] }))
  }
  addItem(items, 'BF 유리 내', resolveNamedSpec({ row, nameKeys: ['insdBfGlasMtrlNm', 'insdBfGlasNm', 'mtrlCds3Nm'], codeKeys: ['mtrlCds3', 'insdBfGlasMtrlCd', 'insdBfGlasCd', 'bfGlasCd'], lists: [maps.bfInGlassList, maps.glassList] }))
  if (showOutsideGlass) {
    addItem(items, 'BF 유리 외', resolveNamedSpec({ row, nameKeys: ['ousdBfGlasMtrlNm', 'ousdBfGlasNm', 'mtrlCds4Nm'], codeKeys: ['mtrlCds4', 'ousdBfGlasMtrlCd', 'ousdBfGlasCd', 'bfOutGlasCd'], lists: [maps.bfOutGlassList, maps.glassList] }))
  }
  addItem(items, '내부 핸들', resolveNamedSpec({ row, nameKeys: ['hdlInsd', 'insdHandleTypeNm'], codeKeys: ['insdHandleType'], lists: [handleList.value], codeLabels: { '2': '일반', '4': '없음' } }))
  addItem(items, '외부 핸들', resolveNamedSpec({ row, nameKeys: ['hdlOusd', 'ousdHandleTypeNm'], codeKeys: ['ousdHandleType'], lists: [handleList.value], codeLabels: { '2': '일반', '4': '없음' } }))
  addItem(items, '핸들높이', firstText(row.insdHndlH, row.ousdHndlH, row.insd2FHndlH, row.ousd2FHndlH))
  addItem(items, '브래킷', firstText(row.insdBrcktH, row.ousdBrcktH, row.insd2FBrcktH, row.ousd2FBrcktH))
  return items
}

function buildGlassSummary(row) {
  const parts = [
    row.insdSfGlasMtrlNm || row.mtrlCds1Nm,
    row.ousdSfGlasMtrlNm || row.mtrlCds2Nm,
    row.insdBfGlasMtrlNm || row.mtrlCds3Nm,
    row.ousdBfGlasMtrlNm || row.mtrlCds4Nm,
  ].filter(Boolean)
  return parts.length ? parts.join(' / ') : '-'
}

function buildProductionSummary(row) {
  const parts = []
  if (row.bfArmatureType || row.sfArmatureType || row.mfArmatureType) parts.push('보강재')
  if (row.bfMillingType && row.bfMillingType !== '0') parts.push('밀링')
  if (row.ventHoleYn === 'Y') parts.push('통기홀')
  if (row.drnHoleYn === 'Y') parts.push('배수홀')
  if (row.aluMfYn === 'Y') parts.push('안전망')
  return parts.length ? parts.join(', ') : '-'
}

function buildProductionRemarkSummary(row) {
  const parts = [
    row.pdBfRemSrc ? `BF ${row.pdBfRemSrc}` : '',
    row.pdSfRemSrc ? `SF ${row.pdSfRemSrc}` : '',
    row.pdMfRemSrc ? `MF ${row.pdMfRemSrc}` : '',
  ].filter(Boolean)
  return parts.length ? parts.join(' / ') : '-'
}

function buildInternalProductionItems(row) {
  const items = []
  addItem(items, 'BF 생산옵션 요약', buildBfProductionSummary(row))
  addItem(items, 'SF 생산옵션 요약', buildSfProductionSummary(row))
  addItem(items, 'MF 생산옵션 요약', buildMfProductionSummary(row))
  addItem(items, '생산비고 BF/SF/MF', buildProductionRemarkSummary(row))
  addItem(items, '직송', buildDirectShipSummary(row))
  return items.filter((item) => item.value !== '-')
}

function buildBfProductionSummary(row) {
  const parts = []
  if (row.bfArmatureType) parts.push(`보강재 ${row.bfArmatureType}`)
  if (row.bfMillingType && row.bfMillingType !== '0') parts.push('밀링')
  if (isYnValue(row.drnHoleYn)) parts.push('배수홀')
  if (isYnValue(row.bfDirectShip) || isYnValue(row.bfRackShip)) parts.push('직송/렉별도')
  return parts.join(', ') || '-'
}

function buildSfProductionSummary(row) {
  const parts = []
  if (row.sfArmatureType) parts.push(`보강재 ${row.sfArmatureType}`)
  if (isYnValue(row.ventHoleYn) || isYnValue(row.sfInsdVentHoleYn) || isYnValue(row.sfOusdVentHoleYn)) parts.push('통기홀')
  if (isYnValue(row.windCloserMatYn) || isYnValue(row.insdWindClsYn) || isYnValue(row.ousdWindClsYn)) parts.push('윈드클로저')
  if (isYnValue(row.sfDirectShip) || isYnValue(row.sfRackShip)) parts.push('직송/렉별도')
  return parts.join(', ') || '-'
}

function buildMfProductionSummary(row) {
  const parts = []
  if (row.mfArmatureType) parts.push(`보강재 ${row.mfArmatureType}`)
  if (isYnValue(row.aluMfYn)) parts.push('안전망')
  if (isYnValue(row.mfDirectShip) || isYnValue(row.mfRackShip)) parts.push('직송/렉별도')
  if (isYnValue(row.mfHandleYn) || String(row.mfHandle || '') === '2') parts.push('방충망핸들')
  return parts.join(', ') || '-'
}

function buildDirectShipSummary(row) {
  const parts = []
  if (isYnValue(row.bfDirectShip) || row.bfShipAddr) parts.push(`BF ${row.bfShipAddr || '직송'}`)
  if (isYnValue(row.sfDirectShip) || row.sfShipAddr) parts.push(`SF ${row.sfShipAddr || '직송'}`)
  if (isYnValue(row.mfDirectShip) || row.mfShipAddr) parts.push(`MF ${row.mfShipAddr || '직송'}`)
  return parts.join(' / ') || '-'
}

function isGlassEstimateRow(row = {}) {
  return row.ctgr2Cd === 'P8' || row.ctgrCd === 'P8' || row.ctgr2Nm === '알유리'
}

function sashDrawingUrl(row) {
  if (row._imgError) return ''
  return buildSashDrawingUrl(row)
}

function handleSashImageError(row) {
  row._imgError = true
}

function normalizeCodeList(rows = []) {
  return normalizeDisplayCodeList(rows)
}

async function loadSashPanelNameMaps(rows = []) {
  const modelCodes = [...new Set(rows.map((row) => firstText(row.mdlCd, row.modelCd)).filter(Boolean))]
  const sfSlots = {
    sfInMaterialList: [],
    sfOutMaterialList: [],
    bfInMaterialList: [],
    bfOutMaterialList: [],
  }
  const sfResults = await Promise.all(modelCodes.map(async (mdlCd) => {
    try {
      const { data } = await searchModelSf(mdlCd)
      const sfIn = data?.insdSf || data?.resultList || []
      const sfOut = data?.ousdSf || data?.resultList3 || []
      const bfIn = data?.insdBf || data?.resultList5 || []
      const bfOut = data?.ousdBf || data?.resultList7 || []
      sfSlots.sfInMaterialList.push(...sfIn)
      sfSlots.sfOutMaterialList.push(...sfOut)
      sfSlots.bfInMaterialList.push(...bfIn)
      sfSlots.bfOutMaterialList.push(...bfOut)
      return [...sfIn, ...sfOut, ...bfIn, ...bfOut]
    } catch (_) {
      return []
    }
  }))

  const glassSlots = {
    sfInGlassList: [],
    sfOutGlassList: [],
    bfInGlassList: [],
    bfOutGlassList: [],
  }
  const glassResults = await Promise.all(rows.map(async (row) => {
    const mdlCd = firstText(row.mdlCd, row.modelCd)
    if (!mdlCd) return []
    try {
      const { data } = await searchGlasList({
        searchMdlCd: mdlCd,
        searchItgEstiNo: itgEstiNo,
        searchEstiNo: row.estiNo || row.windEstiNo || wEstiNo.value,
        searchEstiNos: row.estiNos || '1',
        searchEstiSeq: row.estiSeq,
      })
      const sfIn = data?.resultList || []
      const sfOut = data?.resultList3 || []
      const bfIn = data?.resultList5 || []
      const bfOut = data?.resultList7 || []
      glassSlots.sfInGlassList.push(...sfIn)
      glassSlots.sfOutGlassList.push(...sfOut)
      glassSlots.bfInGlassList.push(...bfIn)
      glassSlots.bfOutGlassList.push(...bfOut)
      return [...sfIn, ...sfOut, ...bfIn, ...bfOut]
    } catch (_) {
      return []
    }
  }))

  const wintydiEntries = await Promise.all(modelCodes.map(async (mdlCd) => {
    try {
      const { data } = await searchModelWintydi(mdlCd)
      return [mdlCd, normalizeDisplayCodeList(data?.resultList || [])]
    } catch (_) {
      return [mdlCd, []]
    }
  }))
  const wintydiNameMap = {}
  const wintydiInfoMap = {}
  for (const [mdlCd, list] of wintydiEntries) {
    for (const item of list) {
      const code = itemCode(item)
      const name = itemName(item)
      if (!code) continue
      const info = { ...item, sfWinCnt: firstText(item.sfWinCnt, item.addInfo4) }
      wintydiInfoMap[`${mdlCd}::${code}`] = info
      if (!wintydiInfoMap[code]) wintydiInfoMap[code] = info
      if (!name) continue
      wintydiNameMap[`${mdlCd}::${code}`] = name
      if (!wintydiNameMap[code]) wintydiNameMap[code] = name
    }
  }

  return {
    materialList: uniqueCodeList(sfResults.flat()),
    glassList: uniqueCodeList(glassResults.flat()),
    wintydiNameMap,
    wintydiInfoMap,
    sfInMaterialList: uniqueCodeList(sfSlots.sfInMaterialList),
    sfOutMaterialList: uniqueCodeList(sfSlots.sfOutMaterialList),
    bfInMaterialList: uniqueCodeList(sfSlots.bfInMaterialList),
    bfOutMaterialList: uniqueCodeList(sfSlots.bfOutMaterialList),
    sfInGlassList: uniqueCodeList(glassSlots.sfInGlassList),
    sfOutGlassList: uniqueCodeList(glassSlots.sfOutGlassList),
    bfInGlassList: uniqueCodeList(glassSlots.bfInGlassList),
    bfOutGlassList: uniqueCodeList(glassSlots.bfOutGlassList),
  }
}

function uniqueCodeList(rows = []) {
  const seen = new Map()
  for (const item of normalizeDisplayCodeList(rows)) {
    const code = itemCode(item)
    if (!code || seen.has(code)) continue
    seen.set(code, item)
  }
  return Array.from(seen.values())
}

async function hydrateSashDetailRows(rows) {
  return Promise.all(rows.map(async (row) => {
    try {
      const { data } = await selectSashDetail({
        itgEstiNo,
        estiNo: row.estiNo || row.windEstiNo || wEstiNo.value,
        estiNos: row.estiNos || '1',
        estiSeq: row.estiSeq,
      })
      const detail = data?.resultData || {}
      return mergeSashDetailRow(row, detail)
    } catch (_) {
      return row
    }
  }))
}

async function hydrateSashDrawingFiles(rows) {
  const mdlCds = [...new Set(rows
    .filter((row) => row.mdlCd)
    .map((row) => row.mdlCd))]

  if (!mdlCds.length) return rows

  const entries = await Promise.all(mdlCds.map(async (mdlCd) => {
    try {
      const { data } = await searchModelList({
        searchMdlCd: mdlCd,
        searchUseYn: 'Y',
        startRowNum: 0,
        endRowNum: 99,
      })
      return [mdlCd, data?.resultList || []]
    } catch (_) {
      return [mdlCd, []]
    }
  }))

  return mergeSashDrawingFiles(rows, Object.fromEntries(entries))
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await selectEstiHeader(itgEstiNo)
    header.value = data?.resultData || null
    wEstiNo.value = resolveWindEstiNo(data)

    if (header.value) {
      try {
        const [
          { data: sashData },
          { data: screenData },
          { data: ventData },
          { data: colorData },
          { data: bsmfData },
          { data: handleData },
          { data: safetyHandleData },
        ] = await Promise.all([
          searchSashList({ itgEstiNo, estiNo: wEstiNo.value }),
          searchCodeList('379'),
          searchCodeList('48'),
          searchColorList(),
          searchCodeList('405'),
          searchCodeList('378'),
          searchCodeList('387'),
        ])
        screenList.value = normalizeCodeList(screenData?.resultList || [])
        ventList.value = normalizeCodeList(ventData?.resultList || [])
        colorList.value = normalizeCodeList(colorData?.resultList || [])
        bsmfList.value = normalizeCodeList(bsmfData?.resultList || [])
        handleList.value = normalizeCodeList([
          ...(handleData?.resultList || []),
          ...(safetyHandleData?.resultList || []),
        ])
        const rows = normalizeSashRows(sashData)
        glassRows.value = rows.filter(isGlassEstimateRow)
        const sashOnlyRows = rows.filter((row) => !isGlassEstimateRow(row))
        const detailRows = await hydrateSashDetailRows(sashOnlyRows)
        const [drawingRows, panelNameMaps] = await Promise.all([
          hydrateSashDrawingFiles(detailRows),
          loadSashPanelNameMaps(detailRows),
        ])
        sashPanelNameMaps.value = panelNameMaps
        sashRows.value = drawingRows
        if (!selectedSashKey.value && sashRows.value.length) selectedSashKey.value = sashRowKey(sashRows.value[0])
      } catch (e) {
        sashRows.value = []
        glassRows.value = []
      }
    }
  } finally {
    loading.value = false
  }
})

async function editSash(row) {
  if (!row) return
  openingSash.value = true
  const cd = resolveEffectiveStatus(row.stCd, row.igStCd, headerStatus.value)
  const editable = isSashEditable(row)
  try {
    sessionStorage.setItem('mobile_sash_edit_row', JSON.stringify(row))
  } catch (_) {}
  try {
    await router.push({
      path: '/estimates/sash/new',
      query: {
        itgEstiNo,
        wEstiNo: row.estiNo || row.windEstiNo || wEstiNo.value,
        estiNos: row.estiNos || '1',
        estiSeq: row.estiSeq,
        stCd: cd === UNKNOWN_STATUS ? '' : cd,
        readonly: editable ? '' : 'Y',
      },
    })
  } catch (_) {
    openingSash.value = false
  }
}

async function addSash() {
  issueError.value = ''
  closeItemSheet()
  if (wEstiNo.value) {
    router.push({ path: '/estimates/sash/new', query: { itgEstiNo, wEstiNo: wEstiNo.value, stCd: headerStatus.value } })
    return
  }
  issuing.value = true
  try {
    const { data } = await issueEstiNo(itgEstiNo, 'wind')
    if (data.resultCd !== 'issue.ok') {
      issueError.value = `wEstiNo 발번 실패 [${data.resultCd}] ${data.resultMessage || ''}`
      return
    }
    wEstiNo.value = data.estiNo
    router.push({ path: '/estimates/sash/new', query: { itgEstiNo, wEstiNo: data.estiNo, stCd: headerStatus.value } })
  } catch (e) {
    issueError.value = e?.response?.data?.message || e.message || '발번 호출 실패'
  } finally {
    issuing.value = false
  }
}

function openItemSheet() {
  issueError.value = ''
  showItemSheet.value = true
}

function closeItemSheet() {
  showItemSheet.value = false
}
</script>
