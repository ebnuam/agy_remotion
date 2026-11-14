import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface VisualMetaphorSceneProps {
  headlineLine1?: string;
  headlineLine2?: string;
  visualIntent?: string;
  props?: string[];
  objects?: string[];
  text?: string;
  cameraMotion?: string;
  sceneLocalFrame: number;
  sceneDurationFrames: number;
  themeColor: string;
}

export const VisualMetaphorScene: React.FC<VisualMetaphorSceneProps> = ({
  headlineLine1 = "",
  headlineLine2 = "",
  visualIntent = "",
  props = [],
  objects = [],
  text = "",
  cameraMotion = "shake_punch",
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  // Combine contextual signals from storyboard
  const cue = (visualIntent + " " + props.join(" ") + " " + objects.join(" ") + " " + text).toLowerCase();

  const isScale = cue.includes("timbang") || cue.includes("scale") || cue.includes("dilema");
  const isBrain = cue.includes("brain") || cue.includes("otak") || cue.includes("limbik") || cue.includes("amigdala");
  const isCurve = cue.includes("grafik") || cue.includes("curve") || cue.includes("kurva");

  // Dynamic labels from storyboard
  const labelMain = (headlineLine2 || headlineLine1 || "METAFORA PSIKOLOGI").toUpperCase();
  const labelSub1 = (headlineLine1 || "TUGAS UTAMA").toUpperCase();
  const labelSub2 = (headlineLine2 || "DOPAMIN INSTAN").toUpperCase();

  const entrance = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating idle motion
  const idleY = Math.sin(sceneLocalFrame * 0.1) * 10;

  // Dopamine charging animation
  const chargeProgress = interpolate(sceneLocalFrame, [0, Math.min(sceneDurationFrames, 60)], [0.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sparkScale = 0.9 + Math.sin(sceneLocalFrame * 0.3) * 0.2;

  // Scale tipping angle
  const scaleAngle = interpolate(sceneLocalFrame, [0, 30], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0F19",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${themeColor}38 0%, #0B0F19 75%)`,
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* METAPHOR 1: DILEMMA SCALE WITH DYNAMIC STORYBOARD LABELS      */}
      {/* ------------------------------------------------------------- */}
      {isScale && (
        <div style={{ transform: `scale(${scale}) translateY(${idleY}px)`, transformOrigin: "center center" }}>
          <svg width="700" height="700" viewBox="0 0 700 700">
            {/* Base */}
            <path d="M 280 620 L 420 620 L 370 480 L 330 480 Z" fill="#334155" />
            <rect x="240" y="620" width="220" height="30" rx="10" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
            <circle cx="350" cy="240" r="28" fill="#FACC15" stroke="#CA8A04" strokeWidth="6" />

            {/* Pivot Beam */}
            <g transform={`rotate(${scaleAngle} 350 240)`}>
              <rect x="100" y="232" width="500" height="16" rx="8" fill="#E2E8F0" stroke="#475569" strokeWidth="4" />

              {/* Left Pan: Sisi 1 (Tipping UP, Diabaikan) */}
              <line x1="160" y1="240" x2="160" y2="380" stroke="#94A3B8" strokeWidth="4" />
              <path d="M 70 380 Q 160 440 250 380 Z" fill="#475569" stroke="#64748B" strokeWidth="4" />
              <text x="160" y="360" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800">
                {labelSub1.slice(0, 18)}
              </text>
              <rect x="120" y="320" width="80" height="36" rx="8" fill="#EF4444" opacity="0.8" />
              <text x="160" y="345" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">
                0%
              </text>

              {/* Right Pan: Sisi 2 (Tipping DOWN, Berat/Dipilih) */}
              <line x1="540" y1="240" x2="540" y2="380" stroke="#94A3B8" strokeWidth="4" />
              <path d="M 450 380 Q 540 440 630 380 Z" fill="#0284C7" stroke="#38BDF8" strokeWidth="4" />
              <text x="540" y="360" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800">
                {labelSub2.slice(0, 18)}
              </text>
              <rect x="490" y="310" width="100" height="46" rx="10" fill="#22C55E" />
              <text x="540" y="342" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">
                100%
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* METAPHOR 2: COOL CARTOON BRAIN WITH DYNAMIC SPEECH BUBBLE     */}
      {/* ------------------------------------------------------------- */}
      {isBrain && !isScale && (
        <div style={{ transform: `scale(${scale}) translateY(${idleY}px)`, transformOrigin: "center center" }}>
          <svg width="680" height="680" viewBox="0 0 680 680">
            <defs>
              <filter id="brainGlow3" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#FF7A00" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Dynamic Speech Bubble on top */}
            <g transform="translate(340, 80)">
              <rect x="-180" y="-35" width="360" height="70" rx="20" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
              <polygon points="-10,35 10,35 0,55" fill="#FFFFFF" />
              <text x="0" y="10" textAnchor="middle" fill="#0F172A" fontSize="22" fontWeight="900">
                "{labelMain.slice(0, 24)}"
              </text>
            </g>

            {/* Left Lobe */}
            <path
              d="M 240 400 C 130 400, 130 280, 220 220 C 160 160, 260 100, 340 150 C 350 150, 350 220, 340 400 Z"
              fill="#FB7185"
              stroke="#E11D48"
              strokeWidth="10"
              filter="url(#brainGlow3)"
            />
            {/* Right Lobe */}
            <path
              d="M 440 400 C 550 400, 550 280, 460 220 C 520 160, 420 100, 340 150 C 330 150, 330 220, 340 400 Z"
              fill="#FB7185"
              stroke="#E11D48"
              strokeWidth="10"
              filter="url(#brainGlow3)"
            />

            {/* Brain folds */}
            <path d="M 230 280 Q 280 250 290 310" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 450 280 Q 400 250 390 310" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />

            {/* Sunglasses */}
            <g transform="translate(340, 280)">
              <path d="M -110 -20 L -25 -20 L -30 35 L -105 35 Z" fill="#0F172A" stroke="#000000" strokeWidth="6" />
              <path d="M 25 -20 L 110 -20 L 105 35 L 30 35 Z" fill="#0F172A" stroke="#000000" strokeWidth="6" />
              <line x1="-25" y1="-8" x2="25" y2="-8" stroke="#000000" strokeWidth="8" />
              <line x1="-95" y1="20" x2="-55" y2="-8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
              <line x1="45" y1="20" x2="85" y2="-8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
            </g>

            {/* Smug Happy Smile */}
            <path d="M 300 345 Q 340 380 380 345" stroke="#881337" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Boba Drink Cup in Hand */}
            <g transform="translate(480, 350) rotate(15)">
              <path d="M 0 0 L 20 80 L 70 80 L 90 0 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="4" />
              <rect x="-5" y="-12" width="100" height="15" rx="6" fill="#F97316" />
              <line x1="45" y1="-30" x2="45" y2="70" stroke="#7C2D12" strokeWidth="8" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* METAPHOR 3: HIGH VOLTAGE DOPAMINE SURGE (Default psychology)  */}
      {/* ------------------------------------------------------------- */}
      {!isScale && !isBrain && (
        <div style={{ transform: `scale(${scale}) translateY(${idleY}px)`, transformOrigin: "center center" }}>
          <svg width="600" height="750" viewBox="0 0 600 750">
            <defs>
              <filter id="dopamineGlow2" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="20" stdDeviation="30" floodColor="#22C55E" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Battery Body */}
            <rect x="150" y="120" width="300" height="500" rx="36" fill="#1E293B" stroke="#22C55E" strokeWidth="12" filter="url(#dopamineGlow2)" />
            {/* Battery Terminal Pin */}
            <rect x="235" y="70" width="130" height="50" rx="14" fill="#22C55E" />

            {/* Charge Levels */}
            <rect
              x="170"
              y={600 - chargeProgress * 450}
              width="260"
              height={chargeProgress * 450}
              rx="24"
              fill="#22C55E"
              opacity="0.85"
            />

            {/* Big Lightning Spark */}
            <g transform="translate(300, 370)">
              <polygon
                points="0,-80 50,0 0,0 30,80 -50,0 0,0"
                fill="#FACC15"
                stroke="#FFFFFF"
                strokeWidth="4"
                transform={`scale(${sparkScale * 1.5})`}
              />
            </g>

            {/* Percentage Display */}
            <text x="300" y="550" textAnchor="middle" fill="#FFFFFF" fontSize="56" fontWeight="900" fontFamily="sans-serif">
              {Math.round(chargeProgress * 100)}%
            </text>
            <text x="300" y="670" textAnchor="middle" fill="#22C55E" fontSize="30" fontWeight="900" letterSpacing="3">
              {labelMain.slice(0, 22)}
            </text>
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
