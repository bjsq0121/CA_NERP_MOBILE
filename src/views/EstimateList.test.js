import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'EstimateList.vue'), 'utf8')
const newSource = readFileSync(resolve(currentDir, 'EstimateNew.vue'), 'utf8')
const stylesSource = readFileSync(resolve(currentDir, '../styles.css'), 'utf8')

test('EstimateList restores the selected branch for admins and keeps non-admin default branch', () => {
  assert.match(source, /import \{ loadSelectedBzpc, saveSelectedBzpc \} from '\.\.\/utils\/selectedBzpcStorage'/)
  assert.match(source, /if \(!auth\.isAdmin && auth\.bzpc\) \{[\s\S]*selectedBzpc\.value = \{ bzpc: auth\.bzpc, bzpcNm: auth\.bzpcNm \}[\s\S]*search\(\)[\s\S]*return[\s\S]*\}/)
  assert.match(source, /const saved = loadSelectedBzpc\(\)/)
  assert.match(source, /if \(saved\?\.bzpc\) \{[\s\S]*selectedBzpc\.value = saved[\s\S]*search\(\)[\s\S]*\}/)
  assert.match(source, /saveSelectedBzpc\(v\)/)
  assert.doesNotMatch(source, /sessionStorage\.setItem\('mobile_selected_bzpc'/)
})

test('EstimateNew locks the branch from shared selected branch storage', () => {
  assert.match(newSource, /import \{ loadSelectedBzpc \} from '\.\.\/utils\/selectedBzpcStorage'/)
  assert.match(newSource, /const saved = loadSelectedBzpc\(\)/)
  assert.match(newSource, /if \(saved\?\.bzpc\) \{[\s\S]*selectedBzpc\.value = saved[\s\S]*bzpcLocked\.value = true[\s\S]*\}/)
  assert.doesNotMatch(newSource, /sessionStorage\.getItem\('mobile_selected_bzpc'\)/)
})

test('global design tokens expose the B2B mobile app palette aliases', () => {
  const tokens = [
    '--bg: #f6f8fb',
    '--surface: #ffffff',
    '--surface-soft: #f9fafb',
    '--text-main: #111827',
    '--text-sub: #6b7280',
    '--border: #e5e7eb',
    '--primary: #2563eb',
    '--primary-dark: #1d4ed8',
    '--success: #16a34a',
    '--warning: #f59e0b',
    '--danger: #dc2626',
  ]
  for (const token of tokens) assert.match(stylesSource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(stylesSource, /\.card\s*\{[\s\S]*border-radius:\s*var\(--radius-lg\)/)
  assert.match(stylesSource, /\.btn\s*\{[\s\S]*min-height:\s*44px/)
  assert.match(stylesSource, /\.badge\s*\{[\s\S]*border-radius:\s*var\(--radius-full\)/)
})

test('EstimateList renders B2B estimate rows as clear touch cards', () => {
  assert.match(source, /class="estimate-list-page"/)
  assert.match(source, /class="card estimate-filter-card"/)
  assert.match(source, /class="estimate-card"/)
  assert.match(source, /class="estimate-card-head"/)
  assert.match(source, /class="estimate-card-title"/)
  assert.match(source, /class="estimate-card-meta"/)
  assert.match(source, /class="estimate-card-amount"/)
  assert.match(source, /formatEstimateAmount\(row\)/)
  assert.match(source, /상태/)
  assert.doesNotMatch(source, /시공비|철거비|프로모션|소비자/)
})
