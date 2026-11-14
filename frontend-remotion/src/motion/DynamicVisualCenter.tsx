import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface DynamicVisualCenterProps {
  cue: string;
  objects?: string[];
  text?: string;
  sceneIndex?: number;
  channelId?: string;
  themeColor: string;
  sceneLocalFrame: number;
}

export const DynamicVisualCenter: React.FC<DynamicVisualCenterProps> = ({
  cue,
  objects = [],
  text = "",
  sceneIndex = 1,
  channelId = "otak-receh",
  themeColor,
  sceneLocalFrame,
}) => {
  const { fps } = useVideoConfig();

  // Entrance spring animation per scene
  const enterSpring = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const enterScale = interpolate(enterSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterY = interpolate(enterSpring, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Floating continuous idle animation
  const floatY = Math.sin(sceneLocalFrame * 0.08) * 10;
  const pulseScale = 1 + Math.sin(sceneLocalFrame * 0.15) * 0.04;

  // Combine cue, objects, and text into a search context
  const fullContext = (
    cue + " " + objects.join(" ") + " " + text
  ).toLowerCase();

  // Determine Visual Scene Type
  // Santri AI Scenes
  const isElephantClock = fullContext.includes("gajah") || fullContext.includes("jam_gajah") || fullContext.includes("elephant");
  const isCrankshaft = fullContext.includes("crankshaft") || fullContext.includes("poros") || fullContext.includes("engkol") || fullContext.includes("mesin");
  const isAstrolabe = fullContext.includes("astrolabe") || fullContext.includes("bintang") || fullContext.includes("kubah");
  const isMechanicalBook = fullContext.includes("kitab") || fullContext.includes("hiyal") || fullContext.includes("roda_gigi") || fullContext.includes("buku");
  const isParchmentScroll = fullContext.includes("perkamen") || fullContext.includes("gulungan") || fullContext.includes("manuskrip") || (channelId === "santri-ai" && sceneIndex === 1);

  // Oddly Known Scenes
  const isWhaleAnomaly = fullContext.includes("paus") || fullContext.includes("whale") || fullContext.includes("makhluk");
  const isSpectrogram = fullContext.includes("spectrogram") || fullContext.includes("52 hz") || fullContext.includes("frekuensi") || fullContext.includes("equalizer");
  const isSonarRadar = fullContext.includes("radar") || fullContext.includes("sonar") || fullContext.includes("samudra") || fullContext.includes("kedalaman");

  // Otak Receh Scenes
  const isSleepOrBed = fullContext.includes("tidur") || fullContext.includes("sleep") || fullContext.includes("bed") || fullContext.includes("kamar") || fullContext.includes("malam");
  const isMemoryOrCringe = fullContext.includes("memory") || fullContext.includes("cringe") || fullContext.includes("memalu") || fullContext.includes("proyektor") || fullContext.includes("flashback");
  const isEvolutionOrSurvival = fullContext.includes("evolusi") || fullContext.includes("survival") || fullContext.includes("shield") || fullContext.includes("purba") || fullContext.includes("amigdala");
  const isScrolling = fullContext.includes("scroll") || fullContext.includes("smartphone") || fullContext.includes("hp") || fullContext.includes("medsos");
  const isLazy = fullContext.includes("lazy") || fullContext.includes("malas") || fullContext.includes("rebahan") || fullContext.includes("sofa");
  const isPanic = fullContext.includes("panic") || fullContext.includes("darurat") || fullContext.includes("bahaya") || fullContext.includes("panik") || fullContext.includes("alarm");

  // Everyday Life, Finance, and Mystery Case Scenes
  const isMoneyOrWealth = fullContext.includes("sultan") || fullContext.includes("gaji") || fullContext.includes("uang") || fullContext.includes("kaya") || fullContext.includes("money") || fullContext.includes("rupiah");
  const isWalletEmpty = fullContext.includes("dompet") || fullContext.includes("miskin") || fullContext.includes("gembel") || fullContext.includes("bokek") || fullContext.includes("kering") || fullContext.includes("habis");
  const isCoffeeOrCafe = fullContext.includes("kopi") || fullContext.includes("kafe") || fullContext.includes("coffee") || fullContext.includes("estetik") || fullContext.includes("creamy");
  const isShopping = fullContext.includes("belanja") || fullContext.includes("checkout") || fullContext.includes("paket") || fullContext.includes("e-commerce") || fullContext.includes("keranjang") || fullContext.includes("paylater");
  const isPolaroidCase = fullContext.includes("polaroid") || fullContext.includes("tersangka") || fullContext.includes("kasus") || fullContext.includes("pelaku") || fullContext.includes("alibi") || fullContext.includes("sidik");
  const isCalendarDeadline = fullContext.includes("kalender") || fullContext.includes("tanggal") || fullContext.includes("waktu") || fullContext.includes("cepat") || fullContext.includes("tahun");
  const isVersusComparison = fullContext.includes("vs") || fullContext.includes("banding") || fullContext.includes("timbangan") || fullContext.includes("dulu") || fullContext.includes("sekarang");

  return (
    <div
      style={{
        position: "absolute",
        top: 480,
        left: 0,
        right: 0,
        bottom: 340,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
        pointerEvents: "none",
        transform: `translateY(${enterY + floatY}px) scale(${enterScale})`,
        opacity: enterOpacity,
      }}
    >
      <svg
        viewBox="0 0 800 800"
        style={{
          width: 760,
          height: 760,
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="centerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor={themeColor} floodOpacity="0.5" />
          </filter>
          <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0B1120" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ============================================================== */}
        {/* SANTRI AI 1: THE ELEPHANT CLOCK (JAM GAJAH AL-JAZARI) */}
        {/* ============================================================== */}
        {isElephantClock && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="340" fill="url(#goldGlow)" />
            {/* Clock Tower Pavilion on Back of Elephant */}
            <g transform="translate(0, -90)">
              {/* Domed Castle Pavilion */}
              <rect x="-80" y="-120" width="160" height="120" rx="14" fill="#78350F" stroke="#FDE68A" strokeWidth="5" filter="url(#centerGlow)" />
              {/* Islamic Dome */}
              <path d="M -80 -120 Q 0 -210 80 -120 Z" fill="#D97706" stroke="#FEF3C7" strokeWidth="5" />
              <line x1="0" y1="-210" x2="0" y2="-240" stroke="#FDE68A" strokeWidth="4" />
              <circle cx="0" cy="-240" r="8" fill="#FDE68A" />

              {/* Mechanical Falcon / Dragon in Window */}
              <circle cx="0" cy="-60" r="28" fill="#1E293B" stroke="#F59E0B" strokeWidth="3" />
              {/* Rotating Gear inside clock */}
              <circle cx="0" cy="-60" r="18" fill="none" stroke="#FDE68A" strokeWidth="4" strokeDasharray="6 4" transform={`rotate(${sceneLocalFrame * 3})`} />
            </g>

            {/* Giant Mechanical Elephant Base */}
            <g transform="translate(0, 90)">
              {/* Elephant Body */}
              <ellipse cx="0" cy="0" rx="190" ry="120" fill="#475569" stroke="#94A3B8" strokeWidth="8" filter="url(#centerGlow)" />
              {/* Head & Big Ears */}
              <circle cx="-160" cy="-40" r="80" fill="#475569" stroke="#94A3B8" strokeWidth="7" />
              <ellipse cx="-130" cy="-60" rx="45" ry="65" fill="#334155" stroke="#94A3B8" strokeWidth="5" />
              {/* Curved Trunk */}
              <path d="M -220 -20 Q -280 20 -250 80 Q -220 120 -260 140" stroke="#94A3B8" strokeWidth="22" strokeLinecap="round" fill="none" />
              {/* Golden Tusk */}
              <path d="M -200 10 Q -240 30 -220 60" stroke="#FDE047" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Mechanical Gears on Elephant Flank */}
              <g transform="translate(30, -10)">
                <circle cx="0" cy="0" r="45" fill="#B45309" stroke="#FDE68A" strokeWidth="5" />
                <line x1="-40" y1="0" x2="40" y2="0" stroke="#FEF3C7" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 4})`} />
                <line x1="0" y1="-40" x2="0" y2="40" stroke="#FEF3C7" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 4})`} />
              </g>
              {/* Sturdy Legs */}
              <rect x="-140" y="80" width="50" height="110" rx="16" fill="#334155" stroke="#94A3B8" strokeWidth="6" />
              <rect x="-60" y="80" width="50" height="110" rx="16" fill="#334155" stroke="#94A3B8" strokeWidth="6" />
              <rect x="40" y="80" width="50" height="110" rx="16" fill="#334155" stroke="#94A3B8" strokeWidth="6" />
              <rect x="110" y="80" width="50" height="110" rx="16" fill="#334155" stroke="#94A3B8" strokeWidth="6" />
            </g>

            {/* Tag Badge */}
            <g transform="translate(0, 240)">
              <rect x="-120" y="-20" width="240" height="40" rx="10" fill="#78350F" stroke="#FDE68A" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                JAM GAJAH AL-JAZARI
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* SANTRI AI 2: CRANKSHAFT & ENGINE MECHANISM */}
        {/* ============================================================== */}
        {isCrankshaft && !isElephantClock && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="320" fill="url(#goldGlow)" />
            {/* Blueprint Grid Lines */}
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            <line x1="0" y1="-300" x2="0" y2="300" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />

            {/* Rotating Mechanical Flywheel */}
            <g transform={`translate(-120, 0) rotate(${sceneLocalFrame * 5})`}>
              <circle cx="0" cy="0" r="140" fill="#1E293B" stroke="#D97706" strokeWidth="12" filter="url(#centerGlow)" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="#FDE68A" strokeWidth="4" />
              <circle cx="0" cy="0" r="30" fill="#78350F" stroke="#FDE68A" strokeWidth="6" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line key={`spoke-${deg}`} x1="0" y1="0" x2="130" y2="0" stroke="#F59E0B" strokeWidth="6" transform={`rotate(${deg})`} />
              ))}
              {/* Crankpin Offset Point */}
              <circle cx="70" cy="0" r="18" fill="#EF4444" stroke="#FFFFFF" strokeWidth="4" />
            </g>

            {/* Connecting Rod (Connecting Crank to Linear Piston) */}
            <g transform={`translate(${Math.cos(sceneLocalFrame * 0.087) * 40 + 80}, 0)`}>
              {/* Piston Cylinder Housing */}
              <rect x="20" y="-80" width="160" height="160" rx="12" fill="#0F172A" stroke="#10B981" strokeWidth="6" filter="url(#centerGlow)" />
              {/* Moving Piston Head */}
              <rect x={40 + Math.sin(sceneLocalFrame * 0.087) * 30} y="-60" width="80" height="120" rx="8" fill="#10B981" stroke="#34D399" strokeWidth="5" />
              {/* Connecting Rod Link */}
              <line x1="-120" y1="0" x2={40 + Math.sin(sceneLocalFrame * 0.087) * 30} y2="0" stroke="#FDE68A" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* Glowing Tag */}
            <g transform="translate(0, 220)">
              <rect x="-140" y="-22" width="280" height="44" rx="12" fill="#064E3B" stroke="#10B981" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                POROS ENGKOL (CRANKSHAFT)
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* SANTRI AI 3: CELESTIAL ASTROLABE (ASTRONOMI & BINTANG) */}
        {/* ============================================================== */}
        {isAstrolabe && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            {/* Night Sky Radial with Mosque Silhouette */}
            <circle cx="0" cy="0" r="320" fill="url(#goldGlow)" />
            {/* Mosque Minarets in Silhouette at Bottom */}
            <g transform="translate(0, 220)" opacity="0.7">
              <path d="M -180 0 L -180 -120 Q -150 -180 -120 -120 L -120 0 Z" fill="#064E3B" />
              <path d="M 120 0 L 120 -120 Q 150 -180 180 -120 L 180 0 Z" fill="#064E3B" />
              <path d="M -80 0 Q 0 -100 80 0 Z" fill="#064E3B" />
            </g>

            {/* Giant Rotating Golden Astrolabe Ring */}
            <g transform={`rotate(${sceneLocalFrame * 1.5})`}>
              {/* Outer Mater & Limb */}
              <circle cx="0" cy="0" r="230" fill="#0B132B" stroke="#D97706" strokeWidth="14" filter="url(#centerGlow)" />
              <circle cx="0" cy="0" r="210" fill="none" stroke="#FDE68A" strokeWidth="3" strokeDasharray="4 4" />

              {/* Rete Pattern (Intricate Zodiac & Star Pointers) */}
              <circle cx="0" cy="0" r="160" fill="none" stroke="#F59E0B" strokeWidth="6" />
              <circle cx="40" cy="-40" r="90" fill="none" stroke="#FDE68A" strokeWidth="4" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <polygon key={`star-${deg}`} points="0,-160 10,-185 -10,-185" fill="#FEF08A" transform={`rotate(${deg})`} />
              ))}

              {/* Rotating Alidade (Sighting Rule) */}
              <line x1="-220" y1="0" x2="220" y2="0" stroke="#FDE68A" strokeWidth="10" strokeLinecap="round" transform={`rotate(${-sceneLocalFrame * 3})`} />
              <circle cx="0" cy="0" r="28" fill="#78350F" stroke="#FDE68A" strokeWidth="5" />
            </g>

            {/* Top Throne Ring for Suspension */}
            <g transform="translate(0, -250)">
              <circle cx="0" cy="0" r="28" fill="none" stroke="#FDE68A" strokeWidth="8" />
              <polygon points="-30,28 30,28 15,45 -15,45" fill="#D97706" />
            </g>

            <g transform="translate(0, 220)">
              <rect x="-110" y="-20" width="220" height="40" rx="10" fill="#78350F" stroke="#FDE68A" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                ASTROLABE KUNINGAN
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* SANTRI AI 4: KITAB AL-HIYAL (MANUSKRIP DENGAN RODA GIGI AIR) */}
        {/* ============================================================== */}
        {isMechanicalBook && !isElephantClock && !isCrankshaft && !isAstrolabe && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="320" fill="url(#goldGlow)" />

            {/* Open Classical Manuscript Book */}
            <g transform="translate(0, 20)">
              {/* Left Page */}
              <path d="M 0 120 Q -180 140 -240 100 L -240 -160 Q -180 -140 0 -160 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="7" filter="url(#centerGlow)" />
              {/* Right Page */}
              <path d="M 0 120 Q 180 140 240 100 L 240 -160 Q 180 -140 0 -160 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="7" filter="url(#centerGlow)" />
              {/* Spine */}
              <line x1="0" y1="-165" x2="0" y2="125" stroke="#78350F" strokeWidth="8" />

              {/* Calligraphy on Left Page */}
              {[-120, -80, -40, 0, 40, 80].map((yLine, i) => (
                <line key={`line-${i}`} x1="-210" y1={yLine} x2="-30" y2={yLine} stroke="#78350F" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
              ))}

              {/* Animated Technical Hydraulic Gear Drawing on Right Page */}
              <g transform="translate(120, -30)">
                <circle cx="0" cy="0" r="65" fill="#D97706" stroke="#78350F" strokeWidth="5" />
                <circle cx="0" cy="0" r="35" fill="#FEF3C7" stroke="#78350F" strokeWidth="4" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <rect key={`cog-${deg}`} x="-8" y="-75" width="16" height="15" rx="3" fill="#B45309" transform={`rotate(${deg + sceneLocalFrame * 3})`} />
                ))}
                {/* Water Drops */}
                <path d="M -20 90 Q 0 60 20 90 Q 0 115 -20 90" fill="#38BDF8" transform={`translate(0, ${(sceneLocalFrame * 2) % 30})`} />
              </g>
            </g>

            <g transform="translate(0, 220)">
              <rect x="-110" y="-20" width="220" height="40" rx="10" fill="#78350F" stroke="#FDE68A" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">
                KITAB AL-HIYAL
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* SANTRI AI 5: PARCHMENT SCROLL WITH GOLDEN QUILL */}
        {/* ============================================================== */}
        {isParchmentScroll && !isElephantClock && !isCrankshaft && !isAstrolabe && !isMechanicalBook && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="300" fill="#10B981" opacity="0.15" filter="url(#centerGlow)" />

            <g transform="rotate(-4)">
              <rect x="-190" y="-230" width="380" height="460" rx="20" fill="#FDE68A" stroke="#D97706" strokeWidth="8" filter="url(#centerGlow)" />
              <rect x="-165" y="-205" width="330" height="410" rx="12" fill="none" stroke="#B45309" strokeWidth="3" strokeDasharray="8 6" />

              {[-130, -80, -30, 20, 70, 120].map((yLine, i) => (
                <g key={`callig-${i}`}>
                  <path
                    d={`M -130 ${yLine} Q -60 ${yLine - 10} 0 ${yLine} Q 70 ${yLine + 10} 130 ${yLine}`}
                    stroke="#78350F"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <circle cx={-40 + i * 25} cy={yLine - 16} r="4" fill="#B45309" />
                </g>
              ))}

              <g transform="translate(0, -165)">
                <circle cx="0" cy="0" r="26" fill="#10B981" stroke="#FDE047" strokeWidth="3" />
                <polygon points="0,-18 12,-6 18,6 6,18 -6,18 -18,6 -12,-6" fill="#FDE047" />
              </g>
            </g>

            {/* Golden Writing Quill */}
            <g transform={`translate(${140 + Math.sin(sceneLocalFrame * 0.15) * 15}, ${40 + Math.cos(sceneLocalFrame * 0.15) * 20}) rotate(35)`}>
              <path d="M 0 -160 C 25 -100, 20 20, 0 100 C -20 20, -25 -100, 0 -160 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />
              <line x1="0" y1="-160" x2="0" y2="100" stroke="#78350F" strokeWidth="3" />
            </g>

            {/* Qandil Lantern on Left */}
            <g transform={`translate(-220, -100) rotate(${Math.sin(sceneLocalFrame * 0.08) * 8})`}>
              <line x1="0" y1="-80" x2="0" y2="0" stroke="#F59E0B" strokeWidth="4" />
              <polygon points="-30,0 30,0 45,60 -45,60" fill="#D97706" stroke="#FDE68A" strokeWidth="3" />
              <rect x="-40" y="60" width="80" height="70" fill="rgba(253, 230, 138, 0.4)" stroke="#D97706" strokeWidth="3" />
              <path d="M 0 110 Q 15 90 0 75 Q -15 90 0 110" fill="#F59E0B" filter="url(#centerGlow)" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ODDLY KNOWN 1: 52 HERTZ LONELY WHALE IN DEEP OCEAN */}
        {/* ============================================================== */}
        {isWhaleAnomaly && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="320" fill="#031525" stroke="#06B6D4" strokeWidth="6" filter="url(#centerGlow)" />
            {/* Concentric Sonar Soundwaves Emitting from Whale */}
            {[100, 160, 220, 280].map((r, i) => (
              <circle
                key={`sonar-wave-${i}`}
                cx="-40"
                cy="0"
                r={((r + sceneLocalFrame * 2) % 280) + 40}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="2.5"
                opacity={1 - (((r + sceneLocalFrame * 2) % 280) / 280)}
              />
            ))}

            {/* Majestic 52Hz Whale Silhouette Floating */}
            <g transform={`translate(0, ${Math.sin(sceneLocalFrame * 0.06) * 15})`}>
              {/* Whale Body */}
              <path
                d="M -220 20 C -140 -80, 80 -80, 200 0 C 120 80, -100 80, -220 20 Z"
                fill="#0284C7"
                stroke="#38BDF8"
                strokeWidth="8"
                filter="url(#centerGlow)"
              />
              {/* Fluke / Tail Fin */}
              <path d="M 190 0 Q 250 -50 260 -70 Q 220 0 260 70 Q 240 50 190 0" fill="#0284C7" stroke="#38BDF8" strokeWidth="6" />
              {/* Pectoral Fin */}
              <ellipse cx="-40" cy="40" rx="60" ry="22" fill="#0369A1" stroke="#38BDF8" strokeWidth="4" transform="rotate(25)" />
              {/* Whale Eye */}
              <circle cx="-160" cy="-10" r="8" fill="#F8FAFC" />
              <circle cx="-160" cy="-10" r="4" fill="#0F172A" />
            </g>

            {/* Telemetry HUD Tag */}
            <g transform="translate(0, 210)">
              <rect x="-140" y="-20" width="280" height="40" rx="10" fill="rgba(6,182,212,0.2)" stroke="#22D3EE" strokeWidth="2.5" />
              <text x="0" y="6" textAnchor="middle" fill="#67E8F9" fontSize="16" fontWeight="900" fontFamily="monospace">
                PAUS 52 HZ · SAMUDRA LUAS
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ODDLY KNOWN 2: FREQUENCY SPECTROGRAM */}
        {/* ============================================================== */}
        {isSpectrogram && !isWhaleAnomaly && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="300" fill="#031525" stroke="#06B6D4" strokeWidth="6" filter="url(#centerGlow)" />
            {/* Spectrogram Grid */}
            <rect x="-240" y="-180" width="480" height="320" rx="16" fill="#051C33" stroke="#0891B2" strokeWidth="3" />
            {/* Equalizer Frequency Bars */}
            {[-200, -160, -120, -80, -40, 0, 40, 80, 120, 160, 200].map((xBar, i) => {
              const barH = 30 + Math.abs(Math.sin(sceneLocalFrame * 0.25 + i * 0.7)) * 140;
              return (
                <rect
                  key={`eq-bar-${i}`}
                  x={xBar - 14}
                  y={100 - barH}
                  width="28"
                  height={barH}
                  rx="6"
                  fill={i === 5 ? "#F43F5E" : "#22D3EE"}
                  filter="url(#centerGlow)"
                />
              );
            })}
            {/* Peak 52 Hz Marker */}
            <g transform="translate(0, -120)">
              <polygon points="0,0 -15,-25 15,-25" fill="#F43F5E" />
              <text x="0" y="-35" textAnchor="middle" fill="#F43F5E" fontSize="20" fontWeight="900" fontFamily="monospace">
                PEAK: 52 HZ
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* ODDLY KNOWN 3: SONAR RADAR */}
        {/* ============================================================== */}
        {isSonarRadar && !isWhaleAnomaly && !isSpectrogram && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="280" fill="#031525" stroke="#06B6D4" strokeWidth="6" filter="url(#centerGlow)" />
            <circle cx="0" cy="0" r="200" fill="none" stroke="#0891B2" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="0" cy="0" r="120" fill="none" stroke="#0891B2" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="40" fill="none" stroke="#22D3EE" strokeWidth="3" />
            <line x1="-280" y1="0" x2="280" y2="0" stroke="#0E7490" strokeWidth="2" />
            <line x1="0" y1="-280" x2="0" y2="280" stroke="#0E7490" strokeWidth="2" />

            {/* Rotating Sonar Beam Sweep */}
            <g transform={`rotate(${sceneLocalFrame * 4})`}>
              <polygon points="0,0 280,-80 280,0" fill="#22D3EE" opacity="0.35" />
              <line x1="0" y1="0" x2="280" y2="0" stroke="#67E8F9" strokeWidth="4" />
            </g>

            {/* Target Blip */}
            <g transform="translate(130, -110)">
              <circle cx="0" cy="0" r="14" fill="#F43F5E" filter="url(#centerGlow)" />
              <circle cx="0" cy="0" r="28" fill="none" stroke="#F43F5E" strokeWidth="3" opacity={Math.sin(sceneLocalFrame * 0.3) * 0.5 + 0.5} />
              <text x="25" y="8" fill="#F43F5E" fontSize="18" fontWeight="900" fontFamily="monospace">
                DEPTH: 4,000 M
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 1: BEDROOM / SLEEP / INSOMNIA */}
        {/* ============================================================== */}
        {isSleepOrBed && !isMemoryOrCringe && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="340" fill="url(#phoneGlow)" opacity="0.4" />

            {/* Window with Crescent Moon */}
            <g transform="translate(180, -180)">
              <rect x="-60" y="-60" width="120" height="120" rx="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />
              <line x1="0" y1="-60" x2="0" y2="60" stroke="#38BDF8" strokeWidth="3" />
              <line x1="-60" y1="0" x2="60" y2="0" stroke="#38BDF8" strokeWidth="3" />
              <path d="M 10 -25 C 25 -25 35 -15 35 5 C 35 25 15 35 -5 30 C 15 25 20 5 10 -25 Z" fill="#FACC15" />
            </g>

            {/* Bed Headboard */}
            <rect x="-240" y="-40" width="480" height="200" rx="20" fill="#1E293B" stroke="#334155" strokeWidth="6" />
            <ellipse cx="0" cy="0" rx="150" ry="60" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="4" />

            {/* Insomniac Character with Staring Eyes */}
            <g transform="translate(0, -30)">
              <circle cx="0" cy="0" r="75" fill="#FB7185" stroke="#E11D48" strokeWidth="8" filter="url(#centerGlow)" />
              <circle cx="-28" cy="-10" r="22" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
              <circle cx="-28" cy="-10" r="8" fill="#0F172A" />
              <circle cx="28" cy="-10" r="22" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
              <circle cx="28" cy="-10" r="8" fill="#0F172A" />
              <line x1="-20" y1="35" x2="20" y2="35" stroke="#881337" strokeWidth="6" strokeLinecap="round" />
              <path d="M 45 -40 Q 60 -25 45 -10 Q 35 -25 45 -40" fill="#38BDF8" />
            </g>

            {/* Cozy Blanket */}
            <path d="M -240 60 Q 0 40 240 60 L 240 180 L -240 180 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="6" />

            {/* Glowing Bedside Clock */}
            <g transform="translate(-160, 160)">
              <rect x="-70" y="-35" width="140" height="70" rx="14" fill="#020617" stroke="#EF4444" strokeWidth="4" filter="url(#centerGlow)" />
              <text x="0" y="10" textAnchor="middle" fill="#EF4444" fontSize="28" fontWeight="900" fontFamily="monospace">
                02{(sceneLocalFrame % 30 < 15) ? ":" : " "}14
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 2: CRINGE MEMORY PROJECTOR */}
        {/* ============================================================== */}
        {isMemoryOrCringe && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <polygon
              points="60,-40 360,-160 360,80"
              fill="#FDE047"
              opacity={(sceneLocalFrame % 6 < 3 ? 0.35 : 0.25)}
            />

            <g transform="translate(-100, 20)">
              <rect x="-90" y="-60" width="180" height="120" rx="16" fill="#1E293B" stroke="#475569" strokeWidth="6" />
              <polygon points="90,-30 140,-45 140,15 90,0" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />

              <g transform="translate(-50, -110)">
                <circle cx="0" cy="0" r="45" fill="#334155" stroke="#94A3B8" strokeWidth="5" />
                <line x1="-40" y1="0" x2="40" y2="0" stroke="#94A3B8" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 6})`} />
                <line x1="0" y1="-40" x2="0" y2="40" stroke="#94A3B8" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 6})`} />
              </g>
              <g transform="translate(40, -110)">
                <circle cx="0" cy="0" r="45" fill="#334155" stroke="#94A3B8" strokeWidth="5" />
                <line x1="-40" y1="0" x2="40" y2="0" stroke="#94A3B8" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 6})`} />
                <line x1="0" y1="-40" x2="0" y2="40" stroke="#94A3B8" strokeWidth="4" transform={`rotate(${sceneLocalFrame * 6})`} />
              </g>
            </g>

            {/* Screen */}
            <g transform={`translate(240, -40) scale(${pulseScale})`}>
              <rect x="-100" y="-80" width="200" height="160" rx="12" fill="#FEF08A" stroke="#CA8A04" strokeWidth="6" filter="url(#centerGlow)" />
              <text x="0" y="-40" textAnchor="middle" fill="#854D0E" fontSize="18" fontWeight="900" fontFamily="sans-serif">
                MEMORI MEMALUKAN
              </text>
              <text x="0" y="-10" textAnchor="middle" fill="#DC2626" fontSize="32" fontWeight="900" fontFamily="sans-serif">
                CRINGE!!
              </text>
              <circle cx="0" cy="25" r="14" fill="#000000" />
              <line x1="0" y1="39" x2="0" y2="60" stroke="#000000" strokeWidth="3" />
              <line x1="0" y1="45" x2="25" y2="30" stroke="#000000" strokeWidth="3" />
            </g>

            {/* Blushing Brain */}
            <g transform="translate(-180, 160)">
              <circle cx="0" cy="0" r="70" fill="#FB7185" stroke="#E11D48" strokeWidth="6" filter="url(#centerGlow)" />
              <circle cx="-35" cy="10" r="14" fill="#F43F5E" opacity="0.6" />
              <circle cx="35" cy="10" r="14" fill="#F43F5E" opacity="0.6" />
              <path d="M -35 -10 L -20 0 L -35 10" stroke="#000000" strokeWidth="4" fill="none" />
              <path d="M 35 -10 L 20 0 L 35 10" stroke="#000000" strokeWidth="4" fill="none" />
              <ellipse cx="20" cy="-10" rx="18" ry="26" fill="#FBBF24" stroke="#D97706" strokeWidth="3" transform="rotate(20)" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 3: EVOLUTION SURVIVAL SHIELD */}
        {/* ============================================================== */}
        {isEvolutionOrSurvival && !isMemoryOrCringe && !isSleepOrBed && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="300" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="10 8" />
            <circle cx="0" cy="0" r="220" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 6" />

            <g transform={`scale(${pulseScale})`}>
              <path
                d="M -130 50 C -220 50, -220 -80, -130 -120 C -180 -180, -80 -220, 0 -170 C 80 -220, 180 -180, 130 -120 C 220 -80, 220 50, 130 50 Z"
                fill="#FB7185"
                stroke="#E11D48"
                strokeWidth="10"
                filter="url(#centerGlow)"
              />
              <circle cx="-40" cy="-30" r="18" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
              <circle cx="-35" cy="-30" r="8" fill="#000000" />
              <circle cx="40" cy="-30" r="18" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
              <circle cx="45" cy="-30" r="8" fill="#000000" />
              <line x1="-120" y1="-70" x2="120" y2="-70" stroke="#D97706" strokeWidth="12" />
            </g>

            <g transform="translate(180, 40)">
              <path
                d="M 0 -120 L 70 -60 L 60 70 L 0 120 L -60 70 L -70 -60 Z"
                fill="#F59E0B"
                stroke="#FEF3C7"
                strokeWidth="8"
                filter="url(#centerGlow)"
              />
              <path d="M 0 -90 L 45 -45 L 35 50 L 0 85 L -35 50 L -45 -45 Z" fill="#D97706" />
              <text x="0" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="900" fontFamily="sans-serif">
                🛡️
              </text>
            </g>

            <g transform="translate(-180, 20) rotate(-25)">
              <polygon points="-20,80 20,80 30,-80 -30,-80" fill="#78350F" stroke="#451A03" strokeWidth="6" />
              <circle cx="0" cy="-80" r="35" fill="#78350F" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 4: SCROLLING SMARTPHONE */}
        {/* ============================================================== */}
        {isScrolling && !isSleepOrBed && !isMemoryOrCringe && !isEvolutionOrSurvival && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <circle cx="0" cy="0" r="320" fill="url(#phoneGlow)" />

            <g transform={`translate(${Math.sin(sceneLocalFrame * 0.1) * 15 + 180}, ${-180 + Math.cos(sceneLocalFrame * 0.1) * 10})`}>
              <rect x="-60" y="-30" width="120" height="60" rx="30" fill="#EF4444" filter="url(#centerGlow)" />
              <text x="0" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="sans-serif">
                🔔 +99
              </text>
            </g>

            <g transform={`translate(${-200 + Math.sin(sceneLocalFrame * 0.12) * 10}, ${-100 + Math.cos(sceneLocalFrame * 0.08) * 15})`}>
              <rect x="-70" y="-30" width="140" height="60" rx="30" fill="#EC4899" filter="url(#centerGlow)" />
              <text x="0" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="900" fontFamily="sans-serif">
                ❤️ 1.2k
              </text>
            </g>

            <g transform="rotate(-6)">
              <rect x="-160" y="-280" width="320" height="560" rx="44" fill="#0F172A" stroke="#38BDF8" strokeWidth="8" filter="url(#centerGlow)" />
              <rect x="-140" y="-240" width="280" height="480" rx="24" fill="#1E293B" />
              <rect x="-50" y="-240" width="100" height="20" rx="10" fill="#0F172A" />

              <g>
                {[-120, 0, 120].map((yOffset, i) => {
                  const cardY = ((sceneLocalFrame * 3 + i * 140) % 420) - 180;
                  return (
                    <g key={`feed-${i}`} transform={`translate(0, ${cardY})`}>
                      <rect x="-115" y="-50" width="230" height="100" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(56,189,248,0.4)" strokeWidth="2" />
                      <circle cx="-75" cy="0" r="24" fill="#38BDF8" />
                      <rect x="-35" y="-18" width="120" height="14" rx="7" fill="#FFFFFF" opacity="0.8" />
                      <rect x="-35" y="6" width="80" height="10" rx="5" fill="#94A3B8" />
                    </g>
                  );
                })}
              </g>

              <g transform={`translate(${Math.sin(sceneLocalFrame * 0.2) * 20 + 80}, ${120 + Math.cos(sceneLocalFrame * 0.2) * 40})`}>
                <ellipse cx="0" cy="0" rx="36" ry="70" fill="#FBBF24" stroke="#D97706" strokeWidth="6" transform="rotate(-25)" />
              </g>
            </g>

            <g transform="translate(240, 160)">
              <circle cx="0" cy="0" r="60" fill="#1E293B" stroke="#F59E0B" strokeWidth="6" />
              <line x1="0" y1="0" x2="0" y2="-35" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" transform={`rotate(${sceneLocalFrame * 8})`} />
              <line x1="0" y1="0" x2="25" y2="0" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" transform={`rotate(${sceneLocalFrame * 2})`} />
              <circle cx="0" cy="0" r="8" fill="#F59E0B" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 5: LAZY COUCH REBAHAN */}
        {/* ============================================================== */}
        {isLazy && !isSleepOrBed && !isMemoryOrCringe && !isEvolutionOrSurvival && !isScrolling && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <path d="M -260 140 Q -260 40 -180 40 L 180 40 Q 260 40 260 140 L 280 200 L -280 200 Z" fill="#334155" stroke="#475569" strokeWidth="8" />

            <g transform="translate(0, 0) rotate(15)">
              <path
                d="M -120 40 C -180 40, -180 -60, -120 -80 C -160 -140, -60 -180, 0 -130 C 60 -180, 160 -140, 120 -80 C 180 -60, 180 40, 120 40 Z"
                fill="#FB7185"
                stroke="#E11D48"
                strokeWidth="10"
                filter="url(#centerGlow)"
              />
              <path d="M -60 -40 Q 0 -20 60 -40" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M -40 10 Q 0 30 40 10" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />

              <g transform="translate(0, -35)">
                <path d="M -75 -15 L -15 -15 L -20 25 L -70 25 Z" fill="#0F172A" stroke="#000000" strokeWidth="5" />
                <path d="M 15 -15 L 75 -15 L 70 25 L 20 25 Z" fill="#0F172A" stroke="#000000" strokeWidth="5" />
                <line x1="-15" y1="-5" x2="15" y2="-5" stroke="#000000" strokeWidth="6" />
                <line x1="-65" y1="15" x2="-35" y2="-5" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                <line x1="25" y1="15" x2="55" y2="-5" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
              </g>

              <path d="M -25 25 Q 0 45 25 25" stroke="#881337" strokeWidth="6" fill="none" strokeLinecap="round" />
            </g>

            <g transform="translate(-220, 80)">
              <rect x="-35" y="-30" width="70" height="60" rx="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="4" />
              <path d="M 35 -15 Q 55 -15 55 0 Q 55 15 35 15" stroke="#E2E8F0" strokeWidth="6" fill="none" />
              <path d={`M -15 -40 Q -10 ${-55 + Math.sin(sceneLocalFrame * 0.2) * 5} -15 -70`} stroke="#94A3B8" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d={`M 15 -40 Q 20 ${-55 + Math.cos(sceneLocalFrame * 0.2) * 5} 15 -70`} stroke="#94A3B8" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>

            {["Z", "z", "z"].map((z, idx) => {
              const zY = -60 - idx * 50 - ((sceneLocalFrame * 1.5) % 60);
              const zX = 140 + idx * 30 + Math.sin(sceneLocalFrame * 0.1 + idx) * 15;
              return (
                <text key={`z-${idx}`} x={zX} y={zY} fill="#FACC15" fontSize={42 - idx * 8} fontWeight="900" fontFamily="sans-serif">
                  {z}
                </text>
              );
            })}
          </g>
        )}

        {/* ============================================================== */}
        {/* OTAK RECEH 6: PANIC ALARM EMERGENCY */}
        {/* ============================================================== */}
        {isPanic && !isSleepOrBed && !isMemoryOrCringe && !isEvolutionOrSurvival && !isScrolling && !isLazy && !isElephantClock && !isCrankshaft && (
          <g transform="translate(400, 400)">
            <g transform={`rotate(${sceneLocalFrame * 4})`}>
              {[...Array(8)].map((_, i) => (
                <polygon
                  key={`beam-${i}`}
                  points="0,0 -40,-350 40,-350"
                  fill="#EF4444"
                  opacity={(i % 2 === 0 ? 0.2 : 0.05) + Math.sin(sceneLocalFrame * 0.4) * 0.1}
                  transform={`rotate(${i * 45})`}
                />
              ))}
            </g>

            <path d="M -120 180 L 120 180 L 80 120 L -80 120 Z" fill="#1E293B" stroke="#475569" strokeWidth="6" />

            <g transform="translate(0, 40)">
              <path
                d="M -100 80 C -100 -60, 100 -60, 100 80 Z"
                fill="#EF4444"
                stroke="#DC2626"
                strokeWidth="10"
                filter="url(#centerGlow)"
              />
              <polygon
                points={`0,0 ${Math.sin(sceneLocalFrame * 0.3) * 160},-120 ${Math.sin(sceneLocalFrame * 0.3 + 0.5) * 160},-120`}
                fill="#FEF08A"
                opacity="0.8"
              />
            </g>

            {[-160, 160].map((xSide, i) => (
              <g key={`sparks-${i}`} transform={`translate(${xSide}, ${Math.sin(sceneLocalFrame * 0.5 + i) * 20})`}>
                <polygon points="0,-40 25,0 10,0 20,40 -20,0 -5,0" fill="#F97316" filter="url(#centerGlow)" />
              </g>
            ))}

            <g transform={`translate(0, -120) scale(${pulseScale})`}>
              <circle cx="0" cy="0" r="90" fill="#DC2626" stroke="#FEF2F2" strokeWidth="8" filter="url(#centerGlow)" />
              <circle cx="-70" cy="-70" r="30" fill="#FACC15" stroke="#FFFFFF" strokeWidth="5" />
              <circle cx="70" cy="-70" r="30" fill="#FACC15" stroke="#FFFFFF" strokeWidth="5" />
              <circle cx="-30" cy="-15" r="16" fill="#FFFFFF" />
              <circle cx="-30" cy="-15" r="8" fill="#000000" />
              <circle cx="30" cy="-15" r="16" fill="#FFFFFF" />
              <circle cx="30" cy="-15" r="8" fill="#000000" />
              <ellipse cx="0" cy="35" rx="35" ry="25" fill="#450A0A" stroke="#FFFFFF" strokeWidth="4" />
              <path d="M 60 -20 Q 80 0 60 20 Q 50 0 60 -20" fill="#38BDF8" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 1: SULTAN MONEY & WEALTH RAIN */}
        {/* ============================================================== */}
        {isMoneyOrWealth && !isWalletEmpty && (
          <g transform="translate(400, 400)">
            {/* Golden Crown */}
            <g transform={`translate(0, -170) scale(${pulseScale})`}>
              <polygon points="-80,30 -100,-40 -30,0 0,-60 30,0 100,-40 80,30" fill="#F59E0B" stroke="#FDE68A" strokeWidth="6" filter="url(#centerGlow)" />
              <circle cx="-100" cy="-45" r="10" fill="#EF4444" />
              <circle cx="0" cy="-65" r="12" fill="#3B82F6" />
              <circle cx="100" cy="-45" r="10" fill="#10B981" />
            </g>

            {/* Flying Banknotes */}
            {[-1, 0, 1].map((pos, idx) => {
              const driftY = Math.sin((sceneLocalFrame + idx * 20) * 0.1) * 20;
              const rot = pos * 18 + Math.cos(sceneLocalFrame * 0.08) * 8;
              return (
                <g key={`cash-${idx}`} transform={`translate(${pos * 180}, ${driftY}) rotate(${rot})`}>
                  <rect x="-90" y="-50" width="180" height="100" rx="12" fill="#15803D" stroke="#86EFAC" strokeWidth="6" filter="url(#centerGlow)" />
                  <circle cx="0" cy="0" r="28" fill="#166534" stroke="#BBF7D0" strokeWidth="4" />
                  <text x="0" y="10" textAnchor="middle" fill="#DCFCE7" fontSize="28" fontWeight="900" fontFamily="sans-serif">
                    RP
                  </text>
                  <text x="-70" y="-22" fill="#86EFAC" fontSize="16" fontWeight="bold">100K</text>
                  <text x="45" y="38" fill="#86EFAC" fontSize="16" fontWeight="bold">100K</text>
                </g>
              );
            })}

            {/* Glowing Golden Coins */}
            {[-120, 120].map((cx, idx) => (
              <g key={`coin-${idx}`} transform={`translate(${cx}, ${90 + Math.sin(sceneLocalFrame * 0.12 + idx) * 15})`}>
                <circle cx="0" cy="0" r="38" fill="#FBBF24" stroke="#FFFBEB" strokeWidth="5" filter="url(#centerGlow)" />
                <circle cx="0" cy="0" r="28" fill="#D97706" />
                <text x="0" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="32" fontWeight="900">
                  $
                </text>
              </g>
            ))}
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 2: EMPTY WALLET & BOKEK */}
        {/* ============================================================== */}
        {isWalletEmpty && (
          <g transform="translate(400, 400)">
            {/* Open Leather Wallet */}
            <g transform={`scale(${pulseScale})`}>
              <path d="M -180 50 L -180 -70 Q 0 -110 180 -70 L 180 50 Q 0 80 -180 50 Z" fill="#78350F" stroke="#B45309" strokeWidth="8" filter="url(#centerGlow)" />
              <path d="M -170 -60 Q 0 -95 170 -60 L 170 30 Q 0 60 -170 30 Z" fill="#451A03" />
              {/* Spiderweb inside wallet */}
              <path d="M 0 -70 L 0 40 M -60 -40 L 60 -40 M -40 -10 L 40 -10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            </g>

            {/* Wind Blow Lines */}
            {[-40, 0, 40].map((wy, idx) => (
              <path
                key={`wind-${idx}`}
                d={`M ${180 + idx * 15} ${wy} Q ${260 + idx * 15} ${wy - 15} ${320} ${wy + 10}`}
                stroke="#94A3B8"
                strokeWidth="4"
                strokeDasharray="12,12"
                fill="none"
              />
            ))}

            {/* Red Warning Tag: SALDO 0 */}
            <g transform="translate(0, 110) rotate(-4)">
              <rect x="-140" y="-35" width="280" height="70" rx="14" fill="#DC2626" stroke="#FEF2F2" strokeWidth="5" filter="url(#centerGlow)" />
              <text x="0" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="30" fontWeight="900" fontFamily="sans-serif">
                SALDO: RP 0
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 3: AESTHETIC CAFE COFFEE VS SASET */}
        {/* ============================================================== */}
        {isCoffeeOrCafe && !isMoneyOrWealth && (
          <g transform="translate(400, 400)">
            {/* Coffee Cup */}
            <g transform={`scale(${pulseScale})`}>
              <path d="M -80 -100 L 80 -100 L 60 90 Q 0 110 -60 90 Z" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="8" filter="url(#centerGlow)" />
              {/* Kraft Sleeve */}
              <path d="M -72 -30 L 72 -30 L 65 40 L -65 40 Z" fill="#B45309" stroke="#78350F" strokeWidth="4" />
              <circle cx="0" cy="5" r="22" fill="#FFFFFF" />
              <text x="0" y="12" textAnchor="middle" fill="#047857" fontSize="20" fontWeight="bold">☕</text>
              {/* Cup Lid */}
              <ellipse cx="0" cy="-100" rx="90" ry="24" fill="#0F172A" stroke="#FFFFFF" strokeWidth="5" />
            </g>

            {/* Steam animation */}
            {[-30, 0, 30].map((sx, idx) => {
              const steamDrift = Math.sin((sceneLocalFrame + idx * 15) * 0.12) * 12;
              return (
                <path
                  key={`steam-${idx}`}
                  d={`M ${sx} -130 Q ${sx + steamDrift} -170 ${sx - steamDrift} -210`}
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}

            {/* Price Tag Bubble */}
            <g transform="translate(140, -40) rotate(12)">
              <rect x="-65" y="-30" width="130" height="60" rx="30" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="4" filter="url(#centerGlow)" />
              <text x="0" y="9" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="900">40K</text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 4: E-COMMERCE CHECKOUT & SHOPPING CART */}
        {/* ============================================================== */}
        {isShopping && (
          <g transform="translate(400, 400)">
            {/* Shopping Cart */}
            <g transform={`translate(-20, 20) scale(${pulseScale})`}>
              <path d="M -160 -100 L -120 -100 L -80 40 L 110 40 L 140 -60 L -100 -60" fill="none" stroke="#F97316" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" filter="url(#centerGlow)" />
              {/* Wheels */}
              <circle cx="-60" cy="85" r="22" fill="#0F172A" stroke="#FFFFFF" strokeWidth="6" />
              <circle cx="85" cy="85" r="22" fill="#0F172A" stroke="#FFFFFF" strokeWidth="6" />
            </g>

            {/* Stacked Delivery Packages inside Cart */}
            <g transform="translate(0, -60)">
              <rect x="-60" y="-50" width="120" height="90" rx="8" fill="#D97706" stroke="#FEF3C7" strokeWidth="5" />
              <line x1="0" y1="-50" x2="0" y2="40" stroke="#78350F" strokeWidth="6" />
              <line x1="-60" y1="-5" x2="60" y2="-5" stroke="#78350F" strokeWidth="6" />
              {/* Flash Sale Badge */}
              <circle cx="50" cy="-45" r="30" fill="#EF4444" stroke="#FFFFFF" strokeWidth="4" filter="url(#centerGlow)" />
              <text x="50" y="-37" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">-70%</text>
            </g>

            {/* Red Notification Badge */}
            <g transform="translate(130, -110)">
              <circle cx="0" cy="0" r="32" fill="#DC2626" stroke="#FFFFFF" strokeWidth="5" filter="url(#centerGlow)" />
              <text x="0" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="bold">99+</text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 5: POLAROID CRIMINAL DOSSIER (THREADS CASE STYLE) */}
        {/* ============================================================== */}
        {isPolaroidCase && (
          <g transform="translate(400, 400)">
            {/* Polaroid Frame */}
            <g transform={`rotate(-4) scale(${pulseScale})`}>
              <rect x="-150" y="-190" width="300" height="380" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="8" filter="url(#centerGlow)" />
              {/* Inner Photo Area */}
              <rect x="-125" y="-165" width="250" height="250" fill="#0F172A" />
              {/* Suspect Silhouette */}
              <circle cx="0" cy="-75" r="48" fill="#334155" />
              <path d="M -75 50 C -75 -15 75 -15 75 50 Z" fill="#334155" />
              {/* Paperclip on Top */}
              <rect x="-30" y="-210" width="16" height="55" rx="8" fill="none" stroke="#94A3B8" strokeWidth="6" />

              {/* Bold Red PELAKU / TERSANGKA Stamp */}
              <g transform="translate(0, -40) rotate(-16)">
                <rect x="-95" y="-30" width="190" height="60" rx="8" fill="rgba(220, 38, 38, 0.9)" stroke="#FFFFFF" strokeWidth="4" />
                <text x="0" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="900" letterSpacing="4">
                  PELAKU
                </text>
              </g>

              {/* Name Label */}
              <text x="0" y="145" textAnchor="middle" fill="#0F172A" fontSize="32" fontWeight="900" fontFamily="sans-serif">
                TERSANGKA #1
              </text>
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 6: CALENDAR DEADLINE & TIME ACCELERATION */}
        {/* ============================================================== */}
        {isCalendarDeadline && !isMoneyOrWealth && !isCoffeeOrCafe && (
          <g transform="translate(400, 400)">
            {/* Calendar */}
            <g transform={`translate(-60, 0) scale(${pulseScale})`}>
              <rect x="-120" y="-130" width="240" height="260" rx="16" fill="#F8FAFC" stroke="#FFFFFF" strokeWidth="8" filter="url(#centerGlow)" />
              {/* Red Header */}
              <rect x="-120" y="-130" width="240" height="70" rx="16" fill="#DC2626" />
              <text x="0" y="-85" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="900">BULAN INI</text>
              {/* Big Red Date */}
              <text x="0" y="65" textAnchor="middle" fill="#DC2626" fontSize="110" fontWeight="900" fontFamily="sans-serif">
                31
              </text>
            </g>

            {/* Spinning Clock */}
            <g transform="translate(130, -50)">
              <circle cx="0" cy="0" r="75" fill="#0F172A" stroke="#FBBF24" strokeWidth="8" filter="url(#centerGlow)" />
              <line x1="0" y1="0" x2="0" y2="-45" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" transform={`rotate(${sceneLocalFrame * 12})`} />
              <line x1="0" y1="0" x2="35" y2="0" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" transform={`rotate(${sceneLocalFrame * 3})`} />
              <circle cx="0" cy="0" r="8" fill="#F87171" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* NEW SCENE 7: DYNAMIC COMPARISON / BALANCE SCALE */}
        {/* ============================================================== */}
        {isVersusComparison && !isMoneyOrWealth && (
          <g transform="translate(400, 400)">
            <g transform={`scale(${pulseScale})`}>
              {/* Stand */}
              <rect x="-10" y="-120" width="20" height="260" fill="#94A3B8" />
              <polygon points="-70,140 70,140 0,110" fill="#64748B" />

              {/* Tilting Beam */}
              {(() => {
                const tilt = Math.sin(sceneLocalFrame * 0.08) * 14;
                return (
                  <g transform={`translate(0, -110) rotate(${tilt})`}>
                    <line x1="-180" y1="0" x2="180" y2="0" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="14" fill="#FEF3C7" />

                    {/* Left Plate */}
                    <g transform="translate(-160, 0)">
                      <line x1="0" y1="0" x2="-40" y2="90" stroke="#CBD5E1" strokeWidth="4" />
                      <line x1="0" y1="0" x2="40" y2="90" stroke="#CBD5E1" strokeWidth="4" />
                      <path d="M -55 90 Q 0 125 55 90 Z" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="4" />
                      <text x="0" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="bold">DULU</text>
                    </g>

                    {/* Right Plate */}
                    <g transform="translate(160, 0)">
                      <line x1="0" y1="0" x2="-40" y2="90" stroke="#CBD5E1" strokeWidth="4" />
                      <line x1="0" y1="0" x2="40" y2="90" stroke="#CBD5E1" strokeWidth="4" />
                      <path d="M -55 90 Q 0 125 55 90 Z" fill="#EF4444" stroke="#FEE2E2" strokeWidth="4" />
                      <text x="0" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="bold">KINI</text>
                    </g>
                  </g>
                );
              })()}
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* DYNAMIC FALLBACK: ROTATING BETWEEN DIVERSE OBJECTS BY SCENE INDEX */}
        {/* ============================================================== */}
        {!isElephantClock &&
          !isCrankshaft &&
          !isAstrolabe &&
          !isMechanicalBook &&
          !isParchmentScroll &&
          !isWhaleAnomaly &&
          !isSpectrogram &&
          !isSonarRadar &&
          !isSleepOrBed &&
          !isMemoryOrCringe &&
          !isEvolutionOrSurvival &&
          !isScrolling &&
          !isLazy &&
          !isPanic &&
          !isMoneyOrWealth &&
          !isWalletEmpty &&
          !isCoffeeOrCafe &&
          !isShopping &&
          !isPolaroidCase &&
          !isCalendarDeadline &&
          !isVersusComparison && (
            <g transform="translate(400, 400)">
              {/* Rotate between 4 distinct visual motifs based on sceneIndex */}
              {sceneIndex % 4 === 1 && (
                /* Motif 1: Neon Question Mark & Discovery Portal */
                <g transform={`scale(${pulseScale})`}>
                  <circle cx="0" cy="0" r="140" fill="none" stroke={themeColor} strokeWidth="6" strokeDasharray="16,12" filter="url(#centerGlow)" />
                  <circle cx="0" cy="0" r="110" fill="rgba(0,0,0,0.6)" stroke="#FFFFFF" strokeWidth="4" />
                  <text x="0" y="45" textAnchor="middle" fill={themeColor} fontSize="140" fontWeight="900" fontFamily="sans-serif" filter="url(#centerGlow)">
                    ?
                  </text>
                </g>
              )}

              {sceneIndex % 4 === 2 && (
                /* Motif 2: High-Tech Speedometer Gauge */
                <g transform={`scale(${pulseScale})`}>
                  <path d="M -150 40 A 150 150 0 1 1 150 40" fill="none" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
                  <path d="M -150 40 A 150 150 0 0 1 60 -138" fill="none" stroke={themeColor} strokeWidth="24" strokeLinecap="round" filter="url(#centerGlow)" />
                  {/* Needle */}
                  <g transform={`rotate(${-40 + Math.sin(sceneLocalFrame * 0.15) * 50})`}>
                    <line x1="0" y1="0" x2="0" y2="-120" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="18" fill="#FFFFFF" />
                  </g>
                  <text x="0" y="90" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="bold">MAX LEVEL</text>
                </g>
              )}

              {sceneIndex % 4 === 3 && (
                /* Motif 3: Brain Metaphor */
                <g>
                  <g transform="translate(0, -180)">
                    <circle cx="0" cy="0" r="42" fill="#FACC15" filter="url(#centerGlow)" />
                    <polygon points="-12,38 12,38 8,52 -8,52" fill="#94A3B8" />
                  </g>
                  <g transform={`scale(${pulseScale})`}>
                    <path
                      d="M -130 50 C -220 50, -220 -80, -130 -120 C -180 -180, -80 -220, 0 -170 C 80 -220, 180 -180, 130 -120 C 220 -80, 220 50, 130 50 Z"
                      fill="#FB7185"
                      stroke="#E11D48"
                      strokeWidth="12"
                      filter="url(#centerGlow)"
                    />
                    <path d="M -70 -70 Q 0 -40 70 -70" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />
                    <path d="M -90 0 Q -30 20 0 -20 Q 30 20 90 0" stroke="#E11D48" strokeWidth="8" fill="none" strokeLinecap="round" />
                  </g>
                </g>
              )}

              {sceneIndex % 4 === 0 && (
                /* Motif 4: Holographic Scientific Core */
                <g transform={`scale(${pulseScale})`}>
                  <circle cx="0" cy="0" r="130" fill="none" stroke="#38BDF8" strokeWidth="4" strokeDasharray="10,14" />
                  <ellipse cx="0" cy="0" rx="140" ry="50" fill="none" stroke="#F43F5E" strokeWidth="6" transform={`rotate(${sceneLocalFrame * 3})`} />
                  <ellipse cx="0" cy="0" rx="140" ry="50" fill="none" stroke="#3B82F6" strokeWidth="6" transform={`rotate(${-sceneLocalFrame * 3})`} />
                  <circle cx="0" cy="0" r="45" fill="#FFFFFF" filter="url(#centerGlow)" />
                  <circle cx="0" cy="0" r="25" fill="#0F172A" />
                </g>
              )}
            </g>
          )}
      </svg>
    </div>
  );
};
