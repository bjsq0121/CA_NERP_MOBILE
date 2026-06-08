const compact = (value) => String(value || '').replace(/\s+/g, '').toLowerCase()

export function normalizeSafetyNetHandleValue(value) {
  const normalized = String(value || '')
  if (normalized === '1' || normalized === '4') return '4'
  if (normalized === '2') return '2'
  return ''
}

export function normalizeSafetyNetHandleOptions(list = []) {
  const byValue = new Map()
  for (const option of list) {
    const rawValue = String(option?.commCdVal || option?.commCdId || '')
    const value = normalizeSafetyNetHandleValue(rawValue)
    if (!value) continue
    if (byValue.has(value) && rawValue !== '4') continue
    byValue.set(value, {
      ...option,
      commCdId: value,
      commCdVal: value,
      commCdNm: rawValue === '1' ? '없음' : (option?.commCdNm || (value === '2' ? '일반' : '없음')),
    })
  }
  return ['2', '4'].map((value) => byValue.get(value)).filter(Boolean)
}

export function resolveBsmfOrdUtmCd(row, bsmfList) {
  const direct = row?.bsmfOrdUtmCd || row?.bsmfOrdUtm || row?.bsmfOrdUtmVal
  if (direct && bsmfList.some((item) => item.commCdId === direct)) return direct

  const rowName = compact(row?.bsmfNm || row?.bsmfOrdUtmNm)
  if (!rowName) return ''

  const found = bsmfList.find((item) => compact(item.commCdNm) === rowName)
  return found?.commCdId || ''
}
