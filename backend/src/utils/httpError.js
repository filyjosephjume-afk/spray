// src/utils/httpError.js : erreur avec un code HTTP
//   throw httpError(404, 'Actif introuvable.');
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const httpError = (status, message) => new HttpError(status, message);
module.exports = httpError;
module.exports.HttpError = HttpError;
