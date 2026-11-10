import actifs from '../api/actifs';
import incidents from '../api/incidents';
import { errMsg } from '../api/axios';
import Button from '../components/common/Button';
import CrudPage from '../components/common/CrudPage';
import { GRAVITES, STATUTS_INCIDENT } from '../utils/constants';
import { today } from '../utils/formatDate';

// Adaptez "name" aux colonnes réelles de la table incident.
const FIELDS = [
  {
    name: 'id_actif',
    label: 'Actif concerné',
    type: 'select',
    required: true,
    optionsFrom: { load: () => actifs.list(), value: 'id_actif', label: (a) => `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` },
  },
  { name: 'date_incident', label: "Date de l'incident", type: 'date', required: true, default: today() },
  { name: 'gravite', label: 'Gravité', type: 'select', options: GRAVITES, default: 'moyenne', badge: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'statut', label: 'Statut', type: 'select', options: STATUTS_INCIDENT, default: 'ouvert', badge: true },
];

export default function Incidents() {
  return (
    <CrudPage
      title="Incidents"
      subtitle="Pannes, pertes, dégradations signalées"
      resource={incidents}
      idKey="id_incident"
      fields={FIELDS}
      addLabel="+ Déclarer un incident"
      rowActions={(row, { reload, setOk, setError }) =>
        row.statut !== 'resolu' ? (
          <Button
            variant="success"
            size="sm"
            onClick={async () => {
              try {
                await incidents.resoudre(row.id_incident);
                setOk('Incident marqué comme résolu.');
                reload();
              } catch (e) {
                setError(errMsg(e));
              }
            }}
          >
            Résolu
          </Button>
        ) : null
      }
    />
  );
}
