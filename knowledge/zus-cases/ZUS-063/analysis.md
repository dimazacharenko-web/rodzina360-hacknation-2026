# ZUS-063 — parental_leave_combined_with_half_time_work

Source: `Natalia Łó 3_zas. macierzyński.pdf`

Source evidence pages (1-based): 2, 6, 9, 11, 13.

## Inputs
```json
{
  "maternityApplicationStart": "2026-01-25",
  "maternityApplicationEnd": "2026-06-13",
  "plannedParentalStart": "2026-06-14",
  "workFractionDuringParental": 0.5,
  "otherParentParentalLeaveReported": false
}
```

## Document-based expected outcomes
```json
{
  "maternityRequestedDays": 140
}
```

## Evidence interpretation
ZAM request and employer request p9 for half-time work during parental leave; amount and exact extended parental end not determined.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
