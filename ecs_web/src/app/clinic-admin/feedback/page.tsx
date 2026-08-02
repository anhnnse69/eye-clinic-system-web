"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  User,
  Calendar,
  Clock,
  AlertCircle,
  RotateCcw,
  Trash2,
  X,
  RefreshCw
} from "lucide-react"
import { useTranslations } from "next-intl"
import { clinicFeedbackService } from "@/services"
import type { GetClinicFeedbackResponse } from "@/services/clinic-feedback.service"
import type { MetaResponse } from "@/types"

export default function ClinicFeedbackPage() {
  const t = useTranslations("clinicAdmin.feedback")
  const tCommon = useTranslations("clinicAdmin.common")

  const [feedbacks, setFeedbacks] = useState<GetClinicFeedbackResponse[]>([])
  const [metadata, setMetadata] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [ratingDoctor, setRatingDoctor] = useState("")
  const [ratingClinic, setRatingClinic] = useState("")
  const [feedbackDate, setFeedbackDate] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isFiltering = searchTerm !== "" || ratingDoctor !== "" || ratingClinic !== "" || feedbackDate !== ""

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadFeedbacks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clinicFeedbackService.getAll({
        searchTerm: debouncedSearchTerm,
        ratingDoctor: ratingDoctor ? Number(ratingDoctor) : undefined,
        ratingClinic: ratingClinic ? Number(ratingClinic) : undefined,
        feedbackDate: feedbackDate || undefined,
        pageNumber,
        pageSize,
      })

      setFeedbacks(response.data || [])
      if (response.meta) {
        setMetadata(response.meta)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t("loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, ratingDoctor, ratingClinic, feedbackDate, pageNumber, pageSize, t])

  useEffect(() => {
    loadFeedbacks()
  }, [loadFeedbacks])

  const handleResetFilters = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setRatingDoctor("")
    setRatingClinic("")
    setFeedbackDate("")
    setPageNumber(1)
  }

  const openDeleteModal = (id: string) => {
    setSelectedFeedbackId(id)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedFeedbackId(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedFeedbackId) return
    try {
      setDeletingId(selectedFeedbackId)
      setError(null)
      setSuccessMessage(null)
      await clinicFeedbackService.delete(selectedFeedbackId)
      setSuccessMessage(t("deleteSuccess"))
      closeDeleteModal()
      await loadFeedbacks()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t("deleteFailed"))
      closeDeleteModal()
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
        />
      ))}
      <span className="text-xs font-semibold ml-1 text-slate-500">({rating})</span>
    </div>
  )

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("manageTitle")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t("manageSubtitle")}</p>
        </div>
        <button
          onClick={loadFeedbacks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh") || "Làm mới"}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="lg:col-span-2 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div>
          <select
            value={ratingDoctor}
            onChange={(e) => { setRatingDoctor(e.target.value); setPageNumber(1); }}
            className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer appearance-none"
          >
            <option value="">{t("doctorRatingAll")}</option>
            {[5, 4, 3, 2, 1].map((item) => (
              <option key={item} value={item}>{item} {t("stars")}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={ratingClinic}
            onChange={(e) => { setRatingClinic(e.target.value); setPageNumber(1); }}
            className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer appearance-none"
          >
            <option value="">{t("clinicRatingAll")}</option>
            {[5, 4, 3, 2, 1].map((item) => (
              <option key={item} value={item}>{item} {t("stars")}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={feedbackDate}
            onChange={(e) => { setFeedbackDate(e.target.value); setPageNumber(1); }}
            className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer"
          />
          <button
            onClick={handleResetFilters}
            disabled={!isFiltering}
            title={t("resetFilters")}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${isFiltering ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"}`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-medium border border-emerald-200">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-3 text-sm font-medium border border-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      {error ? (
        <div className="p-8 text-center min-h-75 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-rose-500 font-medium">{error}</div>
          <button
            onClick={loadFeedbacks}
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
                  <th className="p-4 pl-6">{t("patient")}</th>
                  <th className="p-4">{t("doctor")}</th>
                  <th className="p-4 text-center">{t("doctorRatingAll")}</th>
                  <th className="p-4 text-center">{t("clinicRatingAll")}</th>
                  <th className="p-4">{t("comment")}</th>
                  <th className="p-4">{t("date")}</th>
                  <th className="p-4 text-center">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded mx-auto" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded mx-auto" /></td>
                      <td className="p-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-12 bg-slate-200 rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                      {t("noFeedback")}
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr key={item.id_feedback} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{item.patientName}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800">{item.doctorName}</span>
                      </td>

                      <td className="p-4 text-center">
                        {renderStars(item.ratingDoctor)}
                      </td>

                      <td className="p-4 text-center">
                        {renderStars(item.ratingClinic)}
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200 line-clamp-2 hover:line-clamp-none transition-all text-xs">
                          {item.comment || t("noCommentContent")}
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{item.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{item.feedbackDate}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => openDeleteModal(item.id_feedback)}
                          disabled={deletingId === item.id_feedback}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${deletingId === item.id_feedback
                              ? "opacity-50 cursor-wait bg-slate-100 text-slate-500 border-slate-200"
                              : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                            }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {tCommon("delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t("showingPage", { page: metadata.page, totalPages: metadata.totalPages })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={!metadata.hasPrevious || loading}
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                <span className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg">
                  {metadata.page} / {metadata.totalPages}
                </span>

                <button
                  disabled={!metadata.hasNext || loading}
                  onClick={() => setPageNumber(p => p + 1)}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                {t("deleteModalTitle")}
              </h3>
              <button onClick={closeDeleteModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {t("deleteModalBody")}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
                className="px-5 py-2 bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-wait font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {deletingId !== null ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("deleting")}
                  </>
                ) : (
                  tCommon("delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
