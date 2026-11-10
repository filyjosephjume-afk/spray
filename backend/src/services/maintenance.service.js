// src/services/maintenance.service.js
// Création : l'actif passe en maintenance. Fin : l'actif redevient disponible
// et la prochaine maintenance peut être calculée (periodicite_jours).
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const { STATUT_ACTIF: A, STATUT_MAINTENANCE: M } = require('../utils/constants');
const { memeValeur } = require('../utils/validators');
const { aujourdhui, addDays } = require('../utils/dates');
const { inserer, mettreAJour, trouver, trouverOu404 } = require('../utils/crud');

exports.demarrer = async (body, utilisateur) => {
  const actif = await trouverOu404(T.actif, body.id_actif, 'Actif introuvable.');
  if (memeValeur(actif.statut, A.REBUT)) throw httpError(400, 'Cet actif est au rebut.');
  if (memeValeur(actif.statut, A.SORTI)) throw httpError(400, "Cet actif est sorti : enregistre d'abord son retour.");

  return db.transaction(async (conn) => {
    const id = await inserer(T.maintenance, {
      statut_maintenance: M.EN_COURS,
      date_debut: aujourdhui(),
      ...body,
      id_utilisateur: utilisateur?.id,
    }, conn);
    await mettreAJour(T.actif, body.id_actif, { statut: A.EN_MAINTENANCE }, conn);
    return id;
  });
};

// body : { date_fin?, cout?, date_prochaine?, periodicite_jours? }
exports.terminer = async (id, body) => {
  const m = await trouverOu404(T.maintenance, id, 'Maintenance introuvable.');
  if (memeValeur(m.statut_maintenance, M.TERMINEE)) throw httpError(400, 'Cette maintenance est déjà terminée.');
  const fin = body.date_fin || aujourdhui();
  const prochaine = body.date_prochaine || (body.periodicite_jours ? addDays(fin, body.periodicite_jours) : undefined);

  return db.transaction(async (conn) => {
    await mettreAJour(T.maintenance, id, { statut_maintenance: M.TERMINEE, date_fin: fin, cout: body.cout, date_prochaine: prochaine }, conn);
    const actif = await trouver(T.actif, m.id_actif, conn);
    if (actif && memeValeur(actif.statut, A.EN_MAINTENANCE)) await mettreAJour(T.actif, m.id_actif, { statut: A.DISPONIBLE }, conn);
    return id;
  });
};
