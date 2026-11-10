// src/controllers/dashboard.controller.js
// GET /api/dashboard : chiffres du tableau de bord (chaque calcul est indépendant)
const db = require('../config/db');
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { STATUT_ACTIF: A, STATUT_INCIDENT: I } = require('../utils/constants');
const alertes = require('./alerte.controller');

async function compter(sql, params = []) {
  try {
    const [[row]] = await db.query(sql, params);
    return Number(row.n);
  } catch {
    return null; // table absente : le front affichera « — »
  }
}

exports.stats = asyncHandler(async (req, res) => {
  const a = `\`${T.actif}\``;
  const [total, disponibles, sortis, enMaintenance, rebuts, incidents, licences, listeAlertes] = await Promise.all([
    compter(`SELECT COUNT(*) n FROM ${a}`),
    compter(`SELECT COUNT(*) n FROM ${a} WHERE statut = ?`, [A.DISPONIBLE]),
    compter(`SELECT COUNT(*) n FROM ${a} WHERE statut = ?`, [A.SORTI]),
    compter(`SELECT COUNT(*) n FROM ${a} WHERE statut = ?`, [A.EN_MAINTENANCE]),
    compter(`SELECT COUNT(*) n FROM ${a} WHERE statut = ?`, [A.REBUT]),
    compter(`SELECT COUNT(*) n FROM \`${T.incident}\` WHERE statut <> ?`, [I.RESOLU]),
    compter(`SELECT COUNT(*) n FROM \`${T.licence}\` WHERE date_expiration IS NOT NULL AND date_expiration <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`),
    alertes.calculer().catch(() => []),
  ]);
  res.json({
    total_actifs: total,
    disponibles,
    sortis,
    en_maintenance: enMaintenance,
    rebuts,
    incidents_ouverts: incidents,
    licences_a_renouveler: licences,
    nombre_alertes: listeAlertes.length,
  });
});
