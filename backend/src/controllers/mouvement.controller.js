// src/controllers/mouvement.controller.js
const T = require('../config/tables');
const asyncHandler = require('../utils/asyncHandler');
const { creerCrud, trouver } = require('../utils/crud');
const service = require('../services/mouvement.service');

const crud = creerCrud(T.mouvement);
module.exports = { lister: crud.lister, detail: crud.detail, supprimer: crud.supprimer };

// POST /api/mouvements/sortie  { id_actif, id_etudiant, id_salle, date_mouvement, date_retour_prevue, observation }
module.exports.sortie = asyncHandler(async (req, res) => {
  res.status(201).json(await trouver(T.mouvement, await service.sortie(req.body, req.user)));
});

// POST /api/mouvements/retour  { id_actif, date_mouvement, etat_retour, observation }
module.exports.retour = asyncHandler(async (req, res) => {
  res.status(201).json(await trouver(T.mouvement, await service.retour(req.body, req.user)));
});
