import type { ComponentType } from "react";
import { GameType } from "@/lib/types";
import FishingGame from "@/games/fishing/FishingGame";
import ScratchGame from "@/games/scratch/ScratchGame";
import PourGame from "@/games/pour/PourGame";
import LockpickGame from "@/games/lockpick/LockpickGame";
import WheelGame from "@/games/wheel/WheelGame";
import MemoryGame from "@/games/memory/MemoryGame";

export type GameResult = {
  game: string;
  label: string;
  meta?: Record<string, any>;
  createdAtISO?: string;
};

export type GameEntry = {
  displayName: string;
  description: string;
  Component: ComponentType<GameProps>;
  defaultConfig: Record<string, unknown>;
};

export type GameProps = {
  config: Record<string, unknown>;
  onWin: (result?: GameResult) => void;
};

export const gameRegistry: Record<GameType, GameEntry> = {
  fishing: {
    displayName: "Fishing",
    description: "Tap a moving fish to hook the invite.",
    Component: FishingGame,
    defaultConfig: {}
  },
  scratch: {
    displayName: "Scratch",
    description: "Scratch away to reveal dinner.",
    Component: ScratchGame,
    defaultConfig: {}
  },
  pour: {
    displayName: "Pour",
    description: "Hold to fill the glass just right.",
    Component: PourGame,
    defaultConfig: { min: 0.7, max: 0.85 }
  },
  lockpick: {
    displayName: "Lockpick",
    description: "Hold the slider in the sweet spot.",
    Component: LockpickGame,
    defaultConfig: { holdMs: 900 }
  },
  wheel: {
    displayName: "Wheel",
    description: "Spin the wheel to open the invite.",
    Component: WheelGame,
    defaultConfig: {}
  },
  memory: {
    displayName: "Memory",
    description: "Match the cards to unlock.",
    Component: MemoryGame,
    defaultConfig: {}
  }
};
