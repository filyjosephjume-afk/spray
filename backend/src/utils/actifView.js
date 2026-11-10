// src/utils/actifView.js
// Lit les actifs AVEC les noms (catégorie, salle, fournisseur) grâce à des jointures.
// Si une jointure échoue (table ou colonne différente), on revient à "SELECT *".
const db = require('../config/db');
const T = require('../config/tables');

const AVEC_JOINTURES = () => `
  SELECT a.*, c.nom_categorie, s.nom_salle, f.nom_fournisseur
  FROM \`${T.actif}\` a
  LEFT JOIN \`${T.categorie}\` c ON c.id_categorie = a.id_categorie
  LEFT JOIN \`${T.salle}\` s ON s.id_salle = a.id_salle
  LEFT JOIN \`${T.fournisseur}\` f ON f.id_fournisseur = a.id_fournisseur`;
const SIMPLE = () => `SELECT a.* FROM \`${T.actif}\` a`;

exports.lireActifs = async (suite = '', params = []) => {
  try {
    const [rows] = await db.query(AVEC_JOINTURES() + ' ' + suite, params);
    return rows;
  } catch (err) {
    if (!['ER_BAD_FIELD_ERROR', 'ER_NO_SUCH_TABLE'].includes(err.code)) throw err;
    const [rows] = await db.query(SIMPLE() + ' ' + suite, params);
    return rows;
  }
};
