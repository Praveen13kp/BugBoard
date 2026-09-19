import bcrypt from 'bcryptjs';
import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { recordActivity } from '../services/activityService.js';

export const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

export const SEED_CREDENTIALS = [
  { role: 'ADMIN', name: 'Ada Admin', email: 'admin@bugboard.dev' },
  { role: 'DEVELOPER', name: 'Leo Lead', email: 'lead@bugboard.dev' },
  { role: 'DEVELOPER', name: 'Dana Dev', email: 'dev@bugboard.dev' },
  { role: 'TESTER', name: 'Tina Tester', email: 'tester@bugboard.dev' },
];

const PROJECT_SEEDS = [
  {
    name: 'Web Platform',
    key: 'WEB',
    description: 'Core BugBoard web application.',
    members: ['admin@bugboard.dev', 'lead@bugboard.dev', 'dev@bugboard.dev', 'tester@bugboard.dev'],
    issues: [
      {
        title: 'Sign-in silently redirects back to /login on stale token',
        description: 'When the JWT expires mid-session the app bounces the user to /login without any message.',
        severity: 'HIGH',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        reporter: 'tester@bugboard.dev',
        assignee: 'dev@bugboard.dev',
        comments: [
          { author: 'tester@bugboard.dev', content: 'Reproduced after idle for ~25 minutes.' },
          { author: 'dev@bugboard.dev', content: 'Fixing the 401 interceptor to surface a friendly notice.' },
        ],
        activities: [
          { field: 'status', oldValue: 'OPEN', newValue: 'IN_PROGRESS', actor: 'lead@bugboard.dev' },
          { field: 'assignee', oldValue: 'unassigned', newValue: 'Dana Dev', actor: 'lead@bugboard.dev' },
        ],
      },
      {
        title: 'Dashboard statistics ignore the assigned-to-me scope',
        description: 'The "assigned to you" panel shows issues the user cannot access.',
        severity: 'CRITICAL',
        priority: 'HIGH',
        status: 'OPEN',
        reporter: 'tester@bugboard.dev',
        assignee: null,
      },
      {
        title: 'Dashboard quick filters clear when changing tab',
        description: 'Navigating away and back loses the selected status filter.',
        severity: 'MEDIUM',
        priority: 'MEDIUM',
        status: 'TESTING',
        reporter: 'tester@bugboard.dev',
        assignee: 'dev@bugboard.dev',
        activities: [{ field: 'status', oldValue: 'OPEN', newValue: 'TESTING', actor: 'lead@bugboard.dev' }],
      },
      {
        title: 'Sidebar overlaps the issue list on narrow screens',
        description: 'Below 860px wide the fixed sidebar covers content on the right.',
        severity: 'LOW',
        priority: 'LOW',
        status: 'RESOLVED',
        reporter: 'tester@bugboard.dev',
        assignee: 'lead@bugboard.dev',
      },
      {
        title: 'Refresh project README with new screenshots',
        description: 'The onboarding screenshots in the README are outdated.',
        severity: 'LOW',
        priority: 'LOW',
        status: 'CLOSED',
        reporter: 'lead@bugboard.dev',
        assignee: null,
        activities: [{ field: 'status', oldValue: 'OPEN', newValue: 'CLOSED', actor: 'lead@bugboard.dev' }],
      },
    ],
  },
  {
    name: 'Mobile App',
    key: 'MOB',
    description: 'BugBoard mobile companion.',
    members: ['admin@bugboard.dev', 'lead@bugboard.dev', 'dev@bugboard.dev'],
    issues: [
      {
        title: 'Push notifications do not arrive on Android 14',
        description: 'FCM registration succeeds but calls never surface as notifications.',
        severity: 'HIGH',
        priority: 'URGENT',
        status: 'OPEN',
        reporter: 'lead@bugboard.dev',
        assignee: null,
      },
      {
        title: 'App crashes when reopening a resolved issue',
        description: 'Navigating into a resolved screen throws on the status badge render.',
        severity: 'CRITICAL',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        reporter: 'lead@bugboard.dev',
        assignee: 'dev@bugboard.dev',
      },
      {
        title: 'Status badge colors clash on dark mode',
        description: 'Resolved and closed badges are hard to distinguish.',
        severity: 'LOW',
        priority: 'LOW',
        status: 'RESOLVED',
        reporter: 'dev@bugboard.dev',
        assignee: 'dev@bugboard.dev',
      },
    ],
  },
  {
    name: 'Payments API',
    key: 'PAY',
    description: 'Billing and payments service.',
    members: ['admin@bugboard.dev', 'tester@bugboard.dev'],
    issues: [
      {
        title: 'Payment webhook retries are not idempotent',
        description: 'Delivering the same event twice charges the customer twice.',
        severity: 'CRITICAL',
        priority: 'URGENT',
        status: 'OPEN',
        reporter: 'tester@bugboard.dev',
        assignee: null,
        comments: [{ author: 'tester@bugboard.dev', content: 'Expected: one charge. Actual: two charges.' }],
      },
      {
        title: 'Currency formatting missing for JPY',
        description: 'JPY amounts render as decimals instead of whole units.',
        severity: 'MEDIUM',
        priority: 'LOW',
        status: 'TESTING',
        reporter: 'tester@bugboard.dev',
        assignee: null,
      },
    ],
  },
];

async function ensureUsers(stats) {
  const byEmail = new Map();

  for (const seed of SEED_CREDENTIALS) {
    let user = await User.findOne({ email: seed.email });
    if (!user) {
      const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
      user = await User.create({
        name: seed.name,
        email: seed.email,
        passwordHash,
        role: seed.role,
      });
      stats.users += 1;
    }
    byEmail.set(seed.email, user);
  }

  return byEmail;
}

export async function runSeed() {
  const stats = { users: 0, projects: 0, issues: 0, comments: 0, activities: 0 };
  const users = await ensureUsers(stats);
  const admin = users.get('admin@bugboard.dev');

  for (const projectSeed of PROJECT_SEEDS) {
    let project = await Project.findOne({ key: projectSeed.key });

    if (!project) {
      project = await Project.create({
        name: projectSeed.name,
        key: projectSeed.key,
        description: projectSeed.description,
        members: projectSeed.members.map((email) => users.get(email)._id),
        createdBy: admin._id,
      });
      stats.projects += 1;
    }

    for (const issueSeed of projectSeed.issues) {
      const existing = await Issue.findOne({ project: project._id, title: issueSeed.title });
      if (existing) continue;

      const created = await Issue.create({
        project: project._id,
        title: issueSeed.title,
        description: issueSeed.description,
        severity: issueSeed.severity,
        priority: issueSeed.priority,
        status: issueSeed.status,
        reporter: users.get(issueSeed.reporter)._id,
        assignee: issueSeed.assignee ? users.get(issueSeed.assignee)._id : null,
      });
      stats.issues += 1;

      await recordActivity(created._id, users.get(issueSeed.reporter)._id, 'created', {
        newValue: `${created.title} was opened.`,
      });
      stats.activities += 1;

      for (const change of issueSeed.activities || []) {
        await recordActivity(created._id, users.get(change.actor)._id, 'updated', {
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
        });
        stats.activities += 1;
      }

      for (const commentSeed of issueSeed.comments || []) {
        await Comment.create({
          issue: created._id,
          author: users.get(commentSeed.author)._id,
          content: commentSeed.content,
        });
        stats.comments += 1;
      }
    }
  }

  return stats;
}