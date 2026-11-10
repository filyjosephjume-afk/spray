import useFetch from '../../hooks/useFetch';
import { roles as rolesApi } from '../../api/references';
import { pick } from '../../utils/helpers';

// Cases à cocher des rôles (table "role"). "value" = tableau d'identifiants (ou de noms) de rôles.
// onChange reçoit le nouveau tableau d'identifiants.
export default function RoleSelector({ value = [], onChange }) {
  const { data, loading, error } = useFetch(() => rolesApi.list());
  const list = data || [];

  const idOf = (r) => pick(r, ['id_role', 'id']);
  const nameOf = (r) => String(pick(r, ['nom', 'nom_role', 'libelle', 'name'], idOf(r)));
  const isChecked = (r) =>
    value.some((x) => String(x) === String(idOf(r)) || String(x).toLowerCase() === nameOf(r).toLowerCase());

  const toggle = (r) => {
    const current = list.filter(isChecked).map(idOf);
    const id = idOf(r);
    onChange(current.some((x) => String(x) === String(id)) ? current.filter((x) => String(x) !== String(id)) : [...current, id]);
  };

  if (loading) return <div className="muted">Chargement des rôles...</div>;
  if (error) return <div className="alert alert-warning">Rôles indisponibles : {error}</div>;
  if (!list.length) return <div className="muted">Aucun rôle défini.</div>;

  return (
    <div className="checks">
      {list.map((r) => (
        <label key={idOf(r)}>
          <input type="checkbox" checked={isChecked(r)} onChange={() => toggle(r)} />
          {nameOf(r)}
        </label>
      ))}
    </div>
  );
}
