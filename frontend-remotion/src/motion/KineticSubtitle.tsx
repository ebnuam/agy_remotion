import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

interface KineticSubtitleProps {
  text: string;
  startFrame: number;
  durationFrames: number;
  accentColor?: string;
}

export const KineticSubtitle: React.FC<KineticSubtitleProps> = ({
  text,
  startFrame,
  durationFrames,
  accentColor = "#FACC15",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const allWords = text.trim().split(/\s+/).filter(Boolean);
  if (allWords.length === 0) return null;

  // Group words into punchy short chunks (3 to 4 words per visual card)
  const chunkSize = allWords.length <= 4 ? allWords.length : allWords.length <= 8 ? 3 : 4;
  const chunks: string[][] = [];
  for (let i = 0; i < allWords.length; i += chunkSize) {
    chunks.push(allWords.slice(i, i + chunkSize));
  }

  const elapsed = Math.max(0, frame - startFrame);
  const progressRatio = Math.min(1, Math.max(0, elapsed / Math.max(1, durationFrames)));

  // Determine current active chunk
  const chunkIndex = Math.min(
    chunks.length - 1,
    Math.floor(progressRatio * chunks.length)
  );
  const currentChunk = chunks[chunkIndex] || allWords;

  // Fraction of time spent within the current chunk
  const chunkTimeSlot = 1 / chunks.length;
  const chunkElapsed = progressRatio - chunkIndex * chunkTimeSlot;
  const chunkLocalRatio = Math.min(1, Math.max(0, chunkElapsed / chunkTimeSlot));

  // Determine active word within the chunk
  const activeWordInChunk = Math.min(
    currentChunk.length - 1,
    Math.floor(chunkLocalRatio * currentChunk.length)
  );

  // Punchy spring entrance on chunk change
  const chunkEntranceFrame = Math.floor(chunkIndex * (durationFrames / chunks.length));
  const chunkSpring = spring({
    frame: Math.max(0, elapsed - chunkEntranceFrame),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const cardScale = interpolate(chunkSpring, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 50,
        pointerEvents: "none",
        padding: "0 40px",
      }}
    >
      {/* Frosted Modern Subtitle Card */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          padding: "16px 36px",
          borderRadius: 24,
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          border: `2px solid rgba(255, 255, 255, 0.18)`,
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
          transform: `scale(${cardScale})`,
          maxWidth: 960,
        }}
      >
        {currentChunk.map((word, idx) => {
          const isActive = idx === activeWordInChunk;
          const isPast = idx < activeWordInChunk;

          return (
            <span
              key={`chunk-${chunkIndex}-word-${idx}`}
              style={{
                fontFamily: theme.fonts.headline || "sans-serif",
                fontSize: 50,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                margin: "4px 10px",
                color: isActive
                  ? accentColor
                  : isPast
                  ? "#FFFFFF"
                  : "rgba(255, 255, 255, 0.45)",
                transform: isActive ? "scale(1.15)" : "scale(1.0)",
                textShadow: isActive
                  ? `0 0 20px ${accentColor}, 0 2px 8px rgba(0,0,0,0.8)`
                  : "0 2px 6px rgba(0,0,0,0.6)",
                display: "inline-block",
                transition: "transform 0.08s ease, color 0.08s ease",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Mini Dynamic Audio Wave Pulse */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 12,
          alignItems: "center",
        }}
      >
        {[0, 1, 2, 3, 4].map((barIdx) => {
          const waveHeight = 6 + Math.abs(Math.sin((frame * 0.25) + barIdx * 0.8)) * 14;
          return (
            <div
              key={`wave-${barIdx}`}
              style={{
                width: 5,
                height: waveHeight,
                borderRadius: 4,
                backgroundColor: accentColor,
                opacity: 0.85,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
