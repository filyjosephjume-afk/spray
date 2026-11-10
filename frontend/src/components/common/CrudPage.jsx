import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { asList, errMsg } from '../../api/axios';
import { formatDate, formatMoney } from '../../utils/formatDate';
import { buildPayload, defaultValues, valuesFromRow } from '../../utils/helpers';
import Alert from './Alert';
import Button from './Button';
import DataTable from './DataTable';
import Field from './Field';
import Modal from './Modal';
import PageHeader from './PageHeader';
import StatutBadge from './StatutBadge';

/**
 * Page de gestion complète (liste + ajout + modification + suppression) à partir d'une simple description.
 *
 *  title, subtitle
 *  resource   : objet de src/api (list, create, update, remove)
 *  idKey      : nom de la clé primaire (ex. "id_etudiant")
 *  fields     : liste des champs (voir ci-dessous)
 *  rowActions : (row, { reload, setOk, setError }) => boutons supplémentaires par ligne
 *  beforeSave : (payload, editingRow) => payload modifié avant l'envoi
 *  canEdit / canDelete : forcer les droits (sinon selon le rôle)
 *
 * Un champ : { name, label, type, required, default, options, optionsFrom, table, badge, render, help, full }
 *   type "select" : options = [{value,label}]  ou  optionsFrom = { load, value, label }
 *   table: false  -> champ absent du tableau
 *   badge: true   -> affiché comme un badge coloré (statuts)
 */
export default function CrudPage({
  title,
  subtitle,
  resource,
  idKey,
  fields,
  rowActions,
  beforeSave,
  canEdit,
  canDelete,
  addLabel = '+ Ajouter',
  searchPlaceholder,
  defaults = {},
}) {
  const { canWrite } = useAuth();
  const mayEdit = canEdit ?? canWrite;
  const mayDelete = canDelete ?? canWrite;

  const { data, loading, error: loadError, reload } = useFetch(() => resource.list());
  const rows = data || [];

  const [opts, setOpts] = useState({});
  const [modal, setModal] = useState(null); // { row } en modification, {} en création
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Charge les listes déroulantes alimentées par l'API
  useEffect(() => {
    let alive = true;
    fields
      .filter((f) => f.optionsFrom)
      .forEach(async (f) => {
        try {
          const { load, value, label } = f.optionsFrom;
          const list = asList(await load());
          const options = list.map((r) => ({ value: r[value], label: typeof label === 'function' ? label(r) : r[label] }));
          if (alive) setOpts((o) => ({ ...o, [f.name]: options }));
        } catch (e) {
          if (alive) setError(`Liste « ${f.label} » indisponible : ${errMsg(e)}`);
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optionsOf = (f) => f.options || opts[f.name] || [];

  const openCreate = () => {
    setValues(defaultValues(fields, defaults));
    setModal({});
    setError('');
    setOk('');
  };

  const openEdit = (row) => {
    setValues(valuesFromRow(fields, row));
    setModal({ row });
    setError('');
    setOk('');
  };

  const closeModal = () => setModal(null);
  const setField = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      let payload = buildPayload(fields, values);
      if (beforeSave) payload = beforeSave(payload, modal?.row || null);
      if (modal?.row) await resource.update(modal.row[idKey], payload);
      else await resource.create(payload);
      setOk(modal?.row ? 'Modifié avec succès.' : 'Ajouté avec succès.');
      closeModal();
      reload();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    setError('');
    setOk('');
    try {
      await resource.remove(row[idKey]);
      setOk('Supprimé avec succès.');
      reload();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const cell = (f, row) => {
    const v = row[f.name];
    if (f.render) return f.render(row);
    if (f.type === 'select') {
      const o = optionsOf(f).find((x) => String(x.value) === String(v));
      if (f.badge) return <StatutBadge value={v} label={o?.label} />;
      return o ? o.label : v ?? '—';
    }
    if (f.badge) return <StatutBadge value={v} />;
    if (f.type === 'date') return formatDate(v);
    if (f.type === 'money') return formatMoney(v);
    if (f.type === 'checkbox') return v === true || Number(v) === 1 ? 'Oui' : 'Non';
    if (v === null || v === undefined || v === '') return '—';
    return f.type === 'textarea' ? <div className="cell-clip">{String(v)}</div> : String(v);
  };

  // Texte réellement affiché dans la cellule (libellé de la liste, date au format JJ/MM/AAAA...) :
  // c'est lui qui sert à la recherche, pas seulement la valeur brute (ex. l'id de l'étudiant).
  const texteDe = (f, row) => {
    const v = row[f.name];
    if (v === null || v === undefined) return '';
    if (f.type === 'select') {
      const o = optionsOf(f).find((x) => String(x.value) === String(v));
      return `${o ? o.label : ''} ${v}`;
    }
    if (f.type === 'date') return `${formatDate(v)} ${v}`;
    if (f.type === 'checkbox') return v === true || Number(v) === 1 ? 'Oui' : 'Non';
    return String(v);
  };

  const columns = fields
    .filter((f) => f.table !== false && f.type !== 'password')
    .map((f) => ({ key: f.name, label: f.label, render: (row) => cell(f, row), searchValue: (row) => texteDe(f, row) }));

  const showActions = mayEdit || mayDelete || rowActions;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        {mayEdit && <Button onClick={openCreate}>{addLabel}</Button>}
      </PageHeader>

      <Alert type="error" onClose={() => setError('')}>{error || loadError}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={idKey}
        loading={loading}
        searchPlaceholder={searchPlaceholder}
        actions={
          showActions
            ? (row) => (
                <>
                  {rowActions && rowActions(row, { reload, setOk, setError })}
                  {mayEdit && (
                    <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                      Modifier
                    </Button>
                  )}
                  {mayDelete && (
                    <Button variant="danger" size="sm" onClick={() => remove(row)}>
                      Supprimer
                    </Button>
                  )}
                </>
              )
            : undefined
        }
      />

      <Modal open={!!modal} title={modal?.row ? `Modifier — ${title}` : `Ajouter — ${title}`} onClose={closeModal}>
        <form onSubmit={submit}>
          <Alert type="error">{error}</Alert>
          <div className="form-grid">
            {fields.map((f) => (
              <Field key={f.name} field={{ ...f, required: f.required || (f.requiredOnCreate && !modal?.row) }} value={values[f.name]} onChange={setField} options={optionsOf(f)} />
            ))}
          </div>
          <div className="form-actions">
            <Button type="submit" variant="success" loading={saving}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
