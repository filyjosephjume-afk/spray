// src/utils/pagination.js  :  ?page=2&limit=20
exports.lirePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit, active: query.page !== undefined };
};
