# ZUS-050: self_employed_maternity_supplementary_parental

Source PDF: `Karolina Ra_2_zas. macierzyński za urlop macierzyński, uzupełniający urlop macierzyński, rodzicielski.pdf`

## Evidence
Pages: 3, 9, 11, 12, 15. Document types: Z3b_civil_record_neonatal_records.

## Source-supported inputs
```json
{
  "employmentCategory": "self_employed",
  "benefitTypesRequested": [
    "maternity",
    "supplementary_maternity",
    "parental"
  ],
  "aggregateReportedStart": "2025-12-01",
  "aggregateReportedEnd": "2027-01-24",
  "childBirthDate": "2025-12-01",
  "prematurityHospitalEvidencePresent": true
}
```

## Provisional expected values
```json
{
  "aggregateReportedCalendarDays": 420
}
```

## Verification limits
Z3b p3 reports aggregate period 420 calendar days, not breakdown. Neonatal medical record p12 is supporting evidence, not proof of supplementary leave grant or amount.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
