"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameProps } from "@/games/registry";

export default function LockpickGame({ config, onWin }: GameProps) {
  const holdMs = (config.holdMs as number) ?? 900;
  const [value, setValue] = useState(50);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const target = { min: 42, max: 58 };
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    if (!holding) return;
    if (value < target.min || value > target.max) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / holdMs, 1));
      if (elapsed >= holdMs) {
        onWin();
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [holding, value, holdMs, onWin]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="glass-panel px-6 py-6">
        <div className="relative flex flex-col gap-3">
          <div className="h-3 rounded-full bg-sand-100" />
          <div
            className="absolute left-0 top-0 h-3 rounded-full bg-ink-900/10"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-0 h-3 rounded-full bg-[#b7c6d2]"
            style={{
              left: `${target.min}%`,
              width: `${target.max - target.min}%`
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            className="mt-6 w-full accent-ink-900"
            onChange={(event) => setValue(Number(event.target.value))}
            onPointerDown={() => setHolding(true)}
            onPointerUp={() => setHolding(false)}
          />
        </div>
      </div>
      <motion.p
        className="text-center text-xs text-ink-600"
        animate={{ opacity: holding ? 0.9 : 0.6 }}
      >
        Hold the slider in the highlighted range.
      </motion.p>
    </div>
  );
}
