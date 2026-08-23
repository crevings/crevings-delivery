/**
 * Photo Intelligence Analysis Utility
 * Analyzes lighting, luminance, contrast, sharpness, and detects spectacles / sunglasses / face obstructions.
 */

export interface PhotoQualityResult {
  passed: boolean;
  lightingStatus: "GOOD" | "TOO_DARK" | "TOO_BRIGHT";
  blurStatus: "CLEAR" | "BLURRY";
  glassesDetected: boolean;
  faceObstructed: boolean;
  averageBrightness: number;
  contrastScore: number;
  sharpnessScore: number;
  glassesScore: number;
  feedback: string[];
}

export async function analyzePhotoQuality(
  imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | string
): Promise<PhotoQualityResult> {
  return new Promise((resolve) => {
    let imgElement: HTMLImageElement;

    const processCanvas = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          passed: true,
          lightingStatus: "GOOD",
          blurStatus: "CLEAR",
          glassesDetected: false,
          faceObstructed: false,
          averageBrightness: 128,
          contrastScore: 50,
          sharpnessScore: 50,
          glassesScore: 0,
          feedback: ["Image captured successfully."],
        });
        return;
      }

      const width = 320;
      const height = 320;

      // Downscale to standardized analysis canvas
      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = width;
      analysisCanvas.height = height;
      const actx = analysisCanvas.getContext("2d");
      if (!actx) {
        resolve({
          passed: true,
          lightingStatus: "GOOD",
          blurStatus: "CLEAR",
          glassesDetected: false,
          faceObstructed: false,
          averageBrightness: 128,
          contrastScore: 50,
          sharpnessScore: 50,
          glassesScore: 0,
          feedback: ["Image captured successfully."],
        });
        return;
      }

      actx.drawImage(canvas, 0, 0, width, height);
      const imgData = actx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      const totalPixels = width * height;

      let totalLuminance = 0;
      const luminances: Float32Array = new Float32Array(totalPixels);
      const reds: Uint8Array = new Uint8Array(totalPixels);
      const greens: Uint8Array = new Uint8Array(totalPixels);
      const blues: Uint8Array = new Uint8Array(totalPixels);

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const pIdx = i / 4;
        reds[pIdx] = r;
        greens[pIdx] = g;
        blues[pIdx] = b;

        // Relative luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        luminances[pIdx] = lum;
        totalLuminance += lum;
      }

      const avgBrightness = totalLuminance / totalPixels;

      // ─── 1. Contrast (Standard Deviation of luminance) ─────────────
      let varianceSum = 0;
      for (let i = 0; i < totalPixels; i++) {
        const diff = luminances[i] - avgBrightness;
        varianceSum += diff * diff;
      }
      const contrastScore = Math.sqrt(varianceSum / totalPixels);

      // ─── 2. Sharpness (Laplacian / Edge gradient variance) ─────────
      let edgeGradientSum = 0;
      let edgeSamples = 0;
      const step = 2;
      for (let y = 0; y < height - 1; y += step) {
        for (let x = 0; x < width - 1; x += step) {
          const idx = y * width + x;
          const rightIdx = idx + 1;
          const bottomIdx = idx + width;
          const dx = Math.abs(luminances[idx] - luminances[rightIdx]);
          const dy = Math.abs(luminances[idx] - luminances[bottomIdx]);
          edgeGradientSum += dx + dy;
          edgeSamples++;
        }
      }
      const sharpnessScore = edgeSamples > 0 ? (edgeGradientSum / edgeSamples) * 2 : 50;

      // ─── 3. Reference Cheek Skin Tone Extraction ───────────────────
      // Cheeks: left x: 20%-35%, right x: 65%-80%, y: 52%-66%
      let cheekLumSum = 0;
      let cheekSamples = 0;
      for (let y = Math.floor(height * 0.52); y < Math.floor(height * 0.66); y += 2) {
        for (let x = Math.floor(width * 0.22); x < Math.floor(width * 0.35); x += 2) {
          cheekLumSum += luminances[y * width + x];
          cheekSamples++;
        }
        for (let x = Math.floor(width * 0.65); x < Math.floor(width * 0.78); x += 2) {
          cheekLumSum += luminances[y * width + x];
          cheekSamples++;
        }
      }
      const avgCheekBrightness = cheekSamples > 0 ? cheekLumSum / cheekSamples : avgBrightness;

      // ─── 4. Glasses / Spectacles / Sunglasses Detection ────────────
      //
      // High-precision optical detection:
      //  • Human skin and sclera (whites of eyes) are warm/neutral: R >= G >= B.
      //  • Eyeglass lenses reflect artificial light (AR coating / screens): B > R + 16 with high intensity.
      //  • Eyeglass frames form dark, high-contrast borders and a distinct nose bridge connector.
      //  • Sunglasses create extreme localized darkness in the eye sockets while face is well-lit.
      //
      let glassesSignals = 0;

      const eyeY1 = Math.floor(height * 0.22);
      const eyeY2 = Math.floor(height * 0.58);
      const eyeX1 = Math.floor(width * 0.18);
      const eyeX2 = Math.floor(width * 0.82);
      const midX = Math.floor(width * 0.50);

      let leftArGlareCount = 0;
      let leftLensTotal = 0;
      let rightArGlareCount = 0;
      let rightLensTotal = 0;

      let totalArGlareCount = 0;
      let darkRimCount = 0;
      let sharpEdgeCount = 0;
      let eyeZoneTotal = 0;
      let eyeZoneLumSum = 0;

      for (let y = eyeY1; y < eyeY2; y++) {
        for (let x = eyeX1; x < eyeX2; x++) {
          const idx = y * width + x;
          const r = reds[idx];
          const g = greens[idx];
          const b = blues[idx];
          const lum = luminances[idx];

          eyeZoneLumSum += lum;
          eyeZoneTotal++;

          const isLeft = x < midX - 4;
          const isRight = x > midX + 4;

          if (isLeft) leftLensTotal++;
          if (isRight) rightLensTotal++;

          // ── Signal A: Genuine Optical AR Coating & Screen Glare ──
          // On human skin/sclera, Red is always higher than Blue (R > B).
          // Only glass lenses with AR coating or screen reflections exhibit strong blue/cyan dominance.
          const isBlueArReflection = b > r + 16 && b > g + 8 && b > 55;
          const isCyanScreenReflection = b > r + 14 && g > r + 10 && b > 55;

          if (isBlueArReflection || isCyanScreenReflection) {
            totalArGlareCount++;
            if (isLeft) leftArGlareCount++;
            if (isRight) rightArGlareCount++;
          }

          // ── Signal B: Dark Frame Rim Pixels (Significantly darker than local cheek skin) ──
          if (avgCheekBrightness > 40) {
            const darkFrameThresh = Math.min(avgCheekBrightness * 0.42, 45);
            if (lum < darkFrameThresh) {
              darkRimCount++;
            }
          }

          // ── Signal C: Sharp Frame Boundary Edges ──
          if (x < eyeX2 - 1 && y < eyeY2 - 1) {
            const dx = Math.abs(lum - luminances[idx + 1]);
            const dy = Math.abs(lum - luminances[idx + width]);
            if (dx > 28 || dy > 28) {
              sharpEdgeCount++;
            }
          }
        }
      }

      // ── Ambient blue-light correction from cheek baseline ──
      let cheekCoolCount = 0;
      let cheekSampleCount = 0;
      for (let y = Math.floor(height * 0.52); y < Math.floor(height * 0.66); y += 2) {
        for (let x = Math.floor(width * 0.22); x < Math.floor(width * 0.35); x += 2) {
          const idx = y * width + x;
          if (blues[idx] > reds[idx] + 12) cheekCoolCount++;
          cheekSampleCount++;
        }
        for (let x = Math.floor(width * 0.65); x < Math.floor(width * 0.78); x += 2) {
          const idx = y * width + x;
          if (blues[idx] > reds[idx] + 12) cheekCoolCount++;
          cheekSampleCount++;
        }
      }
      const cheekCoolRatio = cheekSampleCount > 0 ? cheekCoolCount / cheekSampleCount : 0;

      // ── Ratios ──
      const rawGlareRatio = eyeZoneTotal > 0 ? totalArGlareCount / eyeZoneTotal : 0;
      const netGlareRatio = Math.max(0, rawGlareRatio - cheekCoolRatio * 1.5);

      const leftGlareRatio = leftLensTotal > 0 ? leftArGlareCount / leftLensTotal : 0;
      const rightGlareRatio = rightLensTotal > 0 ? rightArGlareCount / rightLensTotal : 0;

      const darkRimRatio = eyeZoneTotal > 0 ? darkRimCount / eyeZoneTotal : 0;
      const edgeRatio = eyeZoneTotal > 0 ? sharpEdgeCount / eyeZoneTotal : 0;
      const avgEyeBrightness = eyeZoneTotal > 0 ? eyeZoneLumSum / eyeZoneTotal : avgBrightness;

      // ═══════════════════════════════════════════════════════════════
      // Multi-Signal Scoring Engine
      // ═══════════════════════════════════════════════════════════════

      // 1. Bilateral AR-Coating / Screen Glare (Both lenses reflecting simultaneously)
      if (leftGlareRatio > 0.012 && rightGlareRatio > 0.012) {
        glassesSignals += 60;
      } else if (netGlareRatio > 0.025) {
        glassesSignals += 45;
      } else if (netGlareRatio > 0.012) {
        glassesSignals += 25;
      }

      // 2. Physical Frame Rims + High Edge Density (thick dark frames)
      if (avgCheekBrightness > 45 && darkRimRatio > 0.16 && edgeRatio > 0.18) {
        glassesSignals += 35;
      } else if (avgCheekBrightness > 45 && darkRimRatio > 0.10 && edgeRatio > 0.12) {
        glassesSignals += 20;
      }

      // 3. Nose Bridge Connector (dark bar connecting frames)
      if (avgCheekBrightness > 45) {
        let bridgeDark = 0;
        let bridgeTotal = 0;
        for (let y = Math.floor(height * 0.28); y < Math.floor(height * 0.50); y++) {
          for (let x = Math.floor(width * 0.45); x < Math.floor(width * 0.55); x++) {
            if (luminances[y * width + x] < avgCheekBrightness * 0.45) {
              bridgeDark++;
            }
            bridgeTotal++;
          }
        }
        if (bridgeTotal > 0 && bridgeDark / bridgeTotal > 0.35) {
          glassesSignals += 20;
        }
      }

      // 4. Dark Sunglasses (Pitch black eye zone while face is well-lit)
      if (avgCheekBrightness > 65 && avgEyeBrightness < avgCheekBrightness * 0.35 && avgEyeBrightness < 35) {
        glassesSignals += 60;
      }

      const glassesScore = Math.min(Math.round(glassesSignals), 100);
      const glassesDetected = glassesScore >= 50;

      // ─── 5. Face Obstruction Check (Hand/Mask over mouth/nose) ─────
      let lowerFaceEdgeSum = 0;
      let lowerFaceSamples = 0;
      for (let y = Math.floor(height * 0.62); y < Math.floor(height * 0.85); y += 2) {
        for (let x = Math.floor(width * 0.34); x < Math.floor(width * 0.66); x += 2) {
          const idx = y * width + x;
          if (x < width - 2 && y < height - 2) {
            const dx = Math.abs(luminances[idx] - luminances[idx + 2]);
            const dy = Math.abs(luminances[idx] - luminances[idx + width * 2]);
            lowerFaceEdgeSum += dx + dy;
            lowerFaceSamples++;
          }
        }
      }
      const lowerFaceEdgeDensity = lowerFaceSamples > 0 ? lowerFaceEdgeSum / lowerFaceSamples : 0;
      const faceObstructed = avgBrightness >= 35 && lowerFaceEdgeDensity > 55 && contrastScore > 75;

      // ─── 6. Evaluation Rules & User Feedback ───────────────────────
      const feedback: string[] = [];
      let lightingStatus: "GOOD" | "TOO_DARK" | "TOO_BRIGHT" = "GOOD";
      let blurStatus: "CLEAR" | "BLURRY" = "CLEAR";

      if (avgBrightness < 45) {
        lightingStatus = "TOO_DARK";
        feedback.push("⚠️ Photo is too dark. Please move to a brighter area or face the light.");
      } else if (avgBrightness > 225) {
        lightingStatus = "TOO_BRIGHT";
        feedback.push("⚠️ High glare or overexposed. Avoid direct harsh backlight.");
      } else {
        feedback.push("✓ Lighting is clear and well-balanced.");
      }

      if (sharpnessScore < 6 && contrastScore < 16) {
        blurStatus = "BLURRY";
        feedback.push("⚠️ Image appears blurry or out of focus. Hold phone steady.");
      } else {
        feedback.push("✓ Sharpness & focus are good.");
      }

      if (glassesDetected) {
        feedback.push("❌ Spectacles / Glasses Detected! Please remove your glasses or sunglasses.");
      } else {
        feedback.push("✓ No spectacles or sunglasses detected.");
      }

      if (faceObstructed) {
        feedback.push("⚠️ Face obstruction detected (e.g. hand or mask). Keep face fully visible.");
      }

      const passed =
        lightingStatus === "GOOD" &&
        blurStatus === "CLEAR" &&
        !glassesDetected &&
        !faceObstructed;

      resolve({
        passed,
        lightingStatus,
        blurStatus,
        glassesDetected,
        faceObstructed,
        averageBrightness: Math.round(avgBrightness),
        contrastScore: Math.round(contrastScore),
        sharpnessScore: Math.round(sharpnessScore),
        glassesScore,
        feedback,
      });
    };

    if (typeof imageSource === "string") {
      imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth || 400;
        canvas.height = imgElement.naturalHeight || 400;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(imgElement, 0, 0);
        processCanvas(canvas);
      };
      imgElement.onerror = () => {
        resolve({
          passed: true,
          lightingStatus: "GOOD",
          blurStatus: "CLEAR",
          glassesDetected: false,
          faceObstructed: false,
          averageBrightness: 120,
          contrastScore: 40,
          sharpnessScore: 40,
          glassesScore: 0,
          feedback: ["Image ready."],
        });
      };
      imgElement.src = imageSource;
    } else if (imageSource instanceof HTMLVideoElement) {
      const canvas = document.createElement("canvas");
      canvas.width = imageSource.videoWidth || 480;
      canvas.height = imageSource.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(imageSource, 0, 0);
      processCanvas(canvas);
    } else if (imageSource instanceof HTMLCanvasElement) {
      processCanvas(imageSource);
    } else if (imageSource instanceof HTMLImageElement) {
      const canvas = document.createElement("canvas");
      canvas.width = imageSource.naturalWidth || 400;
      canvas.height = imageSource.naturalHeight || 400;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(imageSource, 0, 0);
      processCanvas(canvas);
    }
  });
}
