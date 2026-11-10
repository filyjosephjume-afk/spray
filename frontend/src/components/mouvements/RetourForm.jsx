import { useState } from 'react';
import Alert from '../common/Alert';
import Button from '../common/Button';
import Field from '../common/Field';
import useFetch from '../../hooks/useFetch';
import actifs from '../../api/actifs';
import mouvements from '../../api/mouvements';
import { errMsg } from '../../api/axios';
import { ETATS_ACTIF } from '../../utils/constants';
import { today } from '../../utils/formatDate';
import { emptyToNull, pick, statutKind } from '../../utils/helpers';

// Retour d'un actif sorti.
// Envoie POST /mouvements/retour { id_actif, date_mouvement, etat_retour, observation }
export default function RetourForm({ onDone, onCancel }) {
  const { data, loading, error: loadError } = useFetch(() => actifs.list());
  const [v, setV] = useState({ id_actif: '', date_mouvement: today(), etat_retour: 'bon', observation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sortis = (data || []).filter((a) => statutKind(a.statut) === 'sorti');
  const set = (name, val) => setV((s) => ({ ...s, [name]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await mouvements.retour(emptyToNull(v));
      onDone('Retour enregistré : l\'actif est de nouveau disponible.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Alert type="error">{error || loadError}</Alert>
      {!loading && sortis.length === 0 && <Alert type="warning">Aucun actif n'est actuellement sorti.</Alert>}
      <div className="form-grid">
        <Field
          field={{ name: 'id_actif', label: 'Actif retourné', type: 'select', required: true, full: true }}
          value={v.id_actif}
          onChange={set}
          options={sortis.map((a) => ({ value: pick(a, ['id_actif', 'id']), label: `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` }))}
        />
        <Field field={{ name: 'date_mouvement', label: 'Date de retour', type: 'date', required: true }} value={v.date_mouvement} onChange={set} />
        <Field field={{ name: 'etat_retour', label: "État à l'arrivée", type: 'select', options: ETATS_ACTIF }} value={v.etat_retour} onChange={set} options={ETATS_ACTIF} />
        <Field field={{ name: 'observation', label: 'Observation', type: 'textarea' }} value={v.observation} onChange={set} />
      </div>
      <div className="form-actions">
        <Button type="submit" variant="success" loading={saving} disabled={loading}>
          Enregistrer le retour
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
