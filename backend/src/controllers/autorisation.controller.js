// src/controllers/autorisation.controller.js
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { STATUT_AUTORISATION } = require('../utils/constants');
const { creerCrud } = require('../utils/crud');
const service = require('../services/autorisation.service');

const crud = creerCrud(T.autorisation, {
  // une nouvelle demande est toujours "en attente"
  avantCreation: async (body, req) => ({ ...body, statut: body.statut || STATUT_AUTORISATION.EN_ATTENTE, id_demandeur: req.user?.id }),
});
module.exports = { ...crud };

// POST /api/autorisations/:id/decision   { decision: 'accordee' | 'refusee', commentaire }
module.exports.decision = asyncHandler(async (req, res) => {
  if (!req.body.decision) throw httpError(400, 'La décision est obligatoire.');
  res.json(await service.decider(req.params.id, req.body.decision, req.body.commentaire, req.user));
});
