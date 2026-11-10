import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import actifs from '../../api/actifs';
import { categories, salles } from '../../api/references';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatutBadge from '../../components/common/StatutBadge';
import { STATUTS_ACTIF } from '../../utils/constants';
import { daysUntil, formatDate } from '../../utils/formatDate';
import { downloadFile, lookup, pick, toCSV } from '../../utils/helpers';

const ID = ['id_actif', 'id'];

export default function ListeActifs() {
  const { canWrite } = useAuth();
  const navigate = useNavigate();
  const [filtres, setFiltres] = useState({ statut: '', id_categorie: '', id_salle: '' });

  const { data, loading, error } = useFetch(async () => {
    const [a, c, s] = await Promise.all([actifs.list(), categories.list().catch(() => []), salles.list().catch(() => [])]);
    return { actifs: a, categories: c, salles: s };
  });

  const listCat = data?.categories || [];
  const listSalles = data?.salles || [];
  const nomCategorie = (a) => pick(a, ['nom_categorie', 'categorie']) || lookup(listCat, ['id_categorie', 'id'], a.id_categorie, ['nom_categorie']);
  const nomSalle = (a) => pick(a, ['nom_salle', 'salle']) || lookup(listSalles, ['id_salle', 'id'], a.id_salle, ['nom_salle']);

  const rows = useMemo(
    () =>
      (data?.actifs || []).filter(
        (a) =>
          (!filtres.statut || a.statut === filtres.statut) &&
          (!filtres.id_categorie || String(a.id_categorie) === filtres.id_categorie) &&
          (!filtres.id_salle || String(a.id_salle) === filtres.id_salle)
      ),
    [data, filtres]
  );

  const set = (k) => (e) => setFiltres({ ...filtres, [k]: e.target.value });

  const exporter = () => {
    const csv = toCSV(rows, [
      { label: 'Code', value: (a) => a.code_inventaire },
      { label: 'Désignation', value: (a) => a.designation },
      { label: 'Marque', value: (a) => a.marque },
      { label: 'Modèle', value: (a) => a.modele },
      { label: 'N° de série', value: (a) => a.numero_serie },
      { label: 'Catégorie', value: nomCategorie },
      { label: 'Salle', value: nomSalle },
      { label: 'Statut', value: (a) => a.statut },
      { label: 'État', value: (a) => a.etat },
      { label: "Date d'acquisition", value: (a) => formatDate(a.date_acquisition) },
      { label: 'Prix', value: (a) => a.prix_acquisition },
      { label: 'Fin de garantie', value: (a) => formatDate(a.date_fin_garantie) },
    ]);
    downloadFile(csv || 'Aucun actif', 'inventaire_actifs.csv');
  };

  const columns = [
    { key: 'code_inventaire', label: 'Code', render: (a) => <Link to={`/actifs/${pick(a, ID)}`}>{a.code_inventaire}</Link> },
    {
      key: 'designation',
      label: 'Désignation',
      render: (a) => (
        <>
          {a.designation}
          {(a.marque || a.modele) && <div className="muted" style={{ fontSize: 12 }}>{[a.marque, a.modele].filter(Boolean).join(' ')}</div>}
        </>
      ),
    },
    { key: 'categorie', label: 'Catégorie', render: (a) => nomCategorie(a) || '—', sortValue: nomCategorie },
    { key: 'salle', label: 'Salle', render: (a) => nomSalle(a) || '—', sortValue: nomSalle },
    { key: 'statut', label: 'Statut', render: (a) => <StatutBadge value={a.statut} /> },
    {
      key: 'date_fin_garantie',
      label: 'Fin de garantie',
      render: (a) => {
        const j = daysUntil(a.date_fin_garantie);
        if (j === null) return '—';
        if (j < 0) return <span className="badge badge-danger">Expirée {formatDate(a.date_fin_garantie)}</span>;
        if (j <= 30) return <span className="badge badge-warning">{formatDate(a.date_fin_garantie)} ({j} j)</span>;
        return formatDate(a.date_fin_garantie);
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Actifs et équipements" subtitle="Inventaire complet du parc">
        <Button variant="outline" onClick={exporter}>
          Exporter (Excel/CSV)
        </Button>
        {canWrite && <Button onClick={() => navigate('/actifs/nouveau')}>+ Nouvel actif</Button>}
      </PageHeader>

      <Alert>{error}</Alert>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(a) => pick(a, ID)}
        loading={loading}
        searchPlaceholder="Rechercher (code, désignation, marque, n° de série...)"
        toolbar={
          <>
            <select className="input" style={{ maxWidth: 170 }} value={filtres.statut} onChange={set('statut')}>
              <option value="">Tous les statuts</option>
              {STATUTS_ACTIF.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select className="input" style={{ maxWidth: 190 }} value={filtres.id_categorie} onChange={set('id_categorie')}>
              <option value="">Toutes les catégories</option>
              {listCat.map((c) => (
                <option key={pick(c, ['id_categorie', 'id'])} value={pick(c, ['id_categorie', 'id'])}>
                  {c.nom_categorie}
                </option>
              ))}
            </select>
            <select className="input" style={{ maxWidth: 170 }} value={filtres.id_salle} onChange={set('id_salle')}>
              <option value="">Toutes les salles</option>
              {listSalles.map((s) => (
                <option key={pick(s, ['id_salle', 'id'])} value={pick(s, ['id_salle', 'id'])}>
                  {s.nom_salle}
                </option>
              ))}
            </select>
          </>
        }
        actions={(a) => (
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(`/actifs/${pick(a, ID)}`)}>
              Voir
            </Button>
            {canWrite && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/actifs/${pick(a, ID)}/modifier`)}>
                Modifier
              </Button>
            )}
          </>
        )}
      />
    </div>
  );
}
