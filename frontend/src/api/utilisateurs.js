import http, { resource, unwrap } from './axios';

const utilisateurs = {
  ...resource('/utilisateurs'),
  setRoles: (id, roles) => http.put(`/utilisateurs/${id}/roles`, { roles }).then(unwrap),
};

export default utilisateurs;
