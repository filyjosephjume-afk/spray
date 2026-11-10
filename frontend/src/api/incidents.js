import http, { resource, unwrap } from './axios';

const incidents = {
  ...resource('/incidents'),
  resoudre: (id, data = {}) => http.post(`/incidents/${id}/resoudre`, data).then(unwrap),
};

export default incidents;
