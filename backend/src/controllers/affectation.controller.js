// src/controllers/affectation.controller.js
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { creerCrud, trouver } = require('../utils/crud');
const service = require('../services/affectation.service');

const crud = creerCrud(T.affectation);
module.exports = { ...crud };

// POST /api/affectations : clôture l'ancienne affectation puis crée la nouvelle
module.exports.creer = asyncHandler(async (req, res) => {
  const id = await service.affecter(req.body, req.user);
  res.status(201).json(await trouver(T.affectation, id));
});
