// server.js : point de démarrage (npm run dev)
require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✔ MySQL connecté :', process.env.DB_NAME);
  } catch (err) {
    console.error('✘ Connexion MySQL impossible :', err.message);
    console.error('  → Vérifie que MySQL est démarré dans XAMPP et le fichier .env');
  }
  app.listen(PORT, () => console.log(`✔ API prête : http://localhost:${PORT}/api/health`));
})();
