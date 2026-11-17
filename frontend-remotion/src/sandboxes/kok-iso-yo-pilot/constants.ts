/**
 * KOK ISO YO? - PILOT 01 CONSTANTS & TIMELINE
 * Title: "Kenapa Es Batu Bisa Mengapung?"
 * Complete 60-Second Pilot (Bridge Test C Visual Style)
 * Duration: 60.00 seconds = 1800 frames @ 30 FPS
 * Preview: 540 x 960 (9:16 vertical)
 * Production: 1080 x 1920 (9:16 vertical Full HD)
 */

export const PILOT_CONFIG = {
  fps: 30,
  durationInFrames: 1800, // 60.0 seconds
  width: 540,
  height: 960,
  productionWidth: 1080,
  productionHeight: 1920,
} as const;

export const SHOTS = {
  // Scene 1: Hook (0 - 8s)
  scene1: {
    startFrame: 0,
    endFrame: 240,
    duration: 240,
    voStartFrame: 70,
    voFile: "assets/kok_iso_yo/vo_scene1.mp3",
    caption: "Kok es batu bisa mengapung?",
    highlightWord: "mengapung",
  },
  // Scene 2: The Question (8 - 18s)
  scene2: {
    startFrame: 240,
    endFrame: 540,
    duration: 300,
    voStartFrame: 290,
    voFile: "assets/kok_iso_yo/vo_scene2.mp3",
    caption: "Padahal, bukannya benda padat harusnya tenggelam?",
    highlightWord: "tenggelam",
  },
  // Scene 3: Scientific Explanation (18 - 38s)
  scene3: {
    startFrame: 540,
    endFrame: 1140,
    duration: 600,
    voStartFrame: 580,
    voFile: "assets/kok_iso_yo/vo_scene3.mp3",
    captionPart1: "Saat membeku, molekul air membentuk susunan yang lebih renggang.",
    captionPart2: "Akibatnya, volume air bertambah dan massa jenisnya justru turun.",
    splitFrame: 840,
    highlightWord1: "lebih renggang",
    highlightWord2: "massa jenisnya turun",
  },
  // Scene 4: Demonstration (38 - 50s)
  scene4: {
    startFrame: 1140,
    endFrame: 1500,
    duration: 360,
    voStartFrame: 1180,
    voFile: "assets/kok_iso_yo/vo_scene4.mp3",
    caption: "Itulah sebabnya es bisa mengapung di atas air.",
    highlightWord: "mengapung di atas air",
  },
  // Scene 5: Punchline & Outro (50 - 60s)
  scene5: {
    startFrame: 1500,
    endFrame: 1800,
    duration: 300,
    voStartFrame: 1560,
    voFile: "assets/kok_iso_yo/vo_scene5.mp3",
    caption: "Dingin-dingin malah makan tempat!",
    highlightWord: "makan tempat!",
  },
} as const;

export const AUDIO_TRACKS = {
  bgm: "assets/kok_iso_yo/bgm_kok_iso_yo.wav",
  whoosh: "assets/kok_iso_yo/whoosh.wav",
  iceClink: "assets/kok_iso_yo/ice_clink.wav",
  punchlinePop: "assets/kok_iso_yo/pop_punchline.wav",
} as const;
