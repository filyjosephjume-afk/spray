// src/controllers/etudiant.controller.js : CRUD standard de la table « etudiant »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.etudiant, { tri: 'nom ASC' });
