# ResumeScannerAI

A local-first resume screening and ATS analysis demo built with React + Vite and FastAPI.

## What it does

- Upload one resume as a job seeker and get ATS compatibility, role-match scoring, detected skills, strengths, and improvement suggestions.
- Upload multiple resumes as a recruiter and rank candidates for a selected role.
- Optionally paste a job description for skill-match analysis.
- Stores recent scan history in the browser with `localStorage`.
- Runs fully on your laptop. Supabase is not required.

## Tech stack

- Frontend: React 19, Vite, React Router, Lucide
- Backend: FastAPI, pdfplumber, python-docx
- Storage: local filesystem for temporary uploads + browser localStorage for scan history
- Supported resume formats: PDF and DOCX

## Run locally

### Fastest way

```bash
chmod +x start.sh
./start.sh
```

Then open:

- App: http://localhost:5173
- FastAPI docs: http://127.0.0.1:8000/docs

The first run creates `backend/.venv` and installs dependencies.

### Manual setup

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Frontend in a second terminal:

```bash
npm install
npm run dev
```

## Interview demo flow

1. Open the app and choose Job Seeker.
2. Select a target role.
3. Upload a PDF or DOCX resume.
4. Optionally paste a job description.
5. Run analysis and explain that the backend extracts text, detects skills/contact/education/experience signals, computes role matching and ATS metrics, and returns structured JSON to React.
6. Then show Recruiter mode with multiple resumes to demonstrate ranking and cohort analytics.

## Architecture

```text
React/Vite UI
    |
    | multipart/form-data
    v
FastAPI /upload
    |
    +--> PDF/DOCX text extraction
    +--> resume parsing
    +--> skill + role matching
    +--> ATS scoring
    +--> optional JD matching
    |
    v
Structured JSON results
    |
    v
React result/ranking dashboards
```

## Important

This repository is configured as a local interview/demo application. It does not depend on Supabase, authentication, or a hosted database.
