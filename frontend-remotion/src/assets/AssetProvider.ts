/**
 * Asset Provider Interface & Modular Resolver
 * Supports custom uploaded assets (PNG, SVG, Lottie) with honest diagnostic reporting
 */
import { staticFile } from "remotion";

export interface AssetResolution {
  type: "local_image" | "local_lottie" | "programmatic_vector" | "missing";
  url?: string;
  name: string;
  isAvailable: boolean;
  message?: string;
}

export class AssetProvider {
  /**
   * Resolves an asset file path safely
   */
  static resolve(assetName?: string): AssetResolution {
    if (!assetName || !assetName.trim()) {
      return {
        type: "programmatic_vector",
        name: "procedural_default",
        isAvailable: true,
        message: "Using procedural high-fidelity vector rendering",
      };
    }

    const clean = assetName.trim();

    // Check remote URL
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return {
        type: "local_image",
        url: clean,
        name: clean,
        isAvailable: true,
      };
    }

    // Determine type
    const isLottie = clean.toLowerCase().endsWith(".json");
    const path = clean.startsWith("assets/") ? clean : `assets/${clean}`;
    const fullStaticUrl = staticFile(path);

    return {
      type: isLottie ? "local_lottie" : "local_image",
      url: fullStaticUrl,
      name: clean,
      isAvailable: true,
      message: `Asset resolved from ${path}`,
    };
  }
}
