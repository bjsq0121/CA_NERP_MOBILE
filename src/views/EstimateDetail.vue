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
      <button class="btn-back" @click="router.back()">뒤로</button>
    </div>

    <div v-if="loading" class="empty">불러오는 중...</div>
    <div v-else-if="!header" class="empty">견적을 찾을 수 없습니다.</div>
    <template v-else>
      <!-- 헤더 정보 -->
      <div class="card">
        <div class="detail-label">통합견적번호</div>
        <div class="detail-value">{{ header.itgEstiNo }}</div>
        <div class="detail-title mb-sm">{{ header.itgEstiNm }}</div>
        <div class="meta">
          <span class="badge">{{ header.bzpcNm || header.bzpc }}</span>
          <span>{{ header.dplcNm }}</span>
          <span v-if="header.jobsNm">{{ header.jobsNm }}</span>
        </div>
        <div class="meta mt-xs">
          <span>등록 {{ formatDt(header.inputDtm) }}</span>
          <span v-if="header.estiVldDt">유효 {{ formatDate(header.estiVldDt) }}</span>
        </div>
        <div v-if="header.dplcReqRemSrc" class="text-xs mt-sm" style="white-space:pre-wrap">{{ header.dplcReqRemSrc }}</div>
      </div>

      <!-- 총액 요약 -->
      <div class="card estimate-total-card">
        <div class="summary-head">
          <div>
            <div class="detail-label">총 합계</div>
            <div class="summary-total">{{ fmtPrice(estimateTotals.total) }}원</div>
          </div>
          <span class="badge">{{ sashRows.length + glassRows.length }}개 품목</span>
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
        </div>
      </div>

      <!-- 견적 추가 버튼: 견적(10) 상태일 때만 -->
      <div v-if="canEdit" class="card">
        <button class="btn accent" :disabled="issuing" @click="openItemSheet">
          {{ issuing ? '준비 중...' : '+ 품목 추가' }}
        </button>
        <div v-if="issueError" class="error">{{ issueError }}</div>
      </div>

      <!-- 샤시 견적 목록 -->
      <div class="card">
        <div class="section-title">
          샤시 견적 {{ sashRows.length ? `(${sashRows.length})` : '' }}
        </div>
        <div v-if="!sashRows.length" class="empty" style="padding:20px 0">등록된 샤시 견적이 없습니다.</div>
        <div
          v-for="row in sashRows"
          :key="row.estiSeq"
          class="sash-card"
          @click="openSash(row)"
        >
          <div class="sash-card-header">
            <span class="sash-model">{{ row.mdlNm || row.mdlCd }}</span>
            <span class="sash-seq">#{{ row.estiSeq }}</span>
            <span :class="statusBadgeClass(row)">{{ statusLabel(row) }}</span>
          </div>

          <div class="sash-card-main">
            <div class="sash-card-content">
              <div class="sash-specs">
                <div class="sash-spec">
                  <span class="sash-spec-label">사이즈</span>
                  <span class="sash-spec-value">{{ buildSize(row) }}</span>
                </div>
                <div class="sash-spec">
                  <span class="sash-spec-label">수량</span>
                  <span class="sash-spec-value">{{ buildSashMeta(row).qtyText }}</span>
                </div>
                <div class="sash-spec">
                  <span class="sash-spec-label">틀짝망</span>
                  <span class="sash-spec-value">{{ buildSashMeta(row).bsmfText }}</span>
                </div>
                <div class="sash-spec">
                  <span class="sash-spec-label">색상</span>
                  <span class="sash-spec-value">{{ row.color || row.colrNm || buildColor(row) || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="sash-thumb">
              <img
                v-if="sashDrawingUrl(row)"
                :src="sashDrawingUrl(row)"
                alt=""
                loading="lazy"
                @error="handleSashImageError(row)"
              />
              <div v-else class="sash-thumb-fallback">
                <span>{{ row.wintydiNm || row.wintydiCd || '샤시' }}</span>
              </div>
            </div>
          </div>

          <!-- 3행: 가격 -->
          <div class="sash-price-row">
            <div class="sash-price">
              <span class="sash-price-label">공급가</span>
              <span class="sash-price-value">{{ fmtPrice(row.totCstAmtAddGlas || row.totSaleAmt) }}</span>
            </div>
            <div class="sash-price">
              <span class="sash-price-label">VAT</span>
              <span class="sash-price-value">{{ fmtPrice(row.vatAmt || row.totVatAmt) }}</span>
            </div>
            <div class="sash-price sash-price-total">
              <span class="sash-price-label">합계</span>
              <span class="sash-price-value">{{ fmtPrice(row.vatTotCstAmt || row.totAmt) }}</span>
            </div>
          </div>
          <details class="sash-option-details" @click.stop>
            <summary>옵션 상세</summary>
            <div class="sash-option-grid">
              <div>
                <span>VENT</span>
                <strong>{{ row.ventLocNm || '-' }}</strong>
              </div>
              <div>
                <span>스크린</span>
                <strong>{{ buildSashScreenText(row, screenList) }}</strong>
              </div>
              <div>
                <span>핸들</span>
                <strong>{{ buildHandle(row) }}</strong>
              </div>
              <div>
                <span>유리</span>
                <strong>{{ buildGlassSummary(row) }}</strong>
              </div>
              <div>
                <span>생산옵션</span>
                <strong>{{ buildProductionSummary(row) }}</strong>
              </div>
              <div>
                <span>비고</span>
                <strong>{{ row.remSrc || '-' }}</strong>
              </div>
            </div>
          </details>
        </div>
      </div>

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
import {
  buildSashDrawingUrl,
  buildSashMeta,
  buildSashScreenText,
  mergeSashDrawingFiles,
  normalizeSashRows,
  resolveWindEstiNo,
} from '../utils/estimateDetail'

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

// 견적(10) 상태일 때만 추가/편집 가능
const canEdit = computed(() => {
  if (!sashRows.value.length) return true  // 아직 견적이 없으면 추가 가능
  // 모든 항목이 견적(10) 상태인지 확인
  return sashRows.value.every(r => !r.stCd || r.stCd === '10')
})

const estimateTotals = computed(() => sumRows([...sashRows.value, ...glassRows.value]))
const categoryTotals = computed(() => ({
  sash: sumRows(sashRows.value).total,
  glass: sumRows(glassRows.value).total,
}))

// 상태 코드 → 표시 이름
function statusLabel(row) {
  const cd = row.stCd || row.igStCd || '10'
  if (row.stNm) return row.stNm
  const map = { '10': '견적', '20': '장바구니', '50': '주문', '51': '수주', '65': '절단', '66': '생산', '80': '출고', '90': '완료' }
  return map[cd] || cd
}

// 상태 코드 → 배지 CSS
function statusBadgeClass(row) {
  const cd = row.stCd || row.igStCd || '10'
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
  const parts = []
  if (row.crtnColrNm) parts.push(row.crtnColrNm)
  const inOut = [row.insdColrNm, row.ousdColrNm].filter(Boolean)
  if (inOut.length === 2 && inOut[0] === inOut[1]) parts.push(inOut[0])
  else if (inOut.length === 2) parts.push(`${inOut[0]}+${inOut[1]}`)
  else if (inOut.length === 1) parts.push(inOut[0])
  return parts.join('/') || '-'
}

function buildHandle(row) {
  const inner = row.hdlInsd || ''
  const outer = row.hdlOusd || ''
  if (!inner && !outer) return '-'
  if (inner === outer || !outer) return inner
  if (!inner) return outer
  return `${inner}/${outer}`
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
      } catch (e) {
        sashRows.value = []
        glassRows.value = []
      }
    }
  } finally {
    loading.value = false
  }
})

async function openSash(row) {
  openingSash.value = true
  const cd = row.stCd || row.igStCd || '10'
  const editable = cd === '10'
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
    router.push({ path: '/estimates/sash/new', query: { itgEstiNo, wEstiNo: wEstiNo.value } })
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
    router.push({ path: '/estimates/sash/new', query: { itgEstiNo, wEstiNo: data.estiNo } })
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
