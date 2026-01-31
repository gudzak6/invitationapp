"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { GameProps } from "@/games/registry";

const CANVAS_SIZE = { width: 320, height: 200 };
const WIN_THRESHOLD = 0.65;
const BRUSH_RADIUS = 18;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ScratchGame({ onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const rafPending = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  const coverPattern = useMemo(() => {
    // simple procedural speckle pattern (no external assets)
    const off = document?.createElement?.("canvas");
    if (!off) return null;
    off.width = 40;
    off.height = 40;
    const octx = off.getContext("2d");
    if (!octx) return null;

    octx.fillStyle = "#d2c1a8";
    octx.fillRect(0, 0, off.width, off.height);

    for (let i = 0; i < 120; i++) {
      const x = Math.random() * off.width;
      const y = Math.random() * off.height;
      const a = 0.08 + Math.random() * 0.12;
      octx.fillStyle = `rgba(0,0,0,${a})`;
      octx.beginPath();
      octx.arc(x, y, Math.random() * 1.6, 0, Math.PI * 2);
      octx.fill();
    }

    return off;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_SIZE.width;
    canvas.height = CANVAS_SIZE.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a nicer "scratch card" cover
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#e6d7c2");
    grad.addColorStop(1, "#cbb59a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (coverPattern) {
      const pattern = ctx.createPattern(coverPattern, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
    }

    // Set erase mode
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;
  }, [coverPattern]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const estimateClearedPercentFast = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    // Fast sampling grid (much cheaper than scanning every pixel)
    const step = 8; // smaller = more accurate, slower
    const { width, height } = canvas;
    const img = ctx.getImageData(0, 0, width, height).data;

    let total = 0;
    let cleared = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        total++;
        const idx = (y * width + x) * 4 + 3; // alpha channel
        if (img[idx] === 0) cleared++;
      }
    }
    return cleared / total;
  };

  const scheduleProgressCheck = () => {
    if (rafPending.current) return;
    rafPending.current = true;

    // throttle via rAF; inside we can clamp update frequency further if desired
    requestAnimationFrame(() => {
      rafPending.current = false;
      const pct = estimateClearedPercentFast();
      setProgress(pct);

      if (!revealed && pct >= WIN_THRESHOLD) {
        setRevealed(true);
        // small delay lets the final scratch stroke render first
        setTimeout(() => onWin(), 250);
      }
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = getPoint(event);
    lastPoint.current = p;

    // single dab on down
    ctx.beginPath();
    ctx.arc(p.x, p.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    scheduleProgressCheck();
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    if (!lastPoint.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = getPoint(event);
    const lp = lastPoint.current;

    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastPoint.current = p;
    scheduleProgressCheck();
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(event.pointerId);
    lastPoint.current = null;
    scheduleProgressCheck();
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-ink-600">
        <span>Scratch to unlock</span>
        <span>{Math.round(clamp(progress, 0, 1) * 100)}%</span>
      </div>

      <div className="glass-panel relative overflow-hidden">
        <div className="flex h-[200px] items-center justify-center bg-white px-6 text-center text-lg font-semibold text-ink-900">
          Dinner awaits.
        </div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}

        {revealed && (
          <div className="pointer-events-none absolute inset-0 animate-fadeOut" />
        )}
      </div>

      <p className="text-center text-xs text-ink-600">
        Scratch away the cover to unlock the invite.
      </p>
    </div>
  );
}
