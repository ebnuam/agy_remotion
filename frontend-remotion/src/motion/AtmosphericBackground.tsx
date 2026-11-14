import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

interface AtmosphericBackgroundProps {
  spotlightX?: number;
  spotlightY?: number;
  spotlightRadius?: number;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  spotlightX = 540,
  spotlightY = 750,
  spotlightRadius = 450,
}) => {
  const frame = useCurrentFrame();

  // Subtle swaying of the hanging lightbulb
  const bulbSwayAngle = Math.sin(frame * 0.05) * 3.5;
  const bulbLightFlicker = 0.95 + Math.sin(frame * 0.4) * 0.05;

  // Deterministic floating ambient dust motes
  const motes = [...Array(24)].map((_, i) => {
    const seed = i * 137.5;
    const x = (seed * 97) % 1080;
    const speed = 0.8 + (i % 5) * 0.3;
    const y = 1920 - ((frame * speed + seed * 23) % 2000);
    const size = 2 + (i % 4) * 1.5;
    const opacity = 0.15 + (Math.sin(frame * 0.05 + i) * 0.15 + 0.15);
    return { x, y, size, opacity };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        backgroundColor: theme.colors.bgDark,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          {/* Deep Noir Background Radial Falloff */}
          <radialGradient id="bgVignette" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#141C2E" />
            <stop offset="60%" stopColor="#0B111E" />
            <stop offset="100%" stopColor="#05070B" />
          </radialGradient>

          {/* Dynamic Suspense Spotlight Beam */}
          <radialGradient id="evidenceSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.22)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* Bulb Glow */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Base Dark Noir Gradient */}
        <rect x="0" y="0" width="1080" height="1920" fill="url(#bgVignette)" />

        {/* 2. Spotlight Beam on Target Coordinates */}
        <circle
          cx={spotlightX}
          cy={spotlightY}
          r={spotlightRadius}
          fill="url(#evidenceSpotlight)"
          opacity={bulbLightFlicker}
        />

        {/* 3. Floating Ambient Dust Particles (Bokeh Motes) */}
        {motes.map((m, idx) => (
          <circle
            key={`mote-${idx}`}
            cx={m.x}
            cy={m.y}
            r={m.size}
            fill="#FEF3C7"
            opacity={m.opacity}
          />
        ))}

        {/* 4. Iconic Hanging Lightbulb Motif (From Reference Video) */}
        <g
          transform={`translate(540, 0) rotate(${bulbSwayAngle}) translate(-540, 0)`}
          style={{ transformOrigin: "540px 0px" }}
        >
          {/* Hanging Electric Wire */}
          <line x1="540" y1="0" x2="540" y2="120" stroke="#64748B" strokeWidth="4" />

          {/* Bulb Socket Cap */}
          <rect x="522" y="120" width="36" height="30" rx="3" fill="#475569" stroke="#334155" strokeWidth="2" />
          <line x1="522" y1="128" x2="558" y2="128" stroke="#334155" strokeWidth="2" />
          <line x1="522" y1="138" x2="558" y2="138" stroke="#334155" strokeWidth="2" />

          {/* Bulb Glass Outline */}
          <circle cx="540" cy="180" r="45" fill="none" stroke="#64748B" strokeWidth="3" opacity="0.6" />
          <path
            d="M 522 150 L 522 170 Q 520 215 540 225 Q 560 215 558 170 L 558 150 Z"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
            opacity="0.6"
          />

          {/* Glowing Filament inside bulb */}
          <path
            d="M 533 165 L 535 195 L 540 185 L 545 195 L 547 165"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity={bulbLightFlicker}
          />

          {/* Radial light halo emitted from bulb */}
          <circle cx="540" cy="185" r="90" fill="url(#bulbGlow)" opacity={bulbLightFlicker * 0.4} />
        </g>
      </svg>
    </div>
  );
};
