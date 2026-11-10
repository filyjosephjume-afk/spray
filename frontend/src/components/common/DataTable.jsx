import { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar';
import StatutBadge from './StatutBadge';
import { PAGE_SIZE } from '../../utils/constants';
import { formatDate, formatMoney } from '../../utils/formatDate';
import { norm } from '../../utils/helpers';

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
}

/**
 * Tableau avec recherche, tri par colonne et pagination.
 *  columns : [{ key, label, render?(row), sortValue?(row), searchValue?(row), sortable? }]
 *  La recherche porte sur le texte affiché (searchValue) ET sur les valeurs brutes, sans tenir compte des accents.
 *  actions : (row) => boutons affichés à droite de chaque ligne
 */
export default function DataTable({
  columns,
  rows = [],
  rowKey = 'id',
  actions,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  pageSize = PAGE_SIZE,
  emptyText = 'Aucune donnée.',
  onRowClick,
  toolbar,
}) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  useEffect(() => setPage(1), [q, rows.length]);

  const filtered = useMemo(() => {
    const s = norm(q);
    let r = rows;
    if (s) {
      r = r.filter((row) => {
        const affiche = columns.map((c) => (c.searchValue ? c.searchValue(row) : '')).join(' ');
        const brut = Object.values(row).join(' ');
        return norm(`${affiche} ${brut}`).includes(s);
      });
    }
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      const val = (row) => (col?.sortValue ? col.sortValue(row) : row[sort.key]);
      r = [...r].sort((a, b) => compare(val(a), val(b)) * (sort.dir === 'asc' ? 1 : -1));
    }
    return r;
  }, [rows, q, sort, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const colSpan = columns.length + (actions ? 1 : 0);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const keyOf = (row, i) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]) ?? i;

  return (
    <div className="card">
      {(searchable || toolbar) && (
        <div className="table-tools">
          {searchable && <SearchBar value={q} onChange={setQ} placeholder={searchPlaceholder} />}
          {toolbar}
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => {
                const canSort = c.sortable !== false && (c.key || c.sortValue);
                return (
                  <th key={c.key || c.label} className={canSort ? 'sortable' : ''} onClick={canSort ? () => toggleSort(c.key) : undefined}>
                    {c.label}
                    {sort.key === c.key && (sort.dir === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                );
              })}
              {actions && <th />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={colSpan} className="empty">
                  Chargement...
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="empty">
                  {q ? 'Aucun résultat pour cette recherche.' : emptyText}
                </td>
              </tr>
            )}
            {!loading &&
              visible.map((row, i) => (
                <tr key={keyOf(row, i)} className={onRowClick ? 'clickable' : ''} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {columns.map((c) => (
                    <td key={c.key || c.label}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                  ))}
                  {actions && <td className="actions">{actions(row)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>{filtered.length} résultat(s)</span>
        {pages > 1 && (
          <span className="pages">
            <button className="btn btn-outline btn-sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Précédent
            </button>
            Page {current} / {pages}
            <button className="btn btn-outline btn-sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
              Suivant
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

// Fabrique des colonnes automatiquement à partir des données
// (pratique quand on ne connaît pas encore les colonnes d'une vue SQL).
export function autoColumns(rows, { hide = [] } = {}) {
  if (!rows || !rows.length) return [];
  return Object.keys(rows[0])
    .filter((k) => !hide.includes(k) && (rows[0][k] === null || typeof rows[0][k] !== 'object'))
    .map((k) => {
      const lower = k.toLowerCase();
      let render;
      if (lower.includes('date')) render = (r) => formatDate(r[k]);
      else if (/cout|prix|montant|total/.test(lower)) render = (r) => formatMoney(r[k]);
      else if (lower.includes('statut') || lower === 'etat') render = (r) => <StatutBadge value={r[k]} />;
      else render = (r) => (r[k] === null || r[k] === undefined || r[k] === '' ? '—' : String(r[k]));
      const label = k.replace(/_/g, ' ').replace(/^id /, 'N° ');
      return { key: k, label: label.charAt(0).toUpperCase() + label.slice(1), render };
    });
}
