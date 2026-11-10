import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import utilisateurs from '../api/utilisateurs';
import { errMsg } from '../api/axios';
import { normalizeRoles } from '../context/AuthContext';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import Field from '../components/common/Field';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import StatutBadge from '../components/common/StatutBadge';
import RoleSelector from '../components/utilisateurs/RoleSelector';
import { pick } from '../utils/helpers';

const VIDE = { nom: '', prenom: '', email: '', mot_de_passe: '', actif: true, roles: [] };
const ID = ['id_utilisateur', 'id_user', 'id'];

// Identifiants (ou noms) de rôles d'une ligne utilisateur, quelle que soit la forme renvoyée par l'API
function rolesOf(row) {
  if (Array.isArray(row.role_ids)) return row.role_ids;
  if (Array.isArray(row.roles)) return row.roles.map((r) => (r && typeof r === 'object' ? pick(r, ['id_role', 'id', 'nom']) : r));
  return row.role ? [row.role] : [];
}

// Administration : comptes utilisateurs et leurs rôles (réservé à l'administrateur)
export default function Utilisateurs() {
  const { user } = useAuth();
  const { data, loading, error: loadError, reload } = useFetch(() => utilisateurs.list());
  const [modal, setModal] = useState(null); // {} = création, { row } = modification
  const [v, setV] = useState(VIDE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const set = (name, val) => setV((s) => ({ ...s, [name]: val }));

  const openCreate = () => {
    setV(VIDE);
    setModal({});
    setError('');
    setOk('');
  };
  const openEdit = (row) => {
    setV({ nom: row.nom ?? '', prenom: row.prenom ?? '', email: row.email ?? '', mot_de_passe: '', actif: row.actif === undefined ? true : row.actif === true || Number(row.actif) === 1, roles: rolesOf(row) });
    setModal({ row });
    setError('');
    setOk('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { nom: v.nom, prenom: v.prenom || null, email: v.email, actif: v.actif, roles: v.roles };
      if (v.mot_de_passe) payload.mot_de_passe = v.mot_de_passe;
      if (modal.row) await utilisateurs.update(pick(modal.row, ID), payload);
      else await utilisateurs.create(payload);
      setOk(modal.row ? 'Utilisateur modifié.' : 'Utilisateur créé.');
      setModal(null);
      reload();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Supprimer le compte « ${row.email ?? row.nom} » ?`)) return;
    setError('');
    setOk('');
    try {
      await utilisateurs.remove(pick(row, ID));
      setOk('Utilisateur supprimé.');
      reload();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom', render: (r) => [r.prenom, r.nom].filter(Boolean).join(' ') || '—', sortValue: (r) => r.nom },
    { key: 'email', label: 'Email' },
    {
      key: 'roles',
      label: 'Rôles',
      sortable: false,
      render: (r) => {
        const list = normalizeRoles(r);
        return list.length ? list.map((x) => (<span key={x} className="badge badge-info" style={{ marginRight: 4 }}>{x}</span>)) : '—';
      },
    },
    {
      key: 'actif',
      label: 'Compte',
      render: (r) => (r.actif === undefined ? '—' : <StatutBadge value={r.actif === true || Number(r.actif) === 1 ? 'actif' : 'inactif'} label={r.actif === true || Number(r.actif) === 1 ? 'Actif' : 'Désactivé'} />),
    },
  ];

  return (
    <div>
      <PageHeader title="Administration" subtitle="Comptes utilisateurs et rôles">
        <Button onClick={openCreate}>+ Nouvel utilisateur</Button>
      </PageHeader>

      <Alert onClose={() => setError('')}>{error || loadError}</Alert>
      <Alert type="success" onClose={() => setOk('')}>{ok}</Alert>

      <DataTable
        columns={columns}
        rows={data || []}
        rowKey={(r) => pick(r, ID) || r.email}
        loading={loading}
        actions={(row) => (
          <>
            <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
              Modifier
            </Button>
            {String(pick(row, ID)) !== String(pick(user, ID)) && (
              <Button variant="danger" size="sm" onClick={() => remove(row)}>
                Supprimer
              </Button>
            )}
          </>
        )}
      />

      <Modal open={!!modal} title={modal?.row ? "Modifier l'utilisateur" : 'Nouvel utilisateur'} onClose={() => setModal(null)}>
        <form onSubmit={submit}>
          <Alert>{error}</Alert>
          <div className="form-grid">
            <Field field={{ name: 'nom', label: 'Nom', required: true }} value={v.nom} onChange={set} />
            <Field field={{ name: 'prenom', label: 'Prénom' }} value={v.prenom} onChange={set} />
            <Field field={{ name: 'email', label: 'Email', type: 'email', required: true }} value={v.email} onChange={set} />
            <Field
              field={{ name: 'mot_de_passe', label: 'Mot de passe', type: 'password', required: !modal?.row, help: modal?.row ? 'Laissez vide pour ne pas le changer.' : 'Au moins 6 caractères.' }}
              value={v.mot_de_passe}
              onChange={set}
            />
            <Field field={{ name: 'actif', label: 'Compte actif', type: 'checkbox' }} value={v.actif} onChange={set} />
            <div className="field field-full">
              <label>Rôles</label>
              <RoleSelector value={v.roles} onChange={(ids) => set('roles', ids)} />
            </div>
          </div>
          <div className="form-actions">
            <Button type="submit" variant="success" loading={saving}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setModal(null)}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
