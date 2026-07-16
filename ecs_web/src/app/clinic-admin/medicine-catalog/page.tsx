"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Layers,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  FileText
} from "lucide-react"
import { useTranslations } from "next-intl"
import { medicineService } from "@/services/medicine.service"
import type { GetMedicineCatalogResponse } from "@/services/medicine.service"

export default function MedicineCatalogManagementPage() {
  const t = useTranslations("clinicAdmin.medicine")
  const tCommon = useTranslations("clinicAdmin.common")

  const [medicineList, setMedicineList] = useState<GetMedicineCatalogResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State theo dõi xem ID thuốc nào đang được gạt để hiển thị hiệu ứng đợi riêng biệt
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Debounce tìm kiếm tự động sau 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm load danh sách dữ liệu danh mục thuốc
  const loadMedicineData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const isActiveParam =
        isActiveFilter === "active" ? true :
        isActiveFilter === "inactive" ? false : undefined

      const response = await medicineService.getMedicineCatalog({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response && response.data) {
        setMedicineList(response.data)
      } else {
        setMedicineList([])
      }

      if (response && response.meta) {
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
      // Bắt lỗi chuẩn cấu trúc hệ thống dựa trên tài liệu tập huấn
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": t("sessionExpired"),
        "APP_MESSAGE_4020": t("clinicNotFound"),
        "APP_MESSAGE_4015": t("medicineExists")
      };
      const fallbackMessage = t("connectionError");
      setError(errorMessages[errCode] || fallbackMessage);
      setMedicineList([])
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch, t])

  useEffect(() => {
    loadMedicineData()
  }, [loadMedicineData])

  // Hàm xử lý khi bấm vào nút gạt đổi trạng thái hoạt động/khóa thuốc
  const handleToggleActive = async (medicineId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(medicineId)

      // Gọi hàm của service và truyền tham số dạng object Request { id: ... } đúng chuẩn quy định
      await medicineService.toggleMedicineStatus({ id: medicineId })

      // Cập nhật nhanh UI ở client để nút gạt chuyển đổi tức thì mà không cần reload trang
      setMedicineList(prev =>
        prev.map(item =>
          item.id === medicineId ? { ...item, isActive: !currentStatus } : item
        )
      )
    } catch (err: any) {
      // Bắt lỗi khi gạt nút đổi trạng thái theo cấu trúc Dictionary chuẩn
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": t("sessionExpired"),
        "APP_MESSAGE_4020": t("clinicNotFound"),
        "APP_MESSAGE_4019": t("medicineNotFound")
      };
      const fallbackMessage = t("updateFailed");
      alert(errorMessages[errCode] || fallbackMessage);
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary shrink-0" />
            {t("listTitle")}
          </h2>
          <p className="text-body-md text-on-surface-variant">{t("listSubtitle")}</p>
        </div>

        <Link
          href="/clinic-admin/medicine-catalog/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> {t("addMedicine")}
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> {t("status")}:
          </span>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            {t("loadingData")}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table View */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">{t("medicineInfo")}</th>
                    <th className="p-4">{t("concentrationLabel")}</th>
                    <th className="p-4">{t("unitDosage")}</th>
                    <th className="p-4">{t("manufacturerLabel")}</th>
                    <th className="p-4 text-center">{t("statusActiveLabel")}</th>
                    <th className="p-4 text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {medicineList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant">
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    medicineList.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-on-surface">{medicine.medicineName}</p>
                          {medicine.genericName && (
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <FileText className="h-3 w-3" /> {t("genericNameLabel")} {medicine.genericName}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-primary font-medium">
                          {medicine.concentration}
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          <span className="font-medium text-on-surface">{medicine.unit}</span>
                          <span className="text-xs block text-on-surface-variant/80">{medicine.dosageForm}</span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-sm">
                          {medicine.manufacturer || t("notAvailable")}
                        </td>
                        
                        {/* NÚT GẠT (TOGGLE SWITCH) 2 CHIỀU ĐÃ ĐƯỢC TÍCH HỢP */}
                        <td className="p-4">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={updatingId !== null}
                              onClick={() => handleToggleActive(medicine.id, medicine.isActive)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                medicine.isActive ? "bg-emerald-500" : "bg-neutral-300"
                              } ${updatingId === medicine.id ? "opacity-50 cursor-wait" : ""}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  medicine.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="text-[11px] font-medium text-on-surface-variant/80">
                              {medicine.isActive ? t("active") : t("paused")}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <Link
                            href={`/clinic-admin/medicine-catalog/edit/${medicine.id}`}
                            onClick={() => sessionStorage.setItem("currentEditMedicine", JSON.stringify(medicine))}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-xl text-label-sm text-primary font-medium bg-surface-container-lowest hover:bg-primary/5 transition-colors shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" /> {tCommon("edit")}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                {t("showingRows", { 
                  from: Math.min((meta.page - 1) * meta.size + 1, meta.total), 
                  to: Math.min(meta.page * meta.size, meta.total), 
                  total: meta.total 
                })}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="bg-surface-container-lowest border border-outline-variant text-on-surface px-2 py-1.5 rounded-lg text-label-md focus:outline-none cursor-pointer mr-2 font-medium"
                >
                  <option value={5}>5 {t("rowsPerPage")}</option>
                  <option value={10}>10 {t("rowsPerPage")}</option>
                  <option value={20}>20 {t("rowsPerPage")}</option>
                  <option value={50}>50 {t("rowsPerPage")}</option>
                </select>
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("previousPage")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("nextPage")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}