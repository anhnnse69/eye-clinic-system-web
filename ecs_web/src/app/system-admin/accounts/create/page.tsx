"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info
} from "lucide-react"
import { accountService } from "@/services/account.service"
import type { CreateAccountRequest } from "@/services/account.service"

export default function CreateAccountPage() {
  const router = useRouter()
  const t = useTranslations("systemAdmin.accounts")

  // Khởi tạo trạng thái form dữ liệu - Mặc định vai trò là CLINIC_ADMIN (value = 2 trong UserRole enum)
  const [formData, setFormData] = useState<CreateAccountRequest>({
    phone: "",
    email: "",
    password: "",
    fullName: "",
    role: 2, // 2 = CLINIC_ADMIN
    avatarUrl: ""
  })

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const parsedValue = name === "role" ? Number(value) : value
    setFormData(prev => ({ ...prev, [name]: parsedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      setError(t("fullNameRequired"))
      return
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone.trim())) {
      setError(t("invalidPhone"))
      return
    }

    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError(t("invalidEmail"))
        return
      }
    }

    if (!formData.password || formData.password.length < 8) {
      setError(t("passwordMinLength"))
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await accountService.createAccount({
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined
      })

      if (response.data) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/system-admin/accounts")
        }, 2000)
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;

      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": t("sessionExpired"),
        "APP_MESSAGE_4017": t("emailExists"),
        "APP_MESSAGE_4018": t("phoneExists")
      };

      const fallbackMessage = t("connectionError");
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto text-left w-full">
      {/* Thanh Header Điều Hướng */}
      <div className="flex items-center gap-4">
        <Link
          href="/system-admin/accounts"
          className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
          title={t("backToList")}
        >
          <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
        </Link>
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary shrink-0" />
            {t("createClinicAdminTitle")}
          </h2>
          <p className="text-body-md text-on-surface-variant">{t("createClinicAdminSubtitle")}</p>
        </div>
      </div>

      {/* Banner lưu ý về phân quyền tài khoản */}
      <div className="p-4 bg-primary/5 text-on-surface border border-primary/20 rounded-xl flex items-start gap-3 text-body-md">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-primary">{t("createAccountNoticeTitle")}</p>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            {t("createAccountNoticeBody")}
          </p>
        </div>
      </div>

      {/* Hiển thị lỗi hệ thống hoặc nghiệp vụ */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị thông báo thành công */}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-3 text-body-md font-medium border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{t("createSuccessMessage")}</span>
        </div>
      )}

      {/* Khung chứa Form Giao Diện */}
      <form onSubmit={handleSubmit} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4 shadow-sm">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface">{t("fullNameLabel")} <span className="text-error">*</span></label>
          <input
            type="text"
            name="fullName"
            required
            disabled={submitting || success}
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t("fullNamePlaceholder")}
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface">{t("phoneLabel")} <span className="text-error">*</span></label>
            <input
              type="tel"
              name="phone"
              required
              disabled={submitting || success}
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("phonePlaceholder")}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface">{t("emailLabel")}</label>
            <input
              type="email"
              name="email"
              disabled={submitting || success}
              value={formData.email || ""}
              onChange={handleChange}
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface">{t("passwordLabel")} <span className="text-error">*</span></label>
            <input
              type="password"
              name="password"
              required
              disabled={submitting || success}
              value={formData.password || ""}
              onChange={handleChange}
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Vai trò */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface">{t("roleLabel")} <span className="text-error">*</span></label>
            <select
              name="role"
              disabled={submitting || success}
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
            >
              <option value={2}>{t("clinicAdminRoleOption")}</option>
            </select>
          </div>
        </div>

        {/* Đường dẫn ảnh đại diện */}
        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface">{t("avatarLabel")}</label>
          <input
            type="text"
            name="avatarUrl"
            disabled={submitting || success}
            value={formData.avatarUrl || ""}
            onChange={handleChange}
            placeholder={t("avatarPlaceholder")}
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Khối nút bấm */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <Link
            href="/system-admin/accounts"
            className="px-5 py-2.5 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-all"
          >
            {t("cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting || success}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-95 transition-all text-label-md font-medium shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              t("createAndAssign")
            )}
          </button>
        </div>
      </form>
    </div>
  )
}