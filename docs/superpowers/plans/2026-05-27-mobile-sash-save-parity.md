# Mobile Sash Save Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile sash saves preserve and submit the same business values that the CA_NERP2 web `SashForm.vue` submits for equivalent inputs.

**Architecture:** First make the current high-risk edit-save mismatch testable with pure utilities, then use those utilities in `SashNew.vue`. Next align the mobile save payload with the web save payload's field names and add a local comparison script so later ERP-backed parity checks can report exact differences without changing app code.

**Tech Stack:** Vue 3, Vite, Node `node:test`, existing Axios API wrappers, CA_NERP2 mobile sash API.

---

## File Structure

- Create `src/utils/sashEditPreserve.js`
  - Owns pure functions for capturing and restoring saved edit values that must survive model master rehydration.
- Modify `src/views/SashNew.vue`
  - Uses the preserve helper during `loadEditData()` before calling `onModelPick(..., preserveProductionOptions: true)`.
- Modify `src/utils/sashPayload.js`
  - Adds web-compatible aliases and fixed save fields that web `fnLayerSaveCmplWinEsti()` sends.
- Create `src/utils/sashEditPreserve.test.js`
  - Verifies edit-loaded dimensions, glass materials, and saved options are not overwritten by defaults.
- Modify `src/utils/sashPayload.test.js`
  - Verifies web-compatible payload aliases exist and match mobile values.
- Create `scripts/compare-sash-save-parity.mjs`
  - Compares saved web/mobile detail or amount JSON files and prints grouped mismatches.
- Create `docs/analysis/2026-05-27-mobile-sash-parity-gaps.md`
  - Records confirmed parity gaps and whether they are fixed, backend-derived, unsupported, or pending ERP data.

---

### Task 1: Add Edit Preservation Helper

**Files:**
- Create: `src/utils/sashEditPreserve.js`
- Create: `src/utils/sashEditPreserve.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/sashEditPreserve.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  captureSashEditValues,
  restoreSashEditValues,
} from './sashEditPreserve.js'

test('restoreSashEditValues preserves split dimensions and glass selections after defaults run', () => {
  const form = {
    w1: 500,
    w2: 600,
    w3: null,
    w4: 0,
    w5: '',
    h1: 700,
    h2: null,
    h3: 0,
    h4: '',
    h5: 900,
    cs: 11,
    cs1: 12,
    cs2: null,
    cs3: 14,
    cs4: '',
    cs5: 16,
    mtrlCds1: 'SF-IN-SAVED',
    mtrlCds2: 'SF-OUT-SAVED',
    mtrlCds3: 'BF-IN-SAVED',
    mtrlCds4: 'BF-OUT-SAVED',
  }

  const snapshot = captureSashEditValues(form)

  Object.assign(form, {
    w1: null,
    w2: null,
    w4: null,
    h1: null,
    h3: null,
    h5: null,
    cs: null,
    cs1: null,
    cs3: null,
    cs5: null,
    mtrlCds1: 'SF-IN-DEFAULT',
    mtrlCds2: 'SF-OUT-DEFAULT',
    mtrlCds3: 'BF-IN-DEFAULT',
    mtrlCds4: 'BF-OUT-DEFAULT',
  })

  restoreSashEditValues(form, snapshot)

  assert.equal(form.w1, 500)
  assert.equal(form.w2, 600)
  assert.equal(form.w4, 0)
  assert.equal(form.h1, 700)
  assert.equal(form.h3, 0)
  assert.equal(form.h5, 900)
  assert.equal(form.cs, 11)
  assert.equal(form.cs1, 12)
  assert.equal(form.cs3, 14)
  assert.equal(form.cs5, 16)
  assert.equal(form.mtrlCds1, 'SF-IN-SAVED')
  assert.equal(form.mtrlCds2, 'SF-OUT-SAVED')
  assert.equal(form.mtrlCds3, 'BF-IN-SAVED')
  assert.equal(form.mtrlCds4, 'BF-OUT-SAVED')
})

test('restoreSashEditValues keeps intentionally empty saved values empty', () => {
  const form = {
    mtrlCds1: '',
    mtrlCds2: '',
    mtrlCds3: '',
    mtrlCds4: '',
    ventLoc: '',
    screenType: '',
  }
  const snapshot = captureSashEditValues(form)

  Object.assign(form, {
    mtrlCds1: 'DEFAULT1',
    mtrlCds2: 'DEFAULT2',
    mtrlCds3: 'DEFAULT3',
    mtrlCds4: 'DEFAULT4',
    ventLoc: 'DEFAULT-VENT',
    screenType: 'DEFAULT-SCREEN',
  })

  restoreSashEditValues(form, snapshot)

  assert.equal(form.mtrlCds1, '')
  assert.equal(form.mtrlCds2, '')
  assert.equal(form.mtrlCds3, '')
  assert.equal(form.mtrlCds4, '')
  assert.equal(form.ventLoc, '')
  assert.equal(form.screenType, '')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/utils/sashEditPreserve.test.js
```

Expected: FAIL with module not found for `./sashEditPreserve.js`.

- [ ] **Step 3: Add the helper**

Create `src/utils/sashEditPreserve.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/utils/sashEditPreserve.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/sashEditPreserve.js src/utils/sashEditPreserve.test.js
git commit -m "test: add sash edit preservation helper"
```

---

### Task 2: Preserve Edit Values In SashNew

**Files:**
- Modify: `src/views/SashNew.vue`
- Modify: `src/views/SashNew.test.js`

- [ ] **Step 1: Add failing source-level regression tests**

Append these tests to `src/views/SashNew.test.js`:

```js
test('SashNew captures and restores saved edit values around model master reload', () => {
  assert.match(source, /import \{ captureSashEditValues, restoreSashEditValues \} from '\.\.\/utils\/sashEditPreserve'/)
  assert.match(source, /const savedEditValues = captureSashEditValues\(form\.value\)/)
  assert.match(source, /await onModelPick\(\{ \.\.\.r \}, \{ preserveProductionOptions: true \}\)/)
  assert.match(source, /restoreSashEditValues\(form\.value, savedEditValues\)/)
  assert.ok(source.indexOf('const savedEditValues = captureSashEditValues(form.value)') < source.indexOf('await onModelPick({ ...r }, { preserveProductionOptions: true })'))
  assert.ok(source.indexOf('await onModelPick({ ...r }, { preserveProductionOptions: true })') < source.indexOf('restoreSashEditValues(form.value, savedEditValues)'))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/views/SashNew.test.js
```

Expected: FAIL because `SashNew.vue` does not import or call the preserve helper.

- [ ] **Step 3: Wire the helper into `SashNew.vue`**

In `src/views/SashNew.vue`, add this import near the existing utility imports:

```js
import { captureSashEditValues, restoreSashEditValues } from '../utils/sashEditPreserve'
```

Replace the end of `loadEditData()`:

```js
  if (r.mdlCd) await onModelPick({ ...r }, { preserveProductionOptions: true })
  await loadWindEstimateAmount()
```

with:

```js
  if (r.mdlCd) {
    const savedEditValues = captureSashEditValues(form.value)
    await onModelPick({ ...r }, { preserveProductionOptions: true })
    restoreSashEditValues(form.value, savedEditValues)
    applyProductionOptionRules()
    refreshDrawingFromCurrentSelection()
  }
  await loadWindEstimateAmount()
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- src/views/SashNew.test.js src/utils/sashEditPreserve.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/SashNew.vue src/views/SashNew.test.js
git commit -m "fix: preserve mobile sash edit values"
```

---

### Task 3: Add Web-Compatible Payload Aliases

**Files:**
- Modify: `src/utils/sashPayload.js`
- Modify: `src/utils/sashPayload.test.js`

- [ ] **Step 1: Add failing payload parity assertions**

In the first test in `src/utils/sashPayload.test.js`, after the existing required field assertions, add:

```js
  assert.equal(payload.wSize, '2000')
  assert.equal(payload.hSize, '1000')
  assert.equal(payload.ctgrCd, 'P')
  assert.equal(payload.windLocCd, '01')
  assert.equal(payload.rt, 1)
  assert.equal(payload.glasDblYn, 'Y')
  assert.equal(payload.unpAplScn, '01')
  assert.equal(payload.m2Unp, '0')
  assert.equal(payload.insdSfGlasMtrlCd, 'G1')
  assert.equal(payload.ousdSfGlasMtrlCd, 'G2')
  assert.equal(payload.insdBfGlasMtrlCd, '')
  assert.equal(payload.ousdBfGlasMtrlCd, '')
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/utils/sashPayload.test.js
```

Expected: FAIL because aliases such as `wSize`, `ctgrCd`, and `insdSfGlasMtrlCd` are missing.

- [ ] **Step 3: Add aliases and fixed web save values**

In `src/utils/sashPayload.js`, inside the returned object, add these fields near their related existing fields:

```js
    ctgrCd: 'P',
    windLocCd: '01',
    rt: 1,
    glasDblYn: 'Y',
    unpAplScn: '01',
    m2Unp: '0',

    wSize: stringifyValue(form.w),
    hSize: stringifyValue(form.h),
```

and add these aliases near `mtrlCds1` through `mtrlCds4`:

```js
    insdSfGlasMtrlCd: stringifyValue(form.mtrlCds1),
    ousdSfGlasMtrlCd: stringifyValue(form.mtrlCds2),
    insdBfGlasMtrlCd: stringifyValue(form.mtrlCds3),
    ousdBfGlasMtrlCd: stringifyValue(form.mtrlCds4),
```

Do not remove the existing mobile fields; the mobile backend already accepts them.

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- src/utils/sashPayload.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/sashPayload.js src/utils/sashPayload.test.js
git commit -m "fix: align mobile sash payload with web save fields"
```

---

### Task 4: Add Local Save Result Comparator

**Files:**
- Create: `scripts/compare-sash-save-parity.mjs`
- Create: `scripts/compare-sash-save-parity.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing comparator tests**

Create `scripts/compare-sash-save-parity.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { compareSashParity } from './compare-sash-save-parity.mjs'

test('compareSashParity reports matching detail and amount as clean', () => {
  const result = compareSashParity({
    web: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000', hSize: '1000', mtrlCds1: 'G1' },
      amount: { estiTotSaleUnp: '1000', estiTotSaleVat: '100', estiTotSaleVatUnp: '1100' },
    },
    mobile: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000', hSize: '1000', mtrlCds1: 'G1' },
      amount: { estiTotSaleUnp: '1000', estiTotSaleVat: '100', estiTotSaleVatUnp: '1100' },
    },
  })

  assert.deepEqual(result.mismatches, [])
})

test('compareSashParity groups detail and amount mismatches', () => {
  const result = compareSashParity({
    web: {
      detail: { mdlCd: '0161-01', wintydiCd: '01', bsmfOrdUtmCd: '101', wSize: '2000' },
      amount: { estiTotSaleUnp: '1000' },
    },
    mobile: {
      detail: { mdlCd: '0161-01', wintydiCd: '02', bsmfOrdUtmCd: '102', wSize: '2100' },
      amount: { estiTotSaleUnp: '900' },
    },
  })

  assert.deepEqual(result.mismatches, [
    { group: 'detail', field: 'wintydiCd', web: '01', mobile: '02' },
    { group: 'detail', field: 'bsmfOrdUtmCd', web: '101', mobile: '102' },
    { group: 'detail', field: 'wSize', web: '2000', mobile: '2100' },
    { group: 'amount', field: 'estiTotSaleUnp', web: '1000', mobile: '900' },
  ])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test scripts/compare-sash-save-parity.test.mjs
```

Expected: FAIL because `scripts/compare-sash-save-parity.mjs` does not exist.

- [ ] **Step 3: Create comparator script**

Create `scripts/compare-sash-save-parity.mjs`:

```js
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

if (process.argv[1] && process.argv[1].endsWith('compare-sash-save-parity.mjs') && process.argv.length > 2) {
  const [, , webPath, mobilePath] = process.argv
  if (!webPath || !mobilePath) {
    console.error('Usage: node scripts/compare-sash-save-parity.mjs web.json mobile.json')
    process.exit(2)
  }

  const result = compareSashParity({
    web: loadJson(webPath),
    mobile: loadJson(mobilePath),
  })

  if (result.ok) {
    console.log('Sash parity OK')
    process.exit(0)
  }

  console.table(result.mismatches)
  process.exit(1)
}
```

- [ ] **Step 4: Add npm script**

In `package.json`, add:

```json
"compare:sash": "node scripts/compare-sash-save-parity.mjs"
```

Keep the existing scripts intact.

- [ ] **Step 5: Run focused tests**

Run:

```bash
node --test scripts/compare-sash-save-parity.test.mjs
npm test
```

Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json scripts/compare-sash-save-parity.mjs scripts/compare-sash-save-parity.test.mjs
git commit -m "test: add sash save parity comparator"
```

---

### Task 5: Document First Parity Gaps

**Files:**
- Create: `docs/analysis/2026-05-27-mobile-sash-parity-gaps.md`

- [ ] **Step 1: Create gap document**

Create `docs/analysis/2026-05-27-mobile-sash-parity-gaps.md`:

```md
# Mobile Sash Save Parity Gaps

## Fixed In This Pass

- Edit-loaded split dimensions and selected glass/material fields are preserved after model master data reload.
- Mobile save payload includes web-compatible aliases for size, glass material, category, location, rate, and fixed glass double fields.

## Pending ERP-Backed Comparison

- Compare `/ItgEstiOne/searchWindEstiAmt` amount fields for web and mobile saved lines.
- Compare persisted core detail fields for representative single-window and double-window cases.
- Compare BF/SF/MF production option fields for at least one option-heavy case.

## Known Remaining Functional Gaps

- Mobile does not expose every web-only option in `SashForm.vue`.
- Mobile validation is intentionally smaller than web validation until a result-affecting mismatch is confirmed.
- Full desktop layout parity is outside the current save-result parity phase.
```

- [ ] **Step 2: Verify docs are cleanly scoped**

Run:

```bash
git diff -- docs/analysis/2026-05-27-mobile-sash-parity-gaps.md
```

Expected: diff only contains the new gap document.

- [ ] **Step 3: Commit**

```bash
git add docs/analysis/2026-05-27-mobile-sash-parity-gaps.md
git commit -m "docs: record mobile sash parity gaps"
```

---

### Task 6: Final Verification

**Files:**
- Verify all changed files from Tasks 1-5.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build completes successfully.

- [ ] **Step 3: Check worktree**

Run:

```bash
git status --short
```

Expected: only pre-existing unrelated files remain modified or untracked. New parity code should already be committed.

- [ ] **Step 4: Report result**

Report:

```text
Implemented the first save-parity pass:
- edit-loaded values are preserved
- mobile payload includes web-compatible aliases
- local parity comparator exists
- first known parity gaps are documented

Verification:
- npm test: PASS
- npm run build: PASS
```
