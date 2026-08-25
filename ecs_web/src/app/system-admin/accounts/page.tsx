"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShieldCheck,
  Info,
  Eye,
  Loader2
} from "lucide-react"
import { useTranslations } from "next-intl"
import { accountService } from "@/services/account.service"
import type { GetAccountResponse } from "@/services/account.service"

export default function SystemAccountsManagementPage() {
  const t = useTranslations("systemAdmin.accounts")

  const router = useRouter()

  const roleMapping: Record<string, string> = {
    SYSTEM_ADMIN: t("systemAdmin"),
    CLINIC_ADMIN: t("clinicAdminRoleOption"),
    DOCTOR: t("doctor"),
    RECEPTIONIST: t("receptionist"),
    PATIENT: t("patient")
  }
  const [accountsList, setAccountsList] = useState<GetAccountResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Theo dõi ID tài khoản nào đang được gạt để xử lý bất đồng bộ riêng biệt trên dòng đó
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Quản lý Metadata phân trang
  const [meta, setMeta] = useState<{
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Cơ chế Debounce xử lý tìm kiếm không bị gọi API liên tục
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm gọi API lấy dữ liệu accounts
  const loadAccountsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const roleParam = roleFilter === "all" ? undefined : roleFilter

      const statusParam =
        statusFilter === "active" ? true :
          statusFilter === "locked" ? false : undefined

      const response = await accountService.getAccounts({
        pageNumber,
        pageSize,
        role: roleParam,
        isActive: statusParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response.data) {
        setAccountsList(response.data.filter(acc => acc.role !== "SYSTEM_ADMIN"))
      }

      if (response.meta) {
        setMeta({
          page: response.meta.page,
          size: response.meta.size,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrevious: response.meta.hasPrevious,
        })
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;

      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": t("sessionExpired"),
        "APP_MESSAGE_4014": t("invalidAdmin"),
        "APP_MESSAGE_4015": t("noPermission"),
        "APP_MESSAGE_4020": t("clinicNotFound")
      };

      const fallbackMessage = t("connectionError");
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, roleFilter, statusFilter, debouncedSearch, t])

  // Tự động tải lại dữ liệu khi các tham số thay đổi
  useEffect(() => {
    loadAccountsData()
  }, [loadAccountsData])

  // Hàm xử lý gạt nút chuyển đổi trạng thái Khóa / Mở khóa
  const handleToggleActive = async (accountId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(accountId)

      await accountService.deleteAccount({
        userId: accountId,
        isActive: !currentStatus
      })

      setAccountsList(prev =>
        prev.map(item =>
          item.id === accountId ? { ...item, isActive: !currentStatus } : item
        )
      )
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;

      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4015": t("permissionDenied"),
        "APP_MESSAGE_4020": t("accountNotFound")
      };

      alert(errorMessages[errCode] || t("updateFailed"));
    } finally {
      setUpdatingId(null)
    }
  }

  const handleEditRedirect = (account: GetAccountResponse) => {
    sessionStorage.setItem("editingAccount", JSON.stringify(account))
    router.push(`/system-admin/accounts/edit/${account.id}`)
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4 text-left bg-background min-h-screen">
      {/* Header đồng bộ chuẩn với Clinics và Applications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">{t("listTitle")}</h2>
          <nav className="flex text-sm text-on-surface-variant gap-1 mt-1">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="text-on-surface font-medium">{t("listTitle")}</span>
          </nav>
        </div>

        <Link
          href="/system-admin/accounts/clinic-admin"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-on-primary font-semibold text-sm rounded-xl transition-all shadow-xs active:scale-95 self-start sm:self-center cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>{t("addClinicAdmin")}</span>
        </Link>
      </div>

      {/* Banner hướng dẫn phạm vi quản lý tài khoản của System Admin */}
      <div className="bg-[#c6e7ff]/30 border border-[#81cfff]/50 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-on-surface mb-0.5">{t("accountScopeTitle")}</p>
          <p className="text-on-surface-variant leading-relaxed">
            {t("accountScopeBody")}
          </p>
        </div>
      </div>

      {/* Bộ Lọc Điều Kiện & Thanh Tìm Kiếm (Khung Grid 3 cột như Clinics & Applications) */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ô Tìm kiếm */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("searchAccount")}</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface transition-all outline-none"
              />
            </div>
          </div>

          {/* Lọc theo Vai Trò */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("systemRole")}</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all outline-none text-on-surface font-medium cursor-pointer"
            >
              <option value="all">{t("allRoles")}</option>
              <option value="CLINIC_ADMIN">{roleMapping.CLINIC_ADMIN}</option>
              <option value="DOCTOR">{roleMapping.DOCTOR}</option>
              <option value="RECEPTIONIST">{roleMapping.RECEPTIONIST}</option>
            </select>
          </div>

          {/* Lọc theo Trạng Thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("activityStatus")}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all outline-none text-on-surface font-medium cursor-pointer"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("statusActive")}</option>
              <option value="locked">{t("statusLocked")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-on-error-container mb-0.5">{t("systemError")}</h3>
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        </div>
      )}

      {/* Hiệu ứng Loading */}
      {loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-on-surface-variant">{t("loadingAccounts")}</p>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && accountsList.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <Users className="h-12 w-12 text-on-surface-variant/50 mb-3" />
          <h3 className="text-lg font-bold text-on-surface mb-1">{t("noAccountsFound")}</h3>
          <p className="text-sm text-on-surface-variant">{t("noAccountsDescription")}</p>
        </div>
      ) : !loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tablePersonalInfo")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tablePhoneEmail")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableRole")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableCreatedAt")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">{t("tableStatus")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {accountsList.map((account) => (
                  <tr key={account.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#c6e7ff]/40 text-primary flex items-center justify-center border border-[#81cfff]/40 font-bold text-sm shrink-0">
                          {account.fullName ? account.fullName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{account.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-on-surface">{account.phone}</p>
                      <p className="text-xs text-on-surface-variant">{account.email || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c6e7ff]/30 text-[#001e2d] border border-[#81cfff]/40">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {roleMapping[account.role] || account.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-on-surface-variant shrink-0" />
                        {account.createdAt}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {account.role === "CLINIC_ADMIN" ? (
                          <button
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() => handleToggleActive(account.id, account.isActive)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${account.isActive ? "bg-[#00ae78]" : "bg-outline-variant/60"
                              } ${updatingId === account.id ? "opacity-40 cursor-wait" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${account.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                          </button>
                        ) : null}
                        <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${account.isActive ? "bg-[#6ffbbe]/25 text-[#003925] border border-[#4edea3]/60" : "bg-surface-container text-on-surface-variant border border-outline-variant/40"
                          }`}>
                          {account.isActive ? t("statusActive") : t("statusLocked")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {account.role === "CLINIC_ADMIN" ? (
                        <button
                          type="button"
                          onClick={() => handleEditRedirect(account)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary px-2.5 py-1.5 hover:bg-surface-container rounded-lg transition-all whitespace-nowrap cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          <span>{t("edit")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditRedirect(account)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary px-2.5 py-1.5 hover:bg-surface-container rounded-lg transition-all whitespace-nowrap cursor-pointer"
                          title={t("accountDetailTitle")}
                        >
                          <Eye className="h-4 w-4 shrink-0 text-primary" />
                          <span>{t("viewOnly")}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang ở chân bảng */}
          {meta.total > 0 && (
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">
                {t("showingRows", { from: Math.min((meta.page - 1) * meta.size + 1, meta.total), to: Math.min(meta.page * meta.size, meta.total), total: meta.total })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-sm font-medium shadow-xs">
                  {meta.page}
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}