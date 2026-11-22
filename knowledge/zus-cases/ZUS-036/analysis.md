# ZUS-036: maternity_equivalent_due_to_employer_liquidation

Source: `Joanna Łód_3_Zasiłek w wysokości zas. mac. i macierzyński z powodu likwidacji - przyznanie prawa.pdf`

Evidence pages: 1, 2, 3, 5, 8, 10, 16.

Inputs:
{
  "employmentStart": "2013-08-01",
  "employmentEnd": "2023-12-31",
  "employerLiquidationReported": true,
  "benefitEquivalentApplied": true
}

Expected (source-limited):
{
  "awardOutcome": "not_confirmed_from_displayed_decision"
}

Evidence class: ZAS55_employment_certificate_Z3_ZAM.

Caveats: Employment certificate p3 and ZAS-55 p1–2 establish context and claim. Filename mentions grant, but an explicit formal granting decision and amount must be located before marking confirmed.

No verified PLN amount or application-engine result. Preserve PDF.
