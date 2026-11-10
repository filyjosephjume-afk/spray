// src/services/mouvement.service.js : sortie / retour d'un équipement
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const { STATUT_ACTIF: A, AUTORISATION_OBLIGATOIRE } = require('../utils/constants');
const { memeValeur } = require('../utils/validators');
const { aujourdhui } = require('../utils/dates');
const { inserer, mettreAJour, trouver, trouverOu404, getStructure } = require('../utils/crud');
const autorisation = require('./autorisation.service');

// Le type du mouvement s'écrit "type_mouvement" ou "type" selon la table
async function colonneType() {
  const s = await getStructure(T.mouvement);
  return s.names.includes('type_mouvement') ? 'type_mouvement' : s.names.includes('type') ? 'type' : null;
}

exports.sortie = async (body, utilisateur) => {
  if (!body.id_actif) throw httpError(400, "Choisis l'actif.");
  const actif = await trouverOu404(T.actif, body.id_actif, 'Actif introuvable.');
  if (!memeValeur(actif.statut, A.DISPONIBLE)) throw httpError(400, `Cet actif n'est pas disponible (statut : ${actif.statut}).`);

  const colType = await colonneType();
  return db.transaction(async (conn) => {
    // Vérification de l'autorisation (si un étudiant emprunte)
    let aut = null;
    if (body.id_etudiant) {
      aut = body.id_autorisation
        ? await trouver(T.autorisation, body.id_autorisation, conn)
        : await autorisation.trouverValable(body.id_etudiant, body.id_actif, conn);
      if (!aut && AUTORISATION_OBLIGATOIRE) throw httpError(403, "Sortie refusée : aucune autorisation accordée pour cet étudiant.");
    }

    const id = await inserer(T.mouvement, {
      ...body,
      ...(colType ? { [colType]: 'sortie' } : {}),
      ...(aut ? { id_autorisation: aut[(await getStructure(T.autorisation)).pk] } : {}),
      date_mouvement: body.date_mouvement || aujourdhui(),
      id_utilisateur: utilisateur?.id,
    }, conn);

    const maj = { statut: A.SORTI };
    if (body.id_salle) maj.id_salle = body.id_salle;
    await mettreAJour(T.actif, body.id_actif, maj, conn);
    if (aut) await autorisation.marquerUtilisee(aut[(await getStructure(T.autorisation)).pk], conn);
    return id;
  });
};

exports.retour = async (body, utilisateur) => {
  if (!body.id_actif) throw httpError(400, "Choisis l'actif.");
  const actif = await trouverOu404(T.actif, body.id_actif, 'Actif introuvable.');
  if (!memeValeur(actif.statut, A.SORTI)) throw httpError(400, `Cet actif n'est pas sorti (statut : ${actif.statut}).`);

  const colType = await colonneType();
  return db.transaction(async (conn) => {
    const id = await inserer(T.mouvement, {
      ...body,
      ...(colType ? { [colType]: 'retour' } : {}),
      date_mouvement: body.date_mouvement || aujourdhui(),
      id_utilisateur: utilisateur?.id,
    }, conn);
    const maj = { statut: A.DISPONIBLE };
    if (body.etat_retour) maj.etat = body.etat_retour;
    await mettreAJour(T.actif, body.id_actif, maj, conn);
    return id;
  });
};
