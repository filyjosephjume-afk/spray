// src/controllers/alerte.controller.js
// GET /api/alertes : vue v_alertes, sinon calcul (garanties, licences, maintenances sous 30 jours)
const db = require('../config/db');
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');

exports.calculer = async () => {
  try {
    const [rows] = await db.query(`SELECT * FROM \`${T.v_alertes}\``);
    return rows;
  } catch (err) {
    if (!['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_FIELD_ERROR', 'ER_CANT_AGGREGATE_2COLLATIONS', 'ER_CANT_AGGREGATE_NCOLLATIONS'].includes(err.code)) throw err;
  }
  const alertes = [];
  const ajouter = async (sql) => {
    try { const [r] = await db.query(sql); alertes.push(...r); } catch { /* ignoré */ }
  };
  await ajouter(`SELECT 'licence' AS type_alerte, CONCAT('Licence ', nom_logiciel, ' à renouveler') AS message, date_expiration AS date_echeance, id_actif
                 FROM \`${T.licence}\` WHERE date_expiration IS NOT NULL AND date_expiration <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`);
  await ajouter(`SELECT 'garantie' AS type_alerte, CONCAT('Garantie bientôt terminée : ', designation) AS message, date_fin_garantie AS date_echeance, id_actif
                 FROM \`${T.actif}\` WHERE date_fin_garantie IS NOT NULL AND date_fin_garantie <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`);
  await ajouter(`SELECT 'maintenance' AS type_alerte, CONCAT('Maintenance à prévoir (', type_maintenance, ')') AS message, date_prochaine AS date_echeance, id_actif
                 FROM \`${T.maintenance}\` WHERE date_prochaine IS NOT NULL AND date_prochaine <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`);
  return alertes.sort((x, y) => String(x.date_echeance).localeCompare(String(y.date_echeance)));
};

exports.lister = asyncHandler(async (req, res) => res.json(await exports.calculer()));
