// src/utils/dates.js  (dates au format AAAA-MM-JJ)
const aujourdhui = () => new Date().toISOString().slice(0, 10);

function addDays(dateStr, jours) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Number(jours));
  return d.toISOString().slice(0, 10);
}

function joursEntre(debut, fin) {
  return Math.round((new Date(`${fin}T00:00:00Z`) - new Date(`${debut}T00:00:00Z`)) / 86400000);
}

module.exports = { aujourdhui, addDays, joursEntre };
