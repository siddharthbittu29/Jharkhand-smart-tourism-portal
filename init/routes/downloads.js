const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const router = Router();

const MAP = {
  'guide': {
    filename: 'tourist-guide.pdf',
    title: 'Jharkhand Tourist Guide',
    bullets: [
      'Best season: Oct–Feb (post-monsoon to winter)',
      'Top picks: Lodh Falls, Betla National Park, Patratu Valley, Baidyanath Dham',
      'Local culture: Chhau dance, tribal crafts, weekly haats',
      'Safety: Follow park rules, check weather before treks'
    ]
  },
  'festival-calendar': {
    filename: 'festival-calendar.pdf',
    title: 'Jharkhand Festival Calendar (Highlights)',
    bullets: [
      'Makar Sankranti (Jan) • Sarhul (Mar/Apr) • Karma (Aug/Sep)',
      'Diwali/Deepotsav (Oct/Nov) • Chhath (Oct/Nov)',
      'Local melas at Deoghar, Ranchi, and regional towns'
    ]
  },
  'trek-checklist': {
    filename: 'safety-trek-checklist.pdf',
    title: 'Safety & Trek Checklist',
    bullets: [
      'Footwear, rain jacket, torch, first-aid, charged phone, ID proof',
      'Tell someone your route & timings; avoid trekking alone',
      'Respect wildlife; carry back your waste'
    ]
  }
};

const STATIC_DIR = path.join(__dirname, '..', 'public', 'downloads');

function streamPdf(res, { title, bullets }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);
  doc.fontSize(20).fillColor('#0b5345').text(title);
  doc.moveDown(1);
  bullets.forEach(b => { doc.text('• ' + b); doc.moveDown(0.5); });
  doc.text('\nHelpline: 1364\nJTDC Reservations: 0651-2438866 / 2438002\nEmail: itmanager@jharkhandtourism.com');
  doc.end();
}

router.get('/:slug', (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  const item = MAP[slug];
  if (!item) return res.status(404).send('Not found');

  const filePath = path.join(STATIC_DIR, item.filename);
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return res.download(filePath, item.filename);
    return streamPdf(res, item);
  });
});

module.exports = router;
