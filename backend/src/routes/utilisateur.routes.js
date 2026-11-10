// src/routes/utilisateur.routes.js  ->  /api/utilisateurs  (administration des comptes)
const router = require('express').Router();
const ctrl = require('../controllers/utilisateur.controller');
const { authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../utils/constants');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.detail);
router.post('/', authorize(ROLES.ADMIN), validate(['nom', 'email', 'mot_de_passe']), ctrl.creer);
router.put('/:id/roles', authorize(ROLES.ADMIN), ctrl.changerRoles);
router.put('/:id', authorize(ROLES.ADMIN), validate(['nom', 'email']), ctrl.modifier);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.supprimer);

module.exports = router;
