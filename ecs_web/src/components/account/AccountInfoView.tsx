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
  Check
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
  /**
   * Required role segment for the current route, e.g. "patient" | "doctor" | "clinic-admin" | "system-admin" | "receptionist".
   * Used to pick role-specific visuals. Authorization is enforced by the
   * parent layout / AccountHeader - this view does not redirect on its own
   * to avoid bouncing authenticated users back to /login on transient
   * /auth/me failures.
   */
  requiredSegment: string
  /**
   * When true (default), renders the standalone <AccountHeader /> at the top of the page.
   * Set to false when this view is embedded inside a layout that already provides
   * its own header (e.g. the patient layout with sidebar).
   */
  showAccountHeader?: boolean
}

/**
 * Reusable Account Info view.
 * Backed by GET /api/v1/auth/me. Displays AUTH-level data only (email, phone,
 * role, avatar, isActive, audit timestamps). Distinct from patient profile and
 * medical record pages.
 */
export default function AccountInfoView({
  requiredSegment: _requiredSegment,
  showAccountHeader = true,
}: AccountInfoViewProps) {
  const locale = useLocale()
  const router = useRouter()
  const { account, isLoading, error, refetch } = useAccountInfo({
    enabled: true,
  })

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null)
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null)
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null)

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

  const t = (vi: string, en: string) => (locale === "vi" ? vi : en)

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
      setAvatarErrorMsg(err?.response?.data?.message || t("Tải ảnh thất bại, vui lòng thử lại.", "Upload failed, please try again."))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    try {
      const d = new Date(iso)
      return d.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return iso
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

        <div className="mb-xl">
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

        {avatarSuccessMsg && (
          <div className="mb-lg p-md bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{avatarSuccessMsg}</span>
          </div>
        )}

        {avatarErrorMsg && (
          <div className="mb-lg p-md bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{avatarErrorMsg}</span>
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
                    {getRoleLabel(effectiveRole, locale)}
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

            <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl">
              <h3 className="text-headline-sm font-headline-sm text-on-surface mb-lg">
                {t("Chi tiết tài khoản", "Account Details")}
              </h3>

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
                  value={account.phone}
                />
                <InfoItem
                  icon={<Shield className="h-4 w-4" />}
                  label={t("Vai trò", "Role")}
                  value={getRoleLabel(effectiveRole, locale)}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label={t("Ngày tạo tài khoản", "Account Created")}
                  value={formatDate(account.createdAt)}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label={t("Cập nhật lần cuối", "Last Updated")}
                  value={formatDate(account.updatedAt)}
                />
              </div>
            </section>

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
