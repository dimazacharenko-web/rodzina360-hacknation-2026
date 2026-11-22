# ZUS-043: father_paternity_leave_granted

Source PDF: `Józef Lu_3_zas. mac. za okres urlopu ojcowskiego.pdf`

## Evidence
Pages: 1, 2, 7, 9, 13. Document types: cover_ZAO_Z3_employer_leave.

## Source-supported inputs
```json
{
  "parent": "father",
  "paternityClaimStart": "2026-07-13",
  "paternityClaimEnd": "2026-07-19",
  "employmentStart": "2024-11-01"
}
```

## Provisional expected values
```json
{
  "paternityClaimDays": 7,
  "grantOutcome": "right_granted_in_case_cover"
}
```

## Verification limits
Page 1 reports ZUS granted entitlement for 13–19 July 2026; no transfer amount. ZAO and Z3 support seven-day period.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
