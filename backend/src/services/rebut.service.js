// src/services/rebut.service.js : mise au rebut d'un actif
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const { STATUT_ACTIF } = require('../utils/constants');
const { memeValeur } = require('../utils/validators');
const { aujourdhui } = require('../utils/dates');
const { inserer, mettreAJour, trouverOu404 } = require('../utils/crud');

exports.mettreAuRebut = async ({ id_actif, motif, date_rebut }, utilisateur) => {
  const actif = await trouverOu404(T.actif, id_actif, 'Actif introuvable.');
  if (memeValeur(actif.statut, STATUT_ACTIF.REBUT)) throw httpError(400, 'Cet actif est déjà au rebut.');
  if (memeValeur(actif.statut, STATUT_ACTIF.SORTI)) throw httpError(400, "Cet actif est sorti : enregistre d'abord son retour.");

  return db.transaction(async (conn) => {
    const id = await inserer(T.rebut, {
      id_actif,
      motif,
      date_rebut: date_rebut || aujourdhui(),
      id_utilisateur: utilisateur?.id,
    }, conn);
    await mettreAJour(T.actif, id_actif, { statut: STATUT_ACTIF.REBUT }, conn);
    return id;
  });
};
