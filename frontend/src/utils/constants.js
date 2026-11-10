// =====================================================================
//  Réglages communs à tout le front-end.
//  Si vos valeurs en base de données sont différentes, modifiez-les ICI.
// =====================================================================

export const APP_NAME = 'Spray Info';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const PAGE_SIZE = 10;

// --- Rôles : noms exacts de la table "role", en minuscules ---
// ADMIN_ROLES      : accès à "Administration" (utilisateurs)
// READ_ONLY_ROLES  : rôles qui consultent seulement (boutons d'ajout/modification masqués)
// Un rôle inconnu peut écrire : c'est le back-end qui reste l'autorité finale.
export const ADMIN_ROLES = ['admin', 'administrateur'];
export const READ_ONLY_ROLES = ['lecteur', 'consultation', 'visiteur', 'etudiant', 'étudiant'];

// --- Valeurs des listes déroulantes (colonnes ENUM / texte de la base) ---
export const STATUT_DISPONIBLE = 'disponible';
export const STATUT_SORTI = 'sorti';

export const STATUTS_ACTIF = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'sorti', label: 'Sorti' },
  { value: 'en_maintenance', label: 'En maintenance' },
  { value: 'rebut', label: 'Au rebut' },
];

export const ETATS_ACTIF = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'bon', label: 'Bon' },
  { value: 'usage', label: 'Usagé' },
  { value: 'defectueux', label: 'Défectueux' },
];

export const TYPES_MAINTENANCE = [
  { value: 'preventive', label: 'Préventive' },
  { value: 'corrective', label: 'Corrective' },
];

export const STATUTS_MAINTENANCE = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'terminee', label: 'Terminée' },
];

export const GRAVITES = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'elevee', label: 'Élevée' },
  { value: 'critique', label: 'Critique' },
];

export const STATUTS_INCIDENT = [
  { value: 'ouvert', label: 'Ouvert' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'resolu', label: 'Résolu' },
];

export const STATUTS_AUTORISATION = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'accordee', label: 'Accordée' },
  { value: 'refusee', label: 'Refusée' },
];
