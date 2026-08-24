"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import {
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Briefcase,
  Pill,
  DoorOpen,
  Building2,
  FileSpreadsheet,
  Loader2,
  FileCheck,
  Check,
  X,
  ShieldAlert,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react"

import {
  clinicDashboardService,
  ClinicDashboardResponse,
} from "@/services/clinic-dashboard.service"
import { recordApprovalService } from "@/services/record-approval.service"

import { generateClinicReportExcel } from "@/lib/excel-export"
import { formatCurrency } from "@/lib/utils"

export default function ClinicAdminDashboard() {
  const t = useTranslations("clinicAdmin")
  const tDashboard = useTranslations("clinicAdmin.dashboard")
  const tCommon = useTranslations("clinicAdmin.common")
  const locale = useLocale()
  const [dashboard, setDashboard] = useState<ClinicDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  // Medical Record Edit Requests State for Clinic Admin
  const [editRequests, setEditRequests] = useState<Array<{
    recordId: string
    patientName: string
    doctorName: string
    reason: string
    permissionDoc: string
    attachedFileName?: string | null
    requestedAt: string
    status: "PENDING" | "APPROVED" | "REJECTED"
  }>>([])

  useEffect(() => {
    loadDashboard()
    loadEditRequests()
  }, [])

  const loadEditRequests = async () => {
    try {
      const res = await recordApprovalService.getRequests("PENDING")
      if (res.data) {
        setEditRequests(res.data)
      }
    } catch {
      // ignore
    }
  }

  const handleApproveEditRequest = async (recordId: string) => {
    try {
      const res = await recordApprovalService.approveRequest(recordId)
      if (res.data) {
        setEditRequests((prev) =>
          prev.map((r) => (r.recordId === recordId ? { ...r, status: "APPROVED" } : r))
        )
      }
    } catch {
      // ignore
    }
  }

  const handleRejectEditRequest = async (recordId: string) => {
    try {
      const res = await recordApprovalService.rejectRequest(recordId)
      if (res.data) {
        setEditRequests((prev) =>
          prev.map((r) => (r.recordId === recordId ? { ...r, status: "REJECTED" } : r))
        )
      }
    } catch {
      // ignore
    }
  }

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await clinicDashboardService.get()

      if (!response.data) {
        setError(t("errors.loadFailed"))
        return
      }

      setDashboard(response.data)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        t("errors.serverError")
      )
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      setExportSuccess(null)
      const response = await clinicDashboardService.getExportReport()

      if (!response.data) {
        alert(tDashboard("exportFailed"))
        return
      }

      generateClinicReportExcel(response.data, locale)
      setExportSuccess(tDashboard("exportSuccess"))
      setTimeout(() => setExportSuccess(null), 4000)
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
        err?.message ||
        tDashboard("exportError")
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-64 bg-gray-200 rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <button
          onClick={loadDashboard}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm active:scale-95"
        >
          {tCommon("loading")}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{tDashboard("title")}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{tDashboard("subtitle")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {exportSuccess && (
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
              {exportSuccess}
            </span>
          )}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-xl hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tDashboard("exporting")}</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>{tDashboard("exportButton")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title={tDashboard("todayAppointments")}
          value={dashboard?.totalAppointments ?? 0}
          icon={<Calendar className="w-7 h-7 text-blue-600" />}
          color="blue"
        />
        <DashboardCard
          title={tDashboard("completed")}
          value={dashboard?.completedAppointments ?? 0}
          icon={<CheckCircle className="w-7 h-7 text-emerald-600" />}
          color="emerald"
        />
        <DashboardCard
          title={tDashboard("todayRevenue")}
          value={formatCurrency(dashboard?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-7 h-7 text-violet-600" />}
          color="violet"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-gray-800" />
          <h2 className="text-xl font-bold text-gray-900">{tDashboard("overview")}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <OverviewCard
            title={tDashboard("staff")}
            value={dashboard?.totalStaffs ?? 0}
            icon={<Users className="w-8 h-8 text-blue-600" />}
          />
          <OverviewCard
            title={tDashboard("services")}
            value={dashboard?.totalServices ?? 0}
            icon={<Briefcase className="w-8 h-8 text-purple-600" />}
          />
          <OverviewCard
            title={tDashboard("rooms")}
            value={dashboard?.totalRooms ?? 0}
            icon={<DoorOpen className="w-8 h-8 text-rose-600" />}
          />
          <OverviewCard
            title={tDashboard("medicines")}
            value={dashboard?.totalMedicines ?? 0}
            icon={<Pill className="w-8 h-8 text-emerald-600" />}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-gray-800" />
          <h2 className="text-xl font-bold text-gray-900">{tDashboard("weeklyStats")}</h2>
        </div>

        <div className="space-y-3.5">
          {dashboard?.weeklyStatistics && dashboard.weeklyStatistics.length > 0 ? (
            dashboard.weeklyStatistics.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 border border-transparent hover:border-gray-200/60 rounded-2xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.date}</p>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">
                      {item.appointments} {tDashboard("appointments")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-emerald-600 tracking-tight">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{tDashboard("revenue")}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">{tDashboard("noWeeklyData")}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) {
  const colorMap: any = {
    blue: "bg-blue-50/60 border-blue-100/80 text-blue-900",
    emerald: "bg-emerald-50/60 border-emerald-100/80 text-emerald-900",
    violet: "bg-violet-50/60 border-violet-100/80 text-violet-900",
  }

  return (
    <div className={`rounded-3xl border p-6 transition-all hover:shadow-lg hover:-translate-y-1 bg-white ${colorMap[color] || colorMap.blue}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
            {value}
          </p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100/50">
          {icon}
        </div>
      </div>
    </div>
  )
}

function OverviewCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="border border-gray-100 hover:border-gray-200 bg-gray-50/30 hover:bg-white rounded-2xl p-5 text-center transition-all hover:shadow-md group">
      <div className="mx-auto w-14 h-14 bg-white border border-gray-100 group-hover:scale-105 transition-transform rounded-2xl flex items-center justify-center mb-3 shadow-sm">
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
    </div>
  )
}