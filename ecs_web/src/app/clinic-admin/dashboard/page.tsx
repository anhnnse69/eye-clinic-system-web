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
        setError(tDashboard("exportFailed"))
        return
      }

      generateClinicReportExcel(response.data, locale)
      setExportSuccess(tDashboard("exportSuccess"))
      setTimeout(() => setExportSuccess(null), 4000)
    } catch (err: any) {
      setError(
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
      <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-64 bg-surface-container-low rounded-xl" />
          <div className="h-4 w-48 bg-surface-container-low rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-surface-container-low rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center bg-background">
        <div className="text-error text-lg font-medium">{error}</div>
        <button
          onClick={loadDashboard}
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition shadow-xs cursor-pointer"
        >
          {tCommon("loading")}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">{tDashboard("title")}</h1>
          <p className="text-on-surface-variant mt-1 text-sm sm:text-base">{tDashboard("subtitle")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {exportSuccess && (
            <span className="text-sm font-semibold text-[#003925] bg-[#6ffbbe]/25 px-3 py-1.5 rounded-xl border border-[#4edea3]/60 animate-fade-in">
              {exportSuccess}
            </span>
          )}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006c49] text-white font-semibold text-sm rounded-xl hover:bg-[#005237] active:scale-95 disabled:opacity-50 transition shadow-xs cursor-pointer"
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
          icon={<Calendar className="w-6 h-6 text-primary" />}
          iconBg="bg-[#c6e7ff]/40 border-[#81cfff]/40"
        />
        <DashboardCard
          title={tDashboard("completed")}
          value={dashboard?.completedAppointments ?? 0}
          icon={<CheckCircle className="w-6 h-6 text-[#006c49]" />}
          iconBg="bg-[#6ffbbe]/25 border-[#4edea3]/60"
        />
        <DashboardCard
          title={tDashboard("todayRevenue")}
          value={formatCurrency(dashboard?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
          iconBg="bg-[#c6e7ff]/40 border-[#81cfff]/40"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-on-surface" />
          <h2 className="text-xl font-bold text-on-surface">{tDashboard("overview")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <OverviewCard
            title={tDashboard("staff")}
            value={dashboard?.totalStaffs ?? 0}
            icon={<Users className="w-7 h-7 text-primary" />}
          />
          <OverviewCard
            title={tDashboard("services")}
            value={dashboard?.totalServices ?? 0}
            icon={<Briefcase className="w-7 h-7 text-primary" />}
          />
          <OverviewCard
            title={tDashboard("rooms")}
            value={dashboard?.totalRooms ?? 0}
            icon={<DoorOpen className="w-7 h-7 text-primary" />}
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-on-surface" />
          <h2 className="text-xl font-bold text-on-surface">{tDashboard("weeklyStats")}</h2>
        </div>

        <div className="space-y-3.5">
          {dashboard?.weeklyStatistics && dashboard.weeklyStatistics.length > 0 ? (
            dashboard.weeklyStatistics.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-low/80 border border-outline-variant/30 rounded-2xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-xs border border-outline-variant/60 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm sm:text-base">{item.date}</p>
                    <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                      {item.appointments} {tDashboard("appointments")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-[#006c49] tracking-tight">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("revenue")}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-on-surface-variant/50 text-sm">{tDashboard("noWeeklyData")}</div>
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
  iconBg = "bg-[#c6e7ff]/40 border-[#81cfff]/40",
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  iconBg?: string
}) {
  return (
    <div className="rounded-3xl border border-outline-variant/40 p-6 transition-all hover:shadow-md hover:-translate-y-0.5 bg-surface-container-lowest shadow-xs">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-on-surface-variant text-xs font-bold tracking-wider uppercase">{title}</p>
          <p className="text-3xl font-black text-on-surface mt-2 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-2xl shadow-xs border ${iconBg}`}>
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
    <div className="border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-lowest rounded-2xl p-5 text-center transition-all hover:shadow-xs group">
      <div className="mx-auto w-14 h-14 bg-surface-container-lowest border border-outline-variant/60 group-hover:scale-105 transition-transform rounded-2xl flex items-center justify-center mb-3 shadow-xs">
        {icon}
      </div>
      <p className="text-2xl font-bold text-on-surface mb-0.5">{value}</p>
      <p className="text-on-surface-variant text-sm font-semibold">{title}</p>
    </div>
  )
}