<template>
  <div>
    <h2 class="page-title">신규 견적</h2>

    <!-- 1. 영업소 + 견적 기본 -->
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" :locked="bzpcLocked" />

      <div class="field">
        <label>견적제목 *</label>
        <input v-model="form.itgEstiNm" placeholder="예: ○○현장 샤시 견적" />
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
      <div class="field">
        <label>거래처 *</label>
        <input
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
            <label>휴대폰</label>
            <input v-model="form.dplcCrgrMobile" />
          </div>
        </div>
        <div class="row-flex">
          <div class="field">
            <label>전화번호</label>
            <input v-model="form.dplcCrgrTel" />
          </div>
          <div class="field">
            <label>월 신용한도</label>
            <input readonly :value="form.monCreditLimit ? Number(form.monCreditLimit).toLocaleString() + '원' : '-'" />
          </div>
        </div>

        <!-- 할인등급 표시 -->
        <div class="grade-row">
          <div class="grade-item">
            <span class="grade-label">샤시</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrd || '-' }}</span>
          </div>
          <div class="grade-item">
            <span class="grade-label">도어</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrdDoor || '-' }}</span>
          </div>
          <div class="grade-item">
            <span class="grade-label">유리</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrdGlas || '-' }}</span>
          </div>
          <div class="grade-item">
            <span class="grade-label">몰딩</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrdMlng || '-' }}</span>
          </div>
          <div class="grade-item">
            <span class="grade-label">판넬</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrdPannel || '-' }}</span>
          </div>
          <div class="grade-item">
            <span class="grade-label">타사</span>
            <span class="grade-value">{{ form.dplcGrpGrade.dplcDcGrdEtc || '-' }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 3. 현장 / 주소 -->
    <div class="card">
      <div class="field">
        <label>현장명</label>
        <input v-model="form.jobsNm" />
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
      <div class="field">
        <label>고객요청 비고</label>
        <textarea v-model="form.dplcReqRemSrc" rows="2" />
      </div>
      <div class="field">
        <label>비고</label>
        <textarea v-model="form.remSrc" rows="2" />
      </div>
    </div>

    <!-- 저장 -->
    <button class="btn" :disabled="loading || !canSubmit" @click="submit">
      {{ loading ? '저장 중...' : '견적 헤더 저장' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="result" class="success-msg">{{ result }}</div>

    <DplcSearchModal
      ref="dplcModal"
      :bzpc="selectedBzpc.bzpc"
      :bzpc-nm="selectedBzpc.bzpcNm"
      @select="onDplcPick"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BzpcSelector from '../components/BzpcSelector.vue'
import DplcSearchModal from '../components/DplcSearchModal.vue'
import { saveEstiHeader } from '../api/estimate'

const router = useRouter()

function today() { return new Date().toISOString().slice(0, 10) }
function plusDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const selectedBzpc = ref({ bzpc: '', bzpcNm: '' })
const bzpcLocked = ref(false)

// 견적 목록에서 선택한 영업소가 있으면 고정
onMounted(() => {
  try {
    const saved = sessionStorage.getItem('mobile_selected_bzpc')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed?.bzpc) {
        selectedBzpc.value = parsed
        bzpcLocked.value = true
      }
    }
  } catch (_) {}
})
const dplcModal = ref(null)
const loading = ref(false)
const error = ref('')
const result = ref('')

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
  adr1: '',
  adr2: '',

  jobsNm: '',
  dplcReqRemSrc: '',
  remSrc: '',
  ordrInfo: '',
  unprInfo: '',

  dplcGrpGrade: {
    dplcDcGrd: '', dplcDcGrdDoor: '', dplcDcGrdPannel: '', dplcDcGrdEtc: '',
    dplcDcGrdGlas: '', dplcDcGrdMlng: '', dplcDcGrdMtrl: '', dplcDcGrdProd: '',
  },
  dplcRate: {
    dplcRt: '', dplcDoorRt: '', dplcPannelRt: '', dplcEtcRt: '',
    dplcGlasRt: '', dplcMlngRt: '', dplcMtrlRt: '', dplcProdRt: '',
  },
})

const dplcDisplay = computed(() => (form.value.dplcCd ? `${form.value.dplcNm} (${form.value.dplcCd})` : ''))

const canSubmit = computed(
  () =>
    !!selectedBzpc.value.bzpc &&
    !!form.value.itgEstiNm &&
    !!form.value.dplcCd &&
    !!form.value.estiVldDt
)

watch(
  () => selectedBzpc.value.bzpc,
  (next, prev) => {
    if (prev && next !== prev) clearDplc()
  }
)

function openDplcSearch() {
  if (!selectedBzpc.value.bzpc) return
  dplcModal.value?.open()
}

function clearDplc() {
  Object.assign(form.value, {
    dplcCd: '', dplcNm: '', dplcCrgrNm: '', dplcCrgrTel: '', dplcCrgrMobile: '',
    monCreditLimit: '', adr1: '', adr2: '', ordrInfo: '',
  })
  form.value.dplcGrpGrade = { dplcDcGrd: '', dplcDcGrdDoor: '', dplcDcGrdPannel: '', dplcDcGrdEtc: '', dplcDcGrdGlas: '', dplcDcGrdMlng: '', dplcDcGrdMtrl: '', dplcDcGrdProd: '' }
  form.value.dplcRate = { dplcRt: '', dplcDoorRt: '', dplcPannelRt: '', dplcEtcRt: '', dplcGlasRt: '', dplcMlngRt: '', dplcMtrlRt: '', dplcProdRt: '' }
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

  if (!form.value.ordrInfo && form.value.dplcCrgrNm) {
    form.value.ordrInfo = form.value.dplcCrgrNm
  }

  form.value.dplcGrpGrade = {
    dplcDcGrd:        row.dcGrd        || '',
    dplcDcGrdDoor:    row.dcGrdDoor    || '',
    dplcDcGrdPannel:  row.dcGrdPannel  || '',
    dplcDcGrdEtc:     row.dcGrdOtherComp || row.dcGrdEtc || '',
    dplcDcGrdGlas:    row.dcGrdGlas    || '',
    dplcDcGrdMlng:    row.dcGrdMold    || row.dcGrdMlng  || '',
    dplcDcGrdMtrl:    row.dcGrdDtbtMtrl || row.dcGrdMtrl || '',
    dplcDcGrdProd:    row.dcGrdDtbtGoods || row.dcGrdProd || '',
  }

  form.value.dplcRate = {
    dplcRt:        row.dplcRt       || row.addInfo1  || '',
    dplcDoorRt:    row.dplcDoorRt   || row.addInfo5  || '',
    dplcPannelRt:  row.dplcPannelRt || row.addInfo2  || '',
    dplcEtcRt:     row.dplcEtcRt    || row.addInfo3  || '',
    dplcGlasRt:    row.dplcGlasRt   || row.addInfo12 || '',
    dplcMlngRt:    row.dplcMlngRt   || row.addInfo13 || '',
    dplcMtrlRt:    row.dplcMtrlRt   || row.addInfo14 || '',
    dplcProdRt:    row.dplcProdRt   || row.addInfo15 || '',
  }
}

async function submit() {
  error.value = ''
  result.value = ''

  if (!selectedBzpc.value.bzpc) return (error.value = '영업소를 선택하세요')
  if (!form.value.itgEstiNm)    return (error.value = '견적제목을 입력하세요')
  if (!form.value.dplcCd)       return (error.value = '거래처를 선택하세요')
  if (!form.value.estiVldDt)    return (error.value = '견적유효일을 선택하세요')

  loading.value = true
  try {
    const payload = {
      ...form.value,
      bzpc: selectedBzpc.value.bzpc,
      bzpcNm: selectedBzpc.value.bzpcNm,
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
