import { useState } from 'react';
import { categories, fournisseurs, salles, services } from '../api/references';
import CrudPage from '../components/common/CrudPage';

// Tables de référence. Adaptez "name" aux colonnes réelles de chaque table.
const TABS = {
  categories: {
    label: 'Catégories',
    props: { title: "Catégories d'actifs", resource: categories, idKey: 'id_categorie', fields: [{ name: 'nom_categorie', label: 'Nom de la catégorie', required: true }] },
  },
  fournisseurs: {
    label: 'Fournisseurs',
    props: {
      title: 'Fournisseurs',
      resource: fournisseurs,
      idKey: 'id_fournisseur',
      fields: [
        { name: 'nom_fournisseur', label: 'Nom', required: true },
        { name: 'telephone', label: 'Téléphone', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
      ],
    },
  },
  salles: {
    label: 'Salles',
    props: { title: 'Salles', resource: salles, idKey: 'id_salle', fields: [{ name: 'nom_salle', label: 'Nom de la salle', required: true }] },
  },
  services: {
    label: 'Services',
    props: { title: 'Services', resource: services, idKey: 'id_service', fields: [{ name: 'nom_service', label: 'Nom du service', required: true }] },
  },
};

export default function Parametres() {
  const [tab, setTab] = useState('categories');

  return (
    <div>
      <div className="tabs">
        {Object.entries(TABS).map(([k, t]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
            {t.label}
          </button>
        ))}
      </div>
      {/* key = remet la page à zéro quand on change d'onglet */}
      <CrudPage key={tab} {...TABS[tab].props} />
    </div>
  );
}
