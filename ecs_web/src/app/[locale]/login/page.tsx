"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Globe, CheckCircle, ArrowLeft, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { authService } from "@/services/auth.service";

const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCeUucgwDtb70ZPDmE3v2bDk0sQt523IIANyQgHLHTtPq42KR9R5ZvqYYRKIJL1M2hFj1sVYmsB6LEU2qCnTXlUfVK2OCa6aYP1lve83OKBKhZFoBoBi6g0l2uJ2nb8pChVnYqRA4yXEJV67ldP5Am_k6Gm-yoyKTc2qeT2K_4sp43WkBj8nbDuGZez8_429pg9hzpbcxT3CQyTZobmllIi61Zv7075i-mgT7xsReCIK4_GnauC_zxk_DS7l1f6W1iBuqaNyE7cAXLS";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9DFUQ7Thz2pCU2Up6sjdGMLTxC6xJrCremEzlT9Ur0Do7pN9CY3-cNn5jjKyhLJk-vkfmaIP8Yx2jn15oc5a2Tsy-wSv5B2ieFaVnXKJ_wKibyFfwCOVM4mP6L0kWWIgEzA5Ux4VdSzrDEY24iczqw4OLoLsPjfK84ZDKaFyiJfFx4XVtPGDwHxwGoD0ApP09EwgylQw2kLyuPumj_yrBrqUAOPY8Y01uXvDVcZ26vskJ1fmLp2nhR0l9M9aEJQi0VDXvgEvgKQM";

const CODE_MESSAGES: Record<string, { vi: string; en: string }> = {
  APP_MESSAGE_2000: { vi: "Thành công", en: "Success" },
  APP_MESSAGE_4003: { vi: "Vui lòng nhập đầy đủ thông tin", en: "Please enter all required fields" },
  APP_MESSAGE_4016: { vi: "Email hoặc mật khẩu không đúng", en: "Invalid email or password" },
  APP_MESSAGE_4019: { vi: "Định dạng không hợp lệ", en: "Invalid format" },
  APP_MESSAGE_4020: { vi: "Tài khoản không tồn tại trong hệ thống", en: "Account not found in the system" },
  APP_MESSAGE_4031: { vi: "Mã OTP không hợp lệ", en: "Invalid OTP code" },
  APP_MESSAGE_4032: { vi: "Mã OTP đã hết hạn", en: "OTP code has expired" },
  APP_MESSAGE_5000: { vi: "Lỗi hệ thống, vui lòng thử lại sau", en: "System error, please try again later" },
  APP_MESSAGE_5001: { vi: "Lỗi cơ sở dữ liệu", en: "Database operation failed" },
  APP_MESSAGE_5003: { vi: "Lỗi dịch vụ bên ngoài, vui lòng thử lại sau", en: "External service error, please try again later" },
};

const getErrorMessage = (codeMessage: string, locale: string): string => {
  const message = CODE_MESSAGES[codeMessage];
  if (message) {
    return locale === "vi" ? message.vi : message.en;
  }
  return locale === "vi" ? "Đã xảy ra lỗi không xác định" : "An unknown error occurred";
};

type ForgotPasswordState = "none" | "forgot" | "reset_password" | "success";

const OTP_EXPIRY_MINUTES = 5;

export default function LoginPage() {
  const t = useTranslations("login");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [forgotPasswordState, setForgotPasswordState] = useState<ForgotPasswordState>("none");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Password login fields
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password fields
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Reset password fields
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer for OTP expiry
  const [otpExpiryTime, setOtpExpiryTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleLocale = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    router.push(`/${newLocale}/login`);
  };

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiryTime === null) return;

    const calculateRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((otpExpiryTime - now) / 1000));
      return remaining;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // OTP expired - reset to forgot password form
        if (forgotPasswordState === "reset_password") {
          setForgotPasswordState("forgot");
          setResetToken("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setOtpExpiryTime(null);
          setError(getErrorMessage("APP_MESSAGE_4032", locale));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiryTime, forgotPasswordState, locale]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validatePassword = (pwd: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailAddress || !password) {
      setError(getErrorMessage("APP_MESSAGE_4003", locale));
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, password }),
      });

      const data = await response.json();

      if (data.codeMessage === "APP_MESSAGE_2000" && data.data?.token) {
        const token = data.data.token;
        authService.setToken(token);

        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const decodedToken = authService.decodeToken(token);
        let redirectPath = "/system-admin/dashboard";

        if (decodedToken) {
          const role = decodedToken.role ||
            (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            "";

          const roleMapping: Record<string, string> = {
            SYSTEM_ADMIN: "/system-admin/dashboard",
            CLINIC_ADMIN: "/clinic-admin/dashboard",
            DOCTOR: "/doctor/dashboard",
            RECEPTIONIST: "/receptionist/dashboard",
            PATIENT: `/${locale}/patient/profiles`,
          };
          redirectPath = roleMapping[role] || redirectPath;
        }

        router.push(redirectPath);
      } else {
        setError(getErrorMessage(data.codeMessage, locale));
      }
    } catch {
      setError(getErrorMessage("APP_MESSAGE_5000", locale));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordState("forgot");
    setError("");
    setResetEmail("");
    setResetToken("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpExpiryTime(null);
  };

  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resetEmail) {
      setError(getErrorMessage("APP_MESSAGE_4003", locale));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError(getErrorMessage("APP_MESSAGE_4019", locale));
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1";
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (data.codeMessage === "APP_MESSAGE_2000" && data.data?.resetToken) {
        setResetToken(data.data.resetToken);
        setForgotPasswordState("reset_password");
        setOtpExpiryTime(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      } else {
        setError(getErrorMessage(data.codeMessage, locale));
      }
    } catch {
      setError(getErrorMessage("APP_MESSAGE_5000", locale));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError(getErrorMessage("APP_MESSAGE_4031", locale));
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError(getErrorMessage("APP_MESSAGE_4003", locale));
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(locale === "vi" ? "Mật khẩu không đáp ứng yêu cầu" : "Password does not meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(locale === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1";
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.codeMessage === "APP_MESSAGE_2000") {
        setForgotPasswordState("success");
        setOtpExpiryTime(null);
        setTimeout(() => {
          setForgotPasswordState("none");
          setResetEmail("");
          setResetToken("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setEmailAddress("");
          setPassword("");
        }, 2000);
      } else {
        setError(getErrorMessage(data.codeMessage, locale));
      }
    } catch {
      setError(getErrorMessage("APP_MESSAGE_5000", locale));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromForgotPassword = () => {
    setIsTransitioning(true);
    setForgotPasswordState("none");
    setError("");
    setResetEmail("");
    setResetToken("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpExpiryTime(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleBackToForgotForm = () => {
    setIsTransitioning(true);
    setForgotPasswordState("forgot");
    setError("");
    setResetToken("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpExpiryTime(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Render success state
  if (forgotPasswordState === "success") {
    return (
      <main className="flex flex-col md:flex-row min-h-screen">
        <section className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Modern eye clinic interior"
              className="w-full h-full object-cover"
              src={HERO_IMG}
            />
            <div className="absolute inset-0 medical-overlay mix-blend-multiply" />
          </div>
          <div className="relative z-10 text-center">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4 animate-bounce-in" />
            <h1 className="text-2xl text-white mb-2">{tAuth("resetPassword.passwordSuccess")}</h1>
            <p className="text-white/80">{tAuth("resetPassword.redirecting")}</p>
          </div>
        </section>
        <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-headline-xl text-on-surface mb-2">{tAuth("resetPassword.passwordSuccess")}</h2>
            <p className="font-body-md text-on-surface-variant mb-8">{tAuth("resetPassword.redirecting")}</p>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-progress" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side: Brand Identity */}
      <section className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Modern eye clinic interior with natural light and comfortable seating"
            className="w-full h-full object-cover"
            src={HERO_IMG}
          />
          <div className="absolute inset-0 medical-overlay mix-blend-multiply" />
        </div>

        <div className="relative z-10 text-center flex flex-col items-center max-w-4xl px-4">
          <Link href={`/${locale}/home`} className="mb-6 w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center shadow-lg hover:bg-white/15 transition-all cursor-pointer">
            <img
              alt="Eye Clinic Support Logo - Eye Care Professional Platform"
              className="w-full h-auto pointer-events-none"
              src={BRAND_LOGO}
            />
          </Link>
          <h1 className="text-2xl text-white mb-3 tracking-tight leading-tight">
            Eye Clinic Support System
          </h1>
          <p className="text-xl text-white/90 font-light tracking-wide">
            Your Vision, Our Priority
          </p>
        </div>

        <div className="absolute bottom-6 left-6 text-white/40 text-label-xs font-label-xs uppercase tracking-widest">
          Clinical Precision • Modern Care
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex items-center justify-center px-4 py-8 md:py-12 md:px-8">
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-sm shadow-sm"
            aria-label="Switch language"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase font-medium">{locale}</span>
          </button>
        </div>

        <div className="w-full max-w-3xl">
          {/* Mobile Logo */}
          <Link href={`/${locale}/home`} className="md:hidden mb-6 flex flex-col items-center hover:opacity-80 transition-opacity">
            <img
              alt="Eye Clinic Support Logo"
              className="w-20 h-20 mb-2"
              src={BRAND_LOGO}
            />
            <span className="font-headline-sm text-primary font-semibold">Eye Clinic Support</span>
          </Link>

          {/* Header */}
          <div className={cn("mb-8 text-center md:text-left transition-all duration-300", isTransitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0")}>
            {forgotPasswordState === "none" ? (
              <>
                <h2 className="font-headline-lg md:font-headline-2xl text-on-surface mb-1">
                  {t("welcomeBack")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("accessDashboard")}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={handleBackFromForgotPassword}
                    className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
                  </button>
                  <h2 className="font-headline-lg md:font-headline-2xl text-on-surface">
                    {forgotPasswordState === "forgot"
                      ? tAuth("forgotPassword.title")
                      : forgotPasswordState === "reset_password"
                        ? tAuth("resetPassword.title")
                        : t("welcomeBack")}
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant ml-10">
                  {forgotPasswordState === "forgot"
                    ? tAuth("forgotPassword.subtitle")
                    : forgotPasswordState === "reset_password"
                      ? tAuth("resetPassword.subtitle")
                      : t("accessDashboard")}
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-error-container text-error text-sm mb-4 animate-shake" role="alert">
              {error}
            </div>
          )}

          {/* Password Login Form */}
          {forgotPasswordState === "none" && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="email">
                  {t("email")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-body-md text-body-md text-outline">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className={cn(
                      "w-full pl-14 pr-4 py-3 bg-transparent border border-outline-variant rounded-lg",
                      "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                      "font-body-md text-body-md text-on-surface placeholder:text-outline/50"
                    )}
                    disabled={isLoading}
                    aria-label="Email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">
                    {t("password")}
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-label-md text-label-md text-primary hover:underline transition-all"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    className={cn(
                      "w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg",
                      "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                      "font-body-md text-body-md text-on-surface placeholder:text-outline/50"
                    )}
                    disabled={isLoading}
                    aria-label="Password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 bg-primary-container text-white font-label-lg text-label-lg rounded-lg",
                  "shadow-md shadow-primary-container/20",
                  "hover:bg-primary transition-all hover:scale-[1.01] active:scale-[0.98]",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label="Sign in to your account"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("signingIn")}
                  </>
                ) : (
                  t("signIn")
                )}
              </button>
            </form>
          )}

          {/* Forgot Password - Email Form */}
          {forgotPasswordState === "forgot" && (
            <form onSubmit={handleSendForgotPasswordOtp} className="space-y-5">
              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="forgotEmail">
                  {tAuth("forgotPassword.email")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-body-md text-body-md text-outline">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder={tAuth("forgotPassword.emailPlaceholder")}
                    className={cn(
                      "w-full pl-14 pr-4 py-3 bg-transparent border border-outline-variant rounded-lg",
                      "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                      "font-body-md text-body-md text-on-surface placeholder:text-outline/50"
                    )}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 bg-primary-container text-white font-label-lg text-label-lg rounded-lg",
                  "shadow-md shadow-primary-container/20",
                  "hover:bg-primary transition-all hover:scale-[1.01] active:scale-[0.98]",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tAuth("forgotPassword.sending")}
                  </>
                ) : (
                  tAuth("forgotPassword.sendOtp")
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackFromForgotPassword}
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tAuth("forgotPassword.backToLogin")}
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password - Reset Form */}
          {forgotPasswordState === "reset_password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-primary mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{resetEmail}</span>
              </div>

              <div className="flex items-center justify-between bg-surface-container rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Clock className="w-4 h-4" />
                  <span className="font-label-sm">{locale === "vi" ? "Mã OTP hết hạn sau" : "OTP expires in"}</span>
                </div>
                <span className={cn(
                  "font-label-md font-medium",
                  remainingSeconds <= 60 ? "text-error" : "text-primary"
                )}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>

              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="resetOtp">
                  {tAuth("resetPassword.otp")}
                </label>
                <input
                  id="resetOtp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={tAuth("resetPassword.otpPlaceholder")}
                  className={cn(
                    "w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg text-center text-xl tracking-[0.5em]",
                    "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                    "font-body-md text-body-md text-on-surface placeholder:text-outline/50 placeholder:tracking-normal"
                  )}
                  disabled={isLoading}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="newPassword">
                  {tAuth("resetPassword.newPassword")}
                </label>
                <div className="relative flex items-center">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tAuth("resetPassword.newPasswordPlaceholder")}
                    className={cn(
                      "w-full px-4 py-3 pr-12 bg-transparent border border-outline-variant rounded-lg",
                      "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                      "font-body-md text-body-md text-on-surface placeholder:text-outline/50"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="confirmPassword">
                  {tAuth("resetPassword.confirmPassword")}
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tAuth("resetPassword.confirmPasswordPlaceholder")}
                    className={cn(
                      "w-full px-4 py-3 pr-12 bg-transparent border border-outline-variant rounded-lg",
                      "focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all",
                      "font-body-md text-body-md text-on-surface placeholder:text-outline/50"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant">{tAuth("resetPassword.passwordRequirements")}</p>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 bg-primary-container text-white font-label-lg text-label-lg rounded-lg",
                  "shadow-md shadow-primary-container/20",
                  "hover:bg-primary transition-all hover:scale-[1.01] active:scale-[0.98]",
                  "flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tAuth("resetPassword.resetting")}
                  </>
                ) : (
                  tAuth("resetPassword.resetPassword")
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToForgotForm}
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tAuth("forgotPassword.backToLogin")}
                </button>
              </div>
            </form>
          )}

          {/* Footer - only show when not in forgot password flow */}
          {forgotPasswordState === "none" && (
            <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col items-center gap-4">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t("noAccount")}{" "}
                <a className="text-primary font-bold hover:underline" href="#">
                  {t("contactAdmin")}
                </a>
              </p>
              <div className="flex gap-6 text-outline text-label-sm font-label-sm">
                <a className="hover:text-on-surface transition-colors" href="#">
                  {t("privacyPolicy")}
                </a>
                <a className="hover:text-on-surface transition-colors" href="#">
                  {t("termsOfService")}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
