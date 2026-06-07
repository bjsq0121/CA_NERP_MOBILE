import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(currentDir, 'EstimateList.vue'), 'utf8')
const newSource = readFileSync(resolve(currentDir, 'EstimateNew.vue'), 'utf8')

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
