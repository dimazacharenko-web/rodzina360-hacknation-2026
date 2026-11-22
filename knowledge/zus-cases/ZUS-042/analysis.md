# ZUS-042: multiple_births_stillbirth_za_zyciem_work_during_parental

Source PDF: `Jolanta Poz_9_ zas. mac. - url. mac. i rodz., 3 dzieci, 1 martwourodzone, 1 za życiem, łącznie urlop rodz. z pracą - decyzja przyznająca.pdf`

## Evidence
Pages: 3, 9, 11, 13, 15. Document types: ZAM_and_civil_records.

## Source-supported inputs
```json
{
  "childrenBornTogetherReported": 3,
  "stillbirthAmongChildrenReported": true,
  "zaZyciemReported": true,
  "workDuringParentalReported": true,
  "maternityClaimStart": "2024-05-13",
  "maternityClaimEnd": "2024-12-15"
}
```

## Provisional expected values
```json
{
  "maternityRequestedDays": 217
}
```

## Verification limits
Case filename refers to a granting decision, but specific decision text, rate and percentage of work while on parental leave need full verification. Page 3 maternity interval is 31 weeks.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
