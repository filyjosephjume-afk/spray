import { useRef } from 'react';
import QRCode from 'react-qr-code';
import Button from '../common/Button';

// Étiquette QR code d'un actif : affichage, impression et téléchargement en image PNG.
export default function QRCodeView({ value, title, subtitle, size = 150 }) {
  const boxRef = useRef(null);

  const imprimer = () => {
    document.body.classList.add('print-qr');
    const nettoyer = () => {
      document.body.classList.remove('print-qr');
      window.removeEventListener('afterprint', nettoyer);
    };
    window.addEventListener('afterprint', nettoyer);
    window.print();
  };

  const telecharger = () => {
    const svg = boxRef.current?.querySelector('svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size * 4;
      canvas.height = size * 4;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `qr_${title || 'actif'}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    };
    img.src = url;
  };

  return (
    <div className="qr-card">
      <div className="print-area">
        <div className="qr-box" ref={boxRef}>
          <QRCode value={String(value)} size={size} />
        </div>
        {title && <div className="qr-title">{title}</div>}
        {subtitle && <div className="muted">{subtitle}</div>}
      </div>
      <div className="no-print" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <Button variant="outline" size="sm" onClick={imprimer}>
          Imprimer l'étiquette
        </Button>
        <Button variant="outline" size="sm" onClick={telecharger}>
          Télécharger PNG
        </Button>
      </div>
    </div>
  );
}
