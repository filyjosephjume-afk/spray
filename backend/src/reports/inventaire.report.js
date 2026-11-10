// src/reports/inventaire.report.js
const db = require('../config/db');
const T = require('../config/tables');

exports.titre = 'Inventaire des actifs';
exports.colonnes = [
  { cle: 'code_inventaire', titre: 'Code', largeur: 1.2 },
  { cle: 'designation', titre: 'Désignation', largeur: 2.5 },
  { cle: 'nom_categorie', titre: 'Catégorie', largeur: 1.5 },
  { cle: 'nom_salle', titre: 'Salle', largeur: 1.5 },
  { cle: 'statut', titre: 'Statut', largeur: 1.2 },
  { cle: 'etat', titre: 'État', largeur: 1 },
  { cle: 'date_acquisition', titre: 'Acquisition', largeur: 1.2 },
  { cle: 'prix_acquisition', titre: 'Prix (Ar)', largeur: 1.2 },
];

exports.lignes = async () => {
  const { lireActifs } = require('../utils/actifView');
  return lireActifs('ORDER BY a.code_inventaire');
};
