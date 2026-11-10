import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { errMsg } from '../api/axios';
import Alert from '../components/common/Alert';
import { APP_NAME } from '../utils/constants';

/* Petites icônes SVG (aucune bibliothèque à installer) */
const Svg = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const IconMail = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
const IconLock = () => (
  <Svg>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);
const IconEye = ({ off }) => (
  <Svg>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="m4 4 16 16" />}
  </Svg>
);
const IconArrow = () => (
  <Svg size={16}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);
  const [oublie, setOublie] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from?.pathname || '/';
  if (user) return <Navigate to={destination} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), motDePasse);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card2">
        {/* ---------- Panneau gauche ---------- */}
        <aside className="login-hero">
          <div className="login-logo">{APP_NAME.charAt(0)}</div>

          <div className="login-hero-text">
            <h1>
              Bienvenue<span className="dot">.</span>
            </h1>
            <p>Gestion unifiée des actifs et équipements d'entreprise.</p>
          </div>

          <div className="login-watermark">
            <IconBox />
          </div>

          <div className="login-quote">
            <q>Chaque équipement tracé, de l'acquisition jusqu'au rebut.</q>
            <span>{APP_NAME.toUpperCase()}</span>
          </div>
        </aside>

        {/* ---------- Panneau droit ---------- */}
        <main className="login-panel">
          <div className="login-box">
            <h2>Connexion à votre espace</h2>
            <p className="login-sub">Veuillez saisir vos identifiants pour continuer.</p>

            <Alert type="error">{error}</Alert>

            <form onSubmit={submit}>
              <div className="lf">
                <div className="lf-head">
                  <label htmlFor="email">Email professionnel</label>
                </div>
                <div className="lf-input">
                  <span className="lf-icon">
                    <IconMail />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.mg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="lf">
                <div className="lf-head">
                  <label htmlFor="mdp">Mot de passe</label>
                  <button type="button" className="lf-link" onClick={() => setOublie(!oublie)}>
                    Oublié ?
                  </button>
                </div>
                <div className="lf-input">
                  <span className="lf-icon">
                    <IconLock />
                  </span>
                  <input
                    id="mdp"
                    type={voirMdp ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lf-eye"
                    onClick={() => setVoirMdp(!voirMdp)}
                    aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <IconEye off={voirMdp} />
                  </button>
                </div>
                {oublie && <p className="lf-hint">Contactez l'administrateur pour réinitialiser votre mot de passe.</p>}
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  'Patientez...'
                ) : (
                  <>
                    Se connecter <IconArrow />
                  </>
                )}
              </button>
            </form>

            <p className="login-foot">Accès réservé au personnel autorisé.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
