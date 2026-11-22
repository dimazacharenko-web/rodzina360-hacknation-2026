# ZUS-074 — commission_contract_voluntary_sickness_insurance_maternity

Source: `Teresa Ta_zas. chorobowy i macierzyński_umowa zlecenie.pdf`

Source evidence pages (1-based): 1, 5, 9, 11, 12.

## Inputs
```json
{
  "employmentType": "umowa_zlecenie",
  "childBirthDate": "2025-09-10",
  "insuranceSicknessRegisteredInZ3a": true,
  "maternityBenefitReportedStart": "2025-09-10",
  "maternityBenefitReportedEnd": "2026-09-08"
}
```

## Document-based expected outcomes
```json
{
  "aggregateBenefitReportedDays": 364,
  "awardIndicatedOnCover": true
}
```

## Evidence interpretation
Cover p1 says granting sick leave and maternity allowance; Z-3a p9 reports maternity 10.09.2025–08.09.2026 and voluntary sickness insurance. Z-3a p11 has contribution bases, not actual transfers.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
