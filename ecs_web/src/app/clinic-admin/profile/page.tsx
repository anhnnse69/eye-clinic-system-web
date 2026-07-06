"use client"

import { useEffect, useState } from "react"
import { clinicsService } from "@/services/clinic.service"
import { handleApiError } from "@/lib/axios"
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
    isPublished?: boolean
    isPublicationRequested?: boolean
    publicationRequestedAt?: string | null
    ratingAvg?: number
    reviewCount?: number
    openTime: string
    closeTime: string
}

export default function ClinicProfilePage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [clinic, setClinic] = useState<ClinicProfile | null>(null)
    const [publishing, setPublishing] = useState(false)
    const [publishSuccess, setPublishSuccess] = useState<string | null>(null)
    const [publishError, setPublishError] = useState<string | null>(null)
    const [showPublishModal, setShowPublishModal] = useState(false)

    const loadClinicData = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await clinicsService.getProfile()
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
                    isPublished: d.isPublished,
                    isPublicationRequested: d.isPublicationRequested,
                    publicationRequestedAt: d.publicationRequestedAt
                })
            } else {
                setError("Không thể tải thông tin phòng khám lúc này.")
            }
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true

        const load = async () => {
            if (!mounted) return
            await loadClinicData()
        }

        load()

        return () => {
            mounted = false
        }
    }, [])

    const formatTime = (time?: string) => {
        if (!time) return "--:--"
        return time.length > 5 ? time.substring(0, 5) : time
    }

    const handleOpenPublishModal = () => {
        setShowPublishModal(true)
    }

    const handleClosePublishModal = () => {
        setShowPublishModal(false)
        setPublishError(null)
    }

    const handleConfirmPublish = async () => {
        if (!clinic) return

        try {
            setPublishing(true)
            setPublishError(null)
            setPublishSuccess(null)

            const response = await clinicsService.requestPublishClinic(clinic.id)

            if (response && response.codeMessage === "APP_MESSAGE_2000") {
                setClinic(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        isPublicationRequested: true,
                        publicationRequestedAt: new Date().toISOString()
                    }
                })

                setPublishSuccess("Yêu cầu công khai phòng khám đã được gửi thành công! Vui lòng chờ quản trị viên xác nhận.")
                setShowPublishModal(false)
                await loadClinicData()
            } else {
                setPublishError(response?.codeMessage || "Gửi yêu cầu thất bại. Vui lòng thử lại.")
            }
        } catch (err) {
            const errorMessage = handleApiError(err)
            setPublishError(errorMessage || "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.")
        } finally {
            setPublishing(false)
        }
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

            {/* Success message */}
            {publishSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-medium flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{publishSuccess}</span>
                </div>
            )}

            {/* Error message */}
            {publishError && !showPublishModal && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{publishError}</span>
                </div>
            )}

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

                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-gray-100 hover:bg-gray-50/40 transition">
                            <div className={`p-2.5 rounded-xl shrink-0 ${clinic.isPublished
                                ? "bg-blue-50 text-blue-600"
                                : clinic.isPublicationRequested
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-gray-50 text-gray-400"
                                }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                </svg>
                            </div>
                            <div className="space-y-0.5 flex-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Trạng thái công khai</span>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <p className={`font-bold text-base ${clinic.isPublished
                                        ? "text-blue-600"
                                        : clinic.isPublicationRequested
                                            ? "text-amber-600"
                                            : "text-gray-500"
                                        }`}>
                                        {clinic.isPublished
                                            ? "Đã công khai"
                                            : clinic.isPublicationRequested
                                                ? "Đang chờ xác nhận"
                                                : "Chưa công khai"}
                                    </p>

                                    {!clinic.isPublished && !clinic.isPublicationRequested && clinic.isActive && (
                                        <button
                                            onClick={handleOpenPublishModal}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Yêu cầu công khai
                                        </button>
                                    )}

                                    {clinic.isPublicationRequested && !clinic.isPublished && (
                                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Đã gửi yêu cầu - Đang chờ xác nhận
                                        </span>
                                    )}

                                    {clinic.isPublished && (
                                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Đã công khai
                                        </span>
                                    )}
                                </div>
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

            {showPublishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl animate-scaleIn overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Xác nhận yêu cầu công khai</h3>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-base leading-relaxed">
                                Bạn có chắc chắn muốn gửi yêu cầu công khai phòng khám <strong className="text-gray-900">{clinic.name}</strong>?
                            </p>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-blue-700">
                                        <p className="font-semibold">Lưu ý:</p>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                            <li>Sau khi gửi yêu cầu, phòng khám sẽ được xem xét bởi quản trị viên</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {publishError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{publishError}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={handleClosePublishModal}
                                disabled={publishing}
                                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmPublish}
                                disabled={publishing}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[120px]"
                            >
                                {publishing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Xác nhận
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}