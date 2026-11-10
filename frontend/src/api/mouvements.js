import http, { resource, unwrap } from './axios';

const mouvements = {
  ...resource('/mouvements'),
  sortie: (data) => http.post('/mouvements/sortie', data).then(unwrap),
  retour: (data) => http.post('/mouvements/retour', data).then(unwrap),
};

export default mouvements;
