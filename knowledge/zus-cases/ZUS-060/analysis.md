# ZUS-060 — supplementary_maternity_neonatal_hospitalization_date_conflict

Source: `Natalia Chrz_4_za. mac. za okres urlopu macierzyńskiego, uzupełniającego, rodzicielskiego.pdf`.

## Evidence pages
3, 6, 13, 16, 17 (original PDF page numbering).

## Inputs extracted
```json
{
  "childBirthDate": "2025-11-27",
  "maternityStart": "2025-11-27",
  "maternityEnd": "2026-04-15",
  "supplementaryStart": "2026-04-16",
  "supplementaryEnd": "2026-04-29",
  "parentalStart": "2026-04-30",
  "parentalEnd": "2026-12-09",
  "Z3bAggregateEnd": "2026-11-25",
  "childHospitalized": true
}
```

## Source-grounded expected values
```json
{
  "maternityDays": 140,
  "supplementaryRequestedDays": 14,
  "parentalRequestedDays": 224,
  "dateInconsistency": true
}
```

## Interpretation and limitations
Revised ZAM p16 shows three blocks 140+14+224=378 days; Z-3b p3 shows initial aggregate end 25.11.2026 (364 days). Neonatal certificate p13 documents 36-week birth and hospitalization. Preserve version discrepancy; no final ZUS award checked.

Status: `document_date_conflict_requires_review`. Exact monetary amount and end-to-end Rodzina360 comparison not confirmed. Original PDF retained.
