import { Lottie, LottieAnimationData } from "@remotion/lottie";
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useVideoConfig,
} from "remotion";
import { AtmosphericBackground } from "../motion/AtmosphericBackground";
import { DynamicVisualCenter } from "../motion/DynamicVisualCenter";
import { theme } from "../theme";

interface StagedSceneProps {
  environmentAsset?: string;
  actorAsset?: string;
  visualCue?: string;
  objects?: string[];
  text?: string;
  sceneIndex?: number;
  channelId?: string;
  themeColor: string;
  sceneLocalFrame: number;
  sceneDurationFrames: number;
}

export const StagedScene: React.FC<StagedSceneProps> = ({
  environmentAsset,
  actorAsset,
  visualCue,
  objects = [],
  text = "",
  sceneIndex = 1,
  channelId = "otak-receh",
  themeColor,
  sceneLocalFrame,
  sceneDurationFrames,
}) => {
  const { fps } = useVideoConfig();

  // Helper to resolve asset path in Remotion staticFile
  const resolveAssetPath = (assetName: string) => {
    const clean = assetName.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }
    if (clean.startsWith("assets/")) {
      return staticFile(clean);
    }
    return staticFile(`assets/${clean}`);
  };

  // State for Lottie animation data if actor_asset is JSON
  const isLottie = actorAsset && actorAsset.toLowerCase().endsWith(".json");
  const [lottieData, setLottieData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    if (!isLottie || !actorAsset) return;
    const path = resolveAssetPath(actorAsset);
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie asset");
        return res.json();
      })
      .then((data) => setLottieData(data))
      .catch((err) => {
        console.warn("Could not load Lottie actor asset:", err);
      });
  }, [isLottie, actorAsset]);

  // =========================================================================
  // LAPISAN 1 (BACKGROUND): 2.5D Continuous Horizontal Pan
  // =========================================================================
  // Pan direction alternates subtly by scene index (-50px to +50px or vice versa)
  const panDirection = (sceneIndex % 2 === 0) ? -1 : 1;
  const panX = interpolate(
    sceneLocalFrame,
    [0, Math.max(1, sceneDurationFrames)],
    [-40 * panDirection, 40 * panDirection],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle background zoom (parallax depth feel)
  const bgZoom = interpolate(
    sceneLocalFrame,
    [0, Math.max(1, sceneDurationFrames)],
    [1.08, 1.14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // =========================================================================
  // LAPISAN 2 (ACTOR / KARAKTER): Spring Entrance & Idle Floating/Breathing
  // =========================================================================
  const actorSpring = spring({
    frame: sceneLocalFrame,
    fps,
    config: theme.springs.bouncy,
  });

  const actorEntranceScale = interpolate(actorSpring, [0, 1], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const actorEntranceOpacity = interpolate(actorSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const actorEntranceY = interpolate(actorSpring, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Idle floating and breathing
  const idleY = Math.sin(sceneLocalFrame * 0.08) * 9;
  const idleBreathe = 1 + Math.sin(sceneLocalFrame * 0.12) * 0.025;

  const hasEnvImage = Boolean(environmentAsset && environmentAsset.trim());
  const hasActorAsset = Boolean(actorAsset && actorAsset.trim());

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {/* ----------------------------------------------------------------- */}
      {/* LAPISAN 1: BACKGROUND (Environment Asset or Atmospheric Fallback) */}
      {/* ----------------------------------------------------------------- */}
      {hasEnvImage ? (
        <div
          style={{
            position: "absolute",
            inset: -80,
            width: "calc(100% + 160px)",
            height: "calc(100% + 160px)",
            transform: `translateX(${panX}px) scale(${bgZoom})`,
            transformOrigin: "center center",
            zIndex: 1,
          }}
        >
          <Img
            src={resolveAssetPath(environmentAsset!)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Subtle cinematic vignette overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, rgba(7, 11, 20, 0.75) 100%)",
            }}
          />
          {/* Subtle dark bottom gradient for subtitle readability */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 480,
              background:
                "linear-gradient(to top, rgba(7, 11, 20, 0.95) 0%, rgba(7, 11, 20, 0.6) 60%, transparent 100%)",
            }}
          />
        </div>
      ) : (
        /* Fallback: Noir Atmospheric Background with Spotlight & Dust */
        <AtmosphericBackground spotlightX={540} spotlightY={780} spotlightRadius={480} />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* LAPISAN 2: ACTOR / KARAKTER (Actor Asset or Dynamic Visual Fallback) */}
      {/* ----------------------------------------------------------------- */}
      {hasActorAsset ? (
        <div
          style={{
            position: "absolute",
            top: 450,
            left: 0,
            right: 0,
            bottom: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
            transform: `translateY(${actorEntranceY + idleY}px) scale(${actorEntranceScale * idleBreathe})`,
            opacity: actorEntranceOpacity,
            transformOrigin: "center bottom",
          }}
        >
          {isLottie && lottieData ? (
            <Lottie
              animationData={lottieData}
              style={{
                width: 680,
                height: 680,
                filter: `drop-shadow(0 24px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 24px ${themeColor}40)`,
              }}
            />
          ) : (
            <Img
              src={resolveAssetPath(actorAsset!)}
              style={{
                maxWidth: 720,
                maxHeight: 720,
                objectFit: "contain",
                filter: `drop-shadow(0 24px 40px rgba(0,0,0,0.85)) drop-shadow(0 0 24px ${themeColor}50)`,
              }}
            />
          )}
        </div>
      ) : (
        /* Fallback: Animated 2D Cartoon / Scientific SVG Centerpiece */
        <DynamicVisualCenter
          cue={visualCue || ""}
          objects={objects}
          text={text}
          sceneIndex={sceneIndex}
          channelId={channelId}
          themeColor={themeColor}
          sceneLocalFrame={sceneLocalFrame}
        />
      )}
    </AbsoluteFill>
  );
};
