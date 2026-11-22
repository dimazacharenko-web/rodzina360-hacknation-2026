# ZUS-014 — maternity_and_parental_self_employed

Source: `Anna No_3_zas. chorobowy i macierzyński.pdf` (PDF page numbering starts at 1).

Evidence pages: 4, 7, 8, 11.

Evidence type: application_and_insurance_forms.

Source-supported inputs:
- maternityClaimStart: "2024-02-16"
- maternityClaimEnd: "2024-07-04"
- parentalClaimStart: "2024-07-05"
- parentalClaimEnd: "2025-02-13"
- insuranceStartReported: "2023-07-14"

Provisional expected results:
- maternityRequestedDays: 140
- parentalRequestedDays: 224

Caveat: Maternity and parental periods shown on ZAM, not a confirmed award. Z3a details nonemployee insurance. Document also contains request for ZUS clarification on child benefit supplement.

Status: partially extracted, not automatically validated against Rodzina360. Preserve original source PDF until full review.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `granted_and_paid_all_benefits`.

Relevant source PDF pages: 17, 18, 51, 52.

Document findings: ZUS internal resolution p52 expressly confirms entitlement and actual payments for sickness 2023-12-13..2024-02-15 and maternity/parental 2024-02-16..2025-02-13; insurance confirmed since 2023-07-14, contribution basis 235 PLN July and 940 PLN August-November 2023 (NOT paid benefit amounts).

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
