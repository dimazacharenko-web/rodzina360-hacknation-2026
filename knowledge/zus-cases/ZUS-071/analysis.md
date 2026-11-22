# ZUS-071 — father_parental_reserved_weeks_request_with_shorter_dates

Source: `Ryszard Ra_5_zas. macierzyński za okres urlopu rodzicielskiego-9 tyg..pdf`

Source evidence pages (1-based): 2, 3, 9, 11.

## Inputs
```json
{
  "parent": "father",
  "childBirthDate": "2025-11-18",
  "parentalClaimStart": "2026-01-16",
  "parentalClaimEnd": "2026-03-14",
  "nonTransferableNineWeeksLabel": true,
  "claimantOtherLeaveStatementAttached": true
}
```

## Document-based expected outcomes
```json
{
  "parentalRequestedDays": 58,
  "expectedIfFullNineWeeks": 63,
  "dateDiscrepancy": true
}
```

## Evidence interpretation
ZUR p2 requests 16.01–14.03.2026, only 58 days, despite 9-week label; handwritten statement p9 proposes date correction to 18.03.2026. Do not assert full nine-week award.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
