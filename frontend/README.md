Frontend (Next.js) for Form Job Application iware

Quick start:

1. cd frontend
2. npm install
3. npm run dev

By default the frontend expects backend at http://localhost:4000, change by setting `NEXT_PUBLIC_API_URL`.

Pages:
- `/` : applicant form
- `/admin` : admin dashboard (list + download CSV/PDF)

Notes:
- The frontend posts JSON to `POST /applications` matching backend schema.
- For PDF output exact layout matching the provided PDF, backend-side PDF template adjustment may be needed.
