// src/controllers/actif.controller.js
// CRUD des actifs + coûts, historique, QR code, mise au rebut
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { STATUT_ACTIF } = require('../utils/constants');
const { creerCrud, getStructure, trouver } = require('../utils/crud');
const { lireActifs } = require('../utils/actifView');
const rebutService = require('../services/rebut.service');
const qrService = require('../services/qrcode.service');

const crud = creerCrud(T.actif, {
  avantCreation: async (body) => ({ statut: STATUT_ACTIF.DISPONIBLE, ...body }),
});
module.exports = { creer: crud.creer, modifier: crud.modifier, supprimer: crud.supprimer };

// GET /api/actifs  (?q= & statut= & etat= & id_categorie= & id_salle= & id_fournisseur=)
module.exports.lister = asyncHandler(async (req, res) => {
  const s = await getStructure(T.actif);
  const where = [];
  const params = [];
  for (const champ of ['statut', 'etat', 'id_categorie', 'id_salle', 'id_fournisseur']) {
    if (req.query[champ] && s.names.includes(champ)) {
      where.push(`a.\`${champ}\` = ?`);
      params.push(req.query[champ]);
    }
  }
  if (req.query.q) {
    const champs = ['code_inventaire', 'designation', 'marque', 'modele', 'numero_serie'].filter((c) => s.names.includes(c));
    if (champs.length) {
      where.push('(' + champs.map((c) => `a.\`${c}\` LIKE ?`).join(' OR ') + ')');
      champs.forEach(() => params.push(`%${req.query.q}%`));
    }
  }
  const suite = (where.length ? 'WHERE ' + where.join(' AND ') : '') + ` ORDER BY a.\`${s.pk}\` DESC`;
  res.json(await lireActifs(suite, params));
});

// GET /api/actifs/:id
module.exports.detail = asyncHandler(async (req, res) => {
  const s = await getStructure(T.actif);
  const rows = await lireActifs(`WHERE a.\`${s.pk}\` = ?`, [req.params.id]);
  if (!rows[0]) throw httpError(404, 'Actif introuvable.');
  res.json(rows[0]);
});

// GET /api/actifs/couts  (vue v_cout_actif)
module.exports.couts = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM \`${T.v_cout_actif}\``);
  res.json(rows);
});

// GET /api/actifs/:id/historique  (vue v_historique_actif, sinon assemblage simple)
module.exports.historique = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM \`${T.v_historique_actif}\` WHERE id_actif = ?`, [req.params.id]);
    return res.json(rows);
  } catch (err) {
    if (!['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_FIELD_ERROR', 'ER_CANT_AGGREGATE_2COLLATIONS', 'ER_CANT_AGGREGATE_NCOLLATIONS'].includes(err.code)) throw err;
  }
  const id = req.params.id;
  const evenements = [];
  const essayer = async (sql) => {
    try { const [r] = await db.query(sql, [id]); evenements.push(...r); } catch { /* table absente : ignorée */ }
  };
  await essayer(`SELECT 'mouvement' AS evenement, date_mouvement AS date_evenement, observation FROM \`${T.mouvement}\` WHERE id_actif = ?`);
  await essayer(`SELECT 'maintenance' AS evenement, date_debut AS date_evenement, description AS observation FROM \`${T.maintenance}\` WHERE id_actif = ?`);
  await essayer(`SELECT 'incident' AS evenement, date_incident AS date_evenement, description AS observation FROM \`${T.incident}\` WHERE id_actif = ?`);
  evenements.sort((a, b) => String(b.date_evenement).localeCompare(String(a.date_evenement)));
  res.json(evenements);
});

// GET /api/actifs/:id/qrcode  -> { url, code_barres, qr (image base64) }
module.exports.qrcode = asyncHandler(async (req, res) => res.json(await qrService.pourActif(req.params.id)));

// POST /api/actifs/:id/rebut  { motif }
module.exports.rebut = asyncHandler(async (req, res) => {
  await rebutService.mettreAuRebut({ ...req.body, id_actif: req.params.id }, req.user);
  res.json(await trouver(T.actif, req.params.id));
});
