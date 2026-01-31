"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameProps } from "@/games/registry";

type Card = { id: number; value: string; matched: boolean };

const icons = ["A", "B"];

export default function MemoryGame({ onWin }: GameProps) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const cards = useMemo<Card[]>(() => {
    const values = [...icons, ...icons];
    return values
      .map((value, index) => ({
        id: index,
        value,
        matched: false
      }))
      .sort(() => Math.random() - 0.5);
  }, []);

  const handleFlip = (index: number) => {
    if (flipped.includes(index) || matched.includes(index)) return;
    if (flipped.length === 2) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      const [first, second] = next;
      if (cards[first].value === cards[second].value) {
        const updated = [...matched, first, second];
        setMatched(updated);
        setTimeout(() => {
          setFlipped([]);
          if (updated.length === cards.length) {
            onWin();
          }
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-4">
      {cards.map((card, index) => {
        const isFlipped = flipped.includes(index) || matched.includes(index);
        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => handleFlip(index)}
            className="flex h-24 items-center justify-center rounded-2xl border border-ink-900/10 bg-white text-2xl shadow-sm"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className={isFlipped ? "block" : "hidden"}>{card.value}</span>
            {!isFlipped && <span className="text-sm text-ink-600">Reveal</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
