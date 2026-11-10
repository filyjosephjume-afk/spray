import actifs from '../api/actifs';
import autorisations from '../api/autorisations';
import etudiants from '../api/etudiants';
import CrudPage from '../components/common/CrudPage';
import { STATUTS_AUTORISATION } from '../utils/constants';
import { today } from '../utils/formatDate';
import { labelPersonne } from '../utils/helpers';

// Adaptez "name" aux colonnes réelles de la table autorisation.
const FIELDS = [
  {
    name: 'id_etudiant',
    label: 'Étudiant',
    type: 'select',
    required: true,
    optionsFrom: { load: () => etudiants.list(), value: 'id_etudiant', label: labelPersonne },
  },
  {
    name: 'id_actif',
    label: 'Actif concerné',
    type: 'select',
    optionsFrom: { load: () => actifs.list(), value: 'id_actif', label: (a) => `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` },
  },
  { name: 'date_debut', label: 'Du', type: 'date', required: true, default: today() },
  { name: 'date_fin', label: 'Au', type: 'date' },
  { name: 'motif', label: 'Motif', type: 'textarea' },
  { name: 'statut', label: 'Statut', type: 'select', options: STATUTS_AUTORISATION, default: 'en_attente', badge: true },
];

export default function Autorisations() {
  return <CrudPage title="Autorisations" subtitle="Autorisations d'utilisation accordées aux étudiants" resource={autorisations} idKey="id_autorisation" fields={FIELDS} addLabel="+ Nouvelle autorisation" />;
}
