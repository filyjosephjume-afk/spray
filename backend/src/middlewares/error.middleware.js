// src/middlewares/error.middleware.js
const { versHttp } = require('../utils/dbErrors');

exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const erreur = versHttp(err) || err;
  if (!erreur.status) console.error('[ERREUR]', err);
  else if (erreur.status >= 500) console.error('[ERREUR]', err.message);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON invalide.' });
  res.status(erreur.status || 500).json({ message: erreur.status ? erreur.message : 'Erreur serveur.' });
};
