# ZUS-021 — sickness_denial_lack_of_insurance

Sources:
- `Dagmara Chrz_2_odmowa prawa do zasiłku chorobowego w ciąży_brak ubezpieczenia.pdf`

Evidence pages: 1, 2, 3, 11, 13.

Evidence type: case_header_Z3_and_ZUS_insurance_reply.

Inputs:
- sickLeaveClaimStart: "2026-02-27"
- sickLeaveClaimEnd: "2026-03-27"
- employmentStartReported: "2025-10-01"
- employerReportedSickPayStart: "2026-02-03"
- employerReportedSickPayEnd: "2026-02-28"
- insuranceEligibilityDisputed: true

Provisional expected values:
- sickLeaveClaimDays: 29
- decisionCategory: "denial_insurance_status"

Caveat: The case heading explicitly describes refusal owing to non-coverage. ZUS's insurance investigation page 13 supports contested insurance; exact decision's legal reasoning should still be checked.

Status: partially extracted, not yet an app-validated Golden Test Case. Preserve source PDF(s) until verified.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `insurance_exclusion_decision_confirmed_benefit_refusal_in_case_header_only`.

Relevant source PDF pages: 1, 2, 3, 9, 10, 11, 13.

Document findings: ZUS insurance response p13 states decision dated 2026-05-11 finding no employee social/sickness insurance since 2025-10-01. Cover p1 labels claim refused; separate full written sickness denial not provided.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
