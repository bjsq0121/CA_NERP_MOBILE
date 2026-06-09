import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildClientGradeOptionGroups,
  buildDefaultClientGrades,
  buildGradePayload,
  normalizeGradeOptions,
} from './clientGradeOptions.js'

const normalRows = [
  { commCdVal: 'B', addInfo1: 'B', addInfo5: 'DB', addInfo12: 'MB', addInfo13: 'GB', addInfo14: 'MTB', addInfo15: 'PDB', addInfo17: '20' },
  { commCdVal: 'S', commCdNm: 'S등급', addInfo1: 'S', addInfo5: 'DS', addInfo12: 'MS', addInfo13: 'GS', addInfo14: 'MTS', addInfo15: 'PDS', addInfo17: '5' },
  { commCdVal: 'A', addInfo1: 'A', addInfo5: 'DA', addInfo12: 'MA', addInfo13: 'GA', addInfo14: 'MTA', addInfo15: 'PDA', addInfo17: '10' },
]

const crossRows = [
  { commCdVal: 'T', addInfo6: 'DT', addInfo12: 'MT', addInfo14: 'MAT', addInfo15: 'PDT', addInfo17: '2' },
  { commCdVal: 'S', addInfo6: 'DS', addInfo12: 'MS', addInfo14: 'MAS', addInfo15: 'PDS', addInfo17: '1' },
]

test('client grade options use commCdVal as saved value and keep addInfo only as rate metadata', () => {
  const groups = buildClientGradeOptionGroups({ resultList: normalRows, resultListCross: crossRows })

  assert.deepEqual(groups.normal.sash.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.panel.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.tasa.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.door.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.glass.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.molding.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.material.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.normal.product.map((o) => o.value), ['A', 'B'])
  assert.deepEqual(groups.cross.crossDoor.map((o) => o.value), ['S', 'T'])
  assert.deepEqual(groups.cross.crossMolding.map((o) => o.value), ['S', 'T'])
  assert.deepEqual(groups.cross.crossMaterial.map((o) => o.value), ['S', 'T'])
  assert.deepEqual(groups.cross.crossProduct.map((o) => o.value), ['S', 'T'])
  assert.equal(groups.normal.door[0].label, 'A')
  assert.equal(groups.normal.door[0].rate, 'DA')
  assert.equal(groups.normal.glass[0].rate, 'GA')
  assert.equal(groups.cross.crossDoor[0].rate, 'DS')
  assert.notEqual(groups.normal.door[0].value, groups.normal.door[0].rate)
})

test('client normal grade options exclude S grade from estimate header selects', () => {
  const groups = buildClientGradeOptionGroups({ resultList: normalRows, resultListCross: crossRows })

  for (const options of Object.values(groups.normal)) {
    assert.equal(options.some((option) => option.value === 'S'), false)
    assert.equal(options.some((option) => option.label === 'S등급'), false)
  }
})

test('client grade payload includes all normal and cross grade fields', () => {
  const form = {
    dcGrd: 'A',
    dcGrdDoor: 'B',
    dcGrdPannel: 'C',
    dcGrdOtherComp: 'D',
    dcGrdGlas: 'E',
    dcGrdMold: 'F',
    dcGrdDtbtMtrl: 'G',
    dcGrdDtbtGoods: 'H',
    dcGrdDoorCr: 'T',
    dcGrdMoldCr: 'U',
    dcGrdDtbtMtrlCr: 'V',
    dcGrdDtbtGoodsCr: 'W',
  }

  assert.deepEqual(buildGradePayload(form), form)
})

test('client grade defaults match mobile quick registration defaults', () => {
  assert.deepEqual(buildDefaultClientGrades(), {
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
  })
})

test('normalizeGradeOptions sorts by rn then addInfo17 and never uses addInfo as option value', () => {
  assert.deepEqual(normalizeGradeOptions([
    { commCdVal: 'B', addInfo1: 'RATE_B', addInfo17: '2', rn: '2' },
    { commCdVal: 'S', commCdNm: 'S등급', addInfo1: 'RATE_S', addInfo17: '1', rn: '0' },
    { commCdVal: 'A', commCdNm: 'A 등급', addInfo1: 'RATE_A', addInfo17: '9', rn: '1' },
  ], 'addInfo1'), [
    { value: 'A', label: 'A 등급', rate: 'RATE_A' },
    { value: 'B', label: 'B', rate: 'RATE_B' },
  ])
})

test('buildGradePayload returns grade code strings only', () => {
  const payload = buildGradePayload({
    dcGrd: 'G',
    dcGrdDoor: 'A',
    dcGrdPannel: 'B',
    dcGrdOtherComp: 'Z',
    dcGrdGlas: 'S',
    dcGrdMold: 'G',
    dcGrdDtbtMtrl: 'G',
    dcGrdDtbtGoods: 'G',
    dcGrdDoorCr: 'T',
    dcGrdMoldCr: 'T',
    dcGrdDtbtMtrlCr: 'T',
    dcGrdDtbtGoodsCr: 'T',
    addInfo1: '10',
    addInfo5: '20',
  })

  assert.equal(payload.dcGrd, 'G')
  assert.equal(payload.dcGrdDoor, 'A')
  assert.equal(payload.dcGrdGlas, 'S')
  assert.equal(payload.addInfo1, undefined)
  assert.equal(payload.addInfo5, undefined)
})
