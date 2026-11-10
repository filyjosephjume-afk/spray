import etudiants from '../api/etudiants';
import CrudPage from '../components/common/CrudPage';

// Adaptez "name" aux colonnes réelles de la table etudiant.
const FIELDS = [
  { name: 'matricule', label: 'Matricule', required: true },
  { name: 'nom', label: 'Nom', required: true },
  { name: 'prenom', label: 'Prénom' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telephone', label: 'Téléphone', type: 'tel' },
  { name: 'filiere', label: 'Filière' },
  { name: 'niveau', label: 'Niveau' },
];

export default function Etudiants() {
  return <CrudPage title="Étudiants" resource={etudiants} idKey="id_etudiant" fields={FIELDS} addLabel="+ Nouvel étudiant" />;
}
