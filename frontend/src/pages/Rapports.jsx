import { useState } from 'react';
import actifs from '../api/actifs';
import incidents from '../api/incidents';
import licences from '../api/licences';
import maintenances from '../api/maintenances';
import mouvements from '../api/mouvements';
import { errMsg } from '../api/axios';
import useFetch from '../hooks/useFetch';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import DataTable, { autoColumns } from '../components/common/DataTable';
import PageHeader from '../components/common/PageHeader';
import { today } from '../utils/formatDate';
import { downloadFile, toCSV } from '../utils/helpers';

const RAPPORTS = [
  { key: 'actifs', titre: 'Inventaire des actifs', texte: 'Tous les équipements avec leur statut et leur garantie.', load: () => actifs.list() },
  { key: 'mouvements', titre: 'Mouvements', texte: 'Historique des sorties et des retours.', load: () => mouvements.list() },
  { key: 'maintenances', titre: 'Maintenances', texte: 'Interventions, coûts et prochaines échéances.', load: () => maintenances.list() },
  { key: 'incidents', titre: 'Incidents', texte: 'Pannes, pertes et dégradations signalées.', load: () => incidents.list() },
  { key: 'licences', titre: 'Licences', texte: 'Licences logicielles et dates d\'expiration.', load: () => licences.list() },
];

export default function Rapports() {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Coût par actif (vue v_cout_actif)
  const couts = useFetch(() => actifs.couts());

  const exporter = async (r) => {
    setBusy(r.key);
    setError('');
    setOk('');
    try {
      const rows = await r.load();
      if (!rows.length) {
        setError(`Aucune donnée à exporter pour « ${r.titre} ».`);
        return;
      }
      downloadFile(toCSV(rows), `${r.key}_${today()}.csv`);
      setOk(`« ${r.titre} » : ${rows.length} ligne(s) exportée(s). Le fichier s'ouvre dans Excel.`);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  const coutRows = couts.data || [];

  return (
    <div>
      <PageHeader title="Rapports" subtitle="Exports au format CSV (compatible Excel)" />
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>

      <div className="grid-stats mb" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {RAPPORTS.map((r) => (
          <div className="card" key={r.key} style={{ padding: 16 }}>
            <h3 style={{ fontSize: 16 }}>{r.titre}</h3>
            <p className="muted" style={{ minHeight: 40 }}>{r.texte}</p>
            <Button variant="outline" loading={busy === r.key} onClick={() => exporter(r)}>
              Télécharger (CSV)
            </Button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          Coût par actif
          <Button variant="outline" size="sm" className="no-print" onClick={() => window.print()}>
            Imprimer
          </Button>
        </div>
        {couts.error ? (
          <div className="card-body muted">Indisponible : {couts.error}</div>
        ) : (
          <DataTable columns={autoColumns(coutRows)} rows={coutRows} rowKey={(r) => JSON.stringify(r)} loading={couts.loading} emptyText="Aucune donnée de coût." />
        )}
      </div>
    </div>
  );
}
