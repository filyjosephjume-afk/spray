import actifs from '../api/actifs';
import maintenances from '../api/maintenances';
import { errMsg } from '../api/axios';
import Button from '../components/common/Button';
import CrudPage from '../components/common/CrudPage';
import { STATUTS_MAINTENANCE, TYPES_MAINTENANCE } from '../utils/constants';
import { today } from '../utils/formatDate';

const optionsActifs = {
  load: () => actifs.list(),
  value: 'id_actif',
  label: (a) => `${a.code_inventaire ?? ''} — ${a.designation ?? ''}`,
};

// Adaptez "name" aux colonnes réelles de la table maintenance.
const FIELDS = [
  { name: 'id_actif', label: 'Actif', type: 'select', optionsFrom: optionsActifs, required: true },
  { name: 'type_maintenance', label: 'Type', type: 'select', options: TYPES_MAINTENANCE, required: true, default: 'corrective' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'date_debut', label: 'Début', type: 'date', required: true, default: today() },
  { name: 'date_fin', label: 'Fin', type: 'date' },
  { name: 'date_prochaine', label: 'Prochaine échéance', type: 'date' },
  { name: 'cout', label: 'Coût (Ar)', type: 'money' },
  { name: 'statut_maintenance', label: 'Statut', type: 'select', options: STATUTS_MAINTENANCE, default: 'en_cours', badge: true },
];

export default function Maintenances() {
  return (
    <CrudPage
      title="Maintenances"
      subtitle="Pannes, réparations et entretiens préventifs"
      resource={maintenances}
      idKey="id_maintenance"
      fields={FIELDS}
      addLabel="+ Nouvelle maintenance"
      rowActions={(row, { reload, setOk, setError }) =>
        row.statut_maintenance === 'en_cours' ? (
          <Button
            variant="success"
            size="sm"
            onClick={async () => {
              try {
                await maintenances.terminer(row.id_maintenance, { date_fin: today() });
                setOk('Maintenance terminée.');
                reload();
              } catch (e) {
                setError(errMsg(e));
              }
            }}
          >
            Terminer
          </Button>
        ) : null
      }
    />
  );
}
