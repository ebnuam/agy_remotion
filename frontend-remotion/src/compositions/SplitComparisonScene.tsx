import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface SplitComparisonSceneProps {
  sceneLocalFrame: number;
  sceneDurationFrames: number;
  themeColor: string;
}

export const SplitComparisonScene: React.FC<SplitComparisonSceneProps> = ({
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const dividerX = interpolate(entrance, [0, 1], [-200, 540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F19", overflow: "hidden" }}>
      {/* Top / Left Half: RENCANA (Kalm, Biru Muda / Mint) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 960,
          backgroundColor: "#0F172A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "6px solid #FACC15",
        }}
      >
        <div
          style={{
            padding: "12px 32px",
            borderRadius: 30,
            backgroundColor: "#0284C7",
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          RENCANA (20:00)
        </div>
        <div style={{ fontSize: 90 }}>☕ 📖 🧘</div>
        <div
          style={{
            color: "#E2E8F0",
            fontSize: 34,
            fontWeight: 800,
            marginTop: 15,
            textAlign: "center",
          }}
        >
          "Satu jam kelar, tidur nyenyak!"
        </div>
      </div>

      {/* Bottom / Right Half: REALITA (Kacau, Merah Panik) */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 0,
          width: 1080,
          height: 960,
          backgroundColor: "#181014",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "12px 32px",
            borderRadius: 30,
            backgroundColor: "#EF4444",
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 20,
            letterSpacing: 2,
          }}
        >
          REALITA (02:00)
        </div>
        <div style={{ fontSize: 90 }}>📱 😱 ⚡</div>
        <div
          style={{
            color: "#FCA5A5",
            fontSize: 34,
            fontWeight: 800,
            marginTop: 15,
            textAlign: "center",
          }}
        >
          "Ngetik brutal, keringat dingin!"
        </div>
      </div>

      {/* Central Clashing Badge */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 540,
          transform: "translate(-50%, -50%)",
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            backgroundColor: "#FACC15",
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 900,
            border: "8px solid #0F172A",
            boxShadow: "0 0 30px rgba(250, 204, 21, 0.6)",
          }}
        >
          VS
        </div>
      </div>
    </AbsoluteFill>
  );
};
