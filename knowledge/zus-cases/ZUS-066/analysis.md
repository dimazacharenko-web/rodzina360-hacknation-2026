# ZUS-066 — maternity_supplementary_parental_discrepant_forms

Source: `Paulina Rze_5_zas. macierzyński, uzupełniający, rodzicielski.pdf`

Source evidence pages (1-based): 3, 5, 12, 16.

## Inputs
```json
{
  "maternityClaimStart": "2026-06-01",
  "maternityClaimEnd": "2026-10-18",
  "employerReportedMaternityEnd": "2026-10-16",
  "parentalLeaveRequested": true,
  "supplementaryLeaveMentionedInSourceTitle": true
}
```

## Document-based expected outcomes
```json
{
  "maternityRequestedDays": 140,
  "dateConflictBetweenZAMandZ3": true
}
```

## Evidence interpretation
ZAM p5 requests maternity to 18.10.2026; Z-3 p12 appears to report 16.10.2026. Leave reason and extension require complete adjudication. Do not treat title as granted supplementary leave.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
