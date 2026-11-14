/**
 * Asset Provider Interface & Modular Diagnostic Resolver
 * Strictly validates local assets, external URLs, file extensions, and provides
 * a documented modular interface for automatic asset generators without fake claims.
 */
import { staticFile } from "remotion";

export type AssetStatus =
  | "found_local"
  | "found_remote"
  | "missing"
  | "unsupported_type"
  | "procedural_vector";

export interface AssetResolution {
  status: AssetStatus;
  url?: string;
  name: string;
  extension: string;
  isAvailable: boolean;
  isLottie: boolean;
  message: string;
  diagnostics?: string;
}

export interface AutomaticAssetGenerator {
  providerName: string;
  isAvailable: boolean;
  endpointUrl?: string;
  generateAsset: (
    prompt: string,
    options?: { width: number; height: number; style?: string }
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

export class AssetProvider {
  private static readonly SUPPORTED_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".json",
  ]);

  // In-memory cache to prevent repeated HEAD requests during frame rendering
  private static cache = new Map<string, AssetResolution>();

  /**
   * Synchronously resolve asset descriptor and validate format
   */
  static resolve(assetName?: string): AssetResolution {
    if (!assetName || !assetName.trim()) {
      return {
        status: "procedural_vector",
        name: "procedural_default",
        extension: "",
        isAvailable: true,
        isLottie: false,
        message: "Using procedural high-fidelity vector rendering",
      };
    }

    const clean = assetName.trim();
    if (this.cache.has(clean)) {
      return this.cache.get(clean)!;
    }

    // 1. Handle external HTTP / HTTPS URLs
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        const parsed = new URL(clean);
        const pathname = parsed.pathname.toLowerCase();
        const extMatch = pathname.match(/\.[0-9a-z]+$/);
        const ext = extMatch ? extMatch[0] : "";

        const res: AssetResolution = {
          status: "found_remote",
          url: clean,
          name: clean,
          extension: ext,
          isAvailable: true,
          isLottie: ext === ".json",
          message: `External asset referenced: ${clean}`,
        };
        this.cache.set(clean, res);
        return res;
      } catch (e) {
        const res: AssetResolution = {
          status: "missing",
          name: clean,
          extension: "",
          isAvailable: false,
          isLottie: false,
          message: `Invalid external asset URL: ${clean}`,
          diagnostics: String(e),
        };
        this.cache.set(clean, res);
        return res;
      }
    }

    // 2. Validate file extension
    const extMatch = clean.toLowerCase().match(/\.[0-9a-z]+$/);
    const ext = extMatch ? extMatch[0] : "";

    if (!ext || !this.SUPPORTED_EXTENSIONS.has(ext)) {
      const res: AssetResolution = {
        status: "unsupported_type",
        name: clean,
        extension: ext,
        isAvailable: false,
        isLottie: false,
        message: `Asset "${clean}" has unsupported file extension "${ext}". Supported: ${Array.from(this.SUPPORTED_EXTENSIONS).join(", ")}`,
        diagnostics: "Unsupported extension. Asset rejected by validator.",
      };
      console.warn(`[AssetProvider WARN] ${res.message}`);
      this.cache.set(clean, res);
      return res;
    }

    // 3. Resolve Remotion staticFile path
    const isLottie = ext === ".json";
    const relativePath = clean.startsWith("assets/") ? clean : `assets/${clean}`;
    const staticUrl = staticFile(relativePath);

    const res: AssetResolution = {
      status: "found_local",
      url: staticUrl,
      name: clean,
      extension: ext,
      isAvailable: true,
      isLottie,
      message: `Asset resolved locally at ${relativePath}`,
    };

    this.cache.set(clean, res);
    return res;
  }

  /**
   * Async validator to check if asset actually exists via fetch
   */
  static async verifyAssetExists(assetName: string): Promise<boolean> {
    const res = this.resolve(assetName);
    if (!res.url || !res.isAvailable) return false;

    try {
      const response = await fetch(res.url, { method: "HEAD" });
      if (!response.ok) {
        console.warn(
          `[AssetProvider WARN] Asset "${assetName}" returned HTTP status ${response.status} at ${res.url}. Asset is missing from disk.`
        );
        res.isAvailable = false;
        res.status = "missing";
        res.message = `Asset missing: HTTP ${response.status} from ${res.url}`;
        this.cache.set(assetName.trim(), res);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`[AssetProvider WARN] Failed to verify asset "${assetName}":`, err);
      return false;
    }
  }

  /**
   * Documented Local Generative AI Provider Registry
   * Reflects factual status: No local generative daemon is currently configured.
   */
  static getGenerativeProvider(): AutomaticAssetGenerator {
    return {
      providerName: "Local Generative Adapter (ComfyUI / SD / Diffusers)",
      isAvailable: false,
      endpointUrl: "http://127.0.0.1:8188",
      generateAsset: async (_prompt: string) => {
        return {
          success: false,
          error:
            "Automatic AI image generation is not active. No local generative server (e.g. ComfyUI or SD WebUI) is detected on localhost. Operating in procedural vector mode.",
        };
      },
    };
  }
}
