"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { authService } from "@/services/auth.service";

const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCeUucgwDtb70ZPDmE3v2bDk0sQt523IIANyQgHLHTtPq42KR9R5ZvqYYRKIJL1M2hFj1sVYmsB6LEU2qCnTXlUfVK2OCa6aYP1lve83OKBKhZFoBoBi6g0l2uJ2nb8pChVnYqRA4yXEJV67ldP5Am_k6Gm-yoyKTc2qeT2K_4sp43WkBj8nbDuGZez8_429pg9hzpbcxT3CQyTZobmllIi61Zv7075i-mgT7xsReCIK4_GnauC_zxk_DS7l1f6W1iBuqaNyE7cAXLS";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9DFUQ7Thz2pCU2Up6sjdGMLTxC6xJrCremEzlT9Ur0Do7pN9CY3-cNn5jjKyhLJk-vkfmaIP8Yx2jn15oc5a2Tsy-wSv5B2ieFaVnXKJ_wKibyFfwCOVM4mP6L0kWWIgEzA5Ux4VdSzrDEY24iczqw4OLoLsPjfK84ZDKaFyiJfFx4XVtPGDwHxwGoD0ApP09EwgylQw2kLyuPumj_yrBrqUAOPY8Y01uXvDVcZ26vskJ1fmLp2nhR0l9M9aEJQi0VDXvgEvgKQM";

const CODE_MESSAGES: Record<string, { vi: string; en: string }> = {
  APP_MESSAGE_2000: { vi: "Đăng nhập thành công", en: "Login successful" },
  APP_MESSAGE_4016: { vi: "Email hoặc mật khẩu không đúng", en: "Invalid email or password" },
  APP_MESSAGE_4003: { vi: "Vui lòng nhập đầy đủ thông tin", en: "Please enter all required fields" },
  APP_MESSAGE_4000: { vi: "Lỗi validation", en: "Validation error" },
  APP_MESSAGE_4019: { vi: "Định dạng không hợp lệ", en: "Invalid format" },
  APP_MESSAGE_5000: { vi: "Lỗi hệ thống, vui lòng thử lại sau", en: "System error, please try again later" },
};

const getErrorMessage = (codeMessage: string, locale: string): string => {
  const message = CODE_MESSAGES[codeMessage]
  if (message) {
    return locale === "vi" ? message.vi : message.en
  }
  return locale === "vi" ? "Đã xảy ra lỗi không xác định" : "An unknown error occurred"
};

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const toggleLocale = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    router.push(`/${newLocale}/login`);
  };

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailAddress || !password) {
      setError(t("enterBothFields"));
      return;
    }

    setIsLoading(true);

    try {
      // Gọi trực tiếp backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1";
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, password }),
      });

      const data = await response.json();

      if (data.codeMessage === "APP_MESSAGE_2000" && data.data?.token) {
        const token = data.data.token;
        
        // Lưu token vào localStorage
        authService.setToken(token);
        
        // Set cookie từ server
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        
        // Decode token để lấy role
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
            PATIENT: "/patient/dashboard",
          };
          redirectPath = roleMapping[role] || redirectPath;
        }
        
        router.push(redirectPath);
      } else {
        setError(getErrorMessage(data.codeMessage, locale));
      }
    } catch (err) {
      setError(getErrorMessage("APP_MESSAGE_5000", locale));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side: Brand Identity - Hidden on Mobile */}
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
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-4 py-8 md:py-12 md:px-8">
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

        <Link href={`/${locale}/home`} className="md:hidden mb-6 flex flex-col items-center hover:opacity-80 transition-opacity">
          <img
            alt="Eye Clinic Support Logo"
            className="w-20 h-20 mb-2"
            src={BRAND_LOGO}
          />
          <span className="font-headline-sm text-headline-sm text-primary font-semibold">Eye Clinic Support</span>
        </Link>

        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-headline-lg md:font-headline-2xl text-on-surface mb-1">
              {t("welcomeBack")}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t("accessDashboard")}
            </p>
          </div>

          <div className="bg-surface-container p-1 rounded-lg flex mb-6">
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className={cn(
                "flex-1 py-2 font-label-md text-label-md rounded-md transition-all",
                loginMethod === "password"
                  ? "bg-white shadow-sm text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {t("passwordTab")}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("otp")}
              className={cn(
                "flex-1 py-2 font-label-md text-label-md rounded-md transition-all",
                loginMethod === "otp"
                  ? "bg-white shadow-sm text-primary font-medium"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {t("otpTab")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-error text-sm" role="alert">
                {error}
              </div>
            )}

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
                />
              </div>
            </div>

            {loginMethod === "password" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">
                    {t("password")}
                  </label>
                  <a className="font-label-md text-label-md text-primary hover:underline transition-all" href="#">
                    {t("forgotPassword")}
                  </a>
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
            )}

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
        </div>
      </section>
    </main>
  );
}
