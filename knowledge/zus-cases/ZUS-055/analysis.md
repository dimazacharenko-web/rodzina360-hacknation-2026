# ZUS-055 — maternity_parental_claim_missing_Z3_ZAM

Source: `Krystyna Łód - zas. macierzyński_urlop macierzyński i rodzicielski - prawo do zasiłku.pdf`.

## Evidence pages
1, 5, 7, 10 (original PDF page numbering).

## Inputs extracted
```json
{
  "maternityLeaveStart": "2026-03-01",
  "maternityLeaveEnd": "2026-07-18",
  "parentalLeaveStart": "2026-07-19",
  "parentalLeaveEnd": "2027-02-27",
  "ZUSRequestedDocuments": [
    "Z-3",
    "ZAM"
  ],
  "deadlineForAdditionalDocuments": "2026-04-10"
}
```

## Source-grounded expected values
```json
{
  "maternityLeaveDays": 140,
  "parentalLeaveDays": 224,
  "risk": "missing_documents"
}
```

## Interpretation and limitations
Employer leave request p1 confirms dates; ZUS p5 and p7 requests Z-3 and ZAM, warning refusal if not submitted. No ZUS benefit grant established.

Status: `employer_leave_and_document_request_no_award`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
