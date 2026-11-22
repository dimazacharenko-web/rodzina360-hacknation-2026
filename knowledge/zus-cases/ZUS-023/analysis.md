# ZUS-023 — father_parental_uninsured_mother

Sources:
- `Dariusz Łód_4_zas. macierzyński za rodzicielski dla ojca_matka nieubezpieczona.pdf`

Evidence pages: 2, 3, 5, 7, 11.

Evidence type: ZUR_request_and_employer_form.

Inputs:
- parent: "father"
- childBirthDate: "2024-01-10"
- motherInsured: false
- parentalClaimStart: "2025-01-01"
- parentalClaimEnd: "2025-03-12"
- employmentFte: 1

Provisional expected values:
- parentalRequestedDays: 71

Caveat: Employer Z3 and ZUR show parental claim; the mother is described as uninsured. Dates and eligibility require reconciliation; no award confirmed.

Status: partially extracted, not yet an app-validated Golden Test Case. Preserve source PDF(s) until verified.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `no_grant_or_refusal_found`.

Relevant source PDF pages: 2, 3, 5, 7, 11, 12, 13.

Document findings: Father's ZUR request 2025-01-01..2025-03-12; mother reported uninsured, birth 2024-01-10. No ZUS approval or payout confirmed.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
