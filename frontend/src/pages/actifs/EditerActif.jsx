import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import actifs from '../../api/actifs';
import { errMsg } from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import Alert from '../../components/common/Alert';
import PageHeader from '../../components/common/PageHeader';
import ActifForm from '../../components/actifs/ActifForm';
import { pick } from '../../utils/helpers';

// Page de création (/actifs/nouveau) et de modification (/actifs/:id/modifier)
export default function EditerActif() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: actif, loading, error: loadError } = useFetch(() => (id ? actifs.get(id) : Promise.resolve(null)), [id]);

  if (!canWrite) return <Alert type="warning">Accès réservé aux utilisateurs autorisés à modifier les actifs.</Alert>;
  if (id && loading) return <p className="muted">Chargement...</p>;
  if (id && loadError) return <Alert>{loadError}</Alert>;

  const submit = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (id) {
        await actifs.update(id, payload);
        navigate(`/actifs/${id}`);
      } else {
        const res = await actifs.create(payload);
        const newId = pick(res, ['id_actif', 'id', 'insertId']);
        navigate(newId ? `/actifs/${newId}` : '/actifs');
      }
    } catch (err) {
      setError(errMsg(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={id ? "Modifier l'actif" : 'Nouvel actif'} />
      <ActifForm initial={actif} onSubmit={submit} onCancel={() => navigate(id ? `/actifs/${id}` : '/actifs')} saving={saving} error={error} />
    </div>
  );
}
