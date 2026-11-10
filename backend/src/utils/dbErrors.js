// src/utils/dbErrors.js : erreurs MySQL -> messages clairs
const httpError = require('./httpError');

const MESSAGES = {
  ER_DUP_ENTRY: [409, 'Cette valeur existe déjà (doublon : code, matricule, email...).'],
  ER_NO_REFERENCED_ROW_2: [400, 'Référence introuvable : choisis une valeur qui existe (catégorie, salle, actif...).'],
  ER_ROW_IS_REFERENCED_2: [409, 'Suppression impossible : cet élément est utilisé ailleurs.'],
  ER_BAD_NULL_ERROR: [400, 'Un champ obligatoire est vide.'],
  ER_NO_DEFAULT_FOR_FIELD: [400, 'Un champ obligatoire est manquant.'],
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: [400, 'Valeur incorrecte pour un champ.'],
  WARN_DATA_TRUNCATED: [400, 'Valeur non autorisée pour un champ (liste de choix).'],
  ER_WARN_DATA_OUT_OF_RANGE: [400, 'Valeur hors limites.'],
  ER_DATA_TOO_LONG: [400, 'Texte trop long pour un champ.'],
};

// Transforme une erreur MySQL en HttpError (ou renvoie null si ce n'en est pas une)
exports.versHttp = (err) => {
  if (!err || !err.code || !/^(ER_|WARN_)/.test(err.code)) return null;
  if (err.code === 'ER_NO_SUCH_TABLE') return httpError(500, `Table introuvable (${err.sqlMessage}). Vérifie src/config/tables.js`);
  if (err.code === 'ER_BAD_FIELD_ERROR') return httpError(500, `Colonne introuvable (${err.sqlMessage}).`);
  const [status, message] = MESSAGES[err.code] || [500, `Erreur base de données : ${err.sqlMessage || err.message}`];
  return httpError(status, message);
};
