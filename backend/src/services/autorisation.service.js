// src/services/autorisation.service.js
// Décision du Directeur (accordée / refusée) et passage au statut "utilisée"
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const { STATUT_AUTORISATION: S } = require('../utils/constants');
const { memeValeur } = require('../utils/validators');
const { aujourdhui } = require('../utils/dates');
const { mettreAJour, trouverOu404, getStructure } = require('../utils/crud');

// decision = 'accordee' | 'refusee'
exports.decider = async (id, decision, commentaire, utilisateur) => {
  const aut = await trouverOu404(T.autorisation, id, 'Autorisation introuvable.');
  if (!memeValeur(aut.statut, S.EN_ATTENTE)) throw httpError(400, `Décision impossible : l'autorisation est déjà « ${aut.statut} ».`);
  const statut = memeValeur(decision, 'accordee') ? S.ACCORDEE : memeValeur(decision, 'refusee') ? S.REFUSEE : null;
  if (!statut) throw httpError(400, "La décision doit être « accordee » ou « refusee ».");

  await mettreAJour(T.autorisation, id, {
    statut,
    commentaire_decision: commentaire,
    date_decision: aujourdhui(),
    id_decideur: utilisateur?.id,
    id_utilisateur_decision: utilisateur?.id,
  });
  return trouverOu404(T.autorisation, id);
};

// Cherche une autorisation accordée et valable pour (étudiant, actif)
exports.trouverValable = async (idEtudiant, idActif, conn = db) => {
  const s = await getStructure(T.autorisation);
  const peutFiltrerActif = s.names.includes('id_actif');
  const params = [S.ACCORDEE, idEtudiant];
  let sql = `SELECT * FROM \`${T.autorisation}\` WHERE statut = ? AND id_etudiant = ?`;
  if (peutFiltrerActif) {
    sql += ' AND (id_actif = ? OR id_actif IS NULL)';
    params.push(idActif);
  }
  if (s.names.includes('date_debut')) sql += ' AND (date_debut IS NULL OR date_debut <= CURDATE())';
  if (s.names.includes('date_fin')) sql += ' AND (date_fin IS NULL OR date_fin >= CURDATE())';
  sql += ` ORDER BY \`${s.pk}\` DESC LIMIT 1`;
  const [rows] = await conn.query(sql, params);
  return rows[0] || null;
};

exports.marquerUtilisee = (id, conn) => mettreAJour(T.autorisation, id, { statut: S.UTILISEE }, conn);
