// src/controllers/service.controller.js : CRUD standard de la table « service »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.service, { tri: 'nom_service ASC' });
