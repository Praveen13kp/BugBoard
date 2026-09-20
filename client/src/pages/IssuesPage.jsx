import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Kanban, LayoutList, Plus, RefreshCw } from 'lucide-react';
import { errorMessage } from '../api/error';
import { apiChangeStatus, apiListIssues } from '../api/issues';
import { apiListProjects } from '../api/projects';
import { apiListUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { canReportIssueForProject } from '../utils/permissions';
import { ISSUE_SORTS } from '../utils/format';
import EmptyState from '../components/common/EmptyState';
import ErrorBox from '../components/common/ErrorBox';
import FilterBar from '../components/issues/FilterBar';
import IssueRow from '../components/issues/IssueRow';
import KanbanBoard from '../components/issues/KanbanBoard';
import { useToast } from '../components/common/Toast';

const FILTER_KEYS = ['search', 'project', 'status', 'priority', 'severity', 'reporter', 'assignee'];
const PAGE_SIZE = 20;

function filtersFromParams(params) {
  const filters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

export default function IssuesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [sort, setSort] = useState(() => searchParams.get('sort') || 'updated');
  const [viewMode, setViewMode] = useState(() => (searchParams.get('view') === 'kanban' ? 'kanban' : 'list'));
  const [refreshKey, setRefreshKey] = useState(0);
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [canReport, setCanReport] = useState(false);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    let active = true;
    apiListProjects()
      .then(({ projects: list }) => {
        if (!active) return;
        setCanReport(
          user.role === 'ADMIN' || list.some((project) => canReportIssueForProject(user, project)),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

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
    if (viewMode === 'list') {
      params.set('page', String(page));
      params.set('sort', sort);
    } else {
      params.set('view', 'kanban');
    }
    setSearchParams(params, { replace: true });

    let active = true;
    setLoading(true);
    setError('');

    const request =
      viewMode === 'list'
        ? apiListIssues({ ...filters, page, limit: PAGE_SIZE, sort })
        : apiListIssues(filters);

    request
      .then(({ issues: list, pagination: pageInfo }) => {
        if (active) {
          setIssues(list);
          setPagination(pageInfo);
        }
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
  }, [filters, page, sort, viewMode, refreshKey, setSearchParams]);

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

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
    setPage(1);
    setRefreshKey((key) => key + 1);
  }

  function handleSortChange(nextSort) {
    setSort(nextSort);
    setPage(1);
  }

  async function handleMove(issue, nextStatus) {
    if (!nextStatus) return;
    setMovingId(issue.id);
    try {
      const { issue: updated } = await apiChangeStatus(issue.id, nextStatus);
      setIssues((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Issue moved', `"${issue.title}" is now in ${updated.status.replaceAll('_', ' ').toLowerCase()}.`);
    } catch (moveFailure) {
      toast.error('Unable to move the issue', errorMessage(moveFailure, 'Please try again.'));
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="page">
      <section className="page-heading page-heading--row">
        <div>
          <h2>Issues</h2>
          <p>Search and filter across the issues you can access.</p>
        </div>
        {canReport && (
          <Link to="/create-issue" className="btn btn--primary">
            <Plus size={17} aria-hidden="true" /> New issue
          </Link>
        )}
      </section>

      <FilterBar value={filters} onChange={handleFilterChange} users={filterUsers} />

      <div className="issue-toolbar">
        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={viewMode === 'list' ? 'is-active' : ''}
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <LayoutList size={15} aria-hidden="true" /> List
          </button>
          <button
            type="button"
            className={viewMode === 'kanban' ? 'is-active' : ''}
            aria-pressed={viewMode === 'kanban'}
            onClick={() => setViewMode('kanban')}
          >
            <Kanban size={15} aria-hidden="true" /> Kanban
          </button>
        </div>
        {viewMode === 'list' && (
          <select
            className="input toolbar-sort"
            value={sort}
            onChange={(event) => handleSortChange(event.target.value)}
            aria-label="Sort issues"
          >
            {ISSUE_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        )}
        {viewMode === 'list' && pagination?.total !== undefined && (
          <span className="issue-toolbar-total muted">
            Showing {issues.length} of {pagination.total}
          </span>
        )}
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      ) : loading ? (
        viewMode === 'list' ? (
          <IssuesListSkeleton count={4} />
        ) : (
          <KanbanSkeleton />
        )
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          message="Try changing your filters, or create a new issue to get started."
          children={
            canReport ? (
              <Link to="/create-issue" className="btn btn--primary">
                <Plus size={16} aria-hidden="true" /> Create issue
              </Link>
            ) : undefined
          }
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard issues={issues} onMove={handleMove} movingId={movingId} />
      ) : (
        <div className="issue-list">
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {viewMode === 'list' && !error && !loading && pagination && pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Issues pagination">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export function IssuesListSkeleton({ count = 4 }) {
  return (
    <div className="issue-list" aria-hidden="true" aria-label="Loading issues">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <div className="skeleton-column">
            <span className="skeleton skeleton-line" style={{ width: '55%' }} />
            <span className="skeleton skeleton-line" style={{ width: '72%' }} />
          </div>
          <span className="skeleton skeleton-badge" />
          <span className="skeleton skeleton-badge" />
          <span className="skeleton skeleton-avatar" />
        </div>
      ))}
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="kanban" aria-hidden="true" aria-label="Loading board">
      {[0, 1, 2, 3, 4].map((column) => (
        <div className="skeleton-card" key={column} style={{ minHeight: 260 }}>
          <span className="skeleton skeleton-line" style={{ width: '50%' }} />
          <span className="skeleton skeleton-line" style={{ width: '80%' }} />
          <span className="skeleton skeleton-line" style={{ width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

export function RetryButton({ onRetry }) {
  return (
    <button type="button" className="btn btn--secondary" onClick={onRetry}>
      <RefreshCw size={15} aria-hidden="true" /> Try again
    </button>
  );
}