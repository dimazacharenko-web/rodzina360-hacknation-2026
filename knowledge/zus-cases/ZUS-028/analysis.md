# ZUS-028: stillbirth_maternity_paid

Source: `Ewa No_2_zas. macierzyński.pdf`

Evidence pages: 3, 9, 11, 15, 16.

Inputs:
{
  "event": "stillbirth",
  "stillbirthDate": "2024-04-17",
  "maternityReportedStart": "2024-04-17",
  "maternityReportedEnd": "2024-06-11",
  "employmentFte": 0.25
}

Expected (source-limited):
{
  "maternityReportedDays": 56,
  "awardOutcome": "granted_and_paid_reported"
}

Evidence class: Z3_registry_and_ZUS_case_resolution.

Caveats: Birth registry p9/11 confirms stillbirth. Z-3 shows 56 days. Internal ZUS case resolution at p16 states right established and payment made; no disbursed PLN sum.

No verified PLN amount or application-engine result. Preserve PDF.
