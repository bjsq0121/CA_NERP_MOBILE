<template>
  <details class="card">
    <summary>생산옵션</summary>
    <div class="details-body">
      <section class="option-group">
        <div class="option-group-head">
          <div>
            <div class="option-group-title">BF 기본</div>
            <div class="option-group-subtitle">가공, 출고, 배수 관련</div>
          </div>
        </div>
        <div class="option-chip-grid">
          <OptionToggle v-model="form.drnHoleYn" label="배수홀" />
          <OptionToggle v-model="form.ventHoleYn" label="통기홀" :disabled="!form.ventHoleEnabled" />
          <OptionToggle v-model="form.bfWeldNoneYn" label="절단바로" />
          <OptionToggle v-model="form.bfWeld" label="ㄱㄴ용접" />
          <OptionToggle v-model="form.fillingPiecesYn" label="상하휠링피스" />
          <OptionToggle v-model="form.basedfillingPiecesYn" label="기존 휠링피스" />
          <OptionToggle v-model="form.bfRackShip" label="렉별도출고" />
          <OptionToggle v-model="form.bfStopper" label="스토퍼부착" />
          <OptionToggle v-model="form.bfDirectShip" label="직송" />
          <OptionToggle v-model="form.bfForesidePackYn" label="4면포장" />
          <OptionToggle v-model="form.bfKsmarkYn" label="KS마크" />
          <OptionToggle v-model="form.bfLxHiddenOptYn" label="LX히든" />
        </div>
        <div v-if="form.bfDirectShip" class="field mt-sm">
          <label>BF 직송주소 *</label>
          <input v-model.trim="form.bfShipAddr" placeholder="주소" />
        </div>

        <div class="option-select-grid">
          <div class="field">
            <label>보강재</label>
            <select v-model="form.bfArmatureType">
              <option value="">선택</option>
              <option value="B">기본</option>
              <option value="F">4면</option>
            </select>
          </div>
          <div class="field">
            <label>락 개수</label>
            <select v-model="form.bfLockCnt">
              <option value="">선택</option>
              <option value="1">1개</option>
              <option value="2">2개</option>
            </select>
          </div>
          <div class="field">
            <label>랩핑</label>
            <select v-model="form.bfWrapping">
              <option value="">선택</option>
              <option value="1">ㄱ자</option>
              <option value="2">ㄷ자</option>
            </select>
          </div>
          <div class="field">
            <label>3면포장</label>
            <select v-model="form.bfThrSidePack">
              <option value="">선택</option>
              <option value="1">백색</option>
              <option value="2">래핑</option>
            </select>
          </div>
        </div>

        <div class="option-panel">
          <div class="field">
            <label>밀링유형</label>
            <select v-model="form.bfMillingType" @change="onMillingTypeChange">
              <option value="0">밀링안함</option>
              <option value="1">반밀링</option>
              <option value="2">날개</option>
            </select>
          </div>
          <div v-if="form.bfMillingType !== '0'" class="field">
            <label>밀링유형상세 *</label>
            <select v-model="form.bfMillingDetail">
              <option value="">선택</option>
              <option value="1">전체</option>
              <option value="2">내부</option>
              <option value="3">외부</option>
              <option v-if="form.bfMillingType === '2'" value="4">부분</option>
            </select>
          </div>
          <div v-if="form.bfMillingType !== '0'" class="option-chip-grid compact">
            <OptionToggle v-model="form.bfMillingUp" label="밀링위치 상" />
            <OptionToggle v-model="form.bfMillingDown" label="밀링위치 하" />
            <OptionToggle v-model="form.bfMillingLeft" label="밀링위치 좌" />
            <OptionToggle v-model="form.bfMillingRight" label="밀링위치 우" />
          </div>
        </div>

        <div class="option-panel">
          <div class="option-group-title">BF 특수창</div>
          <div class="option-chip-grid compact">
            <OptionToggle v-model="form.bfFmGbYn" label="FM-X,GB-X" />
            <OptionToggle v-model="form.bfFmGbShipYn" label="FM/GB 별도출고" />
            <OptionToggle v-model="form.bfFmGbUpDownYn" label="FM/GB 상하작업" />
            <OptionToggle v-model="form.bfFmGbRlYn" label="FM/GB 좌우작업" />
            <OptionToggle v-model="form.bfFmGbCutYn" label="FM상하일자절단" />
            <OptionToggle v-model="form.bfSsOpt" label="SS일자절단" />
            <OptionToggle v-model="form.bfFixBuild" label="FIX외부시공" />
            <OptionToggle v-model="form.bfFdHd" label="풀다운핸들" />
          </div>
          <div class="field mt-sm">
            <label>방향</label>
            <select v-model="form.bfSideView">
              <option value="">선택</option>
              <option value="1">100면보이게</option>
              <option value="2">40면 보이게</option>
            </select>
          </div>
        </div>

        <div class="option-panel">
          <div class="option-group-title">BF 터닝도어 / 케이스먼트</div>
          <div class="option-select-grid">
            <div class="field">
              <label>터닝도어 당김</label>
              <select v-model="form.bfTurnDoorPullType">
                <option value="">선택</option>
                <option value="1">좌경첩</option>
                <option value="2">우경첩</option>
              </select>
            </div>
            <div class="field">
              <label>터닝도어 일면래핑</label>
              <select v-model="form.bfTurnDoorOneSideWrapType" @change="onBfTurnDoorOneSideWrapChange">
                <option value="">선택</option>
                <option value="1">당기는문</option>
                <option value="2">미는문</option>
              </select>
            </div>
            <div class="field">
              <label>일면래핑색상</label>
              <input
                v-model.trim="form.bfOneSideWrapColrNm"
                placeholder="색상"
                :disabled="!form.bfTurnDoorOneSideWrapType"
              />
            </div>
            <div class="field">
              <label>케이스먼트</label>
              <select v-model="form.bfAptCmType" @change="onBfAptCmTypeChange">
                <option value="">선택</option>
                <option value="1">1짝</option>
                <option value="2">2짝</option>
              </select>
            </div>
            <div v-if="form.bfAptCmType === '1'" class="field">
              <label>1짝방식</label>
              <select v-model="form.bfApt1pjMethod">
                <option value="">선택</option>
                <option value="1">밀때좌경</option>
                <option value="2">밀때우경</option>
              </select>
            </div>
            <div v-if="form.bfAptCmType === '2'" class="field">
              <label>2짝위치</label>
              <select v-model="form.bfApt2pjLoc">
                <option value="">선택</option>
                <option value="1">양측</option>
                <option value="2">좌측</option>
                <option value="3">우측</option>
              </select>
            </div>
            <div v-if="form.bfAptCmType === '2'" class="field">
              <label>2짝방식</label>
              <select v-model="form.bfApt2pjMethod">
                <option value="">선택</option>
                <option value="1">밀때좌경</option>
                <option value="2">밀때우경</option>
              </select>
            </div>
            <div class="field">
              <label>경첩타공위치</label>
              <input v-model.trim="form.bfVentHoleLctn" type="number" inputmode="numeric" placeholder="mm" />
            </div>
          </div>
          <div class="option-chip-grid compact">
            <OptionToggle v-model="form.bfTurnDoorOnlyMakeYn" label="문짝만 제작" />
            <OptionToggle v-model="form.bfVentPiecesIncludeYn" label="경첩+피스포함" />
          </div>
        </div>

        <div class="option-panel">
          <div class="option-group-title">BF 아파트</div>
          <div class="option-chip-grid compact">
            <OptionToggle v-model="form.bfWinOnefixUpHoleYn" label="1FIX 상부유리타공" />
            <OptionToggle v-model="form.bfWinFmThreeSideYn" label="FM,GB-X 3면" />
            <OptionToggle v-model="form.bfWinTopBottomFmYn" label="상하부만 FM작업" />
            <OptionToggle v-model="form.bfWinSpDdlnShpmYn" label="SP마감출고" />
            <OptionToggle v-model="form.bfIhyFixHghtDirYn" label="이형픽스 방향설정" />
          </div>
          <div class="field mt-sm">
            <label>통바밀링</label>
            <select v-model="form.bfWinCbMilingType">
              <option value="">선택</option>
              <option value="1">상부만밀링(FM,GB없음)</option>
              <option value="2">FM바없이 통바밀링</option>
            </select>
          </div>
        </div>
      </section>

      <section class="option-group">
        <div class="option-group-title">SF</div>
        <div class="option-chip-grid">
          <OptionToggle v-model="form.sfLandscape" label="SP 가로작업" />
          <OptionToggle v-model="form.sfOppositeTypeYn" label="반대타입" />
          <OptionToggle v-model="form.sfInsideRightBrdYn" label="내부우측매립" />
          <OptionToggle v-model="form.sfMcOneReqYn" label="MC1개요청" />
          <OptionToggle v-model="form.sfBrdProcYn" label="매립가공" />
          <OptionToggle v-model="form.sfHandleProcYn" label="핸들가공" />
          <OptionToggle v-model="form.sfRackShip" label="렉별도출고" />
          <OptionToggle v-model="form.sfDirectShip" label="직송" />
          <OptionToggle v-model="form.sfOutGlasYn" label="외주유리" />
        </div>
        <div v-if="form.sfDirectShip" class="field mt-sm">
          <label>SF 직송주소 *</label>
          <input v-model.trim="form.sfShipAddr" placeholder="주소" />
        </div>
        <div v-if="form.sfOutGlasYn" class="field mt-sm">
          <label>유리사양 *</label>
          <input v-model.trim="form.sfOutGlasInfo" placeholder="유리사양" />
        </div>
        <div class="option-select-grid">
          <div class="field">
            <label>SF 보강재</label>
            <select v-model="form.sfArmatureType">
              <option value="">선택</option>
              <option value="B">기본</option>
              <option value="F">4면</option>
            </select>
          </div>
          <div class="field">
            <label>윈드클로저</label>
            <div class="option-chip-grid compact">
              <OptionToggle :model-value="hasOption(form.winCloser, 1)" label="내창" @update:modelValue="toggleOption(form.winCloser, 1)" />
              <OptionToggle :model-value="hasOption(form.winCloser, 2)" label="외창" @update:modelValue="toggleOption(form.winCloser, 2)" />
              <OptionToggle :model-value="hasOption(form.winCloser, 3)" label="2층내창" @update:modelValue="toggleOption(form.winCloser, 3)" />
              <OptionToggle :model-value="hasOption(form.winCloser, 4)" label="2층외창" @update:modelValue="toggleOption(form.winCloser, 4)" />
            </div>
          </div>
          <div class="field">
            <label>SF 통기홀</label>
            <div class="option-chip-grid compact">
              <OptionToggle v-model="form.sfInsdVentHoleYn" label="내측 통기홀" />
              <OptionToggle v-model="form.sfOusdVentHoleYn" label="외측 통기홀" />
            </div>
          </div>
          <div class="field">
            <label>로라</label>
            <select v-model="form.sfRoller">
              <option value="">선택</option>
              <option value="1">쌍로라</option>
              <option value="2">조절로라</option>
            </select>
          </div>
          <div class="field">
            <label>크리센트</label>
            <select v-model="form.sfCreSize">
              <option value="">선택</option>
              <option value="1">소</option>
              <option value="3">대</option>
            </select>
          </div>
          <div class="field">
            <label>손타위치</label>
            <select v-model="form.sfSontaLoca">
              <option value="">선택</option>
              <option value="1">양면</option>
              <option value="2">외부면</option>
              <option value="3">2,3번 양면</option>
              <option value="4">2,3번 내부</option>
              <option value="5">좌측양면</option>
              <option value="6">우측양면</option>
              <option value="7">좌측</option>
              <option value="8">우측</option>
            </select>
          </div>
          <div class="field">
            <label>SF 아파트 보강재</label>
            <select v-model="form.sfAptArmatureType">
              <option value="">선택</option>
              <option value="F">4면보강</option>
            </select>
          </div>
          <div class="field">
            <label>SF 아파트 핸들</label>
            <select v-model="form.sfAptHandleType">
              <option value="">선택</option>
              <option value="1">고정핸들</option>
              <option value="2">그립핸들</option>
              <option value="3">반자동핸들</option>
              <option value="4">크리센트+고정</option>
              <option value="5">커플핸들(주벤트)</option>
              <option value="6">양방향핸들</option>
            </select>
          </div>
        </div>
        <div class="option-chip-grid compact">
          <OptionToggle v-model="form.sfCreHook" label="크리고리" />
          <OptionToggle :model-value="hasOption(form.deco1, 1)" label="장식X 1층내" @update:modelValue="toggleOption(form.deco1, 1)" />
          <OptionToggle :model-value="hasOption(form.deco1, 2)" label="장식X 1층외" @update:modelValue="toggleOption(form.deco1, 2)" />
          <OptionToggle :model-value="hasOption(form.deco1, 3)" label="장식X 2층내" @update:modelValue="toggleOption(form.deco1, 3)" />
          <OptionToggle :model-value="hasOption(form.deco1, 4)" label="장식X 2층외" @update:modelValue="toggleOption(form.deco1, 4)" />
        </div>
        <div class="option-panel">
          <div class="option-group-title">외짝</div>
          <div class="option-select-grid">
            <div class="field">
              <label>SF 외짝</label>
              <select v-model="form.sfOutType" @change="onSfOutTypeChange">
                <option value="">선택</option>
                <option value="4">1W</option>
                <option value="1">2W</option>
                <option value="2">3W</option>
                <option value="3">4W</option>
              </select>
            </div>
            <div class="field">
              <label>1W</label>
              <select v-model="form.sfOutType0">
                <option value="">선택</option>
                <option value="1">장식X</option>
                <option value="2">MC미부착</option>
              </select>
            </div>
            <div class="field">
              <label>2W</label>
              <select v-model="form.sfOutType1">
                <option value="">선택</option>
                <option value="1">크리창</option>
                <option value="2">고리창</option>
                <option value="3">크리창 반대타입</option>
                <option value="4">고리창 반대타입</option>
              </select>
            </div>
            <div class="field">
              <label>3W</label>
              <select v-model="form.sfOutType2">
                <option value="">선택</option>
                <option value="1">1번창</option>
                <option value="2">2번창</option>
                <option value="3">3번창</option>
              </select>
            </div>
            <div class="field">
              <label>4W</label>
              <select v-model="form.sfOutType3">
                <option value="">선택</option>
                <option value="1">1번창</option>
                <option value="2">2번창</option>
                <option value="3">3번창</option>
                <option value="4">4번창</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="option-group">
        <div class="option-group-title">MF</div>
        <div class="option-chip-grid">
          <OptionToggle v-model="form.mfRackShip" label="렉별도출고" />
          <OptionToggle v-model="form.mfCi4wStickYn" label="4W용 CI부착" />
          <OptionToggle v-model="form.mfDirectShip" label="직송" />
        </div>
        <div v-if="form.mfDirectShip" class="field mt-sm">
          <label>MF 직송주소 *</label>
          <input v-model.trim="form.mfShipAddr" placeholder="주소" />
        </div>
        <div class="option-select-grid">
          <div class="field">
            <label>MF 보강재</label>
            <select v-model="form.mfArmatureType">
              <option value="">선택</option>
              <option value="B">기본</option>
              <option value="F">4면</option>
            </select>
          </div>
          <div class="field">
            <label>망핸들</label>
            <select v-model="form.mfHandle" @change="onMfHandleChange">
              <option value="">선택</option>
              <option value="1">없음</option>
              <option value="2">매립</option>
            </select>
          </div>
          <div class="field">
            <label>망핸들높이</label>
            <input v-model.number="form.mfHandleHsize" type="number" placeholder="mm" :disabled="form.mfHandle !== '2'" />
          </div>
          <div class="field">
            <label>MF 아파트 보강재</label>
            <select v-model="form.mfAptArmatureType">
              <option value="">선택</option>
              <option value="F">4면보강</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  </details>
</template>

<script setup>
import OptionToggle from './common/OptionToggle.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

function onMillingTypeChange() {
  props.form.bfMillingDetail = ''
  props.form.bfMillingUp = false
  props.form.bfMillingDown = false
  props.form.bfMillingLeft = false
  props.form.bfMillingRight = false
}

function hasOption(values, option) {
  return (values || []).map(String).includes(String(option))
}

function toggleOption(values, option) {
  const idx = (values || []).map(String).indexOf(String(option))
  if (idx >= 0) values.splice(idx, 1)
  else values.push(option)
}

function onBfTurnDoorOneSideWrapChange() {
  if (!props.form.bfTurnDoorOneSideWrapType) props.form.bfOneSideWrapColrNm = ''
}

function onBfAptCmTypeChange() {
  props.form.bfApt1pjMethod = ''
  props.form.bfApt2pjLoc = ''
  props.form.bfApt2pjMethod = ''
}

function onMfHandleChange() {
  if (props.form.mfHandle !== '2') props.form.mfHandleHsize = ''
}

function onSfOutTypeChange() {
  if (props.form.sfOutType) return
  props.form.sfOutType0 = ''
  props.form.sfOutType1 = ''
  props.form.sfOutType2 = ''
  props.form.sfOutType3 = ''
}
</script>

<style scoped>
.option-group + .option-group {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);
}

.option-group-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.option-group-title {
  margin-bottom: 2px;
  color: var(--c-text);
  font-size: 13px;
  font-weight: 700;
}

.option-group-subtitle {
  color: var(--c-text-muted);
  font-size: 11px;
}

.option-chip-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.option-chip-grid.compact {
  margin-top: 2px;
}

.option-select-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.option-panel {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--c-border-light);
  border-radius: 8px;
  background: #f8fafc;
}

@media (min-width: 768px) {
  .option-chip-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .option-select-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .option-chip-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
