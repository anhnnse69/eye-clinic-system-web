"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Building2, Search, Filter, ChevronLeft, ChevronRight,
  MapPin, Phone, Mail, AlertCircle, Loader2, Edit2, Ban, X
} from "lucide-react"
import { clinicsService } from "@/services"
import { handleApiError } from "@/lib/axios"
import type { ClinicManagementItem, MetaResponse } from "@/types"

export default function ClinicsListPage() {
  const router = useRouter()
  const t = useTranslations("systemAdmin.clinics")
  const tCommon = useTranslations("systemAdmin.common")

  const [clinics, setClinics] = useState<ClinicManagementItem[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [pagination, setPagination] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPublicationCount, setPendingPublicationCount] = useState<number>(0)

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [selectedClinicName, setSelectedClinicName] = useState<string>("")
  const [deleting, setDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchClinics()
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

  useEffect(() => {
    fetchPendingPublicationCount()
  }, [])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clinicsService.getClinics({
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      const resData = response?.data || (response as any)?.Data
      const resMeta = response?.meta || (response as any)?.Meta

      if (resData && Array.isArray(resData)) {
        setClinics(resData as ClinicManagementItem[])
        if (resMeta) {
          setPagination(resMeta as MetaResponse)
        }
      } else {
        setClinics([])
      }
    } catch (err) {
      setError(t("loadError"))
      console.error("Error fetching clinics:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingPublicationCount = async () => {
    try {
      const response = await clinicsService.getClinics({
        status: "ACTIVE",
        pageNumber: 1,
        pageSize: 100,
      })

      const resData = response?.data || (response as any)?.Data

      if (resData && Array.isArray(resData)) {
        const pendingCount = resData.filter((clinic: any) => {
          const isPublished = clinic.isPublished ?? clinic.IsPublished
          const isPublicationRequested = clinic.isPublicationRequested ?? clinic.IsPublicationRequested

          return isPublicationRequested === true && isPublished === false
        }).length

        setPendingPublicationCount(pendingCount)
      } else {
        setPendingPublicationCount(0)
      }
    } catch (err) {
      console.error("Error fetching pending publication count:", err)
    }
  }

  const handleOpenDeleteModal = (id: string, name: string) => {
    setSelectedClinicId(id)
    setSelectedClinicName(name)
    setDeleteError(null)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedClinicId(null)
    setSelectedClinicName("")
    setDeleteError(null)
    setDeleting(false)
  }

  const handleConfirmDelete = async () => {
    if (!selectedClinicId) return

    try {
      setDeleting(true)
      setDeleteError(null)

      await clinicsService.deleteClinic(selectedClinicId)

      handleCloseDeleteModal()
      await fetchClinics()
      await fetchPendingPublicationCount()
    } catch (err) {
      const apiErrorMessage = handleApiError(err)
      setDeleteError(`${t("disableFailed")}: ${apiErrorMessage}`)
      console.error("Error deleting clinic:", err)
    } finally {
      setDeleting(false)
    }
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

  const resolveDisplayState = (isPublished: boolean, rawStatus: string): {
    key: "UNPUBLISHED" | "ACTIVE" | "INACTIVE"
    label: string
    dotClass: string
    wrapperClass: string
  } => {
    const stateMap = {
      UNPUBLISHED: {
        key: "UNPUBLISHED" as const,
        label: t("unpublished"),
        dotClass: "bg-slate-400",
        wrapperClass: "text-on-surface-variant bg-surface-container border-outline-variant/40",
      },
      ACTIVE: {
        key: "ACTIVE" as const,
        label: tCommon("active"),
        dotClass: "bg-[#00ae78]",
        wrapperClass: "text-[#003925] bg-[#6ffbbe]/25 border-[#4edea3]/60",
      },
      INACTIVE: {
        key: "INACTIVE" as const,
        label: tCommon("inactive"),
        dotClass: "bg-amber-500",
        wrapperClass: "text-amber-800 bg-amber-50 border-amber-200/70",
      },
    }

    const resolutionKey = !isPublished ? "UNPUBLISHED" : rawStatus

    return stateMap[resolutionKey as keyof typeof stateMap] ?? stateMap.INACTIVE
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">{t("listHeader")}</h2>
          <nav className="flex text-sm text-on-surface-variant gap-1 mt-1">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/system-admin/dashboard")}>{t("title")}</span>
            <span>/</span>
            <span className="text-on-surface font-medium">{t("listHeader")}</span>
          </nav>
        </div>

        <button
          onClick={() => router.push("/system-admin/clinics/pending-publications")}
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-all shadow-xs active:scale-95 self-start sm:self-center cursor-pointer"
        >
          <Building2 className="h-4 w-4" />
          <span>{t("publicationRequests")}</span>

          {pendingPublicationCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-error text-on-error text-[11px] font-bold shadow-md border-2 border-white">
              {pendingPublicationCount > 99 ? "99+" : pendingPublicationCount}
            </span>
          )}
        </button>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-on-surface-variant">{t("statusLabel")}</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all outline-none text-on-surface font-medium cursor-pointer"
            >
              <option value="">{t("statusAll")}</option>
              <option value="ACTIVE">{tCommon("active")}</option>
              <option value="INACTIVE">{tCommon("inactive")}</option>
            </select>
          </div>

          <button
            onClick={fetchClinics}
            disabled={loading}
            className="border border-primary text-primary hover:bg-[#c6e7ff]/30 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full cursor-pointer shadow-xs"
          >
            <Filter className="h-4 w-4" />
            {loading ? tCommon("loading") : t("refresh")}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-on-error-container mb-0.5">{tCommon("error")}</h3>
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-on-surface-variant">{t("loadingList")}</p>
        </div>
      )}

      {!loading && clinics.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <Building2 className="h-12 w-12 text-on-surface-variant/50 mb-3" />
          <h3 className="text-lg font-bold text-on-surface mb-1">{t("emptyTitle")}</h3>
          <p className="text-sm text-on-surface-variant">{t("emptyDescription")}</p>
        </div>
      ) : !loading && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-[70px]">{t("tableIndex")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableClinic")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableContact")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-[160px]">{t("tableStatus")}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-[260px] whitespace-nowrap">{t("tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {clinics.map((clinic, index) => {
                  const id = clinic.id_clinic || (clinic as any).Id_clinic;
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const name = clinic.clinicName || (clinic as any).ClinicName;
                  const address = clinic.address || (clinic as any).Address;
                  const email = clinic.contactEmail || (clinic as any).ContactEmail;
                  const phone = clinic.contactPhone || (clinic as any).ContactPhone;
                  const rawStatus = (clinic.status || (clinic as any).Status || "").toUpperCase();
                  const isPublished = clinic.isPublished ?? (clinic as any).IsPublished;

                  const displayState = resolveDisplayState(isPublished, rawStatus);

                  return (
                    <tr key={id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface-variant text-sm text-center">{stt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#c6e7ff]/40 text-primary flex items-center justify-center border border-[#81cfff]/40 shrink-0 mt-0.5">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm text-on-surface">{name}</span>
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant" />
                              {address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-on-surface-variant" />
                            {phone}
                          </span>
                          <span className="flex items-center gap-1.5 text-on-surface-variant">
                            <Mail className="h-3.5 w-3.5 text-on-surface-variant" />
                            {email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border ${displayState.wrapperClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${displayState.dotClass}`}></span>
                          <span>{displayState.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4 w-full">
                          {displayState.key !== "UNPUBLISHED" && (
                            <button
                              onClick={() => {
                                if (displayState.key === "ACTIVE") {
                                  router.push(`/system-admin/clinics/edit/${id}`)
                                } else {
                                  router.push(`/system-admin/clinics/edit/${id}?mode=view`)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary px-2.5 py-1.5 hover:bg-surface-container rounded-lg transition-all whitespace-nowrap cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4 shrink-0" />
                              <span>{t("edit")}</span>
                            </button>
                          )}

                          {displayState.key === "ACTIVE" && (
                            <button
                              onClick={() => handleOpenDeleteModal(id, name)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-error px-2.5 py-1.5 hover:bg-error-container/20 rounded-lg transition-all whitespace-nowrap cursor-pointer"
                            >
                              <Ban className="h-4 w-4 shrink-0" />
                              <span>{t("disable")}</span>
                            </button>
                          )}

                          {displayState.key === "UNPUBLISHED" && (
                            <span className="text-xs text-on-surface-variant italic">{t("noActions")}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">
                {t("pagination", {
                  from: pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1,
                  to: Math.min(pagination.page * pagination.size, pagination.total),
                  total: pagination.total
                })}
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full shadow-2xl animate-scaleIn overflow-hidden border border-outline-variant/60">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-error-container/40 rounded-full border border-error/20">
                    <Ban className="h-6 w-6 text-error" />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">{t("confirmDisable")}</h3>
                </div>
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={deleting}
                  className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-on-surface-variant" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-on-surface-variant text-base leading-relaxed">
                {t("confirmDisableDescription", { clinicName: selectedClinicName })}
              </p>

              <div className="bg-error-container/40 border border-error-container rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                  <div className="text-sm text-on-error-container">
                    <p className="font-semibold">{t("warningTitle")}</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>{t("warningPoint1")}</li>
                      <li>{t("warningPoint2")}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-error-container/40 border border-error-container rounded-xl text-on-error-container text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-error" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="px-4 py-2.5 text-on-surface bg-surface-container-lowest border border-outline-variant/60 rounded-xl font-semibold hover:bg-surface-container-low transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-6 py-2.5 bg-error hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-error font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[140px] cursor-pointer shadow-xs"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <Ban className="h-5 w-5" />
                    {t("disable")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}