import { Link } from 'react-router-dom';

// Carte de chiffre clé. tone = primary | success | warning | danger ; "to" la rend cliquable.
export default function StatCard({ label, value, hint, tone = 'primary', to }) {
  const body = (
    <>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </>
  );
  const cls = `card stat-card tone-${tone}`;
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
