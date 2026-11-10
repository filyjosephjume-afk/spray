// src/controllers/licence.controller.js : CRUD standard de la table « licence »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.licence);
