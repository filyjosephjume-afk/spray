# Backend Spray Info — Express.js + MySQL

## 1. Structure du projet

```
backend/
├── .env                      connexion MySQL, JWT_SECRET, port
├── package.json
├── server.js                 point d'entrée
├── scripts/check-db.js       vérifie les tables et colonnes
└── src/
    ├── app.js                Express, cors, routes, erreurs
    ├── config/               db.js (pool + transactions), tables.js (noms des tables)
    ├── middlewares/          auth (authenticate, authorize), error, validate
    ├── routes/               un fichier par module + index.js
    ├── controllers/          un fichier par module
    ├── services/             règles métier (transactions sur plusieurs tables)
    ├── reports/              PDF et Excel
    ├── utils/                jwt, httpError, asyncHandler, dbErrors, constants,
    │                         dates, pagination, validators, actifView, crud
    └── seed/                 seed.js (comptes), seed-actifs.js (démo)
```

## 2. Installation (dans l'ordre)

1. Démarre **MySQL** dans XAMPP.
2. Copie ces fichiers dans `D:\spray_info\backend` (sauvegarde l'ancien dossier avant).
3. Terminal VS Code :

```powershell
cd D:\spray_info\backend
copy .env.example .env
npm install
npm run check-db
```

4. Dans `.env`, vérifie `DB_NAME=spray_info`, `DB_PASSWORD=` (vide avec XAMPP) et le `JWT_SECRET`.
5. `npm run check-db` affiche chaque table avec ses colonnes. Pour une ligne `✘ INTROUVABLE`, corrige le nom dans `src/config/tables.js`.
6. Données de test (facultatif) :

```powershell
npm run seed          # comptes : directeur@sprayinfo.mg ... mot de passe Passw0rd!
npm run seed:actifs   # catégories, salles, 7 actifs de démonstration
```

7. Lancer : `npm run dev` → `✔ MySQL connecté` puis `✔ API prête`.

## 3. Valeurs à faire correspondre avec ta base

Dans `src/utils/constants.js`, les valeurs de statut doivent être identiques à celles de MySQL
(phpMyAdmin → table `actif` → Structure → colonne `statut`) :
`disponible`, `sorti`, `en_maintenance`, `rebut`.
Si ta base utilise des majuscules (ex. `REBUTE`), change les valeurs dans ce fichier ET dans `frontend/src/utils/constants.js`.

Les colonnes attendues par le frontend : `id_actif, code_inventaire, designation, id_categorie, id_salle, id_fournisseur, statut, etat`,
`type_mouvement, date_mouvement`, `statut_maintenance, type_maintenance, date_debut, date_fin, date_prochaine, cout`,
`date_incident, gravite, statut`, table `utilisateur_role(id_utilisateur, id_role)`.
Les colonnes qui n'existent pas sont ignorées à l'enregistrement.

## 4. Les routes de l'API

| Route | Méthodes | Rôle requis (écriture) |
|---|---|---|
| /api/auth/login, /api/auth/me | POST, GET | publique / connecté |
| /api/dashboard, /api/alertes | GET | connecté |
| /api/actifs, /couts, /:id/historique, /:id/qrcode | GET | connecté |
| /api/actifs, /:id, /:id/rebut | POST, PUT, DELETE | écriture / admin pour supprimer |
| /api/mouvements/sortie, /retour | POST | écriture |
| /api/maintenances, /:id/terminer | CRUD + POST | écriture |
| /api/incidents, /:id/resoudre | CRUD + POST | écriture |
| /api/autorisations, /:id/decision | CRUD + POST | décision : Directeur seulement |
| /api/affectations | CRUD (clôture l'ancienne) | écriture |
| /api/rebuts | GET, POST | écriture |
| /api/licences, etudiants, pointages | CRUD | écriture |
| /api/categories, fournisseurs, salles, services | CRUD | écriture |
| /api/utilisateurs, /:id/roles, /api/roles | CRUD | admin |
| /api/rapports/:type?format=pdf\|excel | GET | connecté (inventaire, couts, maintenances, mouvements, affectations) |

## 5. Tester le backend

**Navigateur** : `http://localhost:5000/api/health` → `{"status":"ok"}` ; `http://localhost:5000/api/actifs` → « jeton manquant » (c'est bon, la route existe).

**PowerShell** :

```powershell
$r = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login -ContentType "application/json" -Body '{"email":"directeur@sprayinfo.mg","mot_de_passe":"Passw0rd!"}'
$h = @{ Authorization = "Bearer $($r.token)" }

Invoke-RestMethod http://localhost:5000/api/actifs -Headers $h
Invoke-RestMethod http://localhost:5000/api/dashboard -Headers $h
Invoke-RestMethod http://localhost:5000/api/alertes -Headers $h

# ajouter / modifier / supprimer
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/actifs -Headers $h -ContentType "application/json" -Body '{"code_inventaire":"PC-TEST","designation":"PC de test"}'
Invoke-RestMethod -Method Put -Uri http://localhost:5000/api/actifs/1 -Headers $h -ContentType "application/json" -Body '{"etat":"usage"}'
Invoke-RestMethod -Method Delete -Uri http://localhost:5000/api/actifs/1 -Headers $h

# sortie puis retour
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/mouvements/sortie -Headers $h -ContentType "application/json" -Body '{"id_actif":1}'
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/mouvements/retour -Headers $h -ContentType "application/json" -Body '{"id_actif":1,"etat_retour":"bon"}'

# rapport PDF
Invoke-WebRequest http://localhost:5000/api/rapports/inventaire?format=pdf -Headers $h -OutFile inventaire.pdf
```

**CMD** :

```bat
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"directeur@sprayinfo.mg\",\"mot_de_passe\":\"Passw0rd!\"}"
curl.exe http://localhost:5000/api/actifs -H "Authorization: Bearer COLLE_LE_TOKEN"
```

**Frontend** : `cd D:\spray_info\frontend` → `npm run dev` → `http://localhost:5173` → connexion → clique sur chaque page.

## 6. Si ça ne marche pas

| Message | Solution |
|---|---|
| Cannot find module | `npm install` |
| Connexion MySQL impossible | démarre MySQL (XAMPP), vérifie `.env` |
| Table introuvable | `npm run check-db`, puis `src/config/tables.js` |
| Colonne introuvable | compare avec `check-db` |
| Jeton invalide ou expiré | même `JWT_SECRET` que lors de la connexion |
| Accès refusé (403) | ajoute ton rôle dans `ROLES` (`src/utils/constants.js`) |
| Valeur non autorisée pour un champ | valeurs de statut différentes (voir §3) |
| Route introuvable | `frontend/src/api/routes.js` ≠ `src/routes/index.js` |
