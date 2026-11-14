import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { AlibiCard } from "./AlibiCard";
import { AtmosphericBackground } from "./AtmosphericBackground";
import { EvidenceFolder } from "./EvidenceFolder";
import { KineticHeadline } from "./KineticHeadline";
import { KineticSubtitle } from "./KineticSubtitle";
import { SuspectLineup } from "./SuspectLineup";

export const CinematicRiddlePrototype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 15 seconds = 450 frames @ 30fps
  // Scene Breakdown:
  // Scene 1: 0 - 110 (Hook: 1 Dari 3 Anak Kos Maling HP)
  // Scene 2: 110 - 225 (Dossier: Manila Folder + Magnifying Glass + Rubber Stamp)
  // Scene 3: 225 - 335 (TKP: Mati Lampu Jumat 21.00)
  // Scene 4: 335 - 450 (Alibi Cards: Polaroid + Mystery Question Card)

  let scene = 1;
  let spotlightX = 540;
  let spotlightY = 850;
  let spotlightRadius = 450;
  let cameraScale = 1.0;
  let cameraY = 0;

  if (frame < 110) {
    scene = 1;
    spotlightX = 540;
    spotlightY = 820;
    cameraScale = 1.0;
  } else if (frame < 225) {
    scene = 2;
    spotlightX = 540;
    spotlightY = 900;
    cameraScale = 1.05;
  } else if (frame < 335) {
    scene = 3;
    spotlightX = 400;
    spotlightY = 750;
    cameraScale = 1.02;
  } else {
    scene = 4;
    spotlightX = 580;
    spotlightY = 850;
    cameraScale = 1.04;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bgDark, overflow: "hidden" }}>
      {/* 1. ATMOSPHERIC CINEMATIC BACKGROUND (Noir vignette, swaying bulb, dust motes, spotlight) */}
      <AtmosphericBackground
        spotlightX={spotlightX}
        spotlightY={spotlightY}
        spotlightRadius={spotlightRadius}
      />

      {/* 2. DYNAMIC CAMERA VIEWPORT */}
      <div
        style={{
          width: 1080,
          height: 1920,
          position: "absolute",
          transformOrigin: "540px 960px",
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
        }}
      >
        {/* ========================================================
            SCENE 1: THE HOOK (1 DARI 3 ANAK KOS MALING HP)
        ======================================================== */}
        {scene === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <KineticHeadline
              tagText="KASUS #1 · MALING HP"
              line1="1 DARI 3 ANAK KOS"
              line2="MALING HP TEMANNYA"
              highlightWords={["MALING", "HP", "TEMANNYA"]}
            />

            <div
              style={{
                position: "absolute",
                bottom: 380,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <SuspectLineup activeSuspectIndex={2} />
            </div>

            <KineticSubtitle
              text="Satu dari tiga anak kos ini maling HP temannya."
              startFrame={0}
              durationFrames={110}
            />
          </div>
        )}

        {/* ========================================================
            SCENE 2: DETECTIVE DOSSIER (MANILA FOLDER + MAGNIFIER + STAMP)
        ======================================================== */}
        {scene === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <KineticHeadline
              tagText="KASUS #1 · MALING HP"
              line1="BERKAS PERKARA"
              highlightWords={["BERKAS", "PERKARA"]}
            />

            <div
              style={{
                position: "absolute",
                top: 520,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <EvidenceFolder
                caseNumber="KASUS #1"
                berkasText="Maling HP di kos"
                tkpText="Ruang tengah"
                tersangkaText="3 orang"
                petunjukText="Ada di cerita"
                stampText="TANPA TRIK"
                showStamp={true}
                stampDelayFrames={25}
              />
            </div>

            <KineticSubtitle
              text="Dengerin baik-baik karena malingnya keceplosan sendiri."
              startFrame={110}
              durationFrames={115}
            />
          </div>
        )}

        {/* ========================================================
            SCENE 3: TKP MATI LAMPU (CLOCK + SILHOUETTE BEHIND TABLE)
        ======================================================== */}
        {scene === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <KineticHeadline
              tagText="TKP · RUANG TENGAH"
              line1="MATI LAMPU"
              highlightWords={["LAMPU"]}
            />

            {/* Clock & Table Environment */}
            <div
              style={{
                position: "absolute",
                top: 480,
                left: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Wall Clock Friday 21.00 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    border: "8px solid #334155",
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  <div style={{ position: "absolute", width: 6, height: 45, backgroundColor: theme.colors.crimson, top: 25, borderRadius: 3 }} />
                  <div style={{ position: "absolute", width: 45, height: 6, backgroundColor: "#0F172A", left: 70, top: 67, borderRadius: 3 }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: theme.colors.crimson, zIndex: 5 }} />
                </div>
                <span
                  style={{
                    color: "#E2E8F0",
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: theme.fonts.typewriter,
                    marginTop: 16,
                    letterSpacing: 3,
                  }}
                >
                  JUMAT 21.00
                </span>
              </div>

              {/* Table with Dinda Silhouette */}
              <div style={{ position: "relative", width: 680, height: 350, display: "flex", justifyContent: "center" }}>
                {/* Silhouette Behind Table */}
                <div style={{ position: "absolute", bottom: 80, width: 220, height: 260 }}>
                  <svg viewBox="0 0 220 260" style={{ width: "100%", height: "100%" }}>
                    <circle cx="110" cy="70" r="45" fill="#0A0F1D" stroke="#38BDF8" strokeWidth="3" />
                    <path d="M 90 50 Q 60 60 55 110 Q 90 90 105 70 Z" fill="#0A0F1D" stroke="#38BDF8" strokeWidth="2.5" />
                    <path d="M 30 260 C 30 150, 60 110, 110 110 C 160 110, 190 150, 190 260 Z" fill="#0A0F1D" stroke="#38BDF8" strokeWidth="3" />
                    <text x="110" y="240" textAnchor="middle" fill="#94A3B8" fontSize="20" fontWeight="800" fontFamily={theme.fonts.typewriter}>
                      DINDA
                    </text>
                  </svg>
                </div>

                {/* Wooden Table In Front */}
                <div style={{ position: "absolute", bottom: 0, width: 640 }}>
                  <div style={{ width: "100%", height: 32, backgroundColor: "#5C361C", borderRadius: 6, border: "2px solid #784B2B" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0 60px" }}>
                    <div style={{ width: 26, height: 80, backgroundColor: "#382010" }} />
                    <div style={{ width: 26, height: 80, backgroundColor: "#382010" }} />
                  </div>
                </div>
              </div>
            </div>

            <KineticSubtitle
              text="Dinda ninggalin HP-nya ngecas pakai powerbank di meja ruang tengah."
              startFrame={225}
              durationFrames={110}
            />
          </div>
        )}

        {/* ========================================================
            SCENE 4: ALIBI SUSPECT CARDS (POLAROID + QUESTION CARD)
        ======================================================== */}
        {scene === 4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <KineticHeadline
              tagText="TERSANGKA 2/3"
              line1="ALIBI TERSANGKA"
              highlightWords={["ALIBI", "TERSANGKA"]}
            />

            <div
              style={{
                position: "absolute",
                top: 540,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <AlibiCard
                suspectNumber="KS-01"
                suspectName="DINDA"
                alibiText="di teras, telponan"
              />
            </div>

            <KineticSubtitle
              text="Alibi kedua ini yang paling meyakinkan."
              startFrame={335}
              durationFrames={115}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
