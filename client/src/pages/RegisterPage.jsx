import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User as UserIcon, UserPlus } from 'lucide-react';
import { errorMessage } from '../api/error';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'TESTER', label: 'Tester', hint: 'Report & verify issues' },
  { value: 'DEVELOPER', label: 'Developer', hint: 'Fix & move issues' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <AuthVisual />
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-title">
            <p className="eyebrow">Get started</p>
            <h1>Create your account</h1>
            <p>Join as a developer or tester and start tracking issues today.</p>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span className="field-label">Name</span>
              <div className="input-field">
                <UserIcon className="input-icon" size={16} aria-hidden="true" />
                <input
                  className="input"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Email</span>
              <div className="input-field">
                <Mail className="input-icon" size={16} aria-hidden="true" />
                <input
                  className="input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <div className="input-field">
                <input
                  className="input input--icon-right"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  className="input-icon input-icon--right"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="field-hint">Use 8 or more characters with a mix of letters and symbols.</span>
            </label>
            <label className="field">
              <span className="field-label">Your role</span>
              <div className="auth-role-field" role="group" aria-label="Select role">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`role-option${role === option.value ? ' is-selected' : ''}`}
                    onClick={() => setRole(option.value)}
                    aria-pressed={role === option.value}
                  >
                    <span className="role-option-icon" aria-hidden="true">
                      <UserCheckIcon />
                    </span>
                    <span className="role-option-text">
                      <strong>{option.label}</strong>
                      <span>{option.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </label>
            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" /> Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={17} aria-hidden="true" /> Create account
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function UserCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <circle cx="19" cy="7" r="4" />
      <path d="m17 11 2 2 4-4" />
    </svg>
  );
}

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-hidden="true">
      <div className="auth-visual-top">
        <span className="brand-mark">B</span>
        <span className="auth-visual-brand">BugBoard</span>
      </div>
      <div className="auth-visual-copy">
        <h2>Your team&apos;s bugs, finally under control.</h2>
        <p>
          Create an account in seconds and start reporting, assigning, and resolving issues in the
          projects your team cares about.
        </p>
      </div>
      <div className="auth-visual-steps">
        <div className="auth-visual-step">
          <b>1 · Report</b>
          <span>Capture bugs with full context for your team.</span>
        </div>
        <div className="auth-visual-step">
          <b>2 · Assign</b>
          <span>Own the work and move it through a validated flow.</span>
        </div>
        <div className="auth-visual-step">
          <b>3 · Ship</b>
          <span>Test, resolve, and close with a complete history.</span>
        </div>
      </div>
    </aside>
  );
}