// src/reports/excel.helper.js : fichier Excel (exceljs)
const httpError = require('../utils/httpError');

module.exports = async function envoyerExcel(res, rapport, nomFichier) {
  let ExcelJS;
  try {
    ExcelJS = require('exceljs');
  } catch {
    throw httpError(500, 'Paquet manquant : lance « npm install exceljs ».');
  }
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(rapport.titre.slice(0, 30));
  ws.columns = rapport.colonnes.map((c) => ({ header: c.titre, key: c.cle, width: Math.max(12, (c.largeur || 1) * 10) }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
  rapport.lignes.forEach((l) => ws.addRow(l));
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
};
