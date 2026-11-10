// src/utils/crud.js
// ---------------------------------------------------------------------
// Fabrique un CRUD complet pour N'IMPORTE QUELLE table.
// Elle lit les colonnes réelles (SHOW COLUMNS) : seules les colonnes qui
// EXISTENT sont enregistrées, donc pas d'erreur si un champ est en trop.
// ---------------------------------------------------------------------
const db = require('../config/db');
const httpError = require('./httpError');
const asyncHandler = require('./asyncHandler');
const { lirePagination } = require('./pagination');

const cache = {};

async function getStructure(table) {
  if (cache[table]) return cache[table];
  const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\``);
  const pk = cols.find((c) => c.Key === 'PRI') || cols[0];
  cache[table] = {
    names: cols.map((c) => c.Field),
    texte: cols.filter((c) => /char|text/i.test(c.Type)).map((c) => c.Field),
    pk: pk.Field,
    auto: cols.filter((c) => /auto_increment/i.test(c.Extra)).map((c) => c.Field),
  };
  return cache[table];
}

const vide = (v) => (v === '' || v === undefined ? null : v);

// Garde seulement les colonnes qui existent
async function filtrer(table, data, { creation = true } = {}) {
  const s = await getStructure(table);
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (!s.names.includes(k) || s.auto.includes(k)) continue;
    if (k === s.pk && !creation) continue;
    out[k] = vide(v);
  }
  return out;
}

async function inserer(table, data, conn = db) {
  const propre = await filtrer(table, data);
  if (!Object.keys(propre).length) throw httpError(400, 'Aucune donnée valide reçue.');
  const [r] = await conn.query(`INSERT INTO \`${table}\` SET ?`, [propre]);
  return r.insertId || propre[(await getStructure(table)).pk];
}

async function mettreAJour(table, id, data, conn = db) {
  const s = await getStructure(table);
  const propre = await filtrer(table, data, { creation: false });
  if (!Object.keys(propre).length) return;
  await conn.query(`UPDATE \`${table}\` SET ? WHERE \`${s.pk}\` = ?`, [propre, id]);
}

async function trouver(table, id, conn = db) {
  const s = await getStructure(table);
  const [rows] = await conn.query(`SELECT * FROM \`${table}\` WHERE \`${s.pk}\` = ?`, [id]);
  return rows[0] || null;
}

async function trouverOu404(table, id, message = 'Élément introuvable.', conn = db) {
  const row = await trouver(table, id, conn);
  if (!row) throw httpError(404, message);
  return row;
}

/**
 * @param {string} table  nom réel de la table
 * @param {object} opts   { masquer:['mot_de_passe'], tri:'nom ASC', avantCreation, apresCreation, avantModification }
 */
function creerCrud(table, opts = {}) {
  const masquer = opts.masquer || [];
  const cache_ = (row) => {
    if (!row) return row;
    const c = { ...row };
    masquer.forEach((k) => delete c[k]);
    return c;
  };

  return {
    // GET /   (?q=texte  &  colonne=valeur  &  page=1&limit=20)
    lister: asyncHandler(async (req, res) => {
      const s = await getStructure(table);
      const where = [];
      const params = [];
      const ignores = ['q', 'page', 'limit', 'format'];
      for (const [k, v] of Object.entries(req.query)) {
        if (!ignores.includes(k) && s.names.includes(k) && v !== '') {
          where.push(`\`${k}\` = ?`);
          params.push(v);
        }
      }
      if (req.query.q) {
        const champs = s.texte.filter((c) => !masquer.includes(c)).slice(0, 6);
        if (champs.length) {
          where.push('(' + champs.map((c) => `\`${c}\` LIKE ?`).join(' OR ') + ')');
          champs.forEach(() => params.push(`%${req.query.q}%`));
        }
      }
      const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';
      const tri = opts.tri || `\`${s.pk}\` DESC`;
      const p = lirePagination(req.query);

      if (p.active) {
        const [[{ n }]] = await db.query(`SELECT COUNT(*) n FROM \`${table}\`${clause}`, params);
        const [rows] = await db.query(`SELECT * FROM \`${table}\`${clause} ORDER BY ${tri} LIMIT ? OFFSET ?`, [...params, p.limit, p.offset]);
        return res.json({ rows: rows.map(cache_), total: n, page: p.page, limit: p.limit });
      }
      const [rows] = await db.query(`SELECT * FROM \`${table}\`${clause} ORDER BY ${tri}`, params);
      res.json(rows.map(cache_));
    }),

    // GET /:id
    detail: asyncHandler(async (req, res) => {
      res.json(cache_(await trouverOu404(table, req.params.id)));
    }),

    // POST /
    creer: asyncHandler(async (req, res) => {
      const data = opts.avantCreation ? await opts.avantCreation(req.body, req) : req.body;
      const id = await inserer(table, data);
      const row = await trouver(table, id);
      if (opts.apresCreation) await opts.apresCreation(row, req);
      res.status(201).json(cache_(row));
    }),

    // PUT /:id
    modifier: asyncHandler(async (req, res) => {
      await trouverOu404(table, req.params.id);
      const data = opts.avantModification ? await opts.avantModification(req.body, req) : req.body;
      await mettreAJour(table, req.params.id, data);
      res.json(cache_(await trouver(table, req.params.id)));
    }),

    // DELETE /:id
    supprimer: asyncHandler(async (req, res) => {
      const s = await getStructure(table);
      await trouverOu404(table, req.params.id);
      await db.query(`DELETE FROM \`${table}\` WHERE \`${s.pk}\` = ?`, [req.params.id]);
      res.json({ message: 'Supprimé.' });
    }),
  };
}

module.exports = { creerCrud, getStructure, filtrer, inserer, mettreAJour, trouver, trouverOu404 };
