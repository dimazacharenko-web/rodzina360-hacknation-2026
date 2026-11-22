# ZUS-040: stillbirth_employed_maternity_leave

Source PDF: `Jolanta Ko_2_zas. mac. martwe urodzenie.pdf`

## Evidence
Pages: 2, 3, 4. Document types: Z3_employer_record.

## Source-supported inputs
```json
{
  "stillbirthContext": "stated_in_case_filename",
  "maternityReportedStart": "2026-04-12",
  "maternityReportedEnd": "2026-06-06",
  "employmentStart": "2020-01-02",
  "employmentFte": 1
}
```

## Provisional expected values
```json
{
  "maternityReportedDays": 56
}
```

## Verification limits
Z-3 pages 2 and 3 report 56 days. Page 4 contains earnings (not ZUS payouts); stillbirth must be independently verified from registry if present.

Actual PLN payout: not verified. Application-engine checks: not run. Preserve PDF until complete documentary verification.
