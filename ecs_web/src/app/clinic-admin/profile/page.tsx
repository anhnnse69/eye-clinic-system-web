"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { clinicsService } from "@/services/clinic.service"
import { handleApiError } from "@/lib/axios"
import Link from "next/link"
import { 
    Building2, 
    Phone, 
    Mail, 
    Clock, 
    Globe, 
    Pencil, 
    Star, 
    MapPin, 
    AlertCircle, 
    CheckCircle2 
} from "lucide-react"

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
    const t = useTranslations("clinicAdmin.profile")
    const tEdit = useTranslations("clinicAdmin.editProfile")

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
                setError(t("loadFailed"))
            }
        } catch (err) {
            const errorMessage = handleApiError(err)
            setError(errorMessage || t("loadFailed"))
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
        return () => { mounted = false }
    }, [t])

    const formatTime = (time?: string) => {
        if (!time) return "--:--"
        return time.length > 5 ? time.substring(0, 5) : time
    }

    const handleOpenPublishModal = () => {
        setPublishError(null)
        setShowPublishModal(true)
    }

    const handleClosePublishModal = () => {
        setShowPublishModal(false)
        setPublishError(null)
    }

    // Map mã lỗi từ backend thành thông điệp thân thiện với người dùng
    const getErrorMessage = (codeMessage?: string): string => {
        switch (codeMessage) {
            case "APP_MESSAGE_4019":
                return "Hồ sơ phòng khám chưa hoàn thiện. Vui lòng kiểm tra lại: Logo, Địa chỉ, SĐT, Email, Giờ làm việc, Nhân sự (Bác sĩ & Lễ tân), Phòng khám và Dịch vụ."
            case "APP_MESSAGE_4058":
                return "Bạn không có quyền gửi yêu cầu công khai cho phòng khám này."
            case "APP_MESSAGE_4059":
                return "Phòng khám đã được công khai trước đó."
            case "APP_MESSAGE_4000":
                return "Yêu cầu công khai phòng khám đã được gửi và đang chờ duyệt."
            default:
                return codeMessage || t("loadFailed")
        }
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
                setPublishSuccess(t("requestSubmitted"))
                setShowPublishModal(false)
                await loadClinicData()
            } else {
                const msg = getErrorMessage(response?.codeMessage)
                setPublishError(msg)
            }
        } catch (err: any) {
            const apiErrorMsg = handleApiError(err)
            // Nếu err trả về response có codeMessage đặc thù
            const codeMsg = err?.response?.data?.codeMessage
            setPublishError(codeMsg ? getErrorMessage(codeMsg) : (apiErrorMsg || t("loadFailed")))
        } finally {
            setPublishing(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center text-on-surface-variant font-medium text-lg flex flex-col items-center justify-center gap-3 bg-background min-h-screen">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                {t("loadingData")}
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-6 border border-error-container bg-error-container/20 text-error rounded-2xl font-semibold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
            </div>
        )
    }

    if (!clinic) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-12 text-center text-on-surface-variant border border-dashed border-outline-variant/60 rounded-2xl bg-background">
                {t("loadFailed")}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-background min-h-screen space-y-6">

            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">{t("title")}</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">{t("manageSubtitle")}</p>
                </div>
                <Link
                    href="/clinic-admin/edit-profile"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-xs hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                    <Pencil className="w-4 h-4" />
                    {tEdit("title")}
                </Link>
            </div>

            {/* Success notification */}
            {publishSuccess && (
                <div className="p-4 bg-[#6ffbbe]/25 border border-[#4edea3]/60 rounded-2xl text-[#003925] font-medium flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#006c49]" />
                    <span>{publishSuccess}</span>
                </div>
            )}

            {/* General publish error notification (if modal closed) */}
            {publishError && !showPublishModal && (
                <div className="p-4 bg-error-container/30 border border-error-container rounded-2xl text-error font-medium flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0 text-error mt-0.5" />
                    <span>{publishError}</span>
                </div>
            )}

            {/* Main profile card */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 shadow-xs rounded-2xl overflow-hidden">

                {/* Banner & Header Info */}
                <div className="p-6 md:p-8 bg-surface-container-low border-b border-outline-variant/30 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-1.5 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                        {clinic.logo ? (
                            <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-[#c6e7ff]/40 text-primary text-2xl font-black rounded-xl flex items-center justify-center border border-[#81cfff]/40">
                                {clinic.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3 w-full">
                        <h2 className="text-xl md:text-2xl font-extrabold text-on-surface leading-snug">{clinic.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-on-surface-variant">
                            <div className="flex items-center text-amber-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-on-surface ml-1 text-base">{clinic.ratingAvg ? clinic.ratingAvg.toFixed(1) : "0.0"}</span>
                            </div>
                            <span className="text-outline-variant">•</span>
                            <span className="font-medium text-on-surface-variant">{clinic.reviewCount ?? 0} {t("reviewsFromCustomers")}</span>
                        </div>
                    </div>
                </div>

                {/* Profile detail grid */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Address */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-low/80 transition md:col-span-2">
                            <div className="p-2.5 bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 rounded-xl shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("operatingAddress")}</span>
                                <p className="text-on-surface font-semibold leading-relaxed text-base">{clinic.address}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-low/80 transition">
                            <div className="p-2.5 bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 rounded-xl shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("contactPhone")}</span>
                                <p className="text-on-surface font-bold text-base tracking-wide">{clinic.phone}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-low/80 transition">
                            <div className="p-2.5 bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 rounded-xl shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 w-full overflow-hidden">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("emailAddress")}</span>
                                <p className="text-on-surface font-bold text-base break-all">{clinic.email || "—"}</p>
                            </div>
                        </div>

                        {/* Open hours */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-low/80 transition">
                            <div className="p-2.5 bg-[#6ffbbe]/25 text-[#003925] border border-[#4edea3]/60 rounded-xl shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("openHours")}</span>
                                <p className="text-on-surface font-bold text-base">
                                    {formatTime(clinic.openTime)} - {formatTime(clinic.closeTime)}
                                </p>
                            </div>
                        </div>

                        {/* Public status & publish action */}
                        <div className="flex gap-3.5 items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-low/80 transition">
                            <div className={`p-2.5 rounded-xl shrink-0 border ${clinic.isPublished ? "bg-[#c6e7ff]/40 text-primary border-[#81cfff]/40" : clinic.isPublicationRequested ? "bg-amber-50 text-amber-700 border-amber-200/70" : "bg-surface-container text-on-surface-variant border-outline-variant/40"}`}>
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 flex-1">
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("publicStatus")}</span>
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                    <p className={`font-bold text-base ${clinic.isPublished ? "text-primary" : clinic.isPublicationRequested ? "text-amber-800" : "text-on-surface-variant"}`}>
                                        {clinic.isPublished ? t("isPublished") : clinic.isPublicationRequested ? t("pendingApproval") : t("notPublished")}
                                    </p>

                                    {!clinic.isPublished && !clinic.isPublicationRequested && clinic.isActive && (
                                        <button
                                            onClick={handleOpenPublishModal}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-on-primary text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                                        >
                                            {t("requestPublish")}
                                        </button>
                                    )}

                                    {clinic.isPublicationRequested && !clinic.isPublished && (
                                        <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/70 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-700" />
                                            {t("requestSubmitted")}
                                        </span>
                                    )}

                                    {clinic.isPublished && (
                                        <span className="text-xs text-[#003925] font-semibold bg-[#6ffbbe]/25 px-3 py-1.5 rounded-lg border border-[#4edea3]/60 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#006c49]" />
                                            <span>{t("isPublished")}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Description */}
                    {clinic.description && (
                        <div className="pt-4 border-t border-outline-variant/30 space-y-2">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">{t("detailedDescription")}</span>
                            <div className="bg-surface-container-low border border-outline-variant/40 p-5 rounded-2xl">
                                <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line font-medium">{clinic.description}</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Request publish modal */}
            {showPublishModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-on-surface">{t("modalTitle")}</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                                {t("modalBody", { name: clinic.name })}
                            </p>

                            <div className="bg-[#c6e7ff]/30 border border-[#81cfff]/40 rounded-xl p-4">
                                <p className="text-sm font-bold text-primary">{t("modalNoticeTitle")}</p>
                                <ul className="list-disc list-inside space-y-1 mt-1 text-xs text-on-surface-variant font-medium">
                                    <li>{t("modalNoticeItem")}</li>
                                </ul>
                            </div>

                            {/* Modal error display */}
                            {publishError && (
                                <div className="p-4 bg-error-container/30 border border-error-container rounded-xl text-error text-sm flex items-start gap-2.5">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed font-semibold">{publishError}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={handleClosePublishModal} 
                                disabled={publishing}
                                className="px-4 py-2.5 text-on-surface bg-surface-container-lowest border border-outline-variant/60 rounded-xl font-semibold hover:bg-surface-container-low transition cursor-pointer disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleConfirmPublish} 
                                disabled={publishing}
                                className="px-6 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[120px] shadow-xs cursor-pointer"
                            >
                                {publishing ? t("processing") : t("requestPublish")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}