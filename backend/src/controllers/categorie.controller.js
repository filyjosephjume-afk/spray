// src/controllers/categorie.controller.js : CRUD standard de la table « categorie »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.categorie, { tri: 'nom_categorie ASC' });
