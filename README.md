# BugBoard

BugBoard is a MERN issue-tracking application. This repository currently contains
the Phase 1 application foundation: separate React and Express applications,
environment templates, and a minimal API health endpoint.

Feature implementation begins in later phases.

## Development Progress

| Phase | Scope | Status | Verification |
| --- | --- | --- | --- |
| 1 | Project architecture and configuration | Complete | Server syntax check, API health check, and client production build passed. |
| 2 | MongoDB/Mongoose database schema | Complete | Schema validation and index-definition checks passed. |

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
