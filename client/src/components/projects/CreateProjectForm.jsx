import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/error';
import { apiCreateProject } from '../../api/projects';

export default function CreateProjectForm({ onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { project } = await apiCreateProject({ name, key, description });
      setSubmitting(false);
      onCreated();
      navigate(`/projects/${project.id}`, { state: { success: 'Project created.' } });
    } catch (submitError) {
      setError(errorMessage(submitError, 'Unable to create the project.'));
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      {error && <div className="alert alert--error">{error}</div>}
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            className="input"
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="BugBoard Web App"
          />
        </label>
        <label className="field">
          <span className="field-label">Key</span>
          <input
            className="input"
            required
            minLength={2}
            maxLength={12}
            value={key}
            onChange={(event) => setKey(event.target.value.toUpperCase())}
            placeholder="WEB"
          />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Description</span>
        <textarea
          className="input"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What does this project cover?"
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create project'}
        </button>
      </div>
    </form>
  );
}