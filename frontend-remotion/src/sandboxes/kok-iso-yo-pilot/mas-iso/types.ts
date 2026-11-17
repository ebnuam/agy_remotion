/**
 * MAS ISO - Vector Character Type Definitions & Palette
 * Reference: mas_iso_character_model_sheet_v2.jpg & KOK_ISO_YO_CHARACTER_DESIGN.md
 */

export type ViewAngle = "front" | "threeQuarter";

export type Expression =
  | "neutral"
  | "curious"
  | "explaining"
  | "deadpan"
  | "shocked";

export type Gesture =
  | "idle"
  | "pointing"
  | "thinking"
  | "explaining";

export const PALETTE = {
  skin: "#F8D7B8",
  skinShade: "#E8BFA0",
  hair: "#241B18",
  hairHighlight: "#3D2E28",
  outline: "#18181A",
  vest: "#1E7B85",
  vestShade: "#165E66",
  vestPocket: "#196E77",
  shirt: "#F4F1EA",
  shirtShade: "#DDD7C8",
  trousers: "#8C5835",
  trousersShade: "#724426",
  shoes: "#242028",
  shoesWhite: "#F8F9FA",
  notepad: "#FFFFFF",
  penClip: "#FFD166",
  eyeWhite: "#FFFFFF",
  eyeIris: "#241B18",
  mouthCavity: "#661D28",
  tongue: "#E76F51",
};

export interface MasIsoDrawOptions {
  viewAngle?: ViewAngle;
  expression?: Expression;
  gesture?: Gesture;
  headTilt?: number;      // in radians
  lookDirection?: [number, number]; // normalized [-1..1, -1..1]
  talkingMouthOpen?: number; // 0..1
}
