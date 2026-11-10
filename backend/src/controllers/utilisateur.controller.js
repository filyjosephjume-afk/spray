// src/controllers/utilisateur.controller.js
// Comptes + rôles. Mot de passe chiffré (bcrypt) et jamais renvoyé.
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { inserer, mettreAJour, trouverOu404 } = require('../utils/crud');

const SECRETS = ['mot_de_passe', 'password'];
const sansSecret = (u) => {
  const c = { ...u };
  SECRETS.forEach((k) => delete c[k]);
  return c;
};

async function rolesParUtilisateur() {
  try {
    const [rows] = await db.query(`SELECT ur.id_utilisateur, r.* FROM \`${T.utilisateur_role}\` ur JOIN \`${T.role}\` r ON r.id_role = ur.id_role`);
    const map = {};
    rows.forEach((r) => (map[r.id_utilisateur] ||= []).push({ id_role: r.id_role, nom: r.nom_role ?? r.nom ?? r.libelle }));
    return map;
  } catch {
    return {};
  }
}

async function remplacerRoles(idUtilisateur, roles) {
  if (!Array.isArray(roles)) return;
  await db.transaction(async (conn) => {
    await conn.query(`DELETE FROM \`${T.utilisateur_role}\` WHERE id_utilisateur = ?`, [idUtilisateur]);
    for (const r of roles) {
      const idRole = typeof r === 'object' ? r.id_role ?? r.id : r;
      if (idRole) await conn.query(`INSERT INTO \`${T.utilisateur_role}\` (id_utilisateur, id_role) VALUES (?, ?)`, [idUtilisateur, idRole]);
    }
  });
}

async function preparer(body) {
  const data = { ...body };
  delete data.roles;
  delete data.id_utilisateur;
  if (data.mot_de_passe) data.mot_de_passe = await bcrypt.hash(String(data.mot_de_passe), 10);
  else delete data.mot_de_passe; // vide = inchangé
  if (data.actif !== undefined) data.actif = [true, 1, '1', 'true'].includes(data.actif) ? 1 : 0;
  return data;
}

const complet = async (id) => ({ ...sansSecret(await trouverOu404(T.utilisateur, id, 'Utilisateur introuvable.')), roles: (await rolesParUtilisateur())[id] || [] });

exports.lister = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM \`${T.utilisateur}\` ORDER BY id_utilisateur DESC`);
  const m = await rolesParUtilisateur();
  res.json(rows.map((u) => ({ ...sansSecret(u), roles: m[u.id_utilisateur] || [] })));
});

exports.detail = asyncHandler(async (req, res) => res.json(await complet(req.params.id)));

exports.creer = asyncHandler(async (req, res) => {
  if (!req.body.mot_de_passe || String(req.body.mot_de_passe).length < 6) throw httpError(400, 'Mot de passe : 6 caractères minimum.');
  const id = await inserer(T.utilisateur, await preparer({ actif: 1, ...req.body }));
  await remplacerRoles(id, req.body.roles);
  res.status(201).json(await complet(id));
});

exports.modifier = asyncHandler(async (req, res) => {
  await trouverOu404(T.utilisateur, req.params.id, 'Utilisateur introuvable.');
  if (req.body.mot_de_passe && String(req.body.mot_de_passe).length < 6) throw httpError(400, 'Mot de passe : 6 caractères minimum.');
  await mettreAJour(T.utilisateur, req.params.id, await preparer(req.body));
  await remplacerRoles(req.params.id, req.body.roles);
  res.json(await complet(req.params.id));
});

exports.changerRoles = asyncHandler(async (req, res) => {
  await trouverOu404(T.utilisateur, req.params.id, 'Utilisateur introuvable.');
  await remplacerRoles(req.params.id, req.body.roles);
  res.json(await complet(req.params.id));
});

exports.supprimer = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) throw httpError(400, 'Tu ne peux pas supprimer ton propre compte.');
  await trouverOu404(T.utilisateur, req.params.id, 'Utilisateur introuvable.');
  await db.transaction(async (conn) => {
    await conn.query(`DELETE FROM \`${T.utilisateur_role}\` WHERE id_utilisateur = ?`, [req.params.id]);
    await conn.query(`DELETE FROM \`${T.utilisateur}\` WHERE id_utilisateur = ?`, [req.params.id]);
  });
  res.json({ message: 'Supprimé.' });
});
