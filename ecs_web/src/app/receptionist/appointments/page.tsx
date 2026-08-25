"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
    Calendar, Clock, User, Search, RotateCcw, AlertTriangle,
    ChevronLeft, ChevronRight, Activity, Users, Landmark,
    UserCheck, CalendarX, UserX, X, CheckCircle2, CheckCircle, XCircle, Loader2
} from "lucide-react"
import { receptionistService, DailyAppointmentItemResponse } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"

enum AppointmentStatus {
    PENDING = "PENDING",
    DEPOSIT_PAID = "DEPOSIT_PAID",
    CONFIRMED = "CONFIRMED",
    BOOKED = "BOOKED",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NOSHOW = "NOSHOW"
}

const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const StatCard = ({ icon, title, value, iconBgClass, iconColorClass, shadowColor }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    iconBgClass: string;
    iconColorClass: string;
    shadowColor: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const colorMap: Record<string, string> = {
        'text-primary': '#00658d',
        'text-tertiary': '#006c49',
        'text-primary-container': '#00a3e0',
        'text-error': '#ba1a1a'
    };
    const activeColor = colorMap[iconColorClass] || '#00658d';

    return (
        <div
            className="p-5 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-xs"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered
                    ? `0 20px 25px -5px rgba(${shadowColor}, 0.15), 0 8px 10px -6px rgba(${shadowColor}, 0.15)`
                    : '0 4px 6px -1px rgb(0 0 0 / 0.02)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-on-surface tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${iconBgClass} ${iconColorClass} transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                    {icon}
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-3xl bg-surface-container-low transition-all duration-300 ${isHovered ? 'h-[6px]' : 'h-[4px]'}`}>
                <div
                    className="h-full rounded-r-full transition-all duration-500"
                    style={{
                        width: isHovered ? '100%' : '16%',
                        backgroundColor: activeColor,
                        filter: isHovered ? `drop-shadow(0 0 4px ${activeColor})` : 'none',
                        opacity: isHovered ? 1 : 0.75
                    }}
                />
            </div>
        </div>
    );
};

export default function ReceptionistDailyAppointmentsPage() {
    const t = useTranslations("receptionist")
    const tAppt = useTranslations("receptionist.appointment")

    const [appointments, setAppointments] = useState<DailyAppointmentItemResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    const [targetDate, setTargetDate] = useState(() => new Date().toLocaleDateString("fr-CA"))
    const [shiftFilter, setShiftFilter] = useState<"MORNING" | "AFTERNOON" | "EVENING" | "">("")
    const [searchPatient, setSearchPatient] = useState("")
    const [searchDoctor, setSearchDoctor] = useState("")

    const [selectedAppointment, setSelectedAppointment] = useState<DailyAppointmentItemResponse | null>(null)
    const [stats, setStats] = useState({ total: 0, arrived: 0, completed: 0, cancelled: 0 })

    // Trạng thái cho Custom Confirmation Modals & Toast Banners (thay thế window.alert/confirm/prompt)
    const [payDepositAppointmentId, setPayDepositAppointmentId] = useState<string | null>(null)
    const [arrivedAppointmentId, setArrivedAppointmentId] = useState<string | null>(null)
    const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null)
    const [cancelReasonInput, setCancelReasonInput] = useState("")
    const [cancelReasonError, setCancelReasonError] = useState<string | null>(null)

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    // Tự động đóng Toast notification sau 3.5 giây
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null)
            }, 3500)
            return () => clearTimeout(timer)
        }
    }, [toast])

    const fetchDailyAppointments = async () => {
        try {
            setIsLoading(true)
            const response = await receptionistService.getDailyAppointments({
                pageNumber,
                pageSize,
                targetDate: targetDate || undefined,
                shiftFilter: shiftFilter || undefined,
                searchPatient: searchPatient || undefined,
                searchDoctor: searchDoctor || undefined
            })

            if (response.codeMessage === "APP_MESSAGE_2000" && response.data) {
                setAppointments(response.data)
                if (response.meta) setTotalItems(response.meta.total)
                calculateStats(response.data)
            }
        } catch (error) {
            console.error(tAppt("errors.loadFailed"), error)
        } finally {
            setIsLoading(false)
        }
    }

    const calculateStats = (list: DailyAppointmentItemResponse[]) => {
        const counters = { total: list.length, arrived: 0, completed: 0, cancelled: 0 }
        list.forEach(item => {
            if (item.status === "ARRIVED" || item.status === "IN_PROGRESS") counters.arrived++
            else if (item.status === "COMPLETED") counters.completed++
            else if (item.status === "CANCELLED" || item.status === "NOSHOW") counters.cancelled++
        })
        setStats(counters)
    }

    useEffect(() => {
        fetchDailyAppointments()
    }, [pageNumber, targetDate, shiftFilter, searchPatient, searchDoctor])

    const handleResetFilters = () => {
        setTargetDate(new Date().toLocaleDateString("fr-CA"))
        setShiftFilter("")
        setSearchPatient("")
        setSearchDoctor("")
        setPageNumber(1)
    }

    // Thực thi Thu tiền cọc tại quầy sau khi xác nhận trên Modal
    const executePayDeposit = async (appointmentId: string) => {
        try {
            setIsActionLoading(true)
            const response = await receptionistService.payDepositAtCounter({ appointmentId })

            if (response.codeMessage === "APP_MESSAGE_2000") {
                setToast({ message: tAppt("collectDepositSuccess"), type: "success" })
                setSelectedAppointment(prev => prev ? { ...prev, depositPaid: true } : null)
                setPayDepositAppointmentId(null)
                fetchDailyAppointments()
            }
        } catch (error) {
            setPayDepositAppointmentId(null)
            setToast({ message: tAppt("depositFailed", { error: handleApiError(error) }), type: "error" })
        } finally {
            setIsActionLoading(false)
        }
    }

    // Thực thi Bệnh nhân đến quầy sau khi xác nhận trên Modal
    const executeArrived = async (appointmentId: string) => {
        try {
            setIsActionLoading(true)
            const response = await receptionistService.handleArrived({ appointmentId })
            if (response.codeMessage === "APP_MESSAGE_2000" && response.data) {
                const checkInResult = response.data
                setToast({ message: tAppt("arrivedSuccess"), type: "success" })
                setSelectedAppointment(prev => prev ? {
                    ...prev,
                    status: checkInResult.status as any,
                    queue: checkInResult.queue
                } : null)
                setArrivedAppointmentId(null)
                fetchDailyAppointments()
            }
        } catch (error) {
            setArrivedAppointmentId(null)
            setToast({ message: tAppt("arrivedFailed", { error: handleApiError(error) }), type: "error" })
        } finally {
            setIsActionLoading(false)
        }
    }

    // Thực thi Hủy lịch hẹn sau khi nhập lý do trên Modal
    const executeCancel = async (id: string, reason: string) => {
        if (!reason.trim()) {
            setCancelReasonError(tAppt("cancelReasonRequiredAlert"))
            return
        }

        try {
            setIsActionLoading(true)
            setCancelReasonError(null)
            const response = await receptionistService.handleCancel({
                appointmentId: id,
                noteReason: reason.trim()
            })
            if (response.codeMessage === "APP_MESSAGE_2000") {
                setToast({ message: tAppt("cancelSuccess"), type: "success" })
                setSelectedAppointment(prev => prev ? { ...prev, status: "CANCELLED" } : null)
                setCancelAppointmentId(null)
                setCancelReasonInput("")
                fetchDailyAppointments()
            } else {
                setCancelReasonError(tAppt("cancelFailed", { error: response.codeMessage || "" }))
            }
        } catch (error) {
            setCancelReasonError(tAppt("cancelFailed", { error: handleApiError(error) }))
        } finally {
            setIsActionLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { class: string; label: string }> = {
            "PENDING": { class: "bg-amber-50 text-amber-800 border-amber-200/70", label: tAppt("pendingDeposit") },
            "DEPOSIT_PAID": { class: "bg-sky-50 text-sky-800 border-sky-200/70", label: tAppt("depositPaid") },
            "CONFIRMED": { class: "bg-indigo-50 text-indigo-800 border-indigo-200/70", label: tAppt("readyToExam") },
            "BOOKED": { class: "bg-indigo-50 text-indigo-800 border-indigo-200/70", label: tAppt("readyToExam") },
            "ARRIVED": { class: "bg-emerald-50 text-emerald-800 border-emerald-200/70", label: tAppt("present") },
            "IN_PROGRESS": { class: "bg-purple-50 text-purple-800 border-purple-200/70", label: tAppt("examining") },
            "COMPLETED": { class: "bg-teal-50 text-teal-800 border-teal-200/70", label: tAppt("completed") },
            "CANCELLED": { class: "bg-slate-100 text-slate-700 border-slate-200", label: tAppt("cancelled") },
            "NOSHOW": { class: "bg-rose-50 text-rose-800 border-rose-200/70", label: tAppt("noShow") },
        }
        const badge = badges[status] || { class: "bg-surface-container text-on-surface-variant", label: status }
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge.class}`}>
                {badge.label}
            </span>
        )
    }

    const appointmentDateStr = selectedAppointment?.appointmentDate
    const todayStr = new Date().toLocaleDateString("fr-CA")
    const isToday = appointmentDateStr === todayStr

    const canPayDeposit = selectedAppointment && isToday && !selectedAppointment.depositPaid && ["PENDING", "CONFIRMED", "BOOKED"].includes(selectedAppointment.status)
    const canArrive = selectedAppointment && isToday && selectedAppointment.depositPaid && ["CONFIRMED", "BOOKED", "NOSHOW"].includes(selectedAppointment.status)
    const canCancel =
        selectedAppointment &&
        appointmentDateStr &&
        appointmentDateStr >= todayStr &&
        ["PENDING", "DEPOSIT_PAID", "CONFIRMED", "BOOKED"].includes(
            selectedAppointment.status
        )

    const totalPages = Math.ceil(totalItems / pageSize)

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-background min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant/30 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        {tAppt("manageReception")}
                    </h1>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">
                        {tAppt("receptionDescription")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchDailyAppointments}
                    className="w-full sm:w-auto bg-surface-container-lowest text-primary font-bold text-xs h-[40px] rounded-xl px-4 border border-outline-variant/60 shadow-xs hover:bg-[#c6e7ff]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap group cursor-pointer"
                >
                    <RotateCcw className="h-3.5 w-3.5 text-primary group-hover:rotate-[-45deg] transition-all duration-300 shrink-0" />
                    <span>{t("common.refresh")}</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="h-5 w-5" />} title={tAppt("totalAppointments")} value={stats.total} iconBgClass="bg-[#c6e7ff]/40" iconColorClass="text-primary" shadowColor="0, 101, 141" />
                <StatCard icon={<Activity className="h-5 w-5" />} title={tAppt("arrivedAndExamining")} value={stats.arrived} iconBgClass="bg-[#6ffbbe]/25" iconColorClass="text-tertiary" shadowColor="0, 108, 73" />
                <StatCard icon={<CheckCircle2 className="h-5 w-5" />} title={tAppt("completedExam")} value={stats.completed} iconBgClass="bg-[#c6e7ff]/30" iconColorClass="text-primary-container" shadowColor="0, 163, 224" />
                <StatCard icon={<AlertTriangle className="h-5 w-5" />} title={tAppt("cancelledAppointments")} value={stats.cancelled} iconBgClass="bg-error-container/40" iconColorClass="text-error" shadowColor="186, 26, 26" />
            </div>

            {/* Filter Bar */}
            <div className="p-5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-wider pl-1">{tAppt("searchDate")}</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input type="date" value={targetDate} onChange={(e) => { setTargetDate(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2.5 bg-surface-container-low font-semibold text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-wider pl-1">{tAppt("shift")}</label>
                    <div className="relative">
                        <select value={shiftFilter} onChange={(e) => { setShiftFilter(e.target.value as any); setPageNumber(1); }} className="w-full text-sm border border-outline-variant/60 rounded-xl px-3 py-2.5 bg-surface-container-low font-bold text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                            <option value="">{tAppt("allShifts")}</option>
                            <option value="MORNING">{tAppt("morningShift")}</option>
                            <option value="AFTERNOON">{tAppt("afternoonShift")}</option>
                            <option value="EVENING">{tAppt("eveningShift")}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                    <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-wider pl-1">{tAppt("patient")}</label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input type="text" placeholder={tAppt("searchPatientName")} value={searchPatient} onChange={(e) => { setSearchPatient(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2.5 bg-surface-container-low font-medium placeholder-on-surface-variant/50 text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-wider pl-1">{tAppt("doctor")}</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                        <input type="text" placeholder={tAppt("searchDoctor")} value={searchDoctor} onChange={(e) => { setSearchDoctor(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-outline-variant/60 rounded-xl pl-9 pr-3 py-2.5 bg-surface-container-low font-medium placeholder-on-surface-variant/50 text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                </div>

                <div className="md:col-span-3">
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="w-full bg-surface-container-lowest text-on-surface font-bold text-sm h-[42px] rounded-xl px-4 border border-outline-variant/60 shadow-xs hover:bg-surface-container-low transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap group cursor-pointer"
                    >
                        <RotateCcw className="h-4 w-4 text-on-surface-variant group-hover:text-primary group-hover:rotate-[-45deg] transition-all duration-300 shrink-0" />
                        <span>{t("common.clearFilters")}</span>
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                                <th className="py-3 px-4">{tAppt("patient")}</th>
                                <th className="py-3 px-4">{tAppt("time")}</th>
                                <th className="py-3 px-4">{tAppt("doctorAndRoom")}</th>
                                <th className="py-3 px-4">{tAppt("clinicalSymptoms")}</th>
                                <th className="py-3 px-4">{tAppt("depositAtCounter")}</th>
                                <th className="py-3 px-4">{tAppt("status")}</th>
                                <th className="py-3 px-4 text-center">{tAppt("queueNumber")}</th>
                                <th className="py-3 px-4 text-right">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20 text-xs font-medium text-on-surface">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-on-surface-variant">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="font-semibold text-xs">{t("common.loading")}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-on-surface-variant font-semibold">
                                        {tAppt("noAppointments")}
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((item) => {
                                    const isWalkIn = item.bookingSource === "WALKIN" || item.bookingSource === "WALK_IN";
                                    return (
                                        <tr 
                                            key={item.id} 
                                            className={`transition-colors group ${
                                                isWalkIn 
                                                    ? 'bg-amber-50/60 hover:bg-amber-100/50' 
                                                    : 'hover:bg-surface-container-low/60'
                                            }`}
                                        >
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.patient.fullName}</div>
                                                <div className="text-[11px] text-on-surface-variant font-semibold mt-0.5">{item.patient.phoneNumber || tAppt("noPhone")}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {isWalkIn ? (
                                                    <div className="flex items-center gap-1 font-bold text-on-surface">
                                                        {item.slot.shiftType}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 font-bold text-on-surface">
                                                        <Clock className="h-3.5 w-3.5 text-on-surface-variant" />
                                                        {item.slot.startTime.split('T')[1]?.substring(0, 5) || "00:00"} - {item.slot.endTime.split('T')[1]?.substring(0, 5) || "00:00"}
                                                    </div>
                                                )}
                                                <div className="text-[10px] uppercase font-black tracking-wider text-on-surface-variant mt-0.5">{item.slot.shiftType}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-on-surface">{item.doctor.fullName}</div>
                                                <div className="text-[11px] font-bold text-primary mt-0.5">{item.doctor.clinicRoomName || tAppt("notAssigned")}</div>
                                            </td>
                                            <td className="py-3.5 px-4 max-w-[200px] truncate text-on-surface-variant font-normal">
                                                {item.symptoms || <span className="text-on-surface-variant/40 italic">{tAppt("noSymptoms")}</span>}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-on-surface">{item.depositAmount.toLocaleString('vi-VN')}đ</div>
                                                <div className="mt-0.5">
                                                    {item.depositPaid ? (
                                                        <span className="text-[10px] font-black text-[#006c49] uppercase tracking-wide">{tAppt("paidDeposit")}</span>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-error uppercase tracking-wide">{tAppt("unpaidDeposit")}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                {item.queue ? (
                                                    <div className="inline-block px-2.5 py-1 bg-[#006c49] text-white font-black rounded-lg text-xs shadow-xs">
                                                        #{item.queue.queueNumber}
                                                    </div>
                                                ) : (
                                                    <span className="text-on-surface-variant/50 font-semibold italic text-[11px]">{tAppt("queueNotAssigned")}</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAppointment(item)}
                                                    className="bg-surface-container-lowest border border-outline-variant/60 hover:border-primary hover:text-primary text-on-surface-variant px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                                                >
                                                    {t("common.viewAndProcess")}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && totalItems > 0 && (
                    <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-on-surface-variant font-semibold">
                            {tAppt("showEntries", { from: (pageNumber - 1) * pageSize + 1, to: Math.min(pageNumber * pageSize, totalItems), total: totalItems })}
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
                                className="bg-surface-container-lowest border border-outline-variant/60 text-on-surface px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer mr-2 font-medium hover:bg-surface-container-low transition-colors"
                            >
                                <option value={5}>5 {tAppt("appointmentsPerPage")}</option>
                                <option value={10}>10 {tAppt("appointmentsPerPage")}</option>
                                <option value={20}>20 {tAppt("appointmentsPerPage")}</option>
                                <option value={50}>50 {tAppt("appointmentsPerPage")}</option>
                            </select>
                            <button
                                disabled={pageNumber === 1}
                                onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                                className="p-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 bg-primary text-on-primary font-bold rounded-lg text-xs shadow-xs">
                                {pageNumber} / {totalPages}
                            </span>
                            <button
                                disabled={pageNumber === totalPages}
                                onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-full max-w-4xl border border-outline-variant/40 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-left space-y-0 animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-[#c6e7ff]/40 text-[#001e2d] px-2 py-0.5 rounded-md border border-[#81cfff]/40">
                                    {tAppt("appointmentDetails")}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(null)}
                                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-surface-container-lowest">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Patient Info */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-on-surface uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <User className="h-3.5 w-3.5 text-primary" /> {tAppt("patientAdministrative")}
                                    </h4>
                                    <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-2.5 text-xs shadow-xs flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("fullNameLabel")}</span><span className="font-bold text-on-surface text-sm">{selectedAppointment.patient.fullName}</span></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-on-surface-variant">{tAppt("genderLabel")}</span>
                                            <span className={`font-bold px-2.5 py-0.5 rounded-md text-xs uppercase ${selectedAppointment.patient.gender?.toUpperCase() === "MALE" ? "bg-[#c6e7ff]/30 text-[#001e2d] border border-[#81cfff]/40" : selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ? "bg-pink-50 text-pink-700 border border-pink-100" : "bg-surface-container text-on-surface-variant border border-outline-variant/40"}`}>
                                                {selectedAppointment.patient.gender?.toUpperCase() === "MALE" ? tAppt("maleLabel") : selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ? tAppt("femaleLabel") : tAppt("otherLabel")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("dobLabel")}</span><span className="font-bold text-on-surface">{new Date(selectedAppointment.patient.dob).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("phoneLabel")}</span><span className="font-bold text-on-surface">{selectedAppointment.patient.phoneNumber || "N/A"}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("bhytLabel")}</span><span className="font-medium bg-surface-container text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant/40 font-mono text-[11px]">{selectedAppointment.patient.bhytNumber || tAppt("noBHYT")}</span></div>
                                    </div>
                                </div>

                                {/* Appointment Info */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-on-surface uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <Clock className="h-3.5 w-3.5 text-primary" /> {tAppt("appointmentInfo")}
                                    </h4>
                                    <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-2.5 text-xs shadow-xs flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("assignedDoctor")}</span><span className="font-bold text-on-surface">{selectedAppointment.doctor.fullName}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("clinicRoom")}</span><span className="font-bold text-primary bg-[#c6e7ff]/30 border border-[#81cfff]/40 px-2.5 py-0.5 rounded-md">{selectedAppointment.doctor.clinicRoomName || tAppt("notAssigned")}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-on-surface-variant">{tAppt("appointmentDate")}</span><span className="font-bold text-on-surface">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-on-surface-variant">{tAppt("timeSlot")}</span>
                                            <span className="font-bold text-on-surface bg-surface-container-lowest border border-outline-variant/40 px-2 py-0.5 rounded">
                                                {selectedAppointment.bookingSource === "WALKIN" || selectedAppointment.bookingSource === "WALK_IN"
                                                    ? `${selectedAppointment.slot.shiftType}`
                                                    : `${selectedAppointment.slot.startTime.split('T')[1]?.substring(0, 5)} - ${selectedAppointment.slot.endTime.split('T')[1]?.substring(0, 5)} (${selectedAppointment.slot.shiftType})`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-on-surface-variant">{tAppt("bookingType")}</span>
                                            <span className="font-bold text-on-surface-variant">{selectedAppointment.bookingSource}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-on-surface uppercase tracking-widest pl-1">{tAppt("symptomsRecorded")}</h4>
                                <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl text-xs font-normal text-on-surface leading-relaxed shadow-xs min-h-[60px]">
                                    {selectedAppointment.symptoms || <span className="text-on-surface-variant/40 italic">{tAppt("noSymptomsData")}</span>}
                                </div>
                            </div>

                            {/* Deposit Section */}
                            <div className="p-5 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-on-surface-variant shrink-0 shadow-xs">
                                        <Landmark className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-on-surface text-sm">{tAppt("depositFee")}</h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg font-black text-primary tracking-tight">{formatVND(selectedAppointment.depositAmount)}</span>
                                            <div className="shrink-0">
                                                {selectedAppointment.depositPaid ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#6ffbbe]/25 text-[#003925] border border-[#4edea3]/60 text-[10px] font-bold uppercase tracking-wider">{tAppt("paidDeposit")}</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-error-container/40 text-error border border-error-container text-[10px] font-bold uppercase tracking-wider">{tAppt("unpaidDeposit")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPayDepositAppointmentId(selectedAppointment.id)}
                                    disabled={!canPayDeposit || isActionLoading}
                                    className={`w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${canPayDeposit && !isActionLoading
                                        ? 'bg-surface-container-lowest text-on-surface border border-outline-variant/60 hover:bg-surface-container-low active:scale-[0.98]'
                                        : selectedAppointment.depositPaid
                                            ? 'bg-surface-container text-on-surface-variant/50 cursor-default border border-transparent shadow-none'
                                            : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed border border-transparent shadow-none'
                                        }`}
                                >
                                    {selectedAppointment.depositPaid ? tAppt("confirmedDeposit") : tAppt("confirmDeposit")}
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
                            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                                <span>{tAppt("checkInStatus")}:</span>
                                {getStatusBadge(selectedAppointment.status)}
                            </div>

                            <div className="flex w-full sm:w-auto gap-2.5 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCancelAppointmentId(selectedAppointment.id);
                                        setCancelReasonInput("");
                                        setCancelReasonError(null);
                                    }}
                                    disabled={!canCancel || isActionLoading}
                                    className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${canCancel && !isActionLoading
                                        ? 'bg-error-container/40 text-error border border-error-container hover:bg-error-container/70 active:scale-[0.98]'
                                        : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed border border-transparent'
                                        }`}
                                >
                                    <CalendarX className="h-4 w-4" />
                                    {tAppt("cancel")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setArrivedAppointmentId(selectedAppointment.id)}
                                    disabled={!canArrive || isActionLoading}
                                    className={`w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${canArrive && !isActionLoading
                                        ? 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'
                                        : selectedAppointment.status === "ARRIVED"
                                            ? 'bg-[#6ffbbe]/25 text-[#003925] border border-[#4edea3]/60 cursor-default'
                                            : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
                                        }`}
                                >
                                    <UserCheck className="h-4 w-4" />
                                    {selectedAppointment.status === "ARRIVED"
                                        ? tAppt("arrivedWithQueue", { number: selectedAppointment.queue?.queueNumber ?? '...' })
                                        : tAppt("confirmArrival")}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ================= TOAST NOTIFICATION BANNER (Thay thế window.alert) ================= */}
            {toast && (
                <div className="fixed top-6 right-6 z-[10001] animate-slide-down max-w-md">
                    <div className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between gap-3 backdrop-blur-xs ${
                        toast.type === "success"
                            ? "bg-[#6ffbbe]/95 text-[#003925] border-[#4edea3]"
                            : "bg-error-container/95 text-on-error-container border-error-container"
                    }`}>
                        <div className="flex items-center gap-2.5">
                            {toast.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-[#006c49] shrink-0" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-error shrink-0" />
                            )}
                            <span className="text-sm font-semibold">{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="h-4 w-4 opacity-70" />
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL XÁC NHẬN THU TIỀN CỌC ================= */}
            {payDepositAppointmentId && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        <div className="flex flex-col items-center text-center gap-3 w-full">
                            <div className="h-12 w-12 bg-[#c6e7ff]/40 text-primary rounded-full flex items-center justify-center shrink-0 border border-[#81cfff]/40">
                                <Landmark className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-on-surface">{tAppt("confirmDeposit")}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {tAppt("collectDepositConfirm")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-3 w-full">
                            <button
                                type="button"
                                onClick={() => setPayDepositAppointmentId(null)}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-outline-variant/60 font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={() => executePayDeposit(payDepositAppointmentId)}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isActionLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{t("common.loading")}</span>
                                    </>
                                ) : (
                                    tAppt("confirmDeposit")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL XÁC NHẬN BỆNH NHÂN ĐẾN QUẦY ================= */}
            {arrivedAppointmentId && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        <div className="flex flex-col items-center text-center gap-3 w-full">
                            <div className="h-12 w-12 bg-[#6ffbbe]/25 text-[#006c49] rounded-full flex items-center justify-center shrink-0 border border-[#4edea3]/60">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-on-surface">{tAppt("confirmArrival")}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {tAppt("arrivedConfirm")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-3 w-full">
                            <button
                                type="button"
                                onClick={() => setArrivedAppointmentId(null)}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-outline-variant/60 font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={() => executeArrived(arrivedAppointmentId)}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isActionLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{t("common.loading")}</span>
                                    </>
                                ) : (
                                    tAppt("confirmArrival")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL HỦY LỊCH HẸN ================= */}
            {cancelAppointmentId && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        <div className="flex flex-col items-center text-center gap-3 w-full">
                            <div className="h-12 w-12 bg-error-container/40 text-error rounded-full flex items-center justify-center shrink-0 border border-error-container">
                                <CalendarX className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-on-surface">{tAppt("cancel")}</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {tAppt("cancelWarning")}
                                </p>
                            </div>
                        </div>

                        {cancelReasonError && (
                            <div className="p-3 bg-error-container/40 text-error border border-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>{cancelReasonError}</span>
                            </div>
                        )}

                        <div className="space-y-2 w-full block">
                            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                                {tAppt("cancelReasonRequired")} <span className="text-error">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={cancelReasonInput}
                                onChange={(e) => {
                                    setCancelReasonInput(e.target.value);
                                    setCancelReasonError(null);
                                }}
                                placeholder={tAppt("cancelReasonRequired")}
                                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-1 focus:ring-error focus:border-error text-sm text-on-surface outline-none resize-none block placeholder:text-on-surface-variant/50"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2 w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    setCancelAppointmentId(null);
                                    setCancelReasonInput("");
                                    setCancelReasonError(null);
                                }}
                                disabled={isActionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-outline-variant/60 font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={() => executeCancel(cancelAppointmentId, cancelReasonInput)}
                                disabled={!cancelReasonInput.trim() || isActionLoading}
                                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer bg-error text-on-error hover:bg-error/90 disabled:bg-surface-container disabled:text-on-surface-variant/40 disabled:cursor-not-allowed"
                            >
                                {isActionLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>{t("common.loading")}</span>
                                    </>
                                ) : (
                                    tAppt("cancel")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}