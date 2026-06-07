<template>
  <div class="sash-summary-page">
    <div class="page-title-row summary-title-row">
      <div class="summary-title-main">
        <h2 class="page-title">샤시 견적 요약</h2>
        <p class="page-subtitle">거래처 확인용 row별 샤시 명세</p>
      </div>
      <div class="summary-actions">
        <button class="btn secondary summary-print-action" @click="printSummary">인쇄/PDF</button>
        <button class="btn-back" @click="router.back()">뒤로</button>
      </div>
    </div>

    <div v-if="loading" class="empty">요약 정보를 불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <section class="card summary-header-card">
        <div class="summary-header-grid">
          <div>
            <span>거래처명</span>
            <strong>{{ header?.dplcNm || '-' }}</strong>
          </div>
          <div>
            <span>영업소</span>
            <strong>{{ header?.bzpcNm || header?.bzpc || '-' }}</strong>
          </div>
          <div>
            <span>견적번호</span>
            <strong>{{ header?.itgEstiNo || itgEstiNo }}</strong>
          </div>
          <div>
            <span>견적일</span>
            <strong>{{ estimateDate }}</strong>
          </div>
          <div>
            <span>담당자</span>
            <strong>{{ header?.jobsNm || header?.empNm || header?.inputEmpNm || '-' }}</strong>
          </div>
          <div>
            <span>견적상태</span>
            <strong>{{ headerStatusLabel }}</strong>
          </div>
        </div>
      </section>

      <section class="card estimate-total-card summary-total-card">
        <div class="summary-head">
          <div>
            <div class="detail-label">총 견적금액</div>
            <div class="summary-total">{{ fmtPrice(totals.total) }}원</div>
            <div class="summary-total-sub">샤시 {{ totals.rowCount }}건 · 총 수량 {{ fmtPrice(totals.qty) }}</div>
          </div>
        </div>
        <div class="summary-amounts summary-amounts-compact">
          <div>
            <span>공급가</span>
            <strong>{{ fmtPrice(totals.supply) }}원</strong>
          </div>
          <div>
            <span>VAT</span>
            <strong>{{ fmtPrice(totals.vat) }}원</strong>
          </div>
        </div>
      </section>

      <section v-if="!summaryRows.length" class="card empty">등록된 샤시 견적이 없습니다.</section>

      <section v-if="summaryRows.length" class="card summary-table-wrap" aria-label="샤시 요약 표">
        <table class="summary-table">
          <colgroup>
            <col class="summary-col-no" />
            <col class="summary-col-item" />
            <col class="summary-col-spec" />
            <col class="summary-col-options" />
            <col class="summary-col-amount" />
          </colgroup>
          <thead>
            <tr>
              <th>NO</th>
              <th>품목</th>
              <th>규격</th>
              <th>옵션</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in summaryRows" :key="`table_${row.key}`">
              <td>
                <strong>{{ row.no }}</strong>
                <span>#{{ row.estiSeqText }}</span>
              </td>
              <td>
                <strong>{{ row.modelText }}</strong>
                <span>{{ row.windowTypeText }}</span>
              </td>
              <td>
                <strong>{{ row.sizeText }}</strong>
                <span>{{ row.qtyText }}개</span>
                <span>{{ row.colorText }}</span>
              </td>
              <td>
                <strong>{{ row.bsmfText }}</strong>
                <span>{{ row.customerOptionText }}</span>
                <span v-if="row.remarkText !== '-'">비고: {{ row.remarkText }}</span>
              </td>
              <td class="num">
                <strong class="summary-table-price-total">{{ fmtPrice(row.total) }}</strong>
                <span class="summary-table-price-sub">공급 {{ fmtPrice(row.supply) }} / VAT {{ fmtPrice(row.vat) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchCodeList, searchColorList, searchModelWintydi, searchSashList, selectEstiHeader } from '../api/estimate'
import { buildSashMeta, buildSashScreenText, normalizeSashRows, resolveWindEstiNo } from '../utils/estimateDetail'
import { UNKNOWN_STATUS, resolveEffectiveStatus } from '../utils/estimateStatus'

// TODO: shareToken 기반 거래처 공개 공유 링크.
// TODO: 엑셀 다운로드.
// TODO: 거래처 확인/수정요청 기능.
// TODO: 이미지/JPG 생성 및 S3 업로드.

const route = useRoute()
const router = useRouter()
const itgEstiNo = String(route.params.itgEstiNo || '')

const header = ref(null)
const wEstiNo = ref('')
const sashRows = ref([])
const screenList = ref([])
const colorList = ref([])
const ventList = ref([])
const bsmfList = ref([])
const wintydiNameMap = ref({})
const loading = ref(false)
const error = ref('')

const headerStatus = computed(() => resolveEffectiveStatus(header.value?.stCd, header.value?.igStCd))

const headerStatusLabel = computed(() => {
  const code = headerStatus.value
  if (code === UNKNOWN_STATUS) return '상태미확인'
  return header.value?.stNm || header.value?.igStNm || statusName(code)
})

const estimateDate = computed(() =>
  formatDate(header.value?.estiDt || header.value?.inputDtm || header.value?.regDt)
)

const summaryRows = computed(() => sashRows.value.map((row, index) => buildSummaryRow(row, index)))

const totals = computed(() => summaryRows.value.reduce((acc, row) => {
  acc.rowCount += 1
  acc.qty += row.qty
  acc.supply += row.supply
  acc.vat += row.vat
  acc.total += row.total
  return acc
}, { rowCount: 0, qty: 0, supply: 0, vat: 0, total: 0 }))

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const { data: headerData } = await selectEstiHeader(itgEstiNo)
    header.value = headerData?.resultData || null
    wEstiNo.value = resolveWindEstiNo(headerData)

    if (!header.value) {
      error.value = '견적을 찾을 수 없습니다.'
      return
    }

    const [
      { data: sashData },
      { data: screenData },
      { data: colorData },
      { data: ventData },
      { data: bsmfData },
    ] = await Promise.all([
      searchSashList({ itgEstiNo, estiNo: wEstiNo.value }),
      searchCodeList('379'),
      searchColorList(),
      searchCodeList('48'),
      searchCodeList('405'),
    ])
    screenList.value = normalizeCodeList(screenData?.resultList || [])
    colorList.value = normalizeCodeList(colorData?.resultList || [])
    ventList.value = normalizeCodeList(ventData?.resultList || [])
    bsmfList.value = normalizeCodeList(bsmfData?.resultList || [])
    sashRows.value = normalizeSashRows(sashData).filter((row) => !isGlassEstimateRow(row))
    wintydiNameMap.value = await loadWintydiNameMap(sashRows.value)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '요약 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function printSummary() {
  window.print()
}

function buildSummaryRow(row, index) {
  const qty = amountNumber(row.qty, row.Qty, row.QTY)
  const supply = rowSupply(row)
  const vat = rowVat(row)
  const total = rowTotal(row, supply, vat)
  const modelCode = firstValue(row.mdlCd, row.modelCd)
  const modelName = firstValue(row.mdlNm, row.modelNm)
  const screenText = buildSashScreenText(row, screenList.value)
  const ventText = resolveCodeName(ventList.value, firstValue(row.ventLoc), row.ventLocNm, row.ventLocName)
  const alGlass = isYn(row.glasStdalYn)
  const safetyNet = isYn(row.aluMfYn)

  return {
    key: `${firstValue(row.estiNo, row.windEstiNo, 'sash')}_${firstValue(row.estiNos, '1')}_${firstValue(row.estiSeq, index + 1)}`,
    no: index + 1,
    estiSeqText: firstValue(row.estiSeq, index + 1),
    modelText: [modelCode, modelName].filter(Boolean).join(' / ') || '-',
    windowTypeText: buildWindowTypeText(row),
    sizeText: buildSize(row),
    qty,
    qtyText: qty ? String(qty) : '-',
    colorText: buildColorText(row),
    bsmfText: buildBsmfText(row),
    customerOptionText: buildCustomerOptions(row, { screenText, ventText, alGlass, safetyNet }),
    supply,
    vat,
    total,
    remarkText: firstValue(row.remSrc, row.estiRemSrc, '-'),
  }
}

function firstValue(...values) {
  const found = values.find((value) => value != null && value !== '')
  return found == null ? '' : String(found)
}

function normalizeCodeList(rows = []) {
  return rows.map((row) => ({
    ...row,
    commCdId: row.commCdId || row.commCdVal || row.colrCd || row.wintydiCd || row.cd || row.code,
    commCdNm: row.commCdNm || row.colrNm || row.wintydiNm || row.cdNm || row.codeNm || row.name,
  }))
}

async function loadWintydiNameMap(rows = []) {
  const modelCodes = Array.from(new Set(rows.map((row) => firstValue(row.mdlCd, row.modelCd)).filter(Boolean)))
  const pairs = await Promise.all(modelCodes.map(async (mdlCd) => {
    try {
      const { data } = await searchModelWintydi(mdlCd)
      return [mdlCd, normalizeCodeList(data?.resultList || [])]
    } catch (_) {
      return [mdlCd, []]
    }
  }))

  const map = {}
  for (const [mdlCd, list] of pairs) {
    for (const item of list) {
      const code = firstValue(item.commCdId, item.commCdVal)
      const name = firstValue(item.commCdNm)
      if (!code || !name) continue
      map[`${mdlCd}::${code}`] = name
      if (!map[code]) map[code] = name
    }
  }
  return map
}

function resolveCodeName(list = [], code, ...savedNames) {
  const savedName = firstValue(...savedNames)
  const rawCode = firstValue(code)
  if (rawCode) {
    const matched = list.find((item) => String(firstValue(item.commCdId, item.commCdVal)) === String(rawCode))
    const matchedName = firstValue(matched?.commCdNm, matched?.addInfo1)
    if (matchedName) return matchedName
  }
  return savedName || rawCode || '-'
}

function amountNumber(...values) {
  for (const value of values) {
    if (value !== '' && value != null) return Number(String(value).replace(/,/g, '')) || 0
  }
  return 0
}

function rowSupply(row) {
  return amountNumber(row.totCstAmtAddGlas, row.totSaleAmt, row.sumSaleCst, row.saleCst)
}

function rowVat(row) {
  return amountNumber(row.vatAmt, row.totVatAmt)
}

function rowTotal(row, supply = rowSupply(row), vat = rowVat(row)) {
  return amountNumber(row.vatTotCstAmt, row.totAmt, row.chrgAmt) || supply + vat
}

function fmtPrice(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(value) {
  if (!value) return '-'
  const raw = String(value)
  const compact = raw.replace(/[-/.]/g, '')
  if (compact.length >= 8) return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`
  return raw.slice(0, 10)
}

function buildSize(row) {
  const wh = firstValue(row.wh)
  if (wh) return wh
  const w = firstValue(row.wSize, row.WSize, row.w0Size, row.w)
  const h = firstValue(row.hSize, row.HSize, row.h0Size, row.h)
  if (!w && !h) return '-'
  return `${w || '-'} x ${h || '-'}`
}

function buildWindowTypeText(row) {
  const code = firstValue(row.wintydiCd)
  const modelCode = firstValue(row.mdlCd, row.modelCd)
  const mappedName = firstValue(wintydiNameMap.value[`${modelCode}::${code}`], wintydiNameMap.value[code])
  return firstValue(row.wintydiNm, row.wintydiName, mappedName, code, '-')
}

function buildColorText(row) {
  const inside = resolveCodeName(colorList.value, firstValue(row.insdColrCd), row.insdColrNm)
  const outside = resolveCodeName(colorList.value, firstValue(row.ousdColrCd), row.ousdColrNm)
  const fallback = resolveCodeName(colorList.value, firstValue(row.color, row.colrCd, row.colr), row.colrNm)
  const insideText = inside === '-' ? fallback : inside
  const outsideText = outside === '-' ? fallback : outside
  if (!insideText && !outsideText) return '-'
  if (insideText && outsideText && insideText !== outsideText) return `내부 ${insideText} / 외부 ${outsideText}`
  return insideText || outsideText || '-'
}

function buildBsmfText(row) {
  const metaText = buildSashMeta(row).bsmfText
  const code = firstValue(row.bsmfOrdUtmCd, row.bsmfCd)
  return resolveCodeName(bsmfList.value, code, row.bsmfOrdUtmNm, row.bsmfNm, row.bsmfOrdUtmCdNm, metaText === code ? '' : metaText)
}

function buildCustomerOptions(row, { screenText, ventText, alGlass, safetyNet }) {
  const parts = []
  if (screenText && screenText !== '-') parts.push(screenText)
  if (ventText && ventText !== '-') parts.push(`VENT ${ventText}`)
  if (alGlass) parts.push('알유리')
  if (safetyNet) parts.push('안전망')
  if (isYn(row.slcnFnshYn) || isYn(row.bfSlcnFnshYn)) parts.push('실리콘마감')
  if (isYn(row.windCloserMatYn) || isYn(row.insdWindClsYn) || isYn(row.ousdWindClsYn)) parts.push('윈드클로저')
  if (isYn(row.sfOutGlasYn)) parts.push('외주유리')
  if (isYn(row.mfHandleYn) || String(row.mfHandle || '') === '2') parts.push('방충망핸들')
  return parts.length ? parts.join(', ') : '기본'
}

function isYn(value) {
  return String(value || '').toUpperCase() === 'Y'
}

function statusName(code) {
  const map = { '0': '작성', '10': '견적', '20': '장바구니', '50': '주문', '51': '수주', '65': '절단', '66': '생산', '80': '출고', '90': '완료' }
  return map[code] || code
}

function isGlassEstimateRow(row = {}) {
  return row.ctgr2Cd === 'P8' || row.ctgrCd === 'P8' || row.ctgr2Nm === '알유리'
}
</script>
