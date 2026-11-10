// src/utils/validators.js
exports.estVide = (v) => v === undefined || v === null || String(v).trim() === '';
exports.estEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
exports.estDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !Number.isNaN(Date.parse(v));
// compare sans tenir compte des majuscules : "REBUT" == "rebut"
exports.memeValeur = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
