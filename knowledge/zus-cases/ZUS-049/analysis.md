# ZUS-049: father_9_week_parental_benefit

Source PDF: `Karol Go_2_zas. mac. za 9 tygodni urlopu macierzyńskiego dla ojca.pdf`

## Evidence
Pages: 1, 3, 4. Document types: cover_Z3b.

## Source-supported inputs
```json
{
  "parent": "father",
  "employmentCategory": "self_employed",
  "benefitRequestedStart": "2024-08-19",
  "benefitRequestedEnd": "2024-10-20"
}
```

## Provisional expected values
```json
{
  "benefitRequestedDays": 63,
  "caseOutcome": "entitlement_established_and_paid_from_cover"
}
```

## Verification limits
Cover p1 states entitlement established and benefit paid; Z3b p3 shows 63-day period. Filename calls it maternity but this is treated as father reserved 9-week scenario, subject to legal category confirmation.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
