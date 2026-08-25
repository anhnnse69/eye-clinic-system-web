// components/doctor/MedicalRecordsListClient.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search,
  Calendar,
  Eye,
  Loader2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { medicalRecordsService } from "@/services"
import type {
  GetMedicalRecordsRequest,
  GetMedicalRecordsItem,
  GetMedicalRecordsMeta,
} from "@/types"
import { RECORD_TYPE_LABELS, type RecordType } from "@/types"

const PAGE_SIZE = 10

export default function MedicalRecordsListClient() {
  const t = useTranslations("doctor.medicalRecord")
  const tList = useTranslations("doctor.medicalRecord.recordList")

  const RECORD_TYPES = [
    { value: "", label: tList("allTypes") },
    { value: "MS21_TRAUMA", label: t("trauma") },
    { value: "MS22_ANTERIOR", label: t("anterior") },
    { value: "MS23_FUNDUS", label: t("fundus") },
    { value: "MS24_GLAUCOMA", label: t("glaucoma") },
    { value: "MS25_STRABISMUS_PTOSIS", label: t("strabismus") },
    { value: "MS26_PEDIATRIC", label: t("pediatric") },
  ]

  const [items, setItems] = useState<GetMedicalRecordsItem[]>([])
  const [meta, setMeta] = useState<GetMedicalRecordsMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecordType, setSelectedRecordType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Boolean(searchTerm || selectedRecordType || startDate || endDate)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: GetMedicalRecordsRequest = {
        pageNumber,
        pageSize: PAGE_SIZE,
      }

      if (searchTerm) params.searchTerm = searchTerm
      if (selectedRecordType) params.recordType = selectedRecordType
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await medicalRecordsService.getMedicalRecords(params)

      setItems(response.data ?? [])
      setMeta(response.meta ?? null)
    } catch (err) {
      console.error("Error fetching medical records:", err)
      setError(tList("error"))
    } finally {
      setLoading(false)
    }
  }, [pageNumber, searchTerm, selectedRecordType, startDate, endDate, tList])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setPageNumber(1)
  }, [])

  const handleRecordTypeChange = useCallback((value: string) => {
    setSelectedRecordType(value)
    setPageNumber(1)
  }, [])

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value)
    setPageNumber(1)
  }, [])

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value)
    setPageNumber(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedRecordType("")
    setStartDate("")
    setEndDate("")
    setPageNumber(1)
  }, [])

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRecordTypeLabel = (type: string) => {
    return RECORD_TYPE_LABELS[type as RecordType] || type
  }

  const totalRecords = meta?.total ?? items.length
  const totalPages = meta?.totalPages || Math.ceil(totalRecords / PAGE_SIZE) || 1

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased font-sans text-slate-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#00658D]" />
            {tList("listTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {t("listSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={tList("searchByPatient")}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
              showFilters || hasActiveFilters
                ? "bg-[#00658D]/10 border-[#00658D]/30 text-[#00658D]"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            {tList("filters")}
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-[#00658D] text-white text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {tList("recordType")}
              </label>
              <select
                value={selectedRecordType}
                onChange={(e) => handleRecordTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] bg-white text-slate-800"
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {tList("fromDate")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {tList("toDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] bg-white text-slate-800"
              />
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  {tList("clearFilters")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 bg-[#00658D]/10 rounded-2xl flex items-center justify-center text-[#00658D] mb-3 border border-[#00658D]/20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {tList("loading")}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {tList("pleaseWait")}
          </p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-3 border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {tList("error")}
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchRecords}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#00658D] text-white rounded-xl hover:bg-[#005273] transition-colors shadow-2xs"
          >
            {tList("retry")}
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {hasActiveFilters ? tList("noRecordsFound") : tList("noRecordsYet")}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {hasActiveFilters ? tList("adjustFilters") : tList("noRecordsYet")}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#00658D] hover:bg-[#00658D]/10 rounded-xl transition-colors border border-[#00658D]/20"
            >
              {tList("clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">{tList("patient")}</th>
                    <th className="px-6 py-4">{tList("type")}</th>
                    <th className="px-6 py-4">{tList("examDate")}</th>
                    <th className="px-6 py-4">{tList("diagnosis")}</th>
                    <th className="px-6 py-4 text-center">{tList("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#00658D]/10 flex items-center justify-center text-[#00658D] font-bold text-sm border border-[#00658D]/20 shrink-0">
                            {record.patientFullName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#00658D] transition-colors">
                              {record.patientFullName}
                            </p>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                              {record.patientDob && (
                                <span>{tList("born")}: {record.patientDob}</span>
                              )}
                              {record.patientPhone && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>{record.patientPhone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-[#00658D]/10 text-[#00658D] border border-[#00658D]/20 rounded-lg">
                          {getRecordTypeLabel(record.recordType)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDateTime(record.appointmentDate)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-[280px]">
                          <span
                            className="text-slate-800 text-xs font-semibold leading-relaxed line-clamp-2"
                            title={record.diagnosisMain || record.chiefComplaint || undefined}
                          >
                            {record.diagnosisMain || record.chiefComplaint || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Link
                          href={`/doctor/records/${record.id}?appointmentId=${record.appointmentId || ""}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00658D] bg-[#00658D]/10 hover:bg-[#00658D]/20 border border-[#00658D]/20 rounded-lg transition-colors shadow-2xs active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 gap-4">
                <div>
                  {tList("page")} <span className="text-slate-900 font-bold">{pageNumber}</span> {tList("of")}{" "}
                  <span className="text-slate-900 font-bold">{totalPages}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>
                    {tList("total")} <span className="text-slate-900 font-bold">{totalRecords}</span> {tList("records")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {tList("previous")}
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1
                    if (totalPages > 5) {
                      if (pageNumber > 3) {
                        page = pageNumber - 2 + i
                      }
                      if (page > totalPages) {
                        page = totalPages - 4 + i
                      }
                    }
                    if (page < 1 || page > totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-8 h-8 text-xs font-bold rounded-xl transition-colors ${
                          page === pageNumber
                            ? "bg-[#00658D] text-white shadow-2xs"
                            : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
                  >
                    {tList("next")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
