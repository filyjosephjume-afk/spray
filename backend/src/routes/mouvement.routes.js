// src/routes/mouvement.routes.js  ->  /api/mouvements
const router = require('express').Router();
const ctrl = require('../controllers/mouvement.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/sortie', authorize(ROLES.ECRITURE), validate(['id_actif']), ctrl.sortie);
router.post('/retour', authorize(ROLES.ECRITURE), validate(['id_actif']), ctrl.retour);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
