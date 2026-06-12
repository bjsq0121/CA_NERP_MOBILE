import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const bzpcApiSource = readFileSync(resolve(currentDir, '../api/bzpc.js'), 'utf8')
const clientApiSource = readFileSync(resolve(currentDir, '../api/client.js'), 'utf8')
const clientGradeOptionsSource = readFileSync(resolve(currentDir, '../utils/clientGradeOptions.js'), 'utf8')
const routerSource = readFileSync(resolve(currentDir, '../router/index.js'), 'utf8')
const listSource = readFileSync(resolve(currentDir, 'ClientList.vue'), 'utf8')
const newSource = readFileSync(resolve(currentDir, 'ClientNew.vue'), 'utf8')
const estimateNewSource = readFileSync(resolve(currentDir, 'EstimateNew.vue'), 'utf8')
const estimateDetailSource = readFileSync(resolve(currentDir, 'EstimateDetail.vue'), 'utf8')
const editSourcePath = resolve(currentDir, 'ClientEdit.vue')
const editSource = readFileSync(editSourcePath, 'utf8')
const modalSource = readFileSync(resolve(currentDir, '../components/DplcSearchModal.vue'), 'utf8')
const bzpcSelectorSource = readFileSync(resolve(currentDir, '../components/BzpcSelector.vue'), 'utf8')

test('client api exposes duplicate count endpoint', () => {
  assert.match(clientApiSource, /export function checkClientDuplicate\(payload\)/)
  assert.match(clientApiSource, /\/mobile\/dplc\/duplicate-count/)
})

test('client api exposes grade option endpoint', () => {
  assert.match(clientApiSource, /export function searchClientGradeOptions\(payload\s*=\s*\{\}\)/)
  assert.match(clientApiSource, /\/mobile\/dplc\/grade-options/)
})

test('BzpcSelector emits vkbur vkgrp while preserving bzpc fields', () => {
  assert.match(bzpcSelectorSource, /function normalizeBzpcSelection\(row/)
  assert.match(bzpcSelectorSource, /bzpc:\s*row\.bzpc/)
  assert.match(bzpcSelectorSource, /bzpcNm:\s*row\.bzpcNm/)
  assert.match(bzpcSelectorSource, /vkbur:\s*row\.vkbur/)
  assert.match(bzpcSelectorSource, /vkburNm:\s*row\.vkburNm/)
  assert.match(bzpcSelectorSource, /vkgrp:\s*row\.vkgrp/)
  assert.match(bzpcSelectorSource, /vkgrpNm:\s*row\.vkgrpNm/)
  assert.match(bzpcSelectorSource, /auth\.vkbur/)
  assert.match(bzpcSelectorSource, /auth\.vkgrp/)
})

test('BzpcSelector does not restrict admin branch choices by login sales org', () => {
  assert.match(bzpcSelectorSource, /searchVkbur:\s*auth\.isAdmin \? '' : auth\.vkbur/)
  assert.match(bzpcSelectorSource, /searchVkgrp:\s*auth\.vkgrp/)
  assert.match(bzpcSelectorSource, /inTest:\s*auth\.isAdmin \? 'Y' : 'N'/)
  assert.match(bzpcApiSource, /addInfoBzpc:\s*37/)
})

test('client search screens keep sales active filters and separate search fields', () => {
  for (const source of [listSource, modalSource]) {
    assert.match(source, /searchDplcScn:\s*'02'/)
    assert.match(source, /searchBztcSt:\s*'01'/)
    assert.match(source, /searchDplcNm/)
    assert.match(source, /searchDplcCd/)
    assert.match(source, /searchBzno/)
    assert.match(source, /searchDplcRepNm/)
  }
  assert.doesNotMatch(listSource, /거래처명 또는 코드/)
  assert.doesNotMatch(modalSource, /거래처명 또는 코드/)
})

test('ClientList opens customer edit route from selected row without changing search payload', () => {
  assert.match(routerSource, /\/clients\/:dplcCd\/edit/)
  assert.match(routerSource, /ClientEdit\.vue/)
  assert.match(listSource, /useRouter/)
  assert.match(listSource, /@click="goEdit\(row\)"/)
  assert.match(listSource, /path:\s*`\/clients\/\$\{row\.dplcCd\}\/edit`/)
  assert.match(listSource, /query:\s*\{\s*bzpc:/)
})

test('ClientNew validates simple customer registration and sends web-compatible defaults', () => {
  assert.match(newSource, /import \{ saveClient, checkClientDuplicate \} from '\.\.\/api\/client'/)
  assert.match(newSource, /bsnsScn:\s*'01'/)
  assert.match(newSource, /dplcScn:\s*'02'/)
  assert.match(newSource, /validateForm\(\)/)
  assert.match(newSource, /대표자명을 입력하세요/)
  assert.match(newSource, /사업자번호를 입력하세요/)
  assert.match(newSource, /대표자휴대폰번호를 입력하세요/)
  assert.match(newSource, /buildClientPayload\(\)/)
  const defaultFields = [
    'dplcType', 'bztcSt', 'useYn', 'badBondYn', 'monCreLim', 'dplcCorpStatCd', 'facDvCostType',
    'dcGrd', 'dcGrdDoor', 'dcGrdPannel', 'dcGrdOtherComp', 'dcGrdGlas', 'dcGrdMold',
    'dcGrdDtbtMtrl', 'dcGrdDtbtGoods', 'dcGrdDoorCr', 'dcGrdMoldCr',
    'dcGrdDtbtMtrlCr', 'dcGrdDtbtGoodsCr',
  ]
  for (const field of defaultFields) assert.match(newSource, new RegExp(`${field}:`))
  assert.match(newSource, /checkClientDuplicate\(duplicatePayload\)/)
  assert.match(newSource, /duplicateData\?\.errCd/)
  assert.match(newSource, /Count/)
  assert.match(newSource, /중복거래처/)
  assert.match(newSource, /vkbur/)
  assert.match(newSource, /vkgrp/)
})

test('ClientEdit loads customer detail and saves editable grade payload', () => {
  assert.match(editSource, /import \{ searchClientList, saveClient, searchClientGradeOptions \} from '\.\.\/api\/client'/)
  assert.match(editSource, /buildClientGradeOptionGroups/)
  assert.match(editSource, /buildGradePayload/)
  assert.match(editSource, /searchDplcCd:\s*dplcCd/)
  assert.match(editSource, /searchBzpc:\s*searchBzpc/)
  assert.match(editSource, /saveClient\(payload\)/)
  assert.match(editSource, /bzpc:\s*form\.value\.bzpc/)
  assert.match(editSource, /dplcCd:\s*form\.value\.dplcCd/)
  const gradeFields = [
    'dcGrd', 'dcGrdDoor', 'dcGrdPannel', 'dcGrdOtherComp', 'dcGrdGlas', 'dcGrdMold',
    'dcGrdDtbtMtrl', 'dcGrdDtbtGoods', 'dcGrdDoorCr', 'dcGrdMoldCr',
    'dcGrdDtbtMtrlCr', 'dcGrdDtbtGoodsCr',
  ]
  for (const field of gradeFields) assert.match(editSource, new RegExp(field))
  assert.match(editSource, /영업조직은 거래처 수정 화면에서 변경할 수 없습니다/)
})

test('client grade option values are saved grade codes, not addInfo rates', () => {
  assert.match(clientGradeOptionsSource, /value:\s*stringValue\(row\?\.commCdVal\)/)
  assert.match(clientGradeOptionsSource, /rate:\s*stringValue\(row\?\.\[valueKey\]\)/)
  assert.doesNotMatch(clientGradeOptionsSource, /value:\s*stringValue\(row\?\.\[valueKey\]\)/)
  assert.match(clientGradeOptionsSource, /buildGradePayload\(form\s*=\s*\{\}\)/)
  assert.match(clientGradeOptionsSource, /payload\[field\]\s*=\s*stringValue\(form\[field\]\)/)
  assert.doesNotMatch(clientGradeOptionsSource, /payload\.addInfo/)
  assert.match(clientGradeOptionsSource, /row\.rn/)
  assert.match(clientGradeOptionsSource, /row\.addInfo17/)
})

test('EstimateNew keeps customer grade mapping from selected customer row', () => {
  assert.match(estimateNewSource, /function firstValue\(row\s*=\s*\{\},\s*\.\.\.keys\)/)
  assert.match(estimateNewSource, /dplcDcGrd:\s*stringValue\(firstValue\(row,\s*'dcGrd',\s*'dplcDcGrd'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdDoor:\s*stringValue\(firstValue\(row,\s*'dcGrdDoor',\s*'dplcDcGrdDoor'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdPannel:\s*stringValue\(firstValue\(row,\s*'dcGrdPannel',\s*'dplcDcGrdPannel'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdOtherComp:\s*stringValue\(firstValue\(row,\s*'dcGrdOtherComp',\s*'dplcDcGrdOtherComp',\s*'dcGrdEtc'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdGlas:\s*stringValue\(firstValue\(row,\s*'dcGrdGlas',\s*'dplcDcGrdGlas'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdMold:\s*stringValue\(firstValue\(row,\s*'dcGrdMold',\s*'dplcDcGrdMold',\s*'dcGrdMlng'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtMtrl:\s*stringValue\(firstValue\(row,\s*'dcGrdDtbtMtrl',\s*'dplcDcGrdDtbtMtrl',\s*'dplcMstDcGrdDtbtMtrl',\s*'dcGrdMtrl'\)\)/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtGoods:\s*stringValue\(firstValue\(row,\s*'dcGrdDtbtGoods',\s*'dplcDcGrdDtbtGoods',\s*'dplcMstDcGrdDtbtGoods',\s*'dcGrdProd'\)\)/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdEtc:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdMlng:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdMtrl:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdProd:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdDoorCr|dplcDcGrdMoldCr|dplcDcGrdDtbtMtrlCr|dplcDcGrdDtbtGoodsCr/)
})

test('EstimateNew sends flat ItgEstiH grade fields with the header payload', () => {
  assert.match(estimateNewSource, /buildEstimateGradePayload\(form\.value\.dplcGrpGrade\)/)
  assert.match(estimateNewSource, /buildEstimateRatePayload\(form\.value\.dplcGrpGrade,\s*form\.value\.dplcRate\)/)
  assert.match(estimateNewSource, /selectedGradeRate\(item,\s*grades\[item\.field\],\s*fallbackRates\)/)
  assert.match(estimateNewSource, /dplcRate:\s*ratePayload/)
  for (const field of [
    'dplcDcGrd',
    'dplcDcGrdDoor',
    'dplcDcGrdPannel',
    'dplcDcGrdOtherComp',
    'dplcDcGrdGlas',
    'dplcDcGrdMold',
    'dplcDcGrdDtbtMtrl',
    'dplcDcGrdDtbtGoods',
  ]) {
    assert.match(estimateNewSource, new RegExp(`${field}:\\s*stringValue\\(grades\\.${field}\\)`))
  }
  for (const field of [
    'dplcRt',
    'dplcDoorRt',
    'dplcPannelRt',
    'dplcOtherCompRt',
    'dplcGlasRt',
    'dplcMoldRt',
    'dplcDtbtMtrlRt',
    'dplcDtbtGoodsRt',
  ]) {
    assert.match(estimateNewSource, new RegExp(field))
  }
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdDoorCr|dplcDcGrdMoldCr|dplcDcGrdDtbtMtrlCr|dplcDcGrdDtbtGoodsCr/)
  assert.doesNotMatch(estimateNewSource, /dplcDoorCrRt|dplcMoldCrRt|dplcDtbtMtrlCrRt|dplcDtbtGoodsCrRt/)
})

test('EstimateDetail shows saved customer grade fields in the header card', () => {
  assert.match(estimateDetailSource, /headerGradeItems/)
  assert.match(estimateDetailSource, /class="[^"]*estimate-grade-summary/)
  assert.match(estimateDetailSource, /formatGradeValue/)
  for (const field of [
    'dplcDcGrd',
    'dplcDcGrdDoor',
    'dplcDcGrdPannel',
    'dplcDcGrdOtherComp',
    'dplcDcGrdGlas',
    'dplcDcGrdMold',
    'dplcDcGrdDtbtMtrl',
    'dplcDcGrdDtbtGoods',
  ]) {
    assert.match(estimateDetailSource, new RegExp(field))
  }
})

test('ClientList renders customers as estimate-style cards with registration CTA empty state', () => {
  assert.match(listSource, /class="page-title-row"/)
  assert.match(listSource, /class="client-card-list"/)
  assert.match(listSource, /class="client-card"/)
  assert.match(listSource, /class="client-card-title"/)
  assert.match(listSource, /class="client-card-meta"/)
  assert.match(listSource, /class="empty empty-action"/)
  assert.match(listSource, /거래처 등록/)
  assert.match(listSource, /@click="goNew"/)
  assert.match(listSource, /@click="goEdit\(row\)"/)
})
