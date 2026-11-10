import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import actifs from '../../api/actifs';
import { categories, fournisseurs, salles } from '../../api/references';
import { errMsg } from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import DataTable, { autoColumns } from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatutBadge from '../../components/common/StatutBadge';
import QRCodeView from '../../components/actifs/QRCodeView';
import { ETATS_ACTIF } from '../../utils/constants';
import { formatDate, formatMoney } from '../../utils/formatDate';
import { lookup, pick, statutKind } from '../../utils/helpers';

function Info({ label, children }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="value">{children || <span className="muted">—</span>}</div>
    </div>
  );
}

export default function FicheActif() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const { data, loading, error: loadError, reload } = useFetch(async () => {
    const [a, h, c, f, s] = await Promise.allSettled([actifs.get(id), actifs.historique(id), categories.list(), fournisseurs.list(), salles.list()]);
    if (a.status === 'rejected') throw a.reason;
    const v = (r) => (r.status === 'fulfilled' ? r.value : []);
    return { actif: a.value, historique: v(h), categories: v(c), fournisseurs: v(f), salles: v(s), historiqueError: h.status === 'rejected' ? errMsg(h.reason) : '' };
  }, [id]);

  if (loading) return <p className="muted">Chargement...</p>;
  if (loadError) return <Alert>{loadError}</Alert>;

  const { actif: a, historique } = data;
  const idActif = pick(a, ['id_actif', 'id'], id);
  const categorie = pick(a, ['nom_categorie', 'categorie']) || lookup(data.categories, ['id_categorie', 'id'], a.id_categorie, ['nom_categorie']);
  const fournisseur = pick(a, ['nom_fournisseur', 'fournisseur']) || lookup(data.fournisseurs, ['id_fournisseur', 'id'], a.id_fournisseur, ['nom_fournisseur']);
  const salle = pick(a, ['nom_salle', 'salle']) || lookup(data.salles, ['id_salle', 'id'], a.id_salle, ['nom_salle']);
  const etat = ETATS_ACTIF.find((e) => e.value === a.etat)?.label || a.etat;

  const mettreAuRebut = async () => {
    const motif = window.prompt('Motif de la mise au rebut :');
    if (motif === null) return;
    setError('');
    try {
      await actifs.rebut(idActif, { motif });
      setOk('Actif mis au rebut.');
      reload();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const supprimer = async () => {
    if (!window.confirm('Supprimer définitivement cet actif ?')) return;
    setError('');
    try {
      await actifs.remove(idActif);
      navigate('/actifs');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  // Toutes les colonnes simples, pour vérifier les vrais noms de colonnes de la base
  const brut = Object.entries(a).filter(([, v]) => v === null || typeof v !== 'object');

  return (
    <div>
      <PageHeader title={`${a.code_inventaire ?? ''} — ${a.designation ?? ''}`} subtitle={<StatutBadge value={a.statut} />}>
        <Link to="/actifs" className="btn btn-outline">
          ← Retour
        </Link>
        {canWrite && (
          <Link to={`/actifs/${idActif}/modifier`} className="btn btn-primary">
            Modifier
          </Link>
        )}
        {canWrite && statutKind(a.statut) !== 'rebut' && (
          <Button variant="warning" onClick={mettreAuRebut}>
            Mettre au rebut
          </Button>
        )}
        {canWrite && (
          <Button variant="danger" onClick={supprimer}>
            Supprimer
          </Button>
        )}
      </PageHeader>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>

      <div className="layout-fiche mb">
        <div className="card">
          <div className="card-header">Informations</div>
          <div className="card-body">
            <div className="detail-grid">
              <Info label="Catégorie">{categorie}</Info>
              <Info label="Fournisseur">{fournisseur}</Info>
              <Info label="Marque / modèle">{[a.marque, a.modele].filter(Boolean).join(' ')}</Info>
              <Info label="N° de série">{a.numero_serie}</Info>
              <Info label="Salle">{salle}</Info>
              <Info label="État">{etat}</Info>
              <Info label="Date d'acquisition">{a.date_acquisition ? formatDate(a.date_acquisition) : ''}</Info>
              <Info label="Prix d'acquisition">{a.prix_acquisition != null ? formatMoney(a.prix_acquisition) : ''}</Info>
              <Info label="Fin de garantie">{a.date_fin_garantie ? formatDate(a.date_fin_garantie) : ''}</Info>
            </div>
            {a.description && (
              <div style={{ marginTop: 14 }}>
                <div className="muted" style={{ fontSize: 12 }}>Description</div>
                <div>{a.description}</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Étiquette QR code</div>
          <div className="card-body">
            <QRCodeView value={`${window.location.origin}/actifs/${idActif}`} title={a.code_inventaire} subtitle={a.designation} />
          </div>
        </div>
      </div>

      <div className="card mb">
        <div className="card-header">Historique de l'actif</div>
        {data.historiqueError ? (
          <div className="card-body muted">Historique indisponible : {data.historiqueError}</div>
        ) : (
          <DataTable columns={autoColumns(historique, { hide: ['id_actif'] })} rows={historique} rowKey={(r) => JSON.stringify(r)} searchable={false} emptyText="Aucun événement enregistré." pageSize={8} />
        )}
      </div>

      <details className="raw card">
        <summary style={{ padding: 14 }}>Toutes les données de la base (pour vérifier les noms de colonnes)</summary>
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {brut.map(([k, v]) => (
                <tr key={k}>
                  <th style={{ width: 240 }}>{k}</th>
                  <td>{v === null ? '—' : String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
