// src/routes/dashboard.routes.js  ->  /api/dashboard
const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/', ctrl.stats);

module.exports = router;
