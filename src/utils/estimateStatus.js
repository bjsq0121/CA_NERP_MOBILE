export const UNKNOWN_STATUS = '__UNKNOWN__'

export function normalizeStatusCd(value) {
  const status = value == null ? '' : String(value).trim()
  return status || UNKNOWN_STATUS
}

export function normalizeOptionalStatusCd(value) {
  const status = value == null ? '' : String(value).trim()
  return status
}

export function resolveEffectiveStatus(...values) {
  for (const value of values) {
    const status = normalizeOptionalStatusCd(value)
    if (status) return status
  }
  return UNKNOWN_STATUS
}

export function isEditableStatus(value) {
  return normalizeStatusCd(value) === '10'
}

export function isEditableHeaderStatus(value) {
  const status = normalizeStatusCd(value)
  return status === '10' || status === '0' || status === '20'
}

export function isReadonlyStatus(value) {
  const status = normalizeStatusCd(value)
  return /^\d+$/.test(status) && Number(status) >= 50
}
