import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticSubtitle } from "../../motion/KineticSubtitle";
import { theme } from "../../theme";

export const OddlyKnownScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sonar radar sweep rotating beam
  const radarAngle = (frame * 3.5) % 360;

  // Expanding acoustic sound waves from center anomaly
  const waveRadius1 = (frame * 5) % 350;
  const waveOpacity1 = interpolate(waveRadius1, [0, 250, 350], [0.9, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const waveRadius2 = ((frame * 5 + 175) % 350);
  const waveOpacity2 = interpolate(waveRadius2, [0, 250, 350], [0.9, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dynamic audio spectrogram waveform bars
  const waveformHeights = [20, 45, 80, 140, 95, 60, 110, 160, 120, 70, 40, 85, 130, 90, 50];

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712", overflow: "hidden" }}>
      <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <defs>
          {/* Deep Abyssal Ocean / Cosmic Cyan Radial Gradient */}
          <radialGradient id="abyssalGradient" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#0B1E38" />
            <stop offset="60%" stopColor="#030A16" />
            <stop offset="100%" stopColor="#020408" />
          </radialGradient>

          {/* Glowing Cyan Scanner Beam */}
          <linearGradient id="scannerBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </linearGradient>

          {/* Technical Grid Pattern */}
          <pattern id="techGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#00F0FF" strokeWidth="1" opacity="0.08" />
            <line x1="0" y1="0" x2="0" y2="60" stroke="#00F0FF" strokeWidth="1" opacity="0.08" />
          </pattern>

          <filter id="sonarGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Deep Abyssal Background with Technical HUD Grid */}
        <rect x="0" y="0" width="1080" height="1920" fill="url(#abyssalGradient)" />
        <rect x="0" y="0" width="1080" height="1920" fill="url(#techGrid)" />

        {/* 2. Top Header Tag: ODDLY KNOWN */}
        <g transform="translate(540, 240)">
          <rect x="-190" y="-24" width="380" height="48" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="#00F0FF" strokeWidth="2" />
          <circle cx="-160" cy="0" r="5" fill="#00F0FF" />
          <text x="0" y="8" textAnchor="middle" fill="#00F0FF" fontSize="20" fontWeight="900" fontFamily={theme.fonts.typewriter} letterSpacing="3">
            ODDLY KNOWN · SCIENCE ANOMALY
          </text>
        </g>

        {/* 3. Main Sci-Fi Headline */}
        <text x="540" y="375" textAnchor="middle" fill="#FFFFFF" fontSize="76" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="3">
          THE BLOOP ANOMALY
        </text>
        <text x="540" y="455" textAnchor="middle" fill="#38BDF8" fontSize="42" fontWeight="800" fontFamily={theme.fonts.typewriter} letterSpacing="2">
          MYSTERY OF THE DEEP OCEAN
        </text>

        {/* 4. TELEMETRY HUD DATA READOUTS */}
        <g transform="translate(140, 560)">
          <text x="0" y="0" fill="#94A3B8" fontSize="20" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            HYDROPHONE SENSOR: NOAA-50S
          </text>
          <text x="0" y="32" fill="#00F0FF" fontSize="20" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            DEPTH: -4,500 METERS
          </text>
          <text x="0" y="64" fill="#F43F5E" fontSize="20" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            SIGNAL STRENGTH: MAXIMUM
          </text>
        </g>

        {/* 5. CENTERPIECE: ACOUSTIC RADAR & EXPANDING SONAR BLIP */}
        <g transform="translate(540, 920)">
          {/* Circular Radar Grids */}
          <circle cx="0" cy="0" r="300" fill="none" stroke="#00F0FF" strokeWidth="2.5" opacity="0.4" />
          <circle cx="0" cy="0" r="220" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.3" strokeDasharray="8 6" />
          <circle cx="0" cy="0" r="140" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.4" />
          <circle cx="0" cy="0" r="60" fill="none" stroke="#00F0FF" strokeWidth="2.5" opacity="0.5" />

          {/* Crosshairs */}
          <line x1="-320" y1="0" x2="320" y2="0" stroke="#00F0FF" strokeWidth="1.5" opacity="0.3" />
          <line x1="0" y1="-320" x2="0" y2="320" stroke="#00F0FF" strokeWidth="1.5" opacity="0.3" />

          {/* Expanding Acoustic Wave Rings */}
          <circle cx="0" cy="0" r={waveRadius1} fill="none" stroke="#00F0FF" strokeWidth="3.5" opacity={waveOpacity1} />
          <circle cx="0" cy="0" r={waveRadius2} fill="none" stroke="#00F0FF" strokeWidth="3.5" opacity={waveOpacity2} />

          {/* Rotating Sonar Radar Beam */}
          <g transform={`rotate(${radarAngle})`}>
            <polygon points="0,0 300,-80 300,0" fill="url(#scannerBeam)" />
            <line x1="0" y1="0" x2="300" y2="0" stroke="#00F0FF" strokeWidth="3" filter="url(#sonarGlow)" />
          </g>

          {/* Center Origin Anomaly Blip */}
          <circle cx="0" cy="0" r="16" fill="#F43F5E" filter="url(#sonarGlow)" />
          <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
        </g>

        {/* 6. DYNAMIC AUDIO FREQUENCY SPECTROGRAM (LOWER SECTION) */}
        <g transform="translate(240, 1340)">
          <rect x="-20" y="-30" width="640" height="180" rx="10" fill="rgba(15, 23, 42, 0.7)" stroke="#334155" strokeWidth="2" />
          <text x="10" y="-10" fill="#94A3B8" fontSize="18" fontWeight="800" fontFamily={theme.fonts.typewriter}>
            SPECTROGRAM: ULTRA-LOW FREQUENCY 52Hz
          </text>
          {waveformHeights.map((h, i) => {
            const dynamicH = h + Math.sin(frame * 0.4 + i) * 25;
            return (
              <g key={`bar-${i}`} transform={`translate(${i * 40 + 20}, 120)`}>
                <rect
                  x="0"
                  y={-dynamicH}
                  width="22"
                  height={dynamicH}
                  rx="4"
                  fill="#00F0FF"
                  opacity={0.85}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Subtitle Narasi */}
      <KineticSubtitle
        text="In 1997, oceanic microphones recorded an ultra-low frequency sound louder than any known creature."
        startFrame={0}
        durationFrames={150}
      />
    </AbsoluteFill>
  );
};
