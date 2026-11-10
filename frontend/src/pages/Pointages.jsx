import etudiants from '../api/etudiants';
import pointages from '../api/pointages';
import { salles } from '../api/references';
import Button from '../components/common/Button';
import CrudPage from '../components/common/CrudPage';
import { today } from '../utils/formatDate';
import { labelPersonne } from '../utils/helpers';

// Heure actuelle au format HH:MM (valeur d'un champ <input type="time">)
const maintenant = () => new Date().toTimeString().slice(0, 5);

// Adaptez "name" aux colonnes réelles de la table pointage.
const FIELDS = [
  {
    name: 'id_etudiant',
    label: 'Étudiant',
    type: 'select',
    required: true,
    searchable: true, // zone de recherche : nom, prénom ou matricule
    placeholder: 'Rechercher un étudiant...',
    // le matricule distingue deux étudiants qui portent le même nom
    optionsFrom: { load: () => etudiants.list(), value: 'id_etudiant', label: (e) => `${labelPersonne(e)}${e.matricule ? ` — ${e.matricule}` : ''}` },
  },
  {
    name: 'id_salle',
    label: 'Salle',
    type: 'select',
    optionsFrom: { load: () => salles.list(), value: 'id_salle', label: 'nom_salle' },
  },
  { name: 'date_pointage', label: 'Date', type: 'date', required: true, default: today() },
  { name: 'heure_arrivee', label: "Heure d'arrivée", type: 'time' },
  { name: 'heure_depart', label: 'Heure de départ', type: 'time' },
];

export default function Pointages() {
  return (
    <CrudPage
      title="Pointages"
      subtitle="Présence des étudiants en salle"
      resource={pointages}
      idKey="id_pointage"
      fields={FIELDS}
      addLabel="+ Nouveau pointage"
      searchPlaceholder="Rechercher un étudiant, une salle, une date..."
      defaults={{ heure_arrivee: maintenant() }}
      // Bouton rapide : enregistre l'heure de départ à l'instant présent
      rowActions={(row, { reload, setOk, setError }) =>
        row.heure_depart ? null : (
          <Button
            variant="success"
            size="sm"
            onClick={async () => {
              try {
                await pointages.update(row.id_pointage, { heure_depart: maintenant() });
                setOk('Heure de départ enregistrée.');
                reload();
              } catch (e) {
                setError(e?.response?.data?.message || 'Enregistrement impossible.');
              }
            }}
          >
            Départ
          </Button>
        )
      }
    />
  );
}
