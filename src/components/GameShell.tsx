"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type GameShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function GameShell({ title, subtitle, children }: GameShellProps) {
  return (
    <motion.div
      className="flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        {subtitle && (
          <p className="text-xs uppercase tracking-[0.25em] text-ink-600">
            {subtitle}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-semibold text-ink-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
