# ZUS-065 — insurance_exclusion_sickness_and_maternity_claim

Source: `Paulina Po_7_zas. chorobowy i mac. matka za okres url. mac. rodz. - nie podlega ubezpieczeniom - decyzja odmowna.pdf`

Source evidence pages (1-based): 1, 2, 4, 10.

## Inputs
```json
{
  "employmentType": "employee_reported",
  "sicknessClaimIntervals": [
    [
      "2025-03-08",
      "2025-03-28"
    ],
    [
      "2025-03-29",
      "2025-04-19"
    ],
    [
      "2025-04-20",
      "2025-04-25"
    ],
    [
      "2025-04-26",
      "2025-05-27"
    ]
  ],
  "insuranceStatusDisputed": true
}
```

## Document-based expected outcomes
```json
{
  "outcomeIndicatedInCaseTitle": "denial",
  "legalReasonFromTitle": "not_subject_to_social_insurance"
}
```

## Evidence interpretation
Z-3 p2 and ZAS-12 p10 show sickness intervals; case filename calls it ZUS refusal for noncoverage, but full operative decision requires further inspection. Do not assert awarded sum.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
