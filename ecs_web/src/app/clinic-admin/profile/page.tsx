"use client"

import { useEffect, useState } from "react"
import { clinicsService } from "@/services/clinic.service"
import Link from "next/link"

interface ClinicProfile {
    id: string
    name: string
    address: string
    phone: string
    email?: string
    logo?: string
    description?: string
    isActive: boolean
    ratingAvg?: number
    reviewCount?: number
    openTime: string
    closeTime: string
}

export default function ClinicProfilePage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [clinic, setClinic] = useState<ClinicProfile | null>(null)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            try {
                const res = await clinicsService.getProfile()
                if (!mounted) return

                if (res && res.data) {
                    const d = res.data as any
                    setClinic({
                        id: d.id,
                        name: d.name,
                        address: d.address,
                        phone: d.phone,
                        email: d.email,
                        logo: d.logoUrl || d.logo,
                        description: d.description,
                        isActive: d.isActive,
                        ratingAvg: d.ratingAvg,
                        reviewCount: d.reviewCount,
                        openTime: d.openTime,
                        closeTime: d.closeTime,
                    })
                } else {
                    setError("Không thể tải thông tin phòng khám lúc này.")
                }
            } catch (err) {
                setError("Đã xảy ra lỗi khi kết nối đến máy chủ.")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [])

    // Helper function để format time
    const formatTime = (time?: string) => {
        if (!time) return "--:--"
        // Nếu time có định dạng "HH:mm:ss" thì cắt lấy "HH:mm"
        return time.length > 5 ? time.substring(0, 5) : time
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center text-gray-500 font-medium text-lg flex flex-col items-center justify-center gap-3">
                <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang tải dữ liệu phòng khám...
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-6 border border-error bg-error-container/10 text-error rounded-2xl font-semibold text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </div>
        )
    }

    if (!clinic) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-2xl">
                Không tìm thấy dữ liệu phòng khám.
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn">

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hồ sơ phòng khám</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Quản lý và xem thông tin chi tiết cơ sở y tế của bạn</p>
                </div>
                <Link
                    href="/clinic-admin/edit-profile"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Chỉnh sửa hồ sơ
                </Link>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">

                <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-inner shrink-0 flex items-center justify-center overflow-hidden">
                        {clinic.logo ? (
                            <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-primary/5 text-primary text-2xl font-black rounded-xl flex items-center justify-center">
                                {clinic.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5">
                            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
                                {clinic.name}
                            </h2>
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full tracking-wide border ${clinic.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${clinic.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                    {clinic.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                            <div className="flex items-center text-amber-500">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-bold text-gray-900 ml-1 text-base">
                                    {clinic.ratingAvg ? clinic.ratingAvg.toFixed(1) : "0.0"}
                                </span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="font-medium text-gray-600">
                                {clinic.reviewCount ?? 0} lượt đánh giá từ khách hàng
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Địa chỉ - chiếm 2 cột */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition md:col-span-2">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Địa chỉ hoạt động</span>
                                <p className="text-gray-800 font-semibold leading-relaxed text-base">{clinic.address}</p>
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Số điện thoại liên hệ</span>
                                <p className="text-gray-800 font-bold text-base tracking-wide">{clinic.phone}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition">
                            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5 w-full overflow-hidden">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Địa chỉ Email</span>
                                <p className="text-gray-800 font-bold text-base break-all">{clinic.email || "Chưa cập nhật"}</p>
                            </div>
                        </div>

                        {/* THÊM: Giờ mở cửa */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition">
                            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Giờ mở cửa</span>
                                <p className="text-gray-800 font-bold text-base">
                                    {formatTime(clinic.openTime)} - {formatTime(clinic.closeTime)}
                                </p>
                            </div>
                        </div>

                        {/* THÊM: Trạng thái hoạt động (có thể để ở đây hoặc giữ ở header) */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition">
                            <div className={`p-2.5 rounded-xl shrink-0 ${clinic.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Trạng thái hoạt động</span>
                                <p className={`font-bold text-base ${clinic.isActive ? "text-emerald-600" : "text-rose-600"
                                    }`}>
                                    {clinic.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                </p>
                            </div>
                        </div>

                    </div>

                    {clinic.description && (
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Giới thiệu chi tiết</span>
                            <div className="bg-gray-50 border border-gray-200/60 p-5 rounded-2xl">
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {clinic.description}
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}