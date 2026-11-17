/**
 * MAS ISO - Static Character Preview Component
 * Displays Front View and 3/4 View side-by-side on a neutral studio background.
 */

import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { MasIsoArt } from "./MasIsoArt";
import { Expression, Gesture, ViewAngle } from "./types";

interface CharacterCanvasProps {
  viewAngle: ViewAngle;
  expression: Expression;
  gesture: Gesture;
  title: string;
  width: number;
  height: number;
}

const CharacterCard: React.FC<CharacterCanvasProps> = ({
  viewAngle,
  expression,
  gesture,
  title,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale canvas context from master design coordinates (1024 x 1536) to render dimensions
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const scale = Math.min(width / MasIsoArt.CANVAS_W, height / MasIsoArt.CANVAS_H);
    const offsetX = (width - MasIsoArt.CANVAS_W * scale) / 2;
    const offsetY = (height - MasIsoArt.CANVAS_H * scale) / 2;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    MasIsoArt.render(ctx, {
      viewAngle,
      expression,
      gesture,
    });
  }, [viewAngle, expression, gesture, width, height]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: "16px 12px 20px 12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        border: "2px solid #E2E8F0",
      }}
    >
      <div
        style={{
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: 22,
          fontWeight: 800,
          color: "#1E293B",
          marginBottom: 12,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width,
          height,
          display: "block",
        }}
      />
    </div>
  );
};

export const MasIsoPreview: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F1F5F9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "50px 30px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#0F172A",
            letterSpacing: -0.5,
          }}
        >
          MAS ISO — VECTOR DESIGN PREVIEW
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#64748B",
            marginTop: 6,
          }}
        >
          Kok Iso Yo? | Procedural 2D Cutout Articulation
        </div>
      </div>

      {/* Character Cards Side-by-Side */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 30,
          width: "100%",
        }}
      >
        <CharacterCard
          viewAngle="front"
          expression="curious"
          gesture="idle"
          title="Tampak Depan (Front)"
          width={470}
          height={705}
        />
        <CharacterCard
          viewAngle="threeQuarter"
          expression="curious"
          gesture="pointing"
          title="Tampak 3/4 (Angled)"
          width={470}
          height={705}
        />
      </div>

      {/* Palette Swatches Footer */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "12px 24px",
          borderRadius: 40,
          border: "1px solid #CBD5E1",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#475569" }}>
          COLOR IDENTITY:
        </span>
        {[
          { label: "Vest", color: "#1E7B85" },
          { label: "Shirt", color: "#F4F1EA" },
          { label: "Chino", color: "#8C5835" },
          { label: "Skin", color: "#F8D7B8" },
          { label: "Hair", color: "#241B18" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: item.color,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
