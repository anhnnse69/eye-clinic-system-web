"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
} from "lucide-react"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { authService } from "@/services/auth.service"
import { Role } from "@/types"
import { apiClient } from "@/lib/axios"
import {
  ROLE_CONFIG,
  getRoleLabel,
  normalizeRole,
} from "@/lib/role-config"

import { useTranslations, useLocale } from "next-intl"

interface AccountInfoContentProps {
  /**
   * Required role segment (e.g. "doctor", "clinic-admin", "system-admin", "receptionist").
   * Authorization is enforced by the role's server-side layout (cookie check).
   * This component only uses it for role-specific visuals.
   */
  requiredSegment: string
}

/**
 * Content-only Account Info view (Internationalized via next-intl).
 * Renders strictly inside the role's existing dashboard layout
 * (Sidebar + DashboardHeader already provided by the parent layout).
 *
 * Distinct from patient profile and any role-specific record pages.
 */
export default function AccountInfoContent({
  requiredSegment: _requiredSegment,
}: AccountInfoContentProps) {
  const router = useRouter()
  const t = useTranslations("doctor.accountInfo")
  const locale = useLocale()

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
        headers: { "Content-Type": "multipart/form-data" },
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
            window.dispatchEvent(
              new CustomEvent("ecs-user-avatar-updated", {
                detail: { avatarUrl: uploadedUrl },
              })
            )
          } catch (updateErr) {
            console.error("Failed to save avatar to profile:", updateErr)
          }
        }
        await refetch()
        setAvatarSuccessMsg(t("avatarSuccess"))
        setTimeout(() => setAvatarSuccessMsg(null), 5000)
      }
    } catch (err: any) {
      setAvatarErrorMsg(
        err?.response?.data?.message || t("avatarError")
      )
    } finally {
      setUploadingAvatar(false)
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    try {
      const d = new Date(iso)
      return d.toLocaleString(locale === "en" ? "en-US" : "vi-VN", {
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

  const effectiveRole = account?.role || authService.getUser()?.role || Role.PATIENT
  const roleKey = normalizeRole(effectiveRole)
  const config = ROLE_CONFIG[roleKey]
  const displayRoleLabel = getRoleLabel(effectiveRole, (locale as "vi" | "en") || "vi")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("goBack")}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              {t("errorLoading")}
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-red-600 hover:underline"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && account && (
        <>
          {avatarSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{avatarSuccessMsg}</span>
            </div>
          )}

          {avatarErrorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{avatarErrorMsg}</span>
            </div>
          )}

          {/* Avatar + name card */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                {tempAvatarUrl || account.avatarUrl ? (
                  <img
                    src={tempAvatarUrl || account.avatarUrl}
                    alt={account.fullName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-sm"
                  />
                ) : (
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${config.avatarBgClass} shadow-sm`}
                  >
                    {account.fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                <label
                  htmlFor="account-avatar-file-input"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all cursor-pointer hover:scale-110 active:scale-95 border-2 border-white"
                  title={t("updateAvatarTitle")}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input
                    id="account-avatar-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  {account.fullName}
                </h2>
                <p className="text-gray-500 mt-1">
                  {account.email || t("noEmail")}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4 justify-center sm:justify-start">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}
                  >
                    <Shield className="h-3 w-3" />
                    {displayRoleLabel}
                  </span>
                  {account.isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("statusActive")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                      <XCircle className="h-3 w-3" />
                      {t("statusDisabled")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Account details */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {t("accountDetailsTitle")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<UserIcon className="h-4 w-4" />}
                label={t("fullName")}
                value={account.fullName}
              />
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label={t("email")}
                value={account.email || "—"}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label={t("phone")}
                value={account.phone}
              />
              <InfoItem
                icon={<Shield className="h-4 w-4" />}
                label={t("role")}
                value={displayRoleLabel}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label={t("createdAt")}
                value={formatDate(account.createdAt)}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label={t("updatedAt")}
                value={formatDate(account.updatedAt)}
              />
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-600">
              {t("disclaimer")}
            </p>
          </section>
        </>
      )}
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
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div
        className="h-9 w-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
        style={{ color: "#00658D" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 mt-1 wrap-break-word">
          {value}
        </p>
      </div>
    </div>
  )
}
