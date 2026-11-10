// src/controllers/incident.controller.js
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { creerCrud, trouver } = require('../utils/crud');
const service = require('../services/incident.service');

const crud = creerCrud(T.incident);
module.exports = { ...crud };

module.exports.creer = asyncHandler(async (req, res) => {
  res.status(201).json(await trouver(T.incident, await service.declarer(req.body, req.user)));
});

// POST /api/incidents/:id/resoudre  { solution }
module.exports.resoudre = asyncHandler(async (req, res) => {
  await service.resoudre(req.params.id, req.body || {});
  res.json(await trouver(T.incident, req.params.id));
});
