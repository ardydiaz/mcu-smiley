# Project Smiley Face API

Node.js 22+ / Express 5 / MySQL 8.0+ backend. Uses ES modules and the requested controller, model, route, middleware, service, validation, config and utility structure.

## Setup

1. Run `npm install` in this folder (use `npm.cmd` in PowerShell if execution policy blocks npm).
2. Copy `.env.example` to `.env` if it does not exist. Set your MySQL connection details and a random JWT_SECRET. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. The included local .env starts with an empty secret and must be configured. Never commit .env.
3. Start MySQL, then run `npm run db:migrate` or `npm run db:init`. This creates the database, the `migrations` tracking table, the Project Smiley Face tables and five rating choices. Existing data is preserved. The setup account needs CREATE privileges; use a restricted runtime database account for deployment.
4. Create an administrator using the environment variables below.
5. Run `npm run dev` for watch mode or `npm start`. The API listens on http://localhost:5000. Startup checks the database connection.

PowerShell administrator setup:

```powershell
$env:ADMIN_NAME = "Administrator"
$env:ADMIN_EMAIL = "admin@example.com"
$adminCredential = Get-Credential -UserName "admin@example.com" -Message "Choose an admin password (at least 12 characters)"
$env:ADMIN_PASSWORD = $adminCredential.GetNetworkCredential().Password
npm.cmd run admin:create
Remove-Item Env:ADMIN_PASSWORD
$adminCredential = $null
```

There is no public registration endpoint. Passwords use bcrypt; the maximum is 72 UTF-8 bytes. Admin creation does not overwrite an existing account.

## Endpoints

All paths begin with `/api`. Admin requests require `Authorization: Bearer <token>`.

Swagger UI is available at `http://localhost:<PORT>/api/docs` after the backend starts. The raw OpenAPI document is available at `http://localhost:<PORT>/api/docs.json`. To test protected endpoints in Swagger, run `/auth/login`, copy `data.token`, click **Authorize**, and paste the token as the bearer value.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | /health | Public | Process health |
| GET | /ready | Public | Database readiness |
| POST | /auth/register | Public for first admin | Create an API admin account |
| POST | /auth/login | Public, rate limited | Email and password login |
| GET | /auth/me | Authenticated | Current API account |
| GET | /ratings | Public | Active smiley choices, highest score first |
| GET | /departments | Public | Active departments |
| GET | /departments/all | Admin | All departments including inactive |
| POST | /departments | Admin | Create department |
| PUT | /departments/:id | Admin | Replace department fields |
| DELETE | /departments/:id | Admin | Deactivate department; preserve vote history |
| POST | /votes | Public, rate limited | Submit a vote |
| GET | /votes | Admin | Paginated feedback |
| GET | /dashboard | Admin | Totals, average, satisfaction, rating/department/day breakdowns |
| GET | /reports | Admin | Paginated vote report |
| GET | /reports/csv | Admin | Export the requested report page as CSV |

Login body:

```json
{ "email": "admin@example.com", "password": "your-admin-password" }
```

Register body:

```json
{ "name": "ITD Admin", "email": "itd-admin@mcu.edu.ph", "password": "!mcu9922@***2026" }
```

Registration creates an `admin` account in the `users` table and stores the password as a bcrypt hash. Registration is open only while there are no admin accounts. Set `ALLOW_ADMIN_REGISTRATION=true` in `.env` if you want to allow creating more admin accounts through the API during development.

Protected admin endpoints require the JWT returned by login:

```http
Authorization: Bearer <token>
```

Department POST/PUT body:

```json
{ "code": "STUDENT_SERVICES", "name": "Student Services", "description": "Student assistance", "status": "active" }
```

Vote body (use IDs returned by the public endpoints):

```json
{ "ratingId": 1, "departmentId": 1, "serviceId": 1, "feedback": "Friendly service!" }
```

Optional `serviceId` must belong to the selected department. Optional `locationId` and `terminalId` can be attached to a vote; when both are present, the terminal must belong to that location. Service, location and terminal models are provided; configure records directly in MySQL or through those models. Dedicated service/location/terminal HTTP routes are outside this structure.

Votes require active ratings and departments. Submission uses a transaction and shared locks to prevent status changes during insertion. Free-text feedback is optional and limited to 2,000 characters. No voter personal information is required.

## Reports and dashboard

Supported query parameters: `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `departmentId`, `serviceId`, `locationId`, `terminalId`, `page` (default 1), `limit` (default 25, maximum 100). Dates are inclusive UTC calendar dates. Dashboard aggregates use filters, but ignore pagination. Satisfaction is the percentage of votes with values 4 or 5. Rating and department breakdowns contain groups with matching votes.

CSV exports contain **one page**, matching the JSON report. `X-Total-Count` reports the full matching count; increment page to retrieve additional pages. CSV cells are escaped and spreadsheet formulas neutralized. Render feedback as text in the frontend.

Successful JSON responses use `{ success: true, message, data }`; errors use `{ success: false, message }` with field-level `errors` for validation failures.

## Development and deployment

Run `npm test` for HTTP authentication/validation, transaction behavior and CSV checks. Tests use database doubles where needed and do not require MySQL. Run database initialization and exercise login, department creation, voting and reports against a configured MySQL server for integration verification.

CORS permits the configured frontend origin. Login is limited to 10 attempts per IP per 15 minutes; votes to 60 per IP per minute. These in-memory limits are shared by clients behind the same IP and reset on restart. Configure a shared limiter store for multiple server instances. Configure Express trust proxy only for a known deployment proxy.

Use HTTPS in deployment. Tokens expire after JWT_EXPIRES_IN (default 8 hours); logout is client-side token removal. Disabling an administrator blocks subsequent requests. Public voting supports anonymous kiosk feedback; it does not enforce one vote per person or authenticate terminals.

Dependencies are pinned by package-lock.json after installation. Add future database changes as ordered `.sql` files in `database/migrations`; `npm run db:migrate` applies each file once and records it in the `migrations` table.

References: [Express error handling](https://expressjs.com/en/guide/error-handling/) and [MySQL2 documentation](https://sidorares.github.io/node-mysql2/docs).
