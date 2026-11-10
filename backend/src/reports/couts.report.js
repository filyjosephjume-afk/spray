// src/reports/couts.report.js
const db = require('../config/db');
const T = require('../config/tables');

exports.titre = 'Coûts par actif';
exports.colonnes = [
  { cle: 'code_inventaire', titre: 'Code', largeur: 1.2 },
  { cle: 'designation', titre: 'Désignation', largeur: 2.5 },
  { cle: 'prix_acquisition', titre: 'Prix d\'achat', largeur: 1.2 },
  { cle: 'cout_maintenance', titre: 'Maintenances', largeur: 1.2 },
  { cle: 'cout_total', titre: 'Coût total', largeur: 1.2 },
];

exports.lignes = async () => {
  const [rows] = await db.query(`SELECT * FROM \`${T.v_cout_actif}\``);
  return rows;
};
