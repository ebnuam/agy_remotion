import React from "react";
import { Composition } from "remotion";
import { CartoonPrototype } from "./cartoon/CartoonPrototype";
import { OddlyKnownScene } from "./channels/oddlyKnown/OddlyKnownScene";
import { OtakRecehScene } from "./channels/otakReceh/OtakRecehScene";
import { SantriAIScene } from "./channels/santriAI/SantriAIScene";
import { MainVideo } from "./components/MainVideo";
import { CinematicRiddlePrototype } from "./motion/CinematicRiddlePrototype";
import { defaultRenderProps, RenderProps } from "./types";

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. Channel 1 Prototype: Otak Receh (Playful, Colorful, Everyday Humor) */}
      <Composition
        id="OtakRecehProto"
        component={OtakRecehScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 2. Channel 2 Prototype: Santri AI (Majestic, Serene, Islamic Knowledge & History) */}
      <Composition
        id="SantriAIProto"
        component={SantriAIScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3. Channel 3 Prototype: Oddly Known (Science Facts, Curiosity, Tech Blueprint) */}
      <Composition
        id="OddlyKnownProto"
        component={OddlyKnownScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Cinematic 2D Motion Graphics Riddle Storytelling (Reference Style, 15s, 450 frames, 30fps) */}
      <Composition
        id="CinematicRiddle"
        component={CinematicRiddlePrototype}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 2D Cartoon Storytelling Prototype (15 seconds, 450 frames, 30fps) */}
      <Composition
        id="CartoonPrototype"
        component={CartoonPrototype}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Production Pipeline MainVideo */}
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={30 * 37}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultRenderProps}
        calculateMetadata={async ({ props }: { props: RenderProps }) => {
          const fps = 30;
          const durSec = props.audio_duration > 0 ? props.audio_duration : 35;
          // Add 0.5s buffer at the end for smooth closing
          const durationInFrames = Math.ceil((durSec + 0.5) * fps);

          return {
            durationInFrames,
            fps,
            width: 1080,
            height: 1920,
          };
        }}
      />
    </>
  );
};

