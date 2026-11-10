// src/seed/seed-actifs.js  ->  npm run seed:actifs
// Ajoute des catégories, salles, fournisseurs et actifs de démonstration.
require('dotenv').config();
const db = require('../config/db');
const T = require('../config/tables');
const { inserer } = require('../utils/crud');
const { STATUT_ACTIF } = require('../utils/constants');

async function idOuCreer(table, champNom, valeur, extra = {}) {
  const [rows] = await db.query(`SELECT * FROM \`${table}\` WHERE \`${champNom}\` = ? LIMIT 1`, [valeur]);
  if (rows[0]) return Object.values(rows[0])[0]; // 1re colonne = clé primaire
  return inserer(table, { [champNom]: valeur, ...extra });
}

(async () => {
  try {
    const cat = {};
    for (const n of ['Ordinateur', 'Imprimante', 'Réseau', 'Mobilier', 'Climatisation']) cat[n] = await idOuCreer(T.categorie, 'nom_categorie', n);
    const salle = {};
    for (const n of ['Salle informatique 1', 'Bureau direction', 'Salle de réunion']) salle[n] = await idOuCreer(T.salle, 'nom_salle', n);
    const four = await idOuCreer(T.fournisseur, 'nom_fournisseur', 'Fournisseur Démo', { telephone: '0340000000' });

    const actifs = [
      ['PC-001', 'PC portable Dell Latitude', 'Ordinateur', 'Salle informatique 1', 'Dell', 'Latitude 5420', 2800000],
      ['PC-002', 'PC portable HP ProBook', 'Ordinateur', 'Salle informatique 1', 'HP', 'ProBook 450', 2500000],
      ['PC-003', 'PC fixe Lenovo', 'Ordinateur', 'Bureau direction', 'Lenovo', 'ThinkCentre', 2200000],
      ['IMP-001', 'Imprimante laser', 'Imprimante', 'Bureau direction', 'Canon', 'LBP6030', 650000],
      ['RES-001', 'Switch 24 ports', 'Réseau', 'Salle informatique 1', 'TP-Link', 'TL-SG1024', 480000],
      ['MOB-001', 'Table de réunion', 'Mobilier', 'Salle de réunion', null, null, 900000],
      ['CLI-001', 'Climatiseur split', 'Climatisation', 'Salle de réunion', 'LG', 'S12', 1900000],
    ];
    for (const [code, designation, c, s, marque, modele, prix] of actifs) {
      const [dej] = await db.query(`SELECT 1 FROM \`${T.actif}\` WHERE code_inventaire = ?`, [code]);
      if (dej[0]) {
        console.log('= déjà présent :', code);
        continue;
      }
      await inserer(T.actif, {
        code_inventaire: code, designation, id_categorie: cat[c], id_salle: salle[s], id_fournisseur: four,
        marque, modele, prix_acquisition: prix, date_acquisition: '2026-01-15', date_fin_garantie: '2028-01-15',
        statut: STATUT_ACTIF.DISPONIBLE, etat: 'bon',
      });
      console.log('+ actif :', code);
    }
  } catch (err) {
    console.error('Erreur seed-actifs :', err.message);
  }
  process.exit(0);
})();
