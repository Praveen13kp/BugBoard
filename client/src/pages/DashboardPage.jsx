import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiGetStats } from '../api/dashboard';
import { apiListIssues } from '../api/issues';
import { useAuth } from '../context/AuthContext';
import ErrorBox from '../components/common/ErrorBox';
import IssueRow from '../components/issues/IssueRow';
import Loading from '../components/common/Loading';
import StatCard from '../components/common/StatCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myIssues, setMyIssues] = useState([]);
  const [myIssuesLoading, setMyIssuesLoading] = useState(true);

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

  useEffect(() => {
    let active = true;
    apiListIssues({ assignee: user.id })
      .then(({ issues }) => {
        if (active) setMyIssues(issues.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setMyIssuesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <div className="page">
      <section className="page-heading">
        <h2>Welcome back, {user.name}</h2>
        <p className="muted">Here is what is happening across your projects.</p>
      </section>

      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : loading || !stats ? (
        <Loading text="Loading dashboard..." />
      ) : (
        <section className="stats-grid" aria-label="Issue statistics">
          <StatCard label="Total issues" value={stats.total} to="/issues" />
          <StatCard label="Open" value={stats.open} to="/issues?status=OPEN" tone="open" />
          <StatCard label="In progress" value={stats.inProgress} to="/issues?status=IN_PROGRESS" tone="progress" />
          <StatCard label="Testing" value={stats.testing} to="/issues?status=TESTING" tone="testing" />
          <StatCard label="Resolved" value={stats.resolved} to="/issues?status=RESOLVED" tone="resolved" />
          <StatCard label="Critical" value={stats.critical} to="/issues?severity=CRITICAL" tone="critical" />
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
          <Loading text="Loading your issues..." />
        ) : myIssues.length === 0 ? (
          <p className="muted">No issues are assigned to you right now.</p>
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