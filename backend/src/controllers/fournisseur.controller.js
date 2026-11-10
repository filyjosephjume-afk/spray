// src/controllers/fournisseur.controller.js : CRUD standard de la table « fournisseur »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.fournisseur, { tri: 'nom_fournisseur ASC' });
