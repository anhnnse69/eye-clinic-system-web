"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
    Calendar, Clock, Stethoscope, Building2, User, FileText,
    Loader2, CheckCircle2, MapPin, ChevronLeft, AlertCircle,
    Sun, Cloud, Moon, Phone, ShieldCheck, HeartPulse
} from "lucide-react"

import { patientAppointmentService } from "@/services/patient-appointment.service"
import { ApiError } from "@/lib/axios"
import { formatCurrency } from "@/lib/utils"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

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

const SHIFT_CONFIG: Record<ShiftType, { labelVi: string; labelEn: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    [ShiftType.MORNING]: {
        labelVi: "Buổi sáng",
        labelEn: "Morning",
        icon: <Sun className="w-3.5 h-3.5" />,
        color: "text-orange-500",
        bgColor: "bg-orange-50 border-orange-100"
    },
    [ShiftType.AFTERNOON]: {
        labelVi: "Buổi chiều",
        labelEn: "Afternoon",
        icon: <Cloud className="w-3.5 h-3.5" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50 border-blue-100"
    },
    [ShiftType.EVENING]: {
        labelVi: "Buổi tối",
        labelEn: "Evening",
        icon: <Moon className="w-3.5 h-3.5" />,
        color: "text-purple-500",
        bgColor: "bg-purple-50 border-purple-100"
    }
}

function Row({ label, value }: { label: string; value?: string }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0 gap-4 text-xs">
            <span className="text-slate-400 font-medium shrink-0">{label}</span>
            <span className="text-slate-700 font-semibold text-right">{value || "---"}</span>
        </div>
    )
}

export default function BookAppointmentPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const params = useParams()

    const locale = (params?.locale as string) || "vi"
    const isVI = locale === "vi"

    const clinicId = searchParams.get("clinicId") ?? ""
    const preselectedDoctorId = searchParams.get("doctorId") ?? ""
    const preselectedSlotId = searchParams.get("slotId") ?? ""

    // Header State
    const [searchTab, setSearchTab] = useState<"clinics" | "doctors">("doctors")
    const [searchQuery, setSearchQuery] = useState("")

    // Data State
    const [clinic, setClinic] = useState<ClinicBasicInfo | null>(null)
    const [doctors, setDoctors] = useState<DoctorOption[]>([])
    const [services, setServices] = useState<ServiceOption[]>([])
    const [slots, setSlots] = useState<SlotOption[]>([])
    const [patientProfiles, setPatientProfiles] = useState<PatientProfileOption[]>([])

    // Form State
    const [doctorId, setDoctorId] = useState<string>("")
    const [serviceId, setServiceId] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [slotId, setSlotId] = useState<string>("")
    const [patientId, setPatientId] = useState<string>("")
    const [symptoms, setSymptoms] = useState<string>("")

    // Loading State
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
                return isVI ? "Khung giờ này đã qua, vui lòng chọn khung giờ khác" : "This timeslot has passed, please choose another."
            }
            return translateErrorCode(err.codeMessage)
        }
        if (err instanceof Error) {
            return err.message || (isVI ? "Đã có lỗi xảy ra, vui lòng thử lại sau" : "An error occurred, please try again later")
        }
        return isVI ? "Đã có lỗi xảy ra, vui lòng thử lại sau" : "An error occurred, please try again later"
    }

    useEffect(() => {
        if (!clinicId && !preselectedDoctorId) {
            setLoadingClinic(false)
            setLoadingDoctors(false)
            setLoadingServices(false)
            setLoadingProfiles(false)
            return
        }

        const loadInitialData = async () => {
            try {
                const profileResPromise = patientAppointmentService.getMyProfiles()

                if (clinicId) {
                    const [clinicRes, doctorRes, serviceRes, profileRes] = await Promise.all([
                        patientAppointmentService.getClinicBasicInfo(clinicId),
                        patientAppointmentService.getDoctorsByClinic(clinicId),
                        patientAppointmentService.getServicesByClinic(clinicId),
                        profileResPromise,
                    ])
                    setClinic(clinicRes.data || null)
                    setDoctors(doctorRes.data || [])
                    setServices(serviceRes.data || [])
                    const profiles = profileRes.data || []
                    setPatientProfiles(profiles)
                    if (profiles.length > 0 && !patientId) {
                        setPatientId(profiles[0].id)
                    }

                    if (preselectedDoctorId) setDoctorId(preselectedDoctorId)
                } else if (preselectedDoctorId) {
                    const [doctorSlotsRes, profileRes] = await Promise.all([
                        patientAppointmentService.getDoctorSlotsDetail(preselectedDoctorId),
                        profileResPromise,
                    ])

                    const profiles = profileRes.data || []
                    setPatientProfiles(profiles)
                    if (profiles.length > 0 && !patientId) {
                        setPatientId(profiles[0].id)
                    }

                    const doctorData = doctorSlotsRes.data
                    if (doctorData) {
                        setClinic({
                            id: "",
                            name: doctorData.clinicName,
                            address: doctorData.clinicAddress,
                        })
                        setDoctors([{
                            id_doctor: doctorData.doctorId,
                            fullName: doctorData.fullName,
                            title: doctorData.title,
                            specialtyName: doctorData.specialty,
                            experienceYears: doctorData.experienceYears,
                        }])
                        setDoctorId(doctorData.doctorId)

                        if (preselectedSlotId) {
                            for (const day of doctorData.scheduleDays || []) {
                                const foundSlot = day.slots?.find((s) => s.slotId === preselectedSlotId)
                                if (foundSlot) {
                                    setSelectedDate(new Date(day.workDate))
                                    setSlotId(preselectedSlotId)
                                    break
                                }
                            }
                        }
                    }
                }
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
    }, [clinicId, preselectedDoctorId, preselectedSlotId])

    const loadSlots = useCallback(async () => {
        if (!doctorId || !selectedDate) {
            setSlots([])
            return
        }
        setLoadingSlots(true)
        try {
            const dateStr = formatDateToString(selectedDate)
            const res = await patientAppointmentService.getDoctorSlots(doctorId, dateStr)
            const fetchedSlots = res.data || []
            setSlots(fetchedSlots)
            setSlotId(prev => fetchedSlots.some(s => s.id_slot === prev) ? prev : "")
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
            setError(isVI ? "Vui lòng chọn đầy đủ Hồ sơ bệnh nhân, Bác sĩ và Khung giờ khám" : "Please select Patient Profile, Doctor, and Timeslot")
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

                if (res.codeMessage === "APP_MESSAGE_4005" || res.codeMessage === "APP_MESSAGE_4015") {
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
                if (err.codeMessage === "APP_MESSAGE_4005" || err.codeMessage === "APP_MESSAGE_4015") {
                    setSlotId("")
                    setTimeout(() => loadSlots(), 500)
                }
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleHeaderSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = searchQuery.trim()
        router.replace(`/${locale}/search/${searchTab}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`)
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
        const daysVi = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const day = isVI ? daysVi[date.getDay()] : daysEn[date.getDay()]
        const d = String(date.getDate()).padStart(2, '0')
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const y = date.getFullYear()
        return `${day}, ${d}/${m}/${y}`
    }

    const getDayName = (date: Date): string => {
        const daysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return isVI ? daysVi[date.getDay()] : daysEn[date.getDay()]
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
        Object.values(ShiftType).forEach(shift => { grouped.set(shift, []) })
        slots.forEach(slot => {
            const shift = getShiftType(slot.startTime)
            grouped.get(shift)?.push(slot)
        })
        return grouped
    }

    const selectedDoctor = doctors.find(d => d.id_doctor === doctorId)
    const selectedService = services.find(s => s.id_service === serviceId)
    const selectedSlot = slots.find(s => s.id_slot === slotId)

    return (
        <div className="min-h-screen bg-[#F0F4FF] text-slate-800 font-sans flex flex-col">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchTab={searchTab}
                setSearchTab={setSearchTab}
                handleSearch={handleHeaderSearch}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col items-center justify-center">
                {!clinicId && !doctorId ? (
                    <div className="max-w-3xl w-full mx-auto py-16 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center space-y-4 px-6">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-sm font-medium text-slate-600">
                            {isVI ? "Vui lòng chọn một phòng khám hoặc bác sĩ trước khi đặt lịch." : "Please choose a medical clinic or doctor before booking."}
                        </p>
                        <Link href={`/${locale}/search/clinics`} className="inline-block px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-600 transition">
                            {isVI ? "Tìm phòng khám" : "Find Clinics"}
                        </Link>
                    </div>
                ) : successResult ? (
                    <div className="w-full max-w-2xl min-w-[320px] md:min-w-[600px] shrink-0 mx-auto bg-white border border-slate-200/80 rounded-3xl shadow-md p-6 md:p-8 text-center animate-in fade-in-50 duration-200 my-4 block clear-both">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4 shrink-0" />
                        <h2 className="text-xl font-bold text-slate-800 block">{isVI ? "Đặt lịch thành công!" : "Booking Successful!"}</h2>
                        <p className="text-slate-400 mt-1 text-xs font-medium block">
                            {isVI ? "Mã lịch hẹn:" : "Appointment Code:"} #{successResult.id_appointment.slice(0, 8)}
                        </p>

                        <div className="mt-6 space-y-3 text-left bg-slate-50/80 border border-slate-100 rounded-2xl p-5 text-xs md:text-sm block">
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Phòng khám" : "Clinic"}</span>
                                <span className="text-slate-700 font-bold text-right break-words">{successResult.clinicName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Bác sĩ" : "Doctor"}</span>
                                <span className="text-slate-700 font-bold text-right break-words">{successResult.doctorName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Dịch vụ" : "Service"}</span>
                                <span className="text-slate-700 font-bold text-right break-words">{successResult.serviceName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Ngày khám" : "Date"}</span>
                                <span className="text-slate-700 font-bold text-right shrink-0">{successResult.appointmentDate}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Khung giờ" : "Time Slot"}</span>
                                <span className="text-slate-700 font-bold text-right shrink-0">{successResult.timeSlot}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-200/40 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Trạng thái" : "Status"}</span>
                                <span className="text-emerald-600 font-bold text-right shrink-0">{successResult.status}</span>
                            </div>
                            <div className="flex justify-between py-2 last:border-0 gap-4 items-center w-full">
                                <span className="text-slate-400 font-medium shrink-0">{isVI ? "Tiền đặt cọc" : "Deposit"}</span>
                                <span className="text-primary font-bold text-right shrink-0">{formatCurrency(successResult.depositAmount)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(`/${locale}`)}
                            className="mt-6 w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-600 active:scale-98 transition block"
                        >
                            {isVI ? "Quay về trang chủ" : "Return to Homepage"}
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
                        <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24">
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                                <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-2.5">
                                    {isVI ? "Đang đặt lịch tại" : "You are booking at"}
                                </h4>
                                {loadingClinic ? (
                                    <div className="flex items-center gap-2 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-xs text-slate-400">{isVI ? "Đang tải..." : "Loading..."}</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-slate-100 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                                            {clinic?.logoUrl ? (
                                                <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{clinic?.name}</h3>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{clinic?.address}</span>
                                            </p>
                                            {clinic?.phone && (
                                                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 font-medium">
                                                    <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                                    <span>{clinic.phone}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                                    <HeartPulse className="w-4 h-4 text-primary" />
                                    {isVI ? "Thông tin tóm tắt" : "Appointment Summary"}
                                </h4>
                                <div className="space-y-1">
                                    <Row label={isVI ? "Bác sĩ" : "Doctor"} value={selectedDoctor ? `${selectedDoctor.title ? selectedDoctor.title + ' ' : ''}${selectedDoctor.fullName}` : undefined} />
                                    <Row label={isVI ? "Dịch vụ" : "Service"} value={selectedService ? `${selectedService.serviceName} (${selectedService.price ? formatCurrency(selectedService.price) : "0đ"})` : undefined} />
                                    <Row label={isVI ? "Ngày khám" : "Date"} value={selectedDate ? formatDisplayDate(selectedDate) : undefined} />
                                    <Row label={isVI ? "Giờ khám" : "Time"} value={selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : undefined} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                                    <ShieldCheck className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-white/20 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <h5 className="font-bold text-sm leading-snug mb-1">
                                        {isVI ? "Cam kết bảo mật & an toàn" : "100% Secure & Confidential"}
                                    </h5>
                                    <p className="text-[11px] text-white/80 leading-relaxed">
                                        {isVI
                                            ? "Mọi thông tin bệnh án và hồ sơ cá nhân đều được bảo mật nghiêm ngặt."
                                            : "Your medical profiles and schedules are fully encrypted with health-data standard."}
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <div className="flex-1 w-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100">
                                {isVI ? "Chi tiết lịch hẹn" : "Appointment Details"}
                            </h2>

                            {error && (
                                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-600">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        {isVI ? "Hồ sơ bệnh nhân" : "Patient Profile"} <span className="text-rose-500">*</span>
                                    </label>
                                    {loadingProfiles ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /></div>
                                    ) : (
                                        <select
                                            value={patientId}
                                            onChange={(e) => setPatientId(e.target.value)}
                                            required
                                            className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        >
                                            <option value="">-- {isVI ? "Chọn hồ sơ người khám" : "Select patient profile"} --</option>
                                            {patientProfiles.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.fullName} {p.gender && `(${p.gender === 'MALE' ? (isVI ? 'Nam' : 'Male') : (isVI ? 'Nữ' : 'Female')})`} {p.relationship && ` - ${p.relationship}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                        {isVI ? "Bác sĩ khám" : "Doctor"} <span className="text-rose-500">*</span>
                                    </label>
                                    {loadingDoctors ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /></div>
                                    ) : (
                                        <select
                                            value={doctorId}
                                            onChange={(e) => {
                                                setDoctorId(e.target.value)
                                                setSelectedDate(null)
                                                setSlotId("")
                                            }}
                                            required
                                            className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        >
                                            <option value="">-- {isVI ? "Chọn bác sĩ phụ trách" : "Select doctor"} --</option>
                                            {doctors.map(d => (
                                                <option key={d.id_doctor} value={d.id_doctor}>
                                                    {d.title ? `${d.title} ` : ""}{d.fullName} {d.specialtyName ? `(${d.specialtyName})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                        {isVI ? "Dịch vụ/Gói khám chuyên khoa" : "Medical Service"}
                                    </label>
                                    {loadingServices ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /></div>
                                    ) : (
                                        <select
                                            value={serviceId}
                                            onChange={(e) => setServiceId(e.target.value)}
                                            className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        >
                                            <option value="">-- {isVI ? "Chọn dịch vụ (Tùy chọn)" : "Select service (Optional)"} --</option>
                                            {services.map(s => (
                                                <option key={s.id_service} value={s.id_service}>
                                                    {s.serviceName} {s.price ? ` - ${formatCurrency(s.price)}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {doctorId && (
                                    <div className="space-y-2 pt-1">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {isVI ? "Chọn Ngày Khám" : "Select Appointment Date"}
                                        </label>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {getAvailableDates().map((date, idx) => {
                                                const active = selectedDate ? isSameDay(date, selectedDate) : false
                                                const currentToday = isToday(date)
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDate(date)
                                                            setSlotId("")
                                                        }}
                                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${active
                                                            ? "bg-primary text-white border-primary shadow-sm"
                                                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                                            }`}
                                                    >
                                                        <span className={`text-[10px] font-bold ${active ? "text-white/85" : "text-slate-400"}`}>
                                                            {getDayName(date)}
                                                        </span>
                                                        <span className="text-sm font-bold mt-0.5">{date.getDate()}</span>
                                                        <span className={`text-[9px] font-medium mt-0.5 ${active ? "text-white/80" : "text-slate-400"}`}>
                                                            Th.{getMonthName(date)}
                                                        </span>
                                                        {currentToday && !active && (
                                                            <span className="text-[8px] font-bold text-primary mt-0.5">H.Nay</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {doctorId && selectedDate && (
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {isVI ? "Chọn Giờ Khám Chi Tiết" : "Select Timeslot"}
                                        </label>

                                        {loadingSlots ? (
                                            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-6">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                <span>{isVI ? "Đang tải danh sách khung giờ..." : "Loading timeslots..."}</span>
                                            </div>
                                        ) : slots.length === 0 ? (
                                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                                {isVI ? "Bác sĩ không có lịch làm việc trong ngày này." : "No schedules available for this day."}
                                            </p>
                                        ) : !hasAvailableSlots(slots) ? (
                                            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-1.5">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                                                <p>{isVI ? "Không còn khung giờ khả dụng trong ngày này. Vui lòng chọn ngày khác." : "No available timeslots left. Please choose another date."}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                                {Array.from(groupSlotsByShift(slots).entries()).map(([shift, shiftSlots]) => {
                                                    const validSlots = shiftSlots.filter(slot => slot.isAvailable && !isSlotInPast(slot))
                                                    if (validSlots.length === 0) return null
                                                    const config = SHIFT_CONFIG[shift]

                                                    return (
                                                        <div key={shift} className="space-y-2">
                                                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${config.bgColor} ${config.color}`}>
                                                                {config.icon}
                                                                <span>{isVI ? config.labelVi : config.labelEn}</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {shiftSlots.map(slot => {
                                                                    const past = isSlotInPast(slot)
                                                                    const disabled = !slot.isAvailable || past
                                                                    const selected = slotId === slot.id_slot
                                                                    const slotsLeft = slot.maxPatients - slot.currentPatients

                                                                    return (
                                                                        <button
                                                                            key={slot.id_slot}
                                                                            type="button"
                                                                            disabled={disabled}
                                                                            onClick={() => setSlotId(slot.id_slot)}
                                                                            className={`py-2 px-3 border text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center relative ${selected
                                                                                ? "bg-primary border-primary text-white shadow-sm"
                                                                                : disabled
                                                                                    ? "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed line-through opacity-60"
                                                                                    : "bg-white border-slate-200 hover:border-primary/50 hover:text-primary text-slate-700"
                                                                                }`}
                                                                        >
                                                                            <span>{slot.startTime} - {slot.endTime}</span>
                                                                            <span className={`text-[10px] font-medium mt-0.5 ${selected ? "text-blue-100" : "text-slate-400"}`}>
                                                                                {past ? (isVI ? 'Đã qua' : 'Passed') : !slot.isAvailable ? (isVI ? 'Hết chỗ' : 'Full') : (isVI ? `Còn ${slotsLeft} chỗ` : `${slotsLeft} slots`)}
                                                                            </span>
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        {isVI ? "Triệu chứng hoặc Lý do khám bệnh" : "Symptoms / Reason for Visit"}
                                    </label>
                                    <textarea
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        rows={3}
                                        placeholder={isVI ? "Nhập chi tiết các dấu hiệu bất thường về sức khỏe nếu có..." : "Describe your current signs or reasons..."}
                                        className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition resize-none"
                                    />
                                </div>

                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={submitting || !selectedDate || !slotId}
                                        className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{submitting ? (isVI ? "Đang xử lý đặt lịch..." : "Processing...") : (isVI ? "Xác nhận Đặt Lịch Hẹn & Đóng Cọc" : "Confirm Booking & Deposit")}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}