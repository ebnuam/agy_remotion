import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface SuspectLineupProps {
  activeSuspectIndex?: number; // 0, 1, or 2
  showPolaroid?: boolean;
}

export const SuspectLineup: React.FC<SuspectLineupProps> = ({
  activeSuspectIndex = 1,
  showPolaroid = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing idle motion for the 3 suspects
  const idleY = Math.sin(frame * 0.08) * 4;

  return (
    <div
      style={{
        position: "relative",
        width: 960,
        height: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
    >
      <svg
        viewBox="0 0 960 600"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          {/* Neon Glow Filters for Selected Suspect */}
          <filter id="goldContourGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========================================================
            SUSPECT 1 (LEFT): Female Ponytail Silhouette
        ======================================================== */}
        <g
          transform={`translate(60, ${idleY})`}
          filter={activeSuspectIndex === 0 ? "url(#goldContourGlow)" : undefined}
          opacity={activeSuspectIndex === 0 ? 1 : 0.45}
        >
          {/* Head Number Tag */}
          <circle cx="140" cy="120" r="28" fill="#334155" stroke="#64748B" strokeWidth="2" />
          <text x="140" y="128" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            #1
          </text>

          {/* Ponytail Hair */}
          <path d="M 120 180 Q 90 190 85 240 Q 120 220 135 200 Z" fill="#0A0F1D" stroke="#64748B" strokeWidth="3" />

          {/* Head */}
          <circle cx="140" cy="200" r="48" fill="#0A0F1D" stroke={activeSuspectIndex === 0 ? theme.colors.goldBright : "#64748B"} strokeWidth={activeSuspectIndex === 0 ? "4" : "2.5"} />

          {/* Torso & Shoulders Silhouette */}
          <path
            d="M 50 480 C 50 310, 80 250, 140 250 C 200 250, 230 310, 230 480 Z"
            fill="#0A0F1D"
            stroke={activeSuspectIndex === 0 ? theme.colors.goldBright : "#64748B"}
            strokeWidth={activeSuspectIndex === 0 ? "4" : "2.5"}
          />
        </g>

        {/* ========================================================
            SUSPECT 2 (CENTER): Classic Round Head Silhouette
        ======================================================== */}
        <g
          transform={`translate(340, ${idleY})`}
          filter={activeSuspectIndex === 1 ? "url(#goldContourGlow)" : undefined}
          opacity={activeSuspectIndex === 1 ? 1 : 0.45}
        >
          {/* Head Number Tag */}
          <circle cx="140" cy="120" r="28" fill="#334155" stroke="#64748B" strokeWidth="2" />
          <text x="140" y="128" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            #2
          </text>

          {/* Head */}
          <circle cx="140" cy="200" r="50" fill="#0A0F1D" stroke={activeSuspectIndex === 1 ? theme.colors.goldBright : "#64748B"} strokeWidth={activeSuspectIndex === 1 ? "4" : "2.5"} />

          {/* Torso & Shoulders Silhouette */}
          <path
            d="M 40 480 C 40 300, 75 250, 140 250 C 205 250, 240 300, 240 480 Z"
            fill="#0A0F1D"
            stroke={activeSuspectIndex === 1 ? theme.colors.goldBright : "#64748B"}
            strokeWidth={activeSuspectIndex === 1 ? "4" : "2.5"}
          />
        </g>

        {/* ========================================================
            SUSPECT 3 (RIGHT): Crown / Spiked Cap Silhouette
        ======================================================== */}
        <g
          transform={`translate(620, ${idleY})`}
          filter={activeSuspectIndex === 2 ? "url(#goldContourGlow)" : undefined}
          opacity={activeSuspectIndex === 2 ? 1 : 0.45}
        >
          {/* Head Number Tag */}
          <circle cx="140" cy="120" r="28" fill="#334155" stroke="#64748B" strokeWidth="2" />
          <text x="140" y="128" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            #3
          </text>

          {/* Spiked Crown / Beanie Outline */}
          <path
            d="M 95 190 L 105 140 L 125 170 L 140 135 L 155 170 L 175 140 L 185 190 Z"
            fill="#0A0F1D"
            stroke={activeSuspectIndex === 2 ? theme.colors.goldBright : "#64748B"}
            strokeWidth={activeSuspectIndex === 2 ? "4" : "2.5"}
          />

          {/* Head */}
          <circle cx="140" cy="200" r="50" fill="#0A0F1D" stroke={activeSuspectIndex === 2 ? theme.colors.goldBright : "#64748B"} strokeWidth={activeSuspectIndex === 2 ? "4" : "2.5"} />

          {/* Torso & Shoulders Silhouette */}
          <path
            d="M 40 480 C 40 300, 75 250, 140 250 C 205 250, 240 300, 240 480 Z"
            fill="#0A0F1D"
            stroke={activeSuspectIndex === 2 ? theme.colors.goldBright : "#64748B"}
            strokeWidth={activeSuspectIndex === 2 ? "4" : "2.5"}
          />
        </g>
      </svg>
    </div>
  );
};
