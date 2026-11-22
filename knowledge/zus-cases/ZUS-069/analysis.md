# ZUS-069 — father_paternity_leave_grant_indicated

Source: `Piotr Ta_1_zas. macierzyński_urlop ojcowski.pdf`

Source evidence pages (1-based): 1, 5, 8, 13, 15.

## Inputs
```json
{
  "parent": "father",
  "childBirthDate": "2025-05-30",
  "paternityClaimStart": "2025-09-22",
  "paternityClaimEnd": "2025-10-05",
  "employmentSince": "2022-02-01"
}
```

## Document-based expected outcomes
```json
{
  "paternityRequestedDays": 14,
  "decisionIndicatedOnCover": "granted"
}
```

## Evidence interpretation
Cover p1 says decision granting paternity allowance. ZAO p8 and Z-3 p13 show 22.09–05.10.2025. Actual transferred PLN amount not present.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
