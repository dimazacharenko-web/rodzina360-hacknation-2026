# ZUS-015 — father_nontransferable_parental_9_weeks

Source: `Anna Ol_2_zas. mac. - 9 tygodni urlopu rodzicielskiego dla ojca.pdf` (PDF page numbering starts at 1).

Evidence pages: 3, 6, 9, 12, 15.

Evidence type: application_and_request_for_information.

Source-supported inputs:
- parent: "father"
- parentalClaimStart: "2025-03-10"
- parentalClaimEnd: "2025-05-11"
- employmentCategory: "self_employed"
- motherReceivedParentBenefit: "reported_1000_PLN_monthly_2024-02-27_to_2025-03-26"

Provisional expected results:
- parentalRequestedDays: 63

Caveat: ZUS requested KRUS insurance clarification, page 3. Mother's declared parental benefit is an assertion, not a ZUS-verified grant.

Status: partially extracted, not automatically validated against Rodzina360. Preserve original source PDF until full review.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `no_grant_or_refusal_found`.

Relevant source PDF pages: 3, 6, 9, 12, 13, 15.

Document findings: ZUS letter p3 demands KRUS insurance clarification; ZUR requests 63 days. 1000 PLN/month in a statement refers to mother's declared benefit, NOT confirmed father's payment.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
