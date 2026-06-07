# Travel App Monorepo

This repository is organized as a reviewable full-stack travel app workspace.

It contains:

- a production-oriented frontend app in `_review_chai_travel_ui/`
- a working backend service in `ocr-service/`
- supporting product and integration documents in `docs/`
- archived prototypes and snapshots in `archive/`
- external reference material in `third_party/`
- local sample files for upload testing in `mock_pics/`

## Repository Structure

```text
dy-hackathon/
├─ _review_chai_travel_ui/   # primary frontend app
├─ ocr-service/             # primary backend service
├─ docs/                    # delivery, integration, and product docs
├─ archive/                 # deprecated prototypes and zip snapshots
├─ third_party/             # external reference resources
├─ mock_pics/               # local upload test samples
└─ API_keys.md              # local developer key source, do not commit secrets
```

## Canonical Applications

### Frontend

- Path: `_review_chai_travel_ui/`
- Stack: React 19, TypeScript, Vite, Tailwind CSS 4
- Purpose: business delivery frontend connected to the live backend API

### Backend

- Path: `ocr-service/`
- Stack: FastAPI, SQLAlchemy, MySQL, Tesseract OCR, DeepSeek
- Purpose: upload, OCR extraction, structuring, deduplication, warning matching, export

## Archived Resources

The `archive/` directory keeps non-primary materials for traceability:

- earlier frontend prototype branches
- H5 demo prototypes
- zip snapshots

These are preserved for reference and should not be treated as the main delivery target.

## Documents

Project and delivery documents are grouped under `docs/`:

- frontend delivery requirements
- frontend development spec
- frontend integration delivery
- frontend/backend integration plan
- product and page-planning documents
- internal test report

## Local Setup

### Frontend

```bash
cd _review_chai_travel_ui
npm install
npm run dev
```

### Backend

```powershell
cd ocr-service
python -m venv .venv
.\.venv\Scripts\python -m pip install -e .[dev]
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```

## Review Notes

- Generated artifacts such as `node_modules`, `dist`, `.vite`, logs, and runtime uploads should not be committed.
- Root-level structure is intentionally kept stable so the backend can continue reading `API_keys.md` and local test assets without code changes.
