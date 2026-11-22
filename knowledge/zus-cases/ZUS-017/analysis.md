# ZUS-017 — maternity_stillbirth_paid

Source: `Anna War_01_zas. macierzyński, martwe urodzenie.pdf` (PDF page numbering starts at 1).

Evidence pages: 1, 7, 8.

Evidence type: cover_explicit_payment_and_Z3.

Source-supported inputs:
- stillbirthContext: true
- maternityPaidStart: "2026-09-14"
- maternityPaidEnd: "2026-11-08"
- employmentStart: "2024-06-01"
- employmentEnded: "2025-09-08"

Provisional expected results:
- maternityPaidDays: 56
- award: "paid"

Caveat: Page 1 explicitly states payment was made; page 7 Z3 shows period. Amount not available.

Status: partially extracted, not automatically validated against Rodzina360. Preserve original source PDF until full review.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `payment_confirmed_for_period`.

Relevant source PDF pages: 1, 7, 8.

Document findings: Cover p1 explicitly says paid maternity benefit for 2026-09-14..2026-11-08, 56 calendar days. Z-3 agrees; no PLN amount.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
