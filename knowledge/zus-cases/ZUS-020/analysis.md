# ZUS-020 — maternity_parental_employment

Sources:
- `Cecylia By_zas. macierzyński za okres urlopu macierzyńskiego i rodzicielskiego w trakcie zatrudnienia.pdf`

Evidence pages: 3, 7, 9, 11, 15.

Evidence type: employer_Z3_and_applications.

Inputs:
- birthDateOnCertificate: "2024-05-23"
- reportedMaternityBenefitStart: "2024-05-22"
- reportedMaternityBenefitEnd: "2025-06-20"
- employmentFte: 1
- childcareLeaveReportedBeforeBirth: true

Provisional expected values:
- No safe numerical result established.

Caveat: Z-3 reports aggregate benefit period and employer's notes on return from childcare leave. Potential mismatch between start and birth dates demands review; do not infer continuous granted parental period.

Status: partially extracted, not yet an app-validated Golden Test Case. Preserve source PDF(s) until verified.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `employer_leave_approval_not_ZUS_payment`.

Relevant source PDF pages: 3, 7, 9, 11, 15, 22, 25, 27, 29.

Document findings: Employer Z-3 p3 starts reported benefits on 2024-05-22, but child birth certificate p11 says 2024-05-23. Employer approves leave in p25; ZUS award and payment unconfirmed. Date mismatch requires further reconciliation.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
