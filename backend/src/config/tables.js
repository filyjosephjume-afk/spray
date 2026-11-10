// src/config/tables.js
// ---------------------------------------------------------------------
// LE SEUL FICHIER À ADAPTER si tes tables ont d'autres noms.
// À gauche : nom utilisé par le code. À droite : nom RÉEL dans phpMyAdmin.
// Après modification, lance :  npm run check-db   (il te dit ce qui manque)
// ---------------------------------------------------------------------
module.exports = {
  // tables principales
  actif: 'actif',
  categorie: 'categorie',
  fournisseur: 'fournisseur',
  salle: 'salle',
  service: 'service',
  etudiant: 'etudiant',
  pointage: 'pointage',
  affectation: 'affectation',
  autorisation: 'autorisation',
  incident: 'incident',
  licence: 'licence',
  mouvement: 'mouvement',
  maintenance: 'maintenance',
  rebut: 'rebut',

  // utilisateurs et rôles
  utilisateur: 'utilisateur',
  role: 'role',
  utilisateur_role: 'utilisateur_role', // table de liaison (id_utilisateur, id_role)

  // vues (facultatives : si absentes, le code calcule autrement)
  v_alertes: 'v_alertes',
  v_cout_actif: 'v_cout_actif',
  v_historique_actif: 'v_historique_actif',
};
