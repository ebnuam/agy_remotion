import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface SplitComparisonSceneProps {
  headlineLine1?: string;
  headlineLine2?: string;
  visualIntent?: string;
  props?: string[];
  objects?: string[];
  text?: string;
  sceneLocalFrame: number;
  sceneDurationFrames: number;
  themeColor: string;
}

export const SplitComparisonScene: React.FC<SplitComparisonSceneProps> = ({
  headlineLine1,
  headlineLine2,
  visualIntent = "",
  props = [],
  objects = [],
  text = "",
  sceneLocalFrame,
  sceneDurationFrames,
  themeColor,
}) => {
  const { fps } = useVideoConfig();

  // Dynamic derivation of Side A & Side B labels from storyboard
  const labelA = (headlineLine1 || "SISI A").trim().toUpperCase();
  const labelB = (headlineLine2 || "SISI B").trim().toUpperCase();

  // Derive contextual emojis & descriptions from props and visual intent
  const contextPool = (visualIntent + " " + props.join(" ") + " " + objects.join(" ")).toLowerCase();

  let emojiA = "💡 📖 ☕";
  let descA = "Niat Baik & Rencana Awal";
  if (contextPool.includes("otak") || contextPool.includes("rasional") || contextPool.includes("logic")) {
    emojiA = "🧠 📋 🎯";
    descA = "Logika & Rencana Matang";
  } else if (contextPool.includes("hemat") || contextPool.includes("uang") || contextPool.includes("nabung")) {
    emojiA = "💰 🏦 📈";
    descA = "Target Menabung Disiplin";
  } else if (contextPool.includes("sehat") || contextPool.includes("diet") || contextPool.includes("gym")) {
    emojiA = "🥗 🏃 💧";
    descA = "Pola Hidup Produktif";
  }

  let emojiB = "📱 😱 ⚡";
  let descB = "Godaan & Realita Tak Terduga";
  if (contextPool.includes("dopamin") || contextPool.includes("emosional") || contextPool.includes("nafsu")) {
    emojiB = "🔥 🎮 🍔";
    descB = "Dorongan Dopamin Instan!";
  } else if (contextPool.includes("belanja") || contextPool.includes("checkout") || contextPool.includes("boros")) {
    emojiB = "🛍️ 💳 💸";
    descB = "Khilaf Keranjang Belanja!";
  } else if (contextPool.includes("tidur") || contextPool.includes("rebahan") || contextPool.includes("scroll")) {
    emojiB = "🛌 📱 🥱";
    descB = "Kebablasan Scroll di Kasur!";
  }

  // Animation: Sliding entrance for both halves
  const entrance = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const slideTopY = interpolate(entrance, [0, 1], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideBottomY = interpolate(entrance, [0, 1], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vsScale = interpolate(entrance, [0, 1], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dynamic contrast colors
  const primaryColor = themeColor || "#0284C7";
  const clashColor = "#EF4444";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F19", overflow: "hidden" }}>
      {/* ------------------------------------------------------------- */}
      {/* TOP HALF: SISI A (Rencana / Logika / Target)                   */}
      {/* ------------------------------------------------------------- */}
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
          transform: `translateY(${slideTopY}px)`,
          padding: "0 60px",
        }}
      >
        {/* Dynamic Badge Side A */}
        <div
          style={{
            padding: "14px 36px",
            borderRadius: 30,
            backgroundColor: primaryColor,
            color: "#FFFFFF",
            fontSize: 30,
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: 2,
            boxShadow: `0 8px 24px ${primaryColor}55`,
          }}
        >
          {labelA}
        </div>

        {/* Dynamic Contextual Visual Icons */}
        <div style={{ fontSize: 96, marginBottom: 20 }}>{emojiA}</div>

        {/* Dynamic Contextual Summary */}
        <div
          style={{
            color: "#F1F5F9",
            fontSize: 34,
            fontWeight: 800,
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.3,
          }}
        >
          "{descA}"
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM HALF: SISI B (Realita / Amigdala / Godaan)             */}
      {/* ------------------------------------------------------------- */}
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
          transform: `translateY(${slideBottomY}px)`,
          padding: "0 60px",
        }}
      >
        {/* Dynamic Badge Side B */}
        <div
          style={{
            padding: "14px 36px",
            borderRadius: 30,
            backgroundColor: clashColor,
            color: "#FFFFFF",
            fontSize: 30,
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: 2,
            boxShadow: `0 8px 24px ${clashColor}55`,
          }}
        >
          {labelB}
        </div>

        {/* Dynamic Contextual Visual Icons */}
        <div style={{ fontSize: 96, marginBottom: 20 }}>{emojiB}</div>

        {/* Dynamic Contextual Summary */}
        <div
          style={{
            color: "#FECACA",
            fontSize: 34,
            fontWeight: 800,
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.3,
          }}
        >
          "{descB}"
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTRAL CLASH BADGE (VS)                                      */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 540,
          transform: `translate(-50%, -50%) scale(${vsScale})`,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: "#FACC15",
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 46,
            fontWeight: 900,
            border: "8px solid #0F172A",
            boxShadow: "0 0 36px rgba(250, 204, 21, 0.75)",
          }}
        >
          VS
        </div>
      </div>
    </AbsoluteFill>
  );
};
