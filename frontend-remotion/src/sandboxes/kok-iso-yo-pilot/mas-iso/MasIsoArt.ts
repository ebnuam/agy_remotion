/**
 * MAS ISO - Vector Art Engine (Refined V3 - Charismatic Face & Expressive Eyelids)
 * Procedural vector drawing faithful to mas_iso_character_model_sheet_v2.jpg.
 * Features stylized anime hair clusters, organic neck/shoulder connection,
 * expressive hooded cartoon eyes, and tailored utility vest.
 */

import { MasIsoDrawOptions, PALETTE } from "./types";

export class MasIsoArt {
  public static readonly CANVAS_W = 1024;
  public static readonly CANVAS_H = 1536;

  public static render(
    ctx: CanvasRenderingContext2D,
    options: MasIsoDrawOptions = {}
  ): void {
    const {
      viewAngle = "front",
      expression = "curious",
      gesture = "idle",
      headTilt = 0,
      lookDirection = [0, 0],
    } = options;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (viewAngle === "front") {
      this.renderFront(ctx, expression, gesture, headTilt, lookDirection);
    } else {
      this.renderThreeQuarter(ctx, expression, gesture, headTilt, lookDirection);
    }

    ctx.restore();
  }

  // =========================================================================
  // FRONT VIEW
  // =========================================================================
  private static renderFront(
    ctx: CanvasRenderingContext2D,
    expression: string,
    gesture: string,
    headTilt: number,
    lookDirection: [number, number]
  ): void {
    const cx = 512;

    // 1. Shoes
    this.drawShoesFront(ctx, cx);

    // 2. Trousers (Chinos)
    this.drawTrousersFront(ctx, cx);

    // 3. Torso (Shirt + Vest)
    this.drawTorsoFront(ctx, cx);

    // 4. Arms & Hands
    this.drawArmsFront(ctx, cx, gesture);

    // 5. Head Group (Rotatable with headTilt)
    ctx.save();
    const neckPivotX = cx;
    const neckPivotY = 460;
    ctx.translate(neckPivotX, neckPivotY);
    ctx.rotate(headTilt);
    ctx.translate(-neckPivotX, -neckPivotY);

    this.drawNeckFront(ctx, cx);
    this.drawBackHairFront(ctx, cx);
    this.drawHeadBaseFront(ctx, cx);
    this.drawFaceFront(ctx, cx, expression, lookDirection);
    this.drawFrontHairFront(ctx, cx);

    ctx.restore();
  }

  // --- Front Anatomical Components ---

  private static drawShoesFront(ctx: CanvasRenderingContext2D, cx: number): void {
    const shoeY = 1385;
    const footOffsets = [-105, 105];

    footOffsets.forEach((ox) => {
      const x = cx + ox;

      // Dark canvas shoe body
      ctx.beginPath();
      ctx.ellipse(x, shoeY, 70, 36, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.shoes;
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // White Toe Cap
      ctx.beginPath();
      ctx.ellipse(x, shoeY + 16, 54, 18, 0, 0, Math.PI);
      ctx.fillStyle = PALETTE.shoesWhite;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // White Sole
      ctx.beginPath();
      ctx.ellipse(x, shoeY + 22, 68, 14, 0, 0, Math.PI);
      ctx.fillStyle = PALETTE.shoesWhite;
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Sneaker Laces
      ctx.beginPath();
      ctx.moveTo(x - 16, shoeY - 8);
      ctx.lineTo(x + 16, shoeY - 8);
      ctx.moveTo(x - 14, shoeY + 2);
      ctx.lineTo(x + 14, shoeY + 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.shoesWhite;
      ctx.stroke();
    });
  }

  private static drawTrousersFront(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - 160, 930);
    ctx.bezierCurveTo(cx - 180, 1040, cx - 170, 1200, cx - 155, 1370);
    ctx.lineTo(cx - 55, 1370);
    ctx.bezierCurveTo(cx - 65, 1220, cx - 50, 1080, cx, 1050);
    ctx.bezierCurveTo(cx + 50, 1080, cx + 65, 1220, cx + 55, 1370);
    ctx.lineTo(cx + 155, 1370);
    ctx.bezierCurveTo(cx + 170, 1200, cx + 180, 1040, cx + 160, 930);
    ctx.closePath();

    ctx.fillStyle = PALETTE.trousers;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Crease line
    ctx.beginPath();
    ctx.moveTo(cx, 930);
    ctx.lineTo(cx, 1050);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.trousersShade;
    ctx.stroke();

    // Knee tension wrinkles
    [-105, 105].forEach((ox) => {
      ctx.beginPath();
      ctx.moveTo(cx + ox - 20, 1160);
      ctx.quadraticCurveTo(cx + ox, 1168, cx + ox + 22, 1160);
      ctx.moveTo(cx + ox - 16, 1176);
      ctx.quadraticCurveTo(cx + ox, 1184, cx + ox + 18, 1176);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.trousersShade;
      ctx.stroke();
    });

    // Cuffs
    [-105, 105].forEach((ox) => {
      ctx.beginPath();
      ctx.ellipse(cx + ox, 1368, 50, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.trousers;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    });
  }

  private static drawTorsoFront(ctx: CanvasRenderingContext2D, cx: number): void {
    // A. Cream Shirt Underneath
    ctx.beginPath();
    ctx.moveTo(cx - 170, 520);
    ctx.bezierCurveTo(cx - 190, 680, cx - 180, 840, cx - 160, 940);
    ctx.lineTo(cx + 160, 940);
    ctx.bezierCurveTo(cx + 180, 840, cx + 190, 680, cx + 170, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.shirt;
    ctx.fill();

    // Henley Collar Band
    ctx.beginPath();
    ctx.moveTo(cx - 48, 480);
    ctx.bezierCurveTo(cx - 24, 530, cx + 24, 530, cx + 48, 480);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Button Placket
    ctx.beginPath();
    ctx.rect(cx - 12, 510, 24, 85);
    ctx.fillStyle = PALETTE.shirtShade;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Buttons
    [530, 555, 580].forEach((by) => {
      ctx.beginPath();
      ctx.arc(cx, by, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    });

    // B. Ocean Teal Utility Vest
    // Left Vest Panel
    ctx.beginPath();
    ctx.moveTo(cx - 170, 520);
    ctx.lineTo(cx - 46, 505);
    ctx.lineTo(cx - 38, 935);
    ctx.lineTo(cx - 165, 935);
    ctx.bezierCurveTo(cx - 185, 800, cx - 185, 660, cx - 170, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.vest;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Right Vest Panel
    ctx.beginPath();
    ctx.moveTo(cx + 170, 520);
    ctx.lineTo(cx + 46, 505);
    ctx.lineTo(cx + 38, 935);
    ctx.lineTo(cx + 165, 935);
    ctx.bezierCurveTo(cx + 185, 800, cx + 185, 660, cx + 170, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.vest;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Chest Pocket with Notepad & Yellow Pen Clip (Viewer's Right)
    const px = cx + 96;
    const py = 640;
    ctx.beginPath();
    ctx.rect(px - 26, py - 35, 38, 30);
    ctx.fillStyle = PALETTE.notepad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px + 20, py - 38);
    ctx.lineTo(px + 20, py - 6);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.penClip;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(px - 36, py - 10, 72, 68, [4, 4, 12, 12]);
    ctx.fillStyle = PALETTE.vestPocket;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Waist Utility Pockets
    [-100, 100].forEach((ox) => {
      ctx.beginPath();
      ctx.roundRect(cx + ox - 42, 775, 84, 88, [6, 6, 12, 12]);
      ctx.fillStyle = PALETTE.vestPocket;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + ox - 42, 795);
      ctx.lineTo(cx + ox + 42, 795);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.vestShade;
      ctx.stroke();
    });
  }

  private static drawArmsFront(
    ctx: CanvasRenderingContext2D,
    cx: number,
    gesture: string
  ): void {
    if (gesture === "pointing") {
      this.drawArmLimb(ctx, cx - 170, 540, cx - 215, 720, cx - 200, 880);
      this.drawHand(ctx, cx - 200, 900, "relaxed");

      this.drawArmLimb(ctx, cx + 170, 540, cx + 250, 640, cx + 200, 710);
      this.drawHand(ctx, cx + 180, 715, "pointing");
    } else if (gesture === "thinking") {
      // Left arm resting across body
      this.drawArmLimb(ctx, cx - 170, 540, cx - 130, 680, cx - 20, 680);
      this.drawHand(ctx, cx - 10, 680, "relaxed");

      // Right arm bent up to chin
      this.drawArmLimb(ctx, cx + 170, 540, cx + 180, 630, cx + 70, 475);
      this.drawHand(ctx, cx + 60, 460, "relaxed");
    } else if (gesture === "explaining") {
      // Both arms out, welcoming presenter pose
      this.drawArmLimb(ctx, cx - 170, 540, cx - 240, 660, cx - 190, 730);
      this.drawHand(ctx, cx - 175, 735, "relaxed");

      this.drawArmLimb(ctx, cx + 170, 540, cx + 240, 660, cx + 190, 730);
      this.drawHand(ctx, cx + 175, 735, "relaxed");
    } else {
      this.drawArmLimb(ctx, cx - 170, 540, cx - 215, 720, cx - 200, 880);
      this.drawHand(ctx, cx - 200, 900, "relaxed");

      this.drawArmLimb(ctx, cx + 170, 540, cx + 215, 720, cx + 200, 880);
      this.drawHand(ctx, cx + 200, 900, "relaxed");
    }
  }

  private static drawArmLimb(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = 62 + 16;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = 62;
    ctx.strokeStyle = PALETTE.shirt;
    ctx.stroke();

    // Rolled Sleeve Cuff
    ctx.beginPath();
    ctx.ellipse(x1, y1, 26, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.shirtShade;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Forearm
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 38 + 12;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 38;
    ctx.strokeStyle = PALETTE.skin;
    ctx.stroke();
  }

  private static drawHand(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: "relaxed" | "pointing"
  ): void {
    if (type === "pointing") {
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.skin;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x - 32, y - 12);
      ctx.lineWidth = 14 + 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x - 32, y - 12);
      ctx.lineWidth = 14;
      ctx.strokeStyle = PALETTE.skin;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(x, y, 24, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.skin;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x - 6, y - 4, 8, 0.2 * Math.PI, 0.9 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.skinShade;
      ctx.stroke();
    }
  }

  private static drawNeckFront(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - 52, 400);
    ctx.lineTo(cx - 62, 510);
    ctx.lineTo(cx + 62, 510);
    ctx.lineTo(cx + 52, 400);
    ctx.closePath();
    ctx.fillStyle = PALETTE.skin;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, 435, 48, 18, 0, 0, Math.PI);
    ctx.fillStyle = PALETTE.skinShade;
    ctx.fill();
  }

  private static drawBackHairFront(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;

    ctx.beginPath();
    ctx.moveTo(cx - 150, headY);
    ctx.lineTo(cx - 195, headY - 40);
    ctx.lineTo(cx - 165, headY - 80);
    ctx.lineTo(cx - 200, headY - 125);
    ctx.lineTo(cx - 155, headY - 165);
    ctx.lineTo(cx - 120, headY - 215);
    ctx.lineTo(cx - 40, headY - 235);
    ctx.lineTo(cx + 40, headY - 240);
    ctx.lineTo(cx + 120, headY - 220);
    ctx.lineTo(cx + 160, headY - 170);
    ctx.lineTo(cx + 205, headY - 130);
    ctx.lineTo(cx + 170, headY - 85);
    ctx.lineTo(cx + 200, headY - 40);
    ctx.lineTo(cx + 150, headY);
    ctx.closePath();

    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawHeadBaseFront(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;

    // Ears
    [-145, 145].forEach((ox) => {
      ctx.beginPath();
      ctx.ellipse(cx + ox, headY + 18, 28, 36, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.skin;
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + ox + (ox > 0 ? -6 : 6), headY + 16, 14, 0, Math.PI * 1.5, ox < 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.skinShade;
      ctx.stroke();
    });

    // Face / Jawline Contour
    ctx.beginPath();
    ctx.moveTo(cx - 142, headY - 45);
    ctx.bezierCurveTo(cx - 146, headY + 65, cx - 115, headY + 130, cx, headY + 148);
    ctx.bezierCurveTo(cx + 115, headY + 130, cx + 146, headY + 65, cx + 142, headY - 45);
    ctx.bezierCurveTo(cx + 135, headY - 145, cx - 135, headY - 145, cx - 142, headY - 45);
    ctx.closePath();
    ctx.fillStyle = PALETTE.skin;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawFaceFront(
    ctx: CanvasRenderingContext2D,
    cx: number,
    expression: string,
    lookDirection: [number, number]
  ): void {
    const eyeY = 314;
    const eyeSpacing = 72;
    const glassR = 52;

    // 1. Round Glasses Lens Tint (Subtle reflective interior)
    [-eyeSpacing, eyeSpacing].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(cx + ox, eyeY, glassR - 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fill();
    });

    // 2. Hooded, Charismatic Cartoon Eyes
    [-eyeSpacing, eyeSpacing].forEach((ox) => {
      const ex = cx + ox;

      ctx.save();
      // Clip inside eye socket
      ctx.beginPath();
      if (expression === "deadpan") {
        // Flat horizontal slit
        ctx.rect(ex - 36, eyeY - 6, 72, 26);
      } else {
        // Almond shape with soft upper lid curve
        ctx.moveTo(ex - 36, eyeY);
        ctx.bezierCurveTo(ex - 20, eyeY - 26, ex + 20, eyeY - 26, ex + 36, eyeY);
        ctx.bezierCurveTo(ex + 20, eyeY + 28, ex - 20, eyeY + 28, ex - 36, eyeY);
      }
      ctx.closePath();
      ctx.clip();

      // White Sclera
      ctx.fillStyle = PALETTE.eyeWhite;
      ctx.fill();

      // Large Warm Iris
      const px = ex + lookDirection[0] * 8;
      const py = eyeY + 2 + lookDirection[1] * 6;
      ctx.beginPath();
      ctx.arc(px, py, 21, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.eyeIris;
      ctx.fill();

      // Pupil (deeper black core)
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#110D0B";
      ctx.fill();

      // Main Catchlight
      ctx.beginPath();
      ctx.arc(px - 6, py - 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // Secondary Catchlight
      ctx.beginPath();
      ctx.arc(px + 7, py + 5, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.restore();

      // Bold Upper Eyelid / Lash Line (Gives anime/cartoon definition)
      ctx.beginPath();
      if (expression === "deadpan") {
        ctx.moveTo(ex - 38, eyeY - 4);
        ctx.lineTo(ex + 38, eyeY - 4);
        ctx.lineWidth = 9;
      } else {
        ctx.moveTo(ex - 38, eyeY - 2);
        ctx.quadraticCurveTo(ex, eyeY - 28, ex + 38, eyeY - 2);
        ctx.lineWidth = 8;
      }
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Upper Eyelid Fold (Double eyelid crease)
      ctx.beginPath();
      ctx.moveTo(ex - 30, eyeY - 32);
      ctx.quadraticCurveTo(ex, eyeY - 40, ex + 30, eyeY - 32);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = PALETTE.skinShade;
      ctx.stroke();
    });

    // 3. Round Glasses Rim & Bridge
    [-eyeSpacing, eyeSpacing].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(cx + ox, eyeY, glassR, 0, Math.PI * 2);
      ctx.lineWidth = 11;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    });

    // Nose Bridge (Solid connector between lenses)
    ctx.beginPath();
    ctx.moveTo(cx - eyeSpacing + glassR - 2, eyeY - 6);
    ctx.quadraticCurveTo(cx, eyeY - 18, cx + eyeSpacing - glassR + 2, eyeY - 6);
    ctx.lineWidth = 10;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Temple Bars extending to ears
    ctx.beginPath();
    ctx.moveTo(cx - eyeSpacing - glassR, eyeY);
    ctx.lineTo(cx - 145, eyeY - 6);
    ctx.moveTo(cx + eyeSpacing + glassR, eyeY);
    ctx.lineTo(cx + 145, eyeY - 6);
    ctx.lineWidth = 7;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // 4. Thick Expressive Eyebrows (Resting right above glasses rims)
    const browY = eyeY - 50;
    if (expression === "curious") {
      // Left eyebrow arched high
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - 42, browY - 14);
      ctx.quadraticCurveTo(cx - eyeSpacing, browY - 36, cx - eyeSpacing + 42, browY - 6);
      ctx.lineWidth = 14;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Right eyebrow relaxed
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing - 40, browY);
      ctx.quadraticCurveTo(cx + eyeSpacing, browY - 14, cx + eyeSpacing + 40, browY + 4);
      ctx.lineWidth = 14;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    } else if (expression === "deadpan") {
      [-eyeSpacing, eyeSpacing].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(cx + ox - 38, browY + 6);
        ctx.lineTo(cx + ox + 38, browY + 4);
        ctx.lineWidth = 13;
        ctx.strokeStyle = PALETTE.outline;
        ctx.stroke();
      });
    } else {
      [-eyeSpacing, eyeSpacing].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(cx + ox - 40, browY);
        ctx.quadraticCurveTo(cx + ox, browY - 16, cx + ox + 40, browY);
        ctx.lineWidth = 13;
        ctx.strokeStyle = PALETTE.outline;
        ctx.stroke();
      });
    }

    // 5. Nose (Stylized cartoon curve with nostril shadow)
    const noseY = 370;
    ctx.beginPath();
    ctx.moveTo(cx - 6, noseY - 6);
    ctx.quadraticCurveTo(cx + 10, noseY + 6, cx - 2, noseY + 16);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // 6. Mouth (Curious friendly smile with lower lip accent)
    const mouthY = 416;
    ctx.beginPath();
    if (expression === "deadpan") {
      ctx.moveTo(cx - 30, mouthY);
      ctx.lineTo(cx + 30, mouthY);
      ctx.lineWidth = 7;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    } else {
      ctx.moveTo(cx - 32, mouthY - 4);
      ctx.quadraticCurveTo(cx, mouthY + 16, cx + 34, mouthY + 2);
      ctx.lineWidth = 7;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Smile corner mark
      ctx.beginPath();
      ctx.arc(cx + 34, mouthY - 2, 4, 0, Math.PI);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Lower lip shadow
      ctx.beginPath();
      ctx.moveTo(cx - 12, mouthY + 22);
      ctx.lineTo(cx + 12, mouthY + 22);
      ctx.lineWidth = 4;
      ctx.strokeStyle = PALETTE.skinShade;
      ctx.stroke();
    }
  }

  private static drawFrontHairFront(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;

    // A. Layered Forehead Bangs & Side Clusters
    ctx.beginPath();
    ctx.moveTo(cx - 150, headY - 45);
    ctx.lineTo(cx - 160, headY + 10);
    ctx.lineTo(cx - 145, headY - 15);
    ctx.lineTo(cx - 130, headY - 70);
    ctx.lineTo(cx - 105, headY - 20);
    ctx.lineTo(cx - 75, headY - 85);
    ctx.lineTo(cx - 40, headY - 15);
    ctx.lineTo(cx - 10, headY - 45);
    ctx.lineTo(cx + 15, headY - 10);
    ctx.lineTo(cx + 45, headY - 75);
    ctx.lineTo(cx + 80, headY - 15);
    ctx.lineTo(cx + 115, headY - 65);
    ctx.lineTo(cx + 145, headY - 15);
    ctx.lineTo(cx + 160, headY + 10);
    ctx.lineTo(cx + 150, headY - 45);
    ctx.bezierCurveTo(cx + 180, headY - 210, cx - 180, headY - 210, cx - 150, headY - 45);
    ctx.closePath();
    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // B. SIGNATURE CURIOSITY TUFT / COWLICK
    ctx.beginPath();
    ctx.moveTo(cx + 40, headY - 170);
    ctx.bezierCurveTo(cx + 70, headY - 250, cx + 140, headY - 280, cx + 180, headY - 240);
    ctx.bezierCurveTo(cx + 205, headY - 205, cx + 165, headY - 190, cx + 145, headY - 210);
    ctx.bezierCurveTo(cx + 130, headY - 230, cx + 85, headY - 215, cx + 70, headY - 160);
    ctx.closePath();
    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // C. Hair Texture / Highlight Strokes
    ctx.beginPath();
    ctx.moveTo(cx - 90, headY - 145);
    ctx.quadraticCurveTo(cx - 40, headY - 170, cx + 20, headY - 145);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.hairHighlight;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 85, headY - 235);
    ctx.quadraticCurveTo(cx + 130, headY - 250, cx + 155, headY - 225);
    ctx.lineWidth = 5;
    ctx.strokeStyle = PALETTE.hairHighlight;
    ctx.stroke();
  }

  // =========================================================================
  // 3/4 VIEW
  // =========================================================================
  private static renderThreeQuarter(
    ctx: CanvasRenderingContext2D,
    expression: string,
    gesture: string,
    headTilt: number,
    lookDirection: [number, number]
  ): void {
    const cx = 512;

    // 1. Shoes in 3/4
    this.drawShoesThreeQuarter(ctx, cx);

    // 2. Trousers 3/4
    this.drawTrousersThreeQuarter(ctx, cx);

    // 3. Torso (Shirt + Vest) 3/4
    this.drawTorsoThreeQuarter(ctx, cx);

    // 4. Arms & Hands 3/4
    this.drawArmsThreeQuarter(ctx, cx, gesture);

    // 5. Head Group 3/4 (Pivot)
    ctx.save();
    const neckPivotX = cx - 20;
    const neckPivotY = 460;
    ctx.translate(neckPivotX, neckPivotY);
    ctx.rotate(headTilt);
    ctx.translate(-neckPivotX, -neckPivotY);

    this.drawNeckThreeQuarter(ctx, cx);
    this.drawBackHairThreeQuarter(ctx, cx);
    this.drawHeadBaseThreeQuarter(ctx, cx);
    this.drawFaceThreeQuarter(ctx, cx, expression, lookDirection);
    this.drawFrontHairThreeQuarter(ctx, cx);

    ctx.restore();
  }

  private static drawShoesThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.ellipse(cx + 85, 1378, 58, 34, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.shoes;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 85, 1395, 75, 42, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.shoes;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx - 85, 1418, 70, 16, -0.15, 0, Math.PI);
    ctx.fillStyle = PALETTE.shoesWhite;
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawTrousersThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - 155, 930);
    ctx.bezierCurveTo(cx - 175, 1050, cx - 160, 1220, cx - 135, 1370);
    ctx.lineTo(cx - 35, 1370);
    ctx.bezierCurveTo(cx - 45, 1220, cx - 30, 1080, cx + 15, 1055);
    ctx.bezierCurveTo(cx + 45, 1090, cx + 60, 1220, cx + 55, 1360);
    ctx.lineTo(cx + 140, 1360);
    ctx.bezierCurveTo(cx + 160, 1210, cx + 155, 1050, cx + 135, 930);
    ctx.closePath();

    ctx.fillStyle = PALETTE.trousers;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawTorsoThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - 165, 520);
    ctx.bezierCurveTo(cx - 185, 680, cx - 175, 840, cx - 155, 940);
    ctx.lineTo(cx + 135, 940);
    ctx.bezierCurveTo(cx + 155, 840, cx + 160, 680, cx + 140, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.shirt;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 165, 520);
    ctx.lineTo(cx - 20, 505);
    ctx.lineTo(cx - 25, 935);
    ctx.lineTo(cx - 160, 935);
    ctx.bezierCurveTo(cx - 180, 800, cx - 180, 660, cx - 165, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.vest;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 140, 520);
    ctx.lineTo(cx + 35, 505);
    ctx.lineTo(cx + 38, 935);
    ctx.lineTo(cx + 135, 935);
    ctx.bezierCurveTo(cx + 150, 800, cx + 150, 660, cx + 140, 520);
    ctx.closePath();
    ctx.fillStyle = PALETTE.vest;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    const px = cx - 85;
    const py = 640;
    ctx.beginPath();
    ctx.rect(px - 22, py - 32, 34, 28);
    ctx.fillStyle = PALETTE.notepad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(px - 32, py - 8, 64, 62, [4, 4, 10, 10]);
    ctx.fillStyle = PALETTE.vestPocket;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawArmsThreeQuarter(
    ctx: CanvasRenderingContext2D,
    cx: number,
    gesture: string
  ): void {
    if (gesture === "pointing") {
      this.drawArmLimb(ctx, cx - 165, 540, cx - 210, 720, cx - 190, 880);
      this.drawHand(ctx, cx - 190, 900, "relaxed");

      this.drawArmLimb(ctx, cx + 140, 540, cx + 220, 640, cx + 160, 710);
      this.drawHand(ctx, cx + 140, 715, "pointing");
    } else if (gesture === "thinking") {
      // Left arm across
      this.drawArmLimb(ctx, cx - 165, 540, cx - 120, 680, cx - 10, 670);
      this.drawHand(ctx, cx - 5, 670, "relaxed");

      // Right arm up to chin
      this.drawArmLimb(ctx, cx + 140, 540, cx + 155, 620, cx + 65, 475);
      this.drawHand(ctx, cx + 55, 460, "relaxed");
    } else if (gesture === "explaining") {
      this.drawArmLimb(ctx, cx - 165, 540, cx - 230, 650, cx - 170, 730);
      this.drawHand(ctx, cx - 160, 735, "relaxed");

      this.drawArmLimb(ctx, cx + 140, 540, cx + 230, 640, cx + 180, 720);
      this.drawHand(ctx, cx + 160, 725, "relaxed");
    } else {
      this.drawArmLimb(ctx, cx - 165, 540, cx - 210, 720, cx - 195, 880);
      this.drawHand(ctx, cx - 195, 900, "relaxed");

      this.drawArmLimb(ctx, cx + 140, 540, cx + 185, 710, cx + 170, 870);
      this.drawHand(ctx, cx + 170, 890, "relaxed");
    }
  }

  private static drawNeckThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    ctx.beginPath();
    ctx.moveTo(cx - 58, 405);
    ctx.lineTo(cx - 68, 510);
    ctx.lineTo(cx + 42, 510);
    ctx.lineTo(cx + 36, 405);
    ctx.closePath();
    ctx.fillStyle = PALETTE.skin;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawBackHairThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;
    const hx = cx - 20;

    ctx.beginPath();
    ctx.moveTo(hx - 145, headY);
    ctx.lineTo(hx - 190, headY - 40);
    ctx.lineTo(hx - 160, headY - 80);
    ctx.lineTo(hx - 195, headY - 125);
    ctx.lineTo(hx - 150, headY - 165);
    ctx.lineTo(hx - 110, headY - 215);
    ctx.lineTo(hx - 30, headY - 235);
    ctx.lineTo(hx + 50, headY - 240);
    ctx.lineTo(hx + 120, headY - 215);
    ctx.lineTo(hx + 160, headY - 160);
    ctx.lineTo(hx + 195, headY - 120);
    ctx.lineTo(hx + 160, headY - 75);
    ctx.lineTo(hx + 180, headY - 30);
    ctx.lineTo(hx + 140, headY);
    ctx.closePath();

    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawHeadBaseThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;
    const hx = cx - 20;

    ctx.beginPath();
    ctx.ellipse(hx + 140, headY + 18, 26, 34, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.skin;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hx - 138, headY - 40);
    ctx.bezierCurveTo(hx - 142, headY + 55, hx - 100, headY + 128, hx - 18, headY + 148);
    ctx.bezierCurveTo(hx + 85, headY + 132, hx + 135, headY + 65, hx + 135, headY - 40);
    ctx.bezierCurveTo(hx + 125, headY - 145, hx - 125, headY - 145, hx - 138, headY - 40);
    ctx.closePath();
    ctx.fillStyle = PALETTE.skin;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawFaceThreeQuarter(
    ctx: CanvasRenderingContext2D,
    cx: number,
    expression: string,
    lookDirection: [number, number]
  ): void {
    const headY = 310;
    const hx = cx - 20;
    const eyeY = headY + 4;
    const glassR = 50;

    const l1x = hx - 56;
    const l2x = hx + 60;

    // 3/4 Round Glasses
    [l1x, l2x].forEach((ox, i) => {
      const rx = i === 1 ? glassR * 0.86 : glassR;

      ctx.beginPath();
      ctx.ellipse(ox, eyeY, rx, glassR, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ox, eyeY, rx * 0.7, 26, 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = PALETTE.eyeWhite;
      ctx.fill();

      const px = ox + lookDirection[0] * 8;
      const py = eyeY + 2 + lookDirection[1] * 6;
      ctx.beginPath();
      ctx.arc(px, py, 19, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.eyeIris;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px - 4, py - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.restore();

      // Bold upper eyelid
      ctx.beginPath();
      ctx.moveTo(ox - rx * 0.8, eyeY - 4);
      ctx.quadraticCurveTo(ox, eyeY - 26, ox + rx * 0.8, eyeY - 4);
      ctx.lineWidth = 7.5;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();

      // Rim
      ctx.beginPath();
      ctx.ellipse(ox, eyeY, rx, glassR, 0, 0, Math.PI * 2);
      ctx.lineWidth = 11;
      ctx.strokeStyle = PALETTE.outline;
      ctx.stroke();
    });

    // Nose Bridge
    ctx.beginPath();
    ctx.moveTo(l1x + glassR - 2, eyeY - 6);
    ctx.quadraticCurveTo(hx, eyeY - 18, l2x - glassR * 0.86 + 2, eyeY - 6);
    ctx.lineWidth = 9;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Eyebrows
    const browY = eyeY - 50;
    ctx.beginPath();
    ctx.moveTo(l1x - 36, browY - 14);
    ctx.quadraticCurveTo(l1x, browY - 32, l1x + 36, browY - 6);
    ctx.lineWidth = 13;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(l2x - 28, browY);
    ctx.quadraticCurveTo(l2x, browY - 16, l2x + 32, browY + 4);
    ctx.lineWidth = 12;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Nose in 3/4
    ctx.beginPath();
    ctx.moveTo(hx - 4, eyeY + 12);
    ctx.lineTo(hx - 18, eyeY + 46);
    ctx.lineTo(hx - 4, eyeY + 54);
    ctx.lineWidth = 6;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Mouth in 3/4
    const mouthY = eyeY + 98;
    ctx.beginPath();
    ctx.moveTo(hx - 28, mouthY);
    ctx.quadraticCurveTo(hx - 6, mouthY + 14, hx + 22, mouthY + 4);
    ctx.lineWidth = 7;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }

  private static drawFrontHairThreeQuarter(ctx: CanvasRenderingContext2D, cx: number): void {
    const headY = 310;
    const hx = cx - 20;

    ctx.beginPath();
    ctx.moveTo(hx - 145, headY - 40);
    ctx.lineTo(hx - 155, headY + 8);
    ctx.lineTo(hx - 140, headY - 15);
    ctx.lineTo(hx - 120, headY - 70);
    ctx.lineTo(hx - 95, headY - 20);
    ctx.lineTo(hx - 65, headY - 85);
    ctx.lineTo(hx - 30, headY - 15);
    ctx.lineTo(hx - 5, headY - 45);
    ctx.lineTo(hx + 20, headY - 10);
    ctx.lineTo(hx + 50, headY - 75);
    ctx.lineTo(hx + 85, headY - 15);
    ctx.lineTo(hx + 120, headY - 65);
    ctx.lineTo(hx + 145, headY - 15);
    ctx.lineTo(hx + 155, headY + 8);
    ctx.lineTo(hx + 145, headY - 40);
    ctx.bezierCurveTo(hx + 175, headY - 200, hx - 175, headY - 200, hx - 145, headY - 40);
    ctx.closePath();
    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Cowlick Tuft in 3/4
    ctx.beginPath();
    ctx.moveTo(hx + 35, headY - 165);
    ctx.bezierCurveTo(hx + 65, headY - 245, hx + 135, headY - 275, cx + 175, headY - 235);
    ctx.bezierCurveTo(cx + 195, headY - 200, cx + 160, headY - 185, cx + 140, headY - 205);
    ctx.bezierCurveTo(cx + 125, headY - 225, hx + 80, headY - 210, hx + 65, headY - 155);
    ctx.closePath();
    ctx.fillStyle = PALETTE.hair;
    ctx.fill();
    ctx.lineWidth = 11;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();
  }
}
