const PRESERVED_FIELDS = [
  'w1', 'w2', 'w3', 'w4', 'w5',
  'h1', 'h2', 'h3', 'h4', 'h5',
  'cs', 'cs1', 'cs2', 'cs3', 'cs4', 'cs5',
  'mtrlCds1', 'mtrlCds2', 'mtrlCds3', 'mtrlCds4',
  'ventLoc', 'screenType',
  'insdSf', 'ousdSf',
  'insdColrCd', 'ousdColrCd',
  'bsmfOrdUtmCd', 'sashOrdTypCd',
]

export function captureSashEditValues(form = {}) {
  return PRESERVED_FIELDS.reduce((snapshot, field) => {
    if (Object.prototype.hasOwnProperty.call(form, field)) {
      snapshot[field] = form[field]
    }
    return snapshot
  }, {})
}

export function restoreSashEditValues(form = {}, snapshot = {}) {
  for (const field of PRESERVED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(snapshot, field)) {
      form[field] = snapshot[field]
    }
  }
  return form
}
