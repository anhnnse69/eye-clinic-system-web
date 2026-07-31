"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { 
  Calendar, 
  Search, 
  User, 
  Clock, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"

import { clinicAppointmentService } from "@/services"
import type { GetClinicAppointmentResponse } from "@/services/clinic-appointment.service"
import { formatCurrency } from "@/lib/utils"
import type { MetaResponse } from "@/types"

export default function ClinicAdminAppointments() {
  const t = useTranslations("clinicAdmin.appointment")

  const [appointments, setAppointments] = useState<GetClinicAppointmentResponse[]>([])
  const [metadata, setMetadata] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [appointmentDate, setAppointmentDate] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize] = useState<number>(10)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clinicAppointmentService.getAll({
        searchTerm: debouncedSearchTerm,
        status: status || undefined,
        appointmentDate: appointmentDate || undefined,
        pageNumber,
        pageSize
      })

      setAppointments(response.data || [])
      if (response.meta) {
        setMetadata(response.meta)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t("noAppointmentsFound"))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, status, appointmentDate, pageNumber, pageSize, t])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleFilterChange = () => {
    setPageNumber(1)
  }

  const getStatusBadgeClass = (statusStr: string) => {
    switch (statusStr?.toUpperCase()) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100"
      case "BOOKED": return "bg-blue-50 text-blue-700 border-blue-100"
      case "ARRIVED": return "bg-indigo-50 text-indigo-700 border-indigo-100"
      case "IN_PROGRESS": return "bg-purple-50 text-purple-700 border-purple-100"
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-100"
      case "NOSHOW": return "bg-slate-50 text-slate-600 border-slate-100"
      default: return "bg-slate-50 text-slate-700 border-slate-100"
    }
  }

  const getStatusLabel = (statusStr: string) => {
    switch (statusStr?.toUpperCase()) {
      case "PENDING": return t("statusPending")
      case "BOOKED": return t("statusBooked")
      case "ARRIVED": return t("statusArrived")
      case "IN_PROGRESS": return t("statusInProgress")
      case "COMPLETED": return t("statusCompleted")
      case "CANCELLED": return t("statusCancelled")
      case "NOSHOW": return t("statusNoShow")
      default: return statusStr
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("manageTitle")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t("manageSubtitle")}</p>
        </div>
        <button
          onClick={loadAppointments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 appearance-none cursor-pointer"
          >
            <option value="">{t("statusAll")}</option>
            <option value="PENDING">{t("statusPending")}</option>
            <option value="BOOKED">{t("statusBooked")}</option>
            <option value="ARRIVED">{t("statusArrived")}</option>
            <option value="IN_PROGRESS">{t("statusInProgress")}</option>
            <option value="COMPLETED">{t("statusCompleted")}</option>
            <option value="CANCELLED">{t("statusCancelled")}</option>
            <option value="NOSHOW">{t("statusNoShow")}</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => { setAppointmentDate(e.target.value); handleFilterChange(); }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="p-8 text-center min-h-[300px] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-rose-500 font-medium">{error}</div>
          <button
            onClick={loadAppointments}
            className="mt-4 px-5 py-2 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm"
          >
            {t("retry")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("patient")}</th>
                  <th className="p-4">{t("doctor")}</th>
                  <th className="p-4">{t("appointmentTime")}</th>
                  <th className="p-4">{t("serviceName")}</th>
                  <th className="p-4">{t("depositAmount")}</th>
                  <th className="p-4">{t("status")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
                    </tr>
                  ))
                ) : appointments.length > 0 ? (
                  appointments.map((app) => (
                    <tr key={app.id_appointment} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-slate-900">{app.patientName}</div>
                        <div className="text-slate-400 text-xs font-medium mt-0.5">{app.patientPhone}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {app.doctorName}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {app.appointmentDate}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          {app.timeSlot}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {app.serviceName}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{formatCurrency(app.depositAmount)}</div>
                        <div className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${app.depositPaid ? "text-emerald-600" : "text-slate-400"}`}>
                          {app.depositPaid ? t("paid") : t("unpaid")}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      {t("noAppointmentsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t("showingPage", { page: metadata.page, totalPages: metadata.totalPages, total: metadata.total })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                  disabled={!metadata.hasPrevious || loading}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setPageNumber(p => p + 1)}
                  disabled={!metadata.hasNext || loading}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
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
