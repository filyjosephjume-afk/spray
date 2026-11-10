# Front-end React — Spray Info (gestion des actifs)

Code complet du front-end, avec **la même arborescence que ton projet** (`api`, `components`, `context`, `hooks`, `layouts`, `pages`, `routes`, `styles`, `utils`).

## ⚠️ Avant de copier : sauvegarde ton dossier
Les fichiers ont les mêmes noms que les tiens : ils vont les **remplacer**. Fais d'abord une copie de `frontend/` (ou un `git commit`), puis décompresse le ZIP dans un dossier à part et copie les fichiers un par un ou par dossier.

## Installation
Dans CMD ou PowerShell :
```bash
cd D:\spray_info\frontend
npm install axios react-router-dom react-qr-code
npm run dev
```
(Si ton `package.json` existe déjà, ne le remplace pas : installe seulement ces 3 bibliothèques.)
Ouvre http://localhost:5173. Le back-end doit tourner, et le fichier `frontend/.env` doit contenir l'adresse de ton API :
```
VITE_API_URL=http://localhost:5000/api
```
(adapte le port à celui de ton back-end).

## Ce que contient chaque page
| Page | Route | Rôle |
|---|---|---|
| Login | `/login` | Connexion (email + mot de passe), jeton JWT |
| Dashboard | `/` | Chiffres clés + alertes (vue `v_alertes`) + derniers actifs |
| ListeActifs | `/actifs` | Liste, recherche, filtres statut/catégorie/salle, export CSV |
| EditerActif | `/actifs/nouveau`, `/actifs/:id/modifier` | Formulaire d'actif |
| FicheActif | `/actifs/:id` | Détails, QR code imprimable, historique (`v_historique_actif`), rebut |
| Mouvements | `/mouvements` | Sorties et retours (formulaires SortieForm / RetourForm) |
| Maintenances, Incidents, Licences | … | Gestion complète (ajout, modification, suppression) |
| Etudiants, Pointages, Autorisations | … | Gestion complète |
| Rapports | `/rapports` | Exports CSV (Excel) + coût par actif (`v_cout_actif`) |
| Parametres | `/parametres` | Catégories, fournisseurs, salles, services |
| Utilisateurs | `/utilisateurs` | Administration : comptes et rôles (admin seulement) |

Fichiers ajoutés par rapport à ta structure : `api/licences.js`, `api/references.js`, `components/common/{Alert,Field,PageHeader,CrudPage}.jsx`, `pages/Parametres.jsx`, `pages/actifs/{ListeActifs,FicheActif,EditerActif}.jsx`, `utils/helpers.js`.

## ⚠️ Ce que j'ai supposé (à vérifier)
Je ne connais pas encore les **colonnes** de tes tables ni les **routes** de ton back-end. J'ai supposé des noms logiques. Tout est regroupé à quelques endroits faciles à modifier.

### 1. Routes de l'API (dossier `src/api`)
| Fichier | Routes attendues |
|---|---|
| `auth.js` | `POST /auth/login` avec `{ email, mot_de_passe }`, réponse `{ token, user }` |
| `actifs.js` | `/actifs` (CRUD), `/actifs/:id/historique`, `/actifs/couts`, `POST /actifs/:id/rebut` |
| `mouvements.js` | `GET /mouvements`, `POST /mouvements/sortie`, `POST /mouvements/retour` |
| `maintenances.js` | CRUD + `POST /maintenances/:id/terminer` |
| `incidents.js` | CRUD + `POST /incidents/:id/resoudre` |
| `alertes.js` / `dashboard.js` | `GET /alertes`, `GET /dashboard` |
| `etudiants`, `licences`, `pointages`, `autorisations`, `utilisateurs` | CRUD classique (`GET/POST /x`, `PUT/DELETE /x/:id`) |
| `references.js` | `/categories`, `/fournisseurs`, `/salles`, `/services`, `/roles` |

Si une route de ton back-end a un autre nom, change-la **dans le fichier `api` correspondant**, une seule fois.

### 2. Noms de colonnes (tableaux `FIELDS`)
Chaque page CRUD commence par un tableau `FIELDS` (ex. `pages/Etudiants.jsx`, `components/actifs/ActifForm.jsx`). Chaque ligne = un champ : `name` doit être le **nom exact de la colonne** en base. Clés primaires supposées : `id_actif`, `id_etudiant`, `id_incident`… (`idKey` dans chaque page).

### 3. Valeurs et rôles (`src/utils/constants.js`)
Statuts des actifs (`disponible`, `sorti`, `en_maintenance`, `rebut`), types de maintenance, gravités… et noms des rôles (`ADMIN_ROLES`). Remplace-les par les valeurs réelles de ta base.

## Conseil pour détecter les différences
- Ouvre une **fiche d'actif** : en bas, « Toutes les données de la base » liste les vrais noms de colonnes renvoyés par ton API.
- En cas d'erreur, la page affiche un message en rouge : 404 = route différente ; « Unknown column » = nom de colonne différent.

## Droits
- Le menu **Administration** n'apparaît que pour les rôles listés dans `ADMIN_ROLES`.
- Les rôles listés dans `READ_ONLY_ROLES` ne voient pas les boutons d'ajout/modification. Le vrai contrôle reste celui du back-end.
