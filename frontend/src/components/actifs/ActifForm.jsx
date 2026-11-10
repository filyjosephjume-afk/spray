import { useEffect, useState } from 'react';
import Alert from '../common/Alert';
import Button from '../common/Button';
import Field from '../common/Field';
import { asList, errMsg } from '../../api/axios';
import { categories, fournisseurs, salles } from '../../api/references';
import { ETATS_ACTIF, STATUTS_ACTIF } from '../../utils/constants';
import { buildPayload, defaultValues, valuesFromRow } from '../../utils/helpers';

// =====================================================================
//  Champs de la table "actif". Adaptez "name" aux colonnes réelles de la base.
// =====================================================================
export const ACTIF_FIELDS = [
  { group: 'Identification', name: 'code_inventaire', label: "Code d'inventaire", required: true, help: 'Unique. Il sert aussi pour le QR code.' },
  { group: 'Identification', name: 'designation', label: 'Désignation', required: true },
  { group: 'Identification', name: 'id_categorie', label: 'Catégorie', type: 'select', required: true },
  { group: 'Identification', name: 'marque', label: 'Marque' },
  { group: 'Identification', name: 'modele', label: 'Modèle' },
  { group: 'Identification', name: 'numero_serie', label: 'N° de série' },
  { group: 'Identification', name: 'description', label: 'Description', type: 'textarea' },

  { group: 'Localisation et état', name: 'id_salle', label: 'Salle', type: 'select' },
  { group: 'Localisation et état', name: 'statut', label: 'Statut', type: 'select', options: STATUTS_ACTIF, default: 'disponible' },
  { group: 'Localisation et état', name: 'etat', label: 'État', type: 'select', options: ETATS_ACTIF, default: 'bon' },

  { group: 'Acquisition et garantie', name: 'id_fournisseur', label: 'Fournisseur', type: 'select' },
  { group: 'Acquisition et garantie', name: 'date_acquisition', label: "Date d'acquisition", type: 'date' },
  { group: 'Acquisition et garantie', name: 'prix_acquisition', label: "Prix d'acquisition (Ar)", type: 'money' },
  { group: 'Acquisition et garantie', name: 'date_fin_garantie', label: 'Fin de garantie', type: 'date' },
];

const GROUPS = [...new Set(ACTIF_FIELDS.map((f) => f.group))];

export default function ActifForm({ initial, onSubmit, onCancel, saving = false, error = '' }) {
  const [values, setValues] = useState(() => (initial ? valuesFromRow(ACTIF_FIELDS, initial) : defaultValues(ACTIF_FIELDS)));
  const [opts, setOpts] = useState({ id_categorie: [], id_fournisseur: [], id_salle: [] });
  const [loadError, setLoadError] = useState('');

  // Quand l'actif à modifier arrive de l'API, on remplit le formulaire
  useEffect(() => {
    if (initial) setValues(valuesFromRow(ACTIF_FIELDS, initial));
  }, [initial]);

  useEffect(() => {
    let alive = true;
    const toOptions = (list, idKeys, labelKey) =>
      asList(list).map((r) => ({ value: idKeys.map((k) => r[k]).find((v) => v !== undefined), label: r[labelKey] ?? '' }));

    Promise.allSettled([categories.list(), fournisseurs.list(), salles.list()]).then(([c, f, s]) => {
      if (!alive) return;
      setOpts({
        id_categorie: c.status === 'fulfilled' ? toOptions(c.value, ['id_categorie', 'id'], 'nom_categorie') : [],
        id_fournisseur: f.status === 'fulfilled' ? toOptions(f.value, ['id_fournisseur', 'id'], 'nom_fournisseur') : [],
        id_salle: s.status === 'fulfilled' ? toOptions(s.value, ['id_salle', 'id'], 'nom_salle') : [],
      });
      const failed = [c, f, s].find((r) => r.status === 'rejected');
      if (failed) setLoadError(`Une liste déroulante n'a pas pu être chargée : ${errMsg(failed.reason)}`);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setField = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(buildPayload(ACTIF_FIELDS, values));
  };

  return (
    <form onSubmit={submit}>
      <Alert type="error">{error}</Alert>
      <Alert type="warning">{loadError}</Alert>

      {GROUPS.map((g) => (
        <div className="card card-body form-section" key={g} style={{ padding: 16 }}>
          <h3>{g}</h3>
          <div className="form-grid">
            {ACTIF_FIELDS.filter((f) => f.group === g).map((f) => (
              <Field key={f.name} field={f} value={values[f.name]} onChange={setField} options={f.options || opts[f.name] || []} />
            ))}
          </div>
        </div>
      ))}

      <div className="form-actions">
        <Button type="submit" variant="success" loading={saving}>
          Enregistrer
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
