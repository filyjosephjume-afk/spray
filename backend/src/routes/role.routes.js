// src/routes/role.routes.js  ->  /api/roles
const router = require('express').Router();
const ctrl = require('../controllers/role.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ADMIN), validate([]), ctrl.creer);
router.put('/:id', authorize(ROLES.ADMIN), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
