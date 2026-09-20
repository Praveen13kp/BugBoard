import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import { errorMessage } from '../../api/error';
import { apiCreateProject } from '../../api/projects';
import { useToast } from '../common/Toast';

export default function CreateProjectForm({ onCreated, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
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
      onClose?.();
      toast.success('Project created', `${project.name} is ready for your team.`);
      navigate(`/projects/${project.id}`);
    } catch (submitError) {
      setError(errorMessage(submitError, 'Unable to create the project.'));
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
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
          <span className="field-hint">A short code for issue keys, e.g. WEB-1234.</span>
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
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true" /> Creating...
            </>
          ) : (
            <>
              <FolderPlus size={17} aria-hidden="true" /> Create project
            </>
          )}
        </button>
      </div>
    </form>
  );
}