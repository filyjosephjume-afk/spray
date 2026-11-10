// src/routes/incident.routes.js  ->  /api/incidents
const router = require('express').Router();
const ctrl = require('../controllers/incident.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['id_actif', 'description']), ctrl.creer);
router.post('/:id/resoudre', authorize(ROLES.ECRITURE), ctrl.resoudre);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
