// src/middlewares/validate.middleware.js
//   router.post('/', validate(['nom', 'email']), ctrl.creer)
const httpError = require('../utils/httpError');
const { estVide, estEmail, estDate } = require('../utils/validators');

module.exports = (requis = []) => (req, res, next) => {
  const body = req.body || {};
  const manquants = requis.filter((c) => estVide(body[c]));
  if (manquants.length) return next(httpError(400, `Champ(s) obligatoire(s) : ${manquants.join(', ')}`));
  if (body.email && !estEmail(body.email)) return next(httpError(400, "L'email n'est pas valide."));
  for (const [k, v] of Object.entries(body)) {
    if (/^date_/.test(k) && !estVide(v) && !estDate(v)) return next(httpError(400, `Date invalide pour « ${k} » (format AAAA-MM-JJ).`));
  }
  next();
};
