import { norm } from '../../utils/helpers';

// Choisit la couleur d'après le sens du mot, quelle que soit l'écriture exacte en base.
function tone(value) {
  const s = norm(value);
  if (/inactif|desactiv|rebut|perdu|hors|expir|refus|critique|elev|defect|annul|echec/.test(s)) return 'danger';
  if (/maint|attente|cours|moyenne|ouvert|alerte|prevu|a renouveler/.test(s)) return 'warning';
  if (/sorti|affect|pret|emprunt|usage|corrective/.test(s)) return 'info';
  if (/dispon|stock|resolu|termin|accord|valid|actif|neuf|bon|faible|ok|retour|preventive|oui/.test(s)) return 'success';
  return 'neutral';
}

const humanize = (v) => {
  const s = String(v ?? '').replace(/_/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
};

export default function StatutBadge({ value, label }) {
  if (value === null || value === undefined || value === '') return <span className="muted">—</span>;
  return <span className={`badge badge-${tone(value)}`}>{label ?? humanize(value)}</span>;
}
