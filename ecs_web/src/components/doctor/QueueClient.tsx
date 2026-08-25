"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Calendar,
  Clock,
  Phone,
  FileText,
  CheckCircle,
  CheckCircle2,
  Check,
  ClipboardCheck,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Users,
  Activity,
  CalendarDays,
  Pill,
  Sparkles,
  Microscope,
} from "lucide-react"
import { queueService } from "@/services/queue.service"
import { queueCompleteService } from "@/services/queue-complete.service"
import { medicalRecordsService } from "@/services/medical-records.service"
import type { QueueListResponse, QueueItem } from "@/types"
import { QueueStatus } from "@/types"
import { getMessage } from "@/constants/messages"
import CompletionCheckModal from "./CompletionCheckModal"

interface QueueClientProps {
  doctorId: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  WAITING: { bg: "bg-[#00658D]/10", text: "text-[#00658D]", border: "border-[#00658D]/20", icon: "bg-[#00658D]" },
  CALLING: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: "bg-sky-500" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80", icon: "bg-amber-500" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80", icon: "bg-emerald-500" },
  NO_SHOW: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/60", icon: "bg-rose-500" },
  CANCELLED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: "bg-slate-500" },
}

export default function QueueClient({ doctorId }: QueueClientProps) {
  const t = useTranslations("doctor")
  const tQueue = useTranslations("doctor.queue")
  const tErrors = useTranslations("doctor.errors")
  const router = useRouter()
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [queueData, setQueueData] = useState<QueueListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("ALL")

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    newDate.setHours(12, 0, 0, 0)
    setSelectedDate(newDate)
  }

  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay, year, month }
  }

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(calendarDate)

  const selectDate = (day: number) => {
    const newDate = new Date(year, month, day)
    newDate.setHours(12, 0, 0, 0)
    setSelectedDate(newDate)
    setCalendarDate(newDate)
    setShowCalendar(false)
  }

  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1))
  }

  const weeks = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".calendar-dropdown")) {
        setShowCalendar(false)
      }
    }
    if (showCalendar) {
      document.addEventListener("click", handleClickOutside)
    }
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showCalendar])

  const fetchQueueData = useCallback(async (isSilentArg?: boolean | unknown) => {
    const isSilent = isSilentArg === true
    if (!isSilent) {
      setLoading(true)
      setError(null)
    }
    try {
      const response = await queueService.getQueueList({
        date: formatDate(selectedDate),
      })
      if (response.data) {
        setQueueData(response.data)
      } else if (!isSilent) {
        setError(getMessage(response.codeMessage) || tErrors("loadFailed"))
      }
    } catch (err: any) {
      if (!isSilent) {
        const errorCode = err?.response?.data?.codeMessage
        setError(getMessage(errorCode) || tErrors("loadFailed"))
      }
    } finally {
      if (!isSilent) {
        setLoading(false)
      }
      // Drop any cached per-row EMR step status when the queue is refreshed
      // so newly-completed steps are re-detected on the next poll.
      setStepStatusByRecord({})
    }
  }, [selectedDate, tErrors])

  useEffect(() => {
    fetchQueueData(false)

    // Polling every 5 seconds for real-time queue updates when receptionist confirms/checks-in
    const intervalId = setInterval(() => {
      fetchQueueData(true)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [fetchQueueData])

  // ─── Per-row EMR step detection ────────────────────────────────────
  // For each queue item that already has a medical record, fetch the full
  // detail so we can show which 6-step EMR phases are actually completed
  // (instead of falsely showing everything green as soon as a record exists).
  const [stepStatusByRecord, setStepStatusByRecord] = useState<
    Record<
      string,
      {
        isStep1Done: boolean // AI pre-diagnosis
        isStep3Done: boolean // EMR saved (always true when record exists)
        isStep4Done: boolean // Paraclinical (optional)
        isStep5Done: boolean // Medical record summary (final diagnosis + ICD-10)
        isStep6Done: boolean // Prescription / Glasses Rx
      }
    >
  >({})

  useEffect(() => {
    const items = queueData?.items ?? []
    const candidates = items.filter(
      (it) => it.hasMedicalRecord && it.medicalRecordId && !stepStatusByRecord[it.medicalRecordId],
    )
    if (candidates.length === 0) return
    let cancelled = false
    Promise.all(
      candidates.map(async (it) => {
        try {
          const res = await medicalRecordsService.getMedicalRecordById(it.medicalRecordId!)
          const detail = res?.data
          if (!detail) return null
          const isStep1Done = Boolean(detail?.formData?.aiSuggestion?.suggestedDisease)
          const isStep3Done = true
          const isStep4Done = Boolean(
            (detail?.octResults && detail.octResults.length > 0) ||
              (detail?.visualFieldTests && detail.visualFieldTests.length > 0) ||
              (detail?.ultrasoundEyes && detail.ultrasoundEyes.length > 0),
          )
          const isStep5Done = Boolean(
            detail?.diagnosisMain?.trim() ||
              detail?.formData?.chanDoanVaRaVien?.chanDoanChinh?.trim() ||
              detail?.formData?.benhAn?.chanDoanMaICD?.raVienBenhChinhTonThuong?.trim(),
          )
          const isStep6Done = Boolean(
            (detail?.prescriptions && detail.prescriptions.length > 0) ||
              (detail?.glassesPrescriptions && detail.glassesPrescriptions.length > 0) ||
              (detail?.formData?.prescription?.drugs && detail.formData.prescription.drugs.length > 0) ||
              (detail?.formData?.keDonThuoc?.danhSachThuoc && detail.formData.keDonThuoc.danhSachThuoc.length > 0) ||
              (detail?.formData?.glassesPrescription && Object.values(detail.formData.glassesPrescription).some((v: any) => v !== null && v !== undefined && String(v).trim() !== "")),
          )
          return {
            recordId: it.medicalRecordId!,
            status: { isStep1Done, isStep3Done, isStep4Done, isStep5Done, isStep6Done },
          }
        } catch {
          // If fetch fails, fall back to all-false so the badges stay neutral.
          return {
            recordId: it.medicalRecordId!,
            status: {
              isStep1Done: false,
              isStep3Done: true,
              isStep4Done: false,
              isStep5Done: false,
              isStep6Done: false,
            },
          }
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      setStepStatusByRecord((prev) => {
        const next = { ...prev }
        for (const e of entries) {
          if (e) next[e.recordId] = e.status
        }
        return next
      })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueData?.items])

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = formatDate(selectedDate) === formatDate(new Date())

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: "bg-slate-500" }
  }

  const filteredItems = queueData?.items?.filter((item) => {
    if (filter === "ALL") return item.status !== "COMPLETED"
    if (filter === "COMPLETED") return item.status === "COMPLETED"
    return item.status === filter
  }) || []

  const handleViewRecord = (item: QueueItem) => {
    if (item.hasMedicalRecord) {
      router.push(`/doctor/records/${item.medicalRecordId || item.appointmentId}`)
    }
  }

  const handleStartExamination = (item: QueueItem) => {
    // Step 1 of the 6-step EMR workflow: AI pre-diagnosis (Triage).
    // After the AI result is reviewed and a record template is chosen, the
    // flow continues into CreateMedicalRecordClient which handles Steps 2–6.
    router.push(
      `/doctor/examination/${item.appointmentId}?patientId=${item.patientId}`
    )
  }

  const [activeCompletionModal, setActiveCompletionModal] = useState<{
    recordId: string
    appointmentId: string
    patientId: string
    patientName: string
    queueId: string
  } | null>(null)

  const handleContinueExamination = (item: QueueItem) => {
    // Resume the 6-step EMR workflow where the doctor left off.
    // ExaminationClient detects that the appointment already has a MedicalRecord
    // (saved via Step 3) and forwards straight to CreateMedicalRecordClient in
    // "success hub" mode — i.e. the doctor lands on the same screen they were
    // on right after saving the medical record (showing the post-save banner
    // and the Step 4 / 5 / 6 action cards) instead of being asked to save a
    // duplicate record.
    router.push(
      `/doctor/examination/${item.appointmentId}?patientId=${item.patientId}`
    )
  }

  const handleCompleteQueue = async (item: QueueItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.hasMedicalRecord && item.medicalRecordId) {
      setActiveCompletionModal({
        recordId: item.medicalRecordId,
        appointmentId: item.appointmentId,
        patientId: item.patientId,
        patientName: item.patientName,
        queueId: item.queueId,
      })
    } else {
      if (!confirm(tQueue("confirmComplete", { name: item.patientName }))) return
      try {
        await queueCompleteService.completeQueue({ queueId: item.queueId })
        fetchQueueData()
      } catch {
        alert(tQueue("errorOccurred"))
      }
    }
  }

  const statusCounts = queueData?.items?.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  ) || {}

  const activeTotal = Object.entries(statusCounts).reduce((sum, [status, count]) => {
    return status !== "COMPLETED" ? sum + count : sum
  }, 0)

  const STATUS_LABELS: Record<string, string> = {
    WAITING: tQueue("waiting"),
    CALLING: tQueue("called"),
    IN_PROGRESS: tQueue("inProgress") || tQueue("called"),
    COMPLETED: tQueue("completed"),
    NO_SHOW: tQueue("noShow"),
    CANCELLED: tQueue("cancelled") || tQueue("noShow"),
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tQueue("listTitle")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {tQueue("patientCount", { count: queueData?.totalPatients || 0 })} • <span suppressHydrationWarning>{isToday ? tQueue("today") : selectedDate.toLocaleDateString()}</span>
            </p>
          </div>
          <button
            onClick={fetchQueueData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#00658D] text-white rounded-xl hover:bg-[#005273] transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {tQueue("refresh")}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center gap-3 max-w-3xl mx-auto">
          <button
            onClick={handlePreviousDay}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div className="bg-[#00658D] rounded-2xl px-5 py-4 text-white shadow-lg min-w-[100px]">
              <div className="text-center" suppressHydrationWarning>
                <div className="text-xs font-medium text-white/80 uppercase tracking-wider" suppressHydrationWarning>
                  {selectedDate.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="text-4xl font-bold mt-1" suppressHydrationWarning>
                  {selectedDate.getDate()}
                </div>
              </div>
            </div>
            
            <div className="text-left" suppressHydrationWarning>
              <div className="text-xl font-semibold text-gray-900" suppressHydrationWarning>
                {selectedDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {isToday ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    {tQueue("today")}
                  </span>
                ) : (
                  <span suppressHydrationWarning>{selectedDate.toLocaleDateString(undefined, { weekday: "long" })}</span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleNextDay}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#00658D]/50 transition-all shadow-sm"
            >
              <CalendarDays className="w-5 h-5 text-[#00658D]" />
              <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>
                {selectedDate.toLocaleDateString()}
              </span>
            </button>

            {showCalendar && (
              <div className="calendar-dropdown absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-[340px]">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-base font-semibold text-gray-900" suppressHydrationWarning>
                    {calendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weeks.map((week) => (
                    <div key={week} className="text-center text-xs font-medium text-gray-400 py-2">
                      {week}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: startingDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-11 h-11" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(year, month, day)
                    const isSelected = formatDate(date) === formatDate(selectedDate)
                    const isTodayDate = formatDate(date) === formatDate(new Date())
                    return (
                      <button
                        key={day}
                        onClick={() => selectDate(day)}
                        className={`w-11 h-11 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-[#00658D] text-white shadow-md"
                            : isTodayDate
                            ? "bg-[#00658D]/10 text-[#00658D] hover:bg-[#00658D]/20"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleToday()
                      setCalendarDate(new Date())
                    }}
                    className="w-full py-2 text-sm font-medium text-[#00658D] hover:bg-[#00658D]/10 rounded-lg transition-colors"
                  >
                    {tQueue("today")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "ALL"
                ? "bg-[#00658D] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
            }`}
          >
            {tQueue("all")} ({activeTotal})
          </button>
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = statusCounts[status] || 0
            if (count === 0 && filter !== status) return null
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-[#00658D] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00658D]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium">{error}</p>
            <button
              onClick={fetchQueueData}
              className="mt-4 px-4 py-2 bg-[#00658D] text-white rounded-lg hover:bg-[#005273] transition-colors"
            >
              {tQueue("refresh")}
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium">
              {filter === "ALL" 
                ? tQueue("noWaitingPatients") 
                : filter === "COMPLETED"
                ? tQueue("noCompletedPatients")
                : tQueue("noPatientsStatus")}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === "ALL" 
                ? tQueue("emptyQueue") 
                : tQueue("tryOtherFilter")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const statusColor = getStatusColor(item.status)
              return (
                <div
                  key={item.queueId}
                  className="bg-white rounded-2xl p-4.5 border border-slate-200/80 hover:border-[#00658D]/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#00658D] text-white flex flex-col items-center justify-center shadow-xs">
                        <span className="text-[11px] font-medium text-white/80 leading-none mb-px">STT</span>
                        <span className="text-lg font-bold leading-none">{item.queueNumber}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.patientName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                        >
                          {item.statusText || STATUS_LABELS[item.status] || item.status}
                        </span>
                        {item.hasMedicalRecord && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {tQueue("hasMedicalRecord")}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600">
                        {item.patientPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{item.patientPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span suppressHydrationWarning>{new Date(item.appointmentTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {item.symptoms && (
                          <div className="flex items-center gap-2 col-span-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{item.symptoms}</span>
                          </div>
                        )}
                        {item.roomName && (
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span>{item.roomName}</span>
                          </div>
                        )}
                        {item.serviceName && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{item.serviceName}</span>
                          </div>
                        )}
                      </div>

                      {item.completedAt && (
                        <p className="mt-2 text-xs text-emerald-700 font-medium" suppressHydrationWarning>
                          {tQueue("completedAt", { time: new Date(item.completedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) })}
                        </p>
                      )}

                      {/* Step status badges — harmonized emerald (done) and slate (pending) */}
                      {item.hasMedicalRecord && (() => {
                        const status = stepStatusByRecord[item.medicalRecordId || ""]
                        const isStep1Done = status?.isStep1Done ?? false
                        const isStep3Done = status?.isStep3Done ?? true
                        const isStep4Done = status?.isStep4Done ?? false
                        const isStep5Done = status?.isStep5Done ?? false
                        const isStep6Done = status?.isStep6Done ?? false
                        const allMandatoryDone =
                          isStep1Done && isStep3Done && isStep5Done && isStep6Done

                        const renderBadge = (
                          num: number,
                          done: boolean,
                          Icon: typeof Sparkles,
                          label: string,
                          titleDone: string,
                          titlePending: string,
                        ) => (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                              done
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                            title={done ? titleDone : titlePending}
                          >
                            <Icon className="w-3 h-3" /> Bước {num}: {label}
                          </span>
                        )

                        return (
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                            {renderBadge(
                              1, isStep1Done,
                              Sparkles,
                              "AI sơ bộ",
                              "Bước 1: AI chẩn đoán sơ bộ — đã hoàn thành",
                              "Bước 1: AI chẩn đoán sơ bộ — CHƯA chạy",
                            )}
                            {renderBadge(
                              3, isStep3Done,
                              CheckCircle,
                              "HS khám bệnh",
                              "Bước 3: Hồ sơ khám bệnh đã được lưu",
                              "Bước 3: Hồ sơ khám bệnh chưa lưu",
                            )}
                            {renderBadge(
                              4, isStep4Done,
                              Microscope,
                              "Cận lâm sàng",
                              "Bước 4: Cận lâm sàng (OCT / Thị trường / Siêu âm) — đã có kết quả",
                              "Bước 4: Cận lâm sàng — tùy chọn, chưa có kết quả",
                            )}
                            {renderBadge(
                              5, isStep5Done,
                              FileText,
                              "Tổng kết",
                              "Bước 5: Tổng kết bệnh án (Chẩn đoán + ICD-10) — đã hoàn thành",
                              "Bước 5: Tổng kết bệnh án (Chẩn đoán + ICD-10) — BẮT BUỘC, chưa làm",
                            )}
                            {renderBadge(
                              6, isStep6Done,
                              Pill,
                              "Kê đơn",
                              "Bước 6: Kê đơn thuốc/kính — đã hoàn thành",
                              "Bước 6: Kê đơn thuốc/kính — BẮT BUỘC, chưa làm",
                            )}
                            <span
                              className={`text-[10px] italic inline-flex items-center gap-1 ${allMandatoryDone ? "text-emerald-700 font-semibold" : "text-slate-500"}`}
                            >
                              {allMandatoryDone ? (
                                <>
                                  — Đủ điều kiện hoàn thành ca khám <CheckCircle2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
                                </>
                              ) : (
                                "— Ca khám chưa hoàn thành, bác sĩ cần làm tiếp các bước chưa xong"
                              )}
                            </span>
                          </div>
                        )
                      })()}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.hasMedicalRecord && (
                          <button
                            onClick={() => handleViewRecord(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-2xs"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            {tQueue("viewRecord")}
                          </button>
                        )}

                        {item.status === QueueStatus.WAITING || item.status === QueueStatus.CALLING ? (
                          !item.hasMedicalRecord && (
                            <button
                              onClick={() => handleStartExamination(item)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-[#00658D] text-white rounded-xl hover:bg-[#005273] transition-colors font-medium shadow-xs"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {tQueue("startExam")}
                            </button>
                          )
                        ) : item.status === QueueStatus.IN_PROGRESS ? (
                          <>
                            <button
                              onClick={() => handleContinueExamination(item)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-[#00658D] text-white rounded-xl hover:bg-[#005273] transition-colors font-medium shadow-xs"
                            >
                              <Activity className="w-4 h-4" />
                              {tQueue("continueExam")}
                            </button>
                            {item.hasMedicalRecord && (
                              <CompletionCheckButton
                                item={item}
                                stepStatusByRecord={stepStatusByRecord}
                                tQueue={tQueue}
                                onComplete={handleCompleteQueue}
                              />
                            )}
                          </>
                        ) : null}

                        {item.status === QueueStatus.WAITING && item.hasMedicalRecord && (
                          <CompletionCheckButton
                            item={item}
                            stepStatusByRecord={stepStatusByRecord}
                            tQueue={tQueue}
                            onComplete={handleCompleteQueue}
                          />
                        )}

                        {item.status === QueueStatus.CALLING && (
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-medium"
                          >
                            <XCircle className="w-4 h-4 text-rose-500" />
                            {tQueue("noShow")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {activeCompletionModal && (
        <CompletionCheckModal
          isOpen={Boolean(activeCompletionModal)}
          onClose={() => setActiveCompletionModal(null)}
          recordId={activeCompletionModal.recordId}
          appointmentId={activeCompletionModal.appointmentId}
          patientId={activeCompletionModal.patientId}
          patientName={activeCompletionModal.patientName}
          queueId={activeCompletionModal.queueId}
          onCompleted={() => fetchQueueData()}
        />
      )}
    </div>
  )
}

/**
 * CompletionCheckButton
 *
 * Wraps the "Complete Exam" button on each queue row. The button is enabled
 * ONLY when the medical record has both:
 *   - Step 5 done: Medical record summary (final diagnosis + ICD-10)
 *   - Step 6 done: Prescription / Glasses Rx
 *
 * Until both are done, the button is disabled and shows a tooltip explaining
 * why. Defense-in-depth: even if the disabled state is bypassed, the actual
 * completion flow is blocked by CompleteQueueService on the backend, which
 * re-validates the form JSON envelope.
 *
 * While the record detail is still being fetched (stepStatusByRecord entry
 * is missing), the button is treated as disabled to avoid a premature
 * green state during the loading window.
 */
interface CompletionCheckButtonProps {
  item: QueueItem
  stepStatusByRecord: Record<
    string,
    {
      isStep1Done: boolean
      isStep3Done: boolean
      isStep4Done: boolean
      isStep5Done: boolean
      isStep6Done: boolean
    }
  >
  tQueue: (key: string) => string
  onComplete: (item: QueueItem, e: React.MouseEvent) => void
}

function CompletionCheckButton({
  item,
  stepStatusByRecord,
  tQueue,
  onComplete,
}: CompletionCheckButtonProps) {
  const stepStatus = item.medicalRecordId
    ? stepStatusByRecord[item.medicalRecordId]
    : undefined
  const isReady = Boolean(stepStatus?.isStep5Done && stepStatus?.isStep6Done)
  const isLoading = item.hasMedicalRecord && !stepStatus
  const isLocked = !isReady
  const tooltip = tQueue("completeExamLockedTooltip")

  return (
    <button
      type="button"
      onClick={(e) => {
        if (isLocked) return
        onComplete(item, e)
      }}
      disabled={isLocked}
      title={isLocked ? tooltip : tQueue("completeExam")}
      aria-disabled={isLocked}
      data-loading={isLoading || undefined}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-xl transition-colors font-medium ${
        isLocked
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
      }`}
    >
      <ClipboardCheck className="w-4 h-4" />
      {tQueue("completeExam")}
    </button>
  )
}
