import { resource } from './axios';

// Petites tables de référence utilisées dans les listes déroulantes
export const categories = resource('/categories');
export const fournisseurs = resource('/fournisseurs');
export const salles = resource('/salles');
export const services = resource('/services');
export const roles = resource('/roles');
