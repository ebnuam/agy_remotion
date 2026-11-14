import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface AlibiCardProps {
  suspectNumber: string;
  suspectName: string;
  alibiText: string;
  isQuestionCard?: boolean;
}

export const AlibiCard: React.FC<AlibiCardProps> = ({
  suspectNumber = "KS-01",
  suspectName = "DINDA",
  alibiText = "di teras, telponan",
  isQuestionCard = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Floating spring entrance
  const cardSpring = spring({
    frame,
    fps,
    config: theme.springs.bouncy,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(cardSpring, [0, 1], [150, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: 760,
        height: 600,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        viewBox="0 0 760 600"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="20" stdDeviation="16" floodColor="#000000" floodOpacity="0.7" />
          </filter>

          {/* Striped Background for Alibi Mystery Card */}
          <pattern id="cardStripes" width="40" height="40" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#1E293B" strokeWidth="16" />
          </pattern>
        </defs>

        {/* 1. LEFT POLAROID PHOTO CARD (Tilted -6 deg) */}
        <g transform="translate(40, 60) rotate(-7)" filter="url(#cardShadow)">
          {/* Polaroid Paper Frame */}
          <rect x="0" y="0" width="320" height="440" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="3" />

          {/* Top Paperclip */}
          <path
            d="M 140 -15 L 140 30 Q 140 45 152 45 Q 164 45 164 30 L 164 -25 Q 164 -45 146 -45 Q 128 -45 128 -25 L 128 35"
            stroke="#94A3B8"
            strokeWidth="5"
            fill="none"
          />

          {/* Polaroid Photo Box */}
          <rect x="25" y="45" width="270" height="260" rx="4" fill="#0EA5E9" />
          {/* Illustrated Suspect Profile Silhouette */}
          <circle cx="160" cy="150" r="45" fill="#FFE0BD" />
          <path d="M 125 140 Q 115 170 120 195 L 200 195 Q 205 170 195 140 Z" fill="#2E1B10" />
          <path d="M 85 280 C 85 220, 110 200, 160 200 C 210 200, 235 220, 235 280 Z" fill="#10B981" />

          {/* Polaroid Name & Alibi Label */}
          <text x="160" y="355" textAnchor="middle" fill="#0F172A" fontSize="36" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
            {suspectName}
          </text>
          <text x="160" y="395" textAnchor="middle" fill="#475569" fontSize="22" fontWeight="700" fontFamily={theme.fonts.typewriter}>
            {alibiText}
          </text>
        </g>

        {/* 2. RIGHT MYSTERY QUESTION CARD (Center Stage) */}
        <g transform="translate(340, 20)" filter="url(#cardShadow)">
          {/* Dark Navy Blueprint Card */}
          <rect x="0" y="0" width="380" height="520" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="6" />
          {/* Diagonal Striped Infill */}
          <rect x="12" y="12" width="356" height="496" rx="8" fill="url(#cardStripes)" opacity="0.4" />

          {/* Card Border Gold Piping */}
          <rect x="16" y="16" width="348" height="488" rx="6" fill="none" stroke={theme.colors.borderGold} strokeWidth="3" />

          {/* Big Question Mark Motif */}
          <text x="190" y="190" textAnchor="middle" fill={theme.colors.goldBright} fontSize="140" fontWeight="900" fontFamily={theme.fonts.headline}>
            ?
          </text>

          {/* Case Label */}
          <text x="190" y="245" textAnchor="middle" fill="#94A3B8" fontSize="26" fontWeight="800" fontFamily={theme.fonts.typewriter} letterSpacing="3">
            ALIBI #2
          </text>

          {/* Big Bold Headline */}
          <text x="190" y="320" textAnchor="middle" fill="#FFFFFF" fontSize="56" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
            PALING
          </text>
          <text x="190" y="380" textAnchor="middle" fill="#FFFFFF" fontSize="56" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
            MEYAKINKAN
          </text>
        </g>
      </svg>
    </div>
  );
};
