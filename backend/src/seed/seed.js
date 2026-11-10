// src/seed/seed.js  ->  npm run seed
// Crée les rôles et UN compte de test par rôle (mot de passe : Passw0rd!)
// Les comptes qui existent déjà (même email) sont ignorés.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const T = require('../config/tables');
const { inserer } = require('../utils/crud');

const MOT_DE_PASSE = 'Passw0rd!';
const ROLES = ['directeur', 'administrateur', 'technicien', 'gestionnaire', 'lecteur'];
const COMPTES = [
  { nom: 'RAKOTO', prenom: 'Jean', email: 'directeur@sprayinfo.mg', role: 'directeur' },
  { nom: 'RABE', prenom: 'Admin', email: 'admin@sprayinfo.mg', role: 'administrateur' },
  { nom: 'RANDRIA', prenom: 'Tech', email: 'technicien@sprayinfo.mg', role: 'technicien' },
  { nom: 'RASOA', prenom: 'Gest', email: 'gestionnaire@sprayinfo.mg', role: 'gestionnaire' },
  { nom: 'RAVO', prenom: 'Lecteur', email: 'lecteur@sprayinfo.mg', role: 'lecteur' },
];

(async () => {
  try {
    // 1) rôles (nom_role ET nom : seules les colonnes existantes sont utilisées)
    const idRoles = {};
    for (const nom of ROLES) {
      const [rows] = await db.query(`SELECT * FROM \`${T.role}\``);
      const existant = rows.find((r) => String(r.nom_role ?? r.nom ?? r.libelle).toLowerCase() === nom);
      idRoles[nom] = existant ? existant.id_role : await inserer(T.role, { nom_role: nom, nom, libelle: nom });
    }

    // 2) comptes
    const hash = await bcrypt.hash(MOT_DE_PASSE, 10);
    for (const c of COMPTES) {
      const [rows] = await db.query(`SELECT id_utilisateur FROM \`${T.utilisateur}\` WHERE email = ?`, [c.email]);
      if (rows[0]) {
        console.log('= déjà présent :', c.email);
        continue;
      }
      const id = await inserer(T.utilisateur, { nom: c.nom, prenom: c.prenom, email: c.email, mot_de_passe: hash, actif: 1 });
      await db.query(`INSERT INTO \`${T.utilisateur_role}\` (id_utilisateur, id_role) VALUES (?, ?)`, [id, idRoles[c.role]]);
      console.log('+ créé :', c.email, `(${c.role})`);
    }
    console.log(`\nMot de passe de tous les comptes : ${MOT_DE_PASSE}\n`);
  } catch (err) {
    console.error('Erreur seed :', err.message);
  }
  process.exit(0);
})();
