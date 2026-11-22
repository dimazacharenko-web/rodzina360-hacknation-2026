# ZUS-051 — maternity_equivalent_after_employer_liquidation_granted

Source: `Katarzyna Łó 4_zasiłek w wysokości zasiłku macierzyńskiego.pdf`.

## Evidence pages
2, 3, 6, 8, 13 (original PDF page numbering).

## Inputs extracted
```json
{
  "employmentStart": "2020-03-01",
  "employmentEnd": "2026-09-30",
  "expectedDeliveryDate": "2026-10-21",
  "maternityEquivalentClaimStart": "2026-10-01",
  "awardStart": "2026-10-01",
  "awardEnd": "2026-10-21"
}
```

## Source-grounded expected values
```json
{
  "awardRecorded": true,
  "documentedAwardDays": 21
}
```

## Interpretation and limitations
ZAS-55 requests benefit equivalent to maternity allowance; internal ZUS note p13 explicitly grants benefit 01–21.10.2026. This is not proof of actual transfer or monetary amount.

Status: `decision_period_confirmed_amount_unknown`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
