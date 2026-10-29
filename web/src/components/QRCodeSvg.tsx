import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeSvgProps {
  value: string;
  size?: number;
}

export const QRCodeSvg: React.FC<QRCodeSvgProps> = ({ value, size = 160 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    // Determine the absolute URL if a relative file path is given
    let targetUrl = value;
    if (typeof window !== 'undefined' && !value.startsWith('http')) {
      targetUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/' + value.replace(/^\.\//, '');
    }

    QRCode.toDataURL(targetUrl, {
      width: size * 2, // High DPI render
      margin: 1,
      color: {
        dark: '#08140B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [value, size]);

  return (
    <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-white/20 inline-block">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Scan to download ${value}`}
          style={{ width: size, height: size }}
          className="rounded-lg block object-contain"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs animate-pulse font-mono"
        >
          Generating QR...
        </div>
      )}
    </div>
  );
};
