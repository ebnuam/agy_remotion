import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface EvidenceFolderProps {
  caseNumber?: string;
  berkasText: string;
  tkpText: string;
  tersangkaText: string;
  petunjukText: string;
  stampText?: string;
  showStamp?: boolean;
  stampDelayFrames?: number;
}

export const EvidenceFolder: React.FC<EvidenceFolderProps> = ({
  caseNumber = "KASUS #1",
  berkasText,
  tkpText,
  tersangkaText,
  petunjukText,
  stampText = "TANPA TRIK",
  showStamp = true,
  stampDelayFrames = 25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Folder Entrance Animation (Spring pop up and slight tilt)
  const folderSpring = spring({
    frame,
    fps,
    config: theme.springs.bouncy,
  });
  const folderScale = interpolate(folderSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const folderY = interpolate(folderSpring, [0, 1], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const folderOpacity = interpolate(folderSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Magnifying Glass Swaying Inspection Motion
  const glassX = Math.sin(frame * 0.08) * 60;
  const glassY = Math.cos(frame * 0.06) * 40;
  const glassAngle = Math.sin(frame * 0.05) * 8;

  // 3. Red Rubber Stamp Slam Impact Animation
  const stampFrame = Math.max(0, frame - stampDelayFrames);
  const stampSpring = spring({
    frame: stampFrame,
    fps,
    config: theme.springs.stampImpact,
  });
  const stampScale = interpolate(stampSpring, [0, 1], [2.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampOpacity = interpolate(stampSpring, [0, 0.4, 1], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: 820,
        height: 640,
        transform: `translateY(${folderY}px) scale(${folderScale})`,
        opacity: folderOpacity,
        transformOrigin: "center center",
      }}
    >
      <svg
        viewBox="0 0 820 640"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          {/* Manila Paper Gradient & Shadow */}
          <linearGradient id="folderGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="60%" stopColor="#F5E4C3" />
            <stop offset="100%" stopColor="#E5CE9F" />
          </linearGradient>

          <filter id="folderShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000000" floodOpacity="0.6" />
          </filter>

          {/* Glass Lens Gradient */}
          <radialGradient id="lensReflect" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
            <stop offset="60%" stopColor="rgba(224, 242, 254, 0.25)" />
            <stop offset="100%" stopColor="rgba(186, 230, 253, 0.45)" />
          </radialGradient>
        </defs>

        {/* 1. MANILA FOLDER BASE WITH TOP TAB */}
        <g filter="url(#folderShadow)">
          {/* Top Folder Tab */}
          <path
            d="M 40 40 L 220 40 L 250 85 L 780 85 Q 800 85 800 105 L 800 580 Q 800 600 780 600 L 40 600 Q 20 600 20 580 L 20 60 Q 20 40 40 40 Z"
            fill="url(#folderGrad)"
            stroke="#CBB387"
            strokeWidth="3"
          />

          {/* Folder Tab Label */}
          <text
            x="130"
            y="70"
            textAnchor="middle"
            fill="#78592E"
            fontSize="26"
            fontWeight="900"
            fontFamily={theme.fonts.headline}
            letterSpacing="2"
          >
            {caseNumber}
          </text>

          {/* Paper Texture Crease Line */}
          <line x1="20" y1="85" x2="800" y2="85" stroke="#E0C99A" strokeWidth="2.5" />
        </g>

        {/* 2. INNER TYPEWRITER DOSSIER CONTENT */}
        <g transform="translate(60, 120)">
          {/* Row 1: BERKAS */}
          <text x="30" y="55" fill="#78592E" fontSize="32" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            BERKAS
          </text>
          <text x="260" y="55" fill="#1C1917" fontSize="32" fontWeight="700" fontFamily={theme.fonts.typewriter}>
            {berkasText}
          </text>

          {/* Row 2: TKP */}
          <text x="30" y="130" fill="#78592E" fontSize="32" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            TKP
          </text>
          <text x="260" y="130" fill="#1C1917" fontSize="32" fontWeight="700" fontFamily={theme.fonts.typewriter}>
            {tkpText}
          </text>

          {/* Row 3: TERSANGKA */}
          <text x="30" y="205" fill="#78592E" fontSize="32" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            TERSANGKA
          </text>
          <text x="260" y="205" fill="#1C1917" fontSize="32" fontWeight="700" fontFamily={theme.fonts.typewriter}>
            {tersangkaText}
          </text>

          {/* Row 4: PETUNJUK */}
          <text x="30" y="280" fill="#78592E" fontSize="32" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            PETUNJUK
          </text>
          <text x="260" y="280" fill="#1C1917" fontSize="32" fontWeight="700" fontFamily={theme.fonts.typewriter}>
            {petunjukText}
          </text>
        </g>

        {/* 3. RED RUBBER STAMP (e.g. "TANPA TRIK") */}
        {showStamp && frame >= stampDelayFrames && (
          <g
            transform={`translate(520, 440) scale(${stampScale}) rotate(-12)`}
            style={{ transformOrigin: "0px 0px" }}
            opacity={stampOpacity}
          >
            {/* Stamp Double Border Box */}
            <rect
              x="-180"
              y="-55"
              width="360"
              height="110"
              rx="8"
              fill="none"
              stroke={theme.colors.stampRed}
              strokeWidth="9"
              strokeDasharray="400 4"
            />
            <rect
              x="-170"
              y="-45"
              width="340"
              height="90"
              rx="4"
              fill="rgba(239, 68, 68, 0.08)"
              stroke={theme.colors.stampRed}
              strokeWidth="3.5"
            />
            {/* Stamp Text */}
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fill={theme.colors.stampRed}
              fontSize="56"
              fontWeight="900"
              fontFamily={theme.fonts.headline}
              letterSpacing="4"
            >
              {stampText}
            </text>
          </g>
        )}

        {/* 4. ANIMATED MAGNIFYING GLASS HOVERING */}
        <g
          transform={`translate(${520 + glassX}, ${320 + glassY}) rotate(${glassAngle})`}
          filter="url(#folderShadow)"
          style={{ transformOrigin: "0px 0px" }}
        >
          {/* Glass Lens Rim */}
          <circle cx="0" cy="0" r="95" fill="url(#lensReflect)" stroke="#334155" strokeWidth="12" />
          <circle cx="0" cy="0" r="88" fill="none" stroke="#64748B" strokeWidth="3" />

          {/* Wooden / Metallic Handle */}
          <rect
            x="70"
            y="55"
            width="28"
            height="130"
            rx="8"
            fill="#1E293B"
            stroke="#475569"
            strokeWidth="3"
            transform="rotate(-45 70 55)"
          />
          {/* Handle Brass Accent */}
          <rect
            x="68"
            y="55"
            width="32"
            height="20"
            rx="3"
            fill="#D97706"
            transform="rotate(-45 68 55)"
          />

          {/* Specular Glint on Lens */}
          <path
            d="M -50 -40 A 65 65 0 0 1 40 -50"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
};
