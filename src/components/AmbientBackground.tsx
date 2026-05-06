import { useEffect, useRef } from 'react';

interface Props {
  albumArtUrl: string | null;
}

export function AmbientBackground({ albumArtUrl }: Props) {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const canvasRefs = [canvasARef, canvasBRef];

    if (!albumArtUrl) {
      canvasRefs.forEach(r => {
        if (r.current) r.current.style.opacity = '0';
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const next = 1 - activeRef.current;
      const cv = canvasRefs[next].current;
      if (!cv) return;

      cv.width = window.innerWidth + 80;
      cv.height = window.innerHeight + 80;

      const ctx = cv.getContext('2d')!;
      const cw = cv.width;
      const ch = cv.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale);

      canvasRefs[next].current!.style.opacity = '1';
      canvasRefs[activeRef.current].current!.style.opacity = '0';
      activeRef.current = next;
    };
    img.src = albumArtUrl;
  }, [albumArtUrl]);

  return (
    <>
      <canvas ref={canvasARef} className="bg-canvas" style={{ opacity: 0 }} />
      <canvas ref={canvasBRef} className="bg-canvas" style={{ opacity: 0 }} />
    </>
  );
}
