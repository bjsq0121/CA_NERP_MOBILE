# Mobile Sash Save Parity Design

## Goal

Make CA_NERP_MOBILE_TWO sash estimates produce the same saved result as the CA_NERP2 web `SashForm.vue` for equivalent business inputs.

The first target is save-result parity, not full UI parity. The mobile UI may stay mobile-optimized as long as it sends or derives the same business values needed by the ERP save pipeline.

## Source Of Truth

The web reference is:

- `CA_NERP2/vue/src/components/modal/order/sale/estimate/SashForm.vue`
- `CA_NERP2/src/main/java/kr/co/ca/service/ItgEstiOneService.java`
- `CA_NERP2/src/main/resources/mapper/ItgEstiOneMapper.xml`

The mobile implementation under test is:

- `src/views/SashNew.vue`
- `src/utils/sashPayload.js`
- `src/components/SashOption*.vue`
- `CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java`

## Parity Definition

For the same estimate header and equivalent sash input, web and mobile are considered equivalent when all of these match:

- Save succeeds or fails for the same business reason.
- The saved sash line has the same key shape: `itgEstiNo`, `estiNo`, `estiNos`, `estiSeq`.
- `/ItgEstiOne/searchWindEstiAmt` returns the same amount fields for the saved line.
- Sash detail returns the same core fields: model, window type, bsmf, dimensions, colors, SF/BF glass materials, vent, screen, handles, safety net, and BF/SF/MF production options.
- The STEP1/STEP2 procedure result does not create materially different use-material or price rows.

Exact audit fields such as `inputId`, timestamps, and mobile-only log messages are not parity blockers.

## Approach

Use a comparison-first workflow:

1. Build a small set of representative sash save cases from web behavior.
2. Save the same cases through mobile.
3. Compare saved result, amount result, and core option/material fields.
4. Classify each mismatch as frontend payload, edit-load behavior, mobile backend defaulting, missing validation, or unsupported option.
5. Fix the smallest layer that owns the mismatch.

This avoids guessing from the 9k-line web component and gives a repeatable way to prove that mobile is converging toward web behavior.

## Initial Comparison Cases

Use these cases first:

- Basic single-window sash with default color, vent, screen, SF, and glass.
- Double-window sash with inside/outside color and SF values.
- BF-present model with BF glass materials.
- Glass excluded and glass-X material paths.
- Safety-net enabled model with safety-net handle and height.
- BF production options: drain hole, vent hole, milling type/detail/location, direct ship.
- SF production options: outside glass, roller, crescent, wind closer, SF out type.
- MF production options: direct ship, rack ship, 4W CI attach, MF handle height.
- Existing line edit save.
- Add-estimate save that creates a new `estiSeq`.

The first implementation pass should use a small subset if live ERP data makes all cases hard to prepare. The comparison harness should allow adding cases without rewriting the tool.

## Known High-Risk Differences

Edit mode currently risks overwriting restored values. `SashNew.vue` restores saved fields and then calls model-pick logic, which can clear split dimensions and replace saved glass materials with default list values. This must be fixed early because it affects existing-line save parity.

Mobile frontend sends a reduced payload compared with web `fnLayerSaveCmplWinEsti`. Some missing fields are harmless because `MobileEstiService.fillSashDefaults` derives or defaults them, but fields that affect STEP1/STEP2 material or amount results must either be sent by mobile or derived server-side from the same source as web.

Mobile validation is intentionally smaller than web validation. For save-result parity, missing validation matters when web would block a save that mobile allows, or when mobile accepts a value combination that later produces a different procedure result.

## Fix Strategy

Prioritize fixes in this order:

1. Preserve edit-loaded values before expanding option coverage.
2. Align frontend payload field names and value semantics with the web payload.
3. Align mobile backend defaults with web fixed values and option defaults.
4. Add only validations that affect save-result parity.
5. Add missing UI controls only when a parity case needs a user-selectable value that cannot be safely defaulted or derived.

When a value can be derived from model, header, or common-code data in the backend without user choice, prefer backend derivation. When a value is a business choice in web, expose it in mobile or explicitly document it as unsupported until the next parity pass.

## Testing

Add tests at three levels:

- Unit tests for `buildSashSavePayload`, especially field mapping against web payload names.
- Unit or component-level tests for edit-load preservation in `SashNew.vue`.
- An integration comparison script that saves or compares prepared web/mobile cases and reports field differences.

The comparison report should group mismatches by category:

- Amount mismatch.
- Detail field mismatch.
- Missing mobile payload field.
- Backend default mismatch.
- Unsupported mobile option.

The integration script may require a configured CA_NERP2 backend and ERP test data. It should fail clearly when the backend or seed data is unavailable.

## Out Of Scope

This phase does not require:

- Recreating the full desktop web `SashForm.vue` layout on mobile.
- Implementing door, glass, molding, package, or goods estimate parity.
- Refactoring the web `SashForm.vue`.
- Changing ERP procedures unless a confirmed procedure bug is found outside mobile behavior.

## Acceptance Criteria

- A repeatable comparison workflow exists for representative sash cases.
- Existing mobile tests continue to pass.
- At least the first representative cases save through mobile with matching amount and core detail results.
- Known edit-mode overwrite behavior is fixed or covered by a failing comparison/test before any broader option work begins.
- Remaining differences are documented as explicit parity gaps, not hidden assumptions.
