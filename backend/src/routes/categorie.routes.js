// src/routes/categorie.routes.js  ->  /api/categories
const router = require('express').Router();
const ctrl = require('../controllers/categorie.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ECRITURE), validate(['nom_categorie']), ctrl.creer);
router.put('/:id', authorize(ROLES.ECRITURE), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
