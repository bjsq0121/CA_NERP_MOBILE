import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DETAIL_FIELDS = [
  'mdlCd', 'wintydiCd', 'bsmfOrdUtmCd',
  'wSize', 'hSize', 'w1Size', 'w2Size', 'w3Size', 'w4Size', 'w5Size',
  'h1Size', 'h2Size', 'h3Size', 'h4Size', 'h5Size',
  'csSize', 'cs1Size', 'cs2Size', 'cs3Size', 'cs4Size', 'cs5Size',
  'insdColrCd', 'ousdColrCd',
  'insdSf', 'ousdSf',
  'mtrlCds1', 'mtrlCds2', 'mtrlCds3', 'mtrlCds4',
  'ventLoc', 'screenType',
  'aluMfYn', 'aluMfHandleType', 'aluMfMdlYn', 'aluMfHndlH',
  'insdHandleType', 'ousdHandleType',
  'drnHoleYn', 'ventHoleYn', 'bfMillingType', 'bfMillingDetail',
  'bfDirectShip', 'sfDirectShip', 'mfDirectShip',
  'sfOutGlasYn', 'sfOutGlasInfo', 'mfHandle', 'mfHandleHsize',
]

const AMOUNT_FIELDS = [
  'estiSalesUnpRt',
  'estiSaleCst',
  'estiSaleUnp',
  'estiTotSaleUnp',
  'estiTotSaleVat',
  'estiTotSaleVatUnp',
]

const FIELD_ALIASES = {
  wSize: ['wSize', 'WSize', 'w0Size', 'W0Size'],
  hSize: ['hSize', 'HSize', 'h0Size', 'H0Size'],
  csSize: ['csSize', 'CSSize'],
}

for (let index = 1; index <= 5; index += 1) {
  FIELD_ALIASES[`w${index}Size`] = [`w${index}Size`, `W${index}Size`]
  FIELD_ALIASES[`h${index}Size`] = [`h${index}Size`, `H${index}Size`]
  FIELD_ALIASES[`cs${index}Size`] = [`cs${index}Size`, `CS${index}Size`]
}

const USAGE = 'Usage: node scripts/compare-sash-save-parity.mjs web.json mobile.json\n'

function normalize(value) {
  if (value == null) return ''
  return String(value)
}

function valuesForField(row = {}, field) {
  const aliases = FIELD_ALIASES[field] ?? [field]
  return aliases
    .filter((alias) => Object.prototype.hasOwnProperty.call(row, alias))
    .map((alias) => normalize(row[alias]))
}

function fieldValuesMatch(webValues, mobileValues) {
  if (webValues.length === 0 && mobileValues.length === 0) return true
  if (webValues.length === 0 || mobileValues.length === 0) return false
  return webValues.some((value) => mobileValues.includes(value))
}

function compareGroup(group, fields, web = {}, mobile = {}) {
  const mismatches = []

  for (const field of fields) {
    const webValues = valuesForField(web, field)
    const mobileValues = valuesForField(mobile, field)

    if (!fieldValuesMatch(webValues, mobileValues)) {
      mismatches.push({
        group,
        field,
        web: webValues[0] ?? '',
        mobile: mobileValues[0] ?? '',
      })
    }
  }

  return mismatches
}

export function compareSashParity({ web, mobile }) {
  const mismatches = [
    ...compareGroup('detail', DETAIL_FIELDS, web?.detail, mobile?.detail),
    ...compareGroup('amount', AMOUNT_FIELDS, web?.amount, mobile?.amount),
  ]
  return { ok: mismatches.length === 0, mismatches }
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function isDirectRun() {
  return process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
}

export function runSashParityCli(
  argv = process.argv,
  {
    stderr = process.stderr,
    log = (message) => console.log(message),
    table = (rows) => console.table(rows),
    load = loadJson,
  } = {},
) {
  const [, , webPath, mobilePath] = argv
  if (!webPath || !mobilePath) {
    stderr.write(USAGE)
    return 2
  }

  const result = compareSashParity({
    web: load(webPath),
    mobile: load(mobilePath),
  })

  if (result.ok) {
    log('Sash parity OK')
    return 0
  }

  table(result.mismatches)
  return 1
}

if (isDirectRun()) {
  process.exit(runSashParityCli())
}
