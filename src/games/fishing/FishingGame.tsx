"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameProps } from "@/games/registry";

type Fish = {
  id: string;
  top: string;
  delay: number;
  duration: number;
  direction: "left" | "right";
};

const lanes = ["32%", "52%", "70%"];

function rectsOverlap(a: DOMRect, b: DOMRect) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function expandRect(r: DOMRect, pad: number) {
  return new DOMRect(
    r.x - pad,
    r.y - pad,
    r.width + pad * 2,
    r.height + pad * 2
  );
}

export default function FishingGame({ onWin }: GameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hookRef = useRef<HTMLDivElement | null>(null);
  const fishRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [containerW, setContainerW] = useState(0);

  const [dropping, setDropping] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [caught, setCaught] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  // measure container width (responsive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerW(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fishes: Fish[] = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `fish-${i}-${Math.random().toString(16).slice(2)}`,
      top: lanes[i % lanes.length],
      delay: i * 0.6,
      duration: 6.5 + (i % 2) * 0.8,
      direction: i % 2 === 0 ? "right" : "left"
    }));
  }, []);

  const FishSvg = ({
    direction
  }: {
    direction: "left" | "right";
  }) => (
    <svg
      width="70"
      height="36"
      viewBox="0 0 70 36"
      className="h-full w-full"
      style={{ transform: direction === "left" ? "scaleX(-1)" : "none" }}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="18" rx="22" ry="14" fill="#7b8fa3" />
      <polygon points="50,18 68,6 68,30" fill="#6a7f93" />
      <polygon points="30,6 36,0 40,8" fill="#6a7f93" />
      <polygon points="30,30 36,36 40,28" fill="#6a7f93" />
      <circle cx="18" cy="16" r="2.5" fill="#1f2a33" />
      <circle cx="19" cy="15" r="1" fill="#ffffff" />
    </svg>
  );

  // Clear toast quickly
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 900);
    return () => clearTimeout(t);
  }, [toast]);

  // After win, call onWin
  useEffect(() => {
    if (!caught) return;
    const t = setTimeout(() => onWin(), 1200);
    return () => clearTimeout(t);
  }, [caught, onWin]);

  const isGameOver = !caught && attempts <= 0;

  const handleDrop = () => {
    if (caught || dropping || isGameOver) return;
    setDropping(true);
    setToast(null);
  };

  const checkCatch = async () => {
    // Wait a frame so final transforms are applied before reading DOMRects
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const hookEl = hookRef.current;
    if (!hookEl) return false;

    const hookRect = expandRect(hookEl.getBoundingClientRect(), 12);

    for (const fish of fishes) {
      const fishEl = fishRefs.current[fish.id];
      if (!fishEl) continue;

      const fishRect = fishEl.getBoundingClientRect();
      if (rectsOverlap(hookRect, fishRect)) return true;
    }

    return false;
  };

  const handleDropComplete = async () => {
    if (caught) return;

    const hit = await checkCatch();

    if (hit) {
      setCaught(true);
      setShowSplash(true);
      setToast("Nice catch!");
      return;
    }

    setAttempts((a) => Math.max(0, a - 1));
    setToast("Miss!");
    setDropping(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-72 w-full max-w-sm overflow-hidden rounded-[32px] border border-ink-900/10 bg-gradient-to-b from-[#f9f7f3] via-[#e6edf2] to-[#c9d7e1]"
    >
      {/* water gradients */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#efe7de] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#a9bfd0] to-transparent" />

      {/* HUD */}
      <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-medium text-ink-700">
        Attempts: {attempts}
      </div>

      {!caught && !isGameOver && (
        <div className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs font-medium text-ink-700">
          Tap to drop 🎣
        </div>
      )}

      {/* Tap overlay (behind fish + hook visuals, but captures clicks) */}
      {!caught && !isGameOver && (
        <button
          type="button"
          aria-label="drop hook"
          onClick={handleDrop}
          className="absolute inset-0 z-0"
        />
      )}

      {/* Fish */}
      {containerW > 0 &&
        fishes.map((fish) => {
          const fishW = 56;
          const startX = -fishW - 20;
          const endX = containerW + fishW + 20;

          return (
            <motion.button
              key={fish.id}
              ref={(el) => {
                fishRefs.current[fish.id] = el;
              }}
              type="button"
              aria-label="fish"
              // Clicking fish should NOT auto-win. Just give feedback.
              onClick={(e) => {
                e.preventDefault();
                if (!caught && !dropping && !isGameOver) setToast("Use the hook!");
              }}
              className="absolute z-10 flex h-9 w-[70px] items-center justify-center"
              style={{ top: fish.top, left: 0 }}
              initial={{ x: startX }}
              animate={{ x: [startX, endX] }}
              transition={{
                duration: fish.duration,
                repeat: Infinity,
                delay: fish.delay,
                ease: "linear"
              }}
            >
              <FishSvg direction={fish.direction} />
            </motion.button>
          );
        })}

      {/* Hook (idle: sway side-to-side, tap: drop straight down) */}
      {!caught && !isGameOver && (
        <motion.div
          className="absolute left-1/2 top-3 z-20 -translate-x-1/2"
          animate={dropping ? { x: 0 } : { x: ["-38%", "38%", "-38%"] }}
          transition={
            dropping
              ? { duration: 0.01 }
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
          style={{ width: 1 }}
        >
          {/* line */}
          <motion.div
            className="mx-auto w-[2px] rounded-full bg-[#2e3e4d]/40"
            initial={false}
            animate={dropping ? { height: 220, opacity: 1 } : { height: 42, opacity: 0.8 }}
            transition={{ duration: 0.38, ease: "easeIn" }}
          />

          {/* hook head (collision hitbox) */}
          <motion.div
            ref={hookRef}
            className="absolute left-1/2 top-[40px] flex h-8 w-8 -translate-x-1/2 items-center justify-center"
            initial={false}
            animate={dropping ? { y: 180, scale: 1 } : { y: 0, scale: 0.98 }}
            transition={{ duration: 0.38, ease: "easeIn" }}
            onAnimationComplete={() => {
              if (!dropping) return;
              handleDropComplete();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              style={{ transform: "translate(1px, 1px) rotate(360deg) scaleX(-1)" }}
              aria-hidden="true"
            >
              <path
                d="M12 3v9c0 2.5 2 4.5 4.5 4.5S21 14.5 21 12"
                fill="none"
                stroke="rgba(46, 62, 77, 0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M21 12c0 1.7-1.3 3-3 3-1.3 0-2.3-.8-2.8-1.9"
                fill="none"
                stroke="rgba(46, 62, 77, 0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="3" r="1.5" fill="rgba(46, 62, 77, 0.9)" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          className="absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full border border-white/60 bg-white/80 px-4 py-1 text-xs font-medium text-ink-800 shadow-sm"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {toast}
        </motion.div>
      )}

      {/* Win splash */}
      {showSplash && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-28 w-28 rounded-full border border-white/60 bg-white/40"
            initial={{ scale: 0.6, opacity: 0.2 }}
            animate={{ scale: 1.2, opacity: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.span
            className="absolute text-lg font-semibold text-ink-900"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            We got dinner.
          </motion.span>
        </motion.div>
      )}

      {/* Game over */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-white/35 backdrop-blur-[2px]">
          <div className="text-base font-semibold text-ink-900">No bites 🥲</div>
          <div className="text-xs text-ink-700">Refresh to try again</div>
        </div>
      )}
    </div>
  );
}
