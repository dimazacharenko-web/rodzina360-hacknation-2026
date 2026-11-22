# ZUS-058 — maternity_denial_commission_contract_no_voluntary_sickness_insurance

Source: `Małgorzata Rze_3_zas. macierzyński_umowa zlecenie bez chorobowego_odmowa.pdf`.

## Evidence pages
1, 2, 10, 16, 17 (original PDF page numbering).

## Inputs extracted
```json
{
  "employmentType": "umowa_zlecenie",
  "maternityClaimStart": "2025-08-24",
  "maternityClaimEnd": "2026-01-10",
  "voluntarySicknessInsuranceRegistered": false
}
```

## Source-grounded expected values
```json
{
  "maternityClaimDays": 140,
  "coverageRisk": "missing_voluntary_sickness_insurance",
  "denialIndicatedInCaseHeader": true
}
```

## Interpretation and limitations
ZUS insurance response p17 explicitly notes 'brak zgłoszenia do dobrowolnego ubezpieczenia chorobowego'. Cover describes refusal. Do not claim a full written refusal was present or infer paid amount.

Status: `insurance_nonregistration_confirmed_denial_header_only`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
