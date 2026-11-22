# ZUS-072 — maternity_and_parental_employee_employer_record

Source: `Sylwia Ol_4_zas. mac. za okres urlopu mac. i rodzicielskiego.pdf`

Source evidence pages (1-based): 5, 8, 9.

## Inputs
```json
{
  "maternityBenefitReportedStart": "2026-06-03",
  "maternityBenefitReportedEnd": "2026-10-20",
  "parentalLeaveRequested": true
}
```

## Document-based expected outcomes
```json
{
  "maternityReportedDays": 140
}
```

## Evidence interpretation
Z-3 p8 shows 03.06–20.10.2026 maternity period. Claim and parental request p5 handwritten dates need closer review; employer wages are not ZUS payout.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
