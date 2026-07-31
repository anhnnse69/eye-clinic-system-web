"use client"

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
} from "lucide-react"
import { useAccountInfo } from "@/hooks/useAccountInfo"
import { authService } from "@/services/auth.service"
import { Role } from "@/types"
import {
  ROLE_CONFIG,
  getRoleLabel,
  normalizeRole,
} from "@/lib/role-config"

interface AccountInfoContentProps {
  /**
   * Required role segment (e.g. "doctor", "clinic-admin", "system-admin", "receptionist").
   * Authorization is enforced by the role's server-side layout (cookie check).
   * This component only uses it for role-specific visuals.
   */
  requiredSegment: string
}

/**
 * Content-only Account Info view (Vietnamese, no i18n).
 * Renders strictly inside the role's existing dashboard layout
 * (Sidebar + DashboardHeader already provided by the parent layout).
 *
 * Distinct from patient profile and any role-specific record pages.
 */
export default function AccountInfoContent({
  requiredSegment: _requiredSegment,
}: AccountInfoContentProps) {
  const router = useRouter()
  const { account, isLoading, error, refetch } = useAccountInfo({
    enabled: true,
  })

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    try {
      const d = new Date(iso)
      return d.toLocaleString("vi-VN", {
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
  const displayRoleLabel = getRoleLabel(effectiveRole, "vi")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Thông tin tài khoản
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Thông tin đăng nhập và cấu hình tài khoản của bạn. Khác với hồ sơ cá nhân và hồ sơ bệnh án (nếu có).
          </p>
        </div>
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
              Không thể tải thông tin tài khoản
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm font-medium text-red-600 hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && account && (
        <>
          {/* Avatar + name card */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {account.avatarUrl ? (
                <img
                  src={account.avatarUrl}
                  alt={account.fullName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div
                  className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${config.avatarBgClass}`}
                >
                  {account.fullName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  {account.fullName}
                </h2>
                <p className="text-gray-500 mt-1">
                  {account.email || "Chưa cập nhật email"}
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
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                      <XCircle className="h-3 w-3" />
                      Vô hiệu hóa
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Account details */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              Chi tiết tài khoản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<UserIcon className="h-4 w-4" />}
                label="Họ và tên"
                value={account.fullName}
              />
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={account.email || "—"}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Số điện thoại"
                value={account.phone}
              />
              <InfoItem
                icon={<Shield className="h-4 w-4" />}
                label="Vai trò"
                value={displayRoleLabel}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Ngày tạo tài khoản"
                value={formatDate(account.createdAt)}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Cập nhật lần cuối"
                value={formatDate(account.updatedAt)}
              />
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-600">
              Đây là thông tin tài khoản đăng nhập của bạn. Hồ sơ cá nhân (ngày sinh, giới tính, …)
              và các dữ liệu liên quan được quản lý ở các trang riêng trong dashboard.
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
      <div className="h-9 w-9 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
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
