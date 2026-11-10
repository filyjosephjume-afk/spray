// src/controllers/rapport.controller.js
//   GET /api/rapports                         -> liste des rapports
//   GET /api/rapports/inventaire?format=pdf   -> PDF
//   GET /api/rapports/couts?format=excel      -> Excel (.xlsx)
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const envoyerPdf = require('../reports/pdf.helper');
const envoyerExcel = require('../reports/excel.helper');

const RAPPORTS = {
  inventaire: require('../reports/inventaire.report'),
  couts: require('../reports/couts.report'),
  maintenances: require('../reports/maintenances.report'),
  mouvements: require('../reports/mouvements.report'),
  affectations: require('../reports/affectations.report'),
};

exports.lister = (req, res) => {
  res.json(Object.entries(RAPPORTS).map(([cle, r]) => ({ cle, titre: r.titre, formats: ['pdf', 'excel', 'json'] })));
};

exports.generer = asyncHandler(async (req, res) => {
  const def = RAPPORTS[req.params.type];
  if (!def) throw httpError(404, `Rapport inconnu : ${req.params.type}`);
  const lignes = await def.lignes();
  const rapport = { titre: def.titre, colonnes: def.colonnes, lignes };
  const nom = `rapport_${req.params.type}_${new Date().toISOString().slice(0, 10)}`;
  const format = String(req.query.format || 'json').toLowerCase();

  if (format === 'pdf') return envoyerPdf(res, rapport, nom);
  if (format === 'excel' || format === 'xlsx') return envoyerExcel(res, rapport, nom);
  res.json(lignes);
});
