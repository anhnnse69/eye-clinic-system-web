"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Pencil, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw 
} from "lucide-react"
import { useTranslations } from "next-intl"
import { staffService } from "@/services/staff.service"
import type { StaffAccountResponse } from "@/services/staff.service"

interface MetaResponse {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function StaffManagementPage() {
  const t = useTranslations("clinicAdmin.staff")
  const tCommon = useTranslations("clinicAdmin.common")

  const [staffList, setStaffList] = useState<StaffAccountResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [meta, setMeta] = useState<MetaResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const loadStaffData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const isActiveParam = 
        isActiveFilter === "active" ? true : 
        isActiveFilter === "inactive" ? false : undefined

      const response = await staffService.getStaffList({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch || undefined
      })

      if (response.data) {
        setStaffList(response.data)
      }
      
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage

      if (errCode === "APP_MESSAGE_4001") {
        setError(t("sessionExpired"))
      } else if (errCode === "APP_MESSAGE_4020") {
        setError(t("clinicNotFound"))
      } else {
        setError(t("connectionError"))
      }
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch, t])

  useEffect(() => {
    loadStaffData()
  }, [loadStaffData])

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("listTitle")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t("listSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStaffData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh") || "Làm mới"}
          </button>
          <Link 
            href="/clinic-admin/staff/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addStaff")}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-8 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="md:col-span-2">
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer appearance-none"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2 text-sm font-medium text-slate-500">
          <span>{tCommon("total")}:</span>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold">{meta.total}</span>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="p-8 text-center min-h-75 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-rose-500 font-medium">{error}</div>
          <button
            onClick={loadStaffData}
            className="mt-4 px-5 py-2 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm"
          >
            {t("retry") || "Thử lại"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("fullName")}</th>
                  <th className="p-4">{t("contactInfo")}</th>
                  <th className="p-4">{t("position")}</th>
                  <th className="p-4 text-center">{tCommon("status")}</th>
                  <th className="p-4">{t("joinDate")}</th>
                  <th className="p-4 text-center">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-12 bg-slate-200 rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff.userId} className="hover:bg-slate-50/50 group transition-colors">
                      {/* Avatar & Họ và tên */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="font-semibold text-slate-900">{staff.fullName}</span>
                        </div>
                      </td>
                      
                      {/* Email & Số điện thoại */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{staff.phone || t("notAvailable")}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phân quyền / Chức vụ */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                          {staff.role}
                        </span>
                      </td>

                      {/* Trạng thái hoạt động */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          staff.isActive 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {staff.isActive ? t("statusActive") : t("statusInactive")}
                        </span>
                      </td>

                      {/* Ngày tạo tài khoản */}
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{new Date(staff.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </td>

                      {/* Thao tác chỉnh sửa thông tin */}
                      <td className="p-4 text-center">
                        <Link
                          href={`/clinic-admin/staff/edit/${staff.userId}`}
                          className="inline-flex items-center justify-center p-2 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
                          title={tCommon("edit")}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t("showingRows", { 
                  from: Math.min((meta.page - 1) * meta.size + 1, meta.total), 
                  to: Math.min(meta.page * meta.size, meta.total), 
                  total: meta.total 
                })}
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 {t("rowsPerPage")}</option>
                  <option value={10}>10 {t("rowsPerPage")}</option>
                  <option value={20}>20 {t("rowsPerPage")}</option>
                  <option value={50}>50 {t("rowsPerPage")}</option>
                </select>

                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  title={t("previousPage")}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                <span className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg">
                  {meta.page} / {meta.totalPages}
                </span>

                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  title={t("nextPage")}
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
