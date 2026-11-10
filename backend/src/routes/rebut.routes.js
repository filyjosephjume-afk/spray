// src/routes/rebut.routes.js  ->  /api/rebuts
const router = require('express').Router();
const ctrl = require('../controllers/rebut.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['id_actif']), ctrl.creer);

module.exports = router;
