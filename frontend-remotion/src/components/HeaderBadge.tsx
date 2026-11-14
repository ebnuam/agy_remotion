import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface HeaderBadgeProps {
  channelName: string;
  title: string;
  themeColor: string;
}

export const HeaderBadge: React.FC<HeaderBadgeProps> = ({
  channelName,
  title,
  themeColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [-50, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
        opacity,
        transform: `translateY(${translateY}px)`,
        padding: "0 60px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 28px",
          borderRadius: 40,
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(16px)",
          border: `1.5px solid ${themeColor}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: themeColor,
            boxShadow: `0 0 12px ${themeColor}`,
          }}
        />
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {channelName}
        </span>
      </div>

      <h1
        style={{
          marginTop: 24,
          fontSize: 42,
          fontWeight: 900,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.25,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxWidth: 900,
        }}
      >
        {title}
      </h1>
    </div>
  );
};
