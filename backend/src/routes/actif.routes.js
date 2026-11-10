// src/routes/actif.routes.js  ->  /api/actifs
// ATTENTION : les routes fixes (/couts) AVANT les routes avec :id
const router = require('express').Router();
const ctrl = require('../controllers/actif.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/couts', ctrl.couts);
router.get('/:id', ctrl.detail);
router.get('/:id/historique', ctrl.historique);
router.get('/:id/qrcode', ctrl.qrcode);

router.post('/', authorize(ROLES.ECRITURE), validate(['code_inventaire', 'designation']), ctrl.creer);
router.post('/:id/rebut', authorize(ROLES.ECRITURE), ctrl.rebut);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
