import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
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
  assert.match(estimateNewSource, /dplcDcGrd:\s*row\.dcGrd/)
  assert.match(estimateNewSource, /dplcDcGrdDoor:\s*row\.dcGrdDoor/)
  assert.match(estimateNewSource, /dplcDcGrdPannel:\s*row\.dcGrdPannel/)
  assert.match(estimateNewSource, /dplcDcGrdOtherComp:\s*row\.dcGrdOtherComp/)
  assert.match(estimateNewSource, /dplcDcGrdGlas:\s*row\.dcGrdGlas/)
  assert.match(estimateNewSource, /dplcDcGrdMold:\s*row\.dcGrdMold/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtMtrl:\s*row\.dcGrdDtbtMtrl/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtGoods:\s*row\.dcGrdDtbtGoods/)
  assert.match(estimateNewSource, /dplcDcGrdDoorCr:\s*row\.dcGrdDoorCr/)
  assert.match(estimateNewSource, /dplcDcGrdMoldCr:\s*row\.dcGrdMoldCr/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtMtrlCr:\s*row\.dcGrdDtbtMtrlCr/)
  assert.match(estimateNewSource, /dplcDcGrdDtbtGoodsCr:\s*row\.dcGrdDtbtGoodsCr/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdEtc:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdMlng:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdMtrl:/)
  assert.doesNotMatch(estimateNewSource, /dplcDcGrdProd:/)
})

test('EstimateNew sends flat ItgEstiH grade fields with the header payload', () => {
  assert.match(estimateNewSource, /buildEstimateGradePayload\(form\.value\.dplcGrpGrade\)/)
  assert.match(estimateNewSource, /buildEstimateRatePayload\(form\.value\.dplcRate\)/)
  for (const field of [
    'dplcDcGrd',
    'dplcDcGrdDoor',
    'dplcDcGrdPannel',
    'dplcDcGrdOtherComp',
    'dplcDcGrdGlas',
    'dplcDcGrdMold',
    'dplcDcGrdDtbtMtrl',
    'dplcDcGrdDtbtGoods',
    'dplcDcGrdDoorCr',
    'dplcDcGrdMoldCr',
    'dplcDcGrdDtbtMtrlCr',
    'dplcDcGrdDtbtGoodsCr',
  ]) {
    assert.match(estimateNewSource, new RegExp(`${field}:\\s*stringValue\\(grades\\.${field}\\)`))
  }
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
