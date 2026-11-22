# ZUS-070 — pregnancy_sickness_and_maternity_sequential

Source: `Pola Rze_4_zas. chorobowy w ciąży i zas. macierzyński.pdf`

Source evidence pages (1-based): 2, 4, 5, 9, 13, 15.

## Inputs
```json
{
  "employmentType": "employee",
  "sicknessReportedStart": "2026-07-08",
  "sicknessReportedEnd": "2026-08-22",
  "maternityPeriodReportedStart": "2026-08-09",
  "maternityPeriodReportedEnd": "2027-08-07",
  "employmentSince": "2019-10-01"
}
```

## Document-based expected outcomes
```json
{
  "sicknessReportedDays": 46,
  "overlapOrDateConflict": true
}
```

## Evidence interpretation
Z-3 p2 reports sickness 08.07–22.08.2026 while Z-3 p13 reports maternity from 09.08.2026, creating an overlap that must not be silently corrected. 7000 PLN is reported wage, not allowance.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
