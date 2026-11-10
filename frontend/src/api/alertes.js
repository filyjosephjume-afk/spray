import http, { unwrap, asList } from './axios';

// Vue v_alertes (garanties, licences, maintenances à prévoir...)
const alertes = {
  list: () => http.get('/alertes').then(unwrap).then(asList),
};

export default alertes;
