// src/controllers/rebut.controller.js
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { creerCrud, trouver } = require('../utils/crud');
const service = require('../services/rebut.service');

const crud = creerCrud(T.rebut);
module.exports = { lister: crud.lister, detail: crud.detail };

// POST /api/rebuts  { id_actif, motif }
module.exports.creer = asyncHandler(async (req, res) => {
  res.status(201).json(await trouver(T.rebut, await service.mettreAuRebut(req.body, req.user)));
});
