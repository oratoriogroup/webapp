'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Download, Share2, RefreshCw } from 'lucide-react';
import { EVENT } from '@/lib/event';

const SIZE = 1080;
const MAX_BYTES = 15 * 1024 * 1024;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Builds the DP entirely in the browser. The photo never leaves the device.
export default function DpMaker({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState('');
  const [canShare, setCanShare] = useState(false);

  const draw = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    await document.fonts.ready;
    const css = getComputedStyle(document.documentElement);
    const serif = css.getPropertyValue('--font-display-face').trim() || 'Georgia, serif';
    const sans = css.getPropertyValue('--font-sans-face').trim() || 'system-ui, sans-serif';

    // Background
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, '#1a120c');
    bg.addColorStop(1, '#070504');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const glow = ctx.createRadialGradient(SIZE * 0.5, 330, 40, SIZE * 0.5, 330, 620);
    glow.addColorStop(0, 'rgba(226,180,79,0.35)');
    glow.addColorStop(1, 'rgba(226,180,79,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Frame
    ctx.strokeStyle = 'rgba(226,180,79,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, SIZE - 72, SIZE - 72);

    // Photo circle
    const cx = SIZE / 2, cy = 360, r = 230;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (photo) {
      const s = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
      const w = photo.width * s, h = photo.height * s;
      ctx.drawImage(photo, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.fillStyle = '#2a2018';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `600 34px ${sans}`;
      ctx.textAlign = 'center';
      ctx.fillText('Your photo', cx, cy + 12);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#e2b44f';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2b44f';
    ctx.font = `700 30px ${sans}`;
    ctx.letterSpacing = '8px';
    ctx.fillText("I'LL BE AT", cx, 680);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 118px ${serif}`;
    ctx.fillText('Oratorio 2026', cx, 790);
    ctx.fillStyle = '#e2b44f';
    ctx.font = `italic 600 62px ${serif}`;
    ctx.fillText(EVENT.theme, cx, 862);

    const display = name.trim().slice(0, 40);
    if (display) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText(display, cx, 930);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `500 26px ${sans}`;
    ctx.fillText(`${EVENT.dateShort}  |  ${EVENT.timeLabel}  |  Lagos & Online`, cx, 990);

    try {
      const logo = await loadImage('/images/logo-white.png');
      const lw = 220, lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, 70, 70, lw, lh);
    } catch {}
  }, [photo, name]);

  useEffect(() => {
    void draw();
  }, [draw]);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.canShare);
  }, []);

  const onFile = async (f: File | undefined) => {
    setError('');
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) return setError('Please choose a JPG, PNG or WebP photo.');
    if (f.size > MAX_BYTES) return setError('That photo is too large. Please use one under 15MB.');
    const url = URL.createObjectURL(f);
    try {
      setPhoto(await loadImage(url));
    } catch {
      setError('We could not read that photo. Please try another one.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const blob = () => new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/jpeg', 0.92));

  const download = async () => {
    const b = await blob();
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'oratorio-2026-dp.jpg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const share = async () => {
    const b = await blob();
    if (!b) return;
    const file = new File([b], 'oratorio-2026-dp.jpg', { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: EVENT.name, text: `I'll be at ${EVENT.name}: ${EVENT.theme}` });
      } catch {}
    } else void download();
  };

  return (
    <div className="mt-6">
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-line shadow-lg">
        <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block h-auto w-full" aria-label="Your Oratorio 2026 DP preview" role="img" />
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="mt-3 text-center text-sm font-medium text-brand-red">{error}</p>}
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => inputRef.current?.click()} className="btn-outline">
          {photo ? <RefreshCw className="size-4" /> : <ImagePlus className="size-4" />} {photo ? 'Change photo' : 'Add your photo'}
        </button>
        <button type="button" onClick={download} disabled={!photo} className="btn-primary">
          <Download className="size-4" /> Download
        </button>
        <button type="button" onClick={share} disabled={!photo} className="btn-gold">
          <Share2 className="size-4" /> {canShare ? 'Share' : 'Save to share'}
        </button>
      </div>
    </div>
  );
}
