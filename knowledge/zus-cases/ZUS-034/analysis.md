# ZUS-034: maternity_parental_1000_pln_topup_request

Source: `Janina Poz_2_zas. macierzyński, podwyższenie kwoty zasiłku.pdf`

Evidence pages: 2, 5, 10, 12, 13.

Inputs:
{
  "employmentCategory": "self_employed",
  "maternityClaimStart": "2024-01-23",
  "maternityClaimEnd": "2024-06-10",
  "parentalClaimStart": "2024-06-11",
  "parentalClaimEnd": "2025-01-20",
  "requestedMinimumTopUpPLNMonthly": 1000
}

Expected (source-limited):
{
  "maternityClaimDays": 140,
  "parentalClaimDays": 224,
  "topUpAwardOutcome": "not_confirmed"
}

Evidence class: Z3b_ZAM_and_claimant_topup_request.

Caveats: POG p12 requests topping up allowance to 1000 PLN monthly. Do not assert award of 1000 PLN; that figure is requested statutory threshold, not an observed payout.

No verified PLN amount or application-engine result. Preserve PDF.
