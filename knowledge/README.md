# Rodzina360 knowledge base

GitHub is the source of truth; chat memory is not.

- `zus-cases/manifest.json`: complete inventory of 13 uploaded ZUS cases.
- `ZUS-XXX/case.json`: structured facts, expected results and verification statuses.
- `ZUS-XXX/analysis.md`: legal reasoning and evidence references.

## Security

The PDF files are intentionally **not included** in this archive. Even redacted files may expose personal details. Upload source PDFs only to a private repository after reviewing redaction and consent/legal basis. Use the exact listed `source_filename` to map each uploaded PDF to its case, and optionally rename to `source.pdf` inside the corresponding folder. Do not copy personally identifying data into JSON or analysis. For a public repo, use synthesized test scenarios instead of real documents.

## Verification labels

- `not_extracted`: source is present in the original set but no fact review was completed.
- `partially_extracted`: some figures were read, full ZUS outcome has not been confirmed.
- `verified`: only use after matching the extracted values to the relevant source document and checking the app output.

Never claim the five initial tests have been validated against actual ZUS decisions.

## Workflow

1. Locate the case in `manifest.json`.
2. Open private source PDF and inspect pages.
3. Enter facts and cite each page in `case.json`/`analysis.md`.
4. Compare independent calculation to the authoritative decision/payment.
5. Add runnable TypeScript tests against the real application engine.
