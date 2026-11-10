import http, { resource, unwrap, asList } from './axios';

const actifs = {
  ...resource('/actifs'),
  // Vue v_historique_actif : tous les événements d'un actif
  historique: (id) => http.get(`/actifs/${id}/historique`).then(unwrap).then(asList),
  // Vue v_cout_actif : coût (achat + maintenances) par actif
  couts: () => http.get('/actifs/couts').then(unwrap).then(asList),
  // Mise au rebut (table rebut)
  rebut: (id, data) => http.post(`/actifs/${id}/rebut`, data).then(unwrap),
};

export default actifs;
