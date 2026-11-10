// src/routes/autorisation.routes.js  ->  /api/autorisations
const router = require('express').Router();
const ctrl = require('../controllers/autorisation.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['id_etudiant', 'date_debut']), ctrl.creer);
// Seul le Directeur décide
router.post('/:id/decision', authorize(ROLES.DIRECTEUR), validate(['decision']), ctrl.decision);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
