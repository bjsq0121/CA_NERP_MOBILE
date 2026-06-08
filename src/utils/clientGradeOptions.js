export const NORMAL_GRADE_FIELDS = [
  'dcGrd',
  'dcGrdDoor',
  'dcGrdPannel',
  'dcGrdOtherComp',
  'dcGrdGlas',
  'dcGrdMold',
  'dcGrdDtbtMtrl',
  'dcGrdDtbtGoods',
]

export const CROSS_GRADE_FIELDS = [
  'dcGrdDoorCr',
  'dcGrdMoldCr',
  'dcGrdDtbtMtrlCr',
  'dcGrdDtbtGoodsCr',
]

const NORMAL_MAP = {
  sash: 'addInfo1',
  door: 'addInfo5',
  panel: 'addInfo1',
  tasa: 'addInfo1',
  glass: 'addInfo13',
  molding: 'addInfo12',
  material: 'addInfo14',
  product: 'addInfo15',
}

const CROSS_MAP = {
  crossDoor: 'addInfo6',
  crossMolding: 'addInfo12',
  crossMaterial: 'addInfo14',
  crossProduct: 'addInfo15',
}

export function normalizeGradeOptions(rows = [], valueKey = 'addInfo1') {
  return [...rows]
    .sort((a, b) => sortValue(a) - sortValue(b))
    .map((row) => ({
      value: stringValue(row?.commCdVal),
      label: stringValue(row?.commCdNm) || stringValue(row?.commCdVal),
      rate: stringValue(row?.[valueKey]),
    }))
    .filter((option) => option.value)
}

export function buildClientGradeOptionGroups(data = {}) {
  const normalRows = data.resultList || []
  const crossRows = data.resultListCross || []
  const normal = {}
  const cross = {}

  for (const [key, valueKey] of Object.entries(NORMAL_MAP)) {
    normal[key] = normalizeGradeOptions(normalRows, valueKey)
  }
  for (const [key, valueKey] of Object.entries(CROSS_MAP)) {
    cross[key] = normalizeGradeOptions(crossRows, valueKey)
  }

  return { normal, cross }
}

export function buildDefaultClientGrades() {
  return {
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
}

export function buildGradePayload(form = {}) {
  const payload = {}
  for (const field of [...NORMAL_GRADE_FIELDS, ...CROSS_GRADE_FIELDS]) {
    payload[field] = stringValue(form[field])
  }
  return payload
}

function numberValue(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function sortValue(row = {}) {
  const rn = numberValue(row.rn)
  if (rn) return rn
  return numberValue(row.addInfo17)
}

function stringValue(value) {
  return String(value ?? '').trim()
}
