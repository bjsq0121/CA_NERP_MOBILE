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
