// Dates et montants : toutes les fonctions acceptent null / undefined sans erreur.

const p = (n) => String(n).padStart(2, '0');

// Renvoie "AAAA-MM-JJ" (format des <input type="date">).
// Gère aussi les dates ISO du back-end ("2026-01-15T00:00:00.000Z") sans décalage d'un jour.
export function toYMD(v) {
  if (!v) return '';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.slice(0, 10);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 2026-01-15 -> 15/01/2026
export function formatDate(v) {
  const s = toYMD(v);
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return y && m && d ? `${d}/${m}/${y}` : s;
}

export function formatDateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Date du jour au format AAAA-MM-JJ
export const today = () => new Date().toLocaleDateString('en-CA');

// Nombre de jours jusqu'à une date (négatif si elle est passée, null si pas de date)
export function daysUntil(v) {
  const s = toYMD(v);
  if (!s) return null;
  const target = new Date(`${s}T00:00:00`);
  const now = new Date(`${today()}T00:00:00`);
  return Math.round((target - now) / 86400000);
}

// 3500000 -> "3 500 000 Ar"
export function formatMoney(n) {
  if (n === null || n === undefined || n === '') return '—';
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n);
  return `${x.toLocaleString('fr-FR')} Ar`;
}
