// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const secret = () => process.env.JWT_SECRET || 'secret_de_developpement';
exports.signer = (payload) => jwt.sign(payload, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
exports.verifier = (token) => jwt.verify(token, secret());
