import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, CircleDot, Loader, RotateCcw, Search, FlaskConical, Inbox, AlertOctagon, ListChecks } from 'lucide-react';
import { errorMessage } from '../api/error';
import { apiGetStats } from '../api/dashboard';
import { apiListIssues } from '../api/issues';
import { useAuth } from '../context/AuthContext';
import ErrorBox from '../components/common/ErrorBox';
import IssueRow from '../components/issues/IssueRow';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

const STAT_DEFS = [
  { key: 'total', label: 'Total issues', tone: 'total', icon: ListChecks, href: '/issues' },
  { key: 'open', label: 'Open', tone: 'open', icon: CircleDot, href: '/issues?status=OPEN' },
  { key: 'inProgress', label: 'In progress', tone: 'progress', icon: Loader, href: '/issues?status=IN_PROGRESS' },
  { key: 'testing', label: 'Testing', tone: 'testing', icon: FlaskConical, href: '/issues?status=TESTING' },
  { key: 'resolved', label: 'Resolved', tone: 'resolved', icon: ClipboardCheck, href: '/issues?status=RESOLVED' },
  { key: 'critical', label: 'Critical', tone: 'critical', icon: AlertOctagon, href: '/issues?severity=CRITICAL' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myIssues, setMyIssues] = useState([]);
  const [myIssuesLoading, setMyIssuesLoading] = useState(true);
  const [myIssuesError, setMyIssuesError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { stats: nextStats } = await apiGetStats();
      setStats(nextStats);
    } catch (statsError) {
      setError(errorMessage(statsError, 'Unable to load dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMyIssues = useCallback(() => {
    let active = true;
    setMyIssuesLoading(true);
    setMyIssuesError('');
    apiListIssues({ assignee: user.id })
      .then(({ issues }) => {
        if (active) setMyIssues(issues.slice(0, 5));
      })
      .catch((assignedError) => {
        if (active) setMyIssuesError(errorMessage(assignedError, 'Unable to load assigned issues.'));
      })
      .finally(() => {
        if (active) setMyIssuesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id]);

  useEffect(() => loadMyIssues(), [loadMyIssues]);

  return (
    <div className="page">
      <section className="page-heading">
        <h2>Welcome back, {user.name.split(' ')[0]}</h2>
        <p>Here is what is happening across your projects.</p>
      </section>

      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : loading || !stats ? (
        <StatsSkeleton />
      ) : (
        <section className="stats-grid" aria-label="Issue statistics">
          {STAT_DEFS.map((def) => (
            <StatCard
              key={def.key}
              label={def.label}
              value={stats[def.key]}
              to={def.href}
              tone={def.tone}
              icon={def.icon}
            />
          ))}
        </section>
      )}

      <section className="section">
        <div className="section-heading">
          <h3>Assigned to you</h3>
          <Link className="link" to={`/issues?assignee=${user.id}`}>
            View all
          </Link>
        </div>
        {myIssuesLoading ? (
          <AssignedSkeleton />
        ) : myIssuesError ? (
          <ErrorBox title="Unable to load assigned issues" message={myIssuesError} onRetry={loadMyIssues} />
        ) : myIssues.length === 0 ? (
          <EmptyState
            title="Nothing assigned to you right now"
            message="When issues are assigned to you, they will appear here so you can pick them up quickly."
            icon={Inbox}
          >
            <Link to="/issues" className="btn btn--secondary">
              <Search size={16} aria-hidden="true" /> Browse all issues
            </Link>
          </EmptyState>
        ) : (
          <div className="issue-list">
            {myIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="stats-grid" aria-hidden="true" aria-label="Loading statistics">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div className="skeleton-card" key={item}>
          <span className="skeleton skeleton-avatar" style={{ width: 42, height: 42, borderRadius: 12 }} />
          <span className="skeleton skeleton-line" style={{ width: '60%', height: 28 }} />
          <span className="skeleton skeleton-line" style={{ width: '45%' }} />
        </div>
      ))}
    </div>
  );
}

function AssignedSkeleton() {
  return (
    <div className="issue-list" aria-hidden="true" aria-label="Loading assigned issues">
      {[0, 1, 2].map((item) => (
        <div className="skeleton-row" key={item}>
          <div className="skeleton-column">
            <span className="skeleton skeleton-line" style={{ width: '50%' }} />
            <span className="skeleton skeleton-line" style={{ width: '68%' }} />
          </div>
          <span className="skeleton skeleton-badge" />
          <span className="skeleton skeleton-avatar" />
        </div>
      ))}
    </div>
  );
}