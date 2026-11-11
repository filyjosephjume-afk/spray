// server.js : point de démarrage (npm run dev en local, npm start sur Railway)
require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Affiche les erreurs inattendues dans les logs Railway au lieu de planter en silence
process.on('unhandledRejection', (err) => {
  console.error('✘ Promesse rejetée non gérée :', err);
});
process.on('uncaughtException', (err) => {
  console.error('✘ Exception non gérée :', err);
});

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✔ MySQL connecté :', process.env.DB_NAME);
  } catch (err) {
    console.error('✘ Connexion MySQL impossible :', err.message);
    console.error('  → Vérifie les variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('    (en local : MySQL démarré dans XAMPP et fichier .env ; sur Railway : onglet Variables)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✔ API prête sur le port ${PORT} : /api/health`);
  });
})();