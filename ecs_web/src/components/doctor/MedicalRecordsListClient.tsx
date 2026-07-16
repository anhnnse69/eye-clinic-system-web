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
  PenSquare,
  FileText,
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

  const hasActiveFilters = searchTerm || selectedRecordType || startDate || endDate

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

  const totalPages = meta?.totalPages || 1
  const totalRecords = meta?.total || 0

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {tList("listTitle")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("listSubtitle")}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={tList("searchByPatient")}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            {tList("filters")}
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>

        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {tList("recordType")}
              </label>
              <select
                value={selectedRecordType}
                onChange={(e) => handleRecordTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {tList("fromDate")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {tList("toDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {tList("loading")}
          </h3>
          <p className="text-sm text-gray-500">
            {tList("pleaseWait")}
          </p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {tList("error")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchRecords}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {tList("retry")}
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {hasActiveFilters ? tList("noRecordsFound") : tList("noRecordsYet")}
          </h3>
          <p className="text-sm text-gray-500">
            {hasActiveFilters ? tList("adjustFilters") : tList("noRecordsYet")}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {tList("clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm text-gray-600 min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700">
                    <th className="px-5 py-4 text-left font-semibold">{tList("patient")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("appointmentCode")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("type")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("examDate")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("symptoms")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("diagnosis")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("status")}</th>
                    <th className="px-5 py-4 text-left font-semibold">{tList("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {record.patientFullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.patientFullName}
                            </p>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {record.patientDob && (
                                <span>{tList("born")}: {record.patientDob}</span>
                              )}
                              {record.patientPhone && (
                                <>
                                  <span className="text-gray-400">|</span>
                                  <span>{record.patientPhone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-gray-600">
                        <div className="max-w-[120px] truncate" title={record.appointmentId}>
                          {record.appointmentId.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg">
                          {getRecordTypeLabel(record.recordType)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDateTime(record.appointmentDate)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[180px]">
                          <span
                            className="text-gray-700 text-xs"
                            title={record.chiefComplaint || undefined}
                          >
                            {record.chiefComplaint || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[200px]">
                          <span
                            className="text-gray-700 text-xs"
                            title={record.diagnosisMain || undefined}
                          >
                            {record.diagnosisMain || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {record.isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            {tList("locked")}
                          </span>
                        ) : record.canEdit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {tList("canEdit")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            {tList("viewOnly")}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {record.canEdit && !record.isLocked ? (
                            <Link
                              href={`/doctor/records/${record.id}/edit?appointmentId=${record.appointmentId || ""}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 active:bg-amber-200 transition-colors"
                            >
                              <PenSquare className="w-3.5 h-3.5" />
                              {tList("edit")}
                            </Link>
                          ) : (
                            <Link
                              href={`/doctor/records/${record.id}?appointmentId=${record.appointmentId || ""}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {tList("detail")}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm text-gray-500 font-medium">
                  {tList("page")} <span className="text-gray-900 font-semibold">{pageNumber}</span> {tList("of")}{" "}
                  <span className="text-gray-900 font-semibold">{totalPages}</span>
                  <span className="ml-2 text-gray-400">|</span>
                  <span className="ml-2">
                    {tList("total")} <span className="text-gray-900 font-semibold">{totalRecords}</span> {tList("records")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNumber
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
