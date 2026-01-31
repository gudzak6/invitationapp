"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GameProps } from "@/games/registry";

export default function WheelGame({ onWin }: GameProps) {
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => onWin(), 1600);
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
      <div className="relative">
        <motion.div
          className="h-48 w-48 rounded-full border border-ink-900/10 bg-[conic-gradient(#d8c7b1_0deg_120deg,#f1e7db_120deg_240deg,#b7c6d2_240deg_360deg)]"
          animate={{ rotate: spinning ? 1080 : 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-ink-900" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">
          Open Invite
        </div>
      </div>
      <motion.button
        type="button"
        className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-sm"
        onClick={handleSpin}
        whileTap={{ scale: 0.98 }}
      >
        {spinning ? "Spinning..." : "Spin the wheel"}
      </motion.button>
    </div>
  );
}
