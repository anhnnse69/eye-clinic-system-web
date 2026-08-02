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
    <div className="space-y-6 w-full min-w-0 px-4 py-4 text-left">
      {/* Header đồng bộ chuẩn với Clinics và Applications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t("listTitle")}</h2>
          <nav className="flex text-sm text-slate-500 gap-1 mt-1">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="text-slate-800">{t("listTitle")}</span>
          </nav>
        </div>

        <Link
          href="/system-admin/accounts/clinic-admin"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 self-start sm:self-center cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>{t("addClinicAdmin")}</span>
        </Link>
      </div>

      {/* Banner hướng dẫn phạm vi quản lý tài khoản của System Admin (chuẩn Slate Blue) */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 mb-0.5">{t("accountScopeTitle")}</p>
          <p className="text-blue-700 leading-relaxed">
            {t("accountScopeBody")}
          </p>
        </div>
      </div>

      {/* Bộ Lọc Điều Kiện & Thanh Tìm Kiếm (Khung Grid 3 cột như Clinics & Applications) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ô Tìm kiếm */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">{t("searchAccount")}</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Lọc theo Vai Trò */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">{t("systemRole")}</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">{t("allRoles")}</option>
              <option value="CLINIC_ADMIN">{roleMapping.CLINIC_ADMIN}</option>
              <option value="DOCTOR">{roleMapping.DOCTOR}</option>
              <option value="RECEPTIONIST">{roleMapping.RECEPTIONIST}</option>
            </select>
          </div>

          {/* Lọc theo Trạng Thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">{t("activityStatus")}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPageNumber(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-0.5">{t("systemError")}</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Hiệu ứng Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">{t("loadingAccounts")}</p>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && accountsList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <Users className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t("noAccountsFound")}</h3>
          <p className="text-sm text-slate-500">{t("noAccountsDescription")}</p>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tablePersonalInfo")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tablePhoneEmail")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tableRole")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tableCreatedAt")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t("tableStatus")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accountsList.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold text-sm shrink-0">
                          {account.fullName ? account.fullName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{account.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-slate-700">{account.phone}</p>
                      <p className="text-xs text-slate-500">{account.email || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="h-3.5 w-3.5" /> {roleMapping[account.role] || account.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
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
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${account.isActive ? "bg-emerald-500" : "bg-slate-300"
                              } ${updatingId === account.id ? "opacity-40 cursor-wait" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${account.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                          </button>
                        ) : null}
                        <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${account.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
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
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          <span>{t("edit")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditRedirect(account)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                          title={t("accountDetailTitle")}
                        >
                          <Eye className="h-4 w-4 shrink-0 text-blue-600" />
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
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {t("showingRows", { from: Math.min((meta.page - 1) * meta.size + 1, meta.total), to: Math.min(meta.page * meta.size, meta.total), total: meta.total })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {meta.page}
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 cursor-pointer"
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