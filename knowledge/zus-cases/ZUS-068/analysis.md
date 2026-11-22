# ZUS-068 — father_paternity_leave_fourteen_day_claim

Source: `Piotr Rze_1_zas. macierzyński - urlop ojcowski.pdf`

Source evidence pages (1-based): 2, 3, 6, 8.

## Inputs
```json
{
  "parent": "father",
  "childBirthDate": "2026-05-05",
  "paternityClaimStart": "2026-10-12",
  "paternityClaimEnd": "2026-10-25",
  "employmentSince": "2016-09-01"
}
```

## Document-based expected outcomes
```json
{
  "paternityRequestedDays": 14
}
```

## Evidence interpretation
ZAO p2 and Z-3 p6 show 12–25.10.2026, 14 days; Z-3 wage table p8 not amount disbursed. No final granting decision located.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
