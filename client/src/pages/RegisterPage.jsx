import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/error';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TESTER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ name, email, password, role });
      navigate('/dashboard', { replace: true });
    } catch (registerError) {
      setError(errorMessage(registerError, 'Unable to create the account.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">BugBoard</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Register as a developer or tester.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span className="field-label">Name</span>
            <input
              className="input"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
            />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          <label className="field">
            <span className="field-label">Role</span>
            <select className="input" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="TESTER">Tester</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}