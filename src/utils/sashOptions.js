const compact = (value) => String(value || '').replace(/\s+/g, '').toLowerCase()

export function resolveBsmfOrdUtmCd(row, bsmfList) {
  const direct = row?.bsmfOrdUtmCd || row?.bsmfOrdUtm || row?.bsmfOrdUtmVal
  if (direct && bsmfList.some((item) => item.commCdId === direct)) return direct

  const rowName = compact(row?.bsmfNm || row?.bsmfOrdUtmNm)
  if (!rowName) return ''

  const found = bsmfList.find((item) => compact(item.commCdNm) === rowName)
  return found?.commCdId || ''
}
