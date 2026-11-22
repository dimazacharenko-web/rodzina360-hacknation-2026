# ZUS-027: maternity_denial_not_insured_on_birth

Source: `Ewa Łód_5_zas. macierzyński - odmowa - nie podlega ubezp. chorobowemu na dzień porodu.pdf`

Evidence pages: 1, 3, 5, 7.

Inputs:
{
  "birthDate": "2025-06-12",
  "maternityClaimStart": "2025-06-12",
  "maternityClaimEnd": "2026-06-10",
  "lastCoverageDateReported": "2024-10-04"
}

Expected (source-limited):
{
  "benefitEntitlement": "denied",
  "denialReason": "no_sickness_insurance_on_birth_date",
  "claimedCalendarDays": 364
}

Evidence class: formal_ZUS_denial_decision.

Caveats: Formal decision p1 refuses maternity benefit 12 Jun 2025–10 Jun 2026 because claimant was not sickness-insured on birth date. No payment amount stated.

No verified PLN amount or application-engine result. Preserve PDF.
