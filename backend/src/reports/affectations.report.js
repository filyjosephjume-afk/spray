// src/reports/affectations.report.js
const db = require('../config/db');
const T = require('../config/tables');

exports.titre = 'Affectations';
exports.colonnes = [
  { cle: 'designation', titre: 'Actif', largeur: 2.2 },
  { cle: 'date_debut', titre: 'Début', largeur: 1.1 },
  { cle: 'date_fin', titre: 'Fin', largeur: 1.1 },
  { cle: 'observation', titre: 'Observation', largeur: 2.5 },
];

exports.lignes = async () => {
  const [rows] = await db.query(
    `SELECT af.*, a.designation FROM \`${T.affectation}\` af LEFT JOIN \`${T.actif}\` a ON a.id_actif = af.id_actif ORDER BY af.date_debut DESC`
  );
  return rows;
};
