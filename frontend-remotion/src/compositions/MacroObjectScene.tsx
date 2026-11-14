import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface MacroObjectSceneProps {
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

export const MacroObjectScene: React.FC<MacroObjectSceneProps> = ({
  headlineLine1 = "",
  headlineLine2 = "",
  visualIntent = "",
  props = [],
  objects = [],
  text = "",
  cameraMotion = "zoom_punch",
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  // Combine contextual signals from storyboard
  const cue = (visualIntent + " " + props.join(" ") + " " + objects.join(" ") + " " + text).toLowerCase();

  const isClock = cue.includes("clock") || cue.includes("jam") || cue.includes("alarm");
  const isCalendar = cue.includes("calendar") || cue.includes("kalender") || cue.includes("deadline");
  const isPhone = cue.includes("phone") || cue.includes("hp") || cue.includes("medsos") || cue.includes("reels") || cue.includes("tiktok");
  const isCoffee = cue.includes("kopi") || cue.includes("coffee") || cue.includes("kafe");

  // Dynamic banner text derived from storyboard
  const dynamicTag = (headlineLine2 || headlineLine1 || "INSPEKSI OBJEK").toUpperCase();
  const dynamicSub = (headlineLine1 || "FOKUS UTAMA").toUpperCase();

  // Camera motion dynamics
  const entrance = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  let zoomStart = 0.85;
  let zoomEnd = 1.08;
  const cm = cameraMotion.toLowerCase();
  if (cm.includes("pull")) {
    zoomStart = 1.22;
    zoomEnd = 1.02;
  } else if (cm.includes("shake")) {
    zoomStart = 1.0;
    zoomEnd = 1.12;
  }

  const cameraScale = interpolate(
    sceneLocalFrame,
    [0, Math.max(1, sceneDurationFrames)],
    [zoomStart, zoomEnd],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const entranceScale = interpolate(entrance, [0, 1], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera shake intensity
  const shakeIntensity = cm.includes("shake") || isClock ? 6 : 0;
  const shakeX = shakeIntensity > 0 && sceneLocalFrame % 6 < 3 ? Math.sin(sceneLocalFrame * 2.5) * shakeIntensity : 0;

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
      {/* Background radial spotlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${themeColor}33 0%, #0B0F19 75%)`,
        }}
      />

      {/* Floating particles */}
      <svg
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {[...Array(12)].map((_, i) => {
          const y = (sceneLocalFrame * (1.5 + i * 0.3) + i * 150) % 1920;
          return (
            <circle
              key={i}
              cx={120 + i * 75}
              cy={1920 - y}
              r={3 + (i % 3)}
              fill={themeColor}
              opacity={0.35}
            />
          );
        })}
      </svg>

      {/* ------------------------------------------------------------- */}
      {/* MACRO OBJECT 1: TICKING ALARM CLOCK AT 23:58 PM               */}
      {/* ------------------------------------------------------------- */}
      {isClock && (
        <div
          style={{
            transform: `translate(${shakeX}px, 0px) scale(${entranceScale * cameraScale})`,
            transformOrigin: "center center",
          }}
        >
          <svg width="680" height="680" viewBox="0 0 680 680">
            <defs>
              <filter id="clockGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="20" stdDeviation="25" floodColor="#EF4444" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Alarm bells */}
            <circle cx="170" cy="120" r="75" fill="#EF4444" stroke="#B91C1C" strokeWidth="8" />
            <circle cx="510" cy="120" r="75" fill="#EF4444" stroke="#B91C1C" strokeWidth="8" />
            <rect x="330" y="70" width="20" height="60" rx="10" fill="#94A3B8" />

            {/* Clock body */}
            <circle cx="340" cy="340" r="260" fill="#1E293B" stroke="#EF4444" strokeWidth="18" filter="url(#clockGlow)" />
            <circle cx="340" cy="340" r="230" fill="#0F172A" stroke="#334155" strokeWidth="6" />

            {/* Hour marks */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 340 + Math.sin(angle) * 190;
              const y1 = 340 - Math.cos(angle) * 190;
              const x2 = 340 + Math.sin(angle) * 210;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={340 - Math.cos(angle) * 210} stroke="#F8FAFC" strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" />;
            })}

            {/* Digital Panic Time: 23:58 */}
            <text x="340" y="270" textAnchor="middle" fill="#EF4444" fontSize="48" fontWeight="900" fontFamily="monospace">
              23:58
            </text>

            {/* Hour hand */}
            <line x1="340" y1="340" x2="330" y2="200" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" />
            {/* Minute hand */}
            <line x1="340" y1="340" x2="320" y2="150" stroke="#F8FAFC" strokeWidth="9" strokeLinecap="round" />
            {/* Rapid second hand ticking */}
            <g transform={`rotate(${(sceneLocalFrame * 18) % 360} 340 340)`}>
              <line x1="340" y1="380" x2="340" y2="140" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
              <circle cx="340" cy="340" r="14" fill="#EF4444" />
            </g>

            {/* Dynamic Alert badge */}
            <rect x="160" y="440" width="360" height="64" rx="32" fill="#EF4444" />
            <text x="340" y="482" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="sans-serif">
              {dynamicTag.slice(0, 24)}
            </text>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MACRO OBJECT 2: GLOWING SMARTPHONE NOTIFICATION STORM         */}
      {/* ------------------------------------------------------------- */}
      {(isPhone || (!isClock && !isCalendar && !isCoffee)) && (
        <div
          style={{
            transform: `translate(${shakeX}px, 0px) scale(${entranceScale * cameraScale})`,
            transformOrigin: "center center",
          }}
        >
          <svg width="600" height="900" viewBox="0 0 600 900">
            <defs>
              <filter id="phoneGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="25" stdDeviation="30" floodColor="#38BDF8" floodOpacity="0.5" />
              </filter>
              <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>

            {/* Phone chassis */}
            <rect x="60" y="40" width="480" height="820" rx="55" fill="#020617" stroke="#38BDF8" strokeWidth="8" filter="url(#phoneGlow)" />
            {/* Screen */}
            <rect x="80" y="65" width="440" height="770" rx="42" fill="url(#screenGrad)" />

            {/* Dynamic notch */}
            <rect x="230" y="78" width="140" height="30" rx="15" fill="#000000" />

            {/* Video Feed / TikTok Mockup */}
            <rect x="100" y="130" width="400" height="420" rx="24" fill="#3B82F6" opacity="0.3" />
            <circle cx="300" cy="340" r="50" fill="#FFFFFF" opacity="0.8" />
            <polygon points="288,315 288,365 328,340" fill="#1E293B" />

            {/* Popping +99 Badge */}
            <g transform="translate(420, 120)">
              <rect x="-40" y="-30" width="100" height="60" rx="30" fill="#EF4444" stroke="#FFFFFF" strokeWidth="4" />
              <text x="10" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="900">
                +99
              </text>
            </g>

            {/* Dynamic Notification Pill derived from storyboard */}
            <g transform="translate(300, 620)">
              <rect x="-200" y="-40" width="400" height="80" rx="24" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#F8FAFC" fontSize="24" fontWeight="800">
                "{dynamicTag.slice(0, 26)}"
              </text>
            </g>

            {/* Floating Heart Particles */}
            <text x="440" y="320" fontSize="42">❤️</text>
            <text x="460" y="240" fontSize="36">🔥</text>
            <text x="430" y="180" fontSize="32">😂</text>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MACRO OBJECT 3: CIRCLED CALENDAR WITH DEADLINE STAMP          */}
      {/* ------------------------------------------------------------- */}
      {isCalendar && (
        <div
          style={{
            transform: `scale(${entranceScale * cameraScale})`,
            transformOrigin: "center center",
          }}
        >
          <svg width="680" height="680" viewBox="0 0 680 680">
            {/* Calendar backing */}
            <rect x="40" y="40" width="600" height="600" rx="36" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="12" />
            {/* Red top bar */}
            <path d="M 40 40 L 640 40 L 640 160 L 40 160 Z" fill="#EF4444" />
            <text x="340" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="44" fontWeight="900">
              {dynamicSub.slice(0, 20)}
            </text>

            {/* Grid numbers */}
            <g fill="#334155" fontSize="32" fontWeight="700" textAnchor="middle">
              <text x="140" y="250">21</text>
              <text x="240" y="250">22</text>
              <text x="340" y="250">23</text>
              <text x="440" y="250">24</text>
              <text x="540" y="250">25</text>

              <text x="140" y="380">26</text>
              <text x="240" y="380">27</text>
              <text x="340" y="380">28</text>
              <text x="440" y="380">29</text>
              <text x="540" y="380">30</text>
            </g>

            {/* Today: Blood Red Marker Circle */}
            <ellipse cx="340" cy="370" rx="65" ry="52" fill="none" stroke="#EF4444" strokeWidth="14" strokeDasharray="280 20" />
            <text x="340" y="385" fill="#EF4444" fontSize="40" fontWeight="900" textAnchor="middle">
              HARI H
            </text>

            {/* Dynamic Stamp derived from headline */}
            <g transform="translate(340, 520) rotate(-10)">
              <rect x="-190" y="-35" width="380" height="70" rx="14" fill="#DC2626" stroke="#991B1B" strokeWidth="4" />
              <text x="0" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="900" letterSpacing="2">
                {dynamicTag.slice(0, 22)}
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MACRO OBJECT 4: STEAMING COFFEE CUP OF ENERGY                */}
      {/* ------------------------------------------------------------- */}
      {isCoffee && (
        <div
          style={{
            transform: `scale(${entranceScale * cameraScale})`,
            transformOrigin: "center center",
          }}
        >
          <svg width="680" height="680" viewBox="0 0 680 680">
            {/* Saucer */}
            <ellipse cx="340" cy="540" rx="260" ry="40" fill="#334155" stroke="#64748B" strokeWidth="8" />
            {/* Cup Body */}
            <path d="M 160 260 L 200 480 Q 340 520 480 480 L 520 260 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="12" />
            {/* Cup Handle */}
            <path d="M 500 290 C 600 290, 600 440, 480 440" stroke="#EF4444" strokeWidth="22" strokeLinecap="round" fill="none" />
            {/* Coffee Liquid */}
            <ellipse cx="340" cy="260" rx="180" ry="36" fill="#3E2723" stroke="#5D4037" strokeWidth="6" />

            {/* Animated Steam lines */}
            <g opacity="0.65">
              <path
                d={`M 280 220 Q ${260 + Math.sin(sceneLocalFrame * 0.15) * 20} 140 280 70`}
                stroke="#FFFFFF"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M 340 210 Q ${360 + Math.cos(sceneLocalFrame * 0.18) * 20} 120 340 50`}
                stroke="#FFFFFF"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M 400 220 Q ${380 + Math.sin(sceneLocalFrame * 0.12) * 20} 140 400 70`}
                stroke="#FFFFFF"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Dynamic Label Badge */}
            <rect x="200" y="350" width="280" height="54" rx="27" fill="#FFFFFF" opacity="0.9" />
            <text x="340" y="386" textAnchor="middle" fill="#0F172A" fontSize="26" fontWeight="900">
              {dynamicTag.slice(0, 20)}
            </text>
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
