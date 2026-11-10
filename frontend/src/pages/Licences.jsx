import actifs from '../api/actifs';
import licences from '../api/licences';
import { fournisseurs } from '../api/references';
import CrudPage from '../components/common/CrudPage';
import StatutBadge from '../components/common/StatutBadge';
import { daysUntil, formatDate } from '../utils/formatDate';

// Adaptez "name" aux colonnes réelles de la table licence.
const FIELDS = [
  { name: 'nom_logiciel', label: 'Logiciel', required: true },
  { name: 'cle_licence', label: 'Clé de licence', table: false },
  { name: 'nombre_postes', label: 'Nombre de postes', type: 'number' },
  {
    name: 'id_actif',
    label: 'Actif associé',
    type: 'select',
    optionsFrom: { load: () => actifs.list(), value: 'id_actif', label: (a) => `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` },
  },
  {
    name: 'id_fournisseur',
    label: 'Fournisseur',
    type: 'select',
    optionsFrom: { load: () => fournisseurs.list(), value: 'id_fournisseur', label: 'nom_fournisseur' },
  },
  { name: 'date_achat', label: "Date d'achat", type: 'date' },
  {
    name: 'date_expiration',
    label: 'Expiration',
    type: 'date',
    render: (row) => {
      const j = daysUntil(row.date_expiration);
      if (j === null) return '—';
      if (j < 0) return <StatutBadge value="expirée" label={`Expirée (${formatDate(row.date_expiration)})`} />;
      if (j <= 30) return <StatutBadge value="a renouveler" label={`${formatDate(row.date_expiration)} (${j} j)`} />;
      return formatDate(row.date_expiration);
    },
  },
];

export default function Licences() {
  return <CrudPage title="Licences logicielles" subtitle="Suivi des licences et de leurs dates d'expiration" resource={licences} idKey="id_licence" fields={FIELDS} addLabel="+ Nouvelle licence" />;
}
