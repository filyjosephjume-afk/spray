import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layouts/MainLayout';
import { ADMIN_ROLES } from '../utils/constants';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ListeActifs from '../pages/actifs/ListeActifs';
import FicheActif from '../pages/actifs/FicheActif';
import EditerActif from '../pages/actifs/EditerActif';
import Mouvements from '../pages/Mouvements';
import Maintenances from '../pages/Maintenances';
import Incidents from '../pages/Incidents';
import Licences from '../pages/Licences';
import Etudiants from '../pages/Etudiants';
import Pointages from '../pages/Pointages';
import Autorisations from '../pages/Autorisations';
import Rapports from '../pages/Rapports';
import Parametres from '../pages/Parametres';
import Utilisateurs from '../pages/Utilisateurs';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="actifs" element={<ListeActifs />} />
        <Route path="actifs/nouveau" element={<EditerActif />} />
        <Route path="actifs/:id" element={<FicheActif />} />
        <Route path="actifs/:id/modifier" element={<EditerActif />} />

        <Route path="mouvements" element={<Mouvements />} />
        <Route path="maintenances" element={<Maintenances />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="licences" element={<Licences />} />
        <Route path="etudiants" element={<Etudiants />} />
        <Route path="pointages" element={<Pointages />} />
        <Route path="autorisations" element={<Autorisations />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="parametres" element={<Parametres />} />

        <Route
          path="utilisateurs"
          element={
            <PrivateRoute roles={ADMIN_ROLES}>
              <Utilisateurs />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
