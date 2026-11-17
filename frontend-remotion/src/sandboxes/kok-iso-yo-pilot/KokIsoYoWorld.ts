/**
 * KOK ISO YO? - PILOT 01 COMPLETE 3D WORLD & ANIMATION ENGINE
 * Visual Reference: Bridge Test C (2.5D Illustrated Stickman in 3D Toon World)
 * Topic: "Kenapa Es Batu Bisa Mengapung?"
 * Duration: 60.00 seconds = 1800 frames @ 30 FPS
 * 
 * Features:
 * - 5 Distinct Story Scenes: Hook, Question, Molecular Explanation, Density Demo, Punchline
 * - Procedural 2.5D Mas Iso billboard rig with contact shadows & Bridge cardShade
 * - 3D Laboratory Room, Microscopic Molecular Lattice, and Demonstration Stage
 * - Cinematic camera choreography with smooth glides, continuous push-ins, and cuts
 * - Dynamic thin-lens DOF focus tracking
 */

import * as THREE from "three";
import { SHOTS } from "./constants";
import { MasIsoRig, MasIsoRigState } from "./mas-iso/MasIsoRig";
import { NOINK } from "../bridge/ink";

export class KokIsoYoWorld {
  public root: THREE.Group;
  private textures: Record<string, THREE.Texture>;

  // 1. Scene Groups
  private labGroup: THREE.Group;
  private moleculeGroup: THREE.Group;
  private demoGroup: THREE.Group;

  // 2. Lab Scene Objects (Scene 1, 2, 5)
  private glassGroup: THREE.Group;
  private secondGlassGroup: THREE.Group;
  private iceCube: THREE.Mesh;
  private secondIceCube: THREE.Mesh;
  private metalBolt: THREE.Mesh;
  private chalkboard: THREE.Group;

  // 3. Molecular Scene Objects (Scene 3)
  private molecules: {
    group: THREE.Group;
    liquidPos: THREE.Vector3;
    solidPos: THREE.Vector3;
    rotSpeed: THREE.Vector3;
  }[] = [];
  private hBonds: THREE.Mesh[] = [];
  private molecularVolumeBox: THREE.LineSegments;
  private formulaGroup: THREE.Group;

  // 4. Demonstration Stage Objects (Scene 4)
  private liquidWaterCube: THREE.Mesh;
  private solidIceCube: THREE.Mesh;
  private demoWaterTank: THREE.Group;
  private floatingDemoIce: THREE.Mesh;
  private buoyantForceArrow: THREE.Group;

  // 5. Mas Iso Character Billboard Instances
  private masIsoLabGroup!: THREE.Group;
  private masIsoLabUpdate!: (state: MasIsoRigState) => void;

  private masIsoMoleculeGroup!: THREE.Group;
  private masIsoMoleculeUpdate!: (state: MasIsoRigState) => void;

  private masIsoDemoGroup!: THREE.Group;
  private masIsoDemoUpdate!: (state: MasIsoRigState) => void;

  // Camera focus tracking for LensBlur DoF
  private currentFocusTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(textures: Record<string, THREE.Texture> = {}) {
    this.textures = textures;
    this.root = new THREE.Group();

    this.labGroup = new THREE.Group();
    this.moleculeGroup = new THREE.Group();
    this.demoGroup = new THREE.Group();

    this.root.add(this.labGroup);
    this.root.add(this.moleculeGroup);
    this.root.add(this.demoGroup);

    // Build all scene assets
    this.buildLighting();
    this.buildLabEnvironment();
    this.buildLabTableAndGlassware();
    this.buildMolecularRealm();
    this.buildDemonstrationStage();
    this.buildMasIsoCharacters();
  }

  // =========================================================================
  // 1. LIGHTING (Bridge Style Warm Sunlight & Cool Rim)
  // =========================================================================
  private buildLighting() {
    // Ambient light: Soft welcoming sky fill
    const ambient = new THREE.AmbientLight("#CCE4F8", 0.95);
    this.root.add(ambient);

    // Sun Key Light: Warm directional light (casts shadow)
    const sunLight = new THREE.DirectionalLight("#FFF5E4", 2.4);
    sunLight.position.set(-4.0, 6.0, 4.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    this.root.add(sunLight);

    // Cool Rim Light: Cyan back-edge separation
    const rimLight = new THREE.DirectionalLight("#90E0EF", 1.3);
    rimLight.position.set(3.0, 4.5, -3.5);
    this.root.add(rimLight);

    // Soft Table/Floor Bounce
    const bounceLight = new THREE.DirectionalLight("#FFE8D6", 0.45);
    bounceLight.position.set(0, -0.5, 2.5);
    this.root.add(bounceLight);
  }

  // =========================================================================
  // 2. LABORATORY ENVIRONMENT (Scenes 1, 2, 5)
  // =========================================================================
  private buildLabEnvironment() {
    // Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#5C4033",
      roughness: 0.35,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.labGroup.add(floor);

    // Slate Blue Back Wall
    const wallGeo = new THREE.PlaneGeometry(20, 10);
    const wallMat = new THREE.MeshStandardMaterial({
      color: "#243447",
      roughness: 0.85,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4.5, -3.8);
    backWall.receiveShadow = true;
    this.labGroup.add(backWall);

    // Wooden Baseboard Trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.25, 0.1),
      new THREE.MeshStandardMaterial({ color: "#3D2B1F" })
    );
    trim.position.set(0, 0.125, -3.75);
    this.labGroup.add(trim);

    // Large Laboratory Chalkboard with Science Diagrams
    this.chalkboard = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(4.2, 2.2, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({ color: "#7F5539", roughness: 0.5 });
    const boardFrame = new THREE.Mesh(frameGeo, frameMat);
    boardFrame.position.set(0, 2.4, -3.7);
    this.chalkboard.add(boardFrame);

    const innerGeo = new THREE.PlaneGeometry(3.96, 1.96);
    const innerMat = new THREE.MeshStandardMaterial({ color: "#18231E", roughness: 0.95 });
    const boardInner = new THREE.Mesh(innerGeo, innerMat);
    boardInner.position.set(0, 2.4, -3.65);
    this.chalkboard.add(boardInner);

    // Chalk diagrams (Hexagonal rings & H2O text symbols)
    const chalkMat = new THREE.MeshBasicMaterial({ color: "#E0FBFC" });
    const cRing = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.28, 6), chalkMat);
    cRing.position.set(-1.3, 2.5, -3.64);
    this.chalkboard.add(cRing);

    const cRing2 = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.21, 6), chalkMat);
    cRing2.position.set(-0.8, 2.2, -3.64);
    this.chalkboard.add(cRing2);

    this.labGroup.add(this.chalkboard);

    // Laboratory Wall Shelves with Chemical Flasks
    const shelfGeo = new THREE.BoxGeometry(2.0, 0.06, 0.35);
    const shelfMat = new THREE.MeshStandardMaterial({ color: "#4A3525", roughness: 0.6 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(2.2, 2.5, -3.5);
    this.labGroup.add(shelf);

    // Beakers on wall shelf
    const beakerMat1 = new THREE.MeshStandardMaterial({ color: "#00B4D8", transparent: true, opacity: 0.8 });
    const beakerMat2 = new THREE.MeshStandardMaterial({ color: "#F77F00", transparent: true, opacity: 0.8 });
    const flask1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.3, 16), beakerMat1);
    flask1.position.set(1.8, 2.68, -3.5);
    this.labGroup.add(flask1);

    const flask2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.26, 16), beakerMat2);
    flask2.position.set(2.3, 2.66, -3.5);
    this.labGroup.add(flask2);
  }

  // =========================================================================
  // 3. EXPERIMENT TABLE & GLASSWARE
  // =========================================================================
  private buildLabTableAndGlassware() {
    const tableGroup = new THREE.Group();

    // Tabletop
    const topGeo = new THREE.BoxGeometry(2.6, 0.1, 1.4);
    const topMat = new THREE.MeshStandardMaterial({
      color: "#8B5A2B",
      roughness: 0.35,
      metalness: 0.05,
    });
    const tabletop = new THREE.Mesh(topGeo, topMat);
    tabletop.position.set(0.2, 0.75, 0.1);
    tabletop.receiveShadow = true;
    tabletop.castShadow = true;
    tableGroup.add(tabletop);

    // 4 Table Legs
    const legGeo = new THREE.BoxGeometry(0.09, 0.75, 0.09);
    const legMat = new THREE.MeshStandardMaterial({ color: "#5C3A1E", roughness: 0.6 });
    const legPositions = [
      [-1.1, 0.375, -0.55],
      [1.1, 0.375, -0.55],
      [-1.1, 0.375, 0.55],
      [1.1, 0.375, 0.55],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(0.2 + x, y, 0.1 + z);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    this.labGroup.add(tableGroup);

    // Glass 1: Water with Floating Ice Cube (Main Focus)
    this.glassGroup = new THREE.Group();
    this.glassGroup.position.set(0.08, 0.8, 0.25);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#E2F1F8",
      transparent: true,
      opacity: 0.38,
      roughness: 0.04,
      transmission: 0.82,
      ior: 1.5,
    });

    // Glass Cylinder Body
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.5, 24, 1, true), glassMat);
    cylinder.position.y = 0.25;
    this.glassGroup.add(cylinder);

    // Glass Solid Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 24), glassMat);
    base.position.y = 0.015;
    this.glassGroup.add(base);

    // Water Volume
    const waterMat = new THREE.MeshStandardMaterial({
      color: "#48CAE4",
      transparent: true,
      opacity: 0.65,
      roughness: 0.08,
    });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.175, 0.38, 24), waterMat);
    water.position.y = 0.205;
    this.glassGroup.add(water);

    // Main Floating Ice Cube
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: "#CAF0F8",
      transparent: true,
      opacity: 0.88,
      roughness: 0.06,
      transmission: 0.65,
      ior: 1.31,
    });
    this.iceCube = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), iceMat);
    this.iceCube.position.set(0.02, 0.37, 0.02);
    this.iceCube.rotation.set(0.15, 0.35, -0.1);
    this.iceCube.castShadow = true;
    this.glassGroup.add(this.iceCube);

    // Second smaller ice cube
    this.secondIceCube = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), iceMat);
    this.secondIceCube.position.set(-0.06, 0.35, -0.04);
    this.secondIceCube.rotation.set(-0.2, 0.5, 0.15);
    this.glassGroup.add(this.secondIceCube);

    this.labGroup.add(this.glassGroup);

    // Glass 2: Second Beaker for Scene 2 (Where heavy metal bolt sinks)
    this.secondGlassGroup = new THREE.Group();
    this.secondGlassGroup.position.set(0.65, 0.8, 0.2);

    const cylinder2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.46, 24, 1, true), glassMat);
    cylinder2.position.y = 0.23;
    this.secondGlassGroup.add(cylinder2);

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 24), glassMat);
    base2.position.y = 0.012;
    this.secondGlassGroup.add(base2);

    const water2 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.155, 0.36, 24), waterMat);
    water2.position.y = 0.19;
    this.secondGlassGroup.add(water2);

    // Dense metal bolt/rock that sinks to bottom in Scene 2
    const boltMat = new THREE.MeshStandardMaterial({
      color: "#4A4E69",
      metalness: 0.85,
      roughness: 0.25,
    });
    this.metalBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), boltMat);
    this.metalBolt.position.set(0, 0.8, 0); // starts above, drops to y=0.06
    this.metalBolt.rotation.set(0.4, 0.2, 0.8);
    this.metalBolt.castShadow = true;
    this.secondGlassGroup.add(this.metalBolt);

    this.labGroup.add(this.secondGlassGroup);
  }

  // =========================================================================
  // 4. MOLECULAR REALM (Scene 3 - 18s to 38s)
  // =========================================================================
  private buildMolecularRealm() {
    this.moleculeGroup.position.set(0, 1.35, 0);
    this.moleculeGroup.visible = false;

    // Molecular Space Backdrop Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 6;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: "#48CAE4",
      size: 0.06,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    this.moleculeGroup.add(particles);

    // 6 H2O molecules forming the hexagonal ring
    const oGeo = new THREE.SphereGeometry(0.12, 18, 18);
    const hGeo = new THREE.SphereGeometry(0.07, 14, 14);
    const bondGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.2, 8);

    const oxygenMat = new THREE.MeshStandardMaterial({ color: "#E63946", roughness: 0.2 }); // Oxygen (Red)
    const hydrogenMat = new THREE.MeshStandardMaterial({ color: "#F8F9FA", roughness: 0.25 }); // Hydrogen (White)
    const covalentBondMat = new THREE.MeshStandardMaterial({ color: "#90E0EF", roughness: 0.3 }); // Covalent Bond
    const hBondMat = new THREE.MeshStandardMaterial({
      color: "#0077B6",
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
    }); // Hydrogen Bond (Blue)

    const radiusSolid = 0.72; // Open Hexagonal Lattice (Solid Ice)
    const radiusLiquid = 0.38; // Dense Packed (Liquid Water)

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const mGroup = new THREE.Group();

      // Oxygen core
      const oMesh = new THREE.Mesh(oGeo, oxygenMat);
      mGroup.add(oMesh);

      // Two Hydrogen atoms (104.5 degrees apart)
      const h1 = new THREE.Mesh(hGeo, hydrogenMat);
      h1.position.set(0.17 * Math.cos(0.91), 0.17 * Math.sin(0.91), 0);
      mGroup.add(h1);

      const h2 = new THREE.Mesh(hGeo, hydrogenMat);
      h2.position.set(0.17 * Math.cos(-0.91), 0.17 * Math.sin(-0.91), 0);
      mGroup.add(h2);

      // Covalent bonds connecting O to H
      const b1 = new THREE.Mesh(bondGeo, covalentBondMat);
      b1.position.set(h1.position.x / 2, h1.position.y / 2, 0);
      b1.rotation.z = 0.91 + Math.PI / 2;
      mGroup.add(b1);

      const b2 = new THREE.Mesh(bondGeo, covalentBondMat);
      b2.position.set(h2.position.x / 2, h2.position.y / 2, 0);
      b2.rotation.z = -0.91 + Math.PI / 2;
      mGroup.add(b2);

      mGroup.rotation.z = angle;

      const solidPos = new THREE.Vector3(
        radiusSolid * Math.cos(angle),
        radiusSolid * Math.sin(angle),
        (i % 2) * 0.14 - 0.07
      );
      const liquidPos = new THREE.Vector3(
        radiusLiquid * Math.cos(angle + 0.35),
        radiusLiquid * Math.sin(angle + 0.35),
        (i % 2) * 0.06
      );

      mGroup.position.copy(liquidPos);
      this.moleculeGroup.add(mGroup);

      this.molecules.push({
        group: mGroup,
        liquidPos,
        solidPos,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04
        ),
      });
    }

    // Hydrogen bonds connecting neighboring molecules in solid lattice
    for (let i = 0; i < 6; i++) {
      const hBondGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.52, 8);
      const hb = new THREE.Mesh(hBondGeo, hBondMat);
      hb.rotation.z = (i * Math.PI) / 3 + Math.PI / 6;
      hb.position.set(
        radiusSolid * 0.86 * Math.cos(hb.rotation.z),
        radiusSolid * 0.86 * Math.sin(hb.rotation.z),
        0
      );
      hb.scale.set(0, 0, 0); // scaled in during freezing
      this.moleculeGroup.add(hb);
      this.hBonds.push(hb);
    }

    // Glowing Bounding Box highlighting volume expansion in Scene 3
    const boxGeo = new THREE.BoxGeometry(1.7, 1.7, 0.8);
    const boxEdgeGeo = new THREE.EdgesGeometry(boxGeo);
    this.molecularVolumeBox = new THREE.LineSegments(
      boxEdgeGeo,
      new THREE.LineBasicMaterial({ color: "#00F5D4", transparent: true, opacity: 0.65 })
    );
    this.molecularVolumeBox.scale.set(0.6, 0.6, 0.6);
    this.moleculeGroup.add(this.molecularVolumeBox);

    // 3D Density Formula Indicator: "rho = m / V" (represented in 3D geometry badge)
    this.formulaGroup = new THREE.Group();
    this.formulaGroup.position.set(0.85, 0.9, 0);

    const badgeMat = new THREE.MeshStandardMaterial({
      color: "#1D3557",
      roughness: 0.3,
    });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.05), badgeMat);
    this.formulaGroup.add(badge);

    // Symbol bar
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.02, 0.06),
      new THREE.MeshBasicMaterial({ color: "#FFD166" })
    );
    bar.position.set(0, 0, 0.03);
    this.formulaGroup.add(bar);

    this.moleculeGroup.add(this.formulaGroup);
  }

  // =========================================================================
  // 5. DEMONSTRATION STAGE (Scene 4 - 38s to 50s)
  // =========================================================================
  private buildDemonstrationStage() {
    this.demoGroup.position.set(0, 0, 0);
    this.demoGroup.visible = false;

    // Stage Platform
    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.8, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: "#2B2D42", roughness: 0.4 })
    );
    stage.position.y = 0.1;
    this.demoGroup.add(stage);

    // Left: 1 kg Liquid Water block (Compact volume)
    const liquidMat = new THREE.MeshStandardMaterial({
      color: "#00B4D8",
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
    });
    this.liquidWaterCube = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), liquidMat);
    this.liquidWaterCube.position.set(-0.75, 0.41, 0.2);
    this.demoGroup.add(this.liquidWaterCube);

    // Right: 1 kg Ice block (Expanded volume by ~9% -> 1.09x scale)
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: "#CAF0F8",
      transparent: true,
      opacity: 0.88,
      roughness: 0.05,
      transmission: 0.7,
      ior: 1.31,
    });
    this.solidIceCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.42 * 1.09, 0.42 * 1.09, 0.42 * 1.09),
      iceMat
    );
    this.solidIceCube.position.set(0.75, 0.43, 0.2);
    this.demoGroup.add(this.solidIceCube);

    // Clear Water Tank demonstrating buoyant flotation
    this.demoWaterTank = new THREE.Group();
    this.demoWaterTank.position.set(0.18, 0.2, 0.2);

    const tankGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.75, 0.65),
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        transparent: true,
        opacity: 0.25,
        roughness: 0.02,
        transmission: 0.9,
      })
    );
    tankGlass.position.y = 0.375;
    this.demoWaterTank.add(tankGlass);

    // Water level inside tank
    const waterLevel = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.5, 0.62),
      new THREE.MeshStandardMaterial({
        color: "#48CAE4",
        transparent: true,
        opacity: 0.55,
        roughness: 0.05,
      })
    );
    waterLevel.position.y = 0.25;
    this.demoWaterTank.add(waterLevel);

    // Floating Ice in tank
    this.floatingDemoIce = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), iceMat);
    // Floats with ~90% submerged (y water line = 0.50m; ice center at y=0.48m)
    this.floatingDemoIce.position.set(0, 0.48, 0);
    this.floatingDemoIce.rotation.set(0.1, 0.2, -0.05);
    this.demoWaterTank.add(this.floatingDemoIce);

    // Glowing Upward Buoyant Force Arrow ("Gaya Apung")
    this.buoyantForceArrow = new THREE.Group();
    this.buoyantForceArrow.position.set(0, 0.16, 0.2);

    const arrowShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.22, 12),
      new THREE.MeshBasicMaterial({ color: "#FFD166" })
    );
    arrowShaft.position.y = 0.11;
    this.buoyantForceArrow.add(arrowShaft);

    const arrowHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: "#FFD166" })
    );
    arrowHead.position.y = 0.26;
    this.buoyantForceArrow.add(arrowHead);

    this.demoWaterTank.add(this.buoyantForceArrow);
    this.demoGroup.add(this.demoWaterTank);
  }

  // =========================================================================
  // 6. 2.5D MAS ISO BILLBOARD INSTANCES (Bridge Integration)
  // =========================================================================
  private buildMasIsoCharacters() {
    // Character 1: Lab Presenter (Scenes 1, 2, 5)
    const rigLab = MasIsoRig.createCharacterMesh({
      viewAngle: "threeQuarter",
      expression: "curious",
      gesture: "pointing",
    });
    this.masIsoLabGroup = rigLab.group;
    this.masIsoLabUpdate = rigLab.updateState;
    this.masIsoLabGroup.position.set(-0.55, 0, 0.25);
    this.labGroup.add(this.masIsoLabGroup);

    // Character 2: Molecular Space Presenter (Scene 3)
    const rigMol = MasIsoRig.createCharacterMesh({
      viewAngle: "front",
      expression: "explaining",
      gesture: "explaining",
    });
    this.masIsoMoleculeGroup = rigMol.group;
    this.masIsoMoleculeUpdate = rigMol.updateState;
    this.masIsoMoleculeGroup.position.set(-1.15, -0.7, 0.2);
    this.masIsoMoleculeGroup.scale.set(0.85, 0.85, 0.85);
    this.moleculeGroup.add(this.masIsoMoleculeGroup);

    // Character 3: Demo Stage Presenter (Scene 4)
    const rigDemo = MasIsoRig.createCharacterMesh({
      viewAngle: "threeQuarter",
      expression: "explaining",
      gesture: "pointing",
    });
    this.masIsoDemoGroup = rigDemo.group;
    this.masIsoDemoUpdate = rigDemo.updateState;
    this.masIsoDemoGroup.position.set(-1.1, 0.2, 0.3);
    this.demoGroup.add(this.masIsoDemoGroup);
  }

  // =========================================================================
  // 7. CINEMATIC PER-FRAME UPDATE & CAMERA GRAMMAR (Bridge Test C Style)
  // =========================================================================
  public update(frame: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    // -----------------------------------------------------------------------
    // SCENE 1: HOOK (Frames 0 - 239, 0s - 8s)
    // -----------------------------------------------------------------------
    if (frame < SHOTS.scene2.startFrame) {
      this.labGroup.visible = true;
      this.moleculeGroup.visible = false;
      this.demoGroup.visible = false;

      this.secondGlassGroup.visible = false;
      this.masIsoLabGroup.visible = true;

      // Ice Cube Drop & Buoyant Splash (Frames 0 - 50)
      if (frame < 25) {
        // Falling down into glass
        const u = frame / 25;
        this.iceCube.position.set(0.02, 1.4 - u * 1.03, 0.02);
        this.iceCube.rotation.set(u * 1.5, u * 2.0, u * 0.8);
      } else if (frame < 45) {
        // Splash plunge & bounce up
        const plunge = Math.sin(((frame - 25) / 20) * Math.PI);
        this.iceCube.position.set(0.02, 0.37 - plunge * 0.12, 0.02);
        this.iceCube.rotation.set(0.15 + plunge * 0.2, 0.35, -0.1);
      } else {
        // Gentle buoyant bobbing
        const tBob = (frame - 45) * 0.12;
        this.iceCube.position.set(0.02, 0.37 + Math.sin(tBob) * 0.008, 0.02);
        this.iceCube.rotation.set(0.15, 0.35 + Math.sin(tBob * 0.6) * 0.04, -0.1);
      }

      this.secondIceCube.position.y = 0.35 + Math.sin(frame * 0.1) * 0.006;

      // Mas Iso Walk-in & Reaction
      if (frame < 55) {
        // Entering from left
        const walkProg = Math.min(1, frame / 55);
        const smoothWalk = walkProg * walkProg * (3 - 2 * walkProg);
        this.masIsoLabGroup.position.set(-1.4 + smoothWalk * 1.04, Math.abs(Math.sin(frame * 0.3)) * 0.025, 0.25);
        this.masIsoLabUpdate({
          viewAngle: "threeQuarter",
          expression: "curious",
          gesture: "idle",
          headTilt: -0.05,
          lookDirection: [0.6, 0.3],
        });
      } else {
        // Standing beside table, pointing at floating ice in curiosity
        this.masIsoLabGroup.position.set(-0.36, Math.sin(frame * 0.1) * 0.006, 0.25);
        this.masIsoLabUpdate({
          viewAngle: "threeQuarter",
          expression: "curious",
          gesture: "pointing",
          headTilt: -0.14 + Math.sin(frame * 0.07) * 0.02,
          lookDirection: [0.7, 0.35],
        });
      }

      // Camera: Cinematic slow dolly-in
      const uCam = frame / 240;
      cam.position.set(-0.15 - uCam * 0.08, 1.32 - uCam * 0.1, 2.45 - uCam * 0.6);
      cam.lookAt(-0.08, 1.05, 0.25);
      this.currentFocusTarget.set(0.08, 1.05, 0.25);
      return;
    }

    // -----------------------------------------------------------------------
    // SCENE 2: THE QUESTION (Frames 240 - 539, 8s - 18s)
    // -----------------------------------------------------------------------
    if (frame < SHOTS.scene3.startFrame) {
      this.labGroup.visible = true;
      this.moleculeGroup.visible = false;
      this.demoGroup.visible = false;

      this.secondGlassGroup.visible = true;
      this.masIsoLabGroup.visible = true;

      const f2 = frame - 240; // 0 to 300

      // Ice bobbing in glass 1
      this.iceCube.position.y = 0.37 + Math.sin(frame * 0.12) * 0.007;

      // Heavy metal bolt dropping into second beaker (Frames 70 - 100)
      if (f2 < 70) {
        this.metalBolt.position.set(0, 0.95, 0);
        this.metalBolt.visible = false;
      } else if (f2 < 95) {
        this.metalBolt.visible = true;
        const dropU = (f2 - 70) / 25;
        this.metalBolt.position.set(0, 0.95 - dropU * dropU * 0.89, 0); // accelerates down
      } else {
        // Resting firmly at the bottom of the beaker!
        this.metalBolt.visible = true;
        this.metalBolt.position.set(0, 0.06, 0);
      }

      // Mas Iso Actions:
      // f2 < 120: Thinking gesture inspecting the floating ice
      // 120 <= f2 < 200: Looking at the sunken bolt in disbelief
      // f2 >= 200: Turns to camera, shrugging / shocked questioning pose
      if (f2 < 120) {
        this.masIsoLabGroup.position.set(-0.5, Math.sin(frame * 0.1) * 0.006, 0.25);
        this.masIsoLabUpdate({
          viewAngle: "threeQuarter",
          expression: "curious",
          gesture: "thinking",
          headTilt: -0.16 + Math.sin(f2 * 0.08) * 0.02,
          lookDirection: [0.75, 0.3],
        });
      } else if (f2 < 180) {
        this.masIsoLabGroup.position.set(-0.3, Math.sin(frame * 0.1) * 0.006, 0.25);
        this.masIsoLabUpdate({
          viewAngle: "front",
          expression: "curious",
          gesture: "pointing",
          headTilt: 0.12,
          lookDirection: [0.8, -0.2], // looking at second beaker
        });
      } else {
        // Shocked shrug to camera
        this.masIsoLabGroup.position.set(-0.3, Math.sin(frame * 0.12) * 0.008, 0.3);
        this.masIsoLabUpdate({
          viewAngle: "front",
          expression: "shocked",
          gesture: "explaining",
          headTilt: Math.sin(f2 * 0.15) * 0.04,
          lookDirection: [0, 0.1], // direct eye contact with viewer
        });
      }

      // Camera: Transitions from inspecting beakers to framing Mas Iso's question reaction
      if (f2 < 180) {
        const u2 = f2 / 180;
        cam.position.set(-0.05 + u2 * 0.15, 1.25 - u2 * 0.08, 2.2 - u2 * 0.4);
        cam.lookAt(0.05, 1.05, 0.22);
        this.currentFocusTarget.set(0.08, 1.05, 0.22);
      } else {
        const u2b = (f2 - 180) / 120;
        cam.position.set(-0.25 - u2b * 0.05, 1.35 - u2b * 0.05, 1.8 - u2b * 0.25);
        cam.lookAt(-0.3, 1.25, 0.3);
        this.currentFocusTarget.set(-0.3, 1.25, 0.3);
      }
      return;
    }

    // -----------------------------------------------------------------------
    // SCENE 3: SCIENTIFIC EXPLANATION (Frames 540 - 1139, 18s - 38s)
    // -----------------------------------------------------------------------
    if (frame < SHOTS.scene4.startFrame) {
      this.labGroup.visible = false;
      this.moleculeGroup.visible = true;
      this.demoGroup.visible = false;

      const f3 = frame - 540; // 0 to 600

      // Phase 1 (f3 < 180): Dense Liquid Water tumbling
      // Phase 2 (180 <= f3 < 360): Freezing & expanding into open hexagonal lattice
      // Phase 3 (f3 >= 360): Expanded open honeycomb crystal & volume indicator
      const freezeProgress = Math.min(1, Math.max(0, (f3 - 180) / 120));
      const smoothFreeze = freezeProgress * freezeProgress * (3 - 2 * freezeProgress);

      this.molecules.forEach(({ group, liquidPos, solidPos, rotSpeed }, i) => {
        // Interpolate position from dense liquid to open hexagonal lattice
        group.position.lerpVectors(liquidPos, solidPos, smoothFreeze);

        // Liquid state has tumbling rotations, crystal lattice has locked orientation
        if (smoothFreeze < 0.95) {
          const tumble = 1 - smoothFreeze;
          group.rotation.x += rotSpeed.x * tumble;
          group.rotation.y += rotSpeed.y * tumble;
        } else {
          group.rotation.x = Math.sin(f3 * 0.03 + i) * 0.05;
          group.rotation.y = Math.cos(f3 * 0.02 + i) * 0.05;
        }
      });

      // Hydrogen bonds scale in as crystal solidifies
      this.hBonds.forEach((hb) => {
        hb.scale.set(smoothFreeze, smoothFreeze, smoothFreeze);
      });

      // Volume Bounding Box expands to show density decrease
      const boxScale = 0.55 + smoothFreeze * 0.45;
      this.molecularVolumeBox.scale.set(boxScale, boxScale, boxScale);

      // Rotate entire molecular structure gently for 3D depth
      this.moleculeGroup.rotation.z = f3 * 0.008;
      this.moleculeGroup.rotation.y = Math.sin(f3 * 0.015) * 0.25;

      // Mas Iso Presenter in Molecular Realm
      this.masIsoMoleculeGroup.position.set(-0.28, -0.45 + Math.sin(f3 * 0.08) * 0.03, 0.4);
      if (f3 < 240) {
        this.masIsoMoleculeUpdate({
          viewAngle: "front",
          expression: "curious",
          gesture: "pointing",
          headTilt: 0.1,
          lookDirection: [0.8, 0.4],
        });
      } else {
        this.masIsoMoleculeUpdate({
          viewAngle: "front",
          expression: "explaining",
          gesture: "explaining",
          headTilt: -0.08 + Math.sin(f3 * 0.06) * 0.02,
          lookDirection: [0.4, 0.2],
        });
      }

      // Camera: Cinematic slow orbit showcasing molecular depth
      const camAngle = 0.4 + f3 * 0.0035;
      const camDist = 3.2 - Math.sin(f3 * 0.003) * 0.2;
      cam.position.set(
        Math.sin(camAngle) * camDist,
        1.35 + Math.sin(f3 * 0.01) * 0.15,
        Math.cos(camAngle) * camDist
      );
      cam.lookAt(-0.02, 1.35, 0);
      this.currentFocusTarget.set(0.1, 1.35, 0);
      return;
    }

    // -----------------------------------------------------------------------
    // SCENE 4: DEMONSTRATION (Frames 1140 - 1499, 38s - 50s)
    // -----------------------------------------------------------------------
    if (frame < SHOTS.scene5.startFrame) {
      this.labGroup.visible = false;
      this.moleculeGroup.visible = false;
      this.demoGroup.visible = true;

      const f4 = frame - 1140; // 0 to 360

      // Gentle floating bob for the demo ice
      this.floatingDemoIce.position.y = 0.52 + Math.sin(f4 * 0.1) * 0.012;
      this.floatingDemoIce.rotation.y = 0.2 + Math.sin(f4 * 0.05) * 0.06;

      // Buoyant Force arrow pulse
      const arrowPulse = 1.0 + Math.sin(f4 * 0.15) * 0.15;
      this.buoyantForceArrow.scale.set(arrowPulse, arrowPulse, arrowPulse);

      // Mas Iso gestures proudly at the demonstration
      this.masIsoDemoGroup.position.set(-0.38, 0.1, 0.35);
      this.masIsoDemoUpdate({
        viewAngle: "threeQuarter",
        expression: "explaining",
        gesture: "pointing",
        headTilt: -0.12,
        lookDirection: [0.85, 0.25],
      });

      // Camera: Smooth glide capturing Mas Iso and the buoyant floating ice
      const u4 = f4 / 360;
      cam.position.set(-0.08 + u4 * 0.1, 1.3 - u4 * 0.08, 3.1 - u4 * 0.5);
      cam.lookAt(-0.05, 0.75, 0.2);
      this.currentFocusTarget.set(0.18, 0.68, 0.2);
      return;
    }

    // -----------------------------------------------------------------------
    // SCENE 5: PUNCHLINE & ENDING (Frames 1500 - 1799, 50s - 60s)
    // -----------------------------------------------------------------------
    this.labGroup.visible = true;
    this.moleculeGroup.visible = false;
    this.demoGroup.visible = false;

    this.secondGlassGroup.visible = false;
    this.masIsoLabGroup.visible = true;

    const f5 = frame - 1500; // 0 to 300

    // Ice cube gentle bobbing in glass
    this.iceCube.position.y = 0.37 + Math.sin(f5 * 0.12) * 0.008;

    // Mas Iso Punchline Timing:
    // f5 < 70: Looking down at the bulky ice taking up space
    // f5 >= 70: Snappy comedic head tilt directly at camera with DEADPAN face!
    if (f5 < 70) {
      this.masIsoLabGroup.position.set(-0.4, 0, 0.35);
      this.masIsoLabUpdate({
        viewAngle: "front",
        expression: "curious",
        gesture: "idle",
        headTilt: -0.06,
        lookDirection: [0.65, 0.4], // looking at glass
      });
    } else {
      // Snappy comedic snap to camera!
      const snap = Math.min(1, (f5 - 70) / 4);
      this.masIsoLabGroup.position.set(-0.4, Math.sin(f5 * 0.1) * 0.006, 0.35);
      this.masIsoLabGroup.rotation.z = snap * 0.08;
      this.masIsoLabUpdate({
        viewAngle: "front",
        expression: "deadpan",
        gesture: "idle",
        headTilt: 0.14,
        lookDirection: [0, 0], // piercing deadpan eye contact
      });
    }

    // Camera: Punchy medium-close framing on Mas Iso, slow dignified hold
    const u5 = Math.min(1, f5 / 300);
    cam.position.set(-0.32 - u5 * 0.05, 1.35 - u5 * 0.04, 1.6 - u5 * 0.2);
    cam.lookAt(-0.35, 1.25, 0.35);
    this.currentFocusTarget.set(-0.35, 1.25, 0.35);
  }

  // Focus distance for thin-lens DoF
  public getFocusDistance(cam: THREE.PerspectiveCamera): number {
    return cam.position.distanceTo(this.currentFocusTarget);
  }
}
