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
- Comments and an activity timeline on each issue.
- Project-scoped access: membership defines who sees and edits what.
- Search, filters, server-side sorting and pagination.
- List view and drag-free Kanban view that moves issues through the same
  server-validated workflow.
- Covered by automated suites: server API tests, client policy/util tests,
  a syntax check, and a production client build.

## Features

- **Issue & Bug Tracking** — report and manage issues from creation through resolution.
- **Project Management** — organize issues by project and control membership.
- **Role-Based Access** — Admin, Developer and Tester permissions enforced by the backend.
- **Structured Workflow** — server-validated status transitions with rollback rules.
- **Search & Filters** — filter by project, status, priority, severity, reporter, assignee; full-text search on title/description.
- **Sorting & Pagination** — server-side sort (recent, newest, oldest, priority, severity) and paged listing.
- **Comments & Activity** — discussion and an activity timeline in issue context.
- **Dashboard Insights** — issue statistics plus issues assigned to the current user.
- **Kanban View** — board-style columns that call the real status API.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Axios, Vite 6 |
| Backend | Node.js, Express 5, Mongoose 8 |
| Data | MongoDB |
| Auth | bcryptjs password hashing, JWT (stateless bearer tokens) |
| Tests | Node built-in test runner, `supertest`, `mongodb-memory-server` |

## Architecture

```
client/   React SPA (Vite)           → http://localhost:5173
server/   Express REST API (ESM)     → http://localhost:5000/api
docs/screenshots/  Captured UI screenshots used by this README
```

- The client talks to the API through a shared Axios client
  (`client/src/api/httpClient.js`) that attaches the JWT and redirects on 401.
- API code is layered as `routes → controllers → services → models`, with
  validators and a centralized error handler producing one response contract.
- Routing is defined in `client/src/routes/AppRoutes.jsx`: `/` is the public
  landing page; `/login` and `/register` are guest-only; everything else lives
  inside the authenticated `AppLayout`.

```
/            → public BugBoard landing page
/login       → sign in (redirects signed-in users)
/register    → create a Developer or Tester account (redirects signed-in users)
/dashboard   → statistics + assigned issues
/issues      → list or Kanban view with search, filters, sort, pagination
/issues/:id  → issue detail with workflow, comments, activity
/projects    → project grid
/projects/:id → project detail with members and issues
/create-issue → create an issue
```

## Authentication & Authorization

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` use
  bcryptjs password hashing and signed, expiring JWT bearer tokens.
- Password hashes are never selected or returned by default.
- Public registration creates **Developer** and **Tester** accounts only;
  administrators are provisioned through the seed script or directly in the DB.
- Authorization is enforced on the server for every protected action; the UI
  mirrors the policy only to hide actions that would be rejected.

## Roles

| Action | ADMIN | DEVELOPER (member) | TESTER (member) |
| --- | --- | --- | --- |
| Create/update projects, manage members | Yes | — | — |
| View projects and issues | All | Their projects | Their projects |
| Report issues | Any project | Their projects | Their projects |
| Assign / reassign issues | Yes | Yes | — |
| Edit issue details | Yes | Yes | Issues they reported |
| Transition issue status | Yes | Yes | Issues they reported or are assigned to |
| Comment on issues | Yes | Yes | Yes |
| List users | Yes | — | — |

## Project Management

- Projects have a name, unique key, description, members, and a creator.
- Project-level access: users only see projects they belong to (admins see all),
  and this check applies on every project and issue route.
- Membership is managed by administrators via
  `POST /projects/:projectId/members` and `DELETE /projects/:projectId/members/:userId`.

## Issue Workflow

Statuses: `OPEN → IN_PROGRESS → TESTING → RESOLVED → CLOSED`, with two rollback
edges. `CLOSED` is terminal.

```
OPEN ────▶ IN_PROGRESS ────▶ TESTING ────▶ RESOLVED ────▶ CLOSED
                  ▲             │ ▲                     │
                  └─────────────┘ └─────────────────────┘
                  (IN_PROGRESS)     (IN_PROGRESS)
```

- Every transition is validated on the server and rejected with
  `INVALID_STATUS_TRANSITION` when the edge is not allowed.
- The current status includes its allowed next statuses in API responses
  (`allowedStatusTransitions`), so the UI only offers legal moves.
- The Kanban view moves issues only through these allowed transitions, calling
  the real status endpoint.
- Transitions, creation, assignment, and field edits all append an entry to the
  issue's activity history.

## Search & Filtering

`GET /api/issues` supports:

- `search` — case-insensitive match on title and description.
- `project`, `status`, `priority`, `severity`, `reporter`, `assignee`.

Results are always scoped to projects the caller can access.

## Sorting & Pagination

- `sort` — one of `newest`, `oldest`, `updated`, `priority`, `severity`.
  Sort keys are whitelisted server-side; arbitrary sort strings are never passed
  to MongoDB. Priority/severity use precomputed numeric ranks.
- `page` + `limit` — paged results with `pagination` metadata
  (`{ page, limit, total, totalPages }`); `limit` is capped at 100.
- Omitting `page`/`limit` preserves the original behavior of returning the full
  filtered result set (`pagination` is `null`).

## Comments & Activity

- **Comments**: members of an issue's project can list and add comments; each
  comment records its author and timestamps (newest first).
- **Activity**: an `Activity` record is created for issue creation and for
  status, assignee, severity, and priority changes. `GET /api/issues/:issueId/activity`
  returns the timeline with actor population and access checks.
- The issue detail page renders both the comment list/form and the activity timeline.

## Dashboard

- `GET /api/dashboard` returns access-scoped statistics: total, open,
  in-progress, testing, resolved, closed, critical, and issues assigned to the
  caller.
- The client dashboard shows the statistic cards and an **Assigned to you**
  panel with loading, empty, error, and retry states — failures are surfaced,
  never silently swallowed.

## API Overview

All routes are under `/api`. Every route except `/health`, `/auth/register`,
and `/auth/login` requires an `Authorization: Bearer <token>` header. Responses
use `{ "success": true, "data": { ... } }`; errors use
`{ "success": false, "error": { "code", "message" } }`.

| Area | Method | Path | Access | Description |
| --- | --- | --- | --- | --- |
| Health | GET | `/health` | public | Service liveness check |
| Auth | POST | `/auth/register` | public | Register a Developer or Tester |
| Auth | POST | `/auth/login` | public | Login, returns JWT and user |
| Auth | GET | `/auth/me` | any authenticated | Current user profile |
| Dashboard | GET | `/dashboard` | any authenticated | Access-scoped issue statistics |
| Projects | GET | `/projects` | any authenticated | Projects the caller can access |
| Projects | POST | `/projects` | ADMIN | Create a project |
| Projects | GET | `/projects/:projectId` | member | Project detail with members |
| Projects | PATCH | `/projects/:projectId` | ADMIN | Update name/key/description |
| Projects | POST | `/projects/:projectId/members` | ADMIN | Add users to a project |
| Projects | DELETE | `/projects/:projectId/members/:userId` | ADMIN | Remove a user from a project |
| Users | GET | `/users` | ADMIN | List all users |
| Issues | GET | `/issues` | member | List issues; search/filters/sort/pagination |
| Issues | POST | `/issues` | member | Create an issue (reporter is automatic) |
| Issues | GET | `/issues/:issueId` | member | Issue detail |
| Issues | PATCH | `/issues/:issueId` | role | Edit title/description/severity/priority |
| Issues | PATCH | `/issues/:issueId/status` | role | Move through the workflow |
| Issues | PATCH | `/issues/:issueId/assignee` | role | Assign/reassign the issue |
| Issues | GET | `/issues/:issueId/comments` | member | List comments (newest first) |
| Issues | POST | `/issues/:issueId/comments` | member | Add a comment |
| Issues | GET | `/issues/:issueId/activity` | member | Activity timeline |

## Database Models

Five collections:

| Collection | Main fields |
| --- | --- |
| User | name, email, passwordHash, role, timestamps |
| Project | name, key, description, members, createdBy, timestamps |
| Issue | project, title, description, severity, priority, status, reporter, assignee, priorityRank, severityRank, timestamps |
| Comment | issue, author, content, timestamps |
| Activity | issue, actor, action, field, oldValue, newValue, timestamp |

Enums: roles `ADMIN`/`DEVELOPER`/`TESTER`; severities `LOW`/`MEDIUM`/`HIGH`/
`CRITICAL`; priorities `LOW`/`MEDIUM`/`HIGH`/`URGENT`; statuses `OPEN`/
`IN_PROGRESS`/`TESTING`/`RESOLVED`/`CLOSED`.

Priority and severity ranks (`1`–`4`) are derived automatically on save so the
server can sort semantically without arbitrary string injection into queries.

## Indexing Decisions

- User email and Project key have unique indexes for identity and project lookup.
- Issues have single-field indexes for the common filters (project, status,
  priority, severity, reporter, assignee, created date), plus updatedAt and
  priority/severity rank indexes for sort, and compound indexes for project
  status lists and a user's project assignments.
- Comments and activities are indexed by issue and descending timestamp,
  matching issue-detail timeline queries.

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

## Installation

Prerequisites: Node.js 20+ and npm. MongoDB is optional — see below.

```bash
cd server
npm install
cd ../client
npm install
```

## Running Locally

### Option 1 — In-memory MongoDB (no database to install)

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

### Option 2 — Local / hosted MongoDB

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

## Demo Accounts

`npm run seed` (or the `dev:memory` launcher) idempotently creates demo users,
projects, issues, comments, and activity history. Every demo account uses the
password `Password123!` (override with `SEED_PASSWORD`).

| Role | Name | Email |
| --- | --- | --- |
| ADMIN | Ada Admin | admin@bugboard.dev |
| DEVELOPER | Leo Lead | lead@bugboard.dev |
| DEVELOPER | Dana Dev | dev@bugboard.dev |
| TESTER | Tina Tester | tester@bugboard.dev |

The seed creates the Web Platform (`WEB`), Mobile App (`MOB`), and Payments API
(`PAY`) projects with issues in every status so the dashboard, workflow, and
role behavior can be reviewed immediately. Rerunning the seed adds nothing new.

## Testing

```bash
# Server — tests run against mongodb-memory-server (no local DB required)
cd server
npm run check             # syntax check across source files
npm test                  # API test suites

# Client
cd client
npm test                  # role-policy and issue-grouping tests
npm run build             # production build verification
```

Coverage includes authentication, authorization (role + project membership),
project CRUD and member management, issue CRUD and assignment, the status
workflow, search/filtering, sorting and pagination, comments, activity history,
dashboard statistics, user listing, the error contract, seed idempotency, and
the frontend role policy and issue grouping.

## Production Build

```bash
cd client
npm run build             # outputs to client/dist
npm run preview           # serve the production build locally
```

The server should be started with a real `JWT_SECRET` set, `NODE_ENV=production`,
and a production `MONGODB_URI`.

## Design Decisions

- **Server-enforced authorization with mirrored UI**: every protected action is
  re-validated server-side; the frontend only hides actions that would be rejected.
- **Explicit workflow state machine**: statuses are not free-form; a transition
  map (including rollback edges) is enforced centrally and every move is
  recorded as activity. The UI (list, detail, Kanban) only offers legal moves.
- **Project membership as the access unit**: visibility and actions for projects
  and their issues are scoped by membership, with administrators exempt.
- **Consistent error envelope**: a single error handler serializes every failure
  to `{ success, error: { code, message } }`.
- **Backend as source of truth for Kanban**: the Kanban view calls the real
  status API; a rejected transition is surfaced as an error and the UI stays in
  sync with the server.
- **Safe sorting/pagination**: sort keys are whitelisted and ranks are stored
  numerically; pagination metadata rides alongside the stable issues contract.
- **Stateless auth**: bcrypt-hashed passwords with signed, expiring JWTs.
- **Idempotent seed + memory-backed tests**: ephemeral `mongodb-memory-server`
  keeps tests independent of a local database, and `npm run dev:memory` provides
  a zero-database local workflow.
- **Development-only JWT fallback**: a non-production default secret keeps local
  runs functional; production requires an explicit `JWT_SECRET`.
- **Private attachment delivery**: metadata is stored in MongoDB while files use
  randomized names on local disk; every list, download, and delete request first
  passes the same project-access check as the issue itself.
- **In-app notification records**: notifications are persisted per recipient and
  derive from assignment, status, and comment events; no external email provider
  or credentials are needed.

## Bonus Features

Implemented:

- **Kanban board**: `List view | Kanban view` toggle on the issues page. Columns
  for `Open`, `In Progress`, `Testing`, `Resolved`, `Closed`; cards show issue
  key, title, priority, severity, and assignee. Cards are moved through a
  `Move →` control listing only the server's allowed transitions; the backend
  remains the source of truth and rejects invalid or unauthorized moves.
- **Pagination**: server-side `page`/`limit` with `total`, `totalPages` metadata
  and Previous/Next controls, backward-compatible with the non-paginated API.
- **Sorting**: server-side `sort` (newest, oldest, updated, priority, severity)
  with a client sort selector; sort keys are validated and never injected
  directly.
- **Attachments**: project members can attach approved image, document, and
  archive types up to 5 MB; files are access-controlled and excluded from Git.
- **In-app notifications**: assignment, workflow, and comment activity can
  create per-user notifications with unread and read-state endpoints.

Deferred by design (see Limitations):

- **Docker / deployment config**

## Screenshots

Captured from a real running instance with seeded data (`docs/screenshots/`):

| Screenshot | Description |
| --- | --- |
| [landing.png](docs/screenshots/landing.png) | Public landing page at `/` |
| [login.png](docs/screenshots/login.png) | Sign-in screen |
| [dashboard.png](docs/screenshots/dashboard.png) | Dashboard statistics and assigned-issues panel |
| [issues.png](docs/screenshots/issues.png) | Issue list with filters, sort, and view toggle |
| [issue-detail.png](docs/screenshots/issue-detail.png) | Issue detail with workflow, comments, and activity |
| [projects.png](docs/screenshots/projects.png) | Project grid (admin view) |

To regenerate any screenshot, start the app (`npm run dev:memory` + `npm run dev`),
sign in with a demo account, and capture the corresponding route.

## Limitations

- **Attachment storage is local-disk only**. It is suitable for local development
  but is not shared across multiple server instances or durable container hosts;
  production should use object storage and malware scanning.
- **Notifications are in-app only**. There is no email, push delivery, or
  notification-preferences system, and no third-party provider credentials are
  required or configured.
- **Docker/deployment** is not yet configured; local development continues to use
  plain `npm` commands with a MongoDB connection or the in-memory launcher.
- Public registration is restricted to Developer/Tester; administrators are
  provisioned through the seed script or directly in the database.
- `JWT_SECRET` must be set for production; the development fallback must not be
  used there.
- The in-memory database (`dev:memory` and the test suite) is ephemeral — data
  is not persisted between runs.

## Future Improvements

- Drag-and-drop on the Kanban board (the current board is click-to-move; it
  already calls the same server-validated transitions).
- Object-storage-backed attachments with malware scanning and retention rules.
- Email/push delivery, notification preferences, and @mentions.
- Docker images and `docker-compose.yml` for client, server, and MongoDB.
- Deep-linkable filter presets and saved views.
- Per-user notifications preferences and @mentions.
