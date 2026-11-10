import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

const MENU = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/actifs', label: 'Actifs' },
  { to: '/mouvements', label: 'Mouvements' },
  { to: '/maintenances', label: 'Maintenances' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/licences', label: 'Licences' },
  { to: '/etudiants', label: 'Étudiants' },
  { to: '/pointages', label: 'Pointages' },
  { to: '/autorisations', label: 'Autorisations' },
  { to: '/rapports', label: 'Rapports' },
  { to: '/parametres', label: 'Paramètres' },
  { to: '/utilisateurs', label: 'Administration', admin: true },
];

export default function MainLayout() {
  const { user, roles, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Referme le menu mobile quand on change de page
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nom = [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.email || 'Utilisateur';

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">{APP_NAME.charAt(0)}</span>
          {APP_NAME}
        </div>
        <nav>
          {MENU.filter((m) => !m.admin || isAdmin).map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
            ☰
          </button>
          <div className="topbar-title">Gestion des actifs et équipements</div>
          <div className="topbar-user">
            <div className="avatar">{nom.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{nom}</div>
              {roles.length > 0 && <div className="user-role">{roles.join(', ')}</div>}
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
