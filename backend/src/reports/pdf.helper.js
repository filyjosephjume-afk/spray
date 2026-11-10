// src/reports/pdf.helper.js : dessine un tableau PDF (pdfkit)
//   rapport = { titre, colonnes:[{ cle, titre, largeur }], lignes:[{...}] }
const httpError = require('../utils/httpError');

module.exports = function envoyerPdf(res, rapport, nomFichier) {
  let PDFDocument;
  try {
    PDFDocument = require('pdfkit');
  } catch {
    throw httpError(500, 'Paquet manquant : lance « npm install pdfkit ».');
  }
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}.pdf"`);
  doc.pipe(res);

  const largeurUtile = doc.page.width - 60;
  const poids = rapport.colonnes.map((c) => c.largeur || 1);
  const somme = poids.reduce((a, b) => a + b, 0);
  const largeurs = poids.map((p) => (p / somme) * largeurUtile);
  const hauteurLigne = 18;

  const entete = () => {
    let x = 30;
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(9);
    rapport.colonnes.forEach((c, i) => {
      doc.text(c.titre, x, y, { width: largeurs[i] - 4, height: hauteurLigne, ellipsis: true });
      x += largeurs[i];
    });
    doc.moveTo(30, y + hauteurLigne - 4).lineTo(30 + largeurUtile, y + hauteurLigne - 4).stroke();
    doc.y = y + hauteurLigne;
    doc.font('Helvetica').fontSize(8);
  };

  doc.font('Helvetica-Bold').fontSize(16).text(rapport.titre, 30, 30);
  doc.font('Helvetica').fontSize(9).text(`Édité le ${new Date().toLocaleDateString('fr-FR')} — ${rapport.lignes.length} ligne(s)`);
  doc.moveDown();
  entete();

  rapport.lignes.forEach((ligne) => {
    if (doc.y + hauteurLigne > doc.page.height - 40) {
      doc.addPage();
      entete();
    }
    const y = doc.y;
    let x = 30;
    rapport.colonnes.forEach((c, i) => {
      const v = ligne[c.cle];
      doc.text(v === null || v === undefined ? '' : String(v), x, y, { width: largeurs[i] - 4, height: hauteurLigne, ellipsis: true });
      x += largeurs[i];
    });
    doc.y = y + hauteurLigne;
  });
  doc.end();
};
