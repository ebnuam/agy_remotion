import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BedroomEnvironment } from "./BedroomEnvironment";
import { CartoonCharacter } from "./CartoonCharacter";
import { CameraShotType, CharacterExpression, CharacterPose } from "./types";
import { VirtualCamera } from "./VirtualCamera";

export const CartoonPrototype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Total Duration: 450 frames (15.0 seconds @ 30fps)
  let shotType: CameraShotType = "MEDIUM_DESK";
  let pose: CharacterPose = "sitting_bored";
  let expression: CharacterExpression = "bored";
  let captionTitle = "";
  let captionHighlight = "";
  let highlightColor = "#FF7A00";
  let isAlarming = false;
  let characterX = 180;
  let characterY = 960;
  let characterScale = 1.0;
  let showDeskForeground = true;

  // Scene 1: Frames 0 - 110 (0.0s - 3.66s) -> Bored at Desk Looking at Laptop
  if (frame < 110) {
    shotType = "MEDIUM_DESK";
    pose = "sitting_bored";
    expression = "bored";
    captionTitle = "Niatnya ngerjain tugas...";
    captionHighlight = "Otak malah mogok & bosan berat";
    highlightColor = "#FF7A00";
    characterX = 180;
    characterY = 950;
    characterScale = 1.0;
    showDeskForeground = true;
  }
  // Scene 2: Frames 110 - 220 (3.66s - 7.33s) -> Taking Phone & Scrolling Reels
  else if (frame < 220) {
    shotType = "CLOSEUP_PHONE";
    pose = "sitting_phone";
    expression = "relaxed";
    captionTitle = "Buka HP sebentar...";
    captionHighlight = "Cuma lima menit mantau reels!";
    highlightColor = "#38BDF8";
    characterX = 175;
    characterY = 940;
    characterScale = 1.02;
    showDeskForeground = true;
  }
  // Scene 3A: Frames 220 - 275 (7.33s - 9.16s) -> Reclining on Bed
  else if (frame < 275) {
    shotType = "WIDE_ROOM";
    pose = "lying_bed";
    expression = "relaxed";
    captionTitle = "Kebablasan rebahan...";
    captionHighlight = "Ngemil dopamin instan di kasur";
    highlightColor = "#A855F7";
    characterX = 560;
    characterY = 1110;
    characterScale = 0.95;
    showDeskForeground = false; // Character on bed
  }
  // Scene 3B: Frames 275 - 330 (9.16s - 11.0s) -> Dramatic Zoom on Wall Clock (11:58 PM!)
  else if (frame < 330) {
    shotType = "CLOSEUP_CLOCK";
    pose = "lying_bed";
    expression = "relaxed";
    isAlarming = true;
    captionTitle = "Liat jam dinding...";
    captionHighlight = "SUDAH PUKUL 23:58 MALAM?!";
    highlightColor = "#EF4444";
    characterX = 560;
    characterY = 1110;
    characterScale = 0.95;
    showDeskForeground = false;
  }
  // Scene 4A: Frames 330 - 365 (11.0s - 12.16s) -> REACTION SHOT (Shocked Face!)
  else if (frame < 365) {
    shotType = "REACTION_FACE";
    pose = "sitting_bored";
    expression = "shocked";
    isAlarming = true;
    captionTitle = "SHOCK KAGET SETENGAH MATI!";
    captionHighlight = "DEADLINE TINGGAL 2 MENIT LAGI?!!";
    highlightColor = "#EF4444";
    characterX = 260;
    characterY = 1060;
    characterScale = 1.25;
    showDeskForeground = false; // Tight close-up on face
  }
  // Scene 4B: Frames 365 - 450 (12.16s - 15.0s) -> FURIOUS PANIC TYPING
  else {
    shotType = "MEDIUM_PANIC";
    pose = "sitting_typing_panic";
    expression = "panic";
    isAlarming = true;
    captionTitle = "JIWA RORO JONGGRANG BANGKIT!";
    captionHighlight = "NGETIK KILAT SECEPAT CAHAYA!!";
    highlightColor = "#F43F5E";
    characterX = 180;
    characterY = 945;
    characterScale = 1.05;
    showDeskForeground = true; // Typing on keyboard
  }

  // 1. Brief Opening Title Card (Frames 0 - 75, only first 2.5s)
  const showOpeningTitle = frame < 75;
  const titleEntrance = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 140 },
  });
  const titleScale = interpolate(titleEntrance, [0, 1], [0.85, 1]);
  const titleOpacity =
    frame > 55
      ? interpolate(frame, [55, 75], [1, 0])
      : interpolate(titleEntrance, [0, 1], [0, 1]);

  // 2. Dynamic Cartoon Caption Spring Entrance
  const sceneRelativeFrame = frame % 110;
  const captionSpring = spring({
    frame: sceneRelativeFrame,
    fps,
    config: { damping: 15, stiffness: 130 },
  });
  const captionY = interpolate(captionSpring, [0, 1], [30, 0]);
  const captionOpacity = interpolate(captionSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070B14", overflow: "hidden" }}>
      {/* ========================================================
          CINEMATIC VIRTUAL CAMERA
          Contains Background, Character, and Foreground in proper Z-depth
      ======================================================== */}
      <VirtualCamera shotType={shotType}>
        {/* Layer 1: Background Room Environment (Behind Character) */}
        <BedroomEnvironment
          layer="background"
          isAlarming={isAlarming}
          clockHour={11}
          clockMinute={58}
        />

        {/* Layer 2: 2D Rigged Cartoon Character */}
        <div
          style={{
            position: "absolute",
            left: characterX,
            top: characterY,
            transform: `scale(${characterScale})`,
            transformOrigin: "bottom center",
            zIndex: 10,
          }}
        >
          <CartoonCharacter pose={pose} expression={expression} isNight={true} />
        </div>

        {/* Layer 3: Foreground Props (Desk Tabletop, Laptop, Lamp)
            Overlaps character's waist so they sit BEHIND the desk! */}
        {showDeskForeground && (
          <BedroomEnvironment
            layer="foreground"
            isAlarming={isAlarming}
            clockHour={11}
            clockMinute={58}
          />
        )}
      </VirtualCamera>

      {/* ========================================================
          BRIEF OPENING TITLE CARD (First 2.5s only, then disappears)
      ======================================================== */}
      {showOpeningTitle && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 50,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(20px)",
              border: "3px solid #FF7A00",
              borderRadius: 40,
              padding: "16px 36px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 122, 0, 0.3)",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#FF7A00",
                boxShadow: "0 0 14px #FF7A00",
              }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: 1.5,
              }}
            >
              DEADLINE 2 JAM: SIKLUS NUNDA TUGAS
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          LIGHTWEIGHT NON-INTRUSIVE CARTOON SUBTITLE (Lower Third)
          Clean floating typography with stroke & shadow
      ======================================================== */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 45,
          padding: "0 60px",
          transform: `translateY(${captionY}px)`,
          opacity: captionOpacity,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(10, 15, 28, 0.82)",
            backdropFilter: "blur(16px)",
            border: `2px solid ${isAlarming ? "rgba(239, 68, 68, 0.6)" : "rgba(255, 255, 255, 0.18)"}`,
            borderRadius: 30,
            padding: "20px 38px",
            textAlign: "center",
            maxWidth: 940,
            boxShadow: "0 16px 45px rgba(0, 0, 0, 0.75)",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#94A3B8",
              marginBottom: 4,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {captionTitle}
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: highlightColor,
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: 1.25,
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              letterSpacing: 0.5,
            }}
          >
            {captionHighlight}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
