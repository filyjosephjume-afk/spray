// src/controllers/pointage.controller.js : CRUD standard de la table « pointage »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.pointage);
