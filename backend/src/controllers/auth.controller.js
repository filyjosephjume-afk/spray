// src/controllers/auth.controller.js
// POST /api/auth/login { email, mot_de_passe } -> { token, user }   |   GET /api/auth/me
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const T = require('../config/tables');
const httpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { signer } = require('../utils/jwt');

async function rolesDe(idUtilisateur) {
  try {
    const [rows] = await db.query(
      `SELECT r.* FROM \`${T.role}\` r JOIN \`${T.utilisateur_role}\` ur ON ur.id_role = r.id_role WHERE ur.id_utilisateur = ?`,
      [idUtilisateur]
    );
    return rows.map((r) => String(r.nom_role ?? r.nom ?? r.libelle ?? '').toLowerCase()).filter(Boolean);
  } catch {
    return [];
  }
}

exports.login = asyncHandler(async (req, res) => {
  const { email, mot_de_passe } = req.body || {};
  if (!email || !mot_de_passe) throw httpError(400, 'Email et mot de passe obligatoires.');

  const [rows] = await db.query(`SELECT * FROM \`${T.utilisateur}\` WHERE email = ?`, [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(mot_de_passe, u.mot_de_passe ?? u.password ?? ''))) {
    throw httpError(401, 'Email ou mot de passe incorrect.');
  }
  if (u.actif !== undefined && Number(u.actif) === 0) throw httpError(403, 'Compte désactivé.');

  const roles = await rolesDe(u.id_utilisateur);
  const user = { id_utilisateur: u.id_utilisateur, nom: u.nom, prenom: u.prenom, email: u.email, role: roles[0] || null, roles };
  res.json({ token: signer({ id: u.id_utilisateur, email: u.email, roles }), user });
});

exports.me = asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM \`${T.utilisateur}\` WHERE id_utilisateur = ?`, [req.user.id]);
  if (!rows[0]) throw httpError(404, 'Utilisateur introuvable.');
  const u = { ...rows[0] };
  delete u.mot_de_passe;
  delete u.password;
  res.json({ ...u, role: req.user.roles[0] || null, roles: req.user.roles });
});
