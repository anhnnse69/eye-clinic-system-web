"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { isValidEmail, isValidPhone } from "@/lib/utils";

const BRAND_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuCeUucgwDtb70ZPDmE3v2bDk0sQt523IIANyQgHLHTtPq42KR9R5ZvqYYRKIJL1M2hFj1sVYmsB6LEU2qCnTXlUfVK2OCa6aYP1lve83OKBKhZFoBoBi6g0l2uJ2nb8pChVnYqRA4yXEJV67ldP5Am_k6Gm-yoyKTc2qeT2K_4sp43WkBj8nbDuGZez8_429pg9hzpbcxT3CQyTZobmllIi61Zv7075i-mgT7xsReCIK4_GnauC_zxk_DS7l1f6W1iBuqaNyE7cAXLS";
const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9DFUQ7Thz2pCU2Up6sjdGMLTxC6xJrCremEzlT9Ur0Do7pN9CY3-cNn5jjKyhLJk-vkfmaIP8Yx2jn15oc5a2Tsy-wSv5B2ieFaVnXKJ_wKibyFfwCOVM4mP6L0kWWIgEzA5Ux4VdSzrDEY24iczqw4OLoLsPjfK84ZDKaFyiJfFx4XVtPGDwHxwGoD0ApP09EwgylQw2kLyuPumj_yrBrqUAOPY8Y01uXvDVcZ26vskJ1fmLp2nhR0l9M9aEJQi0VDXvgEvgKQM";

// Map codeMessage → field + message
const FIELD_ERROR_MAP: Record<string, { field: string; vi: string; en: string }> = {
  APP_MESSAGE_4017: { field: "email",           vi: "Email đã tồn tại",                  en: "Email already exists" },
  APP_MESSAGE_4018: { field: "phone",           vi: "Số điện thoại đã được sử dụng",     en: "Phone number already in use" },
  APP_MESSAGE_4042: { field: "confirmPassword", vi: "Mật khẩu không khớp",               en: "Passwords do not match" },
  APP_MESSAGE_4026: { field: "password", vi: "Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",               en: "Password must be at least 8 characters and include uppercase, lowercase, number and special character" },
};

const GENERAL_ERROR_MAP: Record<string, { vi: string; en: string }> = {
  APP_MESSAGE_4003: { vi: "Vui lòng nhập đầy đủ thông tin",       en: "Please fill in all required fields" },
  APP_MESSAGE_5000: { vi: "Lỗi hệ thống, vui lòng thử lại sau",   en: "System error, please try again later" },
};

type FieldErrors = Partial<Record<"fullName" | "email" | "phone" | "password" | "confirmPassword", string>>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const activeLocale = useLocale();
  const locale = activeLocale || (params?.locale as string) || "vi";

  const toggleLocale = () => {
    const newLocale = locale === "vi" ? "en" : "vi";
    localStorage.setItem("locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(`/${newLocale}/register`);
  };

  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [phone, setPhone]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [generalError, setGeneralError]       = useState("");
  const [successMsg, setSuccessMsg]           = useState("");
  const [fieldErrors, setFieldErrors]         = useState<FieldErrors>({});

  // Clear field error khi user bắt đầu sửa
  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): FieldErrors | null => {
    const errors: FieldErrors = {};
    if (!fullName.trim())       errors.fullName        = locale === "vi" ? "Vui lòng nhập họ và tên"          : "Please enter your full name";
    if (!email.trim())          errors.email           = locale === "vi" ? "Vui lòng nhập email"               : "Please enter your email";
    else if (!isValidEmail(email)) errors.email        = locale === "vi" ? "Email không hợp lệ"                : "Invalid email address";
    if (!phone.trim())          errors.phone           = locale === "vi" ? "Vui lòng nhập số điện thoại"       : "Please enter your phone number";
    else if (!isValidPhone(phone)) errors.phone        = locale === "vi" ? "Số điện thoại không hợp lệ"        : "Invalid phone number";
    if (!password)              errors.password        = locale === "vi" ? "Vui lòng nhập mật khẩu"            : "Please enter your password";
    else if (password.length < 6) errors.password      = locale === "vi" ? "Mật khẩu phải ít nhất 6 ký tự"    : "Password must be at least 6 characters";
    if (!confirmPassword)       errors.confirmPassword = locale === "vi" ? "Vui lòng xác nhận mật khẩu"        : "Please confirm your password";
    else if (password !== confirmPassword) errors.confirmPassword = locale === "vi" ? "Mật khẩu không khớp"   : "Passwords do not match";
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMsg("");

    const validationErrors = validate();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.codeMessage === "APP_MESSAGE_2000") {
        setSuccessMsg(locale === "vi" ? "Đăng ký thành công! Đang chuyển hướng..." : "Registration successful! Redirecting...");
        setTimeout(() => router.push(`/${locale}/login?success=1`), 1500);
        return;
      }

      // Map lỗi từ backend vào đúng field
      const code: string = data.codeMessage || "";
      const fieldMapping = FIELD_ERROR_MAP[code];

      if (fieldMapping) {
        setFieldErrors({
          [fieldMapping.field]: locale === "vi" ? fieldMapping.vi : fieldMapping.en,
        });
      } else {
        const general = GENERAL_ERROR_MAP[code];
        setGeneralError(
          general
            ? locale === "vi" ? general.vi : general.en
            : data.message || (locale === "vi" ? "Đã xảy ra lỗi không xác định" : "An unknown error occurred")
        );
      }
    } catch {
      setGeneralError(locale === "vi" ? "Lỗi hệ thống, vui lòng thử lại sau" : "System error, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: class input khi có lỗi
  const inputCls = (field: keyof FieldErrors) =>
    cn(
      "w-full py-3 bg-transparent border rounded-lg outline-none transition-all",
      "font-body-md text-body-md text-on-surface placeholder:text-outline/50",
      fieldErrors[field]
        ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
        : "border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary"
    );

  // Helper: hiện lỗi dưới field
  const FieldMsg = ({ field }: { field: keyof FieldErrors }) =>
    fieldErrors[field] ? (
      <p className="mt-1.5 text-xs text-error flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side */}
      <section className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Modern eye clinic interior" className="w-full h-full object-cover" src={HERO_IMG} />
          <div className="absolute inset-0 medical-overlay mix-blend-multiply" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center max-w-4xl px-4">
          <Link href={`/${locale}/home`} className="mb-6 w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center shadow-lg hover:bg-white/15 transition-all">
            <img alt="Eye Clinic Support Logo" className="w-full h-auto pointer-events-none" src={BRAND_LOGO} />
          </Link>
          <h1 className="text-2xl text-white mb-3 tracking-tight leading-tight">Eye Clinic Support System</h1>
          <p className="text-xl text-white/90 font-light tracking-wide">Your Vision, Our Priority</p>
        </div>
        <div className="absolute bottom-6 left-6 text-white/40 text-label-xs font-label-xs uppercase tracking-widest">
          Clinical Precision • Modern Care
        </div>
      </section>

      {/* Right Side: Register Form */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-4 py-8 md:py-12 md:px-8 overflow-y-auto">
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          <button
            onClick={toggleLocale}
            className="px-3 py-1.5 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === "vi" ? "EN" : "VI"}</span>
          </button>
        </div>

        <Link href={`/${locale}/home`} className="md:hidden mb-6 flex flex-col items-center hover:opacity-80 transition-opacity">
          <img alt="Eye Clinic Support Logo" className="w-20 h-20 mb-2" src={BRAND_LOGO} />
          <span className="font-headline-sm text-headline-sm text-primary font-semibold">Eye Clinic Support</span>
        </Link>

        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-headline-lg md:font-headline-2xl text-on-surface mb-1">
              {locale === "vi" ? "Tạo tài khoản mới" : "Create new account"}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {locale === "vi" ? "Đăng ký để truy cập hệ thống" : "Register to access the system"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Success */}
            {successMsg && (
              <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm flex items-center gap-2" role="status">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
                </svg>
                {successMsg}
              </div>
            )}

            {/* General Error */}
            {generalError && (
              <div className="p-3 rounded-lg bg-error-container text-error text-sm" role="alert">
                {generalError}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="fullName">
                {locale === "vi" ? "Họ và tên" : "Full Name"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-outline">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="fullName" type="text" value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
                  placeholder={locale === "vi" ? "Nhập họ và tên" : "Enter full name"}
                  className={cn(inputCls("fullName"), "pl-14 pr-4")}
                  disabled={isLoading}
                />
              </div>
              <FieldMsg field="fullName" />
            </div>

            {/* Email */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="email">
                {locale === "vi" ? "Email" : "Email"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-outline">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  placeholder={locale === "vi" ? "Nhập email" : "Enter email"}
                  className={cn(inputCls("email"), "pl-14 pr-4")}
                  disabled={isLoading}
                />
              </div>
              <FieldMsg field="email" />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="phone">
                {locale === "vi" ? "Số điện thoại" : "Phone Number"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-outline">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input
                  id="phone" type="tel" value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                  placeholder={locale === "vi" ? "Nhập số điện thoại" : "Enter phone number"}
                  className={cn(inputCls("phone"), "pl-14 pr-4")}
                  disabled={isLoading}
                />
              </div>
              <FieldMsg field="phone" />
            </div>

            {/* Password */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="password">
                {locale === "vi" ? "Mật khẩu" : "Password"}
              </label>
              <div className="relative flex items-center">
                <input
                  id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  placeholder={locale === "vi" ? "Nhập mật khẩu" : "Enter password"}
                  className={cn(inputCls("password"), "px-4 pr-12")}
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldMsg field="password" />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2" htmlFor="confirmPassword">
                {locale === "vi" ? "Xác nhận mật khẩu" : "Confirm Password"}
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword" type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                  placeholder={locale === "vi" ? "Xác nhận mật khẩu" : "Confirm password"}
                  className={cn(inputCls("confirmPassword"), "px-4 pr-12")}
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldMsg field="confirmPassword" />
            </div>

            <button
              type="submit" disabled={isLoading}
              className={cn(
                "w-full h-12 bg-primary-container text-white font-label-lg text-label-lg rounded-lg",
                "shadow-md shadow-primary-container/20 hover:bg-primary transition-all hover:scale-[1.01] active:scale-[0.98]",
                "flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{locale === "vi" ? "Đang tạo tài khoản..." : "Creating account..."}</>
              ) : (
                locale === "vi" ? "Tạo tài khoản" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col items-center gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {locale === "vi" ? "Đã có tài khoản? " : "Already have an account? "}
              <Link href={`/${locale}/login`} className="text-primary font-bold hover:underline">
                {locale === "vi" ? "Đăng nhập" : "Sign in"}
              </Link>
            </p>
            <div className="flex gap-6 text-outline text-label-sm font-label-sm">
              <a className="hover:text-on-surface transition-colors" href="#">{locale === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}</a>
              <a className="hover:text-on-surface transition-colors" href="#">{locale === "vi" ? "Điều khoản dịch vụ" : "Terms of Service"}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}