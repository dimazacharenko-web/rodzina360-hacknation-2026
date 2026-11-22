# ZUS-038: maternity_claim_and_contribution_debt_risk

Source PDF: `Joanna Wa I_5_zas. mac., osoba współpracująca, odmowa_zadłużenie z tytułu składek.pdf`

## Evidence
Pages: 3, 6, 13, 15. Document types: Z3b_ZAM_civil_record_and_request.

## Source-supported inputs
```json
{
  "employmentCategory": "self_employed",
  "maternityClaimStart": "2025-03-21",
  "maternityClaimEnd": "2025-08-07",
  "parentalClaimStart": "2025-08-08",
  "parentalClaimEnd": "2026-03-19",
  "contributionDebtReportedInCorrespondence": true
}
```

## Provisional expected values
```json
{
  "maternityRequestedDays": 140,
  "parentalRequestedDays": 224
}
```

## Verification limits
ZAM page 6 states 140+224 days; claim title mentions refusal due to arrears but complete refusal decision and debt amount are not confirmed from inspected pages.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
