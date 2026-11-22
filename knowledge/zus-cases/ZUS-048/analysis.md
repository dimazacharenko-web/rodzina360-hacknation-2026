# ZUS-048: sickness_denial_contribution_arrears

Source PDF: `Justyna Wa I_4_zas. chorobowy w ciąży, osoba współpracująca, odmowa, zadłużenie z tytułu składek.pdf`

## Evidence
Pages: 2, 3, 9, 10, 11, 15. Document types: Z3b_ZUS_insurance_and_case_closure.

## Source-supported inputs
```json
{
  "employmentCategory": "self_employed",
  "sicknessClaimStart": "2025-03-04",
  "sicknessClaimEnd": "2025-03-31",
  "insuranceDebtRecorded": true
}
```

## Provisional expected values
```json
{
  "sicknessClaimDays": 28,
  "caseResolution": "refusal_recorded"
}
```

## Verification limits
Page 11 ZUS insurance reply says debt exists, page 15 states case closed with refusal. Full formal decision text and debt threshold were not evidenced.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
