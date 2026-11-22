# ZUS-053 — partial_maternity_self_employed_missing_ZAM_risk

Source: `Kinga Wro_4_zas. macierzyński, za część.pdf`.

## Evidence pages
3, 5, 7, 10, 15, 16 (original PDF page numbering).

## Inputs extracted
```json
{
  "childBirthDate": "2026-08-05",
  "maternityClaimStart": "2026-08-05",
  "maternityClaimEnd": "2026-11-10",
  "employmentType": "self_employed",
  "ZAMRequestedByZUS": true,
  "ZAMSubmissionDeadline": "2026-08-26"
}
```

## Source-grounded expected values
```json
{
  "maternityClaimDays": 98,
  "additionalDocumentRequested": "ZAM"
}
```

## Interpretation and limitations
Z-3b p3 reports 98-day claim; ZUS letter p7 asks for ZAM. ZUS insurance reply p16 lists contribution bases, NOT payout amount. Final award not established.

Status: `forms_and_followup_verified_no_award`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
