"use client";

import Image from "next/image";

export default function GlassWithFill({ fill }: { fill: number }) {
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <div className="relative h-44 w-24">
      {/* Liquid */}
      <div className="absolute inset-x-0 bottom-2 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: `${clamped * 100}%`,
            transition: "height 60ms linear",
            background: `linear-gradient(to top, #0b0f14, #111827 ${
              clamped * 100
            }%, #1f2937)`
          }}
        />

        {/* Foam */}
        <div
          className="absolute inset-x-0 bg-white/90"
          style={{
            bottom: `${clamped * 100}%`,
            height: "6px",
            transform: "translateY(-3px)"
          }}
        />
      </div>

      {/* Glass image */}
      <Image
        src="/stout-pint-glass.png"
        alt="Pint glass"
        fill
        className="pointer-events-none object-contain"
        priority
      />
    </div>
  );
}
