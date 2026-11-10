import http, { resource, unwrap } from './axios';

const maintenances = {
  ...resource('/maintenances'),
  terminer: (id, data = {}) => http.post(`/maintenances/${id}/terminer`, data).then(unwrap),
};

export default maintenances;
