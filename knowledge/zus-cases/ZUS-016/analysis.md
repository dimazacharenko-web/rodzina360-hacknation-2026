# ZUS-016 — maternity_stillbirth

Source: `Anna Ra_1_zas. mac. za urlop macierzyński rodzicielski.pdf` (PDF page numbering starts at 1).

Evidence pages: 2, 10, 13, 19.

Evidence type: application_and_registry_and_decision_listing.

Source-supported inputs:
- stillbirthDocumented: true
- childStillbirthDate: "2025-05-12"
- maternityClaimStart: "2025-05-12"
- maternityClaimEnd: "2025-07-06"
- employmentCategory: "self_employed"

Provisional expected results:
- maternityRequestedDays: 56

Caveat: Stillbirth documented by civil registry page 13. ZUS listing at page 19 labels grant of maternity benefit, but actual amount is not readable here.

Status: partially extracted, not automatically validated against Rodzina360. Preserve original source PDF until full review.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `grant_referenced_in_ZUS_register_no_full_decision`.

Relevant source PDF pages: 2, 10, 13, 19.

Document findings: Stillbirth confirmed in civil registry p13. ZUS internal list p19 labels 'Decyzja przyznająca zas. macierzyński'. Neither payout nor full award reasoning found.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
