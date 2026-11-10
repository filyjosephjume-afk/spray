// src/controllers/role.controller.js : CRUD standard de la table « role »
const T = require('../config/tables');
const { creerCrud } = require('../utils/crud');

module.exports = creerCrud(T.role, { tri: 'id_role ASC' });
