<template>
  <div>
    <h2 style="margin:4px 4px 12px;font-size:17px">신규 견적</h2>

    <!-- 1. 영업소 + 견적 기본 -->
    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />

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
          :value="dplcDisplay"
          :placeholder="selectedBzpc.bzpc ? '터치해서 거래처 검색' : '먼저 영업소를 선택하세요'"
          :style="{ background: '#fff', cursor: selectedBzpc.bzpc ? 'pointer' : 'not-allowed' }"
          @click="openDplcSearch"
        />
      </div>

      <!-- 거래처 선택 후 자동 채워진 정보 -->
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
        <div class="field">
          <label>전화번호</label>
          <input v-model="form.dplcCrgrTel" />
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

    <!-- 할인등급 자동 채움 미리보기 (읽기 전용) -->
    <details v-if="form.dplcCd" class="card" style="padding:12px 16px">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;color:#64748b">
        할인등급 / 가율 (자동, 클릭해서 펼치기)
      </summary>
      <div style="margin-top:12px;font-size:12px;color:#475569">
        <div>샤시 등급 {{ form.dplcGrpGrade.dplcDcGrd || '-' }} / 가율 {{ form.dplcRate.dplcRt || '-' }}</div>
        <div>도어 등급 {{ form.dplcGrpGrade.dplcDcGrdDoor || '-' }} / 가율 {{ form.dplcRate.dplcDoorRt || '-' }}</div>
        <div>판넬 등급 {{ form.dplcGrpGrade.dplcDcGrdPannel || '-' }} / 가율 {{ form.dplcRate.dplcPannelRt || '-' }}</div>
        <div>유리 등급 {{ form.dplcGrpGrade.dplcDcGrdGlas || '-' }} / 가율 {{ form.dplcRate.dplcGlasRt || '-' }}</div>
        <div>몰딩 등급 {{ form.dplcGrpGrade.dplcDcGrdMlng || '-' }} / 가율 {{ form.dplcRate.dplcMlngRt || '-' }}</div>
        <div>유통자재 등급 {{ form.dplcGrpGrade.dplcDcGrdMtrl || '-' }} / 가율 {{ form.dplcRate.dplcMtrlRt || '-' }}</div>
        <div>유통상품 등급 {{ form.dplcGrpGrade.dplcDcGrdProd || '-' }} / 가율 {{ form.dplcRate.dplcProdRt || '-' }}</div>
        <div>타사 등급 {{ form.dplcGrpGrade.dplcDcGrdEtc || '-' }} / 가율 {{ form.dplcRate.dplcEtcRt || '-' }}</div>
      </div>
    </details>

    <!-- 저장 -->
    <button class="btn" :disabled="loading || !canSubmit" @click="submit">
      {{ loading ? '저장 중...' : '견적 헤더 저장' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="result" class="error" style="color:#16a34a">저장 완료. 견적번호 {{ result }}</div>

    <DplcSearchModal
      ref="dplcModal"
      :bzpc="selectedBzpc.bzpc"
      :bzpc-nm="selectedBzpc.bzpcNm"
      @select="onDplcPick"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
const dplcModal = ref(null)
const loading = ref(false)
const error = ref('')
const result = ref('')

const form = ref({
  itgEstiNm: '',
  estiVldDt: plusDays(7),
  delivryDt: today(),

  // 거래처 (모달로 채워짐)
  dplcCd: '',
  dplcNm: '',
  dplcCrgrNm: '',
  dplcCrgrTel: '',
  dplcCrgrMobile: '',
  adr1: '',
  adr2: '',

  jobsNm: '',
  dplcReqRemSrc: '',
  remSrc: '',
  ordrInfo: '',
  unprInfo: '',

  // 거래처 선택 시 자동 채움 (백엔드 saveEstiHeader 가 flat 필드로 복사함)
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

// 영업소 변경 시 이미 고른 거래처 초기화 (영업소 컨텍스트가 달라짐)
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
    adr1: '', adr2: '', ordrInfo: '',
  })
  form.value.dplcGrpGrade = { dplcDcGrd: '', dplcDcGrdDoor: '', dplcDcGrdPannel: '', dplcDcGrdEtc: '', dplcDcGrdGlas: '', dplcDcGrdMlng: '', dplcDcGrdMtrl: '', dplcDcGrdProd: '' }
  form.value.dplcRate = { dplcRt: '', dplcDoorRt: '', dplcPannelRt: '', dplcEtcRt: '', dplcGlasRt: '', dplcMlngRt: '', dplcMtrlRt: '', dplcProdRt: '' }
}

// NewEstimate.vue:2153~2249 패턴을 모바일 1차 범위로 옮긴 자동 채움
function onDplcPick(row) {
  form.value.dplcCd = row.dplcCd || ''
  form.value.dplcNm = row.dplcNm || row.dplcCdNm || ''

  // 담당자 우선순위: dplcCrgrNm > billCrgr > repNm
  form.value.dplcCrgrNm = row.dplcCrgrNm || row.billCrgr || row.repNm || ''
  form.value.dplcCrgrTel = row.dplcCrgrCcpc || row.billCrgrTel || row.tel || ''
  form.value.dplcCrgrMobile = row.dplcCrgrMobile || row.billCrgrMobile || row.repMobile || ''

  form.value.adr1 = row.adr1 || ''
  form.value.adr2 = row.adr2 || ''

  // 주문자 기본값: 담당자명
  if (!form.value.ordrInfo && form.value.dplcCrgrNm) {
    form.value.ordrInfo = form.value.dplcCrgrNm
  }

  // 할인등급 (8종)
  form.value.dplcGrpGrade = {
    dplcDcGrd:        row.dcGrd        || '',
    dplcDcGrdDoor:    row.dcGrdDoor    || '',
    dplcDcGrdPannel:  row.dcGrdPannel  || '',
    dplcDcGrdEtc:     row.dcGrdEtc     || '',
    dplcDcGrdGlas:    row.dcGrdGlas    || '',
    dplcDcGrdMlng:    row.dcGrdMlng    || '',
    dplcDcGrdMtrl:    row.dcGrdMtrl    || '',
    dplcDcGrdProd:    row.dcGrdProd    || '',
  }

  // 가율 (NewEstimate.vue 에서 addInfo* 로 들어오는 것과 동일 키명)
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

  // 검증
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
    result.value = `저장 완료. 견적번호 ${itgEstiNo} → 상세 화면으로 이동...`
    // 헤더 저장만. 샤시/도어 견적은 상세 화면에서 추가.
    setTimeout(() => router.push(`/estimates/${itgEstiNo}`), 700)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '저장 실패'
  } finally {
    loading.value = false
  }
}
</script>
