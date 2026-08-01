"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, AlertCircle, Lock, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { authService } from "@/services/auth.service";

const CODE_MESSAGES: Record<string, { vi: string; en: string }> = {
  APP_MESSAGE_2008: { vi: "Đổi mật khẩu thành công!", en: "Password changed successfully!" },
  APP_MESSAGE_4003: { vi: "Vui lòng nhập đầy đủ thông tin", en: "Please fill in all required fields" },
  APP_MESSAGE_4019: { vi: "Mật khẩu mới không đáp ứng yêu cầu", en: "New password does not meet requirements" },
  APP_MESSAGE_4039: { vi: "Mật khẩu hiện tại không đúng", en: "Current password is incorrect" },
  APP_MESSAGE_4040: { vi: "Mật khẩu mới phải khác mật khẩu hiện tại", en: "New password must be different from current password" },
  APP_MESSAGE_5000: { vi: "Lỗi hệ thống, vui lòng thử lại sau", en: "System error, please try again later" },
};

const getErrorMessage = (codeMessage: string, locale: string): string => {
  const msg = CODE_MESSAGES[codeMessage];
  if (msg) return locale === "vi" ? msg.vi : msg.en;
  return locale === "vi" ? "Đã xảy ra lỗi không xác định" : "An unknown error occurred";
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const activeLocale = useLocale();

  const [currentLocale, setCurrentLocale] = useState<"vi" | "en">(() => {
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/^\/(vi|en)(\/|$)/)
      if (match) return match[1] as "vi" | "en"
      const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)
      if (cookieMatch && (cookieMatch[1] === "vi" || cookieMatch[1] === "en")) {
        return cookieMatch[1] as "vi" | "en"
      }
      const stored = localStorage.getItem("locale")
      if (stored === "vi" || stored === "en") return stored
    }
    return activeLocale === "en" ? "en" : "vi"
  })

  useEffect(() => {
    const handleLocaleChanged = (e: any) => {
      if (e?.detail?.locale === "vi" || e?.detail?.locale === "en") {
        setCurrentLocale(e.detail.locale)
      }
    }
    window.addEventListener("ecs-locale-changed", handleLocaleChanged)
    return () => window.removeEventListener("ecs-locale-changed", handleLocaleChanged)
  }, [])

  const locale = currentLocale

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/patient/account-info`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router, locale]);

  const validatePassword = (pwd: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8 && pwd.length <= 100;
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(getErrorMessage("APP_MESSAGE_4003", locale));
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(getErrorMessage("APP_MESSAGE_4019", locale));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(locale === "vi" ? "Mật khẩu xác nhận không khớp" : "Confirm password does not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError(getErrorMessage("APP_MESSAGE_4040", locale));
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      if (result.codeMessage === "APP_MESSAGE_2008") {
        setSuccess(true);
        setError("");
      } else {
        setError(getErrorMessage(result.codeMessage, locale));
      }
    } catch (err: unknown) {
      const codeMessage =
        err instanceof Error && "codeMessage" in err
          ? (err as { codeMessage: string }).codeMessage
          : "APP_MESSAGE_5000";
      setError(getErrorMessage(codeMessage, locale));
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { key: "length", vi: "Ít nhất 8 ký tự", en: "At least 8 characters" },
    { key: "upper", vi: "Chữ hoa (A-Z)", en: "Uppercase letter (A-Z)" },
    { key: "lower", vi: "Chữ thường (a-z)", en: "Lowercase letter (a-z)" },
    { key: "number", vi: "Số (0-9)", en: "Number (0-9)" },
    { key: "special", vi: "Ký tự đặc biệt (!@#$...)", en: "Special character (!@#$...)" },
  ];

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Đổi mật khẩu</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-headline-md font-headline-md text-gray-900 mb-2">
              {getErrorMessage("APP_MESSAGE_2008", locale)}
            </h2>
            <p className="text-gray-500 text-sm">
              {locale === "vi" ? "Đang chuyển hướng..." : "Redirecting..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Đổi mật khẩu</h1>
          <p className="text-body-sm text-body-sm text-on-surface-variant mt-1">
            {locale === "vi" ? "Cập nhật mật khẩu đăng nhập của bạn" : "Update your login password"}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold">
              {locale === "vi" ? "Đổi mật khẩu thất bại" : "Password change failed"}
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {locale === "vi" ? "Thông tin mật khẩu" : "Password Information"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === "vi" ? "Nhập mật khẩu hiện tại và mật khẩu mới của bạn" : "Enter your current and new password"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Current Password */}
            <div>
              <label
                className="block font-label-lg text-label-lg text-gray-700 mb-2"
                htmlFor="currentPassword"
              >
                {locale === "vi" ? "Mật khẩu hiện tại" : "Current Password"} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={locale === "vi" ? "Nhập mật khẩu hiện tại" : "Enter current password"}
                  className="w-full px-4 py-3 bg-transparent border border-outline-variant rounded-lg outline-none transition-all font-body-md text-body-md text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary-container focus:border-primary"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                className="block font-label-lg text-label-lg text-gray-700 mb-2"
                htmlFor="newPassword"
              >
                {locale === "vi" ? "Mật khẩu mới" : "New Password"} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={locale === "vi" ? "Nhập mật khẩu mới" : "Enter new password"}
                  className="w-full px-4 py-3 pr-12 bg-transparent border border-outline-variant rounded-lg outline-none transition-all font-body-md text-body-md text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary-container focus:border-primary"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements */}
              {newPassword && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {passwordRequirements.map((req) => {
                    const met =
                      (req.key === "length" && newPassword.length >= 8) ||
                      (req.key === "upper" && /[A-Z]/.test(newPassword)) ||
                      (req.key === "lower" && /[a-z]/.test(newPassword)) ||
                      (req.key === "number" && /[0-9]/.test(newPassword)) ||
                      (req.key === "special" && /[^a-zA-Z0-9]/.test(newPassword));
                    return (
                      <div
                        key={req.key}
                        className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-gray-400"}`}
                      >
                        {met ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{locale === "vi" ? req.vi : req.en}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block font-label-lg text-label-lg text-gray-700 mb-2"
                htmlFor="confirmPassword"
              >
                {locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={locale === "vi" ? "Nhập lại mật khẩu mới" : "Re-enter new password"}
                  className={`w-full px-4 py-3 pr-12 bg-transparent border rounded-lg outline-none transition-all font-body-md text-body-md text-on-surface placeholder:text-outline/50 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
                      : "border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary"
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {locale === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/patient/account-info`)}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {locale === "vi" ? "Hủy" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: "#00658D" }}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === "vi" ? "Đang cập nhật..." : "Updating..."}
              </>
            ) : (
              locale === "vi" ? "Cập nhật mật khẩu" : "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
