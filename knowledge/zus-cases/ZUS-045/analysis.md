# ZUS-045: employee_maternity_and_parental_claim

Source PDF: `Julia No_4_zas. macierzyński.pdf`

## Evidence
Pages: 2, 4, 5. Document types: ZAM_application.

## Source-supported inputs
```json
{
  "childBirthDate": "2025-02-03",
  "maternityClaimStart": "2025-02-03",
  "maternityClaimEnd": "2025-06-22",
  "parentalClaimStart": "2025-06-23",
  "parentalClaimEnd": "2026-02-01"
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
ZAM p2 states maternity 140 days and parental 224 days; no proof of award or amount in inspected pages.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
