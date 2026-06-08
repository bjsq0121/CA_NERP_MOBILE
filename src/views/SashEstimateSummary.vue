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
import {
  searchCodeList,
  searchColorList,
  searchGlasList,
  searchModelSf,
  searchModelWintydi,
  searchSashList,
  selectEstiHeader,
  selectSashDetail,
} from '../api/estimate'
import { mergeSashDetailRow, normalizeSashRows, resolveWindEstiNo } from '../utils/estimateDetail'
import { UNKNOWN_STATUS, resolveEffectiveStatus } from '../utils/estimateStatus'
import {
  buildSashSummaryRows,
  buildSashSummaryTotals,
  formatSummaryMoney,
  isGlassEstimateRow,
  normalizeSummaryCodeList,
} from '../utils/sashEstimateSummary'

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
const materialList = ref([])
const glassList = ref([])
const specLists = ref({})
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

const summaryContext = computed(() => ({
  screenList: screenList.value,
  colorList: colorList.value,
  ventList: ventList.value,
  bsmfList: bsmfList.value,
  materialList: materialList.value,
  glassList: glassList.value,
  specLists: specLists.value,
  wintydiNameMap: wintydiNameMap.value,
}))

const summaryRows = computed(() => buildSashSummaryRows(sashRows.value, summaryContext.value))

const totals = computed(() => buildSashSummaryTotals(summaryRows.value))

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
    screenList.value = normalizeSummaryCodeList(screenData?.resultList || [])
    colorList.value = normalizeSummaryCodeList(colorData?.resultList || [])
    ventList.value = normalizeSummaryCodeList(ventData?.resultList || [])
    bsmfList.value = normalizeSummaryCodeList(bsmfData?.resultList || [])
    const sashOnlyRows = normalizeSashRows(sashData).filter((row) => !isGlassEstimateRow(row))
    sashRows.value = await hydrateSashSummaryRows(sashOnlyRows)
    const loadedSpecLists = await loadSummarySpecNameLists(sashRows.value)
    materialList.value = loadedSpecLists.materialList
    glassList.value = loadedSpecLists.glassList
    specLists.value = loadedSpecLists.specLists
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

function firstValue(...values) {
  const found = values.find((value) => value != null && value !== '')
  return found == null ? '' : String(found)
}

async function hydrateSashSummaryRows(rows = []) {
  return Promise.all(rows.map(async (row) => {
    if (row?.estiSeq == null || row.estiSeq === '') return row
    try {
      const { data } = await selectSashDetail({
        itgEstiNo,
        estiNo: row.estiNo || row.windEstiNo || wEstiNo.value,
        estiNos: row.estiNos || '1',
        estiSeq: row.estiSeq,
      })
      return mergeSashDetailRow(row, data?.resultData || {})
    } catch (_) {
      return row
    }
  }))
}

async function loadWintydiNameMap(rows = []) {
  const modelCodes = Array.from(new Set(rows.map((row) => firstValue(row.mdlCd, row.modelCd)).filter(Boolean)))
  const pairs = await Promise.all(modelCodes.map(async (mdlCd) => {
    try {
      const { data } = await searchModelWintydi(mdlCd)
      return [mdlCd, normalizeSummaryCodeList(data?.resultList || [])]
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

async function loadSummarySpecNameLists(rows = []) {
  const modelCodes = Array.from(new Set(rows.map((row) => firstValue(row.mdlCd, row.modelCd)).filter(Boolean)))
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
    const mdlCd = firstValue(row.mdlCd, row.modelCd)
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
      return [
        ...sfIn,
        ...sfOut,
        ...bfIn,
        ...bfOut,
      ]
    } catch (_) {
      return []
    }
  }))

  return {
    materialList: uniqueCodeList(sfResults.flat()),
    glassList: uniqueCodeList(glassResults.flat()),
    specLists: {
      sfInMaterialList: uniqueCodeList(sfSlots.sfInMaterialList),
      sfOutMaterialList: uniqueCodeList(sfSlots.sfOutMaterialList),
      bfInMaterialList: uniqueCodeList(sfSlots.bfInMaterialList),
      bfOutMaterialList: uniqueCodeList(sfSlots.bfOutMaterialList),
      sfInGlassList: uniqueCodeList(glassSlots.sfInGlassList),
      sfOutGlassList: uniqueCodeList(glassSlots.sfOutGlassList),
      bfInGlassList: uniqueCodeList(glassSlots.bfInGlassList),
      bfOutGlassList: uniqueCodeList(glassSlots.bfOutGlassList),
    },
  }
}

function uniqueCodeList(rows = []) {
  const normalized = normalizeSummaryCodeList(rows)
  const seen = new Map()
  for (const item of normalized) {
    const code = firstValue(item.commCdId, item.commCdVal)
    if (!code || seen.has(code)) continue
    seen.set(code, item)
  }
  return Array.from(seen.values())
}

function fmtPrice(value) {
  return formatSummaryMoney(value)
}

function formatDate(value) {
  if (!value) return '-'
  const raw = String(value)
  const compact = raw.replace(/[-/.]/g, '')
  if (compact.length >= 8) return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`
  return raw.slice(0, 10)
}

function statusName(code) {
  const map = { '0': '작성', '10': '견적', '20': '장바구니', '50': '주문', '51': '수주', '65': '절단', '66': '생산', '80': '출고', '90': '완료' }
  return map[code] || code
}
</script>
