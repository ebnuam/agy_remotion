import { Lottie, LottieAnimationData } from "@remotion/lottie";
import React, { useEffect, useState } from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface VisualCueProps {
  visual: string;
  themeColor: string;
  sceneIndex: number;
  sceneStartFrame: number;
}

type CueType = "scrolling" | "panic" | "lazy" | "default";

// Record mapping cue keywords to Lottie asset files
const LOTTIE_MAP: Record<CueType, string> = {
  scrolling: "lottie/scrolling.json",
  panic: "lottie/panic.json",
  lazy: "lottie/lazy.json",
  default: "lottie/default.json",
};

// Global in-memory cache to avoid duplicate fetches during frame rendering
const lottieCache = new Map<CueType, LottieAnimationData>();

export const VisualCue: React.FC<VisualCueProps> = ({
  visual,
  themeColor,
  sceneIndex,
  sceneStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Normalize AI visual cue to one of the 4 defined keys
  const getCueType = (cue: string): CueType => {
    const lower = (cue || "").toLowerCase().trim();
    if (lower === "scrolling" || lower.includes("scroll") || lower.includes("medsos") || lower.includes("hp")) {
      return "scrolling";
    }
    if (lower === "panic" || lower.includes("panic") || lower.includes("kepepet") || lower.includes("deadline")) {
      return "panic";
    }
    if (lower === "lazy" || lower.includes("lazy") || lower.includes("rebahan") || lower.includes("mager")) {
      return "lazy";
    }
    return "default";
  };

  const cueType = getCueType(visual);
  const filePath = LOTTIE_MAP[cueType] || LOTTIE_MAP.default;

  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    () => lottieCache.get(cueType) || null
  );

  // Remotion asynchronous asset loading with delayRender
  useEffect(() => {
    if (lottieCache.has(cueType)) {
      setAnimationData(lottieCache.get(cueType)!);
      return;
    }

    const handle = delayRender(`Loading Lottie animation: ${filePath}`);
    let isMounted = true;

    fetch(staticFile(filePath))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${filePath}: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: LottieAnimationData) => {
        lottieCache.set(cueType, data);
        if (isMounted) {
          setAnimationData(data);
          continueRender(handle);
        }
      })
      .catch((err) => {
        console.error(`Error loading Lottie animation ${filePath}:`, err);
        continueRender(handle);
      });

    return () => {
      isMounted = false;
    };
  }, [cueType, filePath]);

  // Smooth entrance scale-up animation on scene change
  const safeStart = Number.isFinite(sceneStartFrame) ? sceneStartFrame : 0;
  const localFrame = Math.max(0, Math.floor(frame - safeStart));

  const entrance = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 110,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.75, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const floatOffset = Math.sin((frame / fps) * 2.5) * 14;

  const getCueLabel = (type: CueType): string => {
    switch (type) {
      case "scrolling":
        return "📱 SCROLLING MEDSOS";
      case "panic":
        return "🚨 PANIK DEADLINE";
      case "lazy":
        return "🛋️ REBAHAN & MAGER";
      default:
        return "🧠 OTAK RECEH";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 380,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 15,
        opacity,
        transform: `translateY(${floatOffset}px) scale(${scale})`,
      }}
    >
      {/* Large Character / Lottie Animation Card Container */}
      <div
        style={{
          width: 660,
          height: 660,
          borderRadius: 80,
          background: "radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0.65))",
          backdropFilter: "blur(24px)",
          border: `3px solid ${themeColor}90`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 50px ${themeColor}35`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glowing backlight */}
        <div
          style={{
            position: "absolute",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${themeColor}30 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Lottie Animation Player */}
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop
            style={{
              width: 540,
              height: 540,
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.4))",
            }}
          />
        ) : (
          <div
            style={{
              width: 540,
              height: 540,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            Memuat Animasi...
          </div>
        )}

        {/* Dynamic Action Tag */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            padding: "10px 28px",
            borderRadius: 30,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            border: `1.5px solid ${themeColor}`,
            boxShadow: `0 6px 20px rgba(0,0,0,0.5)`,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {getCueLabel(cueType)}
          </span>
        </div>
      </div>
    </div>
  );
};
