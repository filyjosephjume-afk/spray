// src/routes/alerte.routes.js  ->  /api/alertes  (lit la vue v_alertes)
const router = require('express').Router();
const ctrl = require('../controllers/alerte.controller');

router.get('/', ctrl.lister);

module.exports = router;
