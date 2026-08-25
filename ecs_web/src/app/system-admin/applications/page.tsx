"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { 
  FileText, Search, Filter, ChevronLeft, ChevronRight, 
  Eye, Building2, Calendar, AlertCircle, Loader2
} from "lucide-react"
import { clinicApplicationsService } from "@/services"

interface BackendClinicApplication {
  id_clinic_registration: string
  clinicName: string
  contactEmail: string
  contactPhone: string
  submissionDate: string
  status: string
}

interface BackendMetaResponse {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function ClinicApplicationsPage() {
  const router = useRouter()
  const t = useTranslations("systemAdmin.applications")
  const tCommon = useTranslations("systemAdmin.common")
  
  const [applications, setApplications] = useState<BackendClinicApplication[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [pagination, setPagination] = useState<BackendMetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchApplications()
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clinicApplicationsService.getApplications({
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      const resData = response?.data || (response as any)?.Data;
      const resMeta = response?.meta || (response as any)?.Meta;

      if (resData && Array.isArray(resData)) {
        setApplications(resData as BackendClinicApplication[])
        if (resMeta) {
          setPagination(resMeta as BackendMetaResponse)
        }
      } else {
        setApplications([])
      }
    } catch (err) {
      setError(t("loadError"))
      console.error("Error fetching applications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/system-admin/applications/${id}`)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (pagination?.hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">{t("listHeader")}</h2>
          <nav className="flex text-sm text-on-surface-variant gap-1 mt-1">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/system-admin/dashboard")}>{t("title")}</span>
            <span>/</span>
            <span className="text-on-surface font-medium">{t("listHeader")}</span>
          </nav>
        </div>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ô Tìm kiếm */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("searchLabel")}</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <input 
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface transition-all outline-none"
              />
            </div>
          </div>

          {/* Ô lọc Trạng thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("statusLabel")}</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all outline-none text-on-surface font-medium cursor-pointer"
            >
              <option value="">{t("statusAll")}</option>
              <option value="PENDING">{t("pending")}</option>
              <option value="APPROVED">{t("approved")}</option>
              <option value="REJECTED">{t("rejected")}</option>
            </select>
          </div>

          {/* Nút Làm mới */}
          <button 
            onClick={fetchApplications}
            disabled={loading}
            className="border border-primary text-primary hover:bg-[#c6e7ff]/30 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full cursor-pointer shadow-xs"
          >
            <Filter className="h-4 w-4" />
            {loading ? tCommon("loading") : t("refresh")}
          </button>
        </div>
      </div>

      {/* Thông báo Lỗi */}
      {error && (
        <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-on-error-container mb-0.5">{tCommon("error")}</h3>
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        </div>
      )}

      {/* Hiệu ứng Loading */}
      {loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-on-surface-variant">{t("loadingList")}</p>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && applications.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <FileText className="h-12 w-12 text-on-surface-variant/50 mb-3" />
          <h3 className="text-lg font-bold text-on-surface mb-1">{t("emptyTitle")}</h3>
          <p className="text-sm text-on-surface-variant">{t("emptyDescription")}</p>
        </div>
      ) : !loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableId")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableClinic")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableDate")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableStatus")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {applications.map((app) => {
                  const id = app.id_clinic_registration || (app as any).Id_clinic_registration;
                  const name = app.clinicName || (app as any).ClinicName;
                  const email = app.contactEmail || (app as any).ContactEmail;
                  const phone = app.contactPhone || (app as any).ContactPhone;
                  const date = app.submissionDate || (app as any).SubmissionDate;
                  const status = (app.status || (app as any).Status || "").toUpperCase();

                  return (
                    <tr key={id} className="hover:bg-surface-container-low/60 transition-colors cursor-pointer" onClick={() => handleViewDetails(id)}>
                      <td className="px-6 py-4 font-mono font-semibold text-primary text-sm">{id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant border border-outline-variant/30 shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-on-surface">{name}</span>
                            <span className="text-xs text-on-surface-variant">{phone} • {email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-on-surface-variant" />
                          {date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {status === "PENDING" && (
                          <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-amber-200/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>{t("pending")}</span>
                          </div>
                        )}
                        {status === "APPROVED" && (
                          <div className="flex items-center gap-1.5 text-[#003925] bg-[#6ffbbe]/25 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-[#4edea3]/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ae78]"></span>
                            <span>{t("approved")}</span>
                          </div>
                        )}
                        {status === "REJECTED" && (
                          <div className="flex items-center gap-1.5 text-[#93000a] bg-[#ffdad6]/60 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-[#ffdad6]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            <span>{t("rejected")}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleViewDetails(id)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg flex items-center gap-1 text-xs font-medium direct-btn cursor-pointer transition-colors">
                          <Eye className="h-4 w-4" />
                          <span>{tCommon("viewDetails")}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pagination && (
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">
                {t("pagination", { from: pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1, to: Math.min(pagination.page * pagination.size, pagination.total), total: pagination.total })}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrevious || loading}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-sm font-medium shadow-xs">
                  {pagination.page}
                </button>
                <button 
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || loading}
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