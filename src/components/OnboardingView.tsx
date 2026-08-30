import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '@/app/store';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  Camera,
  RefreshCw,
  ShieldCheck,
  User,
  Phone,
  Mail,
  HeartHandshake,
  AlertCircle,
  FileCheck,
  Sparkles,
  Info,
  Loader2,
  Check,
  Sun,
  Eye,
  Building2,
  CreditCard,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { get, post, BASE_URL } from "@/api/fetcher";
import { analyzePhotoQuality, PhotoQualityResult } from "@/shared/utils/photoIntelligence";

interface OnboardingViewProps {
  onComplete?: () => void;
  onBack?: () => void;
}

// Upload helper to Cloudflare backend - strict Cloudflare CDN upload (NO local blob/data-URI fallback)
async function uploadFileToCloudflare(file: File | Blob, filename = "upload.jpg"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, filename);

  const response = await fetch(`${BASE_URL}/upload/image/public`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Upload failed with status ${response.status}`;
    try {
      const json = await response.json();
      if (json?.message) errorMsg = json.message;
      else if (json?.error) errorMsg = json.error;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const url = json?.data?.url || json?.url;
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    throw new Error("Invalid Cloudflare upload response: image URL missing");
  }

  return url;
}

// Delete helper -- removes an image from Cloudflare CDN
async function deleteImageFromCloudflare(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith("http")) return;
  try {
    await fetch(`${BASE_URL}/upload/image/public`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
  } catch {
    // Best-effort cleanup -- dont block the retake flow
  }
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onBack }) => {
  const navigate = useNavigate();
  const partnerId = useAuthStore(s => s.partnerId);

  // ── sessionStorage persistence key (encrypted, non-persistent) ──────
    const STORAGE_KEY = partnerId ? `onboarding_draft_${partnerId}` : null;

    // Lightweight XOR obfuscation — prevents casual inspection of PII in sessionStorage.
    // Key is derived from partnerId so each partner's draft is independently scrambled.
    const _obfuscate = (plaintext: string, key: string): string => {
      let out = "";
      for (let i = 0; i < plaintext.length; i++) {
        out += String.fromCharCode(plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      // btoa handles the (possibly non-ASCII) result safely for storage
      try { return btoa(out); } catch { return out; }
    };
    const _deobfuscate = (encoded: string, key: string): string => {
      let decoded: string;
      try { decoded = atob(encoded); } catch { return encoded; }
      let out = "";
      for (let i = 0; i < decoded.length; i++) {
        out += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return out;
    };

    const saveDraft = (data: Record<string, any>) => {
      if (!STORAGE_KEY) return;
      try {
        const json = JSON.stringify(data);
        const encrypted = _obfuscate(json, STORAGE_KEY);
        sessionStorage.setItem(STORAGE_KEY, encrypted);
      } catch {}
    };
    const loadDraft = (): Record<string, any> | null => {
      if (!STORAGE_KEY) return null;
      try {
        const encrypted = sessionStorage.getItem(STORAGE_KEY);
        if (!encrypted) return null;
        const json = _deobfuscate(encrypted, STORAGE_KEY);
        return JSON.parse(json);
      } catch { return null; }
    };
    const clearDraft = () => {
      if (!STORAGE_KEY) return;
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Success
  const [isRestoringStep, setIsRestoringStep] = useState(true);
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // PAGE 1: Personal & Emergency Information
  // ─────────────────────────────────────────────────────────────
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "Parent",
  });

  // ── Restore onboarding progress from sessionStorage + backend on mount ──
    useEffect(() => {
      if (!partnerId) { setIsRestoringStep(false); return; }
      (async () => {
        // Priority 1: restore from sessionStorage encrypted draft (survives refresh, NOT cross-session)
        const draft = loadDraft();
      if (draft) {
        if (draft.personalDetails) setPersonalDetails(draft.personalDetails);
        if (draft.selfieUrl) setSelfieUrl(draft.selfieUrl);
        if (draft.aadhaarNumber) setAadhaarNumber(draft.aadhaarNumber);
        if (draft.aadhaarFrontPhoto) setAadhaarFrontPhoto(draft.aadhaarFrontPhoto);
        if (draft.aadhaarBackPhoto) setAadhaarBackPhoto(draft.aadhaarBackPhoto);
        if (draft.isAadhaarVerified) setIsAadhaarVerified(true);
        if (draft.panNumber) setPanNumber(draft.panNumber);
        if (draft.panCardPhoto) setPanCardPhoto(draft.panCardPhoto);
        if (draft.isPanVerified) setIsPanVerified(true);
        if (draft.termsAgreed) setTermsAgreed(true);
        if (draft.isPhoneVerified) setIsPhoneVerified(true);
        if (draft.currentStep && draft.currentStep >= 1 && draft.currentStep <= 3) {
          setCurrentStep(draft.currentStep);
        }
        setIsRestoringStep(false);
        return;
      }
      // Priority 2: fallback to backend status
      try {
        const data = await get<Record<string, any>>("/delivery/onboarding");
        if (data?.onboardingStatus === "PROFILE" || data?.onboardingStatus === "KYC_PENDING") {
          setCurrentStep(2);
          setPersonalDetails({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            emergencyName: data.emergencyContact?.name || "",
            emergencyPhone: data.emergencyContact?.phone || "",
            emergencyRelationship: data.emergencyContact?.relationship || "Parent",
          });
        }
        const selfieDoc = data.documents?.find((d: any) => d.type === "SELFIE");
        const savedSelfieUrl = data.selfieUrl || selfieDoc?.url;
        if (savedSelfieUrl && savedSelfieUrl.startsWith("http")) {
          setSelfieUrl(savedSelfieUrl);
          setCurrentStep(2);
        }
        // Restore KYC data from backend
        const aadhaarFrontDoc = data.documents?.find((d: any) => d.type === "AADHAAR_FRONT");
        const aadhaarBackDoc = data.documents?.find((d: any) => d.type === "AADHAAR_BACK");
        const panDoc = data.documents?.find((d: any) => d.type === "PAN_CARD");
        if (data.aadhaar?.verified) setIsAadhaarVerified(true);
        if (data.pan?.verified) setIsPanVerified(true);
        if (data.onboardingStatus === "KYC_PENDING" || data.aadhaar?.verified || data.pan?.verified) {
          setCurrentStep(3);
          if (aadhaarFrontDoc?.url) setAadhaarFrontPhoto(aadhaarFrontDoc.url);
          if (aadhaarBackDoc?.url) setAadhaarBackPhoto(aadhaarBackDoc.url);
          if (panDoc?.url) setPanCardPhoto(panDoc.url);
        }
      } catch {
        // No saved progress -- start fresh at step 1
      } finally {
        setIsRestoringStep(false);
      }
    })();
  }, [partnerId]);

  // Mobile OTP state
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendPhoneOtp = async () => {
    const cleanPhone = personalDetails.phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) return;
    setIsSendingPhoneOtp(true);
    setPhoneOtpError(null);
    try {
      // Pre-check if phone number is already registered with another account
      const checkRes: any = await post("/delivery/onboarding/check-phone", {
        phone: cleanPhone,
      });
      if (checkRes && checkRes.available === false) {
        setPhoneOtpError(checkRes.message || "This phone number is already registered. Please log in.");
        setIsSendingPhoneOtp(false);
        return;
      }

      const otpRes: any = await post("/delivery/auth/request-whatsapp-otp", {
        phone: cleanPhone,
      });
      if (otpRes?.otp) {
              // SECURITY: Do NOT log OTP values in production
              console.log("🔥 [OTP Generated]: [REDACTED]");
            }
      setShowOtpBox(true);
      setOtpCountdown(30);
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      console.warn("OTP request note:", err);
      const errMsg = err?.message || "";
      if (errMsg && (errMsg.includes("already registered") || errMsg.includes("already exists"))) {
        setPhoneOtpError(errMsg);
        return;
      }
      setShowOtpBox(true);
      setOtpCountdown(30);
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const entered = phoneOtp.join("");
    if (entered.length < 6) {
      setPhoneOtpError("Please enter complete 6-digit OTP");
      return;
    }
    setIsVerifyingPhoneOtp(true);
    setPhoneOtpError(null);
    try {
      const cleanPhone = personalDetails.phone.replace(/\D/g, "").slice(-10);
      const res: any = await post("/delivery/auth/verify-otp", {
        phone: cleanPhone,
        otp: entered,
      });
      if (res && res.success === true) {
        setIsPhoneVerified(true);
        setShowOtpBox(false);
        setPhoneOtpError(null);
      } else {
        setPhoneOtpError(res?.message || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setPhoneOtpError(err?.message || "Invalid OTP. Please check the code and retry.");
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleOtpDigitChange = (val: string, idx: number) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length > 1) {
      const newOtp = [...phoneOtp];
      const chars = digits.slice(0, 6 - idx).split("");
      chars.forEach((char, i) => {
        if (idx + i < 6) newOtp[idx + i] = char;
      });
      setPhoneOtp(newOtp);
      const nextFocus = Math.min(idx + chars.length, 5);
      otpInputs.current[nextFocus]?.focus();
      return;
    }
    const newOtp = [...phoneOtp];
    newOtp[idx] = digits.slice(-1);
    setPhoneOtp(newOtp);
    if (digits && idx < 5) {
      otpInputs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !phoneOtp[idx] && idx > 0) {
      otpInputs.current[idx - 1]?.focus();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE 2: Live Selfie Upload & Quality Intelligence
  // ─────────────────────────────────────────────────────────────
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const previousSelfieUrlRef = useRef<string | null>(null);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoQualityResult | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const selfieInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const triggerNativeCamera = () => {
    if (selfieInputRef.current) {
      selfieInputRef.current.click();
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        triggerNativeCamera();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.warn("Camera stream denied/unavailable, opening native camera:", err);
      setIsCameraActive(false);
      triggerNativeCamera();
    }
  };

  // Ensure stream attaches to video once video element mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn("Video play error:", e));
    }
  }, [isCameraActive, facingMode]);

  const handleSelfieFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      stopCamera();
      setIsUploadingSelfie(true);
      setGlobalError(null);

      // Analyze photo quality locally
      setIsAnalyzingPhoto(true);
      const img = new Image();
      const localPreview = URL.createObjectURL(file);
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 480;
        canvas.height = img.naturalHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const quality = await analyzePhotoQuality(canvas);
            setPhotoAnalysis(quality);
          } catch (err) {
            console.warn("Quality analysis error:", err);
          }
        }
        setIsAnalyzingPhoto(false);
        URL.revokeObjectURL(localPreview);
      };
      img.src = localPreview;

      // Strict Cloudflare upload
      // Delete old Cloudflare image if retaking
      const oldUrl = selfieUrl;
      const uploadedUrl = await uploadFileToCloudflare(file, "selfie.jpg");
      setSelfieUrl(uploadedUrl);
      previousSelfieUrlRef.current = uploadedUrl;
      if (oldUrl && oldUrl !== uploadedUrl) {
        deleteImageFromCloudflare(oldUrl).catch(() => {});
      }
      // Persist selfie to backend so it survives sessionStorage clear
      post("/delivery/onboarding/selfie", { selfieUrl: uploadedUrl }).catch(() => {});
    } catch (err: any) {
      console.error("Selfie upload error:", err);
      setGlobalError(err.message || "Failed to upload selfie to Cloudflare. Please try again.");
      setSelfieUrl(null);
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  const captureSelfieFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop camera stream
    stopCamera();

    // Run instant photo quality analysis directly from the canvas
    setIsAnalyzingPhoto(true);
    try {
      const quality = await analyzePhotoQuality(canvas);
      setPhotoAnalysis(quality);
    } catch (err) {
      console.warn("Photo analysis error:", err);
    } finally {
      setIsAnalyzingPhoto(false);
    }

    // Direct Cloudflare upload
    setIsUploadingSelfie(true);
    setGlobalError(null);
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          // Delete old Cloudflare image if retaking
          const oldUrl = selfieUrl;
          const uploadedUrl = await uploadFileToCloudflare(blob, "selfie.jpg");
          setSelfieUrl(uploadedUrl);
          previousSelfieUrlRef.current = uploadedUrl;
          if (oldUrl && oldUrl !== uploadedUrl) {
            deleteImageFromCloudflare(oldUrl).catch(() => {});
          }
          // Persist selfie to backend so it survives sessionStorage clear
          post("/delivery/onboarding/selfie", { selfieUrl: uploadedUrl }).catch(() => {});
        } catch (err: any) {
          console.error("Selfie upload error:", err);
          setGlobalError(err.message || "Failed to upload selfie to Cloudflare. Please try again.");
          setSelfieUrl(null);
        } finally {
          setIsUploadingSelfie(false);
        }
      }
    }, "image/jpeg", 0.92);
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE 3: Aadhaar & PAN Verification
  // ─────────────────────────────────────────────────────────────
  const [aadhaarMode, setAadhaarMode] = useState<"DIGILOCKER" | "MANUAL">("DIGILOCKER");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState(["", "", "", "", "", ""]);
  const [aadhaarRefId, setAadhaarRefId] = useState<string | null>(null);
  const [isSendingAadhaarOtp, setIsSendingAadhaarOtp] = useState(false);
  const [isVerifyingAadhaarOtp, setIsVerifyingAadhaarOtp] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);

  // Manual Aadhaar Photos
  const [aadhaarFrontPhoto, setAadhaarFrontPhoto] = useState<string | null>(null);
  const [aadhaarBackPhoto, setAadhaarBackPhoto] = useState<string | null>(null);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  // PAN details
  const [panNumber, setPanNumber] = useState("");
  const [panCardPhoto, setPanCardPhoto] = useState<string | null>(null);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [panError, setPanError] = useState<string | null>(null);
  const [isUploadingPan, setIsUploadingPan] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(false);

  // ── Auto-save onboarding draft to encrypted sessionStorage on every change ────
  useEffect(() => {
    if (isRestoringStep) return; // Don't save while still loading
    saveDraft({
      currentStep,
      personalDetails,
      isPhoneVerified,
      selfieUrl,
      aadhaarNumber,
      aadhaarFrontPhoto,
      aadhaarBackPhoto,
      isAadhaarVerified,
      panNumber,
      panCardPhoto,
      isPanVerified,
      termsAgreed,
    });
  }, [currentStep, personalDetails, isPhoneVerified, selfieUrl, aadhaarNumber, aadhaarFrontPhoto, aadhaarBackPhoto, isAadhaarVerified, panNumber, panCardPhoto, isPanVerified, termsAgreed, isRestoringStep]);

  const handleSendAadhaarOtp = async () => {
    const clean = aadhaarNumber.replace(/\D/g, "");
    if (clean.length !== 12) {
      setAadhaarError("Aadhaar number must be exactly 12 digits");
      return;
    }
    setAadhaarError(null);
    setIsSendingAadhaarOtp(true);
    try {
      const res: any = await post("/delivery/kyc/aadhaar/generate-otp", {
        aadhaarNumber: clean,
      });
      if (res?.success) {
        setAadhaarRefId(res.referenceId || `ref_${Date.now()}`);
        setAadhaarOtpSent(true);
      } else {
        setAadhaarError(res?.message || "Failed to send Aadhaar OTP");
      }
    } catch (err: any) {
      const msg = err.message?.includes("aborted")
        ? "Verification request timed out. Please try again or use manual upload."
        : err.message || "Failed to trigger Aadhaar OTP. Please try manual upload.";
      setAadhaarError(msg);
    } finally {
      setIsSendingAadhaarOtp(false);
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    const cleanOtp = aadhaarOtp.join("");
    if (cleanOtp.length < 6) {
      setAadhaarError("Please enter 6-digit Aadhaar OTP");
      return;
    }
    setIsVerifyingAadhaarOtp(true);
    setAadhaarError(null);
    try {
      const res: any = await post("/delivery/kyc/aadhaar/verify-otp", {
        referenceId: aadhaarRefId || "mock_ref_1234",
        otp: cleanOtp,
      });
      if (res?.success || res?.verified) {
        setIsAadhaarVerified(true);
        // Persist Aadhaar to backend so it survives sessionStorage clear
        post("/delivery/onboarding/kyc-draft", {
          aadhaarNumber: aadhaarNumber.trim(),
          aadhaarVerified: true,
          aadhaarFrontUrl: aadhaarFrontPhoto || "",
          aadhaarBackUrl: aadhaarBackPhoto || "",
        }).catch(() => {});
      } else {
        setAadhaarError(res?.message || "Invalid Aadhaar OTP");
      }
    } catch (err: any) {
      const msg = err.message?.includes("aborted")
        ? "Verification timed out. Please try again."
        : err.message || "Aadhaar verification failed";
      setAadhaarError(msg);
    } finally {
      setIsVerifyingAadhaarOtp(false);
    }
  };

  const handleVerifyPan = async () => {
    const cleanPan = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
    if (!panRegex.test(cleanPan)) {
      setPanError("Invalid PAN format (e.g. ABCDE1234F)");
      return;
    }
    setIsVerifyingPan(true);
    setPanError(null);
    try {
      const res: any = await post("/delivery/kyc/pan/verify", {
        panNumber: cleanPan,
        name: personalDetails.name,
      });
      if (res?.success || res?.verified) {
        setIsPanVerified(true);
        // Persist PAN to backend so it survives sessionStorage clear
        post("/delivery/onboarding/kyc-draft", {
          panNumber: panNumber.trim().toUpperCase(),
          panVerified: true,
          panCardUrl: panCardPhoto || "",
        }).catch(() => {});
      } else {
        setPanError(res?.message || "PAN verification failed");
      }
    } catch (err: any) {
      const msg = err.message?.includes("aborted")
        ? "PAN verification timed out. Please try again."
        : err.message || "PAN verification error";
      setPanError(msg);
    } finally {
      setIsVerifyingPan(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FINAL SUBMISSION
  // ─────────────────────────────────────────────────────────────
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const payload = {
        name: personalDetails.name,
        phone: personalDetails.phone,
        phoneVerified: isPhoneVerified,
        email: personalDetails.email,
        emergencyContact: {
          name: personalDetails.emergencyName,
          phone: personalDetails.emergencyPhone,
          relationship: personalDetails.emergencyRelationship,
        },
        selfieUrl: selfieUrl || "",
        aadhaar: {
          number: aadhaarNumber,
          verified: isAadhaarVerified,
          frontUrl: aadhaarFrontPhoto || "",
          backUrl: aadhaarBackPhoto || "",
          method: aadhaarMode === "DIGILOCKER" ? (isAadhaarVerified ? "OTP" : "DIGILOCKER") : "MANUAL_UPLOAD",
        },
        pan: {
          number: panNumber.toUpperCase(),
          verified: isPanVerified,
          cardUrl: panCardPhoto || "",
          method: isPanVerified ? "API_VERIFIED" : "MANUAL_UPLOAD",
        },
      };

      await post("/delivery/onboarding/submit", payload);
      // Clear onboarding draft from sessionStorage (no longer needed)
      clearDraft();
      // Persist onboarding-complete flag so ProtectedRoute allows app access
      // on next login / app restart.
      if (partnerId) {
        try {
          localStorage.setItem(`onboarding_complete_${partnerId}`, 'true');
        } catch { /* non-fatal */ }
      }
      setCurrentStep(4); // Show success screen
    } catch (err: any) {
      setGlobalError(err.message || "Failed to submit application. Please check all details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSamePhone =
    personalDetails.phone.length === 10 &&
    personalDetails.emergencyPhone.length === 10 &&
    personalDetails.phone === personalDetails.emergencyPhone;

  const isStep1Valid =
    personalDetails.name.trim().length >= 2 &&
    personalDetails.phone.length === 10 &&
    isPhoneVerified &&
    personalDetails.email.includes("@") &&
    personalDetails.emergencyName.trim().length >= 2 &&
    personalDetails.emergencyPhone.length === 10 &&
    !isSamePhone;

  const isStep2Valid = !!selfieUrl && !isUploadingSelfie && typeof selfieUrl === "string" && selfieUrl.startsWith("http") && (!photoAnalysis || photoAnalysis.passed);

  const isStep3Valid =
    (isAadhaarVerified || (aadhaarFrontPhoto && aadhaarBackPhoto)) &&
    (isPanVerified || (panNumber.length === 10 && panCardPhoto)) &&
    termsAgreed;

  return (
    <div className="fixed inset-0 z-[550] bg-slate-50 flex flex-col font-sans overflow-y-auto app-container shadow-2xl">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={() => {
            if (currentStep > 1 && currentStep < 4) {
              setCurrentStep((s) => (s - 1) as any);
            } else if (onBack) {
              onBack();
            } else {
              navigate("/login");
            }
          }}
          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-black text-slate-900 tracking-tight">BECOME A PARTNER</span>
          </div>
          {currentStep < 4 && (
            <span className="text-[11px] font-bold text-[#00bd6f] uppercase tracking-wider">
              Step {currentStep} of 3
            </span>
          )}
        </div>

        <div className="w-10" />
      </div>

      {/* Progress Stepper Line */}
      {currentStep < 4 && (
        <div className="w-full bg-slate-200 h-1">
          <div
            className="bg-[#00bd6f] h-1 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col">
        {globalError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 1: Personal & Emergency Info */}
          {/* ───────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div>
                  <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Personal Details</h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">Please provide your contact information to get started.</p>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                    <User size={15} className="text-[#00bd6f]" /> Full Name (as per Govt ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={personalDetails.name}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })}
                    className="w-full h-13 px-4 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none focus:border-[#00bd6f] focus:ring-1 focus:ring-[#00bd6f] shadow-xs"
                  />
                </div>

                {/* Mobile Number & OTP Verification */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone size={15} className="text-[#00bd6f]" /> Mobile Number
                    </span>
                    {isPhoneVerified && (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    )}
                  </label>

                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 border border-slate-200 bg-slate-50 rounded-xl h-13 shrink-0">
                      <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-4 h-3 object-cover rounded-xs" />
                      <span className="text-[14px] font-bold text-slate-700">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      disabled={isPhoneVerified}
                      value={personalDetails.phone}
                      onChange={(e) => {
                        setPersonalDetails({ ...personalDetails, phone: e.target.value.replace(/\D/g, "") });
                        setIsPhoneVerified(false);
                        setShowOtpBox(false);
                      }}
                      className="flex-1 h-13 px-4 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none focus:border-[#00bd6f] focus:ring-1 focus:ring-[#00bd6f] shadow-xs disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {!isPhoneVerified && personalDetails.phone.length === 10 && (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={isSendingPhoneOtp}
                        className="px-3.5 h-13 bg-[#00bd6f] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-600 active:scale-95 transition-all shadow-xs flex items-center gap-1"
                      >
                        {isSendingPhoneOtp ? <Loader2 size={14} className="animate-spin" /> : showOtpBox ? "Resend" : "Verify"}
                      </button>
                    )}
                  </div>

                  {/* Inline OTP Input Box */}
                  {showOtpBox && !isPhoneVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 mt-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-900">Enter OTP sent to phone:</span>
                        {otpCountdown > 0 && <span className="text-[11px] font-semibold text-emerald-700">{otpCountdown}s</span>}
                      </div>

                      <div className="flex justify-between gap-1.5">
                        {phoneOtp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpInputs.current[i] = el;
                            }}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(e.target.value, i)}
                            onKeyDown={(e) => handleOtpKeyDown(e, i)}
                            className="w-11 h-12 text-center text-lg font-bold bg-white rounded-xl border border-emerald-300 focus:border-[#00bd6f] focus:outline-none"
                          />
                        ))}
                      </div>

                      {phoneOtpError && <p className="text-rose-500 text-xs font-semibold">{phoneOtpError}</p>}

                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={isVerifyingPhoneOtp}
                        className="w-full h-11 bg-[#00bd6f] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        {isVerifyingPhoneOtp ? <Loader2 size={14} className="animate-spin" /> : "Confirm OTP"}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Email Address (Without OTP) */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail size={15} className="text-[#00bd6f]" /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.sharma@example.com"
                    value={personalDetails.email}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                    className="w-full h-13 px-4 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 focus:outline-none focus:border-[#00bd6f] focus:ring-1 focus:ring-[#00bd6f] shadow-xs"
                  />
                  <p className="text-[11px] text-slate-400">Used for monthly payout statements & tax invoices.</p>
                </div>

                {/* Emergency Contact Card */}
                <div className="pt-2">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <HeartHandshake size={18} className="text-rose-500" />
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900">Emergency Contact Person</h4>
                        <p className="text-[11px] text-slate-500">Contacted in case of on-road emergency or safety alerts.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Contact Person Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Ramesh Sharma"
                          value={personalDetails.emergencyName}
                          onChange={(e) => setPersonalDetails({ ...personalDetails, emergencyName: e.target.value })}
                          className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#00bd6f]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Emergency Phone</label>
                          <input
                            type="tel"
                            placeholder="10-digit phone"
                            maxLength={10}
                            value={personalDetails.emergencyPhone}
                            onChange={(e) =>
                              setPersonalDetails({ ...personalDetails, emergencyPhone: e.target.value.replace(/\D/g, "") })
                            }
                            className={`w-full h-11 px-3.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:outline-none ${
                              isSamePhone ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-[#00bd6f]"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Relationship</label>
                          <select
                            value={personalDetails.emergencyRelationship}
                            onChange={(e) =>
                              setPersonalDetails({ ...personalDetails, emergencyRelationship: e.target.value })
                            }
                            className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#00bd6f]"
                          >
                            <option value="Parent">Parent</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Friend">Friend</option>
                            <option value="Relative">Relative</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      {isSamePhone && (
                        <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={13} /> Emergency contact cannot be the same as personal phone.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!isStep1Valid) return;
                    setIsSavingBasic(true);
                    try {
                      await post("/delivery/onboarding/basic", {
                        name: personalDetails.name.trim(),
                        phone: personalDetails.phone,
                        email: personalDetails.email.trim().toLowerCase(),
                        vehicleType: "Bike",
                      });
                    } catch {
                      // Non-fatal: step 1 data will be included in final submission
                    } finally {
                      setIsSavingBasic(false);
                      setCurrentStep(2);
                    }
                  }}
                  disabled={!isStep1Valid || isSavingBasic}
                  className={`w-full h-14 rounded-2xl font-bold text-[16px] flex items-center justify-center transition-all ${
                    isStep1Valid
                      ? "bg-[#00bd6f] text-white active:scale-98 shadow-md shadow-emerald-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSavingBasic ? "Saving..." : "Continue to Selfie Verification"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 2: Live Selfie Upload & Quality Intelligence */}
          {/* ───────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Live Selfie Verification</h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Take a clear, well-lit photo of yourself to verify your identity.
                  </p>
                </div>

                {/* Instructions & Guidelines Box */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> Photo Guidelines:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-emerald-800 font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-500 shrink-0" /> Good, clear lighting
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} className="text-rose-500 shrink-0" /> No specs or sunglasses
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-blue-500 shrink-0" /> Look directly into camera
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#00bd6f] shrink-0" /> Plain background
                    </div>
                  </div>
                </div>

                {/* Camera / Photo Capture Container */}
                <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-lg border-4 border-white flex items-center justify-center">
                  {isCameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Face Oval Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[180px] h-[230px] border-2 border-dashed border-[#00bd6f] rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                      </div>
                      {/* Controls inside camera */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-20">
                        <button
                          type="button"
                          onClick={() => {
                            setFacingMode((m) => (m === "user" ? "environment" : "user"));
                            startCamera();
                          }}
                          className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={captureSelfieFrame}
                          className="w-16 h-16 rounded-full bg-white border-4 border-[#00bd6f] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#00bd6f]" />
                        </button>
                      </div>
                    </>
                  ) : isUploadingSelfie ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                      <Loader2 size={36} className="animate-spin text-[#00bd6f]" />
                      <p className="text-sm font-bold text-white">Uploading to Cloudflare CDN...</p>
                      <p className="text-xs text-slate-400">Please wait a moment while your photo is verified</p>
                    </div>
                  ) : selfieUrl ? (
                    <div className="relative w-full h-full">
                      <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieUrl(null);
                          setPhotoAnalysis(null);
                          if (streamRef.current) stopCamera();
                        }}
                        className="absolute bottom-3 right-3 px-3.5 py-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <RefreshCw size={13} /> Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-white/80 space-y-3.5">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-[#00bd6f]">
                        <Camera size={32} />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Take a clear front-facing selfie to complete identity check.
                      </p>
                      
                      <div className="w-full space-y-2 max-w-[220px]">
                        <button
                          type="button"
                          onClick={triggerNativeCamera}
                          className="w-full py-3 bg-[#00bd6f] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Camera size={16} /> Open Camera
                        </button>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          Live Video Stream
                        </button>
                      </div>

                      {/* Hidden Native Device Camera Input */}
                      <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handleSelfieFileChange}
                      />
                    </div>
                  )}
                </div>

                {/* Photo Quality Intelligence Analysis Result */}
                {isAnalyzingPhoto && (
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                    <Loader2 size={16} className="animate-spin text-[#00bd6f]" />
                    <span>Analyzing photo quality & lighting...</span>
                  </div>
                )}

                {photoAnalysis && !isAnalyzingPhoto && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border ${
                      photoAnalysis.passed
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                        : photoAnalysis.glassesDetected
                        ? "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-amber-50/90 border-amber-200 text-amber-900"
                    } space-y-2.5 shadow-xs`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold flex items-center gap-1.5">
                        {photoAnalysis.passed ? (
                          <CheckCircle2 size={16} className="text-[#00bd6f]" />
                        ) : (
                          <AlertCircle size={16} className="text-rose-600" />
                        )}
                        Photo Quality:{" "}
                        {photoAnalysis.passed
                          ? "Verified & Approved"
                          : photoAnalysis.glassesDetected
                          ? "Spectacles Detected 👓"
                          : "Needs Improvement"}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200">
                        Brightness: {photoAnalysis.averageBrightness}/255
                      </span>
                    </div>

                    <ul className="text-[12px] space-y-1 pl-5 list-disc font-medium">
                      {photoAnalysis.feedback.map((f, i) => (
                        <li
                          key={i}
                          className={
                            f.includes("❌")
                              ? "text-rose-700 font-bold"
                              : f.includes("⚠️")
                              ? "text-amber-800 font-semibold"
                              : "text-emerald-800"
                          }
                        >
                          {f}
                        </li>
                      ))}
                    </ul>

                    {!photoAnalysis.passed && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieUrl(null);
                          setPhotoAnalysis(null);
                          startCamera();
                        }}
                        className="w-full mt-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RefreshCw size={13} />{" "}
                        {photoAnalysis.glassesDetected
                          ? "Retake — Remove Glasses First"
                          : "Retake Photo"}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setCurrentStep(1);
                  }}
                  className="w-1/3 h-14 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-[15px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setCurrentStep(3);
                  }}
                  disabled={!isStep2Valid}
                  className={`flex-1 h-14 rounded-2xl font-bold text-[16px] flex items-center justify-center transition-all ${
                    isStep2Valid
                      ? "bg-[#00bd6f] text-white active:scale-98 shadow-md shadow-emerald-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Proceed to Aadhaar & PAN
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 3: Aadhaar & PAN Verification */}
          {/* ───────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div>
                  <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Identity Verification</h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Verify your Aadhaar and PAN for payout compliance and background verification.
                  </p>
                </div>

                {/* ── Aadhaar Card Box ── */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00bd6f] flex items-center justify-center font-bold">
                        <FileCheck size={18} />
                      </div>
                      <span className="text-[15px] font-bold text-slate-900">Aadhaar Verification</span>
                    </div>

                    {isAadhaarVerified && (
                      <span className="text-emerald-600 text-xs font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    )}
                  </div>

                  {/* Mode Selector Toggle */}
                  {!isAadhaarVerified && (
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setAadhaarMode("DIGILOCKER")}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          aadhaarMode === "DIGILOCKER" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        ⚡ DigiLocker / OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setAadhaarMode("MANUAL")}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          aadhaarMode === "MANUAL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        📷 Upload Photos
                      </button>
                    </div>
                  )}

                  {/* Mode A: DigiLocker / Aadhaar OTP */}
                  {aadhaarMode === "DIGILOCKER" && !isAadhaarVerified && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Aadhaar Number (12 digits)</label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            placeholder="XXXX XXXX XXXX"
                            maxLength={12}
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-wider text-slate-900 focus:outline-none focus:border-[#00bd6f]"
                          />
                          <button
                            type="button"
                            onClick={handleSendAadhaarOtp}
                            disabled={aadhaarNumber.length !== 12 || isSendingAadhaarOtp}
                            className={`px-3.5 h-12 rounded-xl text-xs font-bold shrink-0 transition-all ${
                              aadhaarNumber.length === 12
                                ? "bg-[#00bd6f] text-white active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSendingAadhaarOtp ? <Loader2 size={14} className="animate-spin" /> : "Send OTP"}
                          </button>
                        </div>
                      </div>

                      {aadhaarOtpSent && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-bold text-emerald-900">Enter 6-digit Aadhaar OTP:</span>
                          <div className="flex justify-between gap-1">
                            {aadhaarOtp.map((d, i) => (
                              <input
                                key={i}
                                type="tel"
                                maxLength={1}
                                value={d}
                                onChange={(e) => {
                                  const n = [...aadhaarOtp];
                                  n[i] = e.target.value.replace(/\D/g, "").slice(-1);
                                  setAadhaarOtp(n);
                                }}
                                className="w-10 h-11 text-center font-bold bg-white rounded-lg border border-emerald-300 focus:outline-none"
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyAadhaarOtp}
                            disabled={isVerifyingAadhaarOtp}
                            className="w-full h-10 bg-[#00bd6f] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            {isVerifyingAadhaarOtp ? <Loader2 size={14} className="animate-spin" /> : "Verify Aadhaar"}
                          </button>
                        </div>
                      )}

                      {aadhaarError && <p className="text-rose-500 text-xs font-semibold">{aadhaarError}</p>}
                    </div>
                  )}

                  {/* Mode B: Manual Aadhaar Photos Upload */}
                  {aadhaarMode === "MANUAL" && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front Photo */}
                      <div
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingFront(true);
                              setAadhaarError(null);
                              try {
                                const url = await uploadFileToCloudflare(file, "aadhaar_front.jpg");
                                setAadhaarFrontPhoto(url);
                              } catch (err: any) {
                                console.error("Aadhaar front upload error:", err);
                                setAadhaarError(err.message || "Failed to upload Aadhaar front image");
                              } finally {
                                setIsUploadingFront(false);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors h-28 overflow-hidden relative"
                      >
                        {isUploadingFront ? (
                          <Loader2 size={20} className="animate-spin text-[#00bd6f]" />
                        ) : aadhaarFrontPhoto ? (
                          <img src={aadhaarFrontPhoto} alt="Front" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <Upload size={18} className="text-[#00bd6f] mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Aadhaar Front</span>
                            <span className="text-[9px] text-slate-400">Click to upload</span>
                          </>
                        )}
                      </div>

                      {/* Back Photo */}
                      <div
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingBack(true);
                              setAadhaarError(null);
                              try {
                                const url = await uploadFileToCloudflare(file, "aadhaar_back.jpg");
                                setAadhaarBackPhoto(url);
                              } catch (err: any) {
                                console.error("Aadhaar back upload error:", err);
                                setAadhaarError(err.message || "Failed to upload Aadhaar back image");
                              } finally {
                                setIsUploadingBack(false);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors h-28 overflow-hidden relative"
                      >
                        {isUploadingBack ? (
                          <Loader2 size={20} className="animate-spin text-[#00bd6f]" />
                        ) : aadhaarBackPhoto ? (
                          <img src={aadhaarBackPhoto} alt="Back" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <Upload size={18} className="text-[#00bd6f] mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Aadhaar Back</span>
                            <span className="text-[9px] text-slate-400">Click to upload</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── PAN Card Box ── */}
                <div className="p-4.5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <CreditCard size={18} />
                      </div>
                      <span className="text-[15px] font-bold text-slate-900">PAN Verification</span>
                    </div>

                    {isPanVerified && (
                      <span className="text-emerald-600 text-xs font-extrabold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">PAN Number</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          className="flex-1 h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-wider text-slate-900 focus:outline-none focus:border-[#00bd6f]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyPan}
                          disabled={panNumber.length !== 10 || isVerifyingPan || isPanVerified}
                          className={`px-3.5 h-12 rounded-xl text-xs font-bold shrink-0 transition-all ${
                            panNumber.length === 10 && !isPanVerified
                              ? "bg-[#00bd6f] text-white active:scale-95"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {isVerifyingPan ? <Loader2 size={14} className="animate-spin" /> : isPanVerified ? "Verified" : "Verify PAN"}
                        </button>
                      </div>
                      {panError && <p className="text-rose-500 text-xs font-semibold mt-1">{panError}</p>}
                    </div>

                    {/* Optional PAN Card Photo */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        PAN Card Photo {isPanVerified ? "(Optional)" : "(Required for manual review)"}
                      </label>
                      <div
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingPan(true);
                              setPanError(null);
                              try {
                                const url = await uploadFileToCloudflare(file, "pan_card.jpg");
                                setPanCardPhoto(url);
                              } catch (err: any) {
                                console.error("PAN card upload error:", err);
                                setPanError(err.message || "Failed to upload PAN card image");
                              } finally {
                                setIsUploadingPan(false);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors h-14 px-4 overflow-hidden"
                      >
                        {isUploadingPan ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 size={16} className="animate-spin text-[#00bd6f]" /> Uploading PAN...
                          </div>
                        ) : panCardPhoto ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> PAN Image Uploaded
                            </span>
                            <span className="text-xs text-slate-400">Change</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                              <Upload size={14} className="text-[#00bd6f]" /> Upload PAN Card Image
                            </span>
                            <span className="text-xs text-slate-400">JPG/PNG</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <label className="flex items-start gap-2.5 p-3.5 bg-slate-100/70 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#00bd6f] rounded-md accent-[#00bd6f]"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I declare that the details provided are true and accurate. I understand that my account will remain{" "}
                    <strong className="text-slate-900">inactive</strong> until manually verified & activated by the Crevings Admin team.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 h-14 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all text-[15px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOnboarding}
                  disabled={!isStep3Valid || isSubmitting}
                  className={`flex-1 h-14 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all ${
                    isStep3Valid && !isSubmitting
                      ? "bg-[#00bd6f] text-white active:scale-98 shadow-md shadow-emerald-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 4: Application Submitted & Inactive Account Notice */}
          {/* ───────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 flex-1 flex flex-col items-center justify-center text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-[#00bd6f] shadow-lg shadow-emerald-500/10">
                <ShieldCheck size={44} strokeWidth={2.2} />
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  Account Status: Inactive (Under Review)
                </span>
                <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Application Submitted!</h2>
                <p className="text-[14px] text-slate-600 max-w-sm leading-relaxed">
                  Thank you for applying to become a Crevings Delivery Partner! Our team is reviewing your documents and
                  selfie. Your account will be manually activated within 24-48 hours.
                </p>
              </div>

              <div className="w-full max-w-sm p-4 bg-white border border-slate-200 rounded-2xl text-left space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{personalDetails.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Registered Phone:</span>
                  <span className="font-bold text-slate-900">+91 {personalDetails.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">KYC Status:</span>
                  <span className="font-bold text-emerald-600">SUBMITTED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onComplete) {
                    onComplete();
                  } else {
                    navigate("/login");
                  }
                }}
                className="w-full max-w-sm h-14 bg-slate-900 text-white rounded-2xl font-bold text-[16px] hover:bg-black active:scale-98 transition-all shadow-md"
              >
                Go to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingView;
