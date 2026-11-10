// src/controllers/salle.controller.js : CRUD standard de la table « salle »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.salle, { tri: 'nom_salle ASC' });
