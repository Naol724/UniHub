import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './Landing.css';

const getGoogleAuthUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = encodeURIComponent(window.location.origin);
  return `${baseUrl.replace(/\/api\/?$/, '')}/api/google?returnTo=${origin}`;
};

const GOOGLE_ERRORS = {
  google_failed: 'Google sign-in failed. Please try again.',
  google_not_configured: 'Google sign-in is not configured on the server.',
  google_callback_error: 'Google authentication error. Please try again.',
  google_no_user: 'Could not retrieve your Google account. Please try again.',
  google_db_unavailable: 'Database is offline. Check MongoDB Atlas, then restart the backend.',
};

const Landing = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;
    setMode('login');
    setErrors({ general: GOOGLE_ERRORS[error] || 'Authentication failed. Please try again.' });
    document.getElementById('sign-in')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [searchParams]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const validate = () => {
    const next = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register') {
      if (!form.firstName.trim()) next.firstName = 'First name is required.';
      if (!form.lastName.trim()) next.lastName = 'Last name is required.';
    }

    if (!form.email) next.email = 'Email is required.';
    else if (!emailRegex.test(form.email)) next.email = 'Enter a valid email.';

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'At least 6 characters.';

    if (mode === 'register') {
      if (!form.confirmPassword) next.confirmPassword = 'Confirm your password.';
      else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({
        general:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="#top" className="landing-nav-brand" aria-label="UniHub home">
          <span className="landing-mark" aria-hidden="true">UH</span>
          <span className="landing-wordmark">UniHub</span>
        </a>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <a href="#sign-in" className="landing-link" onClick={() => switchMode('login')}>
            Sign in
          </a>
          <a
            href="#sign-in"
            className="landing-cta landing-cta--nav"
            onClick={() => switchMode('register')}
          >
            Get started
          </a>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero" aria-labelledby="landing-brand">
          <div className="landing-hero-media" aria-hidden="true">
            <img
              src="/images/landing-students-campus.jpg"
              alt=""
              className="landing-hero-photo"
              width={1600}
              height={900}
            />
            <div className="landing-hero-scrim" />
          </div>

          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <p id="landing-brand" className="landing-brand-hero">
                UniHub
              </p>
              <h1 className="landing-headline">
                Campus teamwork, without the chaos.
              </h1>
              <p className="landing-lede">
                One place for teams, tasks, resources, and updates — built for university projects that actually ship.
              </p>
              <div className="landing-cta-group">
                <a href="#sign-in" className="landing-cta" onClick={() => switchMode('register')}>
                  Start free
                </a>
                <a href="#sign-in" className="landing-cta landing-cta--ghost" onClick={() => switchMode('login')}>
                  Sign in
                </a>
              </div>
            </div>

            <div className="landing-auth" id="sign-in">
              <div className="landing-auth-panel">
                <div className="landing-auth-tabs" role="tablist" aria-label="Account">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    className={`landing-auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                    onClick={() => switchMode('login')}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'register'}
                    className={`landing-auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                    onClick={() => switchMode('register')}
                  >
                    Create account
                  </button>
                </div>

                <h2 className="landing-auth-title">
                  {mode === 'login' ? 'Welcome back' : 'Join UniHub'}
                </h2>
                <p className="landing-auth-subtitle">
                  {mode === 'login'
                    ? 'Sign in to open your dashboard.'
                    : 'Create an account to start collaborating.'}
                </p>

                {errors.general && (
                  <div className="landing-auth-error" role="alert">
                    {errors.general}
                  </div>
                )}

                <form className="landing-auth-form" onSubmit={handleSubmit} noValidate>
                  {mode === 'register' && (
                    <div className="landing-auth-row">
                      <div className="landing-auth-field">
                        <label htmlFor="landing-firstName">First name</label>
                        <input
                          id="landing-firstName"
                          name="firstName"
                          autoComplete="given-name"
                          value={form.firstName}
                          onChange={(e) => setField('firstName', e.target.value)}
                          aria-invalid={!!errors.firstName}
                        />
                        {errors.firstName && <span>{errors.firstName}</span>}
                      </div>
                      <div className="landing-auth-field">
                        <label htmlFor="landing-lastName">Last name</label>
                        <input
                          id="landing-lastName"
                          name="lastName"
                          autoComplete="family-name"
                          value={form.lastName}
                          onChange={(e) => setField('lastName', e.target.value)}
                          aria-invalid={!!errors.lastName}
                        />
                        {errors.lastName && <span>{errors.lastName}</span>}
                      </div>
                    </div>
                  )}

                  <div className="landing-auth-field">
                    <label htmlFor="landing-email">Email</label>
                    <input
                      id="landing-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@university.edu"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <span>{errors.email}</span>}
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="landing-password">Password</label>
                    <input
                      id="landing-password"
                      name="password"
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && <span>{errors.password}</span>}
                  </div>

                  {mode === 'register' && (
                    <div className="landing-auth-field">
                      <label htmlFor="landing-confirmPassword">Confirm password</label>
                      <input
                        id="landing-confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => setField('confirmPassword', e.target.value)}
                        aria-invalid={!!errors.confirmPassword}
                      />
                      {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
                    </div>
                  )}

                  <button type="submit" className="landing-cta landing-cta--block" disabled={submitting}>
                    {submitting
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : mode === 'login'
                        ? 'Sign in'
                        : 'Create account'}
                  </button>
                </form>

                <div className="landing-auth-divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="landing-cta landing-cta--ghost landing-cta--block"
                  onClick={() => {
                    window.location.href = getGoogleAuthUrl();
                  }}
                >
                  Continue with Google
                </button>

                <p className="landing-auth-footer">
                  Prefer a full page?{' '}
                  <Link to={mode === 'login' ? '/user/login' : '/user/register'}>
                    Open {mode === 'login' ? 'sign in' : 'sign up'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" aria-labelledby="how-heading">
          <h2 id="how-heading" className="landing-section-title">
            Built for student teams
          </h2>
          <p className="landing-section-lede">
            From the first brainstorm to the final handoff — keep everyone aligned.
          </p>

          <div className="landing-story">
            <figure className="landing-story-figure">
              <img
                src="/images/landing-students-study.jpg"
                alt="Students studying together with laptops and textbooks"
                width={1200}
                height={800}
                loading="lazy"
              />
            </figure>
            <ul className="landing-features">
              <li>
                <h3>Teams</h3>
                <p>Create groups, invite classmates, and keep membership clear.</p>
              </li>
              <li>
                <h3>Tasks</h3>
                <p>Assign work, track status, and hit deadlines without the spreadsheet mess.</p>
              </li>
              <li>
                <h3>Resources</h3>
                <p>Share files and notes in one hub your whole team can find.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="landing-section landing-section--photo" aria-labelledby="campus-heading">
          <div className="landing-photo-panel">
            <img
              src="/images/landing-students-brainstorm.jpg"
              alt="Classmates brainstorming ideas on a classroom whiteboard"
              width={1200}
              height={900}
              loading="lazy"
            />
            <div className="landing-photo-caption">
              <h2 id="campus-heading">Made for how students actually work</h2>
              <p>Plan projects, share progress, and stay in sync — whether you&apos;re in the library or between lectures.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-wordmark landing-wordmark--sm">UniHub</span>
        <p>University collaboration, simplified.</p>
      </footer>
    </div>
  );
};

export default Landing;
