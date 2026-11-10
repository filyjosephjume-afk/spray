// src/routes/index.js
// ---------------------------------------------------------------------
// Regroupe TOUTES les routes sous /api (le préfixe /api est ajouté dans app.js).
//   router.use('/actifs', ...)  ->  http://localhost:5000/api/actifs
// Si tu changes un nom ici, change-le aussi dans frontend/src/api/routes.js
// ---------------------------------------------------------------------
const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');

// Publique
router.use('/auth', require('./auth.routes'));

// Tout ce qui suit demande un jeton valide
router.use(authenticate);

router.use('/dashboard', require('./dashboard.routes'));
router.use('/alertes', require('./alerte.routes'));
router.use('/rapports', require('./rapport.routes'));

router.use('/utilisateurs', require('./utilisateur.routes'));
router.use('/roles', require('./role.routes'));
router.use('/services', require('./service.routes'));
router.use('/salles', require('./salle.routes'));
router.use('/categories', require('./categorie.routes'));
router.use('/fournisseurs', require('./fournisseur.routes'));

router.use('/actifs', require('./actif.routes'));
router.use('/licences', require('./licence.routes'));
router.use('/affectations', require('./affectation.routes'));
router.use('/autorisations', require('./autorisation.routes'));
router.use('/mouvements', require('./mouvement.routes'));
router.use('/etudiants', require('./etudiant.routes'));
router.use('/pointages', require('./pointage.routes'));
router.use('/incidents', require('./incident.routes'));
router.use('/maintenances', require('./maintenance.routes'));
router.use('/rebuts', require('./rebut.routes'));

module.exports = router;
