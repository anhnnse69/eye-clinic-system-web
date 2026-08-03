"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    User,
    Stethoscope,
    Building2,
    MapPin,
    AlertCircle,
    CalendarX,
    CheckCircle,
    Clock as ClockIcon,
    CalendarCheck,
    CalendarX as CalendarXIcon,
    Loader2,
    RotateCcw,
    XCircle,
    Eye,
    Star,
    Pill
} from "lucide-react"

import { useLocale } from "next-intl"
import { appointmentHistoryService } from "@/services"
import type { GetAppointmentHistoryResponse } from "@/services/appointment-history.service"
import type { MetaResponse } from "@/types"
import { ApiError } from "@/lib/axios"
import SubmitFeedback from "@/components/submit-feedback/SubmitFeedback"

const CANCELLABLE_STATUSES = new Set(["PENDING"])

export default function AppointmentHistoryPage() {
    const localeFromHook = useLocale()
    const router = useRouter()
    const params = useParams()

    const [currentLocale, setCurrentLocale] = useState<"vi" | "en">(() => {
        if (typeof window !== "undefined") {
            const match = window.location.pathname.match(/^\/(vi|en)(\/|$)/)
            if (match) return match[1] as "vi" | "en"
            const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)
            if (cookieMatch && (cookieMatch[1] === "vi" || cookieMatch[1] === "en")) {
                return cookieMatch[1] as "vi" | "en"
            }
            const stored = localStorage.getItem("locale")
            if (stored === "vi" || stored === "en") return stored
        }
        const pLoc = params?.locale as string
        if (pLoc === "en" || pLoc === "vi") return pLoc
        return localeFromHook === "en" ? "en" : "vi"
    })

    useEffect(() => {
        const handleLocaleChanged = (e: any) => {
            if (e?.detail?.locale === "vi" || e?.detail?.locale === "en") {
                setCurrentLocale(e.detail.locale)
            }
        }
        window.addEventListener("ecs-locale-changed", handleLocaleChanged)
        return () => window.removeEventListener("ecs-locale-changed", handleLocaleChanged)
    }, [])

    const locale = currentLocale
    const t = (vi: string, en: string) => (locale === "en" ? en : vi)

    const STATUS_OPTIONS = [
        { value: "", label: t("Tất cả", "All"), icon: Calendar, color: "text-gray-600", bgColor: "bg-gray-100", activeClass: "bg-gray-900 text-white border-gray-900" },
        { value: "PENDING", label: t("Chờ xác nhận", "Pending"), icon: ClockIcon, color: "text-amber-600", bgColor: "bg-amber-50", activeClass: "bg-amber-600 text-white border-amber-600" },
        { value: "BOOKED", label: t("Đã xác nhận", "Confirmed"), icon: CalendarCheck, color: "text-blue-600", bgColor: "bg-blue-50", activeClass: "bg-blue-600 text-white border-blue-600" },
        { value: "COMPLETED", label: t("Đã khám xong", "Completed"), icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50", activeClass: "bg-emerald-600 text-white border-emerald-600" },
        { value: "CANCELLED", label: t("Đã hủy lịch", "Cancelled"), icon: CalendarXIcon, color: "text-rose-600", bgColor: "bg-rose-50", activeClass: "bg-rose-600 text-white border-rose-600" },
    ]

    const [appointments, setAppointments] = useState<GetAppointmentHistoryResponse[]>([])
    const [metadata, setMetadata] = useState<MetaResponse | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    const [selectedStatus, setSelectedStatus] = useState("")

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(10)

    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState("")

    const [cancelError, setCancelError] = useState<string | null>(null)
    const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setPageNumber(1)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status)
        setPageNumber(1)
    }

    const clearAllFilters = () => {
        setSelectedStatus("")
        setSearchTerm("")
        setDebouncedSearchTerm("")
        setPageNumber(1)
    }

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await appointmentHistoryService.getAll({
                searchTerm: debouncedSearchTerm,
                status: selectedStatus || undefined,
                pageNumber,
                pageSize,
            })

            setAppointments(response.data || [])

            if (response.meta) {
                setMetadata(response.meta)
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.codeMessage || t("Không thể tải lịch sử cuộc hẹn của bạn", "Failed to load your appointment history"))
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    t("Không thể tải lịch sử cuộc hẹn của bạn", "Failed to load your appointment history")
                )
            }
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm, selectedStatus, pageNumber, pageSize])

    useEffect(() => {
        loadAppointments()
    }, [loadAppointments])

    const handleCancelAppointment = async () => {
        if (!selectedAppointmentId) return

        try {
            setCancellingId(selectedAppointmentId)
            setCancelError(null)

            const response = await appointmentHistoryService.cancelAppointment({
                appointmentId: selectedAppointmentId,
                reason: cancelReason || "Khách hàng hủy lịch hẹn"
            })

            if (response.data) {
                setShowCancelModal(false)
                setSelectedAppointmentId(null)
                setCancelReason("")
                await loadAppointments()
            } else {
                setCancelError("Không thể hủy lịch hẹn. Vui lòng thử lại.")
            }
        } catch (err: any) {
            let errorMessage = "Không thể hủy lịch hẹn. Vui lòng thử lại."

            if (err instanceof ApiError) {
                switch (err.codeMessage) {
                    case "APP_MESSAGE_4046":
                        errorMessage = "Không tìm thấy lịch hẹn"
                        break
                    case "APP_MESSAGE_4047":
                        errorMessage = "Lịch hẹn đã được hủy trước đó"
                        break
                    case "APP_MESSAGE_4048":
                        errorMessage = "Không thể hủy lịch hẹn đã hoàn thành"
                        break
                    case "APP_MESSAGE_4049":
                        errorMessage = "Không thể hủy lịch hẹn đang trong quá trình khám"
                        break
                    case "APP_MESSAGE_4050":
                        errorMessage = "Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ khám"
                        break
                    case "APP_MESSAGE_4051":
                        errorMessage = "Lịch hẹn không thể hủy ở trạng thái hiện tại"
                        break
                    case "APP_MESSAGE_4053":
                        errorMessage = "Bạn không có quyền hủy lịch hẹn này"
                        break
                    case "APP_MESSAGE_4001":
                        errorMessage = "Vui lòng đăng nhập để thực hiện chức năng này"
                        break
                    default:
                        errorMessage = err.codeMessage || "Không thể hủy lịch hẹn. Vui lòng thử lại."
                }
            } else {
                errorMessage = err?.response?.data?.message || err?.message || "Không thể hủy lịch hẹn. Vui lòng thử lại."
            }

            setCancelError(errorMessage)
        } finally {
            setCancellingId(null)
        }
    }

    const openCancelModal = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId)
        setShowCancelModal(true)
        setCancelReason("")
        setCancelError(null)
    }

    const closeCancelModal = () => {
        setShowCancelModal(false)
        setSelectedAppointmentId(null)
        setCancelReason("")
        setCancelError(null)
    }

    const canCancelAppointment = (item: GetAppointmentHistoryResponse) => {
        if (!CANCELLABLE_STATUSES.has(item.status.toUpperCase())) {
            return false
        }

        try {
            const dateParts = item.appointmentDate.split('/')
            const timeParts = item.timeSlot.split(' - ')[0].split(':')

            const appointmentDateTime = new Date(
                parseInt(dateParts[2]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[0]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1])
            )

            const now = new Date()
            const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

            return hoursUntilAppointment > 24
        } catch (error) {
            console.error('Error parsing appointment date:', error)
            return false
        }
    }

    const getCancelUnavailableText = (status: string) => {
        switch (status.toUpperCase()) {
            case "CANCELLED": return "Đã hủy"
            case "COMPLETED": return "Đã hoàn thành"
            case "IN_PROGRESS": return "Đang khám"
            case "BOOKED": return "Đã xác nhận, không thể hủy"
            default: return "Không thể hủy"
        }
    }

    // Các appointment khác (IN_PROGRESS, PENDING, ...) sẽ không hiện nút
    // "Xem đơn thuốc" — chỉ cho phép mở chi tiết khi đã hoàn tất khám.
    const canViewDetail = (status: string) => {
        return status.toUpperCase() === "COMPLETED"
    }

    const canRateAppointment = (item: GetAppointmentHistoryResponse) => {
        return item.status.toUpperCase() === "COMPLETED" && !item.hasFeedback
    }

    const selectedStatusInfo = STATUS_OPTIONS.find(opt => opt.value === selectedStatus)

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto antialiased">
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{t("Xác nhận hủy lịch hẹn", "Confirm Appointment Cancellation")}</h3>
                                <p className="text-sm text-gray-500">{t("Bạn có chắc chắn muốn hủy lịch hẹn này?", "Are you sure you want to cancel this appointment?")}</p>
                            </div>
                        </div>

                        {cancelError && (
                            <div className="flex items-center gap-3 p-3 mb-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/50">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span className="font-medium">{cancelError}</span>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("Lý do hủy (tùy chọn)", "Cancellation reason (optional)")}
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder={t("Nhập lý do hủy lịch...", "Enter cancellation reason...")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeCancelModal}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                {t("Quay lại", "Back")}
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                disabled={cancellingId === selectedAppointmentId}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {cancellingId === selectedAppointmentId ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("Đang xử lý...", "Processing...")}
                                    </>
                                ) : (
                                    t("Xác nhận hủy", "Confirm Cancellation")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {t("Lịch sử cuộc hẹn", "Appointment History")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("Theo dõi lịch trình khám bệnh và quản lý thông tin các ca hẹn tại các cơ sở phòng khám", "Track your medical appointment schedule and manage appointment details at clinics")}
                    </p>
                </div>

                {!loading && metadata && (
                    <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/60 w-fit">
                        {t("Tổng số:", "Total:")} <span className="font-semibold text-gray-900">{metadata.total || appointments.length}</span> {t("cuộc hẹn", "appointments")}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                    <div className="flex-1 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 flex items-center">
                        <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("Tìm kiếm cơ sở, tên bác sĩ hoặc bệnh nhân...", "Search by clinic, doctor or patient name...")}
                            className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("")
                                    setDebouncedSearchTerm("")
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {(selectedStatus || searchTerm) && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>{t("Xóa bộ lọc", "Clear Filters")}</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                    <div className="flex items-center gap-2 min-w-max">
                        {STATUS_OPTIONS.map((option) => {
                            const Icon = option.icon
                            const isActive = selectedStatus === option.value

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                                        ${isActive
                                            ? option.activeClass + " shadow-sm font-semibold scale-[1.02]"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : option.color}`} />
                                    <span>{option.label}</span>

                                    {isActive && metadata && (
                                        <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white">
                                            {metadata.total}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/50">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600 min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold">
                                <th className="px-6 py-4 text-left font-semibold">{t("Cơ sở Phòng khám", "Clinic Facility")}</th>
                                <th className="px-6 py-4 text-left font-semibold">{t("Bệnh nhân", "Patient")}</th>
                                <th className="px-6 py-4 text-left font-semibold">{t("Bác sĩ phụ trách", "Attending Doctor")}</th>
                                <th className="px-6 py-4 text-left font-semibold">{t("Dịch vụ", "Service")}</th>
                                <th className="px-6 py-4 text-left font-semibold">{t("Thời gian khám", "Appointment Time")}</th>
                                <th className="px-6 py-4 text-center font-semibold">{t("Hành động", "Actions")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                                <span className="text-gray-400 font-medium">{t("Đang tải dữ liệu...", "Loading data...")}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                appointments.map((item) => {
                                    const isCancelling = cancellingId === item.id_appointment
                                    const canCancel = canCancelAppointment(item)
                                    const showDetail = canViewDetail(item.status)

                                    return (
                                        <tr
                                            key={item.id_appointment}
                                            className="hover:bg-gray-50/60 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 max-w-[280px]">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-start gap-2 font-semibold text-gray-900 leading-tight">
                                                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <span>{item.clinicName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 pl-6 line-clamp-1">
                                                        <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                                                        <span>{item.clinicAddress}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 font-medium text-gray-900">
                                                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    {item.patientName}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                    <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                                                    {item.doctorName}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{item.serviceName}</span>
                                                    <span className="text-xs text-blue-600 font-semibold mt-0.5">{item.servicePrice}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-gray-600">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{item.appointmentDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-mono">{item.timeSlot}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center gap-2 flex-wrap">
                                                    {showDetail && (
                                                        <button
                                                            onClick={() => {
                                                                router.push(`/${locale}/patient/appointment-detail?id=${item.id_appointment}`)
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                                        >
                                                            <Pill className="w-3.5 h-3.5" />
                                                            {t("Xem đơn thuốc", "View Prescription")}
                                                        </button>
                                                    )}
                                                    {canRateAppointment(item) && (
                                                        <button
                                                            onClick={() => setShowFeedbackFor(item.id_appointment)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-600 bg-amber-50/70 rounded-lg hover:bg-amber-100 hover:text-amber-700 transition-colors whitespace-nowrap"
                                                        >
                                                            <Star className="w-3.5 h-3.5" />
                                                            {t("Đánh giá", "Review")}
                                                        </button>
                                                    )}
                                                    {!showDetail && !canRateAppointment(item) && canCancel && (
                                                        <button
                                                            onClick={() => openCancelModal(item.id_appointment)}
                                                            disabled={isCancelling}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-rose-600 bg-rose-50/70 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                        >
                                                            {isCancelling ? (
                                                                <>
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    {t("Đang hủy...", "Cancelling...")}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                    {t("Hủy lịch", "Cancel Appointment")}
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    {!showDetail && !canRateAppointment(item) && !canCancel && (
                                                        <span className="text-xs text-gray-400 italic">
                                                            {getCancelUnavailableText(item.status)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && appointments.length === 0 && (
                    <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                            <CalendarX className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {selectedStatus ? t("Không tìm thấy cuộc hẹn", "No appointments found") : t("Lịch sử trống", "No appointment history")}
                        </h3>
                        <p className="text-sm text-gray-400 max-w-3xl mb-4">
                            {selectedStatus
                                ? t(`Không có cuộc hẹn nào ở trạng thái "${selectedStatusInfo?.label}".`, `No appointments with status "${selectedStatusInfo?.label}".`)
                                : t("Bạn chưa có dữ liệu cuộc hẹn nào được ghi nhận trên hệ thống.", "You have no recorded appointments in the system yet.")}
                        </p>
                        {selectedStatus && (
                            <button
                                onClick={() => handleStatusChange("")}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                {t("Xem tất cả cuộc hẹn", "View all appointments")}
                            </button>
                        )}
                    </div>
                )}

                {metadata && metadata.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            {t("Trang", "Page")} <span className="text-gray-900 font-semibold">{metadata.page}</span> {t("trên", "of")} <span className="text-gray-900 font-semibold">{metadata.totalPages}</span>
                            <span className="ml-2 text-gray-400">
                                ({metadata.total || appointments.length} {t("cuộc hẹn", "appointments")})
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={!metadata.hasPrevious}
                                onClick={() => setPageNumber((p) => p - 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>

                            <button
                                disabled={!metadata.hasNext}
                                onClick={() => setPageNumber((p) => p + 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Submit Feedback Modal */}
            {showFeedbackFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
                        {(() => {
                            const appointment = appointments.find(a => a.id_appointment === showFeedbackFor)
                            if (!appointment) return null
                            return (
                                <SubmitFeedback
                                    appointmentId={appointment.id_appointment}
                                    appointmentDate={appointment.appointmentDate}
                                    clinicName={appointment.clinicName}
                                    doctorName={appointment.doctorName}
                                    serviceName={appointment.serviceName}
                                    onSuccess={() => {
                                        setShowFeedbackFor(null)
                                        loadAppointments()
                                    }}
                                    onCancel={() => setShowFeedbackFor(null)}
                                />
                            )
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}