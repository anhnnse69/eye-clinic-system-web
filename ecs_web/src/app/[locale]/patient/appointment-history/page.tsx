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
} from "lucide-react"

import { appointmentHistoryService } from "@/services"
import type { GetAppointmentHistoryResponse } from "@/services/appointment-history.service"
import type { MetaResponse } from "@/types"

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả", icon: Calendar, color: "text-gray-600", bgColor: "bg-gray-100", activeClass: "bg-gray-900 text-white border-gray-900" },
    { value: "PENDING", label: "Chờ xác nhận", icon: ClockIcon, color: "text-amber-600", bgColor: "bg-amber-50", activeClass: "bg-amber-600 text-white border-amber-600" },
    { value: "CONFIRMED", label: "Đã xác nhận", icon: CalendarCheck, color: "text-blue-600", bgColor: "bg-blue-50", activeClass: "bg-blue-600 text-white border-blue-600" },
    { value: "COMPLETED", label: "Đã khám xong", icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50", activeClass: "bg-emerald-600 text-white border-emerald-600" },
    { value: "CANCELLED", label: "Đã hủy lịch", icon: CalendarXIcon, color: "text-rose-600", bgColor: "bg-rose-50", activeClass: "bg-rose-600 text-white border-rose-600" },
]

export default function AppointmentHistoryPage() {
    const [appointments, setAppointments] = useState<GetAppointmentHistoryResponse[]>([])
    const [metadata, setMetadata] = useState<MetaResponse | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    const [selectedStatus, setSelectedStatus] = useState("")

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(10)

    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || ""

    const handleViewDetail = (appointmentId: string) => {
        const path = `/patient/appointment-history/detail?id=${appointmentId}`
        router.push(locale ? `/${locale}${path}` : path)
    }

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
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải lịch sử cuộc hẹn của bạn"
            )
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm, selectedStatus, pageNumber, pageSize])

    useEffect(() => {
        loadAppointments()
    }, [loadAppointments])

    const getStatusStyle = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "bg-amber-50 text-amber-700 border border-amber-100"
            case "CONFIRMED":
                return "bg-blue-50 text-blue-700 border border-blue-100"
            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100"
            case "CANCELLED":
                return "bg-rose-50 text-rose-700 border border-rose-100"
            default:
                return "bg-gray-50 text-gray-700 border border-gray-100"
        }
    }

    const getStatusText = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING": return "Chờ xác nhận"
            case "CONFIRMED": return "Đã xác nhận"
            case "COMPLETED": return "Đã khám xong"
            case "CANCELLED": return "Đã hủy lịch"
            default: return status
        }
    }

    const selectedStatusInfo = STATUS_OPTIONS.find(opt => opt.value === selectedStatus)

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto antialiased">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Lịch sử cuộc hẹn
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Theo dõi lịch trình khám bệnh và quản lý thông tin các ca hẹn tại các cơ sở phòng khám
                    </p>
                </div>

                {!loading && metadata && (
                    <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/60 w-fit">
                        Tổng số: <span className="font-semibold text-gray-900">{metadata.total || appointments.length}</span> cuộc hẹn
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
                            placeholder="Tìm kiếm cơ sở, tên bác sĩ hoặc bệnh nhân..."
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
                            <span>Xóa bộ lọc</span>
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
                                <th className="px-6 py-4 text-left font-semibold">Cơ sở Phòng khám</th>
                                <th className="px-6 py-4 text-left font-semibold">Bệnh nhân</th>
                                <th className="px-6 py-4 text-left font-semibold">Bác sĩ phụ trách</th>
                                <th className="px-6 py-4 text-left font-semibold">Dịch vụ</th>
                                <th className="px-6 py-4 text-left font-semibold">Thời gian khám</th>
                                <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                                <span className="text-gray-400 font-medium">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                appointments.map((item) => (
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

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusStyle(item.status)}`}>
                                                {getStatusText(item.status)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(item.id_appointment)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50/70 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
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
                            {selectedStatus ? "Không tìm thấy cuộc hẹn" : "Lịch sử trống"}
                        </h3>
                        <p className="text-sm text-gray-400 max-w-3xl mb-4">
                            {selectedStatus
                                ? `Không có cuộc hẹn nào ở trạng thái "${selectedStatusInfo?.label}".`
                                : "Bạn chưa có dữ liệu cuộc hẹn nào được ghi nhận trên hệ thống."}
                        </p>
                        {selectedStatus && (
                            <button
                                onClick={() => handleStatusChange("")}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Xem tất cả cuộc hẹn
                            </button>
                        )}
                    </div>
                )}

                {metadata && metadata.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Trang <span className="text-gray-900 font-semibold">{metadata.page}</span> trên <span className="text-gray-900 font-semibold">{metadata.totalPages}</span>
                            <span className="ml-2 text-gray-400">
                                ({metadata.total || appointments.length} cuộc hẹn)
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
        </div>
    )
}