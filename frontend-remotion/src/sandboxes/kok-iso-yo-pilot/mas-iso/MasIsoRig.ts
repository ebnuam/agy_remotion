/**
 * MAS ISO - Procedural Rig & Texture Cache
 * Creates and caches high-resolution THREE.CanvasTextures from MasIsoArt.
 * Provides ready-to-use Three.js billboard meshes with proper pivot anchors and contact shadows.
 */

import * as THREE from "three";
import { MasIsoArt } from "./MasIsoArt";
import { Expression, Gesture, ViewAngle } from "./types";
import { cardShade } from "../../bridge/cardshade";
import { NOINK } from "../../bridge/ink";

export interface MasIsoRigState {
  viewAngle: ViewAngle;
  expression: Expression;
  gesture: Gesture;
  headTilt?: number;
  lookDirection?: [number, number];
}

export class MasIsoRig {
  private static textureCache = new Map<string, THREE.CanvasTexture>();

  /**
   * Generates or retrieves a cached CanvasTexture for the specified character state.
   */
  public static getTexture(
    viewAngle: ViewAngle = "front",
    expression: Expression = "curious",
    gesture: Gesture = "idle",
    headTilt: number = 0,
    lookDirection: [number, number] = [0, 0]
  ): THREE.CanvasTexture {
    const key = `${viewAngle}_${expression}_${gesture}_${headTilt.toFixed(2)}_${lookDirection[0].toFixed(1)}_${lookDirection[1].toFixed(1)}`;

    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = MasIsoArt.CANVAS_W;
    canvas.height = MasIsoArt.CANVAS_H;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      MasIsoArt.render(ctx, {
        viewAngle,
        expression,
        gesture,
        headTilt,
        lookDirection,
      });
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Creates a complete, lit 2.5D Mas Iso character group for the 3D scene.
   * Total height = 1.62m (calibrated to the 3D lab environment).
   */
  public static createCharacterMesh(initialState: MasIsoRigState): {
    group: THREE.Group;
    billboard: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial>;
    shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    updateState: (state: MasIsoRigState) => void;
  } {
    const group = new THREE.Group();

    // Height = 1.62m in 3D world space
    const charH = 1.62;
    // Master canvas is 1024 x 1536 (2:3 aspect ratio)
    const charW = charH * (MasIsoArt.CANVAS_W / MasIsoArt.CANVAS_H);

    // Initial Texture
    const texture = this.getTexture(
      initialState.viewAngle,
      initialState.expression,
      initialState.gesture,
      initialState.headTilt ?? 0,
      initialState.lookDirection ?? [0, 0]
    );

    // Billboard Quad
    const geo = new THREE.PlaneGeometry(charW, charH);
    // Center character vertically so local y=0 is at the floor (soles of shoes)
    geo.translate(0, charH / 2, 0);

    const mat = cardShade(
      new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
      })
    );

    const billboard = new THREE.Mesh(geo, mat);
    billboard.castShadow = true;
    billboard.receiveShadow = true;
    billboard.layers.set(NOINK);
    group.add(billboard);

    // Dynamic Contact Shadow Blob on the ground
    const shadowGeo = new THREE.PlaneGeometry(0.68, 0.32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.005, 0);
    shadow.layers.set(NOINK);
    group.add(shadow);

    // State updater
    const updateState = (state: MasIsoRigState) => {
      const newTex = this.getTexture(
        state.viewAngle,
        state.expression,
        state.gesture,
        state.headTilt ?? 0,
        state.lookDirection ?? [0, 0]
      );
      if (mat.map !== newTex) {
        mat.map = newTex;
        mat.needsUpdate = true;
      }
    };

    return { group, billboard, shadow, updateState };
  }
}
