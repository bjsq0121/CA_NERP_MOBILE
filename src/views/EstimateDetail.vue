<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin:4px 4px 12px">
      <h2 style="margin:0;font-size:17px">견적 상세</h2>
      <button class="btn secondary" style="width:auto;padding:6px 12px;font-size:12px" @click="router.back()">← 뒤로</button>
    </div>

    <div v-if="loading" class="empty">불러오는 중...</div>
    <div v-else-if="!header" class="empty">견적을 찾을 수 없습니다.</div>
    <template v-else>
      <!-- 헤더 정보 -->
      <div class="card">
        <div style="font-size:12px;color:#64748b">통합견적번호</div>
        <div style="font-weight:700;font-size:15px;margin-bottom:6px">{{ header.itgEstiNo }}</div>
        <div class="title" style="font-size:16px">{{ header.itgEstiNm }}</div>
        <div class="meta">
          <span class="badge">{{ header.bzpcNm || header.bzpc }}</span>
          <span>{{ header.dplcNm }}</span>
          <span v-if="header.jobsNm">· {{ header.jobsNm }}</span>
        </div>
        <div class="meta">
          <span>등록 {{ formatDt(header.inputDtm) }}</span>
          <span v-if="header.estiVldDt">· 유효 {{ formatDate(header.estiVldDt) }}</span>
        </div>
        <div v-if="header.dplcReqRemSrc" class="meta" style="white-space:pre-wrap">{{ header.dplcReqRemSrc }}</div>
      </div>

      <!-- 견적 추가 버튼 -->
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:#1f2a44">견적 추가</div>
        <div class="row-flex" style="flex-wrap:wrap;gap:8px">
          <button class="btn" style="flex:1 1 45%" :disabled="issuing" @click="addSash">
            {{ issuing ? '준비 중...' : '+ 샤시' }}
          </button>
          <button class="btn secondary" style="flex:1 1 45%" disabled>+ 도어 (준비중)</button>
          <button class="btn secondary" style="flex:1 1 45%" disabled>+ 유리 (준비중)</button>
          <button class="btn secondary" style="flex:1 1 45%" disabled>+ 몰딩 (준비중)</button>
        </div>
        <div v-if="issueError" class="error">{{ issueError }}</div>
      </div>

      <!-- 샤시 견적 목록 -->
      <div class="card">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:#1f2a44">
          샤시 견적 {{ sashRows.length ? `(${sashRows.length})` : '' }}
        </div>
        <div v-if="!sashRows.length" class="empty" style="padding:20px 0">등록된 샤시 견적이 없습니다.</div>
        <div
          v-for="row in sashRows"
          :key="row.estiSeq"
          class="list-row"
          style="margin-bottom:6px;cursor:pointer"
          @click="openSash(row)"
        >
          <div class="title" style="font-size:14px">
            #{{ row.estiSeq }} {{ row.mdlNm || row.mdlCd }}
          </div>
          <div class="meta" style="font-size:11px">
            <span>색상 {{ row.colrNm || buildColor(row) }}</span>
            <span>· 규격 {{ row.wh || ((row.wSize || row.WSize || '') + '×' + (row.hSize || row.HSize || '')) }}</span>
            <span>· {{ row.qty }} SET</span>
          </div>
          <div class="meta" style="font-size:12px;color:#1f2a44;margin-top:4px;font-weight:600">
            <span>공급가 {{ Number(row.totCstAmtAddGlas || row.totSaleAmt || 0).toLocaleString() }}</span>
            <span>· VAT {{ Number(row.vatAmt || row.totVatAmt || 0).toLocaleString() }}</span>
            <span>· 합계 {{ Number(row.vatTotCstAmt || row.totAmt || 0).toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

function formatDate(s) { if (!s) return ''; const t = String(s).replace(/-/g, ''); return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}` }
function formatDt(s) { return s ? String(s).slice(0, 10) : '' }

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
        // 매퍼가 자재별로 행을 여러 개 반환하므로 estiSeq 단위로 dedupe
        const seen = new Map()
        for (const row of raw) {
          const key = `${row.estiNo || row.windEstiNo || ''}_${row.estiNos || '1'}_${row.estiSeq}`
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

// 자재명/유리/스크린/창형태로 spec 문자열 조립
// 예: "BF225R/SF115G/MF115D/5투/5투/스텐방충망/2W_정"
function buildSpec(row) {
  const parts = []
  if (row.bfNm) parts.push(row.bfNm)
  if (row.insdSfNm) parts.push(row.insdSfNm)
  if (row.mfNm) parts.push(row.mfNm)
  if (row.insdGlasThikCd) parts.push(`${row.insdGlasThikCd}투`)
  if (row.ousdGlasThikCd) parts.push(`${row.ousdGlasThikCd}투`)
  if (row.screenTypeNm) parts.push(row.screenTypeNm)
  if (row.wintydiNm) parts.push(row.wintydiNm)
  return parts.join('/')
}
// "백/백+백/백" 형식: 기준/내+외/내 (또는 sashForm 의 표시 패턴)
function buildColor(row) {
  const parts = []
  if (row.crtnColrNm) parts.push(row.crtnColrNm)
  const inOut = [row.insdColrNm, row.ousdColrNm].filter(Boolean)
  if (inOut.length === 2 && inOut[0] === inOut[1]) parts.push(inOut[0])
  else if (inOut.length === 2) parts.push(`${inOut[0]}+${inOut[1]}`)
  else if (inOut.length === 1) parts.push(inOut[0])
  return parts.join('/')
}

function openSash(row) {
  // 클릭한 row 전체를 sessionStorage 에 저장 → SashNew 에서 즉시 form 채움
  // (selectEstiClWindInfo 매퍼 의존 없이 list 데이터를 그대로 활용)
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
    },
  })
}

async function addSash() {
  issueError.value = ''
  // 이미 wEstiNo 가 있으면 그대로 이동
  if (wEstiNo.value) {
    router.push({ path: '/estimates/sash/new', query: { itgEstiNo, wEstiNo: wEstiNo.value } })
    return
  }
  // 없으면 발번
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
