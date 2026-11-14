import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
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
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  // Normalize pose
  let pose: CharacterPose = "sitting_bored";
  const act = characterAction.toLowerCase();
  if (act.includes("phone") || act.includes("scroll")) {
    pose = "sitting_phone";
  } else if (act.includes("bed") || act.includes("rebahan") || act.includes("tidur") || act.includes("lying")) {
    pose = "lying_bed";
  } else if (act.includes("panic") || act.includes("typing") || act.includes("ngetik") || act.includes("rush")) {
    pose = "sitting_typing_panic";
  }

  // Normalize expression
  let exp: CharacterExpression = "bored";
  const expr = expression.toLowerCase();
  if (expr.includes("panic") || expr.includes("panik")) {
    exp = "panic";
  } else if (expr.includes("shock") || expr.includes("kaget")) {
    exp = "shocked";
  } else if (expr.includes("relax") || expr.includes("santai") || expr.includes("senang") || expr.includes("smug")) {
    exp = "relaxed";
  }

  // Map camera shot preset
  let camShot: CameraShotType = "MEDIUM_DESK";
  const st = shotType.toLowerCase();
  if (act.includes("panic") || act.includes("typing") || exp === "panic") {
    camShot = "MEDIUM_PANIC";
  } else if (st.includes("wide") || pose === "lying_bed") {
    camShot = "WIDE_ROOM";
  } else if (st.includes("reaction") || exp === "shocked") {
    camShot = "REACTION_FACE";
  } else if (st.includes("close") && pose === "sitting_phone") {
    camShot = "CLOSEUP_PHONE";
  } else {
    camShot = "MEDIUM_DESK";
  }

  // Determine character position based on pose
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

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0F172A" }}>
      <VirtualCamera shotType={camShot}>
        {/* Layer 1: Background Room / Environment */}
        <BedroomEnvironment
          layer="background"
          isAlarming={isAlarming}
          clockHour={11}
          clockMinute={58}
        />

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

        {/* Layer 3: Foreground Desk, Glowing Laptop, Coffee Mug */}
        {showForegroundDesk && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
            <BedroomEnvironment
              layer="foreground"
              isAlarming={isAlarming}
            />
          </div>
        )}
      </VirtualCamera>
    </AbsoluteFill>
  );
};
