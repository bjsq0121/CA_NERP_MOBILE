<template>
  <div>
    <h2 class="page-title">거래처 간편등록</h2>

    <div class="card">
      <BzpcSelector v-model="selectedBzpc" />

      <div class="row-flex">
        <div class="field">
          <label>거래처구분</label>
          <select v-model="form.dplcScn">
            <option value="02">매출처</option>
          </select>
        </div>
        <div class="field">
          <label>사업자구분</label>
          <select v-model="form.bsnsScn">
            <option value="01">사업자</option>
            <option value="02">개인</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>거래처명 *</label>
        <input v-model="form.dplcNm" placeholder="거래처명" />
      </div>

      <div class="row-flex">
        <div class="field">
          <label>대표자명 *</label>
          <input v-model="form.repNm" placeholder="대표자명" />
        </div>
        <div class="field">
          <label>대표자휴대폰번호</label>
          <input v-model="form.repMobile" type="tel" inputmode="numeric" placeholder="01012345678" />
        </div>
      </div>

      <div class="row-flex">
        <div class="field">
          <label>사업자번호</label>
          <input v-model="form.bzno" type="tel" inputmode="numeric" placeholder="숫자만 입력" />
        </div>
        <div class="field">
          <label>전화번호</label>
          <input v-model="form.tel" type="tel" inputmode="tel" />
        </div>
      </div>

      <div class="row-flex">
        <div class="field">
          <label>업태</label>
          <input v-model="form.bzci" />
        </div>
        <div class="field">
          <label>종목</label>
          <input v-model="form.aitm" />
        </div>
      </div>

      <div class="row-flex">
        <div class="field">
          <label>담당자명</label>
          <input v-model="form.dplcCrgrNm" />
        </div>
        <div class="field">
          <label>담당자휴대폰</label>
          <input v-model="form.dplcCrgrMobile" type="tel" inputmode="numeric" />
        </div>
      </div>

      <div class="row-flex">
        <div class="field">
          <label>담당자연락처</label>
          <input v-model="form.dplcCrgrCcpc" type="tel" inputmode="tel" />
        </div>
        <div class="field">
          <label>이메일</label>
          <input v-model="form.eml" type="email" />
        </div>
      </div>

      <div class="field">
        <label>비고</label>
        <textarea v-model="form.remSrc" rows="3" />
      </div>

      <button class="btn" :disabled="loading || !canSubmit" @click="submit">
        {{ loading ? '저장 중...' : '저장' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="ok" class="success-msg">저장되었습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BzpcSelector from '../components/BzpcSelector.vue'
import { saveClient, checkClientDuplicate } from '../api/client'

const router = useRouter()
const selectedBzpc = ref({ bzpc: '', bzpcNm: '', vkbur: '', vkgrp: '' })

const DEFAULT_CLIENT_VALUES = {
  dplcScn: '02',
  dplcType: '10',
  bztcSt: '01',
  useYn: 'Y',
  badBondYn: 'N',
  monCreLim: '0',
  dplcCorpStatCd: '10',
  facDvCostType: 'I',
  dcGrd: 'G',
  dcGrdDoor: 'G',
  dcGrdPannel: 'G',
  dcGrdOtherComp: 'G',
  dcGrdGlas: 'G',
  dcGrdMold: 'G',
  dcGrdDtbtMtrl: 'G',
  dcGrdDtbtGoods: 'G',
  dcGrdDoorCr: 'T',
  dcGrdMoldCr: 'T',
  dcGrdDtbtMtrlCr: 'T',
  dcGrdDtbtGoodsCr: 'T',
}

const form = ref({
  dplcScn: '02',
  bsnsScn: '01',
  dplcNm: '',
  repNm: '',
  repMobile: '',
  bzno: '',
  bzci: '',
  aitm: '',
  tel: '',
  dplcCrgrNm: '',
  dplcCrgrMobile: '',
  dplcCrgrCcpc: '',
  eml: '',
  remSrc: '',
})
const loading = ref(false)
const error = ref('')
const ok = ref(false)

const canSubmit = computed(() => Boolean(
  selectedBzpc.value.vkbur &&
  selectedBzpc.value.vkgrp &&
  selectedBzpc.value.bzpc &&
  trimText(form.value.dplcNm) &&
  trimText(form.value.repNm) &&
  (form.value.bsnsScn === '01' ? trimText(form.value.bzno) : trimText(form.value.repMobile))
))

function trimText(value) {
  return String(value || '').trim()
}

function validateForm() {
  if (!selectedBzpc.value.bzpc) return '영업소를 선택하세요'
  if (!selectedBzpc.value.vkbur || !selectedBzpc.value.vkgrp || !selectedBzpc.value.bzpc) {
    return '영업소의 사업장/영업그룹 정보가 없습니다. 영업소를 다시 선택하세요'
  }
  if (!trimText(form.value.dplcNm)) return '거래처명을 입력하세요'
  if (!trimText(form.value.repNm)) return '대표자명을 입력하세요'
  if (form.value.bsnsScn === '01' && !trimText(form.value.bzno)) return '사업자번호를 입력하세요'
  if (form.value.bsnsScn === '02' && !trimText(form.value.repMobile)) return '대표자휴대폰번호를 입력하세요'
  return ''
}

function buildClientPayload() {
  return {
    ...DEFAULT_CLIENT_VALUES,
    ...form.value,
    dplcScn: '02',
    dplcNm: trimText(form.value.dplcNm),
    repNm: trimText(form.value.repNm),
    repMobile: trimText(form.value.repMobile),
    bzno: trimText(form.value.bzno),
    vkbur: selectedBzpc.value.vkbur,
    vkburNm: selectedBzpc.value.vkburNm,
    vkgrp: selectedBzpc.value.vkgrp,
    vkgrpNm: selectedBzpc.value.vkgrpNm,
    bzpc: selectedBzpc.value.bzpc,
    bzpcNm: selectedBzpc.value.bzpcNm,
  }
}

function buildDuplicatePayload(payload) {
  return {
    vkbur: payload.vkbur || null,
    vkgrp: payload.vkgrp || null,
    bzpc: payload.bzpc || null,
    dplcNm: payload.dplcNm || null,
    bzno: payload.bzno || null,
    dplcScn: payload.dplcScn || null,
  }
}

async function submit() {
  error.value = ''
  ok.value = false
  const validationMessage = validateForm()
  if (validationMessage) {
    error.value = validationMessage
    return
  }

  loading.value = true
  try {
    const payload = buildClientPayload()
    const duplicatePayload = buildDuplicatePayload(payload)
    const { data: duplicateData } = await checkClientDuplicate(duplicatePayload)
    if (duplicateData?.errCd) {
      error.value = duplicateData?.message || '거래처 중복체크에 실패했습니다'
      return
    }
    if (Number(duplicateData?.Count || 0) > 0) {
      error.value = '중복거래처가 있습니다. 거래처명 또는 사업자번호를 확인하세요'
      return
    }

    const { data } = await saveClient(payload)
    if (data?.errCd || data?.resultCd === 'save.fail' || data?.result === 'fail') {
      error.value = data?.resultMessage || data?.message || '저장 실패'
      return
    }

    ok.value = true
    setTimeout(() => router.push({ path: '/clients', query: { searchDplcNm: payload.dplcNm } }), 600)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '저장 실패'
  } finally {
    loading.value = false
  }
}
</script>
