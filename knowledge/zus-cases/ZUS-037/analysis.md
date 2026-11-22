# ZUS-037: self_employed_sickness_and_maternity_paid

Source: `Joanna Rze_2_zas. chorobowy i macierzyński.pdf`

Evidence pages: 1, 2, 9, 10, 11, 15.

Inputs:
{
  "employmentCategory": "self_employed",
  "sicknessClaimIntervals": [
    [
      "2026-02-02",
      "2026-02-11"
    ],
    [
      "2026-02-12",
      "2026-04-22"
    ],
    [
      "2026-04-23",
      "2026-04-27"
    ]
  ],
  "maternityClaimStart": "2026-04-28",
  "maternityClaimEnd": "2027-04-26"
}

Expected (source-limited):
{
  "sicknessClaimDays": [
    10,
    70,
    5
  ],
  "maternityClaimDays": 364,
  "awardOutcome": "granted_and_paid_as_case_cover"
}

Evidence class: cover_Z3b_and_insurance_review.

Caveats: Cover p1 says entitlement established and payment carried out. Z-3b shows sickness and maternity intervals. A contributions debt flag exists in ZUS insurance record; do not equate it with an automatic refusal. No benefit payment PLN amounts present.

No verified PLN amount or application-engine result. Preserve PDF.
