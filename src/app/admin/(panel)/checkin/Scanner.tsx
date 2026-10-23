'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff } from 'lucide-react';

// Camera scanner for passes. Works on Android and iPhone browsers (jsQR
// decodes frames locally; no image ever leaves the device). Reads the pass
// URL (/c/<code>) or a bare code and opens that attendee's check-in screen.
const CODE_RE = /(?:\/c\/)?([A-Za-z0-9_-]{22})(?:[/?#]|$)/;

export default function Scanner() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState('');
  const raf = useRef(0);
  const stream = useRef<MediaStream | null>(null);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setOn(false);
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    setError('');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const v = video.current!;
      v.srcObject = stream.current;
      await v.play();
      setOn(true);
      const tick = () => {
        const c = canvas.current;
        if (c && v.readyState === v.HAVE_ENOUGH_DATA) {
          const w = 480, h = Math.round((v.videoHeight / v.videoWidth) * w) || 480;
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(v, 0, 0, w, h);
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
          const m = found?.data.match(CODE_RE);
          if (m?.[1]) {
            navigator.vibrate?.(80);
            stop();
            router.push(`/admin/checkin/${m[1]}`);
            return;
          }
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      setError('Camera not available. Allow camera access for this site, or use the search below.');
      stop();
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className={`relative bg-black ${on ? 'aspect-[4/3]' : 'hidden'}`}>
        <video ref={video} className="absolute inset-0 size-full object-cover" playsInline muted />
        <div aria-hidden className="absolute inset-[18%] rounded-3xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>
      <canvas ref={canvas} className="hidden" />
      <div className="flex flex-col gap-3 p-4 md:p-5 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between xl:p-4">
        <p className="text-sm text-muted">{on ? 'Point the camera at the QR code on the pass.' : 'Use the phone camera to scan passes.'}</p>
        {on ? (
          <button type="button" onClick={stop} className="btn-outline min-h-14 w-full text-base xl:min-h-12 xl:w-auto xl:text-sm"><CameraOff className="size-4" /> Stop</button>
        ) : (
          <button type="button" onClick={start} className="btn-brand min-h-14 w-full text-base md:min-h-16 md:text-lg xl:min-h-12 xl:w-auto xl:text-sm"><Camera className="size-4 md:size-5 xl:size-4" /> Scan a pass</button>
        )}
      </div>
      {error && <p role="alert" className="px-4 pb-4 text-sm text-brand-red">{error}</p>}
    </div>
  );
}
