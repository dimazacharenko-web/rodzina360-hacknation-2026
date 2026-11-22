# ZUS-032: father_parental_partial_period_granted

Source: `Jan Łó 2_zasiłek macierzyński u. rodz..pdf`

Evidence pages: 2, 5, 7, 8, 9, 11.

Inputs:
{
  "parent": "father",
  "parentalClaimStart": "2026-06-26",
  "parentalClaimEnd": "2026-08-10",
  "childBirthDate": "2026-04-17"
}

Expected (source-limited):
{
  "parentalClaimDays": 46,
  "awardOutcome": "granted_as_recorded"
}

Evidence class: ZUR_ZUS_insurance_and_internal_grant_note.

Caveats: ZUR p2 requests 46 days, while internal ZUS note p11 says '9 tygodniowy został przyznany'. This is a substantive mismatch; no exact award period or PLN amount established by the note.

No verified PLN amount or application-engine result. Preserve PDF.
