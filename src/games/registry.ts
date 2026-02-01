import type { ComponentType } from "react";
import { GameType } from "@/lib/types";
import FishingGame from "@/games/fishing/FishingGame";
import ScratchGame from "@/games/scratch/ScratchGame";
import PourGame from "@/games/pour/PourGame";
import WheelGame from "@/games/wheel/WheelGame";

export type GameResult = {
  game: string;
  label: string;
  meta?: Record<string, any>;
  createdAtISO?: string;
};

export type GameEntry = {
  displayName: string;
  description: string;
  previewImage: string;
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
    previewImage: "/fishes.png",
    Component: FishingGame,
    defaultConfig: {}
  },
  scratch: {
    displayName: "Scratch",
    description: "Scratch away to reveal dinner.",
    previewImage: "/scratch.png",
    Component: ScratchGame,
    defaultConfig: {}
  },
  pour: {
    displayName: "Pour",
    description: "Hold to fill the glass just right.",
    previewImage: "/glass.png",
    Component: PourGame,
    defaultConfig: { min: 0.7, max: 0.85 }
  },
  wheel: {
    displayName: "Dino",
    description: "Hit retry to get back online.",
    previewImage: "/dino.png",
    Component: WheelGame,
    defaultConfig: {}
  },
  // lockpick: {
  //   displayName: "Lockpick",
  //   description: "Hold the slider in the sweet spot.",
  //   Component: LockpickGame,
  //   defaultConfig: { holdMs: 900 }
  // },
  // memory: {
  //   displayName: "Memory",
  //   description: "Match the cards to unlock.",
  //   Component: MemoryGame,
  //   defaultConfig: {}
  // }
};
