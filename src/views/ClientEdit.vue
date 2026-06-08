<template>
  <div>
    <h2 class="page-title">거래처 수정</h2>

    <div class="card">
      <div class="form-section-title">영업조직</div>
      <div class="readonly-note">영업조직은 거래처 수정 화면에서 변경할 수 없습니다.</div>
      <div class="row-flex">
        <div class="field">
          <label>영업소</label>
          <input readonly :value="orgDisplay" />
        </div>
        <div class="field">
          <label>거래처코드</label>
          <input readonly :value="form.dplcCd" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="form-section-title">기본정보</div>
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
        <input v-model="form.dplcNm" />
      </div>

      <div class="row-flex">
        <div class="field">
          <label>대표자명 *</label>
          <input v-model="form.repNm" />
        </div>
        <div class="field">
          <label>대표자휴대폰번호</label>
          <input v-model="form.repMobile" type="tel" inputmode="numeric" />
        </div>
      </div>

      <div class="row-flex">
        <div class="field">
          <label>사업자번호</label>
          <input v-model="form.bzno" type="tel" inputmode="numeric" />
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
    </div>

    <div class="card">
      <div class="form-section-title">거래처등급</div>
      <div class="grade-edit-grid">
        <div v-for="item in normalGradeItems" :key="item.field" class="field">
          <label>{{ item.label }}</label>
          <select v-model="form[item.field]">
            <option value="">선택</option>
            <option v-for="option in item.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-subsection-title">크로스 할인등급</div>
      <div class="grade-edit-grid">
        <div v-for="item in crossGradeItems" :key="item.field" class="field">
          <label>{{ item.label }}</label>
          <select v-model="form[item.field]">
            <option value="">선택</option>
            <option v-for="option in item.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="row-flex">
      <button class="btn secondary" :disabled="loading" @click="router.back()">뒤로</button>
      <button class="btn" :disabled="loading || !canSubmit" @click="submit">
        {{ loading ? '저장 중...' : '수정 저장' }}
      </button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="ok" class="success-msg">저장되었습니다.</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { searchClientList, saveClient, searchClientGradeOptions } from '../api/client'
import {
  buildClientGradeOptionGroups,
  buildDefaultClientGrades,
  buildGradePayload,
} from '../utils/clientGradeOptions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const originalRow = ref({})
const form = ref(createEmptyForm())
const gradeGroups = ref(buildClientGradeOptionGroups({ resultList: [], resultListCross: [] }))
const loading = ref(false)
const error = ref('')
const ok = ref(false)

const orgDisplay = computed(() => {
  const name = form.value.bzpcNm || ''
  const code = form.value.bzpc || ''
  return code ? `${name} (${code})` : '-'
})

const canSubmit = computed(() => Boolean(
  form.value.bzpc &&
  form.value.dplcCd &&
  trimText(form.value.dplcNm) &&
  trimText(form.value.repNm) &&
  (form.value.bsnsScn === '01' ? trimText(form.value.bzno) : trimText(form.value.repMobile))
))

const normalGradeItems = computed(() => [
  { label: '샤시', field: 'dcGrd', options: gradeGroups.value.normal.sash || [] },
  { label: '도어', field: 'dcGrdDoor', options: gradeGroups.value.normal.door || [] },
  { label: '판넬', field: 'dcGrdPannel', options: gradeGroups.value.normal.panel || [] },
  { label: '타사', field: 'dcGrdOtherComp', options: gradeGroups.value.normal.tasa || [] },
  { label: '알유리', field: 'dcGrdGlas', options: gradeGroups.value.normal.glass || [] },
  { label: '몰딩', field: 'dcGrdMold', options: gradeGroups.value.normal.molding || [] },
  { label: '유통자재', field: 'dcGrdDtbtMtrl', options: gradeGroups.value.normal.material || [] },
  { label: '유통상품', field: 'dcGrdDtbtGoods', options: gradeGroups.value.normal.product || [] },
])

const crossGradeItems = computed(() => [
  { label: '도어', field: 'dcGrdDoorCr', options: gradeGroups.value.cross.crossDoor || [] },
  { label: '몰딩', field: 'dcGrdMoldCr', options: gradeGroups.value.cross.crossMolding || [] },
  { label: '유통자재', field: 'dcGrdDtbtMtrlCr', options: gradeGroups.value.cross.crossMaterial || [] },
  { label: '유통상품', field: 'dcGrdDtbtGoodsCr', options: gradeGroups.value.cross.crossProduct || [] },
])

onMounted(async () => {
  await Promise.all([loadGradeOptions(), loadClient()])
})

function createEmptyForm() {
  return {
    ...buildDefaultClientGrades(),
    bzpc: '',
    bzpcNm: '',
    vkbur: '',
    vkburNm: '',
    vkgrp: '',
    vkgrpNm: '',
    dplcCd: '',
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
  }
}

async function loadGradeOptions() {
  try {
    const { data } = await searchClientGradeOptions()
    gradeGroups.value = buildClientGradeOptionGroups(data || {})
  } catch {
    gradeGroups.value = buildClientGradeOptionGroups({ resultList: [], resultListCross: [] })
  }
}

async function loadClient() {
  error.value = ''
  loading.value = true
  try {
    const dplcCd = String(route.params.dplcCd || '')
    const searchBzpc = String(route.query.bzpc || auth.bzpc || '')
    if (!dplcCd) throw new Error('거래처코드가 없습니다')
    if (!searchBzpc) throw new Error('영업소 정보가 없어 거래처를 불러올 수 없습니다')

    const { data } = await searchClientList({
      searchBzpc: searchBzpc,
      searchDplcCd: dplcCd,
      searchDplcScn: '02',
      searchBztcSt: '01',
      curPage: 1,
      perPage: 1,
    })
    const row = (data?.resultList || [])[0]
    if (!row) throw new Error('거래처를 찾을 수 없습니다')
    originalRow.value = row
    form.value = mapRowToForm(row, searchBzpc)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '거래처 조회 실패'
  } finally {
    loading.value = false
  }
}

function mapRowToForm(row, fallbackBzpc) {
  const defaults = createEmptyForm()
  return {
    ...defaults,
    ...buildGradePayload({ ...defaults, ...row }),
    bzpc: row.bzpc || fallbackBzpc || '',
    bzpcNm: row.bzpcNm || '',
    vkbur: row.vkbur || '',
    vkburNm: row.vkburNm || '',
    vkgrp: row.vkgrp || '',
    vkgrpNm: row.vkgrpNm || '',
    dplcCd: row.dplcCd || '',
    dplcScn: row.dplcScn || '02',
    bsnsScn: row.bsnsScn || '01',
    dplcNm: row.dplcNm || row.dplcCdNm || '',
    repNm: row.repNm || '',
    repMobile: row.repMobile || '',
    bzno: row.bzno || '',
    bzci: row.bzci || '',
    aitm: row.aitm || '',
    tel: row.tel || '',
    dplcCrgrNm: row.dplcCrgrNm || '',
    dplcCrgrMobile: row.dplcCrgrMobile || '',
    dplcCrgrCcpc: row.dplcCrgrCcpc || '',
    eml: row.eml || row.email || '',
    remSrc: row.remSrc || '',
  }
}

function validateForm() {
  if (!form.value.bzpc || !form.value.dplcCd) return '거래처 식별 정보가 없습니다'
  if (auth.isAdmin && (!form.value.vkbur || !form.value.vkgrp || !form.value.bzpc)) {
    return '관리자는 사업장/영업그룹/영업소 정보가 있는 거래처만 수정할 수 있습니다'
  }
  if (!trimText(form.value.dplcNm)) return '거래처명을 입력하세요'
  if (!trimText(form.value.repNm)) return '대표자명을 입력하세요'
  if (form.value.bsnsScn === '01' && !trimText(form.value.bzno)) return '사업자번호를 입력하세요'
  if (form.value.bsnsScn === '02' && !trimText(form.value.repMobile)) return '대표자휴대폰번호를 입력하세요'
  return ''
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
    const payload = {
      ...originalRow.value,
      ...form.value,
      ...buildGradePayload(form.value),
      dplcScn: '02',
      bzpc: form.value.bzpc,
      dplcCd: form.value.dplcCd,
      dplcNm: trimText(form.value.dplcNm),
      repNm: trimText(form.value.repNm),
      repMobile: trimText(form.value.repMobile),
      bzno: trimText(form.value.bzno),
      searchBzpc: form.value.bzpc,
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

function trimText(value) {
  return String(value || '').trim()
}
</script>
