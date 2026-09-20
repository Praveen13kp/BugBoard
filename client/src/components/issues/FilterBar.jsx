import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiListProjects } from '../../api/projects';
import { PRIORITY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from '../../utils/format';

export default function FilterBar({ value, onChange, users }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let active = true;
    apiListProjects()
      .then(({ projects: list }) => {
        if (active) setProjects(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function update(field, fieldValue) {
    onChange({ ...value, [field]: fieldValue || undefined });
  }

  return (
    <div className="filter-bar">
      <div className="input-field">
        <Search className="input-icon" size={16} aria-hidden="true" />
        <input
          className="input"
          type="search"
          placeholder="Search issues..."
          aria-label="Search issues"
          value={value.search || ''}
          onChange={(event) => update('search', event.target.value)}
        />
      </div>
      <select
        className="input"
        value={value.project || ''}
        onChange={(event) => update('project', event.target.value)}
        aria-label="Filter by project"
      >
        <option value="">All projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <select
        className="input"
        value={value.status || ''}
        onChange={(event) => update('status', event.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="input"
        value={value.severity || ''}
        onChange={(event) => update('severity', event.target.value)}
        aria-label="Filter by severity"
      >
        <option value="">All severities</option>
        {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="input"
        value={value.priority || ''}
        onChange={(event) => update('priority', event.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="input"
        value={value.reporter || ''}
        onChange={(event) => update('reporter', event.target.value)}
        aria-label="Filter by reporter"
      >
        <option value="">All reporters</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <select
        className="input"
        value={value.assignee || ''}
        onChange={(event) => update('assignee', event.target.value)}
        aria-label="Filter by assignee"
      >
        <option value="">All assignees</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}