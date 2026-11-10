// src/routes/rapport.routes.js  ->  /api/rapports
const router = require('express').Router();
const ctrl = require('../controllers/rapport.controller');

router.get('/', ctrl.lister);
router.get('/:type', ctrl.generer); // ?format=pdf | excel | json

module.exports = router;
