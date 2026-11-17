/**
 * MAS ISO - Remotion Entry Point for Design Preview
 */

import React from "react";
import { Composition, registerRoot } from "remotion";
import { MasIsoPreview } from "./MasIsoPreview";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MasIsoDesignPreview"
        component={MasIsoPreview}
        durationInFrames={30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);
