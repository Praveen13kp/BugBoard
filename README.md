# BugBoard

BugBoard is a MERN issue-tracking application with a REST API and a React
frontend. It implements authentication and role-based authorization, project and
issue management, an explicit issue-status workflow, comments, an activity
timeline, a dashboard API, and a responsive React UI with membership- and
role-aware controls. Everything is covered by automated test suites (52 server
API tests + 7 client policy tests) and an idempotent demo seed script.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Axios, Vite 6 |
| Backend | Node.js, Express 5, Mongoose 8 |
| Data | MongoDB |
| Auth | bcryptjs password hashing, JWT (stateless bearer tokens) |
| Tests | Node's built-in test runner, `supertest`, `mongodb-memory-server` |

## Getting Started

Prerequisites: Node.js 20+, npm, and a local MongoDB instance (or use
`MONGODB_URI` pointing at a hosted database).

```bash
# 1. Server
cd server
cp .env.example .env      # set MONGODB_URI and a real JWT_SECRET
npm install
npm run seed              # optional: demo users, projects, issues, comments, activity
npm run dev               # API on http://localhost:5000

# 2. Client (separate terminal)
cd client
npm install
npm run dev               # UI on http://localhost:5173
```

Vite proxies `/api` to the server during development, so no CORS configuration
is needed locally. `CLIENT_ORIGIN` controls the CORS allow-list for the API.

### Environment variables

`server/.env.example`

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret. Required in production; a fallback exists for dev/test |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |
| `CLIENT_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |

`client/.env.example`

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL used by the client (default `/api`, proxied in dev) |

## Development Progress

| Phase | Scope | Status | Verification |
| --- | --- | --- | --- |
| 1 | Project architecture and configuration | Complete | Server syntax check, API health check, and client production build passed. |
| 2 | MongoDB/Mongoose database schema | Complete | Schema validation and index-definition checks passed. |
| 3 | Authentication and JWT | Complete | Validation, bcrypt hashing, JWT signing/verification, and protected-route checks passed. |

## Project Status and Remaining Work

**Mandatory progress:** 20 of 20 mandatory implementation phases are complete,
including the documentation and final-review phases. No mandatory work remains;
the 8 bonus items are deferred.

### Completed

- **Phase 1 — Architecture:** Separate React and Express applications, environment
  templates, an API health endpoint, shared API-client foundation, and ignore rules.
- **Phase 2 — Database:** User, Project, Issue, Comment, and Activity schemas;
  references, enum constraints, and query-oriented indexes.
- **Phase 3 — Authentication:** bcryptjs password hashing, JWT issuance and
  verification, registration/login/current-user endpoints, input validation, and
  rejection of public administrator registration.
- **Phase 4 — Authorization:** Role middleware and an explicit permission policy
  (admin/developer/tester) enforced on the server, plus project-membership access
  checks so users cannot reach projects they do not belong to.
- **Phase 5 — Project management:** Project CRUD, member add/remove, unique-key
  validation, member-user validation, and project access applied on every route.
- **Phase 6 — Issue management:** Issue CRUD, automatic reporter assignment,
  member-validated assignee/reassignment, field-level update rules, and
  status-change/assignee dedicated endpoints.
- **Phase 7 — Status workflow:** An explicit server-side transition map
  (`OPEN → IN_PROGRESS → TESTING → RESOLVED → CLOSED`, with TESTING/IN_PROGRESS and
  RESOLVED/IN_PROGRESS rollback edges) and activity recording for every move.
- **Phase 8 — Search and filtering:** Server-side `search`, `project`, `status`,
  `priority`, `severity`, `reporter`, and `assignee` filters on `GET /api/issues`,
  scoped to projects the caller can access.
- **Phase 9 — Comments:** Authorized comment listing and creation with author and
  timestamp; comments are restricted to members of the issue's project.
- **Phase 10 — Activity history:** An activity record is created for issue
  creation, status/assignee/severity/priority changes, exposed through
  `GET /api/issues/:issueId/activity` with access checks and author population.
- **Phase 11 — Dashboard API:** Access-scoped statistics (total, open,
  in-progress, testing, resolved, closed, critical, and issues assigned to the
  caller) via `GET /api/dashboard`.
- **Phase 12 — Frontend foundation:** React Router pages (`/login`, `/register`,
  `/dashboard`, `/projects`, `/projects/:id`, `/issues`, `/issues/:id`,
  `/create-issue`), an auth context with token/user persistence and session
  restoration, a shared Axios client with auth header and 401 handling, and
  grouped API endpoint modules.
- **Phase 13 — Core UI:** Responsive sidebar/header layout, dashboard statistic
  cards and quick-filter links, project grid and project detail with member
  management, issue list with search and filters, an issue detail page with
  workflow/assignee/field actions, comments, and an activity timeline.
- **Phase 14 — UI states:** Consistent loading, empty, error-and-retry, and
  success-acknowledgement feedback across every API-driven screen, a
  session-restore loading screen, and guest-route redirects so signed-in users
  are taken away from `/login` and `/register`.
- **Phase 15 — Frontend authorization:** Membership- and role-aware control
  gating mirrored to server policy — project creation and member management are
  administrator-only, report-issue actions appear only to members (or admins) of
  a project, and issue workflow/assign/edit actions follow the role model.
- **Phase 16 — Error handling:** A single centralized error handler enforces one
  response contract (`success: false` with an `error.code` and `error.message`)
  for application errors, validation failures, invalid ObjectIds, duplicate
  keys, malformed JSON bodies, unknown routes, and unexpected failures.
- **Phase 17 — Seed data:** An idempotent `npm run seed` script provisions demo
  accounts, projects, issues, comments, and activity history with documented
  credentials for development and review.
- **Phase 18 — Mandatory testing:** Automated suites now cover authentication,
  authorization, projects, issues, workflow, filtering, comments, activity,
  dashboard, users, the error contract, seed idempotency, and the frontend role
  policy — 52 server API tests and 7 client policy tests, all passing.
- **Phase 20 — README completion:** Setup, API reference, permission model,
  workflow, decisions, limitations, and screenshot documentation (this file).
- **Phase 21 — Final review:** Requirement-by-requirement audit against the plan,
  repository hygiene check, and verification of the server test suite, client
  tests, production build, and seed idempotency.

### Mandatory implementation order

| Order | Phase | Scope | Status |
| --- | --- | --- | --- |
| 4 | Authorization | Role-action policy and project-membership authorization enforced on the server | Complete — 403 tests for role and project access |
| 5 | Project management | Project CRUD, member management, unique-key and access validation | Complete — CRUD, members, duplicate-key, and access tests |
| 6 | Issue management | Issue CRUD, assignment/reassignment, project and assignee validation | Complete — CRUD, assign, reassign, and validation tests |
| 7 | Status workflow | Explicit transition map and activity creation for status changes | Complete — transition-map and invalid-transition tests |
| 8 | Search and filtering | Server-side issue search and filters by project, status, priority, severity, reporter, and assignee | Complete — search and filter tests |
| 9 | Comments | Authorized issue comments with content, author, and timestamps | Complete — create, author, timestamp, newest-first, and access tests |
| 10 | Activity history | Activity API for creation, status, assignee, severity, and priority changes | Complete — field-change and access tests |
| 11 | Dashboard API | Access-scoped issue statistics and assigned-issue data | Complete — statistics and scoping tests |
| 12 | Frontend foundation | React routes, authentication state, route protection, and endpoint modules | Complete — all pages routed, auth context, route guard, API modules |
| 13 | Core UI | Responsive dashboard, projects, issues, issue detail, comments, and create/edit flows | Complete — production client build passes |
| 14 | UI states | Loading, empty, error, retry, and success feedback for API-driven screens | Complete — shared states applied across all screens |
| 15 | Frontend authorization | Role-aware controls as UX, while retaining backend enforcement as the security boundary | Complete — membership and role gating across screens |
| 16 | Error handling | Complete centralized API error mapping and consistent response/error contracts | Complete — single error contract enforced and tested |
| 17 | Seed data | Demo users, projects, issues, comments, activities, and documented credentials | Complete — idempotent seed script and tests |
| 18 | Mandatory testing | Authentication, authorization, CRUD, workflow, filtering, comments, dashboard, and UI-state tests | Complete — 52 API + 7 client tests passing |
| 20 | README completion | Full setup, API, permissions, workflow, decisions, limitations, and screenshot documentation | Complete — this document |
| 21 | Final review | Requirement-by-requirement audit, clean repository review, and setup verification | Complete — see Final Review |

### Final review notes (Phase 21)

- **Plan audit:** Each phase in the original implementation order (1–3 by the
  initial scaffold, 4–18 and 20–21 here) maps to a delivered, tested item; no
  mandatory phase is outstanding.
- **Repository hygiene:** `node_modules/`, `dist/`, and `.env` files are ignored
  and are not tracked; environment templates are documented in `.env.example`.
- **Setup verification:** `server` `npm install` + `npm run check` + `npm test`
  (52 pass) and `client` `npm install` + `npm test` (7 pass) + `npm run build`
  (production build succeeds). Seed idempotency is verified by an automated test.
- **Documented limitation:** screenshots (see below) are placeholders that should
  be replaced with captures of the running UI.

### Deferred bonus work

Bonus work begins only after every mandatory phase above is verified:

1. Activity timeline UI
2. Kanban board using the same server-side status transition validation
3. Pagination
4. Sorting
5. Additional automated API/component tests
6. Attachments
7. Notifications
8. Docker and/or deployment

### Delivery workflow

Each phase is developed on a dedicated branch rather than `main`. Before the next
phase begins, the phase is inspected, tested, recorded in this README, committed,
pushed, opened as a pull request, and merged into `main`.

## Authentication

`POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` use
bcryptjs password hashing and signed JWT bearer tokens. Password hashes are not
selected by default or returned in API responses. Public registration accepts
Developer and Tester accounts only; administrator accounts must be provisioned by
a later controlled workflow or the development seed script.

## Seed Data

`npm run seed` (from `server/`) connects to `MONGODB_URI` and idempotently
creates demo users, projects, issues, comments, and activity history. Every demo
account uses the password `Password123!` (override with `SEED_PASSWORD`).

| Role | Name | Email |
| --- | --- | --- |
| ADMIN | Ada Admin | admin@bugboard.dev |
| DEVELOPER | Leo Lead | lead@bugboard.dev |
| DEVELOPER | Dana Dev | dev@bugboard.dev |
| TESTER | Tina Tester | tester@bugboard.dev |

The seed creates the Web Platform (`WEB`), Mobile App (`MOB`), and Payments API
(`PAY`) projects with issues in every status so the dashboard and role behavior
can be reviewed immediately. Rerunning the script is safe and adds nothing new.

## API Reference

All routes are under `/api`. Every route except `/health`, `/auth/register`, and
`/auth/login` requires a `Authorization: Bearer <token>` header. Responses use
the envelope documented in [Error Contract](#error-contract).

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
| Users | GET | `/users` | ADMIN | List all users (no roles required for members screens) |
| Issues | GET | `/issues` | member | List issues with search/filters |
| Issues | POST | `/issues` | member | Create an issue (reporter is automatic) |
| Issues | GET | `/issues/:issueId` | member | Issue detail |
| Issues | PATCH | `/issues/:issueId` | role | Edit title/description/severity/priority |
| Issues | PATCH | `/issues/:issueId/status` | role | Move through the workflow |
| Issues | PATCH | `/issues/:issueId/assignee` | role | Assign/reassign the issue |
| Issues | GET | `/issues/:issueId/comments` | member | List comments (newest first) |
| Issues | POST | `/issues/:issueId/comments` | member | Add a comment |
| Issues | GET | `/issues/:issueId/activity` | member | Activity timeline |

Issue filters on `GET /issues`: `search`, `project`, `status`, `priority`,
`severity`, `reporter`, `assignee`.

## Permissions Model

The server is the security boundary; the UI mirrors these rules to hide actions
the user cannot perform.

| Action | ADMIN | DEVELOPER (member) | TESTER (member) |
| --- | --- | --- | --- |
| Create/update projects, manage members | Yes | — | — |
| View projects and issues | All | Their projects | Their projects |
| Report issues | Any project | Projects they belong to | Projects they belong to |
| Assign / reassign issues | Yes | Yes | — |
| Edit issue details | Yes | Yes | Issues they reported |
| Transition issue status | Yes | Yes | Issues they reported or are assigned to |
| Comment on issues | Yes | Yes | Yes |
| List users | Yes | — | — |

## Status Workflow

Statuses: `OPEN → IN_PROGRESS → TESTING → RESOLVED → CLOSED`, with two rollback
edges. `CLOSED` is terminal.

```
OPEN ────▶ IN_PROGRESS ────▶ TESTING ────▶ RESOLVED ────▶ CLOSED
                  ▲             │ ▲                     │
                  └─────────────┘ └─────────────────────┘
```

Every transition is validated on the server and rejected with an
`INVALID_STATUS_TRANSITION` error if the edge is not allowed. All transitions
(and creation, assignment, and field edits) append an entry to the issue's
activity history.

## Error Contract

Success responses use `{ "success": true, "data": { ... } }`. Errors always use
`{ "success": false, "error": { "code": string, "message": string } }`.

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `INVALID_JSON` | Request body is not valid JSON |
| 400 | `INVALID_STATUS_TRANSITION`, `ISSUE_ALREADY_IN_STATUS`, `NO_CHANGES`, `NO_ASSIGNEE_CHANGE` | Business-rule conflicts |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` | Missing or invalid authentication |
| 403 | `FORBIDDEN`, `PROJECT_ACCESS_DENIED` | Role or membership violation |
| 404 | `NOT_FOUND`, `PROJECT_NOT_FOUND`, `ISSUE_NOT_FOUND`, `MEMBER_NOT_FOUND` | Missing resource or route |
| 409 | `EMAIL_IN_USE`, `PROJECT_KEY_IN_USE`, `DUPLICATE` | Unique-key conflicts |
| 422 | `VALIDATION_ERROR`, `INVALID_ASSIGNEE`, `ASSIGNEE_NOT_MEMBER`, `INVALID_MEMBER` | Invalid input |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected failure |

## Frontend Overview

Routes: `/login`, `/register`, `/dashboard`, `/projects`, `/projects/:id`,
`/issues`, `/issues/:id`, `/create-issue`. Authenticated routes are guarded by
`AppLayout` (with a session-restore loading screen) and guest pages by
`GuestRoute`. The shared Axios client attaches the JWT and redirects to `/login`
on a 401. All API-driven screens provide loading, empty, error-with-retry, and
success-acknowledgement states. Role and membership helpers in
`client/src/utils/permissions.js` mirror the server policy so controls are
hidden rather than merely rejected.

## Database Design

BugBoard uses five collections. `Project.members`, `Project.createdBy`,
`Issue.project`, `Issue.reporter`, `Issue.assignee`, `Comment.issue`,
`Comment.author`, `Activity.issue`, and `Activity.actor` are ObjectId references.
Relationship and project-access rules are enforced by the service and
authorization layers, with project membership validated on every project and
issue operation.

| Collection | Main fields |
| --- | --- |
| User | name, email, passwordHash, role, timestamps |
| Project | name, key, description, members, createdBy, timestamps |
| Issue | project, title, description, severity, priority, status, reporter, assignee, timestamps |
| Comment | issue, author, content, timestamps |
| Activity | issue, actor, action, field, oldValue, newValue, timestamp |

Enums: roles `ADMIN`/`DEVELOPER`/`TESTER`; severities `LOW`/`MEDIUM`/`HIGH`/
`CRITICAL`; priorities `LOW`/`MEDIUM`/`HIGH`/`URGENT`; statuses `OPEN`/
`IN_PROGRESS`/`TESTING`/`RESOLVED`/`CLOSED`.

## Indexing Decisions

- User email and project key have unique indexes for identity and project lookup.
- Issues have single-field indexes for common filters (project, status, priority,
  severity, reporter, assignee, and created date), plus compound indexes for project
  status lists and a user's project assignments.
- Comments and activities are indexed by issue and descending timestamp, matching
  issue-detail timeline queries.

## Design Decisions

- **Server-enforced authorization with mirrored UI:** every protected action is
  re-validated server-side regardless of what the UI shows; the frontend only
  hides actions that would be rejected.
- **Explicit workflow state machine:** statuses are not free-form; a transition
  map (including rollback edges) is enforced centrally, and every move is
  recorded as activity.
- **Project membership as the access unit:** visibility and actions for projects
  and their issues are scoped by membership, with administrators exempt.
- **Consistent error envelope:** a single error handler serializes every failure
  to `{ success, error: { code, message } }` for predictable client handling.
- **Stateless auth:** bcrypt-hashed passwords with signed, expiring JWTs; no
  server-side session store.
- **Idempotent seed + memory-backed tests:** ephemeral `mongodb-memory-server`
  keeps tests dependent on no local database, and the seed script can be rerun
  safely against real databases.
- **Development-only JWT fallback:** a non-production default secret keeps local
  runs functional; production requires an explicit `JWT_SECRET`.

## Limitations

- No pagination or server-side sorting (single snapshot list per filter set).
- No file attachments, notifications, or email delivery.
- Public registration is restricted to Developer/Tester; administrators are
  provisioned through the seed script or directly in the database.
- No Docker image or deployment configuration yet (listed as bonus work).
- `JWT_SECRET` must be set for production; the development fallback must not be
  used there.
- Screenshots below are placeholders pending manual capture.
- A local or remote MongoDB instance is required to run the app (tests use
  `mongodb-memory-server` instead).

## Screenshots

Placeholder — replace with captured screenshots of the running UI in
`docs/screenshots/`:

- `dashboard.png` — dashboard statistics and assigned-issues panel
- `projects.png` — project grid with create-form (admin view)
- `project-detail.png` — project page with members and issue list
- `issues.png` — issue list with search and filters
- `issue-detail.png` — issue detail with workflow, comments, and activity
- `login.png` — sign-in screen

## Testing

```bash
# Server (tests run against mongodb-memory-server; no local DB required)
cd server
npm run check             # syntax check across source files
npm test                  # 52 API tests

# Client
cd client
npm test                  # 7 role-policy/label tests
npm run build             # production build verification
```

Coverage includes authentication, authorization (role + project membership),
project CRUD and member management, issue CRUD and assignment, the status
workflow, search/filtering, comments, activity history, dashboard statistics,
user listing, the error contract, seed idempotency, and the frontend role policy.