"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Stethoscope,
    Calendar,
    Clock,
    User,
    Mail,
    CalendarDays,
    Star,
    Loader2,
    AlertCircle,
    CheckCircle2,
    FileText,
    Circle,
    Smartphone,
    Smile
} from "lucide-react"

import { appointmentHistoryService } from "@/services"
import type { GetAppointmentDetailResponse } from "@/services/appointment-history.service"
import { ApiError } from "@/lib/axios"

export default function AppointmentDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const appointmentId = searchParams.get("id")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [appointment, setAppointment] = useState<GetAppointmentDetailResponse | null>(null)

    useEffect(() => {
        if (!appointmentId) {
            setError("Không tìm thấy ID cuộc hẹn")
            setLoading(false)
            return
        }

        loadAppointmentDetail()
    }, [appointmentId])

    const loadAppointmentDetail = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await appointmentHistoryService.getDetail({
                appointmentId: appointmentId!
            })

            if (response.data) {
                setAppointment(response.data)
            } else {
                setError("Không thể tải thông tin cuộc hẹn")
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                switch (err.codeMessage) {
                    case "APP_MESSAGE_4001":
                        setError("Vui lòng đăng nhập để xem chi tiết cuộc hẹn")
                        break
                    case "APP_MESSAGE_4046":
                        setError("Không tìm thấy cuộc hẹn")
                        break
                    case "APP_MESSAGE_4053":
                        setError("Bạn không có quyền xem cuộc hẹn này")
                        break
                    default:
                        setError(err.codeMessage || "Không thể tải thông tin cuộc hẹn")
                }
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Không thể tải thông tin cuộc hẹn"
                )
            }
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200/60"
            case "BOOKED":
                return "bg-sky-50 text-sky-700 border-sky-200/60"
            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/60"
            case "CANCELLED":
                return "bg-rose-50 text-rose-700 border-rose-200/60"
            case "IN_PROGRESS":
                return "bg-violet-50 text-violet-700 border-violet-200/60"
            default:
                return "bg-slate-50 text-slate-700 border-slate-200/60"
        }
    }

    const getStatusText = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING": return "Chờ xác nhận"
            case "BOOKED": return "Đã xác nhận"
            case "COMPLETED": return "Đã hoàn thành"
            case "CANCELLED": return "Đã hủy"
            case "IN_PROGRESS": return "Đang khám"
            default: return status
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-100"
                            }`}
                    />
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-slate-50/50 rounded-3xl">
                <div className="flex flex-col items-center gap-4 p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-500">Đang tối ưu dữ liệu cuộc hẹn...</p>
                </div>
            </div>
        )
    }

    if (error || !appointment) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 border border-rose-100">
                        <AlertCircle className="w-7 h-7 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                    >
                        Quay lại trang cũ
                    </button>
                </div>
            </div>
        )
    }

    const isCompleted = appointment.status?.toUpperCase() === "COMPLETED"

    if (!isCompleted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 border border-amber-100">
                        <AlertCircle className="w-7 h-7 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Cuộc hẹn chưa hoàn thành</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                        Trang chi tiết chuyên sâu chỉ hiển thị dữ liệu cho các cuộc hẹn đã hoàn tất kiểm tra y khoa.
                        <span className="block mt-2 font-medium text-slate-700">
                            Trạng thái hiện tại: {getStatusText(appointment.status)}
                        </span>
                    </p>
                    <div className="flex gap-3 w-full max-w-xs">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 transition-all"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => router.push(`/patient/appointment-history`)}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-100 transition-all"
                        >
                            Xem lịch sử
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 antialiased text-slate-800">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200/50 text-slate-600 transition-all bg-white shadow-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết Cuộc hẹn</h1>
                    </div>
                </div>
                <div className={`self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(appointment.status)}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    {getStatusText(appointment.status)}
                </div>
            </div>

            <div className="space-y-6">
                {/* Clinic Main Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                            <Building2 className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{appointment.clinicName}</h3>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="line-clamp-2">{appointment.clinicAddress}</span>
                                </div>
                                {appointment.clinicPhone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-medium">{appointment.clinicPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Medical Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
                            <Stethoscope className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bác sĩ phụ trách</span>
                            <p className="font-bold text-slate-900 mt-0.5">{appointment.doctorName}</p>
                            {appointment.doctorTitle && (
                                <p className="text-xs font-medium text-slate-500">{appointment.doctorTitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/50">
                            <CalendarDays className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dịch vụ đăng ký</span>
                            <p className="font-bold text-slate-900 mt-0.5 line-clamp-1">{appointment.serviceName}</p>
                            <p className="text-xs text-slate-400">Khám theo yêu cầu</p>
                        </div>
                    </div>
                </div>

                {/* Date & Time Slot */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md grid grid-cols-2 divide-x divide-slate-700/50">
                    <div className="flex items-center gap-3.5 pl-2">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Ngày hẹn khám</span>
                            <p className="text-sm font-bold mt-0.5">{appointment.appointmentDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 pl-6">
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Khung giờ đặt</span>
                            <p className="text-sm font-bold mt-0.5">{appointment.timeSlot}</p>
                        </div>
                    </div>
                </div>

                {/* Patient Information */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                        <User className="w-4 h-4 text-slate-400" />
                        Hồ sơ bệnh nhân
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 font-medium">Họ và tên</span>
                            <p className="text-sm font-semibold text-slate-900">{appointment.patientName}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 font-medium">Số điện thoại</span>
                            <p className="text-sm font-semibold text-slate-900">{appointment.patientPhone}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 font-medium">Địa chỉ Email</span>
                            <p className="text-sm font-semibold text-slate-900 truncate">{appointment.patientEmail}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 font-medium">Ngày sinh</span>
                            <p className="text-sm font-semibold text-slate-900">{appointment.patientDob}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 font-medium">Giới tính</span>
                            <p className="text-sm font-semibold text-slate-900">
                                {appointment.patientGender === "MALE" ? "Nam" :
                                    appointment.patientGender === "FEMALE" ? "Nữ" :
                                        appointment.patientGender || "---"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Symptoms */}
                {(appointment.symptoms) && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointment.symptoms && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    Triệu chứng / Ghi chú
                                </h4>
                                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-100 leading-relaxed font-medium">
                                    {appointment.symptoms}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback Review Section */}
                {appointment.feedback && (
                    <div className="bg-amber-50/40 rounded-3xl border border-amber-100/70 p-6 space-y-4">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Phản hồi & Đánh giá của bạn
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/50">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-slate-500">Chất lượng bác sĩ</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {renderStars(appointment.feedback.ratingDoctor)}
                                    <span className="text-xs font-bold text-slate-600">({appointment.feedback.ratingDoctor}/5)</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                                <span className="text-xs font-medium text-slate-500">Dịch vụ phòng khám</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {renderStars(appointment.feedback.ratingClinic)}
                                    <span className="text-xs font-bold text-slate-600">({appointment.feedback.ratingClinic}/5)</span>
                                </div>
                            </div>
                        </div>

                        {appointment.feedback.comment && (
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-slate-400 block pl-1">Ý kiến đóng góp</span>
                                <p className="text-sm text-slate-700 italic bg-white/50 border border-slate-100 rounded-xl p-3.5 leading-relaxed">
                                    "{appointment.feedback.comment}"
                                </p>
                            </div>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 pl-1">
                            Gửi ngày {appointment.feedback.createdAt}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        onClick={() => router.back()}
                        className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all text-center"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={() => router.push(`/patient/appointment-history`)}
                        className="w-full sm:flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-100 active:scale-[0.99] transition-all text-center"
                    >
                        Xem lịch sử tất cả cuộc hẹn
                    </button>
                </div>
            </div>
        </div>
    )
}