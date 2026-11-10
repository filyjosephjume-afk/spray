// src/middlewares/auth.middleware.js
//   authenticate : vérifie le jeton JWT -> req.user = { id, email, roles: [...] }
//   authorize(...roles) : réserve une route à certains rôles
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { verifier } = require('../utils/jwt');

const normaliser = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((r) => String(r?.nom_role ?? r?.nom ?? r?.libelle ?? r).toLowerCase());

async function chargerRoles(idUtilisateur) {
  try {
    const [rows] = await db.query(
      `SELECT r.* FROM \`${T.role}\` r JOIN \`${T.utilisateur_role}\` ur ON ur.id_role = r.id_role WHERE ur.id_utilisateur = ?`,
      [idUtilisateur]
    );
    return normaliser(rows);
  } catch {
    return [];
  }
}

exports.authenticate = asyncHandler(async (req, res, next) => {
  const entete = req.headers.authorization || '';
  const token = entete.startsWith('Bearer ') ? entete.slice(7) : null;
  if (!token) throw httpError(401, 'Non autorisé : jeton manquant.');

  let payload;
  try {
    payload = verifier(token);
  } catch {
    throw httpError(401, 'Jeton invalide ou expiré. Reconnecte-toi.');
  }
  const id = payload.id ?? payload.id_utilisateur ?? payload.sub;
  let roles = normaliser(payload.roles ?? payload.role);
  if (!roles.length && id) roles = await chargerRoles(id);
  req.user = { ...payload, id, roles };
  next();
});

// authorize(ROLES.ECRITURE)  ou  authorize('directeur', 'admin')
exports.authorize = (...autorises) => {
  const liste = autorises.flat().map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    if ((req.user?.roles || []).some((r) => liste.includes(r))) return next();
    return next(httpError(403, "Accès refusé : ton rôle n'a pas cette permission."));
  };
};
