# ZUS-033: paternity_leave_granted

Source: `Jan Zie_5_zas. macierzyński_urlop ojcowski.pdf`

Evidence pages: 1, 5, 12, 15.

Inputs:
{
  "parent": "father",
  "paternityClaimStart": "2026-08-31",
  "paternityClaimEnd": "2026-09-06",
  "childBirthDate": "2026-05-07"
}

Expected (source-limited):
{
  "paternityClaimDays": 7,
  "awardOutcome": "right_granted_as_internal_note"
}

Evidence class: Z3_ZAO_internal_grant_note.

Caveats: Internal note p1 states 'przyznano prawo do zasiłku macierzyńskiego'; Z-3 and ZAO show seven days. Exact payment amount absent.

No verified PLN amount or application-engine result. Preserve PDF.
