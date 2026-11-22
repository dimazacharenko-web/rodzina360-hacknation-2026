# ZUS-062 — parental_6_weeks_application_requires_32_week_clarification

Source: `Natalia Kr_2_zas. mac. za okres urlopu rodzicielskiego.pdf`.

## Evidence pages
2, 9, 11, 14 (original PDF page numbering).

## Inputs extracted
```json
{
  "parentalClaimStart": "2026-09-20",
  "parentalClaimEnd": "2026-10-31",
  "employmentType": "self_employed",
  "ZUSRequestedClarification": [
    "32_weeks_or_9_weeks",
    "other_parent_use"
  ],
  "claimantResponse": "32_weeks_intended"
}
```

## Source-grounded expected values
```json
{
  "parentalClaimDays": 42,
  "clarificationRequired": true
}
```

## Interpretation and limitations
ZUR p2 requests only 42 days. ZUS p11 asks whether 32 or 9 weeks; POG p14 says 32 weeks. Conflicting scope vs dates not corrected. No verified payment.

Status: `ZUS_query_and_clarification_no_award`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
