# ZUS-057 — maternity_denial_sham_employment_insurance_exclusion

Source: `Krystyna Zab_3_Odmowa zas. macierzyńskiego_umowa dla pozoru.pdf`.

## Evidence pages
1, 4, 13 (original PDF page numbering).

## Inputs extracted
```json
{
  "employmentReportedStart": "2025-11-03",
  "maternityClaimStart": "2026-01-13",
  "maternityClaimEnd": "2027-01-11",
  "socialInsuranceCoverageDisputed": true
}
```

## Source-grounded expected values
```json
{
  "maternityClaimDays": 364,
  "insuranceExclusionFrom": "2025-11-03",
  "denialIndicatedInCaseHeader": true
}
```

## Interpretation and limitations
Cover p1 labels benefit refusal; p13 ZUS decision establishes non-coverage for mandatory pension/disability/sickness/accident insurance from 03.11.2025. Full 9-page reasoning not reviewed; do not assert detailed motive beyond documented insurance exclusion.

Status: `insurance_exclusion_decision_shown_full_refusal_pending`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
