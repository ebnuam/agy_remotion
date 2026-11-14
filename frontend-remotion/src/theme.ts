import { Easing } from "remotion";

export const theme = {
  colors: {
    bgDark: "#090D16",
    bgDarkSecondary: "#0F172A",
    spotlight: "rgba(251, 191, 36, 0.15)",
    gold: "#F59E0B",
    goldBright: "#FBBF24",
    crimson: "#DC2626",
    stampRed: "#EF4444",
    manilaPaper: "#F5E6CA",
    manilaPaperDark: "#E5D2AD",
    typewriterBlack: "#1C1917",
    cardNavy: "#1E293B",
    textWhite: "#FFFFFF",
    textMuted: "#6B7280",
    textDim: "#4B5563",
    borderSubtle: "rgba(255, 255, 255, 0.12)",
    borderGold: "rgba(245, 158, 11, 0.4)",
  },

  fonts: {
    headline: "'Impact', 'Bebas Neue', 'Anton', sans-serif",
    typewriter: "'Courier New', 'Space Mono', 'Consolas', monospace",
    body: "system-ui, -apple-system, 'Inter', 'Plus Jakarta Sans', sans-serif",
  },

  springs: {
    snappy: { damping: 14, stiffness: 140 },
    gentle: { damping: 18, stiffness: 80 },
    bouncy: { damping: 10, stiffness: 120 },
    stampImpact: { damping: 8, stiffness: 180 },
    sway: { damping: 25, stiffness: 40 },
  },

  easings: {
    easeOutExpo: Easing.bezier(0.16, 1, 0.3, 1),
    easeInOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
    anticipate: Easing.bezier(0.36, 0, 0.66, -0.56),
  },
};
