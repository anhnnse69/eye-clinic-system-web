"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Camera,
  Upload,
  Check,
  Edit3,
  X,
  Save
} from "lucide-react"
import AccountHeader from "@/components/layout/AccountHeader"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { authService } from "@/services/auth.service"
import { apiClient } from "@/lib/axios"
import {
  ROLE_CONFIG,
  getRoleLabel,
  normalizeRole,
} from "@/lib/role-config"

interface AccountInfoViewProps {
  requiredSegment: string
  showAccountHeader?: boolean
}

export default function AccountInfoView({
  requiredSegment: _requiredSegment,
  showAccountHeader = true,
}: AccountInfoViewProps) {
  const initialLocale = useLocale()
  const router = useRouter()
  const { account, isLoading, error, refetch } = useAccountInfo({
    enabled: true,
  })

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
    return initialLocale === "en" ? "en" : "vi"
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

  const t = (vi: string, en: string) => (currentLocale === "en" ? en : vi)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null)
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null)
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null)

  // Edit account state
  const [isEditing, setIsEditing] = useState(false)
  const [editFullName, setEditFullName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [savingAccount, setSavingAccount] = useState(false)
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null)
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (account) {
      setEditFullName(account.fullName || "")
      setEditPhone(account.phone || "")
      setEditEmail(account.email || "")
    }
  }, [account])

  useEffect(() => {
    const handleAvatarUpdated = (e: Event) => {
      const customEvt = e as CustomEvent
      if (customEvt.detail?.avatarUrl) {
        setTempAvatarUrl(customEvt.detail.avatarUrl)
        refetch()
      }
    }
    window.addEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
    return () => window.removeEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
  }, [refetch])

  const getFriendlyErrorMessage = (err: any): string => {
    const codeMsg =
      err?.codeMessage ||
      err?.response?.data?.codeMessage ||
      (typeof err?.message === "string" && err.message.startsWith("APP_MESSAGE_") ? err.message : "") ||
      ""

    switch (codeMsg) {
      case "APP_MESSAGE_4001":
        return t(
          "Số điện thoại không hợp lệ (số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0).",
          "Invalid phone number format (must contain exactly 10 digits starting with 0)."
        )
      case "APP_MESSAGE_4018":
        return t(
          "Số điện thoại này đã được sử dụng bởi một tài khoản khác trong hệ thống.",
          "This phone number is already registered to another account."
        )
      case "APP_MESSAGE_4017":
        return t(
          "Địa chỉ email này đã được đăng ký bởi một tài khoản khác trong hệ thống.",
          "This email address is already registered to another account."
        )
      case "APP_MESSAGE_4003":
        return t(
          "Vui lòng điền đầy đủ các thông tin bắt buộc.",
          "Please fill in all required fields."
        )
      case "APP_MESSAGE_4019":
        return t(
          "Dữ liệu nhập vào không hợp lệ hoặc không đáp ứng định dạng.",
          "The entered data is invalid or format requirements are not met."
        )
      case "APP_MESSAGE_4000":
        return t(
          "Yêu cầu không hợp lệ, vui lòng kiểm tra lại thông tin.",
          "Invalid request, please check your information and try again."
        )
      case "APP_MESSAGE_5000":
        return t(
          "Lỗi hệ thống server, vui lòng thử lại sau.",
          "System error, please try again later."
        )
    }

    if (err?.response?.data?.message && typeof err.response.data.message === "string") {
      return err.response.data.message
    }

    if (err?.message && typeof err.message === "string" && !err.message.includes("AxiosError") && !err.message.includes("Request failed")) {
      return err.message
    }

    if (codeMsg) {
      return t(
        `Lỗi hệ thống (${codeMsg}), vui lòng kiểm tra lại.`,
        `System error (${codeMsg}), please check and try again.`
      )
    }

    return t(
      "Cập nhật thất bại, vui lòng thử lại.",
      "Update failed, please try again."
    )
  }

  const handleStartEdit = () => {
    if (account) {
      setEditFullName(account.fullName || "")
      setEditPhone(account.phone || "")
      setEditEmail(account.email || "")
      setEditErrorMsg(null)
      setIsEditing(true)
    }
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account?.id) return

    try {
      setSavingAccount(true)
      setEditErrorMsg(null)

      await authService.updatePersonalProfile(account.id, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        avatarUrl: tempAvatarUrl || account.avatarUrl || "",
      })

      await refetch()
      window.dispatchEvent(new CustomEvent("ecs-user-avatar-updated", { detail: { avatarUrl: tempAvatarUrl || account.avatarUrl } }))

      setIsEditing(false)
      setEditSuccessMsg(t("Cập nhật thông tin tài khoản thành công!", "Account information updated successfully!"))
      setTimeout(() => setEditSuccessMsg(null), 5000)
    } catch (err: any) {
      setEditErrorMsg(getFriendlyErrorMessage(err))
    } finally {
      setSavingAccount(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingAvatar(true)
      setAvatarSuccessMsg(null)
      setAvatarErrorMsg(null)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")

      const res = await apiClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      const uploadedUrl = res.data?.data?.url || res.data?.url
      if (uploadedUrl) {
        setTempAvatarUrl(uploadedUrl)
        if (account?.id) {
          try {
            await apiClient.put(`/auth/profile/${account.id}`, {
              fullName: account.fullName,
              phone: account.phone || "0900000000",
              email: account.email,
              avatarUrl: uploadedUrl,
            })
            window.dispatchEvent(new CustomEvent("ecs-user-avatar-updated", { detail: { avatarUrl: uploadedUrl } }))
          } catch (updateErr) {
            console.error("Failed to save avatar to profile:", updateErr)
          }
        }
        await refetch()
        setAvatarSuccessMsg(t("Cập nhật ảnh đại diện thành công!", "Avatar updated successfully!"))
        setTimeout(() => setAvatarSuccessMsg(null), 5000)
      }
    } catch (err: any) {
      setAvatarErrorMsg(getFriendlyErrorMessage(err))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const effectiveRole = account?.role || authService.getUser()?.role || "PATIENT"
  const roleKey = normalizeRole(effectiveRole)
  const config = ROLE_CONFIG[roleKey]

  return (
    <div className="min-h-screen bg-background">
      {showAccountHeader && <AccountHeader />}

      <main className="max-w-4xl mx-auto px-gutter py-2xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Quay lại", "Back")}
        </button>

        <div className="mb-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              {t("Thông tin tài khoản", "Account Information")}
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-2">
              {t(
                "Thông tin đăng nhập và cấu hình tài khoản của bạn. Khác với hồ sơ cá nhân và hồ sơ bệnh án (nếu có).",
                "Your login and account configuration. This is different from your personal profile and medical records (if any)."
              )}
            </p>
          </div>

          {!isLoading && !error && account && (
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false)
                } else {
                  handleStartEdit()
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  {t("Hủy chỉnh sửa", "Cancel Edit")}
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  {t("Chỉnh sửa tài khoản", "Edit Account")}
                </>
              )}
            </button>
          )}
        </div>

        {(avatarSuccessMsg || editSuccessMsg) && (
          <div className="mb-lg p-md bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{avatarSuccessMsg || editSuccessMsg}</span>
          </div>
        )}

        {(avatarErrorMsg || editErrorMsg) && (
          <div className="mb-lg p-md bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{avatarErrorMsg || editErrorMsg}</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-error bg-error-container p-lg flex items-start gap-md">
            <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-on-error-container">
                {t("Không thể tải thông tin tài khoản", "Failed to load account info")}
              </p>
              <p className="text-xs text-on-error-container/80 mt-1">{error}</p>
              <button
                onClick={refetch}
                className="mt-md text-sm font-medium text-error hover:underline"
              >
                {t("Thử lại", "Retry")}
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && account && (
          <div className="space-y-lg">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl flex flex-col sm:flex-row items-center gap-xl">
              <div className="relative group shrink-0">
                {tempAvatarUrl || account.avatarUrl ? (
                  <img
                    src={tempAvatarUrl || account.avatarUrl}
                    alt={account.fullName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-md"
                  />
                ) : (
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${config.avatarBgClass} shadow-md`}
                  >
                    {account.fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                <label
                  htmlFor="avatar-file-input"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all cursor-pointer hover:scale-110 active:scale-95 border-2 border-white"
                  title={t("Cập nhật ảnh đại diện", "Update avatar")}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-headline-md font-headline-md text-on-surface">
                  {account.fullName}
                </h2>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                  {account.email || t("Chưa cập nhật email", "No email set")}
                </p>

                <div className="flex flex-wrap items-center gap-sm mt-md justify-center sm:justify-start">
                  <span
                    className={`inline-flex items-center gap-1 px-sm py-xs rounded-full text-label-md font-label-md ${config.badgeClass}`}
                  >
                    <Shield className="h-3 w-3" />
                    {getRoleLabel(effectiveRole, currentLocale)}
                  </span>
                  {account.isActive ? (
                    <span className="inline-flex items-center gap-1 px-sm py-xs bg-tertiary-container text-on-tertiary-container rounded-full text-label-md font-label-md">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("Đang hoạt động", "Active")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-sm py-xs bg-error-container text-on-error-container rounded-full text-label-md font-label-md">
                      <XCircle className="h-3 w-3" />
                      {t("Vô hiệu hóa", "Inactive")}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {isEditing ? (
              <form onSubmit={handleSaveAccount} className="bg-surface-container-lowest border border-primary/30 rounded-2xl p-xl shadow-md space-y-lg animate-in fade-in">
                <div className="flex items-center justify-between border-b border-outline-variant pb-md">
                  <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    {t("Chỉnh sửa thông tin tài khoản", "Edit Account Information")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t("Họ và tên", "Full Name")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder={t("Nhập họ và tên...", "Enter full name...")}
                        className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t("Số điện thoại", "Phone Number")}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder={t("Nhập số điện thoại...", "Enter phone number...")}
                        className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder={t("Nhập địa chỉ email...", "Enter email address...")}
                        className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-md border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    {t("Hủy", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={savingAccount}
                    className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {savingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("Đang lưu...", "Saving...")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t("Lưu thay đổi", "Save Changes")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl">
                <div className="flex items-center justify-between mb-lg">
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">
                    {t("Chi tiết tài khoản", "Account Details")}
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {t("Chỉnh sửa", "Edit")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <InfoItem
                    icon={<UserIcon className="h-4 w-4" />}
                    label={t("Họ và tên", "Full Name")}
                    value={account.fullName}
                  />
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={account.email || "—"}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label={t("Số điện thoại", "Phone Number")}
                    value={account.phone || "—"}
                  />
                  <InfoItem
                    icon={<Shield className="h-4 w-4" />}
                    label={t("Vai trò", "Role")}
                    value={getRoleLabel(effectiveRole, currentLocale)}
                  />
                </div>
              </section>
            )}

            <section className="bg-surface-container border border-outline-variant rounded-2xl p-lg">
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                {t(
                  "Đây là thông tin tài khoản đăng nhập của bạn. Hồ sơ cá nhân (ngày sinh, giới tính, …) và các dữ liệu liên quan được quản lý ở các trang riêng trong dashboard.",
                  "This is your login account information. Your personal profile and role-specific data are managed in dedicated pages within the dashboard."
                )}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-md p-md rounded-lg bg-surface-container">
      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <p className="text-body-md font-body-md text-on-surface mt-1 wrap-break-word">
          {value}
        </p>
      </div>
    </div>
  )
}
