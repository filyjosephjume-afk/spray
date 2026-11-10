// scripts/check-db.js  ->  npm run check-db
// Vérifie que les tables de src/config/tables.js existent et affiche leurs colonnes.
require('dotenv').config();
const db = require('../src/config/db');
const T = require('../src/config/tables');

(async () => {
  try {
    const [rows] = await db.query('SHOW FULL TABLES');
    const reelles = rows.map((r) => Object.values(r)[0]);
    console.log('\nTables et vues trouvées dans la base :', reelles.join(', '), '\n');

    let manque = 0;
    for (const [cle, nom] of Object.entries(T)) {
      if (!reelles.includes(nom)) {
        manque++;
        const proche = reelles.filter((r) => r.includes(cle.replace(/^v_/, '')) || cle.includes(r));
        console.log(`✘ "${nom}" (${cle}) INTROUVABLE` + (proche.length ? `  → essaie : ${proche.join(' ou ')}` : ''));
        continue;
      }
      const [cols] = await db.query(`SHOW COLUMNS FROM \`${nom}\``);
      console.log(`✔ ${nom}  [${cols.map((c) => c.Field).join(', ')}]`);
    }
    console.log(manque ? `\n${manque} nom(s) à corriger dans src/config/tables.js\n` : '\nTout est bon.\n');
  } catch (err) {
    console.error('Erreur :', err.message);
  }
  process.exit(0);
})();
