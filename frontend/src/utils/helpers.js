import { toYMD } from './formatDate';

// Première valeur non vide parmi plusieurs noms de colonnes possibles.
// Exemple : pick(row, ['nom_categorie', 'categorie'])
export function pick(obj, keys, fallback = '') {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

// Texte sans accents, en minuscules, "_" remplacé par un espace
export const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .trim();

// Famille d'un statut d'actif, quelle que soit l'écriture exacte en base
export function statutKind(statut) {
  const s = norm(statut);
  if (/rebut|hors service|perdu/.test(s)) return 'rebut';
  if (/maint|repar/.test(s)) return 'maintenance';
  if (/sorti|pret|emprunt|affect/.test(s)) return 'sorti';
  if (/dispon|stock|libre/.test(s)) return 'disponible';
  return 'autre';
}

// Cherche le libellé d'un id dans une liste (ex. nom de la catégorie)
export function lookup(list, idKeys, id, labelKeys) {
  if (id === null || id === undefined || id === '') return '';
  const row = (list || []).find((r) => String(pick(r, idKeys, '')) === String(id));
  return row ? String(pick(row, labelKeys, '')) : '';
}

export const labelPersonne = (e) =>
  [e?.prenom, e?.nom].filter(Boolean).join(' ') || e?.matricule || '';

/* ---------- Formulaires ---------- */

// Valeurs initiales d'un formulaire à partir de la liste des champs
export function defaultValues(fields, extra = {}) {
  const v = {};
  fields.forEach((f) => {
    v[f.name] = f.default !== undefined ? f.default : f.type === 'checkbox' ? false : '';
  });
  return { ...v, ...extra };
}

// Valeurs d'un formulaire de modification à partir d'une ligne de la base
export function valuesFromRow(fields, row) {
  const v = {};
  fields.forEach((f) => {
    const raw = row?.[f.name];
    if (f.type === 'password') v[f.name] = '';
    else if (f.type === 'checkbox') v[f.name] = raw === true || Number(raw) === 1;
    else if (f.type === 'date') v[f.name] = toYMD(raw);
    else v[f.name] = raw ?? '';
  });
  return v;
}

// Objet envoyé à l'API : "" devient null, les nombres sont convertis
export function buildPayload(fields, values) {
  const out = {};
  fields.forEach((f) => {
    let v = values[f.name];
    if (f.type === 'password' && (v === '' || v == null)) return; // jamais envoyé vide
    if (v === '' || v === undefined) v = null;
    else if (f.type === 'number' || f.type === 'money') v = Number(v);
    out[f.name] = v;
  });
  return out;
}

export function emptyToNull(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]));
}

/* ---------- Export CSV (s'ouvre dans Excel) ---------- */

const csvEscape = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// columns : [{ label, value: (row) => ... }] ; sans columns, toutes les colonnes simples
export function toCSV(rows, columns) {
  if (!rows.length) return '';
  const cols =
    columns ||
    Object.keys(rows[0])
      .filter((k) => rows[0][k] === null || typeof rows[0][k] !== 'object')
      .map((k) => ({ label: k, value: (r) => r[k] }));
  const head = cols.map((c) => csvEscape(c.label)).join(';');
  const lines = rows.map((r) => cols.map((c) => csvEscape(c.value(r))).join(';'));
  return [head, ...lines].join('\r\n');
}

export function downloadFile(content, filename, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + content], { type }); // BOM : accents corrects dans Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
