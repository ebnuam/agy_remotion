import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { BedroomEnvironment } from "../cartoon/BedroomEnvironment";
import { CartoonCharacter } from "../cartoon/CartoonCharacter";
import { CameraShotType, CharacterExpression, CharacterPose } from "../cartoon/types";
import { VirtualCamera } from "../cartoon/VirtualCamera";

interface CharacterActionSceneProps {
  characterAction?: string;
  expression?: string;
  shotType?: string;
  cameraMotion?: string;
  environment?: string;
  props?: string[];
  headlineLine1?: string;
  headlineLine2?: string;
  visualIntent?: string;
  sceneLocalFrame: number;
  sceneDurationFrames: number;
  themeColor: string;
}

export const CharacterActionScene: React.FC<CharacterActionSceneProps> = ({
  characterAction = "sitting_bored",
  expression = "bored",
  shotType = "medium",
  cameraMotion = "zoom_punch",
  environment = "bedroom_night",
  props = [],
  headlineLine1 = "",
  headlineLine2 = "",
  visualIntent = "",
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  // 1. Normalize Action / Pose
  let pose: CharacterPose = "sitting_bored";
  const act = (characterAction + " " + visualIntent).toLowerCase();
  if (act.includes("phone") || act.includes("scroll") || act.includes("medsos") || act.includes("reels")) {
    pose = "sitting_phone";
  } else if (act.includes("bed") || act.includes("rebahan") || act.includes("tidur") || act.includes("kasur") || act.includes("lying")) {
    pose = "lying_bed";
  } else if (act.includes("panic") || act.includes("typing") || act.includes("ngetik") || act.includes("rush") || act.includes("histeris")) {
    pose = "sitting_typing_panic";
  }

  // 2. Normalize Facial Expression
  let exp: CharacterExpression = "bored";
  const expr = (expression + " " + visualIntent).toLowerCase();
  if (expr.includes("panic") || expr.includes("panik") || act.includes("typing")) {
    exp = "panic";
  } else if (expr.includes("shock") || expr.includes("kaget") || expr.includes("terkejut")) {
    exp = "shocked";
  } else if (expr.includes("relax") || expr.includes("santai") || expr.includes("senang") || expr.includes("smug") || act.includes("phone")) {
    exp = "relaxed";
  }

  // 3. Normalize Camera Shot Type
  let camShot: CameraShotType = "MEDIUM_DESK";
  const st = shotType.toLowerCase();
  if (st.includes("wide") || pose === "lying_bed") {
    camShot = "WIDE_ROOM";
  } else if (st.includes("reaction") || exp === "shocked") {
    camShot = "REACTION_FACE";
  } else if (st.includes("close") && pose === "sitting_phone") {
    camShot = "CLOSEUP_PHONE";
  } else if (st.includes("panic") || exp === "panic" || pose === "sitting_typing_panic") {
    camShot = "MEDIUM_PANIC";
  } else {
    camShot = "MEDIUM_DESK";
  }

  // 4. Character positioning & desk visibility
  let charX = 180;
  let charY = 970;
  let charScale = 1.0;
  let showForegroundDesk = true;

  if (pose === "lying_bed") {
    charX = 560;
    charY = 1110;
    charScale = 0.95;
    showForegroundDesk = false;
  } else if (camShot === "REACTION_FACE") {
    charX = 270;
    charY = 1180;
    charScale = 1.15;
    showForegroundDesk = false;
  } else if (camShot === "MEDIUM_PANIC" || pose === "sitting_typing_panic") {
    charX = 180;
    charY = 970;
    charScale = 1.05;
    showForegroundDesk = true;
  } else if (pose === "sitting_phone") {
    charX = 175;
    charY = 960;
    charScale = 1.02;
    showForegroundDesk = true;
  }

  const isAlarming = exp === "panic" || exp === "shocked";

  // 5. Environment Theme Variation
  const envClean = (environment + " " + visualIntent).toLowerCase();
  const isOffice = envClean.includes("office") || envClean.includes("kantor");
  const isCafe = envClean.includes("cafe") || envClean.includes("kafe") || envClean.includes("kedai");

  // Dynamic Camera Motion interpolation on scene level
  let motionScale = 1.0;
  const cm = cameraMotion.toLowerCase();
  if (cm.includes("pull")) {
    motionScale = interpolate(sceneLocalFrame, [0, Math.max(1, sceneDurationFrames)], [1.12, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (cm.includes("punch") || cm.includes("zoom")) {
    motionScale = interpolate(sceneLocalFrame, [0, Math.max(1, sceneDurationFrames)], [1.0, 1.08], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0F172A" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${motionScale})`,
          transformOrigin: "center center",
        }}
      >
        <VirtualCamera shotType={camShot}>
          {/* Layer 1: Multi-plane Environment Background */}
          {isOffice ? (
            /* Office Background */
            <svg
              viewBox="0 0 1080 1920"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <rect x="0" y="0" width="1080" height="1350" fill="#1E293B" />
              {/* Office Blinds */}
              {[...Array(16)].map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 80}
                  x2="1080"
                  y2={i * 80}
                  stroke="#334155"
                  strokeWidth="3"
                />
              ))}
              {/* Whiteboard / Bulletin Board */}
              <rect x="180" y="240" width="720" height="420" rx="16" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="8" />
              <text x="540" y="320" textAnchor="middle" fill="#0F172A" fontSize="36" fontWeight="900">
                OFFICE DEADLINE BOARD
              </text>
              <line x1="240" y1="360" x2="840" y2="360" stroke="#CBD5E1" strokeWidth="4" />
            </svg>
          ) : isCafe ? (
            /* Cafe Cozy Background */
            <svg
              viewBox="0 0 1080 1920"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <rect x="0" y="0" width="1080" height="1350" fill="#271B14" />
              {/* Brick Wall Texture */}
              {[...Array(20)].map((_, r) => (
                <line
                  key={r}
                  x1="0"
                  y1={r * 65}
                  x2="1080"
                  y2={r * 65}
                  stroke="#3D2B1F"
                  strokeWidth="4"
                />
              ))}
              {/* Cafe Menu Chalkboard */}
              <rect x="220" y="220" width="640" height="440" rx="12" fill="#18181B" stroke="#713F12" strokeWidth="12" />
              <text x="540" y="310" textAnchor="middle" fill="#FACC15" fontSize="42" fontWeight="900">
                ESPRESSO CAFE
              </text>
            </svg>
          ) : (
            /* Bedroom Night Environment (Default for Otak Receh) */
            <BedroomEnvironment
              layer="background"
              isAlarming={isAlarming}
              clockHour={11}
              clockMinute={58}
            />
          )}

          {/* Layer 2: Midground Expressive Character */}
          <div
            style={{
              position: "absolute",
              left: charX,
              top: charY,
              transform: `scale(${charScale})`,
              transformOrigin: "bottom center",
              zIndex: 10,
            }}
          >
            <CartoonCharacter pose={pose} expression={exp} />
          </div>

          {/* Layer 3: Foreground Interactive Desk, Glowing Laptop, Coffee Mug */}
          {showForegroundDesk && (
            <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
              <BedroomEnvironment
                layer="foreground"
                isAlarming={isAlarming}
              />
            </div>
          )}
        </VirtualCamera>
      </div>
    </AbsoluteFill>
  );
};
