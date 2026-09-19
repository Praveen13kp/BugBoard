import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { apiListIssues } from '../api/issues';
import { apiListUsers } from '../api/users';
import EmptyState from '../components/common/EmptyState';
import ErrorBox from '../components/common/ErrorBox';
import FilterBar from '../components/issues/FilterBar';
import IssueRow from '../components/issues/IssueRow';
import Loading from '../components/common/Loading';

function filtersFromParams(params) {
  const filters = {};
  for (const key of ['search', 'project', 'status', 'priority', 'severity', 'reporter', 'assignee']) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

export default function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;
    apiListUsers()
      .then(({ users: list }) => {
        if (active) setUsers(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    setSearchParams(params, { replace: true });

    let active = true;
    setLoading(true);
    setError('');
    apiListIssues(filters)
      .then(({ issues: list }) => {
        if (active) setIssues(list);
      })
      .catch((loadError) => {
        if (active) setError(errorMessage(loadError, 'Unable to load issues.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, setSearchParams]);

  const peopleInResults = useMemo(() => {
    const map = new Map();
    for (const issue of issues) {
      for (const person of [issue.reporter, issue.assignee]) {
        if (person?.id) map.set(person.id, person);
      }
    }
    return [...map.values()];
  }, [issues]);

  const filterUsers = users.length ? users : peopleInResults;

  return (
    <div className="page">
      <section className="page-heading page-heading--row">
        <div>
          <h2>Issues</h2>
          <p className="muted">Search and filter across the issues you can access.</p>
        </div>
        <Link to="/create-issue" className="btn btn--primary">
          New issue
        </Link>
      </section>

      <FilterBar value={filters} onChange={setFilters} users={filterUsers} />

      {error ? (
        <ErrorBox message={error} onRetry={() => setFilters({ ...filters })} />
      ) : loading ? (
        <Loading text="Loading issues..." />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          message="Try changing your filters, or create a new issue."
          children={
            <Link to="/create-issue" className="btn btn--primary">
              Create issue
            </Link>
          }
        />
      ) : (
        <div className="issue-list">
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}