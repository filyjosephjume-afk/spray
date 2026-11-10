// src/reports/mouvements.report.js
const db = require('../config/db');
const T = require('../config/tables');

exports.titre = 'Mouvements (sorties et retours)';
exports.colonnes = [
  { cle: 'date_mouvement', titre: 'Date', largeur: 1.1 },
  { cle: 'designation', titre: 'Actif', largeur: 2.2 },
  { cle: 'etudiant', titre: 'Étudiant', largeur: 1.8 },
  { cle: 'nom_salle', titre: 'Salle', largeur: 1.3 },
  { cle: 'date_retour_prevue', titre: 'Retour prévu', largeur: 1.2 },
  { cle: 'observation', titre: 'Observation', largeur: 2 },
];

exports.lignes = async () => {
  const [rows] = await db.query(
    `SELECT mv.*, a.designation, CONCAT_WS(' ', e.nom, e.prenom) AS etudiant, s.nom_salle
     FROM \`${T.mouvement}\` mv
     LEFT JOIN \`${T.actif}\` a ON a.id_actif = mv.id_actif
     LEFT JOIN \`${T.etudiant}\` e ON e.id_etudiant = mv.id_etudiant
     LEFT JOIN \`${T.salle}\` s ON s.id_salle = mv.id_salle
     ORDER BY mv.date_mouvement DESC`
  );
  return rows;
};
