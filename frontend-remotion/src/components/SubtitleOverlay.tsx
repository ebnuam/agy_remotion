import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SubtitleOverlayProps {
  currentText: string;
  sceneIndex: number;
  sceneStartFrame: number;
  themeColor: string;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  currentText,
  sceneIndex,
  sceneStartFrame,
  themeColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const safeStart = Number.isFinite(sceneStartFrame) ? sceneStartFrame : 0;
  const localFrame = Math.max(0, Math.floor(frame - safeStart));
  const anim = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 140,
    },
  });

  const translateY = interpolate(anim, [0, 1], [30, 0]);
  const opacity = interpolate(anim, [0, 1], [0, 1]);
  const scale = interpolate(anim, [0, 1], [0.95, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 240,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
        zIndex: 25,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          background: "rgba(10, 15, 29, 0.88)",
          backdropFilter: "blur(24px)",
          border: `2px solid rgba(255, 255, 255, 0.15)`,
          borderLeft: `8px solid ${themeColor}`,
          borderRadius: 32,
          padding: "36px 44px",
          maxWidth: 960,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.35,
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: -0.5,
            wordBreak: "break-word",
          }}
        >
          {currentText}
        </p>
      </div>
    </div>
  );
};
