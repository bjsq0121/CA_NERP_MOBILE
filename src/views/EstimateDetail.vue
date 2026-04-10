<template>
  <div>
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

      <!-- 견적 추가 버튼: 견적(10) 상태일 때만 -->
      <div v-if="canEdit" class="card">
        <div class="section-title">견적 추가</div>
        <div class="btn-grid">
          <button class="btn accent" :disabled="issuing" @click="addSash">
            {{ issuing ? '준비 중...' : '+ 샤시' }}
          </button>
          <button class="btn secondary" disabled>+ 도어 (준비중)</button>
          <button class="btn secondary" disabled>+ 유리 (준비중)</button>
          <button class="btn secondary" disabled>+ 몰딩 (준비중)</button>
        </div>
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
          <!-- 1행: 순번 + 모형명 + 상태 배지 -->
          <div class="sash-card-header">
            <span class="sash-seq">#{{ row.estiSeq }}</span>
            <span class="sash-model">{{ row.mdlNm || row.mdlCd }}</span>
            <span :class="statusBadgeClass(row)">{{ statusLabel(row) }}</span>
          </div>

          <!-- 2행: 스펙 그리드 -->
          <div class="sash-specs">
            <div class="sash-spec">
              <span class="sash-spec-label">규격</span>
              <span class="sash-spec-value">{{ buildSize(row) }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">수량</span>
              <span class="sash-spec-value">{{ row.qty || '-' }} SET</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">색상</span>
              <span class="sash-spec-value">{{ row.color || row.colrNm || buildColor(row) || '-' }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">VENT</span>
              <span class="sash-spec-value">{{ row.ventLocNm || '-' }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">핸들</span>
              <span class="sash-spec-value">{{ buildHandle(row) }}</span>
            </div>
            <div class="sash-spec">
              <span class="sash-spec-label">스크린</span>
              <span class="sash-spec-value">{{ row.screenTypeNm || '-' }}</span>
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
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { selectEstiHeader, searchSashList, issueEstiNo } from '../api/estimate'

const route = useRoute()
const router = useRouter()
const itgEstiNo = route.params.itgEstiNo

const header = ref(null)
const wEstiNo = ref('')
const sashRows = ref([])
const loading = ref(false)
const issuing = ref(false)
const issueError = ref('')

// 견적(10) 상태일 때만 추가/편집 가능
const canEdit = computed(() => {
  if (!sashRows.value.length) return true  // 아직 견적이 없으면 추가 가능
  // 모든 항목이 견적(10) 상태인지 확인
  return sashRows.value.every(r => !r.stCd || r.stCd === '10')
})

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

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await selectEstiHeader(itgEstiNo)
    header.value = data?.resultData || null
    wEstiNo.value = data?.wEstiNo || ''

    if (header.value) {
      try {
        const { data: sashData } = await searchSashList(itgEstiNo)
        const raw = sashData?.resultList || []
        const seen = new Map()
        for (const row of raw) {
          const key = `${row.estiNo || row.windEstiNo || ''}_${row.estiNos || '1'}_${row.estiSeq || '0'}`
          if (!seen.has(key)) seen.set(key, row)
        }
        sashRows.value = Array.from(seen.values())
      } catch (e) {
        sashRows.value = []
      }
    }
  } finally {
    loading.value = false
  }
})

function openSash(row) {
  const cd = row.stCd || row.igStCd || '10'
  const editable = cd === '10'
  try {
    sessionStorage.setItem('mobile_sash_edit_row', JSON.stringify(row))
  } catch (_) {}
  router.push({
    path: '/estimates/sash/new',
    query: {
      itgEstiNo,
      wEstiNo: row.estiNo || row.windEstiNo || wEstiNo.value,
      estiNos: row.estiNos || '1',
      estiSeq: row.estiSeq,
      readonly: editable ? '' : 'Y',
    },
  })
}

async function addSash() {
  issueError.value = ''
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
</script>
