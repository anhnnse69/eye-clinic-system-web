"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Calendar, Clock, Stethoscope, Building2, User, FileText,
    Loader2, CheckCircle2, MapPin, ChevronLeft, AlertCircle,
    Sun, Cloud, Moon, Phone
} from "lucide-react"

import { patientAppointmentService } from "@/services/patient-appointment.service"
import { ApiError } from "@/lib/axios"
import { formatCurrency } from "@/lib/utils"

import type {
    ClinicBasicInfo, DoctorOption, SlotOption, ServiceOption,
    PatientProfileOption, BookAppointmentResponse
} from "@/services/patient-appointment.service"

const errorMessageMap: Record<string, string> = {
    APP_MESSAGE_4005: "Khung giờ này đã qua, vui lòng chọn khung giờ khác",
    APP_MESSAGE_4006: "Khung giờ không hợp lệ hoặc không thuộc bác sĩ đã chọn",
    APP_MESSAGE_4007: "Khung giờ này đã hết chỗ, vui lòng chọn khung giờ khác",
    APP_MESSAGE_4045: "Không tìm thấy phòng khám hoặc phòng khám đã ngừng hoạt động",
    APP_MESSAGE_4011: "Bác sĩ không tồn tại hoặc đã ngừng hoạt động",
    APP_MESSAGE_4014: "Bạn không có quyền đặt lịch cho hồ sơ bệnh nhân này",
    APP_MESSAGE_4015: "Bạn đã có một lịch hẹn khác trùng vào khung giờ này. Vui lòng chọn khung giờ khác!",
    APP_MESSAGE_4033: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại",
    APP_MESSAGE_4044: "Dịch vụ không hợp lệ hoặc không thuộc phòng khám này",
    APP_MESSAGE_5000: "Đã có lỗi xảy ra, vui lòng thử lại sau",
}

function translateErrorCode(codeMessage: string): string {
    return errorMessageMap[codeMessage] || "Đã có lỗi xảy ra, vui lòng thử lại sau"
}

enum ShiftType {
    MORNING = "MORNING",
    AFTERNOON = "AFTERNOON",
    EVENING = "EVENING"
}

const SHIFT_CONFIG: Record<ShiftType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    [ShiftType.MORNING]: {
        label: "Buổi sáng",
        icon: <Sun className="w-4 h-4" />,
        color: "text-orange-500",
        bgColor: "bg-orange-50 border-orange-200"
    },
    [ShiftType.AFTERNOON]: {
        label: "Buổi chiều",
        icon: <Cloud className="w-4 h-4" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50 border-blue-200"
    },
    [ShiftType.EVENING]: {
        label: "Buổi tối",
        icon: <Moon className="w-4 h-4" />,
        color: "text-purple-500",
        bgColor: "bg-purple-50 border-purple-200"
    }
}

export default function BookAppointmentPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const clinicId = searchParams.get("clinicId") ?? ""
    const preselectedDoctorId = searchParams.get("doctorId") ?? ""

    const [clinic, setClinic] = useState<ClinicBasicInfo | null>(null)
    const [doctors, setDoctors] = useState<DoctorOption[]>([])
    const [services, setServices] = useState<ServiceOption[]>([])
    const [slots, setSlots] = useState<SlotOption[]>([])
    const [patientProfiles, setPatientProfiles] = useState<PatientProfileOption[]>([])

    const [doctorId, setDoctorId] = useState<string>("")
    const [serviceId, setServiceId] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [slotId, setSlotId] = useState<string>("")
    const [patientId, setPatientId] = useState<string>("")
    const [symptoms, setSymptoms] = useState<string>("")

    const [loadingClinic, setLoadingClinic] = useState(true)
    const [loadingDoctors, setLoadingDoctors] = useState(true)
    const [loadingServices, setLoadingServices] = useState(true)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [loadingProfiles, setLoadingProfiles] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [successResult, setSuccessResult] = useState<BookAppointmentResponse | null>(null)

    const extractErrorMessage = (err: unknown): string => {
        if (err instanceof ApiError) {
            if (err.codeMessage === "APP_MESSAGE_4005") {
                return "Khung giờ này đã qua, vui lòng chọn khung giờ khác"
            }
            return translateErrorCode(err.codeMessage)
        }
        if (err instanceof Error) {
            return err.message || "Đã có lỗi xảy ra, vui lòng thử lại sau"
        }
        return "Đã có lỗi xảy ra, vui lòng thử lại sau"
    }

    useEffect(() => {
        if (!clinicId) {
            setLoadingClinic(false)
            setLoadingDoctors(false)
            setLoadingServices(false)
            return
        }

        const loadInitialData = async () => {
            try {
                const [clinicRes, doctorRes, serviceRes, profileRes] = await Promise.all([
                    patientAppointmentService.getClinicBasicInfo(clinicId),
                    patientAppointmentService.getDoctorsByClinic(clinicId),
                    patientAppointmentService.getServicesByClinic(clinicId),
                    patientAppointmentService.getMyProfiles(),
                ])
                setClinic(clinicRes.data || null)
                setDoctors(doctorRes.data || [])
                setServices(serviceRes.data || [])
                setPatientProfiles(profileRes.data || [])

                if (preselectedDoctorId) setDoctorId(preselectedDoctorId)
            } catch (err: unknown) {
                setError(extractErrorMessage(err))
            } finally {
                setLoadingClinic(false)
                setLoadingDoctors(false)
                setLoadingServices(false)
                setLoadingProfiles(false)
            }
        }
        loadInitialData()
    }, [clinicId, preselectedDoctorId])

    const loadSlots = useCallback(async () => {
        if (!doctorId || !selectedDate) {
            setSlots([])
            return
        }
        setLoadingSlots(true)
        setSlotId("")
        try {
            const dateStr = formatDateToString(selectedDate)
            const res = await patientAppointmentService.getDoctorSlots(doctorId, dateStr)
            setSlots(res.data || [])
        } catch (err: unknown) {
            setError(extractErrorMessage(err))
        } finally {
            setLoadingSlots(false)
        }
    }, [doctorId, selectedDate])

    useEffect(() => { loadSlots() }, [loadSlots])

    useEffect(() => {
        if (!doctorId || !selectedDate) return

        const interval = setInterval(() => {
            loadSlots()
        }, 60000)

        return () => clearInterval(interval)
    }, [doctorId, selectedDate, loadSlots])

    const isSlotInPast = (slot: SlotOption): boolean => {
        if (!selectedDate) return false

        const [hours, minutes] = slot.startTime.split(':').map(Number)
        const slotDateTime = new Date(selectedDate)
        slotDateTime.setHours(hours, minutes, 0, 0)

        return slotDateTime <= new Date()
    }

    const hasAvailableSlots = (slots: SlotOption[]): boolean => {
        return slots.some(slot => slot.isAvailable && !isSlotInPast(slot))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!patientId || !doctorId || !slotId) {
            setError("Vui lòng chọn đầy đủ Hồ sơ bệnh nhân, Bác sĩ và Khung giờ khám")
            return
        }

        setSubmitting(true)
        try {
            const res = await patientAppointmentService.bookAppointment({
                patientId, doctorId, slotId,
                serviceId: serviceId || undefined,
                symptoms: symptoms || undefined
            })

            if (res.codeMessage && res.codeMessage !== "APP_MESSAGE_2001") {
                const errorMessage = translateErrorCode(res.codeMessage)
                setError(errorMessage)

                if (res.codeMessage === "APP_MESSAGE_4005") {
                    setSlotId("")
                    setError("Khung giờ này đã qua, vui lòng chọn khung giờ khác")
                    setTimeout(() => loadSlots(), 500)
                }

                if (res.codeMessage === "APP_MESSAGE_4015") {
                    setSlotId("")
                    setTimeout(() => loadSlots(), 500)
                }

                return
            }

            setSuccessResult(res.data || null)
        } catch (err: unknown) {
            const errorMessage = extractErrorMessage(err)
            setError(errorMessage)

            if (err instanceof ApiError) {
                // Xử lý riêng cho lỗi khung giờ đã qua từ catch
                if (err.codeMessage === "APP_MESSAGE_4005") {
                    setSlotId("")
                    setError("⚠️ Khung giờ này đã qua, vui lòng chọn khung giờ khác")
                    setTimeout(() => loadSlots(), 500)
                }

                if (err.codeMessage === "APP_MESSAGE_4015") {
                    setSlotId("")
                    setTimeout(() => loadSlots(), 500)
                }
            }
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setSuccessResult(null)
        setDoctorId("")
        setServiceId("")
        setSelectedDate(null)
        setSlotId("")
        setPatientId("")
        setSymptoms("")
        setError(null)
    }

    const getAvailableDates = (): Date[] => {
        const dates: Date[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            dates.push(date)
        }
        return dates
    }

    const formatDateToString = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const formatDisplayDate = (date: Date): string => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        const day = days[date.getDay()]
        const d = String(date.getDate()).padStart(2, '0')
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const y = date.getFullYear()
        return `${day}, ${d}/${m}/${y}`
    }

    const getDayName = (date: Date): string => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        return days[date.getDay()]
    }

    const getMonthName = (date: Date): string => {
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        return months[date.getMonth()]
    }

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
    }

    const isToday = (date: Date): boolean => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return isSameDay(date, today)
    }

    const getShiftType = (startTime: string): ShiftType => {
        const hour = parseInt(startTime.split(':')[0])
        if (hour >= 6 && hour < 12) return ShiftType.MORNING
        if (hour >= 12 && hour < 17) return ShiftType.AFTERNOON
        return ShiftType.EVENING
    }

    const groupSlotsByShift = (slots: SlotOption[]): Map<ShiftType, SlotOption[]> => {
        const grouped = new Map<ShiftType, SlotOption[]>()

        Object.values(ShiftType).forEach(shift => {
            grouped.set(shift, [])
        })

        slots.forEach(slot => {
            const shift = getShiftType(slot.startTime)
            const existing = grouped.get(shift) || []
            existing.push(slot)
            grouped.set(shift, existing)
        })

        return grouped
    }

    if (!clinicId) {
        return (
            <div className="max-w-3xl mx-auto p-6 mt-10 text-center space-y-4">
                <Building2 className="w-14 h-14 text-gray-300 mx-auto" />
                <p className="text-gray-600">Vui lòng chọn một phòng khám trước khi đặt lịch.</p>
                <Link href="/search/clinics" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
                    Tìm phòng khám
                </Link>
            </div>
        )
    }

    if (successResult) {
        return (
            <div className="max-w-3xl mx-auto p-6 mt-10">
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center">
                    <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Đặt lịch thành công!</h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Mã lịch hẹn của bạn: #{successResult.id_appointment.slice(0, 8)}
                    </p>

                    <div className="mt-6 space-y-3 text-left bg-gray-50 rounded-2xl p-5">
                        <Row label="Phòng khám" value={successResult.clinicName} />
                        <Row label="Bác sĩ" value={successResult.doctorName} />
                        <Row label="Dịch vụ" value={successResult.serviceName} />
                        <Row label="Ngày khám" value={successResult.appointmentDate} />
                        <Row label="Khung giờ" value={successResult.timeSlot} />
                        <Row label="Trạng thái" value={successResult.status} />
                        <Row label="Tiền đặt cọc" value={formatCurrency(successResult.depositAmount)} />
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm"
            >
                <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="border-b border-gray-100 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Đặt Lịch Khám</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Chọn bác sĩ, dịch vụ và khung giờ phù hợp với bạn
                </p>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border border-blue-100/80 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-100/40 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10 shrink-0 overflow-hidden border border-white">
                        {loadingClinic ? (
                            <div className="w-full h-full bg-blue-700 animate-pulse" />
                        ) : clinic?.logoUrl ? (
                            <img
                                src={clinic.logoUrl}
                                alt={clinic.name || "Clinic Logo"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7"/><path d="M9 7v1a3 3 0 0 0 6 0V7"/><path d="M15 7v1a3 3 0 0 0 6 0V7"/><path d="M5 21V10.85"/><path d="M19 21V10.85"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>`;
                                    }
                                }}
                            />
                        ) : (
                            <Building2 className="w-6 h-6" />
                        )}
                    </div>

                    <div className="space-y-2 w-full min-w-0">
                        {loadingClinic ? (
                            <div className="space-y-2 py-1">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                            </div>
                        ) : clinic ? (
                            <>
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1.5">
                                        Cơ sở y tế đối tác
                                    </span>
                                    <h3 className="font-bold text-gray-900 text-base md:text-lg tracking-tight leading-snug truncate">
                                        {clinic.name}
                                    </h3>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-gray-600 font-medium pt-0.5">
                                    <p className="flex items-center gap-1.5 min-w-0">
                                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span className="truncate">{clinic.address}</span>
                                    </p>

                                    {(clinic.phone || clinic.phone) && (
                                        <p className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200 pt-1.5 sm:pt-0 sm:pl-4">
                                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span className="text-gray-700 font-semibold">{clinic.phone || clinic.phone}</span>
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-rose-600 py-2">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-semibold">Không tìm thấy thông tin phòng khám</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <Field icon={<Stethoscope className="w-4 h-4" />} label="Bác sĩ">
                            <select
                                value={doctorId}
                                onChange={(e) => setDoctorId(e.target.value)}
                                disabled={loadingDoctors}
                                required
                                className={selectClass}
                            >
                                <option value="">{loadingDoctors ? "Đang tải..." : "-- Chọn bác sĩ --"}</option>
                                {doctors.map((d) => (
                                    <option key={d.id_doctor} value={d.id_doctor}>
                                        {d.title ? `${d.title} ` : ""}{d.fullName} {d.specialtyName ? `(${d.specialtyName})` : ""}
                                        {d.experienceYears > 0 && ` - ${d.experienceYears} năm kinh nghiệm`}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field icon={<FileText className="w-4 h-4" />} label="Dịch vụ">
                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                disabled={loadingServices}
                                className={selectClass}
                            >
                                <option value="">{loadingServices ? "Đang tải..." : "-- Chọn dịch vụ (tuỳ chọn) --"}</option>
                                {services.map((s) => (
                                    <option key={s.id_service} value={s.id_service}>
                                        {s.serviceName}{s.price ? ` - ${formatCurrency(s.price)}` : ""}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field icon={<User className="w-4 h-4" />} label="Hồ sơ bệnh nhân">
                            <select
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                disabled={loadingProfiles}
                                required
                                className={selectClass}
                            >
                                <option value="">{loadingProfiles ? "Đang tải..." : "-- Chọn hồ sơ bệnh nhân --"}</option>
                                {patientProfiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.fullName}
                                        {p.gender && ` (${p.gender === "MALE" ? "Nam" : p.gender === "FEMALE" ? "Nữ" : p.gender})`}
                                        {p.relationship && ` - ${p.relationship}`}
                                        {p.dob && ` - ${p.dob}`}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field icon={<FileText className="w-4 h-4" />} label="Triệu chứng / Ghi chú">
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Mô tả triệu chứng hoặc lý do khám (không bắt buộc)..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                            />
                        </Field>
                    </div>

                    <div className="space-y-5">
                        <Field icon={<Calendar className="w-4 h-4" />} label="Ngày khám">
                            <div className="grid grid-cols-7 gap-2">
                                {getAvailableDates().map((date) => {
                                    const isSelected = selectedDate && isSameDay(date, selectedDate)
                                    const isTodayDate = isToday(date)
                                    const isDisabled = !doctorId

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            type="button"
                                            onClick={() => !isDisabled && setSelectedDate(date)}
                                            disabled={isDisabled}
                                            className={`
                                                p-2 rounded-xl text-center transition-all
                                                ${isSelected
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                    : isDisabled
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-50 hover:bg-blue-50 text-gray-700 cursor-pointer'
                                                }
                                            `}
                                        >
                                            <div className={`text-xs font-medium ${isTodayDate && !isSelected ? 'text-blue-600' : ''}`}>
                                                {getDayName(date)}
                                            </div>
                                            <div className={`text-lg font-bold ${isTodayDate && !isSelected ? 'text-blue-600' : ''}`}>
                                                {String(date.getDate()).padStart(2, '0')}
                                            </div>
                                            <div className="text-[10px] opacity-75">
                                                {getMonthName(date)}
                                            </div>
                                            {isTodayDate && !isSelected && (
                                                <div className="text-[8px] font-medium text-blue-600 mt-0.5">
                                                    Hôm nay
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            {selectedDate && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Đã chọn: <span className="font-semibold">{formatDisplayDate(selectedDate)}</span>
                                </p>
                            )}
                            {!doctorId && (
                                <p className="text-xs text-amber-600 mt-1">
                                    * Vui lòng chọn bác sĩ trước để xem lịch khám
                                </p>
                            )}
                        </Field>

                        <Field icon={<Clock className="w-4 h-4" />} label="Khung giờ">
                            {!selectedDate ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                    <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                    Vui lòng chọn ngày khám để xem khung giờ
                                </div>
                            ) : loadingSlots ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl">
                                    <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
                                    <p className="text-sm text-gray-500 mt-2">Đang tải khung giờ...</p>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                    <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                    Bác sĩ không có lịch làm việc trong ngày này
                                </div>
                            ) : !hasAvailableSlots(slots) ? (
                                <div className="text-center py-8 bg-amber-50 rounded-xl text-amber-600 text-sm border border-amber-200">
                                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                                    Không còn khung giờ khả dụng trong ngày này
                                    <p className="text-xs text-amber-500 mt-1">Vui lòng chọn ngày khác</p>
                                </div>
                            ) : (
                                <div>
                                    {(() => {
                                        const groupedSlots = groupSlotsByShift(slots)
                                        let hasSlots = false

                                        return (
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                                {Object.values(ShiftType).map((shift) => {
                                                    const shiftSlots = groupedSlots.get(shift) || []
                                                    // Lọc chỉ hiển thị shift có slot hợp lệ
                                                    const validSlots = shiftSlots.filter(slot => slot.isAvailable && !isSlotInPast(slot))
                                                    if (validSlots.length === 0) return null

                                                    hasSlots = true
                                                    const config = SHIFT_CONFIG[shift]

                                                    return (
                                                        <div key={shift} className={`p-3 rounded-xl border ${config.bgColor}`}>
                                                            <div className={`flex items-center gap-2 text-sm font-semibold mb-2 ${config.color}`}>
                                                                {config.icon}
                                                                {config.label}
                                                                <span className="text-xs font-normal text-gray-500 ml-auto">
                                                                    {validSlots.length} khung giờ
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {shiftSlots.map((slot) => {
                                                                    const isSelected = slotId === slot.id_slot
                                                                    const isFullyBooked = !slot.isAvailable
                                                                    const isPastSlot = isSlotInPast(slot)
                                                                    const remainingSlots = slot.maxPatients - slot.currentPatients
                                                                    const isDisabled = isFullyBooked || isPastSlot

                                                                    return (
                                                                        <button
                                                                            key={slot.id_slot}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (!isDisabled) {
                                                                                    setSlotId(slot.id_slot)
                                                                                    setError(null)
                                                                                } else if (isPastSlot) {
                                                                                    setError("Khung giờ này đã qua, không thể đặt lịch")
                                                                                } else if (isFullyBooked) {
                                                                                    setError("Khung giờ này đã hết chỗ")
                                                                                }
                                                                            }}
                                                                            disabled={isDisabled}
                                                                            className={`
                                                                                p-2.5 rounded-lg text-center transition-all text-sm relative
                                                                                ${isSelected
                                                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                                                    : isDisabled
                                                                                        ? isPastSlot
                                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                                        : 'bg-white hover:bg-blue-50 text-gray-700 cursor-pointer border border-gray-200'
                                                                                }
                                                                            `}
                                                                        >
                                                                            <div className="font-medium">
                                                                                {slot.startTime} - {slot.endTime}
                                                                            </div>
                                                                            <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                                {isPastSlot
                                                                                    ? 'Đã qua'
                                                                                    : isFullyBooked
                                                                                        ? 'Đã hết chỗ'
                                                                                        : `Còn ${remainingSlots} chỗ`
                                                                                }
                                                                            </div>
                                                                            {isPastSlot && (
                                                                                <div className="absolute -top-1 -right-1">
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600">
                                                                                        Hết hạn
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {!hasSlots && (
                                                    <div className="text-center py-4 text-gray-500 text-sm">
                                                        Không có khung giờ trống
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-400 text-right">
                                                    Tổng cộng: {slots.filter(s => s.isAvailable && !isSlotInPast(s)).length} khung giờ trống
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                            {slotId && slots.find(s => s.id_slot === slotId)?.isAvailable === false && (
                                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Khung giờ này đã hết chỗ, vui lòng chọn khung giờ khác
                                </p>
                            )}
                            {slotId && slots.find(s => s.id_slot === slotId) && isSlotInPast(slots.find(s => s.id_slot === slotId)!) && (
                                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Khung giờ này đã qua, không thể đặt lịch
                                </p>
                            )}
                        </Field>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={submitting || !selectedDate || !slotId}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {submitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                    </button>
                </div>
            </form>
        </div>
    )
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                {icon}{label}
            </label>
            {children}
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    )
}

const selectClass =
    "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"