import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface KineticHeadlineProps {
  tagText?: string;
  line1: string;
  line2?: string;
  highlightWords?: string[]; // Words to color with gold
  accentColor?: string;
  sceneLocalFrame?: number;
}

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  tagText = "KASUS #1 · MALING HP",
  line1,
  line2,
  highlightWords = ["MALING", "HP", "TEMANNYA", "TERSANGKA"],
  accentColor = theme.colors.goldBright,
  sceneLocalFrame,
}) => {
  const globalFrame = useCurrentFrame();
  const frame = sceneLocalFrame !== undefined ? sceneLocalFrame : globalFrame;
  const { fps } = useVideoConfig();

  // 1. Tag Entrance Animation (Spring from top)
  const tagSpring = spring({
    frame,
    fps,
    config: theme.springs.gentle,
  });
  const tagY = interpolate(tagSpring, [0, 1], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 2. Headline Line 1 Staggered Entrance
  const line1Spring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: theme.springs.snappy,
  });
  const line1Scale = interpolate(line1Spring, [0, 1], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(line1Spring, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Opacity = interpolate(line1Spring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3. Headline Line 2 Staggered Entrance (Starts 8 frames after line 1)
  const line2Spring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: theme.springs.snappy,
  });
  const line2Scale = interpolate(line2Spring, [0, 1], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(line2Spring, [0, 1], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Opacity = interpolate(line2Spring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Blinking red status recording dot on top tag
  const isRedDotOn = (frame % 30) < 20;

  const renderWords = (text: string) => {
    return text.split(" ").map((w, i) => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const isHighlighted = highlightWords.some((hw) => clean === hw.toUpperCase());
      return (
        <span
          key={`w-${i}`}
          style={{
            color: isHighlighted ? accentColor : theme.colors.textWhite,
            marginRight: "0.28em",
            display: "inline-block",
          }}
        >
          {w}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 240,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 30,
        padding: "0 60px",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {/* Top Noir Case Tag */}
      {tagText && (
        <div
          style={{
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 22px",
            borderRadius: 30,
            background: "rgba(15, 23, 42, 0.8)",
            border: `1.5px solid ${theme.colors.borderGold}`,
            marginBottom: 20,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: theme.colors.crimson,
              boxShadow: isRedDotOn ? `0 0 10px ${theme.colors.crimson}` : "none",
              opacity: isRedDotOn ? 1 : 0.3,
            }}
          />
          <span
            style={{
              color: "#FEF08A",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: theme.fonts.typewriter,
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            {tagText}
          </span>
        </div>
      )}

      {/* Main Kinetic Headline Line 1 */}
      <h1
        style={{
          margin: 0,
          fontFamily: theme.fonts.headline,
          fontSize: 82,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: 2,
          textTransform: "uppercase",
          transform: `translateY(${line1Y}px) scale(${line1Scale})`,
          opacity: line1Opacity,
          textShadow: "0 8px 30px rgba(0, 0, 0, 0.9)",
        }}
      >
        {renderWords(line1)}
      </h1>

      {/* Main Kinetic Headline Line 2 */}
      {line2 && (
        <h2
          style={{
            margin: "8px 0 0 0",
            fontFamily: theme.fonts.headline,
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: 2,
            textTransform: "uppercase",
            transform: `translateY(${line2Y}px) scale(${line2Scale})`,
            opacity: line2Opacity,
            textShadow: "0 8px 30px rgba(0, 0, 0, 0.9)",
          }}
        >
          {renderWords(line2)}
        </h2>
      )}
    </div>
  );
};
