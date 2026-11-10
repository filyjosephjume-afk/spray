import http, { unwrap } from './axios';

const dashboard = {
  stats: () => http.get('/dashboard').then(unwrap),
};

export default dashboard;
