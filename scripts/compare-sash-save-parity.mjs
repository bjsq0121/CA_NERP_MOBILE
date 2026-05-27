import { readFileSync } from 'node:fs'

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

const USAGE = 'Usage: node scripts/compare-sash-save-parity.mjs web.json mobile.json\n'

function normalize(value) {
  if (value == null) return ''
  return String(value)
}

function compareGroup(group, fields, web = {}, mobile = {}) {
  return fields
    .filter((field) => normalize(web[field]) !== normalize(mobile[field]))
    .map((field) => ({
      group,
      field,
      web: normalize(web[field]),
      mobile: normalize(mobile[field]),
    }))
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

if (process.argv[1] && process.argv[1].endsWith('compare-sash-save-parity.mjs')) {
  process.exit(runSashParityCli())
}
