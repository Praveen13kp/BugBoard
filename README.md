# BugBoard

BugBoard is a MERN (MongoDB · Express · React · Node) issue-tracking application
with a REST API, role-based authorization, an explicit issue-status workflow, and
a polished responsive frontend. It covers reporting and tracking software issues
from creation through resolution — with projects, membership and role rules
enforced on the server, comments and activity history in context, a dashboard,
search and filtering, and list **and** Kanban views.

## Overview

- Public SaaS-style landing page at `/`.
- Authenticated app at `/dashboard`, `/issues`, `/projects`, and detail pages.
- Admin / Developer / Tester roles enforced server-side.
- Issue workflow `OPEN → IN_PROGRESS → TESTING → RESOLVED → CLOSED` (with
  rollback edges), validated on the server on every status change.
- Project-scoped access: membership defines who sees and edits what.
- Search, filters, server-side sorting and pagination.
- List view and Kanban view that move issues through the same server-validated
  workflow.

For the full API reference, database design, and design decisions, see
[Project Details](docs/PROJECT_DETAILS.md).

## Setup

### Prerequisites

- Node.js 20+ and npm.
- MongoDB — optional; you can use the in-memory MongoDB launcher instead (see below).

### Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### Run locally

#### Option 1 — In-memory MongoDB (no database to install)

The `mongodb-memory-server` launcher runs the full API against an ephemeral
database, seeds it with demo data, and requires no `.env` file:

```bash
# Terminal 1 — API + seeded in-memory DB on http://localhost:5000
cd server
npm run dev:memory

# Terminal 2 — UI on http://localhost:5173
cd client
npm run dev
```

#### Option 2 — Local / hosted MongoDB

```bash
# Terminal 1 — Server
cd server
cp .env.example .env      # set MONGODB_URI and a real JWT_SECRET
npm run seed              # optional: demo users, projects, issues, comments, activity
npm run dev               # API on http://localhost:5000

# Terminal 2 — Client
cd client
npm run dev               # UI on http://localhost:5173
```

Vite proxies `/api` to the server in development, so no CORS configuration is
needed locally. `CLIENT_ORIGIN` controls the API's CORS allow-list.

## Environment Variables

`server/.env.example`:

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret; required in production (dev/test fallback exists) |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |
| `CLIENT_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |
| `UPLOAD_DIR` | Local attachment directory (default `uploads`; keep it outside version control) |

`client/.env.example`:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL used by the client (default `/api`, proxied in dev) |

## Sample Login Details

`npm run seed` (or the `dev:memory` launcher) idempotently creates demo users,
projects, issues, comments, and activity history. Every demo account uses the
password `Password123!` (override with `SEED_PASSWORD`).

| Role | Name | Email |
| --- | --- | --- |
| ADMIN | Ada Admin | admin@bugboard.dev |
| DEVELOPER | Leo Lead | lead@bugboard.dev |
| DEVELOPER | Dana Dev | dev@bugboard.dev |
| TESTER | Tina Tester | tester@bugboard.dev |

The seed also creates the Web Platform (`WEB`), Mobile App (`MOB`), and Payments
API (`PAY`) projects with issues in every status so the dashboard, workflow, and
role behavior can be reviewed immediately. Rerunning the seed adds nothing new.