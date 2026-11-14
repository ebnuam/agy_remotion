import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface MacroObjectSceneProps {
  props?: string[];
  visualCue?: string;
  sceneLocalFrame: number;
  sceneDurationFrames: number;
  themeColor: string;
}

export const MacroObjectScene: React.FC<MacroObjectSceneProps> = ({
  props = [],
  visualCue = "",
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  // Determine what macro object to show
  const cue = (visualCue + " " + props.join(" ")).toLowerCase();

  const isClock = cue.includes("clock") || cue.includes("jam") || cue.includes("alarm");
  const isCalendar = cue.includes("calendar") || cue.includes("kalender") || cue.includes("deadline");
  const isPhone = cue.includes("phone") || cue.includes("hp") || cue.includes("medsos") || cue.includes("reels") || cue.includes("tiktok");

  // Entrance spring
  const entrance = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.65, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow continuous macro drift & camera breathe
  const cameraDrift = interpolate(sceneLocalFrame, [0, sceneDurationFrames], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Rapid alarm vibration for clock / phone
  const vibrate = (sceneLocalFrame % 6 < 3) ? Math.sin(sceneLocalFrame * 2.5) * 8 : 0;

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
            transform: `translate(${vibrate}px, 0px) scale(${scale * cameraDrift})`,
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
              const y2 = 340 - Math.cos(angle) * 210;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F8FAFC" strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" />;
            })}

            {/* Digital Panic Time: 23:58 */}
            <text x="340" y="270" textAnchor="middle" fill="#EF4444" fontSize="48" fontWeight="900" fontFamily="monospace">
              23:58
            </text>

            {/* Hour hand (pointing to 12) */}
            <line x1="340" y1="340" x2="330" y2="200" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" />
            {/* Minute hand (pointing to 58 min) */}
            <line x1="340" y1="340" x2="320" y2="150" stroke="#F8FAFC" strokeWidth="9" strokeLinecap="round" />
            {/* Rapid second hand ticking */}
            <g transform={`rotate(${(sceneLocalFrame * 18) % 360} 340 340)`}>
              <line x1="340" y1="380" x2="340" y2="140" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
              <circle cx="340" cy="340" r="14" fill="#EF4444" />
            </g>

            {/* Alert badge */}
            <rect x="200" y="440" width="280" height="60" rx="30" fill="#EF4444" />
            <text x="340" y="480" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="sans-serif">
              DEADLINE PANIK!
            </text>
          </svg>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MACRO OBJECT 2: GLOWING SMARTPHONE NOTIFICATION STORM         */}
      {/* ------------------------------------------------------------- */}
      {(isPhone || (!isClock && !isCalendar)) && (
        <div
          style={{
            transform: `translate(${vibrate}px, 0px) scale(${scale * cameraDrift})`,
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

            {/* Notification Pill: "5 Menit Aja Lagi" */}
            <g transform="translate(300, 620)">
              <rect x="-180" y="-40" width="360" height="80" rx="24" fill="#1E293B" stroke="#38BDF8" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#F8FAFC" fontSize="26" fontWeight="800">
                "Cuma scrolling 5 menit..."
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
      {/* MACRO OBJECT 3: CIRCLED CALENDAR WITH SKULL STAMP             */}
      {/* ------------------------------------------------------------- */}
      {isCalendar && (
        <div
          style={{
            transform: `scale(${scale * cameraDrift})`,
            transformOrigin: "center center",
          }}
        >
          <svg width="680" height="680" viewBox="0 0 680 680">
            {/* Calendar backing */}
            <rect x="40" y="40" width="600" height="600" rx="36" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="12" />
            {/* Red top bar */}
            <path d="M 40 40 L 640 40 L 640 160 L 40 160 Z" fill="#EF4444" />
            <text x="340" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="48" fontWeight="900">
              BULAN INI
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

            {/* Today: Blood Red Thick Marker Circle on 28 */}
            <ellipse cx="340" cy="370" rx="60" ry="50" fill="none" stroke="#EF4444" strokeWidth="14" strokeDasharray="280 20" />
            <text x="340" y="385" fill="#EF4444" fontSize="44" fontWeight="900" textAnchor="middle">
              HARI H
            </text>

            {/* Red Stamp: "TERLAMBAT!" */}
            <g transform="translate(340, 520) rotate(-12)">
              <rect x="-170" y="-35" width="340" height="70" rx="14" fill="#DC2626" stroke="#991B1B" strokeWidth="4" />
              <text x="0" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="900" letterSpacing="4">
                DEADLINE!
              </text>
            </g>
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
