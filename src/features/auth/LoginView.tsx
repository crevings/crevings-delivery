import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Loader2,
  ShieldCheck,
  CreditCard,
  Zap,
  TrendingUp,
  Bike,
  Flame,
  Sparkles,
  Bell,
  Award,
  Wallet,
  Headphones,
  Gift,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { post, ResponseError } from "@/api/fetcher";
import { useAuth } from "@/app/providers";
import { useAuthStore } from "@/app/store";
import { LoadingSpinner } from "@/shared/components/layout";

export interface DeliveryAuthUser {
  referenceId?: string;
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
}

interface LoginViewProps {
  onLoginSuccess?: (user: DeliveryAuthUser) => void;
  onNavigateToOnboarding?: () => void;
}

type LoginStep = "input" | "otp" | "name";

/**
 * Map a failed OTP verification to a user-facing message.
 */
const otpFailureMessage = (err: unknown): string => {
  const info = (err as ResponseError | null)?.info;
  const code =
    info && typeof info === "object" && "error" in info
      ? (info as { error?: unknown }).error
      : undefined;
  if (code === "OTP_EXPIRED") return "OTP is expired";
  return "Incorrect OTP";
};

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToOnboarding,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoadingAuth = useAuthStore((s) => s.isLoadingAuth);

  // If already authenticated, navigate to dashboard immediately
  useEffect(() => {
    if (!isLoadingAuth && isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, isLoadingAuth, navigate]);

  const [view, setViewState] = useState<LoginStep>("input");

  useEffect(() => {
    const step = (location.state as { loginStep?: LoginStep } | null)?.loginStep;
    setViewState(step === "otp" || step === "name" ? step : "input");
  }, [location.state]);

  const setView = (next: LoginStep) => {
    setViewState(next);
    navigate(location.pathname + location.search, {
      state: { ...((location.state as Record<string, unknown>) || {}), loginStep: next },
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<DeliveryAuthUser | null>(null);
  const [showRestoredModal, setShowRestoredModal] = useState(false);
  const [isNewUserLogin, setIsNewUserLogin] = useState(false);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    setOtpError(null);
    setApiError(null);

    const digitsOnly = value.replace(/\D/g, "");

    // Handle multi-digit entry (e.g. browser autofill)
    if (digitsOnly.length > 1) {
      const newOtp = [...otp];
      const chars = digitsOnly.slice(0, 6 - index).split("");
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + chars.length, 5);
      otpInputs.current[nextFocus]?.focus();
      return;
    }

    // Single digit entry
    const newOtp = [...otp];
    newOtp[index] = digitsOnly;
    setOtp(newOtp);

    // Auto shift to next block seamlessly if digit entered
    if (digitsOnly && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    e.preventDefault();
    setOtpError(null);
    setApiError(null);

    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedText) return;

    const newOtp = [...otp];
    const digits = pastedText.slice(0, 6).split("");
    const targetStart = digits.length === 6 ? 0 : startIndex;

    digits.forEach((char, i) => {
      if (targetStart + i < 6) {
        newOtp[targetStart + i] = char;
      }
    });

    setOtp(newOtp);

    const nextFocusIndex = Math.min(targetStart + digits.length, 5);
    otpInputs.current[nextFocusIndex]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpInputs.current[index + 1]?.focus();
    }
  };

  const verifyOtpAndLogin = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) return;

    setIsVerifying(true);
    setApiError(null);

    try {
      const data = await post<{
        success: boolean;
        message?: string;
        error?: string;
        token?: string;
        user?: DeliveryAuthUser;
        isNewUser?: boolean;
        deletionCancelled?: boolean;
      }>("/delivery/auth/verify-otp", {
        phone: phoneNumber,
        otp: enteredOtp,
      });

      if (!data.success) {
        throw new Error(data.error === "OTP_EXPIRED" ? "OTP is expired" : "Incorrect OTP");
      }

      if (data.user) {
        setAuthenticatedUser(data.user);
        authLogin(data.token, data.user);
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }

      const isNew = Boolean(
        data.isNewUser ||
          !data.user?.name ||
          data.user.name === "New User" ||
          data.user.name === "Delivery Partner"
      );
      setIsNewUserLogin(isNew);

      if (data.deletionCancelled) {
        setShowRestoredModal(true);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setOtpError(otpFailureMessage(err));
      setApiError(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveNameAndContinue = async () => {
    if (!nameInput.trim()) return;

    setIsSavingName(true);
    setApiError(null);

    try {
      const baseUser = authenticatedUser || {
        name: nameInput.trim(),
        phone: phoneNumber,
        email: "",
        role: "DELIVERY_PARTNER",
      };
      const updatedUser = { ...baseUser, name: nameInput.trim() };
      authLogin(undefined, updatedUser);
      if (onLoginSuccess) {
        onLoginSuccess(updatedUser);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Could not save name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const triggerSendWhatsappOtp = async (targetPhone: string) => {
    try {
      const data = await post<unknown>("/delivery/auth/request-whatsapp-otp", {
        phone: targetPhone,
      });
      // SECURITY: Do NOT log OTP response data in production
      console.log("📱 WhatsApp OTP response: [REDACTED]");
    } catch (err) {
      console.error("Failed to trigger WhatsApp OTP:", err);
    }
  };

  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  const marqueeCardsRow1 = [
    { text: "Instant Daily Payouts", icon: <CreditCard size={15} className="text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { text: "Flexible Working Hours", icon: <Zap size={15} className="text-amber-500" />, bg: "bg-amber-50 border-amber-100 text-amber-700" },
    { text: "Earn ₹35,000+/month", icon: <TrendingUp size={15} className="text-blue-500" />, bg: "bg-blue-50 border-blue-100 text-blue-700" },
    { text: "Live Route Navigation", icon: <Bike size={15} className="text-indigo-500" />, bg: "bg-indigo-50 border-indigo-100 text-indigo-700" },
    { text: "Weekly Peak Bonuses", icon: <Flame size={15} className="text-rose-500" />, bg: "bg-rose-50 border-rose-100 text-rose-700" },
    { text: "Zero Joining Fee", icon: <Sparkles size={15} className="text-purple-500" />, bg: "bg-purple-50 border-purple-100 text-purple-700" },
  ];

  const marqueeCardsRow2 = [
    { text: "Real-time Order Alerts", icon: <Bell size={15} className="text-orange-500" />, bg: "bg-orange-50 border-orange-100 text-orange-700" },
    { text: "Accident Insurance Cover", icon: <ShieldCheck size={15} className="text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { text: "Milestone Rewards", icon: <Award size={15} className="text-yellow-500" />, bg: "bg-yellow-50 border-yellow-100 text-yellow-700" },
    { text: "Direct Bank Transfer", icon: <Wallet size={15} className="text-teal-500" />, bg: "bg-teal-50 border-teal-100 text-teal-700" },
    { text: "24/7 Partner Support", icon: <Headphones size={15} className="text-cyan-500" />, bg: "bg-cyan-50 border-cyan-100 text-cyan-700" },
    { text: "Refer & Earn ₹1,000", icon: <Gift size={15} className="text-pink-500" />, bg: "bg-pink-50 border-pink-100 text-pink-700" },
  ];

  const marqueeCardsRow3 = [
    { text: "Performance Leaderboard", icon: <TrendingUp size={15} className="text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { text: "High Demand Hotspots", icon: <Flame size={15} className="text-red-500" />, bg: "bg-red-50 border-red-100 text-red-700" },
    { text: "Fuel & Trip Allowances", icon: <Wallet size={15} className="text-blue-500" />, bg: "bg-blue-50 border-blue-100 text-blue-700" },
    { text: "Free Safety Gear Kit", icon: <Shield size={15} className="text-violet-500" />, bg: "bg-violet-50 border-violet-100 text-violet-700" },
    { text: "Fast Digital Onboarding", icon: <Zap size={15} className="text-amber-500" />, bg: "bg-amber-50 border-amber-100 text-amber-700" },
    { text: "Weekly Special Incentives", icon: <Award size={15} className="text-fuchsia-500" />, bg: "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700" },
  ];

  const renderMarquee = () => {
    const row1 = [...marqueeCardsRow1, ...marqueeCardsRow1];
    const row2 = [...marqueeCardsRow2, ...marqueeCardsRow2];
    const row3 = [...marqueeCardsRow3, ...marqueeCardsRow3];

    return (
      <div className="w-[calc(100%+3rem)] -mx-6 overflow-hidden my-auto flex flex-col gap-2.5 relative py-2">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-2.5 w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {row1.map((card, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${card.bg} whitespace-nowrap shadow-xs`}
            >
              {card.icon}
              <span className="text-[13px] font-semibold">{card.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="flex gap-2.5 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {row2.map((card, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${card.bg} whitespace-nowrap shadow-xs`}
            >
              {card.icon}
              <span className="text-[13px] font-semibold">{card.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="flex gap-2.5 w-max"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {row3.map((card, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${card.bg} whitespace-nowrap shadow-xs`}
            >
              {card.icon}
              <span className="text-[13px] font-semibold">{card.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col font-sans overflow-hidden app-container shadow-2xl pt-safe-3">
      {/* Top Hero Section with Marquee Scrolling Animation */}
      <div className="flex-1 w-full bg-slate-50 flex flex-col justify-between items-center px-4 pt-6 pb-4 overflow-hidden relative">
        {/* Logo and Tag */}
        <div className="flex flex-col items-center justify-center shrink-0 z-10">
          <img
            src="/Logo.png"
            alt="Crevings"
            className="h-11 w-auto object-contain"
          />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.22em] mt-1.5">
            Delivery Partner
          </span>
        </div>

        {/* Marquee badging */}
        {renderMarquee()}

        {/* Catchy headline */}
        <div className="text-center shrink-0 z-10 px-2">
          <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight leading-snug">
            Deliver & Earn With <span className="text-[#00bd6f]">CREVINGS</span>
          </h1>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            Flexible hours • Instant payouts • Maximum earnings
          </p>
        </div>
      </div>

      {/* Bottom Action Sheet */}
      <div className="px-6 pb-8 bg-white border-t border-slate-100 pt-4 relative z-20 shadow-lg">
        {apiError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold text-center">
            {apiError}
          </div>
        )}

        {view === "input" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-left">
              <label className="text-[14px] font-medium text-slate-700">Mobile Number</label>
            </div>

            <div className="flex items-center h-14 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#00bd6f] focus-within:ring-1 focus-within:ring-[#00bd6f] bg-white transition-all">
              <div className="flex items-center gap-2 px-4 border-r border-slate-200 bg-white h-full shrink-0">
                <img
                  loading="lazy"
                  src="https://flagcdn.com/w20/in.png"
                  alt="India"
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                />
                <span className="text-[15px] font-medium text-slate-700">+91</span>
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                maxLength={10}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 text-[15px] font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (phoneNumber.length === 10) {
                  setView("otp");
                  triggerSendWhatsappOtp(phoneNumber);
                }
              }}
              disabled={phoneNumber.length < 10}
              className={`w-full h-14 rounded-xl font-semibold text-[16px] flex items-center justify-center transition-all ${
                phoneNumber.length === 10
                  ? "bg-[#00bd6f] text-white active:scale-[0.98] shadow-md shadow-emerald-500/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-100" />
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">New to Crevings?</span>
              <div className="flex-grow border-t border-slate-100" />
            </div>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToOnboarding) {
                  onNavigateToOnboarding();
                } else {
                  navigate("/onboarding");
                }
              }}
              className="w-full h-14 rounded-xl font-semibold text-[16px] flex items-center justify-center transition-all bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-50 active:scale-[0.98] shadow-xs"
            >
              Become a Partner
            </button>
          </div>
        )}

        {view === "otp" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-left">
              <p className="text-[14px] text-slate-500">
                Code sent to <span className="font-bold text-slate-900">+91 {phoneNumber}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputs.current[index] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handleOtpPaste(e, index)}
                  onFocus={(e) => e.target.select()}
                  className={`w-[46px] h-[54px] text-center text-xl font-bold rounded-xl border transition-all focus:outline-none ${
                    otpError
                      ? "border-rose-300 bg-rose-50 text-rose-600"
                      : digit
                      ? "border-[#00bd6f] bg-emerald-50 text-[#00bd6f]"
                      : "border-slate-200 bg-white focus:border-[#00bd6f]"
                  }`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-rose-500 text-[13px] font-medium animate-in fade-in">
                {otpError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if ((location.state as { loginStep?: LoginStep } | null)?.loginStep) {
                    navigate(-1);
                  } else {
                    setViewState("input");
                  }
                }}
                className="w-1/3 h-14 rounded-xl font-semibold text-[16px] flex items-center justify-center transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]"
              >
                Back
              </button>
              <button
                onClick={verifyOtpAndLogin}
                disabled={otp.join("").length < 6 || isVerifying}
                className={`flex-1 h-14 rounded-xl font-semibold text-[16px] flex items-center justify-center transition-all ${
                  otp.join("").length === 6 && !isVerifying
                    ? "bg-[#00bd6f] text-white active:scale-[0.98] shadow-md shadow-emerald-500/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isVerifying ? <Loader2 size={22} className="animate-spin text-white" /> : "Verify & Continue"}
              </button>
            </div>

            <div className="w-full">
              <button
                type="button"
                onClick={() => {
                  if (phoneNumber) triggerSendWhatsappOtp(phoneNumber);
                }}
                className="w-full h-12 rounded-xl font-medium text-[13px] text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Resend WhatsApp OTP
              </button>
            </div>
          </div>
        )}

        {view === "name" && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-left">
              <h3 className="text-[18px] font-bold text-slate-900 mb-1">What should we call you?</h3>
              <p className="text-[13px] text-slate-500">Please enter your name to complete your profile.</p>
            </div>

            <div className="flex items-center h-14 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#00bd6f] focus-within:ring-1 focus-within:ring-[#00bd6f] bg-white transition-all px-4">
              <input
                type="text"
                placeholder="Enter your full name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 text-[15px] font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveNameAndContinue}
              disabled={!nameInput.trim() || isSavingName}
              className={`w-full h-14 rounded-xl font-semibold text-[16px] flex items-center justify-center transition-all ${
                nameInput.trim() && !isSavingName
                  ? "bg-[#00bd6f] text-white active:scale-[0.98] shadow-md shadow-emerald-500/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSavingName ? <Loader2 size={22} className="animate-spin text-white" /> : "Save & Continue"}
            </button>
          </div>
        )}

        <div className="mt-5 text-center border-t border-slate-100 pt-3.5 px-2">
          <p className="text-[8px] text-slate-400 leading-snug">
            By continuing, you agree to receive important updates and promotional communications from CREVINGS via RCS, SMS, WhatsApp, email, and phone calls. By continuing, you also agree to our{" "}
            <button type="button" onClick={() => navigate("/legal")} className="text-[#00bd6f] hover:underline font-semibold">Privacy Policy</button>,{" "}
            <button type="button" onClick={() => navigate("/legal")} className="text-[#00bd6f] hover:underline font-semibold">Terms of Service</button>, and{" "}
            <button type="button" onClick={() => navigate("/legal")} className="text-[#00bd6f] hover:underline font-semibold">Refund Policy</button>.
          </p>
        </div>
      </div>

      {/* Account Restored Custom UI Modal */}
      {showRestoredModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#00bd6f] mb-4 border border-emerald-100/60 shadow-sm">
              <ShieldCheck className="w-9 h-9" strokeWidth={2.2} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Account Restored!</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              Welcome back! Your scheduled account deletion request has been automatically cancelled and your account is fully retained.
            </p>

            <button
              onClick={() => {
                setShowRestoredModal(false);
                if (isNewUserLogin) {
                  setView("name");
                } else {
                  if (authenticatedUser && onLoginSuccess) {
                    onLoginSuccess(authenticatedUser);
                  }
                  navigate("/", { replace: true });
                }
              }}
              className="w-full py-3.5 bg-[#00bd6f] text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform"
            >
              Continue to App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
