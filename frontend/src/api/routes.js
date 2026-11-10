// diagnostic-routes.js
// Usage (le backend doit tourner) :   node diagnostic-routes.js
//        autre adresse :              node diagnostic-routes.js http://localhost:5000/api
//
// Principe : on appelle chaque route SANS jeton.
//   - 401 / 403 / 200 -> la route existe (elle réclame simplement une connexion)
//   - 404 "Route introuvable" -> la route n'est PAS montée dans app.js
require('dotenv').config();

const base = process.argv[2] || `http://localhost:${process.env.PORT || 5000}/api`;

// [chemin à tester, ligne à ajouter dans app.js si elle manque]
const ROUTES = [
  ['/health', null],
  ['/auth/me', "app.use('/api/auth', require('./routes/auth.routes'));"],
  ['/utilisateurs', "app.use('/api/utilisateurs', require('./routes/utilisateur.routes'));"],
  ['/etudiants', "app.use('/api/etudiants', require('./routes/etudiant.routes'));"],
  ['/referentiels/salles', "app.use('/api/referentiels', require('./routes/referentiel.routes'));"],
  ['/actifs', "app.use('/api/actifs', require('./routes/actif.routes'));"],
  ['/licences', "app.use('/api/licences', require('./routes/licence.routes'));"],
  ['/mouvements', "app.use('/api/mouvements', require('./routes/mouvement.routes'));"],
  ['/autorisations', "app.use('/api/autorisations', require('./routes/autorisation.routes'));"],
  ['/affectations', "app.use('/api/affectations', require('./routes/affectation.routes'));"],
  ['/rebuts', "app.use('/api/rebuts', require('./routes/rebut.routes'));"],
  ['/pointages', "app.use('/api/pointages', require('./routes/pointage.routes'));"],
  ['/incidents', "app.use('/api/incidents', require('./routes/incident.routes'));"],
  ['/maintenances', "app.use('/api/maintenances', require('./routes/maintenance.routes'));"],
  ['/alertes', "app.use('/api/alertes', require('./routes/alerte.routes'));"],
  ['/dashboard', "app.use('/api/dashboard', require('./routes/dashboard.routes'));"],
  ['/rapports/actifs', "app.use('/api/rapports', require('./routes/rapport.routes'));"]
];

(async () => {
  console.log(`\nDiagnostic des routes : ${base}\n`);
  const manquantes = [];

  for (const [chemin, ligne] of ROUTES) {
    let status;
    let message = '';
    try {
      const res = await fetch(base + chemin);
      status = res.status;
      try { message = (await res.json()).message || ''; } catch (e) { message = ''; }
    } catch (e) {
      console.log('Impossible de joindre le serveur. Vérifie qu\'il est démarré (npm run dev) et que le port est le bon.');
      console.log(`Détail : ${e.cause ? e.cause.code : e.message}\n`);
      process.exit(2);
    }

    const nonMontee = status === 404 && /^Route introuvable/.test(message);
    if (nonMontee) {
      manquantes.push(ligne);
      console.log(`  ❌ ${chemin.padEnd(24)} NON MONTÉE (404)`);
    } else if (status === 500) {
      console.log(`  ⚠️  ${chemin.padEnd(24)} la route existe mais plante (500) : regarde le terminal du backend`);
    } else {
      console.log(`  ✅ ${chemin.padEnd(24)} OK (${status})`);
    }
  }

  const aAjouter = [...new Set(manquantes.filter(Boolean))];
  if (aAjouter.length === 0) {
    console.log('\nToutes les routes sont montées. ✅\n');
    return;
  }
  console.log(`\n${aAjouter.length} module(s) à monter dans app.js, AVANT la ligne  app.use(notFound);  :\n`);
  aAjouter.forEach((l) => console.log(`  ${l}`));
  console.log('\nPuis redémarre le backend et relance ce diagnostic.\n');
  process.exit(1);
})();
