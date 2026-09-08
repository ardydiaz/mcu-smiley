# Project Smiley Face Frontend

React frontend for the kiosk voting flow and admin dashboard.

## Setup

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and calls the backend configured by `VITE_API_BASE_URL`.

For kiosk tablets, open `/kiosk/setup` once on each tablet and select its terminal. The choice is saved in that tablet browser and every vote will send that terminal code to the backend. Leave `VITE_TERMINAL_CODE` blank for shared builds used by many tablets; use it only as an optional fallback for a fixed single-tablet build.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Kiosk smiley rating |
| `/kiosk/setup` | Select and save the terminal for this tablet |
| `/kiosk/smiley` | Kiosk smiley rating |
| `/kiosk/user-type` | Voter type selection |
| `/kiosk/feedback` | Feedback form |
| `/kiosk/thank-you` | Thank you and auto reset |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin dashboard |
| `/admin/departments` | Department management |
| `/admin/locations` | Location management |
| `/admin/terminals` | Terminal management |
| `/admin/terminal-departments` | Assign terminals to departments |
| `/admin/feedback` | Feedback list |
| `/admin/reports` | Reports and CSV export |
