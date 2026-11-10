// src/utils/asyncHandler.js : évite le try/catch dans chaque contrôleur
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
