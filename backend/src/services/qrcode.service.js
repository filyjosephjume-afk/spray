// src/services/qrcode.service.js
// QR code = URL de la fiche de l'actif ; code-barres = code_inventaire
const httpError = require('../utils/httpError');
const T = require('../config/tables');
const { trouverOu404 } = require('../utils/crud');

exports.pourActif = async (idActif) => {
  const actif = await trouverOu404(T.actif, idActif, 'Actif introuvable.');
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url = `${base}/actifs/${idActif}`;
  let qr = null;
  try {
    const QRCode = require('qrcode');
    qr = await QRCode.toDataURL(url, { margin: 1, width: 300 }); // image PNG en base64
  } catch {
    throw httpError(500, 'Paquet manquant : lance « npm install qrcode ».');
  }
  return { url, code_barres: actif.code_inventaire, qr };
};
