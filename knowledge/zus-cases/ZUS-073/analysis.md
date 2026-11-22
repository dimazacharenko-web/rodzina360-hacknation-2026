# ZUS-073 — maternity_claim_minimum_topup_and_parental_additional_nine_weeks

Source: `Teresa No_5_zas. chorobowy i macierzyński.pdf`

Source evidence pages (1-based): 3, 4, 7, 9, 14.

## Inputs
```json
{
  "employmentFte": 0.25,
  "maternityBenefitReportedStart": "2024-04-09",
  "maternityBenefitReportedEnd": "2025-04-07",
  "additionalParentalNineWeeksAsserted": true,
  "minimumMonthlyBenefitThresholdPLN": 1000
}
```

## Document-based expected outcomes
```json
{
  "aggregateBenefitReportedDays": 364,
  "topupPaymentConfirmed": false
}
```

## Evidence interpretation
Z-3 p7 reported aggregate 364 days, POG p14 references additional 9-week parental period. ZUS letter pp3–4 explains minimum 1000 PLN supplement but does NOT attest the applicant received it.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
