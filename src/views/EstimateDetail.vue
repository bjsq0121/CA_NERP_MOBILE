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
        <button class="btn secondary btn-xs" @click="router.push(`/estimates/${itgEstiNo}/sash-summary`)">샤시 요약</button>
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
          <span v-if="header.jobsNm">{{ header.jobsNm }}</span>
          <span>등록 {{ formatDt(header.inputDtm) }}</span>
          <span v-if="header.estiVldDt">유효 {{ formatDate(header.estiVldDt) }}</span>
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
          <button v-if="canAddItem" class="btn accent" :disabled="issuing" @click="openItemSheet">
            {{ issuing ? '준비 중...' : '+ 품목 추가' }}
          </button>
          <button class="btn secondary" @click="router.push(`/estimates/${itgEstiNo}/sash-summary`)">샤시 요약</button>
        </div>
        <div v-if="issueError" class="error">{{ issueError }}</div>
        <div v-if="header.dplcReqRemSrc" class="estimate-hero-note">{{ header.dplcReqRemSrc }}</div>
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
            :model-text="row.mdlNm || row.mdlCd || '-'"
            :window-type-text="buildWindowTypeText(row)"
            :sequence-text="row.estiSeq"
            :status-text="statusLabel(row)"
            :status-class="statusBadgeClass(row)"
            :size-text="buildSize(row)"
            :qty-text="buildSashMeta(row).qtyText"
            :color-text="buildColor(row)"
            :bsmf-text="buildSashMeta(row).bsmfText"
            :option-chips="buildListOptionChips(row)"
            :total-text="fmtPrice(rowTotal(row))"
            @select="selectSash(row)"
          />
        </div>
        <div class="sash-detail-pane">
          <SashDetailPanel
            v-if="selectedSashRow"
            :model-text="selectedSashRow.mdlNm || selectedSashRow.mdlCd || '-'"
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
import { selectEstiHeader, searchCodeList, searchModelList, searchSashList, issueEstiNo } from '../api/estimate'
import SashDetailPanel from '../components/SashDetailPanel.vue'
import SashListCard from '../components/SashListCard.vue'
import {
  buildSashDrawingUrl,
  buildSashMeta,
  buildSashScreenText,
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
const loading = ref(false)
const issuing = ref(false)
const openingSash = ref(false)
const showItemSheet = ref(false)
const issueError = ref('')
const selectedSashKey = ref('')

const headerStatus = computed(() => resolveEffectiveStatus(header.value?.stCd, header.value?.igStCd))

// 품목 추가는 헤더 0/10/20 상태에서 가능. 상태 미확인은 fail-closed.
const canAddItem = computed(() => isEditableHeaderStatus(headerStatus.value))

const estimateTotals = computed(() => sumRows([...sashRows.value, ...glassRows.value]))
const categoryTotals = computed(() => ({
  sash: sumRows(sashRows.value).total,
  glass: sumRows(glassRows.value).total,
}))
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
  return `${row.estiNo || row.windEstiNo || wEstiNo.value || 'sash'}_${row.estiNos || '1'}_${row.estiSeq || ''}`
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
  const base = firstText(row.crtnColrNm, row.crtnColrCd)
  const inside = firstText(row.insdColrNm, row.insdColrCd)
  const outside = firstText(row.ousdColrNm, row.ousdColrCd)
  const fallback = firstText(row.color, row.colrNm, row.colrCd)
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
  return firstText(row.wintydiNm, row.wintydiName, row.wintydiCd, '-')
}

function buildOrderTypeText(row) {
  return firstText(row.sashOrdTypNm, row.sashOrdTypCdNm, row.sashOrdTypName, row.sashOrdTypCd, '-')
}

function buildVentText(row) {
  return firstText(row.ventLocNm, row.ventLocName, row.ventLoc, '-')
}

function buildCustomerOptionChips(row) {
  const chips = []
  const vent = buildVentText(row)
  const screen = buildSashScreenText(row, screenList.value)
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
  const screen = buildSashScreenText(row, screenList.value)
  if (vent && vent !== '-') chips.push(`VENT ${vent}`)
  if (screen && screen !== '-') chips.push(screen)
  if (isYnValue(row.glasStdalYn)) chips.push('알유리')
  if (isYnValue(row.aluMfYn)) chips.push('안전망')
  return chips
}

function buildCustomerConfirmItems(row) {
  const items = []
  addItem(items, 'VENT', buildVentText(row))
  addItem(items, '스크린', buildSashScreenText(row, screenList.value))
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
  addItem(items, 'SF 내', firstText(row.insdSfNm, row.insdSfMtrlNm, row.insdSf))
  addItem(items, 'SF 외', firstText(row.ousdSfNm, row.ousdSfMtrlNm, row.ousdSf))
  addItem(items, 'BF 내', firstText(row.insdBfNm, row.insdBfMtrlNm, row.insdBf))
  addItem(items, 'BF 외', firstText(row.ousdBfNm, row.ousdBfMtrlNm, row.ousdBf))
  addItem(items, 'SF 유리 내', firstText(row.insdSfGlasMtrlNm, row.mtrlCds1Nm, row.mtrlCds1))
  addItem(items, 'SF 유리 외', firstText(row.ousdSfGlasMtrlNm, row.mtrlCds2Nm, row.mtrlCds2))
  addItem(items, 'BF 유리 내', firstText(row.insdBfGlasMtrlNm, row.mtrlCds3Nm, row.mtrlCds3))
  addItem(items, 'BF 유리 외', firstText(row.ousdBfGlasMtrlNm, row.mtrlCds4Nm, row.mtrlCds4))
  addItem(items, '내부 핸들', firstText(row.hdlInsd, row.insdHandleTypeNm, row.insdHandleType))
  addItem(items, '외부 핸들', firstText(row.hdlOusd, row.ousdHandleTypeNm, row.ousdHandleType))
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
  return rows.map((row) => ({ ...row, commCdId: row.commCdId || row.commCdVal }))
}

async function hydrateSashDrawingFiles(rows) {
  const mdlCds = [...new Set(rows
    .filter((row) => row.mdlCd && !buildSashDrawingUrl(row))
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
        const [{ data: sashData }, { data: screenData }] = await Promise.all([
          searchSashList({ itgEstiNo, estiNo: wEstiNo.value }),
          searchCodeList('379'),
        ])
        screenList.value = normalizeCodeList(screenData?.resultList || [])
        const rows = normalizeSashRows(sashData)
        glassRows.value = rows.filter(isGlassEstimateRow)
        sashRows.value = await hydrateSashDrawingFiles(rows.filter((row) => !isGlassEstimateRow(row)))
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
