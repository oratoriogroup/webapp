'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2 } from 'lucide-react';
import { EVENT } from '@/lib/event';
import { checkinUrl } from '@/lib/checkin';

const W = 1080;
const H = 1380;
const S = 2; // drawn at 2x so the saved image stays sharp
const RED = '#dc2626';
const INK = '#1a1114';
const MUTED = '#6b5f63';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const fit = (ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, font: (s: number) => string) => {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 14) {
    s -= 2;
    ctx.font = font(s);
  }
};

// The attendee's check-in pass: logo, event, a large QR code and their name.
// Rendered in the browser, downloadable as a sharp PNG.
export default function PassCard({ code, name, refCode }: { code: string; name: string; refCode?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const draw = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    const sans = getComputedStyle(document.documentElement).getPropertyValue('--font-sans-face').trim() || 'system-ui, sans-serif';
    try {
      await Promise.all([document.fonts.load(`800 40px ${sans}`), document.fonts.load(`600 40px ${sans}`)]);
    } catch {}

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    // Thin brand band
    const band = ctx.createLinearGradient(0, 0, W, 0);
    band.addColorStop(0, RED);
    band.addColorStop(1, '#991b1b');
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, W, 14);

    ctx.textAlign = 'center';
    try {
      const logo = await loadImage('/images/logo-color.png');
      const lw = 300, lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, (W - lw) / 2, 70, lw, lh);
    } catch {}

    ctx.fillStyle = INK;
    fit(ctx, `${EVENT.name}: ${EVENT.theme}`, W - 140, 54, (s) => `800 ${s}px ${sans}`);
    ctx.fillText(`${EVENT.name}: ${EVENT.theme}`, W / 2, 290);
    ctx.fillStyle = MUTED;
    ctx.font = `600 30px ${sans}`;
    ctx.fillText(`${EVENT.dateShort}  |  ${EVENT.timeLabel}  |  Maryland, Lagos`, W / 2, 345);

    // Dashed frame + QR
    const box = 660, bx = (W - box) / 2, by = 410;
    ctx.strokeStyle = '#f08a24';
    ctx.lineWidth = 6;
    ctx.setLineDash([26, 18]);
    ctx.beginPath();
    ctx.roundRect(bx, by, box, box, 44);
    ctx.stroke();
    ctx.setLineDash([]);
    const qr = document.createElement('canvas');
    await QRCode.toCanvas(qr, checkinUrl(code), { errorCorrectionLevel: 'M', margin: 0, width: 540 * S, color: { dark: INK, light: '#ffffff' } });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, bx + 60, by + 60, 540, 540);
    ctx.imageSmoothingEnabled = true;

    ctx.fillStyle = RED;
    ctx.font = `800 24px ${sans}`;
    ctx.letterSpacing = '6px';
    ctx.fillText('CHECK-IN PASS', W / 2, 1170);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = INK;
    fit(ctx, name, W - 160, 60, (s) => `800 ${s}px ${sans}`);
    ctx.fillText(name, W / 2, 1250);
    if (refCode) {
      ctx.fillStyle = MUTED;
      ctx.font = `600 28px ${sans}`;
      ctx.fillText(`Ref ${refCode}`, W / 2, 1305);
    }
    setReady(true);
  }, [code, name, refCode]);

  useEffect(() => {
    void draw();
    setCanShare(typeof navigator !== 'undefined' && !!navigator.canShare);
  }, [draw]);

  const blob = () => new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/png'));
  const download = async () => {
    const b = await blob();
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'oratorio-2026-check-in-pass.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const share = async () => {
    const b = await blob();
    if (!b) return;
    const file = new File([b], 'oratorio-2026-check-in-pass.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My Oratorio 2026 check-in pass' });
      } catch {}
    } else void download();
  };

  return (
    <div>
      <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-line bg-white shadow-xl sm:max-w-sm [@media(min-width:640px)_and_(max-height:820px)]:max-w-[min(18rem,calc(100dvh*0.355))]">
        <canvas ref={canvasRef} width={W * S} height={H * S} className="block h-auto w-full" role="img" aria-label={`Check-in pass QR code for ${name}`} />
      </div>
      <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 sm:max-w-sm">
        <button type="button" onClick={download} disabled={!ready} className="btn-brand min-h-12 !px-3">
          <Download className="size-4" /> <span className="sm:hidden">Download</span><span className="hidden sm:inline">Download pass</span>
        </button>
        <button type="button" onClick={share} disabled={!ready} className="btn-outline min-h-12 !px-3">
          <Share2 className="size-4" /> <span className="sm:hidden">{canShare ? 'Share' : 'Save image'}</span><span className="hidden sm:inline">{canShare ? 'Save or share' : 'Save image'}</span>
        </button>
      </div>
    </div>
  );
}
