<template>
  <div>
    <div v-if="pageLoading" style="text-align:center;padding:60px 0">
      <div style="font-size:14px;color:#64748b;margin-bottom:12px">견적 데이터 불러오는 중...</div>
      <div class="loading-spinner"></div>
    </div>
    <h2 v-else style="margin:4px 4px 12px;font-size:17px">{{ isEditMode ? `샤시 견적 #${editEstiSeq} 편집` : '샤시 견적 작성' }}</h2>

    <div class="card" style="background:#eef2ff">
      <div style="font-size:11px;color:#64748b">통합견적번호 / 샤시견적번호</div>
      <div style="font-weight:600;font-size:13px">{{ itgEstiNo }}</div>
      <div style="font-size:12px;color:#1f2a44">wEstiNo: {{ wEstiNo || '(없음)' }}</div>
    </div>

    <!-- ─── 필수 ─── -->
    <div v-if="!pageLoading" class="card">
      <!-- 모형 -->
      <div class="field">
        <label>모형 *</label>
        <input
          readonly
          :value="modelDisplay"
          placeholder="터치해서 모형 검색"
          style="cursor:pointer;background:#fff"
          @click="modelModal?.open()"
        />
        <div v-if="form.mdlCd" style="font-size:11px;color:#64748b;margin-top:4px">
          자재사 {{ form.mtrlCoNm || '-' }} · 사이즈코드 {{ form.sizCd || '-' }}
        </div>
      </div>

      <!-- 창형태 (모형 바로 아래) -->
      <div class="field">
        <label>창형태 *</label>
        <select v-model="form.wintydiCd" @change="onWintydiChange">
          <option value="">선택</option>
          <option v-for="w in wintydiList" :key="w.commCdId" :value="w.commCdId">
            {{ w.commCdNm }} ({{ w.commCdId }})
          </option>
        </select>
        <div v-if="form.wintydiCd" style="font-size:11px;color:#0ea5e9;margin-top:2px">
          입력가능: W={{ cntW }}개, H={{ cntH }}개, CS={{ cntCS }}개
        </div>
      </div>

      <!-- SF 자재 -->
      <div class="row-flex">
        <div class="field">
          <label>SF내 자재 *</label>
          <select v-model="form.insdSf">
            <option value="">선택</option>
            <option v-for="s in insdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
              {{ s.mtrlProdCd }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>SF외 자재 *</label>
          <select v-model="form.ousdSf">
            <option value="">선택</option>
            <option v-for="s in ousdSfList" :key="s.mtrlProdCd" :value="s.mtrlProdCd">
              {{ s.mtrlProdCd }}
            </option>
          </select>
        </div>
      </div>

      <!-- 사이즈 W/H/수량 -->
      <div class="row-flex">
        <div class="field">
          <label>W (폭) *</label>
          <input v-model.number="form.w" type="number" inputmode="numeric" />
        </div>
        <div class="field">
          <label>H (높이) *</label>
          <input v-model.number="form.h" type="number" inputmode="numeric" />
        </div>
        <div class="field" style="max-width:80px">
          <label>수량 *</label>
          <input v-model.number="form.qty" type="number" inputmode="numeric" min="1" />
        </div>
      </div>

      <!-- 추가 W -->
      <div v-if="cntW > 1" class="row-flex">
        <div v-if="cntW > 1" class="field"><label>W1</label><input v-model.number="form.w1" type="number" /></div>
        <div v-if="cntW > 2" class="field"><label>W2</label><input v-model.number="form.w2" type="number" /></div>
        <div v-if="cntW > 3" class="field"><label>W3</label><input v-model.number="form.w3" type="number" /></div>
      </div>
      <div v-if="cntW > 4" class="row-flex">
        <div v-if="cntW > 4" class="field"><label>W4</label><input v-model.number="form.w4" type="number" /></div>
        <div v-if="cntW > 5" class="field"><label>W5</label><input v-model.number="form.w5" type="number" /></div>
      </div>

      <!-- 추가 H -->
      <div v-if="cntH > 1" class="row-flex">
        <div v-if="cntH > 1" class="field"><label>H1</label><input v-model.number="form.h1" type="number" /></div>
        <div v-if="cntH > 2" class="field"><label>H2</label><input v-model.number="form.h2" type="number" /></div>
        <div v-if="cntH > 3" class="field"><label>H3</label><input v-model.number="form.h3" type="number" /></div>
      </div>
      <div v-if="cntH > 4" class="row-flex">
        <div v-if="cntH > 4" class="field"><label>H4</label><input v-model.number="form.h4" type="number" /></div>
        <div v-if="cntH > 5" class="field"><label>H5</label><input v-model.number="form.h5" type="number" /></div>
      </div>

      <!-- 특수조건 CS -->
      <div v-if="cntCS > 0" style="margin-top:6px">
        <div style="font-size:11px;color:#64748b;margin-bottom:4px">특수조건 (사이즈 mm)</div>
        <div class="row-flex">
          <div v-if="cntCS > 0" class="field"><label>CS</label><input v-model.number="form.cs" type="number" /></div>
          <div v-if="cntCS > 1" class="field"><label>CS1</label><input v-model.number="form.cs1" type="number" /></div>
          <div v-if="cntCS > 2" class="field"><label>CS2</label><input v-model.number="form.cs2" type="number" /></div>
        </div>
        <div v-if="cntCS > 3" class="row-flex">
          <div v-if="cntCS > 3" class="field"><label>CS3</label><input v-model.number="form.cs3" type="number" /></div>
          <div v-if="cntCS > 4" class="field"><label>CS4</label><input v-model.number="form.cs4" type="number" /></div>
          <div v-if="cntCS > 5" class="field"><label>CS5</label><input v-model.number="form.cs5" type="number" /></div>
        </div>
      </div>

      <!-- 발주구분 -->
      <div class="field">
        <label>발주구분 *</label>
        <select v-model="form.sashOrdTypCd">
          <option value="">선택</option>
          <option v-for="o in ordTypList" :key="o.commCdId" :value="o.commCdId">
            {{ o.commCdNm }}
          </option>
        </select>
      </div>

      <!-- 색상: 기본(고정 WH) / 내부 / 외부 한 줄 -->
      <div class="row-flex row-compact">
        <div class="field" style="max-width:80px">
          <label>기본색상</label>
          <input :value="form.crtnColrCd" readonly style="background:#f1f5f9;text-align:center" />
        </div>
        <div class="field">
          <label>내부색상 *</label>
          <select v-model="form.insdColrCd" @change="onInsdColorChange">
            <option value="">선택</option>
            <option v-for="c in colorList" :key="'i'+c.commCdId" :value="c.commCdId">
              {{ c.commCdNm }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>
            외부색상
            <span v-if="syncOusd" style="font-size:9px;color:#0ea5e9;font-weight:normal">· 동기화</span>
          </label>
          <select v-model="form.ousdColrCd" @change="onOusdColorChange">
            <option v-for="c in colorList" :key="'o'+c.commCdId" :value="c.commCdId">
              {{ c.commCdNm }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- ─── 상세 옵션 1: VENT / 스크린 / 안전망 ─── -->
    <details class="card">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;color:#1f2a44">VENT / 스크린 / 안전망</summary>
      <div style="margin-top:12px">
        <div class="field">
          <label>VENT 위치</label>
          <select v-model="form.ventLoc">
            <option value="">없음</option>
            <option v-for="v in ventOptions" :key="v.commCdId" :value="v.commCdId">
              {{ v.commCdNm }}
            </option>
          </select>
          <div v-if="form.wintydiCd && !ventOptions.length" style="font-size:11px;color:#94a3b8;margin-top:2px">
            이 창형태에는 VENT 옵션이 없습니다
          </div>
        </div>

        <div class="row-flex" style="align-items:flex-end">
          <div class="field" style="flex:2">
            <label>스크린 종류</label>
            <select v-model="form.screenType">
              <option value="">선택</option>
              <option v-for="s in screenOptions" :key="s.commCdId" :value="s.commCdId">
                {{ s.commCdNm }}
              </option>
            </select>
          </div>
          <div class="field" style="flex:1;max-width:120px">
            <label>안전망</label>
            <button
              type="button"
              class="btn"
              :class="form.isAluMf ? '' : 'secondary'"
              style="padding:10px"
              @click="toggleAluMf"
            >
              {{ form.isAluMf ? 'ON' : 'OFF' }}
            </button>
          </div>
        </div>

        <div class="field" style="margin-top:8px">
          <label>실리콘 마감</label>
          <button
            type="button"
            class="btn"
            :class="form.slcnFnshYn ? '' : 'secondary'"
            style="padding:10px;max-width:120px"
            @click="form.slcnFnshYn = !form.slcnFnshYn"
          >
            {{ form.slcnFnshYn ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
    </details>

    <!-- ─── 상세 옵션 2: 핸들 ─── -->
    <details class="card">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;color:#1f2a44">핸들 (내부 / 외부)</summary>
      <div style="margin-top:12px">
        <div class="row-flex">
          <div class="field">
            <label>내부 핸들 종류</label>
            <select v-model="form.insdHandleType">
              <option value="">선택</option>
              <option v-for="h in handleOptions" :key="'i'+h.commCdId" :value="h.commCdId">{{ h.commCdNm }}</option>
            </select>
          </div>
          <div class="field">
            <label>
              내부 핸들 높이
              <button
                type="button"
                style="margin-left:6px;padding:2px 8px;border-radius:6px;border:0;font-size:10px;cursor:pointer"
                :style="{ background: form.insdHndlHEnabled ? '#1f2a44' : '#e5e7eb', color: form.insdHndlHEnabled ? '#fff' : '#1f2a44' }"
                @click="toggleInsdHndlH"
              >{{ form.insdHndlHEnabled ? 'ON' : 'OFF' }}</button>
            </label>
            <input
              v-model.number="form.insdHndlH"
              type="number"
              placeholder="mm"
              :disabled="!form.insdHndlHEnabled"
              :style="{ background: form.insdHndlHEnabled ? '#fff' : '#f1f5f9' }"
            />
          </div>
        </div>
        <div class="row-flex">
          <div class="field">
            <label>외부 핸들 종류</label>
            <select v-model="form.ousdHandleType">
              <option value="">선택</option>
              <option v-for="h in handleOptions" :key="'o'+h.commCdId" :value="h.commCdId">{{ h.commCdNm }}</option>
            </select>
          </div>
          <div class="field">
            <label>
              외부 핸들 높이
              <button
                type="button"
                style="margin-left:6px;padding:2px 8px;border-radius:6px;border:0;font-size:10px;cursor:pointer"
                :style="{ background: form.ousdHndlHEnabled ? '#1f2a44' : '#e5e7eb', color: form.ousdHndlHEnabled ? '#fff' : '#1f2a44' }"
                @click="toggleOusdHndlH"
              >{{ form.ousdHndlHEnabled ? 'ON' : 'OFF' }}</button>
            </label>
            <input
              v-model.number="form.ousdHndlH"
              type="number"
              placeholder="mm"
              :disabled="!form.ousdHndlHEnabled"
              :style="{ background: form.ousdHndlHEnabled ? '#fff' : '#f1f5f9' }"
            />
          </div>
        </div>
      </div>
    </details>

    <!-- ─── 상세 옵션 3: 유리 (모형이 지원하는 종류만 노출) ─── -->
    <details class="card" v-if="hasAnyGlas">
      <summary style="cursor:pointer;font-weight:600;font-size:13px;color:#1f2a44">유리 자재 (SF / BF)</summary>
      <div style="margin-top:12px">
        <div v-if="glas.sfIn.length || glas.sfOut.length" class="row-flex">
          <div v-if="glas.sfIn.length" class="field">
            <label>SF 유리 (내)</label>
            <select v-model="form.mtrlCds1">
              <option v-for="g in glas.sfIn" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
            </select>
          </div>
          <div v-if="glas.sfOut.length" class="field">
            <label>SF 유리 (외)</label>
            <select v-model="form.mtrlCds2">
              <option v-for="g in glas.sfOut" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
            </select>
          </div>
        </div>
        <div v-if="glas.bfIn.length || glas.bfOut.length" class="row-flex">
          <div v-if="glas.bfIn.length" class="field">
            <label>BF 유리 (내)</label>
            <select v-model="form.mtrlCds3">
              <option v-for="g in glas.bfIn" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
            </select>
          </div>
          <div v-if="glas.bfOut.length" class="field">
            <label>BF 유리 (외)</label>
            <select v-model="form.mtrlCds4">
              <option v-for="g in glas.bfOut" :key="g.mtrlCd" :value="g.mtrlCd">{{ g.mtrlNm }}</option>
            </select>
          </div>
        </div>
      </div>
    </details>

    <!-- 비고 -->
    <div class="card">
      <div class="field">
        <label>견적비고</label>
        <textarea v-model="form.remSrc" rows="2" />
      </div>
    </div>

    <!-- DEBUG: 저장 버튼 비활성 원인 진단 -->
    <div class="card" style="background:#fffbeb;border:1px solid #fde68a;font-size:11px;font-family:monospace">
      <div style="font-weight:600;margin-bottom:6px">저장 활성 조건 ({{ canSubmit ? '✅ 모두 OK' : '❌ 누락 있음' }})</div>
      <div :style="{color: itgEstiNo ? '#16a34a' : '#dc2626'}">itgEstiNo: {{ itgEstiNo || '(빈값)' }}</div>
      <div :style="{color: form.mdlCd ? '#16a34a' : '#dc2626'}">mdlCd: {{ form.mdlCd || '(빈값)' }}</div>
      <div :style="{color: form.wintydiCd ? '#16a34a' : '#dc2626'}">wintydiCd: {{ form.wintydiCd || '(빈값)' }} · 옵션수: {{ wintydiList.length }}</div>
      <div :style="{color: form.w ? '#16a34a' : '#dc2626'}">w: {{ form.w || '(빈값)' }}</div>
      <div :style="{color: form.h ? '#16a34a' : '#dc2626'}">h: {{ form.h || '(빈값)' }}</div>
      <div :style="{color: form.qty ? '#16a34a' : '#dc2626'}">qty: {{ form.qty || '(빈값)' }}</div>
      <div :style="{color: form.insdColrCd ? '#16a34a' : '#dc2626'}">insdColrCd: {{ form.insdColrCd || '(빈값)' }} · 색상수: {{ colorList.length }}</div>
      <div :style="{color: form.insdSf ? '#16a34a' : '#dc2626'}">insdSf: {{ form.insdSf || '(빈값)' }} · SF내옵션수: {{ insdSfList.length }}</div>
      <div :style="{color: form.ousdSf ? '#16a34a' : '#dc2626'}">ousdSf: {{ form.ousdSf || '(빈값)' }} · SF외옵션수: {{ ousdSfList.length }}</div>
    </div>

    <button class="btn" :disabled="loading || !canSubmit" @click="submit">
      {{ loading ? '저장 중...' : '샤시 견적 저장' }}
    </button>
    <div v-if="error" class="card" style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-size:12px;white-space:pre-wrap">{{ error }}</div>
    <div v-if="ok" class="error" style="color:#16a34a">샤시 견적 저장 완료 (estiSeq {{ ok }})</div>

    <ModelSearchModal ref="modelModal" @select="onModelPick" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModelSearchModal from '../components/ModelSearchModal.vue'
import { saveSashEsti, searchColorList, searchModelSf, searchGlasList, searchCodeList, searchModelWintydi, searchSashOrdTypCd, selectSashDetail } from '../api/estimate'

const route = useRoute()
const router = useRouter()
const modelModal = ref(null)

const itgEstiNo = ref(route.query.itgEstiNo || '')
const wEstiNo = ref(route.query.wEstiNo || '')
const editEstiSeq = ref(route.query.estiSeq || '')   // 편집 모드면 값 있음
const isEditMode = computed(() => !!editEstiSeq.value)

// 코드 마스터
const wintydiList = ref([])     // 창형태 — 모형 선택 시 모형이 지원하는 것만 채워짐
const wintydiMap = ref({})      // wintydiCd → {cntW, cntH, cntCS}
const ventAllList = ref([])     // VENT 전체 (commCdGrpId=48), 클라이언트 필터링
const screenAllList = ref([])   // 스크린 전체 (commCdGrpId=379), 클라이언트 필터링
const handleAllList = ref([])   // 핸들 전체 (commCdGrpId=378), 모형 자재사 따라 필터링
const ordTypList = ref([])      // 샤시 발주구분 (selectOrdTypCd)
const colorList = ref([])
const pickedMdlMtrlCo = ref('') // 선택된 모형의 자재회사 코드 (HC/HW/LX 등)

const form = ref({
  mdlCd: '', mdlNm: '', wintydiCd: '', mtrlCoNm: '',
  bftydiCd: '', sizCd: '', bsmfOrdUtmCd: '',
  w: null, h: null, qty: 1,
  w1: null, w2: null, w3: null, w4: null, w5: null,
  h1: null, h2: null, h3: null, h4: null, h5: null,
  cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  crtnColrCd: 'WH',  // 웹 SashForm 라인 7810: 항상 "WH" 하드코딩
  insdColrCd: '', ousdColrCd: '',
  insdSf: '', ousdSf: '',
  sashOrdTypCd: '',                                  // 발주구분
  ventLoc: '', screenType: '',
  isAluMf: false,
  slcnFnshYn: false,                                   // 실리콘 마감 여부
  insdHandleType: '', ousdHandleType: '',
  insdHndlHEnabled: false, ousdHndlHEnabled: false,    // 핸들 높이 직접 입력 토글
  insdHndlH: null, ousdHndlH: null,
  mtrlCds1: '', mtrlCds2: '', mtrlCds3: '', mtrlCds4: '',
  remSrc: '',
})

const insdSfList = ref([])
const ousdSfList = ref([])
const glas = ref({ sfIn: [], sfOut: [], bfIn: [], bfOut: [] })

const loading = ref(false)
const pageLoading = ref(false)
const error = ref('')
const ok = ref('')
const syncOusd = ref(true)

const modelDisplay = computed(() => (form.value.mdlCd ? `${form.value.mdlNm} (${form.value.mdlCd})` : ''))

// 창형태 → 카운트
const cntInfo = computed(() => wintydiMap.value[form.value.wintydiCd] || {})
const cntW = computed(() => Number(cntInfo.value.cntW) || 0)
const cntH = computed(() => Number(cntInfo.value.cntH) || 0)
const cntCS = computed(() => Number(cntInfo.value.cntCS) || 0)

// VENT: 창형태에 묶임 (web SashForm getVent: addInfo1='30', addInfo2=wintydiCd)
const ventOptions = computed(() =>
  ventAllList.value.filter((v) => v.addInfo1 === '30' && v.addInfo2 === form.value.wintydiCd)
)

// 스크린: 안전망(isAluMf) 여부에 따라 ALU/PVC 필터 (web SashForm getScreen: addInfo4)
const screenOptions = computed(() => {
  const target = form.value.isAluMf ? 'ALU' : 'PVC'
  return screenAllList.value.filter((s) => s.addInfo4 === target)
})

// 핸들: HC/HW/LX 자재회사면 전체, 그 외는 addInfo7 !== 'Y' 만 (web SashForm getHandle 동일)
const handleOptions = computed(() => {
  const isCheckMtrlCo = ['HC', 'HW', 'LX'].includes(pickedMdlMtrlCo.value)
  return handleAllList.value.filter((h) => isCheckMtrlCo || h.addInfo7 !== 'Y')
})

// 유리 카드 노출 여부 (4가지 중 하나라도 옵션 있으면)
const hasAnyGlas = computed(() => glas.value.sfIn.length || glas.value.sfOut.length || glas.value.bfIn.length || glas.value.bfOut.length)

const canSubmit = computed(
  () =>
    !!itgEstiNo.value && !!form.value.mdlCd && !!form.value.wintydiCd &&
    !!form.value.w && !!form.value.h && !!form.value.qty &&
    !!form.value.insdColrCd && !!form.value.insdSf && !!form.value.ousdSf
)

onMounted(async () => {
  // 편집 모드면 기존 샤시 데이터 로드
  if (isEditMode.value) {
    pageLoading.value = true
    try {
      sessionStorage.removeItem('mobile_sash_edit_row')   // 사용 안 함, cleanup
      const payload = {
        itgEstiNo: itgEstiNo.value,
        estiNo: wEstiNo.value,
        estiNos: route.query.estiNos || '1',
        estiSeq: String(editEstiSeq.value),
      }
      console.log('[SashNew] selectSashDetail payload', payload)
      const { data } = await selectSashDetail(payload)
      console.log('[SashNew] selectSashDetail response', data)
      let r = data?.resultData

      if (r) {
        // Lombok-Jackson 직렬화 이슈 보정 (wSize → WSize 등)
        // Java 필드 wSize → getWSize() → Jackson 키 "WSize" (앞두자가 모두 대문자처럼 인식)
        // wEstiNo, wSize, hSize 동일 패턴
        const pick = (...keys) => {
          for (const k of keys) {
            if (r[k] != null && r[k] !== '') return r[k]
          }
          return null
        }
        // 모든 wXxx / hXxx 형태 필드 alias 매핑
        r.wSize = pick('wSize', 'WSize', 'w_size', 'W_SIZE')
        r.hSize = pick('hSize', 'HSize', 'h_size', 'H_SIZE')
        r.w1Size = pick('w1Size', 'W1Size')
        r.w2Size = pick('w2Size', 'W2Size')
        r.w3Size = pick('w3Size', 'W3Size')
        r.w4Size = pick('w4Size', 'W4Size')
        r.w5Size = pick('w5Size', 'W5Size')
        r.h1Size = pick('h1Size', 'H1Size')
        r.h2Size = pick('h2Size', 'H2Size')
        r.h3Size = pick('h3Size', 'H3Size')
        r.h4Size = pick('h4Size', 'H4Size')
        r.h5Size = pick('h5Size', 'H5Size')
        // 핵심 필드 매핑 (백엔드 EstiClWindInfo → form)
        Object.assign(form.value, {
          mdlCd: r.mdlCd || '',
          mdlNm: r.mdlNm || '',
          wintydiCd: r.wintydiCd || '',
          mtrlCoNm: r.mtrlCoNm || '',
          bftydiCd: r.bftydiCd || '',
          sizCd: r.sizCd || '',
          bsmfOrdUtmCd: r.bsmfOrdUtmCd || '',
          sashOrdTypCd: r.sashOrdTypCd || '',
          w: r.wSize ? Number(r.wSize) : null,
          h: r.hSize ? Number(r.hSize) : null,
          qty: r.qty ? Number(r.qty) : 1,
          w1: r.w1Size ? Number(r.w1Size) : null,
          w2: r.w2Size ? Number(r.w2Size) : null,
          w3: r.w3Size ? Number(r.w3Size) : null,
          h1: r.h1Size ? Number(r.h1Size) : null,
          h2: r.h2Size ? Number(r.h2Size) : null,
          h3: r.h3Size ? Number(r.h3Size) : null,
          cs: r.csSize ? Number(r.csSize) : null,
          cs1: r.cs1Size ? Number(r.cs1Size) : null,
          cs2: r.cs2Size ? Number(r.cs2Size) : null,
          insdColrCd: r.insdColrCd || '',
          ousdColrCd: r.ousdColrCd || '',
          insdSf: r.insdSf || '',
          ousdSf: r.ousdSf || '',
          ventLoc: r.ventLoc || '',
          screenType: r.screenType || '',
          insdHandleType: r.insdHandleType || '',
          ousdHandleType: r.ousdHandleType || '',
          mtrlCds1: r.mtrlCds1 || r.insdSfGlasMtrlCd || '',
          mtrlCds2: r.mtrlCds2 || r.ousdSfGlasMtrlCd || '',
          mtrlCds3: r.mtrlCds3 || r.insdBfGlasMtrlCd || '',
          mtrlCds4: r.mtrlCds4 || r.ousdBfGlasMtrlCd || '',
          remSrc: r.remSrc || '',
        })
        // 모형 옵션 마스터 로드 (창형태/SF자재/유리/핸들)
        if (r.mdlCd) await onModelPick({ ...r })
      }
    } catch (e) {
      error.value = '편집 데이터 로드 실패: ' + (e.message || '')
    }
  }

  // 색상 + 창형태/VENT/스크린 코드 동시 로드 (편집/신규 공용)
  try {
    // 창형태(30)는 모형 선택 시 /model/wintydi 로 모형별 제한 리스트만 받음 → 마운트 시 미로드
    const [colorRes, ventRes, screenRes, handleRes, ordRes] = await Promise.all([
      searchColorList(),
      searchCodeList('48'),
      searchCodeList('379'),
      searchCodeList('378'),
      searchSashOrdTypCd(),
    ])
    // 매퍼가 commCdVal 로 내려보냄 → commCdId 별칭 추가해서 일관 사용
    const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))
    colorList.value = normCd(colorRes.data?.resultList)
    ventAllList.value = normCd(ventRes.data?.resultList)
    screenAllList.value = normCd(screenRes.data?.resultList)
    handleAllList.value = normCd(handleRes.data?.resultList)
    // 발주구분: 공통코드 143 중 addInfo2='Y' (샤시 전용) 만 필터링 — 웹 SashForm.getOrdTypCode 와 동일
    ordTypList.value = normCd(ordRes.data?.resultList).filter((c) => c.addInfo2 === 'Y')
    if (ordTypList.value.length && !form.value.sashOrdTypCd) {
      form.value.sashOrdTypCd = ordTypList.value[0].commCdId
    }
  } catch (e) {
    error.value = '코드 마스터 로드 실패: ' + (e.message || '')
  } finally {
    pageLoading.value = false
  }
})

async function onModelPick(row) {
  form.value.mdlCd = row.mdlCd || ''
  form.value.mdlNm = row.mdlNm || ''
  form.value.mtrlCoNm = row.mtrlCoNm || ''
  form.value.bftydiCd = row.bftydiCd || ''
  form.value.sizCd = row.sizCd || ''
  form.value.bsmfOrdUtmCd = row.bsmfOrdUtmCd || ''
  pickedMdlMtrlCo.value = row.mtrlCo || ''

  // 모형별 창형태 리스트 (제한적) — 웹 getWintyDi 와 동일
  try {
    const { data } = await searchModelWintydi(row.mdlCd)
    const list = (data?.resultList || []).map((it) => ({
      commCdId: it.commCdVal || it.commCdId,
      commCdNm: it.commCdNm,
      addInfo1: it.addInfo1, addInfo2: it.addInfo2, addInfo3: it.addInfo3,
    }))
    wintydiList.value = list
    const map = {}
    for (const it of list) map[it.commCdId] = { cntW: it.addInfo1, cntH: it.addInfo2, cntCS: it.addInfo3 }
    wintydiMap.value = map
    // 모형 row 의 wintydiCd 가 리스트에 있으면 그걸 선택, 아니면 첫 항목
    const rowWin = row.wintydiCd
    form.value.wintydiCd = (rowWin && map[rowWin]) ? rowWin : (list[0]?.commCdId ?? '')
  } catch (e) {
    wintydiList.value = []
    wintydiMap.value = {}
    form.value.wintydiCd = ''
  }

  // 모형 변경 시 추가 사이즈 / CS 초기화
  Object.assign(form.value, {
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  })

  // SF/유리 마스터 로드 (유리는 itgEstiNo/wEstiNo 같이 전달 필요)
  try {
    const [sfRes, glasRes] = await Promise.all([
      searchModelSf(row.mdlCd).catch(() => ({ data: {} })),
      searchGlasList({
        searchMdlCd: row.mdlCd,
        searchItgEstiNo: itgEstiNo.value,
        searchEstiNo: wEstiNo.value,
        searchEstiNos: '1',
        searchEstiSeq: '1',
      }).catch(() => ({ data: {} })),
    ])
    insdSfList.value = sfRes.data?.insdSf || sfRes.data?.resultList || []
    ousdSfList.value = sfRes.data?.ousdSf || sfRes.data?.resultList3 || []
    if (insdSfList.value.length) form.value.insdSf = insdSfList.value[0].mtrlProdCd
    if (ousdSfList.value.length) form.value.ousdSf = ousdSfList.value[0].mtrlProdCd

    glas.value = {
      sfIn: glasRes.data?.resultList || [],
      sfOut: glasRes.data?.resultList3 || [],
      bfIn: glasRes.data?.resultList5 || [],
      bfOut: glasRes.data?.resultList7 || [],
    }
    if (glas.value.sfIn.length)  form.value.mtrlCds1 = glas.value.sfIn[0].mtrlCd
    if (glas.value.sfOut.length) form.value.mtrlCds2 = glas.value.sfOut[0].mtrlCd
    if (glas.value.bfIn.length)  form.value.mtrlCds3 = glas.value.bfIn[0].mtrlCd
    if (glas.value.bfOut.length) form.value.mtrlCds4 = glas.value.bfOut[0].mtrlCd
  } catch (e) {}

  // 색상 디폴트: crtnColrCd 는 'WH' 고정, 내부/외부는 첫 색상으로 세팅
  form.value.crtnColrCd = 'WH'
  if (colorList.value.length) {
    const def = colorList.value[0].commCdId
    form.value.insdColrCd = def
    form.value.ousdColrCd = def
    syncOusd.value = true
  }

  // 창형태 변경에 따른 VENT/스크린 첫 옵션 자동 선택
  applyVentDefault()
  applyScreenDefault()

  // 핸들 자동 선택 — 웹 SashForm: 모형 선택 후 getHandle("C") → 첫 옵션 자동 세팅
  // handleAllList 가 아직 비어있으면 (마운트 비동기 미완) 여기서 로드
  if (!handleAllList.value.length) {
    try {
      const normCd = (arr) => (arr || []).map((x) => ({ ...x, commCdId: x.commCdId || x.commCdVal }))
      const handleRes = await searchCodeList('378')
      handleAllList.value = normCd(handleRes.data?.resultList)
    } catch (_) {}
  }
  applyHandleDefault()
  console.log('[SashNew] handle auto-select:', form.value.insdHandleType, '/', form.value.ousdHandleType, '/ options:', handleOptions.value.length)
}

function applyHandleDefault() {
  const opts = handleOptions.value
  const first = opts.length ? opts[0].commCdId : ''
  form.value.insdHandleType = first
  form.value.ousdHandleType = first
}

function onWintydiChange() {
  // 사용자가 창형태 직접 변경 → CS/W#/H# 초기화
  Object.assign(form.value, {
    w1: null, w2: null, w3: null, w4: null, w5: null,
    h1: null, h2: null, h3: null, h4: null, h5: null,
    cs: null, cs1: null, cs2: null, cs3: null, cs4: null, cs5: null,
  })
  applyVentDefault()
}

function applyVentDefault() {
  const opts = ventOptions.value
  form.value.ventLoc = opts.length ? opts[0].commCdId : ''
}
function applyScreenDefault() {
  const opts = screenOptions.value
  form.value.screenType = opts.length ? opts[0].commCdId : ''
}

function toggleAluMf() {
  form.value.isAluMf = !form.value.isAluMf
  // 스크린 옵션 필터 변경 → 첫 옵션 재선택
  applyScreenDefault()
}

function toggleInsdHndlH() {
  form.value.insdHndlHEnabled = !form.value.insdHndlHEnabled
  if (!form.value.insdHndlHEnabled) form.value.insdHndlH = null
}
function toggleOusdHndlH() {
  form.value.ousdHndlHEnabled = !form.value.ousdHndlHEnabled
  if (!form.value.ousdHndlHEnabled) form.value.ousdHndlH = null
}

function onInsdColorChange() {
  if (syncOusd.value) form.value.ousdColrCd = form.value.insdColrCd
}
function onOusdColorChange() {
  syncOusd.value = form.value.ousdColrCd === form.value.insdColrCd
}

async function submit() {
  error.value = ''
  ok.value = ''

  if (!itgEstiNo.value) return (error.value = '통합견적번호가 없습니다')
  if (!form.value.mdlCd) return (error.value = '모형을 선택하세요')
  if (!form.value.wintydiCd) return (error.value = '창형태를 선택하세요')
  if (!form.value.w || !form.value.h) return (error.value = 'W/H 사이즈를 입력하세요')
  if (!form.value.qty || form.value.qty < 1) return (error.value = '수량을 1 이상으로 입력하세요')
  if (!form.value.insdColrCd) return (error.value = '내부 색상을 선택하세요')
  if (!form.value.insdSf || !form.value.ousdSf) return (error.value = 'SF내/외 자재를 선택하세요')

  loading.value = true
  try {
    const f = form.value
    const s = (v) => (v == null || v === '' ? '' : String(v))
    const payload = {
      itgEstiNo: itgEstiNo.value,
      estiNo: wEstiNo.value,
      estiNos: route.query.estiNos || '1',
      estiSeq: editEstiSeq.value || '',  // 편집 모드면 기존 seq, 신규면 백엔드 자동 채번

      mdlCd: f.mdlCd,
      wintydiCd: f.wintydiCd,
      bftydiCd: f.bftydiCd,
      sizCd: f.sizCd,
      bsmfOrdUtmCd: f.bsmfOrdUtmCd,
      sashOrdTypCd: f.sashOrdTypCd,

      w0Size: s(f.w),
      h0Size: s(f.h),
      qty: s(f.qty),
      w1Size: s(f.w1), w2Size: s(f.w2), w3Size: s(f.w3), w4Size: s(f.w4), w5Size: s(f.w5),
      h1Size: s(f.h1), h2Size: s(f.h2), h3Size: s(f.h3), h4Size: s(f.h4), h5Size: s(f.h5),
      csSize: s(f.cs), cs1Size: s(f.cs1), cs2Size: s(f.cs2),
      cs3Size: s(f.cs3), cs4Size: s(f.cs4), cs5Size: s(f.cs5),

      crtnColrCd: 'WH',  // 웹과 동일하게 고정
      insdColrCd: f.insdColrCd,
      ousdColrCd: f.ousdColrCd || f.insdColrCd,

      insdSf: f.insdSf,
      ousdSf: f.ousdSf,
      ventLoc: f.ventLoc,
      screenType: f.screenType,
      aluMfYn: f.isAluMf ? 'Y' : 'N',
      bfSlcnFnshYn: f.slcnFnshYn ? 'Y' : 'N',

      insdHandleType: f.insdHandleType,
      ousdHandleType: f.ousdHandleType,
      insdHndlH: s(f.insdHndlH),
      ousdHndlH: s(f.ousdHndlH),

      mtrlCds1: f.mtrlCds1, mtrlCds2: f.mtrlCds2,
      mtrlCds3: f.mtrlCds3, mtrlCds4: f.mtrlCds4,

      remSrc: f.remSrc,
    }
    const { data } = await saveSashEsti(payload)
    if (data.resultCd === 'save.ok' || data.resultCd === 'save.success' || data.resultCd === 'procedure complete') {
      ok.value = data.estiSeq || '저장됨'
      setTimeout(() => router.push(`/estimates/${itgEstiNo.value}`), 1000)
    } else {
      error.value = `저장 실패\nresultCd: ${data.resultCd}\nmessage: ${data.resultMessage || '(없음)'}\nresponse: ${JSON.stringify(data, null, 2)}`
    }
  } catch (e) {
    error.value = `예외 발생\n${e.message || ''}\n${JSON.stringify(e?.response?.data, null, 2)}`
  } finally {
    loading.value = false
  }
}
</script>
