// src/services/affectation.service.js
// Affecter un actif : l'ancienne affectation est clôturée, la nouvelle est créée.
const db = require('../config/db');
const T = require('../config/tables');
const { aujourdhui } = require('../utils/dates');
const { inserer, trouverOu404, getStructure } = require('../utils/crud');

exports.affecter = async (body, utilisateur) => {
  await trouverOu404(T.actif, body.id_actif, 'Actif introuvable.');
  const s = await getStructure(T.affectation);
  const debut = body.date_debut || body.date_affectation || aujourdhui();

  return db.transaction(async (conn) => {
    // 1) clôturer l'affectation en cours (date_fin vide)
    if (s.names.includes('date_fin')) {
      await conn.query(`UPDATE \`${T.affectation}\` SET date_fin = ? WHERE id_actif = ? AND date_fin IS NULL`, [debut, body.id_actif]);
    }
    // 2) créer la nouvelle
    return inserer(T.affectation, { ...body, date_debut: debut, id_utilisateur: utilisateur?.id }, conn);
  });
};
