'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Download, Share2, RefreshCw } from 'lucide-react';
import { EVENT } from '@/lib/event';

const W = 1080;
const H = 1350;
// Drawn at 2x (2160 x 2700) so it stays sharp when sent in HD on WhatsApp.
const S = 2;
const MAX_BYTES = 15 * 1024 * 1024;

const RED = '#c8202f';
const PURPLE = '#7a2a8f';
const GOLD = '#e0a21b';
const INK = '#1c1220';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

// Shrinks the font until the text fits the given width.
const fitText = (ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, font: (s: number) => string) => {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 12) {
    s -= 2;
    ctx.font = font(s);
  }
  return s;
};

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
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    const css = getComputedStyle(document.documentElement);
    const impact = css.getPropertyValue('--font-impact-face').trim() || 'Impact, sans-serif';
    const sans = css.getPropertyValue('--font-sans-face').trim() || 'system-ui, sans-serif';
    try {
      await Promise.all([document.fonts.load(`100px ${impact}`), document.fonts.load(`800 40px ${sans}`), document.fonts.load(`600 40px ${sans}`)]);
    } catch {}

    // Bright background with soft colour sweeps.
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fff7f4');
    bg.addColorStop(0.55, '#ffffff');
    bg.addColorStop(1, '#fdeef6');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const sweep = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    sweep(80, 120, 520, 'rgba(224,162,27,0.20)');
    sweep(1040, 980, 640, 'rgba(122,42,143,0.16)');
    sweep(980, 160, 420, 'rgba(200,32,47,0.12)');
    // Diagonal ribbons
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, 860);
    ctx.lineTo(W, 620);
    ctx.lineTo(W, 700);
    ctx.lineTo(0, 960);
    ctx.fill();
    ctx.fillStyle = PURPLE;
    ctx.beginPath();
    ctx.moveTo(0, 1010);
    ctx.lineTo(W, 760);
    ctx.lineTo(W, 800);
    ctx.lineTo(0, 1060);
    ctx.fill();
    ctx.restore();

    // Logo
    try {
      const logo = await loadImage('/images/logo-color.png');
      const lw = 330, lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, (W - lw) / 2, 54, lw, lh);
    } catch {}

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Heading
    ctx.fillStyle = INK;
    ctx.font = `800 44px ${sans}`;
    ctx.fillText('I WILL BE ATTENDING', W / 2, 232);
    ctx.fillText('ORATORIO 2026.', W / 2, 286);

    // Photo with silver and gradient rings
    const cx = W / 2, cy = 560, r = 220;
    const silver = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    silver.addColorStop(0, '#f4f4f6');
    silver.addColorStop(0.5, '#b9bcc4');
    silver.addColorStop(1, '#eceef2');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 34, 0, Math.PI * 2);
    ctx.fillStyle = silver;
    ctx.shadowColor = 'rgba(28,18,32,0.25)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, RED);
    ring.addColorStop(0.5, GOLD);
    ring.addColorStop(1, PURPLE);
    ctx.beginPath();
    ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
    ctx.fillStyle = ring;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (photo) {
      const s = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
      const w = photo.width * s, h = photo.height * s;
      ctx.drawImage(photo, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.fillStyle = '#f6e9ee';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#9b8a97';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText('Your photo', cx, cy + 12);
    }
    ctx.restore();

    // Title
    ctx.fillStyle = INK;
    fitText(ctx, 'THE SOUND OF THANKS', W - 120, 128, (s) => `${s}px ${impact}`);
    ctx.fillText('THE SOUND OF THANKS', W / 2, 944);

    // Tilted ribbon
    ctx.save();
    ctx.translate(W / 2, 1000);
    ctx.rotate(-0.045);
    const rib = ctx.createLinearGradient(-330, 0, 330, 0);
    rib.addColorStop(0, RED);
    rib.addColorStop(1, '#e8457c');
    ctx.fillStyle = rib;
    ctx.shadowColor = 'rgba(200,32,47,0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    roundRect(ctx, -340, -36, 680, 72, 18);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    fitText(ctx, 'AN EVENING OF PRAISE & GRATITUDE', 620, 32, (s) => `700 ${s}px ${sans}`);
    ctx.fillText('AN EVENING OF PRAISE & GRATITUDE', 0, 12);
    ctx.restore();

    // Name
    const display = name.trim().slice(0, 40);
    if (display) {
      ctx.fillStyle = INK;
      fitText(ctx, display, W - 200, 38, (s) => `700 ${s}px ${sans}`);
      ctx.fillText(display, W / 2, 1090);
    }

    // Info boxes
    const boxY = 1122, boxH = 104;
    const lg = ctx.createLinearGradient(80, 0, 530, 0);
    lg.addColorStop(0, PURPLE);
    lg.addColorStop(1, RED);
    ctx.fillStyle = lg;
    roundRect(ctx, 80, boxY, 450, boxH, 28);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = `800 34px ${sans}`;
    ctx.fillText('THU. 12 NOV 2026', 112, boxY + 46);
    ctx.font = `700 28px ${sans}`;
    ctx.fillText(`${EVENT.timeLabel}`, 112, boxY + 84);

    ctx.fillStyle = '#ffd8e6';
    roundRect(ctx, 550, boxY, 450, boxH, 28);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `800 28px ${sans}`;
    ctx.fillText('LIVE IN LAGOS', 582, boxY + 44);
    ctx.font = `600 25px ${sans}`;
    ctx.fillText('+ STREAMING WORLDWIDE', 582, boxY + 82);

    // Bottom bar
    const barY = 1250, barH = 64;
    ctx.fillStyle = '#3a0f2e';
    roundRect(ctx, 80, barY, 920, barH, 32);
    ctx.fill();
    const pill = ctx.createLinearGradient(80, 0, 420, 0);
    pill.addColorStop(0, '#e8457c');
    pill.addColorStop(1, RED);
    ctx.fillStyle = pill;
    roundRect(ctx, 80, barY, 360, barH, 32);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `600 24px ${sans}`;
    ctx.fillText('REGISTER TO JOIN US', 260, barY + 41);
    ctx.font = `800 30px ${sans}`;
    ctx.fillText('oratoriogroup.org', 720, barY + 43);
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

  const blob = () => new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/jpeg', 0.95));

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
        await navigator.share({ files: [file], title: EVENT.name, text: `I will be attending ${EVENT.name}: ${EVENT.theme}. Register at oratoriogroup.org` });
      } catch {}
    } else void download();
  };

  return (
    <div className="mt-6">
      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-line shadow-xl">
        <canvas ref={canvasRef} width={W * S} height={H * S} className="block h-auto w-full" aria-label="Your Oratorio 2026 DP preview" role="img" />
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
        <button type="button" onClick={share} disabled={!photo} className="btn-brand">
          <Share2 className="size-4" /> {canShare ? 'Share' : 'Save to share'}
        </button>
      </div>
    </div>
  );
}
