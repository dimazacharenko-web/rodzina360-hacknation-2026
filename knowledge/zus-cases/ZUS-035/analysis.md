# ZUS-035: maternity_parental_conflicting_ZAM_periods

Source: `Joanna El_1_zas. macierzyński.pdf`

Evidence pages: 3, 7, 10, 16.

Inputs:
{
  "employmentCategory": "self_employed",
  "childBirthDateReported": "2026-09-13",
  "maternityClaimStart": "2026-09-20",
  "maternityClaimEnd": "2027-02-06",
  "parentalClaimStart": "2027-02-07",
  "parentalClaimEnd": "2027-09-18",
  "alternateMaternityClaimEnd": "2027-09-18"
}

Expected (source-limited):
{
  "maternityClaimDays": 140,
  "parentalClaimDays": 224
}

Evidence class: Z3b_ZAM_versions_and_insurance_request.

Caveats: Page 10 shows maternity to 6 Feb 2027 plus parental to 18 Sep; page 16 separately indicates maternity through 18 Sep 2027. Preserve competing form versions, do not infer a ZUS decision.

No verified PLN amount or application-engine result. Preserve PDF.
