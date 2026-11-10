// src/routes/maintenance.routes.js  ->  /api/maintenances
const router = require('express').Router();
const ctrl = require('../controllers/maintenance.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['id_actif', 'type_maintenance', 'date_debut']), ctrl.creer);
router.post('/:id/terminer', authorize(ROLES.ECRITURE), ctrl.terminer);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
