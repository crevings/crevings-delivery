import { describe, expect, it } from "vitest";
import { evaluatePhotoPixels } from "../src/shared/utils/photoIntelligence";

/**
 * Synthetic-image regression tests for the photo signal engine.
 *
 * Images are hand-drawn faces (no real photos needed): a bright skin face on a
 * neutral background, eyebrows, bright sclera "eye whites", optional glasses
 * frames / sunglasses / glints. These lock in the two behaviours that matter:
 *   1. Clean faces (even with heavy brows, phone glints or a cool colour cast)
 *      are NEVER hard-blocked as "wearing specs".
 *   2. Real full-frame glasses and sunglasses ARE still hard-blocked.
 */

const W = 320;
const H = 320;

type Rgb = [number, number, number];

function blank(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    data[i * 4] = 130;
    data[i * 4 + 1] = 130;
    data[i * 4 + 2] = 130;
    data[i * 4 + 3] = 255;
  }
  return data;
}

function fillRect(data: Uint8ClampedArray, x0: number, y0: number, x1: number, y1: number, [r, g, b]: Rgb) {
  const cx0 = Math.max(0, Math.min(W - 1, Math.round(x0)));
  const cx1 = Math.max(0, Math.min(W - 1, Math.round(x1)));
  const cy0 = Math.max(0, Math.min(H - 1, Math.round(y0)));
  const cy1 = Math.max(0, Math.min(H - 1, Math.round(y1)));
  for (let y = cy0; y <= cy1; y++) {
    for (let x = cx0; x <= cx1; x++) {
      const i = (y * W + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}

/** Apply a mild cool (blue-shifted) white-balance cast, keeping near-white pixels neutral. */
function coolCast(data: Uint8ClampedArray) {
  for (let i = 0; i < W * H; i++) {
    const j = i * 4;
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) <= 12) continue; // neutral → keep white white
    data[j] = Math.max(0, r - 26);
    data[j + 1] = Math.max(0, g - 6);
    data[j + 2] = Math.min(255, b + 26);
  }
}

interface FaceOpts {
  /** rows of dark "eye whites" (sclera) */
  scleraTop?: number;
  /** vertical gap (px) between eyebrow bottom and sclera top */
  browGap?: number;
  /** "none" | "full-frame" | "top-only" */
  glasses?: "none" | "full-frame" | "top-only";
  /** dark lenses covering each eye (sunglasses) */
  sunglasses?: boolean;
  /** small cool phone-screen glints inside each eye */
  phoneGlint?: boolean;
  /** true → whole-image cool white-balance shift */
  cool?: boolean;
  /** true → eyes closed (no sclera, no lenses) */
  closedEyes?: boolean;
}

const SKIN: Rgb = [235, 190, 150];
const BROW: Rgb = [45, 38, 32];
const WHITE: Rgb = [242, 242, 242];
const FRAME: Rgb = [18, 16, 14];
const LENS: Rgb = [24, 20, 20];
const MOUTH: Rgb = [170, 105, 95];
const GLINT: Rgb = [172, 206, 246];

function drawFace(opts: FaceOpts = {}): Uint8ClampedArray {
  const data = blank();
  const scleraTop = opts.scleraTop ?? 150;
  const browGap = opts.browGap ?? 11;

  // Face (skin) on neutral background.
  fillRect(data, 90, 30, 230, 310, SKIN);
  // Mouth.
  fillRect(data, 150, 262, 170, 270, MOUTH);

  // Eyebrows (only when not fully covered by sunglasses).
  if (!opts.sunglasses) {
    fillRect(data, 112, scleraTop - browGap - 3, 208, scleraTop - browGap - 1, BROW);
  }

  // Sclera ("eye whites") unless closed/sunglasses.
  if (!opts.sunglasses && !opts.closedEyes) {
    fillRect(data, 132, scleraTop, 148, scleraTop + 6, WHITE);
    fillRect(data, 172, scleraTop, 188, scleraTop + 6, WHITE);
  }

  if (opts.glasses && opts.glasses !== "none") {
    // Thin continuous dark rims across both lenses + the nose bridge.
    if (opts.glasses === "full-frame" || opts.glasses === "top-only") {
      fillRect(data, 104, scleraTop - 5, 216, scleraTop - 4, FRAME);
    }
    if (opts.glasses === "full-frame") {
      fillRect(data, 104, scleraTop + 9, 216, scleraTop + 10, FRAME);
    }
  }

  if (opts.sunglasses) {
    // Dark lenses over each eye, leaving the nose bridge + cheeks visible.
    fillRect(data, 112, scleraTop - 30, 158, scleraTop + 22, LENS);
    fillRect(data, 162, scleraTop - 30, 208, scleraTop + 22, LENS);
  }

  if (opts.phoneGlint) {
    fillRect(data, 138, scleraTop + 1, 143, scleraTop + 4, GLINT);
    fillRect(data, 178, scleraTop + 1, 183, scleraTop + 4, GLINT);
  }

  if (opts.cool) coolCast(data);
  return data;
}

const evaluate = (data: Uint8ClampedArray) => evaluatePhotoPixels(W, H, data);

describe("photoIntelligence glasses detection", () => {
  it("passes a clean, bare-faced photo", () => {
    const r = evaluate(drawFace());
    expect(r.faceFound).toBe(true);
    expect(r.eyesFound).toBe(true);
    expect(r.glassesDetected).toBe(false);
    expect(r.possibleGlasses).toBe(false);
    expect(r.passed).toBe(true);
  });

  it("passes a face with heavy eyebrows close to the eyes (v1 false-positive class)", () => {
    const r = evaluate(drawFace({ browGap: 2 }));
    expect(r.glassesDetected).toBe(false);
    // Advisory at most — never a forced retake.
    expect(r.passed).toBe(true);
  });

  it("still hard-blocks full-frame spectacles", () => {
    const r = evaluate(drawFace({ glasses: "full-frame" }));
    expect(r.glassesDetected).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("does not hard-block rimless/top-only frames but flags them as advisory", () => {
    const r = evaluate(drawFace({ glasses: "top-only" }));
    expect(r.glassesDetected).toBe(false);
    expect(r.possibleGlasses).toBe(true);
    expect(r.passed).toBe(true);
  });

  it("hard-blocks sunglasses", () => {
    const r = evaluate(drawFace({ sunglasses: true }));
    expect(r.sunglassesDetected).toBe(true);
    expect(r.glassesDetected).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("ignores small bilateral phone-screen glints in the eyes", () => {
    const r = evaluate(drawFace({ phoneGlint: true }));
    expect(r.glassesDetected).toBe(false);
    expect(r.possibleGlasses).toBe(false);
    expect(r.passed).toBe(true);
  });

  it("ignores a cool colour cast on the whole face", () => {
    const r = evaluate(drawFace({ cool: true }));
    expect(r.glassesDetected).toBe(false);
    expect(r.passed).toBe(true);
  });

  it("rejects a photo with no face in it", () => {
    const r = evaluate(blank());
    expect(r.faceFound).toBe(false);
    expect(r.passed).toBe(false);
  });

  it("rejects closed eyes (cannot verify identity) without claiming sunglasses", () => {
    const r = evaluate(drawFace({ closedEyes: true }));
    expect(r.sunglassesDetected).toBe(false);
    expect(r.glassesDetected).toBe(false);
    expect(r.passed).toBe(false);
  });
});
