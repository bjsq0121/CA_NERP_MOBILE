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
