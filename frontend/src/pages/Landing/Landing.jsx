import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="#top" className="landing-nav-brand" aria-label="UniHub home">
          <span className="landing-mark" aria-hidden="true">UH</span>
          <span className="landing-wordmark">UniHub</span>
        </a>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/user/login" className="landing-link">
            Sign in
          </Link>
          <Link to="/user/register" className="landing-cta landing-cta--nav">
            Get started
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero" aria-labelledby="landing-brand">
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
              <Link to="/user/register" className="landing-cta">
                Start free
              </Link>
              <Link to="/user/login" className="landing-cta landing-cta--ghost">
                Sign in
              </Link>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-visual-plane">
              <div className="landing-visual-glow" />
              <svg
                className="landing-scene"
                viewBox="0 0 640 480"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
              >
                <defs>
                  <linearGradient id="desk" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#134e4a" />
                  </linearGradient>
                  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ecfeff" />
                    <stop offset="100%" stopColor="#99f6e4" />
                  </linearGradient>
                </defs>
                <rect x="40" y="60" width="560" height="340" rx="28" fill="url(#desk)" opacity="0.92" />
                <rect x="90" y="110" width="280" height="180" rx="14" fill="#042f2e" />
                <rect x="104" y="124" width="252" height="140" rx="8" fill="url(#screen)" />
                <rect className="landing-bar landing-bar--a" x="120" y="148" width="120" height="10" rx="5" fill="#0f766e" />
                <rect className="landing-bar landing-bar--b" x="120" y="172" width="180" height="10" rx="5" fill="#14b8a6" />
                <rect className="landing-bar landing-bar--c" x="120" y="196" width="90" height="10" rx="5" fill="#0d9488" />
                <circle className="landing-pulse" cx="470" cy="180" r="54" fill="#f0fdfa" opacity="0.18" />
                <circle cx="470" cy="180" r="36" fill="#ccfbf1" />
                <path
                  d="M452 180l12 12 24-28"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="390" y="250" width="150" height="90" rx="12" fill="#115e59" />
                <rect x="406" y="268" width="70" height="8" rx="4" fill="#5eead4" opacity="0.8" />
                <rect x="406" y="286" width="110" height="8" rx="4" fill="#99f6e4" opacity="0.55" />
                <rect x="406" y="304" width="88" height="8" rx="4" fill="#99f6e4" opacity="0.4" />
              </svg>
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
