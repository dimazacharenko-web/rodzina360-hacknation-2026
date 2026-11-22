# ZUS-075 — father_parental_sixth_part_denial

Source: `Tomasz Po_11_zas. mac. ojciec - za okres rodz. - 6ta część - decyzja odmowna.pdf`

Source evidence pages (1-based): 2, 9, 11, 13, 14.

## Inputs
```json
{
  "parent": "father",
  "parentalClaimStart": "2024-08-12",
  "parentalClaimEnd": "2024-08-18",
  "previousParentalLeavePartsUsed": 5,
  "requestedPartNumber": 6
}
```

## Document-based expected outcomes
```json
{
  "parentalRequestedDays": 7,
  "benefitEntitlement": "denied",
  "denialReason": "exceeds_maximum_five_parental_leave_parts"
}
```

## Evidence interpretation
Formal ZUS decision pp13–14 denies 12–18.08.2024 because five previous parental-leave parts had already been used. Distinguish clearly from insurance noncoverage; no paid amount.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
