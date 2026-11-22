# ZUS-067 — paternity_allowance_denied_due_to_contribution_debt

Source: `Piotr Cho_5_zas. mac. za okres urlopu ojcowskiego, odmowa z powodu zadłużenia, osoba prowadząca działalność.pdf`

Source evidence pages (1-based): 2, 6, 11, 12, 13, 15, 16.

## Inputs
```json
{
  "employmentType": "self_employed",
  "paternityClaimStart": "2025-09-25",
  "paternityClaimEnd": "2025-10-08",
  "socialInsuranceArrearsPresent": true,
  "arrearsSettledByDecisionDate": false
}
```

## Document-based expected outcomes
```json
{
  "paternityClaimDays": 14,
  "benefitEntitlement": "denied",
  "denialReason": "social_insurance_contribution_arrears"
}
```

## Evidence interpretation
Formal ZUS decision p15 denies paternity benefit for 25.09–08.10.2025 due to contribution arrears, as confirmed in insurance enquiry p12. Contribution bases are not payout amounts.

Status: selected-page extraction only. Final payment amount in PLN not established. No Rodzina360 engine test executed. Keep original PDF until audited.
