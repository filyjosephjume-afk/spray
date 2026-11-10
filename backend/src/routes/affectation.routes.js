// src/routes/affectation.routes.js  ->  /api/affectations
const router = require('express').Router();
const ctrl = require('../controllers/affectation.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['id_actif']), ctrl.creer);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
