import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import actifs from '../api/actifs';
import etudiants from '../api/etudiants';
import mouvements from '../api/mouvements';
import { salles } from '../api/references';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import StatutBadge from '../components/common/StatutBadge';
import SortieForm from '../components/mouvements/SortieForm';
import RetourForm from '../components/mouvements/RetourForm';
import { formatDate } from '../utils/formatDate';
import { labelPersonne, lookup, norm, pick } from '../utils/helpers';

export default function Mouvements() {
  const { canWrite } = useAuth();
  const [type, setType] = useState('tous'); // tous | sortie | retour
  const [modal, setModal] = useState(null); // null | 'sortie' | 'retour'
  const [ok, setOk] = useState('');

  const { data, loading, error, reload } = useFetch(async () => {
    const [m, a, e, s] = await Promise.all([
      mouvements.list(),
      actifs.list().catch(() => []),
      etudiants.list().catch(() => []),
      salles.list().catch(() => []),
    ]);
    return { mouvements: m, actifs: a, etudiants: e, salles: s };
  });

  const rows = (data?.mouvements || []).filter((m) => type === 'tous' || norm(pick(m, ['type', 'type_mouvement'])) === type);
  const listActifs = data?.actifs || [];

  const nomActif = (m) => {
    if (m.designation) return `${m.code_inventaire ?? ''} ${m.designation}`.trim();
    const a = listActifs.find((x) => String(pick(x, ['id_actif', 'id'])) === String(m.id_actif));
    return a ? `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` : m.id_actif ?? '—';
  };
  const nomPersonne = (m) =>
    pick(m, ['nom_etudiant', 'emprunteur']) ||
    labelPersonne((data?.etudiants || []).find((e) => String(pick(e, ['id_etudiant', 'id'])) === String(m.id_etudiant))) ||
    '—';
  const nomSalle = (m) => pick(m, ['nom_salle']) || lookup(data?.salles, ['id_salle', 'id'], m.id_salle, ['nom_salle']) || '—';

  const done = (message) => {
    setModal(null);
    setOk(message);
    reload();
  };

  const columns = [
    { key: 'date_mouvement', label: 'Date', render: (m) => formatDate(pick(m, ['date_mouvement', 'date'])) },
    { key: 'type', label: 'Type', render: (m) => <StatutBadge value={pick(m, ['type', 'type_mouvement'])} /> },
    {
      key: 'actif',
      label: 'Actif',
      render: (m) => (m.id_actif ? <Link to={`/actifs/${m.id_actif}`}>{nomActif(m)}</Link> : nomActif(m)),
      sortValue: nomActif,
    },
    { key: 'emprunteur', label: 'Étudiant', render: nomPersonne, sortValue: nomPersonne },
    { key: 'salle', label: 'Salle', render: nomSalle, sortValue: nomSalle },
    { key: 'date_retour_prevue', label: 'Retour prévu', render: (m) => formatDate(m.date_retour_prevue) },
    { key: 'observation', label: 'Observation', render: (m) => <div className="cell-clip">{pick(m, ['observation', 'motif'], '—')}</div> },
  ];

  return (
    <div>
      <PageHeader title="Mouvements" subtitle="Sorties et retours d'équipements">
        {canWrite && (
          <>
            <Button variant="outline" onClick={() => setModal('retour')}>
              Enregistrer un retour
            </Button>
            <Button onClick={() => setModal('sortie')}>+ Nouvelle sortie</Button>
          </>
        )}
      </PageHeader>

      <Alert>{error}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>

      <div className="tabs">
        {[
          ['tous', 'Tous'],
          ['sortie', 'Sorties'],
          ['retour', 'Retours'],
        ].map(([k, label]) => (
          <button key={k} className={`tab${type === k ? ' active' : ''}`} onClick={() => setType(k)}>
            {label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(m) => pick(m, ['id_mouvement', 'id']) || JSON.stringify(m)} loading={loading} />

      <Modal open={modal === 'sortie'} title="Nouvelle sortie" onClose={() => setModal(null)}>
        <SortieForm onDone={done} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'retour'} title="Enregistrer un retour" onClose={() => setModal(null)}>
        <RetourForm onDone={done} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}
