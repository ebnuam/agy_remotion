/**
 * KOK ISO YO? - PILOT 01 COMPLETE SCENE COMPONENT
 * 60-Second Video Short in Bridge Test C Visual Style
 * Topic: "Kenapa Es Batu Bisa Mengapung?"
 * 
 * Features:
 * - Three.js WebGL 3D World (Laboratory, Molecular Realm, Demonstration Stage)
 * - Bridge Test C Postprocessing Stack:
 *   * InkPass (silhouette & crease outlining for 3D world geometry)
 *   * LensBlur (cinematic thin-lens depth of field)
 *   * BloomEffect (emissive & highlight glow)
 *   * ToneMappingEffect (ACES Filmic)
 *   * GradeEffect (warm laboratory color grading)
 * - Kinetic Subtitles synchronized with voiceover narration
 * - Multi-track Audio Pipeline: Looped BGM, 5-scene VO, and precision SFX
 */

import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  AbsoluteFill,
  Audio,
  Loop,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { AUDIO_TRACKS, SHOTS } from "./constants";
import { KokIsoYoWorld } from "./KokIsoYoWorld";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH } from "../bridge/grade";

// 1. Texture Initialization
const useTextures = () => {
  return useMemo<Record<string, THREE.Texture>>(() => ({}), []);
};

// 2. Three.js Inner Render Loop with Bridge Look-Match Postprocessing
const InnerWorld: React.FC<{ textures: Record<string, THREE.Texture> }> = ({ textures }) => {
  const frame = useCurrentFrame();
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;

  const world = useMemo(() => new KokIsoYoWorld(textures), [textures]);

  // Update world simulation and camera choreography synchronously before render
  world.update(frame, cam, scene);
  noInkFallback(world.root);

  // Postprocessing Stack (Bridge Test C Architecture)
  const fx = useMemo(() => {
    const ink = new InkPass(scene, cam, {
      color: "#050505",
      strength: 0.9,
      widthNear: 3.6,
      widthFar: 2.2,
    });
    const lens = new LensBlur({ maxCoC: 20, nearScale: 1.15 });
    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      intensity: 0.4,
      luminanceThreshold: 0.95,
      mipmapBlur: true,
      levels: 5,
    });
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const grade = new GradeEffect(GRADES.day, GRADE_STRENGTH.day * 0.85);

    return { ink, lens, bloom, tone, grade };
  }, [cam, scene]);

  useEffect(() => () => fx.ink.dispose(), [fx]);

  // Thin-lens focus distance (focused on primary visual target)
  fx.lens.focus = Math.max(0.4, world.getFocusDistance(cam));
  fx.lens.cInf = 14;

  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.lens.pre} dispose={null} />
        <primitive object={fx.lens.main} dispose={null} />
        <primitive object={fx.bloom} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.grade} dispose={null} />
      </EffectComposer>
    </>
  );
};

// 3. Kinetic Subtitle Overlay Component (5 Scenes Synced)
const KineticSubtitle: React.FC = () => {
  const frame = useCurrentFrame();

  let text = "";
  let highlightPhrase = "";

  if (frame >= SHOTS.scene1.startFrame && frame < SHOTS.scene1.endFrame) {
    if (frame >= SHOTS.scene1.voStartFrame - 5) {
      text = SHOTS.scene1.caption;
      highlightPhrase = SHOTS.scene1.highlightWord;
    }
  } else if (frame >= SHOTS.scene2.startFrame && frame < SHOTS.scene2.endFrame) {
    if (frame >= SHOTS.scene2.voStartFrame - 5) {
      text = SHOTS.scene2.caption;
      highlightPhrase = SHOTS.scene2.highlightWord;
    }
  } else if (frame >= SHOTS.scene3.startFrame && frame < SHOTS.scene3.endFrame) {
    if (frame >= SHOTS.scene3.voStartFrame - 5) {
      if (frame < SHOTS.scene3.splitFrame) {
        text = SHOTS.scene3.captionPart1;
        highlightPhrase = SHOTS.scene3.highlightWord1;
      } else {
        text = SHOTS.scene3.captionPart2;
        highlightPhrase = SHOTS.scene3.highlightWord2;
      }
    }
  } else if (frame >= SHOTS.scene4.startFrame && frame < SHOTS.scene4.endFrame) {
    if (frame >= SHOTS.scene4.voStartFrame - 5) {
      text = SHOTS.scene4.caption;
      highlightPhrase = SHOTS.scene4.highlightWord;
    }
  } else if (frame >= SHOTS.scene5.startFrame) {
    if (frame >= SHOTS.scene5.voStartFrame - 5) {
      text = SHOTS.scene5.caption;
      highlightPhrase = SHOTS.scene5.highlightWord;
    }
  }

  if (!text) return null;

  const words = text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 95,
        left: 24,
        right: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(18, 24, 32, 0.90)",
          border: "2px solid rgba(255, 209, 102, 0.65)",
          padding: "10px 20px",
          borderRadius: 24,
          boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
          textAlign: "center",
          color: "#FFFFFF",
          fontSize: 20,
          fontWeight: 800,
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          letterSpacing: 0.2,
          lineHeight: 1.35,
          maxWidth: "88%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: 4,
        }}
      >
        {words.map((word, i) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const isHighlight = highlightPhrase
            .toLowerCase()
            .split(" ")
            .some((hw) => hw && cleanWord.includes(hw));

          return (
            <span
              key={i}
              style={{
                color: isHighlight ? "#FFD166" : "#FFFFFF",
                marginRight: 6,
                textDecoration: isHighlight ? "underline" : "none",
                textUnderlineOffset: 4,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// 4. Channel Watermark & Badge
const ChannelWatermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        left: 32,
        display: "flex",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <div
        style={{
          backgroundColor: "#1E7B85",
          color: "#FFFFFF",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: 14,
          fontWeight: 900,
          padding: "6px 14px",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          letterSpacing: 1.0,
          border: "1.5px solid rgba(255,255,255,0.3)",
        }}
      >
        KOK ISO YO?
      </div>
    </div>
  );
};

// 5. Main Exported Pilot Scene
export const KokIsoYoScene: React.FC = () => {
  const textures = useTextures();
  const { width, height } = useVideoConfig();

  if (!textures) {
    return <AbsoluteFill style={{ backgroundColor: "#1A2026" }} />;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A2026", overflow: "hidden" }}>
      {/* 3D WebGL Canvas */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 42, near: 0.1, far: 50 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          toneMappingExposure: 1.0,
        }}
      >
        <InnerWorld textures={textures} />
      </ThreeCanvas>

      {/* Channel Watermark */}
      <ChannelWatermark />

      {/* Kinetic Subtitles */}
      <KineticSubtitle />

      {/* ================================================================= */}
      {/* AUDIO LAYER 1: Background Music (Looped across 60.0 seconds)      */}
      {/* ================================================================= */}
      <Loop durationInFrames={240}>
        <Audio src={staticFile(AUDIO_TRACKS.bgm)} volume={0.24} />
      </Loop>

      {/* ================================================================= */}
      {/* AUDIO LAYER 2: Voice-Over Sequences (5 Scenes)                   */}
      {/* ================================================================= */}
      {/* Scene 1 VO */}
      <Sequence from={SHOTS.scene1.voStartFrame} durationInFrames={SHOTS.scene1.duration - SHOTS.scene1.voStartFrame}>
        <Audio src={staticFile(SHOTS.scene1.voFile)} volume={1.0} />
      </Sequence>

      {/* Scene 2 VO */}
      <Sequence from={SHOTS.scene2.voStartFrame} durationInFrames={SHOTS.scene2.duration - (SHOTS.scene2.voStartFrame - SHOTS.scene2.startFrame)}>
        <Audio src={staticFile(SHOTS.scene2.voFile)} volume={1.0} />
      </Sequence>

      {/* Scene 3 VO */}
      <Sequence from={SHOTS.scene3.voStartFrame} durationInFrames={SHOTS.scene3.duration - (SHOTS.scene3.voStartFrame - SHOTS.scene3.startFrame)}>
        <Audio src={staticFile(SHOTS.scene3.voFile)} volume={1.0} />
      </Sequence>

      {/* Scene 4 VO */}
      <Sequence from={SHOTS.scene4.voStartFrame} durationInFrames={SHOTS.scene4.duration - (SHOTS.scene4.voStartFrame - SHOTS.scene4.startFrame)}>
        <Audio src={staticFile(SHOTS.scene4.voFile)} volume={1.0} />
      </Sequence>

      {/* Scene 5 VO */}
      <Sequence from={SHOTS.scene5.voStartFrame} durationInFrames={SHOTS.scene5.duration - (SHOTS.scene5.voStartFrame - SHOTS.scene5.startFrame)}>
        <Audio src={staticFile(SHOTS.scene5.voFile)} volume={1.0} />
      </Sequence>

      {/* ================================================================= */}
      {/* AUDIO LAYER 3: Sound Effects (SFX Choreography)                  */}
      {/* ================================================================= */}
      {/* Scene 1: Initial Whoosh & Ice Plunge Splash */}
      <Sequence from={0} durationInFrames={18}>
        <Audio src={staticFile(AUDIO_TRACKS.whoosh)} volume={0.4} />
      </Sequence>
      <Sequence from={24} durationInFrames={25}>
        <Audio src={staticFile(AUDIO_TRACKS.iceClink)} volume={0.7} />
      </Sequence>

      {/* Scene 2: Transition Whoosh & Heavy Metal Sink Clink */}
      <Sequence from={232} durationInFrames={18}>
        <Audio src={staticFile(AUDIO_TRACKS.whoosh)} volume={0.45} />
      </Sequence>
      <Sequence from={332} durationInFrames={25}>
        <Audio src={staticFile(AUDIO_TRACKS.iceClink)} volume={0.65} />
      </Sequence>

      {/* Scene 3: Zoom into Molecular Space & Crystal Freeze Snap */}
      <Sequence from={532} durationInFrames={18}>
        <Audio src={staticFile(AUDIO_TRACKS.whoosh)} volume={0.5} />
      </Sequence>
      <Sequence from={718} durationInFrames={25}>
        <Audio src={staticFile(AUDIO_TRACKS.iceClink)} volume={0.7} />
      </Sequence>

      {/* Scene 4: Transition to Demonstration Stage */}
      <Sequence from={1132} durationInFrames={18}>
        <Audio src={staticFile(AUDIO_TRACKS.whoosh)} volume={0.45} />
      </Sequence>

      {/* Scene 5: Return to Lab & Comedic Punchline Pop! */}
      <Sequence from={1492} durationInFrames={18}>
        <Audio src={staticFile(AUDIO_TRACKS.whoosh)} volume={0.45} />
      </Sequence>
      <Sequence from={1572} durationInFrames={20}>
        <Audio src={staticFile(AUDIO_TRACKS.punchlinePop)} volume={0.85} />
      </Sequence>
    </AbsoluteFill>
  );
};
