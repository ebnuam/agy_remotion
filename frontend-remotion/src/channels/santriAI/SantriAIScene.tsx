import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticSubtitle } from "../../motion/KineticSubtitle";
import { theme } from "../../theme";

export const SantriAIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Majestic slow rotation of the brass Astrolabe
  const astrolabeRotation = (frame * 0.4) % 360;

  // Gentle floating hover of the ancient illuminated manuscript
  const bookHoverY = Math.sin(frame * 0.06) * 8;

  // Candlelight flame flicker inside the golden Qandil lantern
  const flameFlicker = 0.9 + Math.sin(frame * 0.3) * 0.1;

  // Golden dust particles drifting softly
  const dustParticles = [...Array(20)].map((_, i) => {
    const x = ((i * 123.4 + frame * 0.4) % 1080);
    const y = 1920 - ((frame * (0.6 + (i % 3) * 0.2) + i * 90) % 2000);
    const opacity = 0.2 + (Math.sin(frame * 0.05 + i) * 0.2 + 0.2);
    return { x, y, opacity };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#022C22", overflow: "hidden" }}>
      <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <defs>
          {/* Majestic Islamic Emerald to Deep Night Gradient */}
          <radialGradient id="islamicEmerald" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="60%" stopColor="#022C22" />
            <stop offset="100%" stopColor="#011812" />
          </radialGradient>

          {/* Golden Illumination Glow */}
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#D97706" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Gold Metallic Gradients */}
          <linearGradient id="goldMetallic" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Parchment Manuscript Paper */}
          <linearGradient id="parchment" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FBF4E2" />
            <stop offset="50%" stopColor="#F3E5C8" />
            <stop offset="100%" stopColor="#FBF4E2" />
          </linearGradient>

          <filter id="manuscriptShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="24" stdDeviation="20" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Emerald Background */}
        <rect x="0" y="0" width="1080" height="1920" fill="url(#islamicEmerald)" />

        {/* 2. Islamic 8-Point Geometric Arabesque Lattice Pattern */}
        <g opacity="0.12">
          {[...Array(6)].map((_, row) =>
            [...Array(4)].map((_, col) => {
              const cx = col * 300 + 75;
              const cy = row * 340 + 80;
              return (
                <g key={`arabesque-${row}-${col}`} transform={`translate(${cx}, ${cy})`}>
                  <rect x="-60" y="-60" width="120" height="120" fill="none" stroke="#FDE68A" strokeWidth="2.5" />
                  <rect x="-60" y="-60" width="120" height="120" fill="none" stroke="#FDE68A" strokeWidth="2.5" transform="rotate(45)" />
                  <circle cx="0" cy="0" r="45" fill="none" stroke="#FDE68A" strokeWidth="2" />
                </g>
              );
            })
          )}
        </g>

        {/* 3. Golden Dust Motes */}
        {dustParticles.map((d, i) => (
          <circle key={`dust-${i}`} cx={d.x} cy={d.y} r="2.5" fill="#FDE68A" opacity={d.opacity} />
        ))}

        {/* 4. Top Tag: SANTRI AI */}
        <g transform="translate(540, 240)">
          <rect x="-190" y="-24" width="380" height="48" rx="24" fill="rgba(6, 78, 59, 0.85)" stroke="#D97706" strokeWidth="2.5" />
          <text x="0" y="8" textAnchor="middle" fill="#FDE68A" fontSize="22" fontWeight="800" fontFamily="Georgia, serif" letterSpacing="3">
            SANTRI AI · SEJARAH & PERADABAN
          </text>
        </g>

        {/* 5. Main Majestic Headline */}
        <text x="540" y="380" textAnchor="middle" fill="#FFFFFF" fontSize="72" fontWeight="900" fontFamily="Georgia, serif" letterSpacing="3">
          BAITUL HIKMAH
        </text>
        <text x="540" y="460" textAnchor="middle" fill="#FDE68A" fontSize="48" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="2">
          PERPUSTAKAAN TERBESAR DUNIA
        </text>

        {/* 6. ROTATING BRASS ASTROLABE (BACKGROUND OF MANUSCRIPT) */}
        <g transform={`translate(540, 850) rotate(${astrolabeRotation})`} opacity="0.35">
          <circle cx="0" cy="0" r="280" fill="none" stroke="url(#goldMetallic)" strokeWidth="6" />
          <circle cx="0" cy="0" r="240" fill="none" stroke="url(#goldMetallic)" strokeWidth="3" />
          {[...Array(12)].map((_, i) => (
            <line
              key={`ast-line-${i}`}
              x1="0"
              y1="-280"
              x2="0"
              y2="280"
              stroke="url(#goldMetallic)"
              strokeWidth="2"
              transform={`rotate(${i * 30})`}
            />
          ))}
          <circle cx="0" cy="0" r="140" fill="none" stroke="url(#goldMetallic)" strokeWidth="4" />
        </g>

        {/* 7. CENTERPIECE: OPEN ANCIENT ILLUMINATED MANUSCRIPT */}
        <g
          transform={`translate(540, ${850 + bookHoverY}) translate(-540, -850)`}
          filter="url(#manuscriptShadow)"
        >
          {/* Golden Glow Behind Book */}
          <circle cx="540" cy="850" r="320" fill="url(#goldGlow)" />

          {/* Left Page */}
          <path
            d="M 540 980 C 440 990, 240 960, 180 940 L 200 680 C 260 700, 440 720, 540 710 Z"
            fill="url(#parchment)"
            stroke="#D97706"
            strokeWidth="3.5"
          />
          {/* Right Page */}
          <path
            d="M 540 980 C 640 990, 840 960, 900 940 L 880 680 C 820 700, 640 720, 540 710 Z"
            fill="url(#parchment)"
            stroke="#D97706"
            strokeWidth="3.5"
          />

          {/* Ornate Gold Filigree Borders on Pages */}
          <rect x="230" y="715" width="260" height="200" rx="4" fill="none" stroke="#D97706" strokeWidth="2" opacity="0.6" strokeDasharray="6 3" />
          <rect x="590" y="715" width="260" height="200" rx="4" fill="none" stroke="#D97706" strokeWidth="2" opacity="0.6" strokeDasharray="6 3" />

          {/* Calligraphic Script Lines */}
          {[...Array(6)].map((_, i) => (
            <line key={`callig-l-${i}`} x1="260" y1={750 + i * 26} x2="460" y2={750 + i * 26} stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`callig-r-${i}`} x1="620" y1={750 + i * 26} x2="820" y2={750 + i * 26} stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
          ))}

          {/* Book Spine Center Crease & Red Silk Bookmark Ribbon */}
          <line x1="540" y1="710" x2="540" y2="980" stroke="#78350F" strokeWidth="6" />
          <path d="M 540 710 Q 560 840 550 1020 L 535 990 L 520 1020 Q 530 840 540 710" fill="#DC2626" />
        </g>

        {/* 8. HANGING GOLDEN QANDIL LANTERN ON TOP RIGHT */}
        <g transform="translate(860, 280)">
          <line x1="0" y1="-280" x2="0" y2="0" stroke="url(#goldMetallic)" strokeWidth="3.5" />
          {/* Lantern Dome */}
          <path d="M -40 0 C -40 -30, 40 -30, 40 0 L 35 60 C 25 100, -25 100, -35 60 Z" fill="none" stroke="url(#goldMetallic)" strokeWidth="4" />
          {/* Flame Halo */}
          <ellipse cx="0" cy="40" rx="28" ry="38" fill="#FDE68A" opacity={flameFlicker * 0.5} />
          {/* Candle Flame */}
          <path d="M 0 20 Q -8 38 0 48 Q 8 38 0 20" fill="#F59E0B" />
        </g>
      </svg>

      {/* Subtitle Narasi */}
      <KineticSubtitle
        text="Di era keemasan Islam, ribuan ilmuwan berkumpul menyalin jutaan ilmu pengetahuan dunia."
        startFrame={0}
        durationFrames={150}
      />
    </AbsoluteFill>
  );
};
