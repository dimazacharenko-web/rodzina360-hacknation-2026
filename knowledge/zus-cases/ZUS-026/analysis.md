# ZUS-026: stillbirth_maternity_period_anomaly

Source: `Ewa Łó 6_zas. macierzyński.pdf`

Evidence pages: 2, 9, 11, 13, 15, 16.

Inputs:
{
  "event": "stillbirth",
  "stillbirthDate": "2026-02-21",
  "maternityRequestedStart": "2026-02-21",
  "maternityRequestedEnd": "2026-04-18",
  "employmentCategory": "self_employed"
}

Expected (source-limited):
{
  "maternityRequestedCalendarDays": 57
}

Evidence class: application_and_medical_certificate.

Caveats: ZAM and Z-3b show 21 Feb–18 Apr (57 inclusive days), whereas an 8-week period would be 56 days. Do not silently repair this apparent inconsistency; exact last digit must be reviewed from high-resolution scan. Insurance contributions are NOT payout amounts.

No verified PLN amount or application-engine result. Preserve PDF.
