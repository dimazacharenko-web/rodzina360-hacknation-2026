# ZUS-024 — maternity_equivalent_end_of_employment_during_pregnancy

Sources:
- `Dorota Wa I_3_zasiłek w wysokości zasiłku macierzyńskiego.pdf`

Evidence pages: 3, 7, 9, 10, 13, 17.

Evidence type: Z3_ZAS55_employer_note.

Inputs:
- employmentStart: "2025-02-01"
- employmentEnd: "2026-08-31"
- employmentFteOnLatestContract: 0.333
- claimBenefitFrom: "2026-09-01"
- pregnancyDuringNoticeReported: true
- employmentTerminationReasonReported: "employer_liquidation"

Provisional expected values:
- No safe numerical result established.

Caveat: Claim under ZAS-55 starts 1 Sep 2026; Z3 reports employment end and a change of FTE. Actual entitlement needs documentary confirmation, do not treat application as award.

Status: partially extracted, not yet an app-validated Golden Test Case. Preserve source PDF(s) until verified.

## Final documentary audit — 2026-11-21

Full source scan visually reviewed. Documentary outcome: `no_grant_or_refusal_found`.

Relevant source PDF pages: 3, 5, 7, 9, 10, 13, 17, 18, 19.

Document findings: Z-3 p3 shows employment ended 2026-08-31, ZAS-55 requests benefit-equivalent from 2026-09-01. No ZUS awarding or refusal decision or payment value confirmed.

Monetary outcome: actual benefit transferred in PLN is **not documented**. Do not substitute a wage, social-insurance contribution base, or asserted monthly family benefit.

Application-engine outcome: **not tested**. The fixture is not a verified financial Golden Test Case. Preserve the PDF for traceability.
