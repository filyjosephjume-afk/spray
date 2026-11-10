import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import actifs from '../api/actifs';
import alertes from '../api/alertes';
import dashboardApi from '../api/dashboard';
import incidents from '../api/incidents';
import licences from '../api/licences';
import { errMsg } from '../api/axios';
import Alert from '../components/common/Alert';
import PageHeader from '../components/common/PageHeader';
import StatutBadge from '../components/common/StatutBadge';
import StatCard from '../components/dashboard/StatCard';
import AlertList from '../components/dashboard/AlertList';
import { daysUntil, formatDate } from '../utils/formatDate';
import { norm, pick, statutKind } from '../utils/helpers';

// Charge plusieurs sources ; si l'une échoue (route absente par exemple), les autres s'affichent quand même.
async function loadAll() {
  const [a, al, d, inc, lic] = await Promise.allSettled([
    actifs.list(),
    alertes.list(),
    dashboardApi.stats(),
    incidents.list(),
    licences.list(),
  ]);
  const ok = (r) => (r.status === 'fulfilled' ? r.value : null);
  return {
    actifs: ok(a),
    alertes: ok(al),
    stats: ok(d),
    incidents: ok(inc),
    licences: ok(lic),
    actifsError: a.status === 'rejected' ? errMsg(a.reason) : '',
  };
}

const firstDefined = (...vals) => vals.find((v) => v !== undefined && v !== null);

export default function Dashboard() {
  const { data, loading, error } = useFetch(loadAll);

  if (loading) return <p className="muted">Chargement...</p>;
  if (error) return <Alert>{error}</Alert>;

  const listActifs = data.actifs || [];
  const s = data.stats || {};

  // Les chiffres viennent de /dashboard s'il existe, sinon ils sont calculés depuis la liste des actifs
  const parStatut = listActifs.reduce((acc, a) => {
    const k = statutKind(a.statut);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const incidentsOuverts = (data.incidents || []).filter((i) => !/resolu|clos|termin|ferm/.test(norm(i.statut))).length;
  const licencesARenouveler = (data.licences || []).filter((l) => {
    const j = daysUntil(pick(l, ['date_expiration', 'date_fin']));
    return j !== null && j <= 30;
  }).length;

  const recents = [...listActifs].sort((x, y) => Number(pick(y, ['id_actif', 'id'], 0)) - Number(pick(x, ['id_actif', 'id'], 0))).slice(0, 5);

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble du parc d'équipements" />
      <Alert type="warning">{data.actifsError && `Liste des actifs indisponible : ${data.actifsError}`}</Alert>

      <div className="grid-stats">
        <StatCard label="Total des actifs" value={firstDefined(s.total_actifs, s.total, listActifs.length)} to="/actifs" />
        <StatCard label="Disponibles" value={firstDefined(s.disponibles, s.actifs_disponibles, parStatut.disponible, 0)} tone="success" />
        <StatCard label="Sortis" value={firstDefined(s.sortis, s.actifs_sortis, parStatut.sorti, 0)} to="/mouvements" />
        <StatCard label="En maintenance" value={firstDefined(s.en_maintenance, parStatut.maintenance, 0)} tone="warning" to="/maintenances" />
        <StatCard label="Au rebut" value={firstDefined(s.rebuts, s.au_rebut, parStatut.rebut, 0)} tone="danger" />
        <StatCard label="Incidents ouverts" value={firstDefined(s.incidents_ouverts, data.incidents ? incidentsOuverts : null)} tone="danger" to="/incidents" />
        <StatCard label="Licences à renouveler" value={firstDefined(s.licences_a_renouveler, data.licences ? licencesARenouveler : null)} hint="dans les 30 jours" tone="warning" to="/licences" />
        <StatCard label="Alertes" value={data.alertes ? data.alertes.length : null} tone="warning" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">Alertes</div>
          {data.alertes ? <AlertList alertes={data.alertes} /> : <div className="card-body muted">Alertes indisponibles (route /alertes).</div>}
        </div>

        <div className="card">
          <div className="card-header">
            Derniers actifs ajoutés <Link to="/actifs">Voir tout</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {recents.length === 0 && (
                  <tr>
                    <td className="empty">Aucun actif enregistré.</td>
                  </tr>
                )}
                {recents.map((a) => (
                  <tr key={pick(a, ['id_actif', 'id'])}>
                    <td>
                      <Link to={`/actifs/${pick(a, ['id_actif', 'id'])}`}>{a.code_inventaire}</Link>
                    </td>
                    <td>{a.designation}</td>
                    <td>
                      <StatutBadge value={a.statut} />
                    </td>
                    <td className="muted">{formatDate(pick(a, ['date_acquisition']))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
