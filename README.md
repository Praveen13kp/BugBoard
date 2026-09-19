# BugBoard

BugBoard is a MERN issue-tracking application with a REST API and a React
frontend. The backend auth, authorization, project, issue, workflow, and
filtering layers are implemented and covered by an automated API test suite.
The frontend is built next, followed by seed data and final documentation.

## Development Progress

| Phase | Scope | Status | Verification |
| --- | --- | --- | --- |
| 1 | Project architecture and configuration | Complete | Server syntax check, API health check, and client production build passed. |
| 2 | MongoDB/Mongoose database schema | Complete | Schema validation and index-definition checks passed. |
| 3 | Authentication and JWT | Complete | Validation, bcrypt hashing, JWT signing/verification, and protected-route checks passed. |

## Project Status and Remaining Work

**Mandatory progress:** 13 of 20 mandatory implementation phases are complete.
**Remaining:** 7 mandatory phases. Final UI-state and role-UI polish, seed data,
and comprehensive documentation remain. The 8 bonus items remain deferred.

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

### Mandatory implementation order

| Order | Phase | Remaining scope | Status |
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
| 14 | UI states | Loading, empty, error, retry, and success feedback for API-driven screens | In progress — shared components exist; final sweep pending |
| 15 | Frontend authorization | Role-aware controls as UX, while retaining backend enforcement as the security boundary | Pending |
| 16 | Error handling | Complete centralized API error mapping and consistent response/error contracts | Pending |
| 17 | Seed data | Demo users, projects, issues, comments, activities, and documented credentials | Pending |
| 18 | Mandatory testing | Authentication, authorization, CRUD, workflow, filtering, comments, dashboard, and UI-state tests | In progress — 44 API tests passing |
| 20 | README completion | Full setup, API, permissions, workflow, decisions, limitations, and screenshot documentation | Pending |
| 21 | Final review | Requirement-by-requirement audit, clean repository review, and setup verification | Pending |

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

## Database Design

BugBoard uses five collections. `Project.members`, `Project.createdBy`,
`Issue.project`, `Issue.reporter`, `Issue.assignee`, `Comment.issue`,
`Comment.author`, `Activity.issue`, and `Activity.actor` are ObjectId references.
The application will validate relationship and project-access rules in later service
and authorization phases.

| Collection | Main fields |
| --- | --- |
| User | name, email, passwordHash, role, timestamps |
| Project | name, key, description, members, createdBy, timestamps |
| Issue | project, title, description, severity, priority, status, reporter, assignee, timestamps |
| Comment | issue, author, content, timestamps |
| Activity | issue, actor, action, field, oldValue, newValue, timestamp |

## Indexing Decisions

- User email and project key have unique indexes for identity and project lookup.
- Issues have single-field indexes for common filters (project, status, priority,
  severity, reporter, assignee, and created date), plus compound indexes for project
  status lists and a user's project assignments.
- Comments and activities are indexed by issue and descending timestamp, matching
  issue-detail timeline queries.
