# ZUS-031: paternity_leave_paid

Source: `Jacek War_04_zas. macierzyński_urlop ojcowski.pdf`

Evidence pages: 1, 4, 8.

Inputs:
{
  "parent": "father",
  "paternityPaidStart": "2026-09-14",
  "paternityPaidEnd": "2026-09-27",
  "employmentFte": 1
}

Expected (source-limited):
{
  "paternityPaidDays": 14,
  "awardOutcome": "paid_for_period"
}

Evidence class: cover_explicit_payment_and_Z3.

Caveats: Document cover p1 explicitly says payment was made for 14–27 Sep 2026. No amount stated.

No verified PLN amount or application-engine result. Preserve PDF.
