import { useState } from 'react';
import Alert from '../common/Alert';
import Button from '../common/Button';
import Field from '../common/Field';
import useFetch from '../../hooks/useFetch';
import actifs from '../../api/actifs';
import etudiants from '../../api/etudiants';
import mouvements from '../../api/mouvements';
import { salles } from '../../api/references';
import { errMsg } from '../../api/axios';
import { today } from '../../utils/formatDate';
import { emptyToNull, labelPersonne, pick, statutKind } from '../../utils/helpers';

// Sortie d'un actif (prêt à un étudiant ou à une salle).
// Envoie POST /mouvements/sortie { id_actif, id_etudiant, id_salle, date_mouvement, date_retour_prevue, observation }
export default function SortieForm({ onDone, onCancel }) {
  const { data, loading, error: loadError } = useFetch(() =>
    Promise.all([actifs.list(), etudiants.list().catch(() => []), salles.list().catch(() => [])])
  );
  const [v, setV] = useState({ id_actif: '', id_etudiant: '', id_salle: '', date_mouvement: today(), date_retour_prevue: '', observation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [listActifs, listEtudiants, listSalles] = data || [[], [], []];
  const disponibles = listActifs.filter((a) => statutKind(a.statut) === 'disponible');
  const set = (name, val) => setV((s) => ({ ...s, [name]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await mouvements.sortie(emptyToNull(v));
      onDone('Sortie enregistrée : l\'actif est sorti.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Alert type="error">{error || loadError}</Alert>
      {!loading && disponibles.length === 0 && (
        <Alert type="warning">
          Aucun actif disponible. Vérifiez qu'il existe des actifs au statut « disponible » (valeurs réglables dans utils/constants.js).
        </Alert>
      )}
      <div className="form-grid">
        <Field
          field={{ name: 'id_actif', label: 'Actif à sortir', type: 'select', required: true, full: true }}
          value={v.id_actif}
          onChange={set}
          options={disponibles.map((a) => ({ value: pick(a, ['id_actif', 'id']), label: `${a.code_inventaire ?? ''} — ${a.designation ?? ''}` }))}
        />
        <Field
          field={{ name: 'id_etudiant', label: 'Emprunteur (étudiant)', type: 'select' }}
          value={v.id_etudiant}
          onChange={set}
          options={listEtudiants.map((e) => ({ value: pick(e, ['id_etudiant', 'id']), label: labelPersonne(e) }))}
        />
        <Field
          field={{ name: 'id_salle', label: 'Salle de destination', type: 'select' }}
          value={v.id_salle}
          onChange={set}
          options={listSalles.map((s) => ({ value: pick(s, ['id_salle', 'id']), label: s.nom_salle ?? '' }))}
        />
        <Field field={{ name: 'date_mouvement', label: 'Date de sortie', type: 'date', required: true }} value={v.date_mouvement} onChange={set} />
        <Field field={{ name: 'date_retour_prevue', label: 'Retour prévu le', type: 'date' }} value={v.date_retour_prevue} onChange={set} />
        <Field field={{ name: 'observation', label: 'Motif / observation', type: 'textarea' }} value={v.observation} onChange={set} />
      </div>
      <div className="form-actions">
        <Button type="submit" variant="success" loading={saving} disabled={loading}>
          Enregistrer la sortie
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
