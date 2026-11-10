// src/utils/constants.js
// Les valeurs de STATUT doivent être IDENTIQUES à celles de ta base
// (phpMyAdmin -> table actif -> Structure -> colonne statut -> type enum).
// Le frontend (src/utils/constants.js) utilise les mêmes valeurs.
module.exports = {
  ROLES: {
    ADMIN: ['admin', 'administrateur', 'directeur'], // tout faire
    DIRECTEUR: ['directeur', 'admin', 'administrateur'], // décider des autorisations
    ECRITURE: ['admin', 'administrateur', 'directeur', 'technicien', 'gestionnaire'], // ajouter / modifier
  },

  STATUT_ACTIF: {
    DISPONIBLE: 'disponible',
    SORTI: 'sorti',
    EN_MAINTENANCE: 'en_maintenance',
    REBUT: 'rebut',
  },

  STATUT_MAINTENANCE: { EN_COURS: 'en_cours', TERMINEE: 'terminee' },
  STATUT_INCIDENT: { OUVERT: 'ouvert', EN_COURS: 'en_cours', RESOLU: 'resolu' },
  STATUT_AUTORISATION: { EN_ATTENTE: 'en_attente', ACCORDEE: 'accordee', REFUSEE: 'refusee', UTILISEE: 'utilisee' },
  GRAVITES_BLOQUANTES: ['elevee', 'critique'], // un incident de cette gravité immobilise l'actif

  // true  = une sortie à un étudiant exige une autorisation "accordée"
  // false = l'autorisation est utilisée si elle existe, sans être obligatoire
  AUTORISATION_OBLIGATOIRE: false,
};
