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
} from "lucide-react"
import { queueService } from "@/services/queue.service"
import { queueCompleteService } from "@/services/queue-complete.service"
import type { QueueListResponse, QueueItem } from "@/types"
import { QueueStatus } from "@/types"
import { getMessage } from "@/constants/messages"

interface QueueClientProps {
  doctorId: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  WAITING: { bg: "bg-blue-100", text: "text-blue-700", icon: "bg-blue-500" },
  CALLING: { bg: "bg-purple-100", text: "text-purple-700", icon: "bg-purple-500" },
  IN_PROGRESS: { bg: "bg-amber-100", text: "text-amber-700", icon: "bg-amber-500" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", icon: "bg-green-500" },
  NO_SHOW: { bg: "bg-red-100", text: "text-red-700", icon: "bg-red-500" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-700", icon: "bg-gray-500" },
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
    return STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: "bg-gray-500" }
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
    if (item.hasMedicalRecord) {
      router.push(`/doctor/records/${item.medicalRecordId || item.appointmentId}`)
    } else {
      router.push(
        `/doctor/records/create?appointmentId=${item.appointmentId}&patientId=${item.patientId}`
      )
    }
  }

  const handleContinueExamination = (item: QueueItem) => {
    router.push(
      `/doctor/records/create?appointmentId=${item.appointmentId}&patientId=${item.patientId}&continue=true`
    )
  }

  const handleCompleteQueue = async (item: QueueItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(tQueue("confirmComplete", { name: item.patientName }))) return
    try {
      await queueCompleteService.completeQueue({ queueId: item.queueId })
      fetchQueueData()
    } catch {
      alert(tQueue("errorOccurred"))
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
    <div className="min-h-screen bg-gray-50">
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-sm"
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
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl px-5 py-4 text-white shadow-lg min-w-[100px]">
              <div className="text-center" suppressHydrationWarning>
                <div className="text-xs font-medium text-blue-100 uppercase tracking-wider" suppressHydrationWarning>
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
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
              className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm"
            >
              <CalendarDays className="w-5 h-5 text-blue-500" />
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
                            ? "bg-blue-500 text-white shadow-md"
                            : isTodayDate
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
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
                    className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
        <div className="flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === "ALL"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium">{error}</p>
            <button
              onClick={fetchQueueData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex flex-col items-center justify-center shadow-md">
                        <span className="text-[11px] font-medium text-blue-100 leading-none mb-px">STT</span>
                        <span className="text-lg font-bold leading-none">{item.queueNumber}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.patientName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {item.statusText || STATUS_LABELS[item.status] || item.status}
                        </span>
                        {item.hasMedicalRecord && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
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
                        <p className="mt-2 text-xs text-green-600 font-medium" suppressHydrationWarning>
                          {tQueue("completedAt", { time: new Date(item.completedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) })}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.hasMedicalRecord && (
                          <button
                            onClick={() => handleViewRecord(item)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            {tQueue("viewRecord")}
                          </button>
                        )}

                        {item.status === QueueStatus.WAITING || item.status === QueueStatus.CALLING ? (
                          !item.hasMedicalRecord && (
                            <button
                              onClick={() => handleStartExamination(item)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {tQueue("startExam")}
                            </button>
                          )
                        ) : item.status === QueueStatus.IN_PROGRESS ? (
                          <>
                            <button
                              onClick={() => handleContinueExamination(item)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                              <Activity className="w-4 h-4" />
                              {tQueue("continueExam")}
                            </button>
                            {item.hasMedicalRecord && (
                              <button
                                onClick={(e) => handleCompleteQueue(item, e)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                {tQueue("completeExam")}
                              </button>
                            )}
                          </>
                        ) : null}

                        {item.status === QueueStatus.WAITING && item.hasMedicalRecord && (
                          <button
                            onClick={(e) => handleCompleteQueue(item, e)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            {tQueue("completeExam")}
                          </button>
                        )}

                        {item.status === QueueStatus.CALLING && (
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
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
    </div>
  )
}
