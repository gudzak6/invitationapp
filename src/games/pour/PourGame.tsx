"use client";

import { useEffect, useMemo, useState } from "react";
import { GameProps } from "@/games/registry";

export default function PourGame({ onWin }: GameProps) {
  const [progress, setProgress] = useState(0); // 0..100
  const [filling, setFilling] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<"idle" | "miss" | "win">("idle");

  const targetPct = 75;
  const tolerancePct = 4;

  // Hold-to-fill mechanic
  useEffect(() => {
    if (!filling || completed) return;
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 0.8)); // tune speed
    }, 16); // ~60fps
    return () => window.clearInterval(id);
  }, [filling, completed]);

  const fillY = useMemo(() => {
    // SVG viewBox is 0..200 tall; liquid area starts at bottom.
    // Convert progress% into "top" position for liquid rect.
    const liquidTop = 200 - (progress / 100) * 140 - 20; // tune
    return Math.max(40, Math.min(180, liquidTop));
  }, [progress]);

  const isFull = progress >= 100;

  const evaluate = () => {
    if (completed) return;
    const error = Math.abs(progress - targetPct);
    if (error <= tolerancePct) {
      setStatus("win");
      setCompleted(true);
      onWin();
    } else {
      setStatus("miss");
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm p-4">
      <div className="rounded-3xl border border-ink-900/10 bg-white px-4 py-5">
        <div className="mb-3 text-center">
          <div className="text-lg font-semibold text-ink-900">
            Split the G
          </div>
          <div className="text-sm text-ink-600">
            Press and hold to fill. Stop at the 3/4 line.
          </div>
        </div>

        <div className="flex items-center justify-center">
          <svg viewBox="0 0 120 200" className="h-auto w-44">
            {/* Glass outline */}
            <path
              d="M25 20 L35 180 Q60 195 85 180 L95 20"
              fill="none"
              stroke="rgba(15,23,42,0.7)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Inner glass clip (where liquid shows) */}
            <defs>
              <clipPath id="glassClip">
                <path d="M32 28 L40 172 Q60 184 80 172 L88 28 Z" />
              </clipPath>

              {/* subtle gradient for liquid */}
              <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(96,165,250,0.95)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.75)" />
              </linearGradient>
            </defs>

            {/* Liquid group masked to glass */}
            <g clipPath="url(#glassClip)">
              {/* Liquid body */}
              <rect
                x="28"
                y={fillY}
                width="64"
                height="200"
                fill="url(#liquidGrad)"
                style={{
                  transition: "y 120ms cubic-bezier(.2,.8,.2,1)"
                }}
              />

              {/* Wave surface (animated sideways) */}
              <path
                d={`M28 ${fillY + 6}
                   C 40 ${fillY - 2}, 52 ${fillY + 14}, 64 ${fillY + 6}
                   C 76 ${fillY - 2}, 88 ${fillY + 14}, 100 ${fillY + 6}
                   L100 210 L28 210 Z`}
                fill="rgba(255,255,255,0.15)"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="-6 0; 6 0; -6 0"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Bubbles */}
              {!isFull && (
                <>
                  <circle cx="45" cy="150" r="2" fill="rgba(255,255,255,0.35)">
                    <animate
                      attributeName="cy"
                      values="170;120"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.5;0"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="70"
                    cy="160"
                    r="1.5"
                    fill="rgba(255,255,255,0.3)"
                  >
                    <animate
                      attributeName="cy"
                      values="175;130"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.45;0"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </g>

            {/* Target line at 3/4 */}
            <line
              x1="30"
              x2="90"
              y1={200 - (targetPct / 100) * 140 - 20}
              y2={200 - (targetPct / 100) * 140 - 20}
              stroke="rgba(16,185,129,0.8)"
              strokeWidth="3"
            />

            {/* Glass highlight */}
            <path
              d="M40 30 L46 165"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* “Full” sparkle */}
            {isFull && (
              <g>
                <circle cx="60" cy="40" r="3" fill="rgba(255,255,255,0.9)">
                  <animate
                    attributeName="r"
                    values="1;4;1"
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="78" cy="55" r="2" fill="rgba(255,255,255,0.7)">
                  <animate
                    attributeName="r"
                    values="1;3;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.99]"
            onPointerDown={() => {
              setStatus("idle");
              setFilling(true);
            }}
            onPointerUp={() => {
              setFilling(false);
              evaluate();
            }}
            onPointerLeave={() => {
              if (!filling) return;
              setFilling(false);
              evaluate();
            }}
          >
            Hold to fill
          </button>

          <button
            className="rounded-2xl border border-ink-900/15 px-4 py-3 text-sm font-semibold text-ink-700 active:scale-[0.99]"
            onClick={() => {
              setProgress(0);
              setCompleted(false);
              setStatus("idle");
            }}
          >
            Reset
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-ink-600">
          Progress: <span className="text-ink-900">{Math.round(progress)}%</span>
          {status === "win" && (
            <span className="ml-2 text-ink-900">✅ Unlocked</span>
          )}
          {status === "miss" && (
            <span className="ml-2 text-ink-500">Try again</span>
          )}
        </div>
      </div>
    </div>
  );
}
