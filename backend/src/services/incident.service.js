// src/services/incident.service.js
// Un incident grave immobilise l'actif (en_maintenance) ; la résolution le libère.
const db = require('../config/db');
const T = require('../config/tables');
const { STATUT_ACTIF: A, STATUT_INCIDENT: I, GRAVITES_BLOQUANTES } = require('../utils/constants');
const { memeValeur } = require('../utils/validators');
const { aujourdhui } = require('../utils/dates');
const { inserer, mettreAJour, trouver, trouverOu404 } = require('../utils/crud');

exports.declarer = async (body, utilisateur) => {
  await trouverOu404(T.actif, body.id_actif, 'Actif introuvable.');
  return db.transaction(async (conn) => {
    const id = await inserer(T.incident, {
      statut: I.OUVERT,
      date_incident: aujourdhui(),
      ...body,
      id_utilisateur: utilisateur?.id,
    }, conn);
    const actif = await trouver(T.actif, body.id_actif, conn);
    if (GRAVITES_BLOQUANTES.includes(String(body.gravite).toLowerCase()) && memeValeur(actif.statut, A.DISPONIBLE)) {
      await mettreAJour(T.actif, body.id_actif, { statut: A.EN_MAINTENANCE }, conn);
    }
    return id;
  });
};

exports.resoudre = async (id, { solution }) => {
  const incident = await trouverOu404(T.incident, id, 'Incident introuvable.');
  return db.transaction(async (conn) => {
    await mettreAJour(T.incident, id, { statut: I.RESOLU, date_resolution: aujourdhui(), solution }, conn);
    // libère l'actif s'il n'y a plus d'incident bloquant ni de maintenance en cours
    const actif = await trouver(T.actif, incident.id_actif, conn);
    if (actif && memeValeur(actif.statut, A.EN_MAINTENANCE)) {
      let autres = 0;
      try {
        const [[a]] = await conn.query(`SELECT COUNT(*) n FROM \`${T.incident}\` WHERE id_actif = ? AND statut <> ? AND id_incident <> ?`, [incident.id_actif, I.RESOLU, id]);
        const [[b]] = await conn.query(`SELECT COUNT(*) n FROM \`${T.maintenance}\` WHERE id_actif = ? AND statut_maintenance = 'en_cours'`, [incident.id_actif]);
        autres = Number(a.n) + Number(b.n);
      } catch { /* tables/colonnes différentes : on libère */ }
      if (!autres) await mettreAJour(T.actif, incident.id_actif, { statut: A.DISPONIBLE }, conn);
    }
    return id;
  });
};
