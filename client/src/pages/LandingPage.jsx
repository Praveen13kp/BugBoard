import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

const features = [
  ['Issue & Bug Tracking', 'Report and manage software issues from creation through resolution.'],
  ['Project Management', 'Organize issues by project and control access through membership.'],
  ['Role-Based Access', 'Admin, Developer, and Tester permissions are enforced by the backend.'],
  ['Structured Workflow', 'Move issues through clear, server-validated resolution stages.'],
  ['Search & Filters', 'Find issues by project, status, priority, severity, reporter, or assignee.'],
  ['Comments & Activity', 'Keep discussion and important issue changes visible in context.'],
  ['Dashboard Insights', 'See issue totals and the work currently assigned to you.'],
];

const workflow = ['OPEN', 'IN PROGRESS', 'TESTING', 'RESOLVED', 'CLOSED'];

const navLinks = [
  ['#features', 'Features'],
  ['#workflow', 'Workflow'],
  ['#roles', 'Roles'],
  ['#about', 'About'],
];

function Brand() {
  return (
    <Link to="/" className="landing-brand" aria-label="BugBoard home">
      <span className="landing-brand-mark" aria-hidden="true">
        B
      </span>
      <span>BugBoard</span>
    </Link>
  );
}

function PreviewIssue({ title, status, priority, severity, assignee, project }) {
  return (
    <div className="preview-issue">
      <div className="preview-issue-main">
        <strong>{title}</strong>
        <span>{assignee} · {project}</span>
      </div>
      <div className="preview-badges">
        <Badge kind="status" value={status} />
        <Badge kind="priority" value={priority} />
        <Badge kind="severity" value={severity} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, initializing } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const destination = user ? '/dashboard' : '/register';
  const actionLabel = user ? 'Open Dashboard' : 'Get Started';

  useEffect(() => {
    const landing = document.querySelector('.landing');
    if (landing) landing.classList.add('js-landing');

    const nav = document.querySelector('.landing-nav');
    const onScroll = () => {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const targets = landing ? landing.querySelectorAll('[data-reveal]') : [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <main className="landing">
      <nav className={`landing-nav${navOpen ? ' landing-nav--open' : ''}`} aria-label="Landing navigation">
        <Brand />
        <button
          type="button"
          className="landing-menu-toggle"
          aria-expanded={navOpen}
          aria-controls="landing-nav-menu"
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="landing-nav-links" id="landing-nav-menu">
          {navLinks.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setNavOpen(false)}>
              {label}
            </a>
          ))}
        </div>
        <div className="landing-nav-actions">
          {!user && <Link className="landing-login" to="/login">Login</Link>}
          <Link
            className="landing-button landing-button--small"
            to={destination}
            onClick={() => setNavOpen(false)}
          >
            {initializing ? 'Loading…' : actionLabel}
          </Link>
        </div>
      </nav>

      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker">Issue tracking, without the noise</p>
          <h1 id="hero-title">
            Track bugs. <span>Ship better software.</span>
          </h1>
          <p className="landing-lede">
            BugBoard is a lightweight issue tracking platform that helps teams report, assign, test,
            and resolve software issues through a structured workflow.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-button" to={destination}>
              {actionLabel}
              <span aria-hidden="true">→</span>
            </Link>
            <a className="landing-button landing-button--secondary" href="#preview">
              Explore BugBoard
            </a>
          </div>
          <p className="landing-note">
            Built for focused development teams with project-level access and role-aware workflows.
          </p>
        </div>
        <div className="hero-orb hero-orb--one" aria-hidden="true" />
        <div className="hero-orb hero-orb--two" aria-hidden="true" />
        <DashboardPreview />
      </section>

      <section
        id="preview"
        className="landing-section landing-section--preview"
        aria-labelledby="preview-title"
        data-reveal
      >
        <div className="section-intro">
          <p className="landing-kicker">One clear picture</p>
          <h2 id="preview-title">Everything your team needs to move issues forward.</h2>
          <p>
            Stay close to what is open, what needs testing, and what needs your attention—without
            losing the surrounding project context.
          </p>
        </div>
        <div className="preview-highlights">
          <span>Project-scoped visibility</span>
          <span>Backend-enforced permissions</span>
          <span>Issue history in context</span>
        </div>
      </section>

      <section id="features" className="landing-section" aria-labelledby="features-title" data-reveal>
        <div className="section-intro">
          <p className="landing-kicker">Built around the work</p>
          <h2 id="features-title">Useful tools. Deliberately focused.</h2>
          <p>
            BugBoard keeps the essentials of an issue tracker connected to the workflow your team
            already understands.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(([title, description], index) => (
            <article className="feature-card" key={title}>
              <span className="feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="landing-section workflow-section"
        aria-labelledby="workflow-title"
        data-reveal
      >
        <div className="section-intro">
          <p className="landing-kicker">A path you can trust</p>
          <h2 id="workflow-title">Keep every issue moving with intention.</h2>
          <p>
            BugBoard validates workflow changes on the server, so the status on screen reflects a
            real, permitted transition.
          </p>
        </div>
        <ol className="workflow-flow">
          {workflow.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section id="roles" className="landing-section" aria-labelledby="roles-title" data-reveal>
        <div className="section-intro">
          <p className="landing-kicker">Built for the whole team</p>
          <h2 id="roles-title">Clear responsibility at every stage.</h2>
        </div>
        <div className="role-grid">
          <article className="role-card" aria-label="Admin role">
            <p>Admin</p>
            <h3>Keep projects healthy.</h3>
            <ul>
              <li>Create and manage projects</li>
              <li>Manage project membership</li>
              <li>Control project access</li>
              <li>Assign and manage issues</li>
            </ul>
          </article>
          <article className="role-card role-card--featured" aria-label="Developer role">
            <p>Developer</p>
            <h3>Turn reports into fixes.</h3>
            <ul>
              <li>Work across accessible projects</li>
              <li>Assign and update issues</li>
              <li>Move work through the workflow</li>
              <li>Collaborate through comments</li>
            </ul>
          </article>
          <article className="role-card" aria-label="Tester role">
            <p>Tester</p>
            <h3>Keep quality visible.</h3>
            <ul>
              <li>Report issues in assigned projects</li>
              <li>Review owned issues during testing</li>
              <li>Update permitted issue progress</li>
              <li>Add comments and feedback</li>
            </ul>
          </article>
        </div>
      </section>

      <section
        id="about"
        className="landing-section landing-benefits"
        aria-labelledby="benefits-title"
        data-reveal
      >
        <div>
          <p className="landing-kicker">Why BugBoard</p>
          <h2 id="benefits-title">Less ambiguity. More momentum.</h2>
        </div>
        <ul>
          <li>Centralized issue tracking</li>
          <li>Clear ownership</li>
          <li>Structured development workflow</li>
          <li>Project-level access</li>
          <li>Role-based permissions</li>
          <li>Searchable issue history</li>
          <li>Comments and activity tracking</li>
        </ul>
      </section>

      <section className="landing-cta" aria-labelledby="cta-title" data-reveal>
        <p className="landing-kicker">Ready when your team is</p>
        <h2 id="cta-title">Bring your development workflow into one place.</h2>
        <p>Report, assign, track, and resolve issues with BugBoard.</p>
        <Link className="landing-button" to={destination}>
          {actionLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="landing-footer">
        <div>
          <Brand />
          <p>Lightweight issue tracking for development teams.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </footer>
    </main>
  );
}

function DashboardPreview() {
  return (
    <div className="product-preview" aria-label="BugBoard dashboard preview">
      <div className="preview-topbar">
        <span className="preview-logo" aria-hidden="true">B</span>
        <span>Dashboard</span>
        <i />
      </div>
      <div className="preview-content">
        <aside>
          <span>Overview</span>
          <span className="preview-active">Issues</span>
          <span>Projects</span>
        </aside>
        <div className="preview-main">
          <p className="preview-greeting">Welcome back, Alex</p>
          <div className="preview-stats">
            <span><b>24</b>Total issues</span>
            <span><b>8</b>Open</span>
            <span><b>6</b>In progress</span>
            <span><b>3</b>Critical</span>
          </div>
          <div className="preview-list">
            <div className="preview-list-title">
              <strong>Assigned to you</strong>
              <span>View all</span>
            </div>
            <PreviewIssue
              title="Payment webhook retries twice"
              status="IN_PROGRESS"
              priority="URGENT"
              severity="CRITICAL"
              assignee="Dana Dev"
              project="PAY"
            />
            <PreviewIssue
              title="Sidebar spacing on tablet"
              status="TESTING"
              priority="MEDIUM"
              severity="LOW"
              assignee="Alex Morgan"
              project="WEB"
            />
            <PreviewIssue
              title="Refresh onboarding screenshots"
              status="OPEN"
              priority="LOW"
              severity="MEDIUM"
              assignee="Unassigned"
              project="WEB"
            />
          </div>
        </div>
      </div>
    </div>
  );
}