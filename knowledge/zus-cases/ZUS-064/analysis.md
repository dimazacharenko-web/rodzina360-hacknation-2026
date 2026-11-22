# ZUS-064 — maternity_and_parental_employer_certificate

Source: `Natalia Zi_2_zas. macierzyński.pdf`

Source evidence pages (1-based): 7, 9, 11, 16.

## Inputs
```json
{
  "maternityClaimStart": "2025-03-18",
  "maternityClaimEnd": "2025-08-04",
  "parentalClaimStart": "2025-08-05",
  "parentalClaimEnd": "2026-03-16",
  "employmentFteChangedFrom": 0.5,
  "employmentFteChangedTo": 0.25,
  "employmentFteChangeDate": "2024-08-01"
}
```

## Document-based expected outcomes
```json
{
  "maternityRequestedDays": 140,
  "parentalRequestedDays": 224
}
```

## Evidence interpretation
Z-3 p7 aggregate benefit 18.03.2025–16.03.2026, ZAM p16 requested split; Z-3 p11 confirms FTE change; 4300 PLN is a wage component, not paid allowance.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
