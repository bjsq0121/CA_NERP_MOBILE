# Sash Validation Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make sash estimate save/edit behavior safer by extracting payload generation, adding repeatable tests, and then validating API parity against `CA_NERP2`.

**Architecture:** Keep `SashNew.vue` focused on UI state and move backend payload mapping into a pure utility. Use Node's built-in test runner first so the project gains regression coverage without adding network-dependent dependencies. Later tasks can add API smoke checks once backend credentials and running services are available.

**Tech Stack:** Vue 3, Vite, Pinia, Axios, Node `node:test`, CA_NERP2 Spring Boot mobile APIs.

---

### Task 1: Extract Sash Save Payload Mapping

**Files:**
- Create: `src/utils/sashPayload.js`
- Create: `src/utils/sashPayload.test.js`
- Modify: `src/views/SashNew.vue`
- Modify: `package.json`

- [x] **Step 1: Write the failing test**

Create `src/utils/sashPayload.test.js` with tests for new-save and edit-save payloads:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSashSavePayload } from './sashPayload.js'

test('buildSashSavePayload maps required sash fields for a new estimate', () => {
  const payload = buildSashSavePayload({
    form: {
      mdlCd: '0161-01',
      wintydiCd: '01',
      bftydiCd: 'BF',
      sizCd: 'S',
      bsmfOrdUtmCd: '101',
      sashOrdTypCd: '10',
      w: 2000,
      h: 1000,
      qty: 2,
      w1: 1000,
      w2: '',
      w3: null,
      w4: undefined,
      w5: 0,
      h1: 500,
      h2: '',
      h3: null,
      h4: undefined,
      h5: 0,
      cs: 10,
      cs1: '',
      cs2: null,
      cs3: undefined,
      cs4: 0,
      cs5: 5,
      insdColrCd: 'WH',
      ousdColrCd: '',
      insdSf: 'SF-IN',
      ousdSf: 'SF-OUT',
      ventLoc: 'L',
      screenType: 'PVC',
      isAluMf: false,
      slcnFnshYn: true,
      insdHandleType: 'H1',
      ousdHandleType: 'H2',
      insdHndlH: 900,
      ousdHndlH: '',
      mtrlCds1: 'G1',
      mtrlCds2: 'G2',
      mtrlCds3: '',
      mtrlCds4: null,
      remSrc: 'memo',
    },
    itgEstiNo: 'ITG001',
    wEstiNo: 'W001',
    estiNos: '1',
    editEstiSeq: '',
  })

  assert.equal(payload.itgEstiNo, 'ITG001')
  assert.equal(payload.estiNo, 'W001')
  assert.equal(payload.estiNos, '1')
  assert.equal(payload.estiSeq, '')
  assert.equal(payload.w0Size, '2000')
  assert.equal(payload.h0Size, '1000')
  assert.equal(payload.qty, '2')
  assert.equal(payload.w2Size, '')
  assert.equal(payload.w5Size, '0')
  assert.equal(payload.cs5Size, '5')
  assert.equal(payload.crtnColrCd, 'WH')
  assert.equal(payload.ousdColrCd, 'WH')
  assert.equal(payload.aluMfYn, 'N')
  assert.equal(payload.bfSlcnFnshYn, 'Y')
  assert.equal(payload.mtrlCds4, '')
})

test('buildSashSavePayload preserves edit sequence and outside color', () => {
  const payload = buildSashSavePayload({
    form: {
      mdlCd: '2162-01',
      wintydiCd: '03',
      bftydiCd: '',
      sizCd: '',
      bsmfOrdUtmCd: '',
      sashOrdTypCd: '',
      w: 1800,
      h: 900,
      qty: 1,
      insdColrCd: 'IV',
      ousdColrCd: 'BK',
      insdSf: 'SF1',
      ousdSf: '',
      ventLoc: '',
      screenType: '',
      isAluMf: true,
      slcnFnshYn: false,
      insdHandleType: '',
      ousdHandleType: '',
      insdHndlH: null,
      ousdHndlH: null,
      mtrlCds1: '',
      mtrlCds2: '',
      mtrlCds3: '',
      mtrlCds4: '',
      remSrc: '',
    },
    itgEstiNo: 'ITG002',
    wEstiNo: 'W002',
    estiNos: '2',
    editEstiSeq: '7',
  })

  assert.equal(payload.estiNos, '2')
  assert.equal(payload.estiSeq, '7')
  assert.equal(payload.ousdColrCd, 'BK')
  assert.equal(payload.aluMfYn, 'Y')
  assert.equal(payload.bfSlcnFnshYn, 'N')
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/sashPayload.test.js`
Expected: FAIL with `Cannot find module ... sashPayload.js`.

- [x] **Step 3: Write minimal implementation**

Create `src/utils/sashPayload.js`:

```js
const stringifyValue = (value) => (value == null || value === '' ? '' : String(value))

export function buildSashSavePayload({ form, itgEstiNo, wEstiNo, estiNos = '1', editEstiSeq = '' }) {
  return {
    itgEstiNo,
    estiNo: wEstiNo,
    estiNos,
    estiSeq: editEstiSeq || '',
    mdlCd: form.mdlCd,
    wintydiCd: form.wintydiCd,
    bftydiCd: form.bftydiCd,
    sizCd: form.sizCd,
    bsmfOrdUtmCd: form.bsmfOrdUtmCd,
    sashOrdTypCd: form.sashOrdTypCd,
    w0Size: stringifyValue(form.w),
    h0Size: stringifyValue(form.h),
    qty: stringifyValue(form.qty),
    w1Size: stringifyValue(form.w1),
    w2Size: stringifyValue(form.w2),
    w3Size: stringifyValue(form.w3),
    w4Size: stringifyValue(form.w4),
    w5Size: stringifyValue(form.w5),
    h1Size: stringifyValue(form.h1),
    h2Size: stringifyValue(form.h2),
    h3Size: stringifyValue(form.h3),
    h4Size: stringifyValue(form.h4),
    h5Size: stringifyValue(form.h5),
    csSize: stringifyValue(form.cs),
    cs1Size: stringifyValue(form.cs1),
    cs2Size: stringifyValue(form.cs2),
    cs3Size: stringifyValue(form.cs3),
    cs4Size: stringifyValue(form.cs4),
    cs5Size: stringifyValue(form.cs5),
    crtnColrCd: 'WH',
    insdColrCd: form.insdColrCd,
    ousdColrCd: form.ousdColrCd || form.insdColrCd,
    insdSf: form.insdSf,
    ousdSf: form.ousdSf,
    ventLoc: form.ventLoc || '',
    screenType: form.screenType,
    aluMfYn: form.isAluMf ? 'Y' : 'N',
    bfSlcnFnshYn: form.slcnFnshYn ? 'Y' : 'N',
    insdHandleType: form.insdHandleType,
    ousdHandleType: form.ousdHandleType,
    insdHndlH: stringifyValue(form.insdHndlH),
    ousdHndlH: stringifyValue(form.ousdHndlH),
    mtrlCds1: stringifyValue(form.mtrlCds1),
    mtrlCds2: stringifyValue(form.mtrlCds2),
    mtrlCds3: stringifyValue(form.mtrlCds3),
    mtrlCds4: stringifyValue(form.mtrlCds4),
    remSrc: form.remSrc,
  }
}
```

- [x] **Step 4: Wire `SashNew.vue` to the utility**

Import `buildSashSavePayload` and replace the local `buildPayload()` object construction with a call to the utility using `form.value`, `itgEstiNo.value`, `wEstiNo.value`, `route.query.estiNos || '1'`, and `editEstiSeq.value`.

- [x] **Step 5: Run verification**

Run: `npm test -- src/utils/sashPayload.test.js`
Expected: PASS, 2 tests.

Run: `npm run build`
Expected: Vite build exits 0.

### Task 2: Record Manual API Validation Matrix

**Files:**
- Create: `docs/analysis/2026-05-04-mobile-sash-validation.md`

- [x] **Step 1: Document validation cases**

Create a markdown table covering: login, header save, issue sash number, new sash save, edit sash save, sash list, sash detail.

- [x] **Step 2: Document backend parity points**

For each case, list frontend file, backend endpoint, backend service method, and expected DB/procedure side effect.

- [x] **Step 3: Run verification**

Run: `npm run build`
Expected: Vite build exits 0.
