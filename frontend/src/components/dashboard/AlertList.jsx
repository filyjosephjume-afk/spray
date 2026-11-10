import { Link } from 'react-router-dom';
import { formatDate, daysUntil } from '../../utils/formatDate';
import { pick } from '../../utils/helpers';

// Liste des alertes (vue v_alertes). Les noms de colonnes sont cherchés de façon souple.
export default function AlertList({ alertes = [] }) {
  if (!alertes.length) return <div className="card-body muted">Aucune alerte.</div>;

  return (
    <ul className="alert-list">
      {alertes.map((a, i) => {
        const titre = pick(a, ['message', 'libelle', 'description', 'designation', 'nom_logiciel'], 'Alerte');
        const type = pick(a, ['type_alerte', 'type', 'categorie']);
        const date = pick(a, ['date_echeance', 'date_alerte', 'date_fin', 'date_expiration', 'date_fin_garantie', 'date']);
        const idActif = pick(a, ['id_actif']);
        const j = date ? daysUntil(date) : null;
        const tone = j !== null && j < 0 ? 'danger' : 'warning';
        return (
          <li key={i} className={`alert-item tone-${tone}`}>
            <div>
              {idActif ? <Link to={`/actifs/${idActif}`}>{titre}</Link> : titre}
              {type && <small>{String(type).replace(/_/g, ' ')}</small>}
            </div>
            {date && (
              <div style={{ textAlign: 'right' }}>
                <div>{formatDate(date)}</div>
                {j !== null && <small>{j < 0 ? `dépassée de ${-j} j` : `dans ${j} j`}</small>}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
