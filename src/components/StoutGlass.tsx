"use client";

import { useId } from "react";

type StoutGlassProps = {
  fill: number;
  gCenter: number;
  gBottom: number;
  gHeight: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function StoutGlass({
  fill,
  gCenter,
  gBottom,
  gHeight
}: StoutGlassProps) {
  const clipId = useId();
  const glassHeight = 200;
  const glassTop = 20;
  const glassBottom = glassTop + glassHeight;
  const liquidFill = clamp(fill, 0, 1);
  const liquidHeight = liquidFill * glassHeight;
  const liquidY = glassBottom - liquidHeight;

  const gBadgeHeight = clamp(gHeight, 0.08, 0.4) * glassHeight;
  const gBadgeBottom = glassBottom - clamp(gBottom, 0.05, 0.9) * glassHeight;
  const gBadgeY = gBadgeBottom - gBadgeHeight;

  const gCenterY =
    glassBottom - clamp(gCenter, 0.05, 0.95) * glassHeight;

  const foamHeight = Math.min(10, liquidHeight * 0.08 + 4);

  return (
    <svg
      viewBox="0 0 180 260"
      className="h-full w-full"
      role="img"
      aria-label="Stout glass"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M30 20 L150 20 L122 220 L58 220 Z" />
        </clipPath>
      </defs>

      {/* Liquid */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="0"
          y={liquidY}
          width="180"
          height={liquidHeight}
          fill="#111827"
        />
        <rect
          x="0"
          y={Math.max(liquidY - foamHeight + 2, glassTop)}
          width="180"
          height={foamHeight}
          fill="rgba(255,255,255,0.8)"
        />
      </g>

      {/* Glass outline */}
      <path
        d="M30 20 L150 20 L122 220 L58 220 Z"
        fill="none"
        stroke="rgba(15,23,42,0.25)"
        strokeWidth="2"
      />
      <path
        d="M45 26 L58 214"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
      />

      {/* G marker */}
      <g>
        <rect
          x="44"
          y={gBadgeY}
          width="44"
          height={gBadgeHeight}
          rx="8"
          fill="rgba(255,255,255,0.7)"
          stroke="rgba(15,23,42,0.1)"
        />
        <text
          x="66"
          y={gBadgeY + gBadgeHeight / 2 + 8}
          textAnchor="middle"
          fontSize={Math.max(18, gBadgeHeight * 0.5)}
          fontWeight="800"
          fill="rgba(15,23,42,0.7)"
          fontFamily="system-ui, sans-serif"
        >
          G
        </text>
      </g>

      {/* Target line */}
      <line
        x1="34"
        x2="146"
        y1={gCenterY}
        y2={gCenterY}
        stroke="rgba(16,185,129,0.7)"
        strokeWidth="2"
      />
      <rect
        x="34"
        y={gCenterY - gHeight * glassHeight}
        width="112"
        height={gHeight * glassHeight * 2}
        fill="rgba(16,185,129,0.08)"
      />
    </svg>
  );
}
