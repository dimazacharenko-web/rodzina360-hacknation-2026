# ZUS-022 — paternity_leave_paid

Sources:
- `Dariusz Go_3_zas. mac. za okres urlopu ojcowskiego.pdf`
- `Dariusz Go_3_zas. mac. za okres urlopu ojcowskiego (1).pdf`

Evidence pages: 1, 3, 4, 7, 9.

Evidence type: cover_explicitly_paid_Z3_ZAO.

Inputs:
- parent: "father"
- paternityPaidStart: "2026-05-11"
- paternityPaidEnd: "2026-05-17"
- childBirthDateReported: "2025-05-07"

Provisional expected values:
- paternityPaidDays: 7
- award: "paid"

Caveat: Cover page explicitly states payment for 11–17 May 2026. PDF with suffix (1) is duplicate-looking alternate source, not another independent test case.

Status: partially extracted, not yet an app-validated Golden Test Case. Preserve source PDF(s) until verified.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `payment_confirmed_for_period`.

Relevant source PDF pages: 1, 3, 4, 7, 9.

Document findings: Cover p1 explicitly reports paid paternity benefit 2026-05-11..2026-05-17, 7 days; amount absent. Two source PDFs are byte-identical, SHA256 28d15681986c0ca355c187e0883a510e5479385d8aededbeba272c9eda6ef2b2.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
