"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameProps } from "@/games/registry";

type GameState = "idle" | "running" | "gameover" | "won";

export default function WheelGame({ onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const unlockedRef = useRef(false);

  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const WIN_SCORE = 250;
  const W = 520;
  const H = 220;

  const modelRef = useRef({
    t: 0,
    speed: 210,
    groundY: 175,
    dino: {
      x: 80,
      y: 0,
      w: 34,
      h: 38,
      vy: 0,
      onGround: true,
      jumpVel: -720,
      gravity: 1800
    },
    obstacles: [] as Array<{ x: number; y: number; w: number; h: number }>,
    spawnTimer: 0,
    spawnEvery: 1.4
  });

  const drawDino = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dead: boolean
  ) => {
    ctx.save();
    ctx.font = "36px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.textBaseline = "top";
    ctx.globalAlpha = dead ? 0.5 : 1;
    ctx.scale(-1, 1);
    ctx.fillText("🦖", -(x + 28), y - 2);
    ctx.restore();
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  const drawCactus = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.save();
    ctx.font = "28px system-ui, Apple Color Emoji, Segoe UI Emoji";
    ctx.textBaseline = "bottom";
    const count = w > 16 ? 2 : 1;
    const text = "🌵".repeat(count);
    ctx.fillText(text, x - 2, y + h);
    ctx.restore();
  };

  const aabb = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ) => {
    return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
  };

  const isRunning = state === "running";

  const reset = () => {
    const m = modelRef.current;
    m.t = 0;
    m.speed = 210;
    m.obstacles = [];
    m.spawnTimer = 0;
    m.dino.vy = 0;
    m.dino.onGround = true;
    setScore(0);
    unlockedRef.current = false;
    setState("idle");
  };

  const start = () => {
    reset();
    setState("running");
  };

  const retry = () => {
    start();
  };

  const jump = () => {
    const m = modelRef.current;
    if (state !== "running") return;
    if (!m.dino.onGround) return;
    m.dino.onGround = false;
    m.dino.vy = m.dino.jumpVel;
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (state === "idle") return start();
        if (state === "gameover") return retry();
        if (state === "won") return onWin();
        jump();
      }
      if (e.code === "Enter") {
        if (state === "idle") start();
        else if (state === "gameover") retry();
        else if (state === "won") onWin();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [state, onWin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const m = modelRef.current;

      if (state === "running") {
        m.t += dt;
        m.speed += 4 * dt;

        setScore((prev) => {
          const next = prev + Math.floor(10 * dt * (m.speed / 240));
          if (next >= WIN_SCORE) {
            if (!unlockedRef.current) {
              unlockedRef.current = true;
              setState("won");
              window.setTimeout(() => onWin(), 200);
            }
            return WIN_SCORE;
          }
          return next;
        });

        const d = m.dino;
        d.y = m.groundY - d.h;

        if (!d.onGround) {
          d.vy += d.gravity * dt;
          d.y += d.vy * dt;
          if (d.y >= m.groundY - d.h) {
            d.y = m.groundY - d.h;
            d.vy = 0;
            d.onGround = true;
          }
        }

        m.spawnTimer += dt;
        const variance = 0.55 + Math.random() * 0.9;
        if (m.spawnTimer > m.spawnEvery * variance) {
          m.spawnTimer = 0;
          const w = 18;
          const h = 28;
          m.obstacles.push({
            x: W + 30,
            y: m.groundY - h,
            w,
            h
          });
        }

        m.obstacles.forEach((o) => {
          o.x -= m.speed * dt;
        });
        m.obstacles = m.obstacles.filter((o) => o.x + o.w > -10);

        const dinoBox = {
          x: d.x + 8,
          y: d.y + 8,
          w: d.w - 16,
          h: d.h - 10
        };

        const hit = m.obstacles.some((o) => {
          const obBox = {
            x: o.x + 2,
            y: o.y + 2,
            w: o.w - 4,
            h: o.h - 4
          };
          return aabb(dinoBox, obBox);
        });
        if (hit) {
          if (!unlockedRef.current) {
            unlockedRef.current = true;
            setState("gameover");
            window.setTimeout(() => onWin(), 200);
          } else {
            setState("gameover");
          }
        }
      }

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#f7f0e7";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(15, 23, 42, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, modelRef.current.groundY + 0.5);
      ctx.lineTo(W, modelRef.current.groundY + 0.5);
      ctx.stroke();

      const d = modelRef.current.dino;
      drawDino(ctx, d.x, d.y, state === "gameover");

      modelRef.current.obstacles.forEach((o) => {
        drawCactus(ctx, o.x, o.y, o.w, o.h);
      });

      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Score: ${score}`, 12, 20);
      ctx.fillText(`Best: ${best}`, 12, 38);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, score, best]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
    }
  }, [score, best]);

  const statusCopy = useMemo(() => {
    if (state === "idle") return "Tap or press Space to start.";
    if (state === "gameover") return "Game over. Tap to retry.";
    if (state === "won") return "You did it! Unlocking...";
    return "Tap or press Space to jump.";
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="glass-panel px-5 py-6 text-center">
        <div className="flex items-center justify-center gap-4 text-2xl">
          <span>🦖</span>
          <span>🌵</span>
        </div>
        <h2 className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-600">
          Dino runner
        </h2>
        <p className="mt-2 text-sm text-ink-600">{statusCopy}</p>

        <div className="mt-4 flex w-full justify-center">
          <div className="w-full max-w-[520px]">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="block w-full rounded-2xl border border-ink-900/10 bg-white"
            onClick={() => {
              if (state === "idle") return start();
              if (state === "gameover") return retry();
              if (state === "won") return onWin();
              jump();
            }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {state === "idle" && (
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sand-50"
            >
              Start
            </button>
          )}
          {state === "gameover" && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-ink-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sand-50"
            >
              Retry
            </button>
          )}
          {state === "won" && (
            <span className="text-xs uppercase tracking-[0.2em] text-ink-500">
              Opening invite...
            </span>
          )}
          {isRunning && (
            <button
              type="button"
              onClick={jump}
              className="rounded-full border border-ink-900/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-900"
            >
              Jump
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
