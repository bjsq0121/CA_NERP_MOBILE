const STORAGE_KEY = 'mobile_selected_bzpc'

export function normalizeSelectedBzpc(value) {
  if (!value?.bzpc) return null
  return {
    bzpc: String(value.bzpc),
    bzpcNm: value.bzpcNm || '',
  }
}

export function loadSelectedBzpc(storage = sessionStorage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeSelectedBzpc(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveSelectedBzpc(value, storage = sessionStorage) {
  const normalized = normalizeSelectedBzpc(value)
  if (!normalized) return
  storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
}

export { STORAGE_KEY as SELECTED_BZPC_STORAGE_KEY }
