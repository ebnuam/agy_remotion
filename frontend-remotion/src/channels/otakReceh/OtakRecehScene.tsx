import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticSubtitle } from "../../motion/KineticSubtitle";
import { theme } from "../../theme";

export const OtakRecehScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy entrance for Brain character
  const brainSpring = spring({
    frame,
    fps,
    config: theme.springs.bouncy,
  });
  const brainScale = interpolate(brainSpring, [0, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brainY = Math.sin(frame * 0.1) * 12; // Playful floating bounce

  // Smartphone vibration buzz
  const phoneVibrate = (frame % 8 < 4) ? Math.sin(frame * 2.5) * 6 : 0;

  // Dopamine lightning spark pulse
  const sparkScale = 0.9 + Math.sin(frame * 0.3) * 0.15;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F172A", overflow: "hidden" }}>
      <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <defs>
          {/* Playful Orange-Cyan Pop Gradient */}
          <radialGradient id="popBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0A0F1D" />
          </radialGradient>

          {/* Comic Halftone Dots Pattern */}
          <pattern id="halftoneDots" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="3" fill="#FFFFFF" opacity="0.08" />
          </pattern>

          {/* Brain 3D Glow Filter */}
          <filter id="brainGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#FF7A00" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Background with Pop Art Halftone */}
        <rect x="0" y="0" width="1080" height="1920" fill="url(#popBg)" />
        <rect x="0" y="0" width="1080" height="1920" fill="url(#halftoneDots)" />

        {/* 2. Top Header Tag */}
        <g transform="translate(540, 240)">
          <rect x="-180" y="-24" width="360" height="48" rx="24" fill="#06B6D4" stroke="#22D3EE" strokeWidth="2.5" />
          <text x="0" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
            OTAK RECEH · PSIKOLOGI HARIAN
          </text>
        </g>

        {/* 3. Main Kinetic Headline */}
        <text x="540" y="380" textAnchor="middle" fill="#FFFFFF" fontSize="76" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
          KENAPA KITA SUKA
        </text>
        <text x="540" y="465" textAnchor="middle" fill="#FACC15" fontSize="80" fontWeight="900" fontFamily={theme.fonts.headline} letterSpacing="2">
          NUNDA PEKERJAAN?
        </text>

        {/* 4. CENTERPIECE: Animated Cartoon Brain with Sunglasses */}
        <g
          transform={`translate(540, ${820 + brainY}) scale(${brainScale}) translate(-540, -820)`}
          filter="url(#brainGlow)"
          style={{ transformOrigin: "540px 820px" }}
        >
          {/* Idea Lightbulb on top of brain */}
          <g transform="translate(540, 610)">
            <circle cx="0" cy="0" r="38" fill="#FACC15" />
            <polygon points="-8,35 8,35 5,48 -5,48" fill="#94A3B8" />
            {/* Idea Rays */}
            <line x1="0" y1="-50" x2="0" y2="-65" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
            <line x1="38" y1="-38" x2="52" y2="-52" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
            <line x1="-38" y1="-38" x2="-52" y2="-52" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
          </g>

          {/* Brain Main Left & Right Lobes */}
          {/* Left Lobe */}
          <path
            d="M 440 820 C 350 820, 350 720, 420 680 C 370 630, 450 580, 520 620 C 530 620, 540 680, 540 820 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="8"
          />
          {/* Right Lobe */}
          <path
            d="M 640 820 C 730 820, 730 720, 660 680 C 710 630, 630 580, 560 620 C 550 620, 540 680, 540 820 Z"
            fill="#FB7185"
            stroke="#E11D48"
            strokeWidth="8"
          />
          {/* Brain folds & sulci lines */}
          <path d="M 430 720 Q 470 700 480 750 Q 510 740 520 780" stroke="#E11D48" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 650 720 Q 610 700 600 750 Q 570 740 560 780" stroke="#E11D48" strokeWidth="6" fill="none" strokeLinecap="round" />

          {/* Cool Sunglasses */}
          <g transform="translate(540, 725)">
            <path d="M -90 -15 L -20 -15 L -25 30 L -85 30 Z" fill="#0F172A" stroke="#000000" strokeWidth="4" />
            <path d="M 20 -15 L 90 -15 L 85 30 L 25 30 Z" fill="#0F172A" stroke="#000000" strokeWidth="4" />
            <line x1="-20" y1="-5" x2="20" y2="-5" stroke="#000000" strokeWidth="6" />
            {/* White reflection shine on glasses */}
            <line x1="-80" y1="20" x2="-40" y2="-5" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            <line x1="30" y1="20" x2="70" y2="-5" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Smug Happy Smile */}
          <path d="M 505 780 Q 540 810 575 780" stroke="#881337" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>

        {/* 5. BUZZING SMARTPHONE ON THE RIGHT */}
        <g transform={`translate(${820 + phoneVibrate}, 880) rotate(15)`}>
          <rect x="-50" y="-80" width="100" height="160" rx="14" fill="#1E293B" stroke="#06B6D4" strokeWidth="4" />
          <rect x="-42" y="-70" width="84" height="140" rx="8" fill="#38BDF8" opacity="0.9" />
          {/* Notification Badge +99 */}
          <circle cx="38" cy="-65" r="24" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
          <text x="38" y="-58" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            +99
          </text>
        </g>

        {/* 6. DOPAMINE BATTERY METER ON THE LEFT */}
        <g transform="translate(200, 880) rotate(-10)">
          <rect x="-45" y="-75" width="90" height="150" rx="12" fill="#1E293B" stroke="#22C55E" strokeWidth="4" />
          <rect x="-18" y="-90" width="36" height="15" rx="4" fill="#22C55E" />
          {/* Green Battery Bars Filling Up */}
          <rect x="-35" y="15" width="70" height="45" rx="6" fill="#22C55E" />
          <rect x="-35" y="-35" width="70" height="40" rx="6" fill="#FACC15" />
          {/* Lightning Bolt */}
          <polygon points="0,-25 15,0 0,0 8,25 -15,0 0,0" fill="#FFFFFF" transform={`scale(${sparkScale})`} />
          <text x="0" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            DOPAMIN
          </text>
        </g>
      </svg>

      {/* Subtitle Narasi */}
      <KineticSubtitle
        text="Otak emosional kita manja, maunya dopamin instan detik ini juga ketimbang mikir capek!"
        startFrame={0}
        durationFrames={150}
      />
    </AbsoluteFill>
  );
};
