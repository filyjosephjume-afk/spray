// src/routes/auth.routes.js   (publique : pas de jeton pour se connecter)
const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.post('/login', validate(['email', 'mot_de_passe']), ctrl.login);
router.get('/me', authenticate, ctrl.me);

module.exports = router;
