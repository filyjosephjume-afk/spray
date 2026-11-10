// src/reports/maintenances.report.js
const db = require('../config/db');
const T = require('../config/tables');

exports.titre = 'Maintenances';
exports.colonnes = [
  { cle: 'designation', titre: 'Actif', largeur: 2.2 },
  { cle: 'type_maintenance', titre: 'Type', largeur: 1.2 },
  { cle: 'description', titre: 'Description', largeur: 2.5 },
  { cle: 'date_debut', titre: 'Début', largeur: 1.1 },
  { cle: 'date_fin', titre: 'Fin', largeur: 1.1 },
  { cle: 'cout', titre: 'Coût (Ar)', largeur: 1 },
  { cle: 'statut_maintenance', titre: 'Statut', largeur: 1.1 },
];

exports.lignes = async () => {
  const [rows] = await db.query(
    `SELECT m.*, a.designation FROM \`${T.maintenance}\` m LEFT JOIN \`${T.actif}\` a ON a.id_actif = m.id_actif ORDER BY m.date_debut DESC`
  );
  return rows;
};
