# ZUS-052 — maternity_claim_refusal_with_corrected_applications

Source: `Katarzyna Lu_5_zas. mac. - odmowa.pdf`.

## Evidence pages
1, 2, 8, 13, 15 (original PDF page numbering).

## Inputs extracted
```json
{
  "maternityClaimStart": "2026-07-09",
  "maternityClaimEnd": "2026-11-25",
  "parentalClaimStart": "2026-11-26",
  "parentalClaimEnd": "2027-07-07",
  "applicationCorrected": true
}
```

## Source-grounded expected values
```json
{
  "maternityClaimDays": 140,
  "parentalClaimDays": 224,
  "denialIndicatedInCaseHeader": true
}
```

## Interpretation and limitations
File header says odmowa; amended ZAM p8 shows 140+224 days. Claimant letter pp13,15 asks to reassess business closing and submission dates. No complete formal refusal with precise grounds confirmed.

Status: `refusal_header_only_decision_reason_pending`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
