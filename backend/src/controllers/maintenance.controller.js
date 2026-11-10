// src/controllers/maintenance.controller.js
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { creerCrud, trouver } = require('../utils/crud');
const service = require('../services/maintenance.service');

const crud = creerCrud(T.maintenance);
module.exports = { ...crud };

module.exports.creer = asyncHandler(async (req, res) => {
  res.status(201).json(await trouver(T.maintenance, await service.demarrer(req.body, req.user)));
});

// POST /api/maintenances/:id/terminer  { date_fin, cout, date_prochaine, periodicite_jours }
module.exports.terminer = asyncHandler(async (req, res) => {
  await service.terminer(req.params.id, req.body || {});
  res.json(await trouver(T.maintenance, req.params.id));
});
