"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Search,
    ChevronLeft,
    ChevronRight,
    User,
    Phone,
    Calendar,
    Users,
    AlertCircle,
    Plus,
    UserPlus,
    IdCard,
} from "lucide-react"

import { patientProfileService } from "@/services"
import type { GetPatientProfileResponse } from "@/services/patient-profile.service"
import type { MetaResponse } from "@/types"

export default function PatientProfilesPage() {
    const params = useParams()
    const router = useRouter()

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
        return "vi"
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

    const t = (vi: string, en: string) => (currentLocale === "en" ? en : vi)

    const [profiles, setProfiles] = useState<GetPatientProfileResponse[]>([])
    const [metadata, setMetadata] = useState<MetaResponse | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(10)
    const locale = currentLocale

    const handleViewDetail = (profileId: string) => {
        router.push(`/${locale}/patient/profiles/detail?id=${profileId}`)
    }

    const handleCreateProfile = () => {
        router.push(`/${locale}/patient/profiles/create`)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setPageNumber(1)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await patientProfileService.getAll({
                searchTerm: debouncedSearchTerm,
                pageNumber,
                pageSize,
            })

            setProfiles(response.data || [])

            if (response.meta) {
                setMetadata(response.meta)
            }
        } catch (err: any) {
            setError(err?.message || t("Không thể tải danh sách hồ sơ", "Failed to load patient profiles"))
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm, pageNumber, pageSize, currentLocale])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    const getGenderBadge = (gender: string) => {
        const normalized = gender?.toLowerCase() || "";
        if (normalized === "nam" || normalized === "male") {
            return {
                text: t("Nam", "Male"),
                className: "bg-blue-50 text-blue-700 border border-blue-100"
            };
        }
        if (normalized === "nữ" || normalized === "nu" || normalized === "female") {
            return {
                text: t("Nữ", "Female"),
                className: "bg-rose-50 text-rose-700 border border-rose-100"
            };
        }
        return {
            text: gender || t("Khác", "Other"),
            className: "bg-slate-50 text-slate-700 border border-slate-100"
        };
    };

    const getRelationshipLabel = (rel?: string) => {
        const lower = rel?.toLowerCase() || ""
        if (lower === "self" || lower === "bản thân") return t("Bản thân", "Self")
        if (lower === "father" || lower === "bố" || lower === "cha") return t("Bố / Cha", "Father")
        if (lower === "mother" || lower === "mẹ") return t("Mẹ", "Mother")
        if (lower === "child" || lower === "con") return t("Con", "Child")
        if (lower === "spouse" || lower === "vợ/chồng") return t("Vợ / Chồng", "Spouse")
        if (lower === "relative" || lower === "người thân") return t("Người thân", "Relative")
        return rel || ""
    }

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto antialiased animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
                        {t("Danh sách hồ sơ", "Patient Profiles")}
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        {t("Danh sách hồ sơ của bạn và người thân đã liên kết trong hệ thống", "List of patient profiles for you and linked family members")}
                    </p>
                </div>

                <button
                    onClick={handleCreateProfile}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:opacity-90 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
                >
                    <Plus className="w-4.5 h-4.5" />
                    {t("Tạo mới hồ sơ", "Add New Profile")}
                </button>
            </div>

            {/* Search Box */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("Tìm theo họ tên, số CCCD hoặc số điện thoại...", "Search by name, ID number or phone number...")}
                        className="w-full pl-11 pr-4 py-1.5 text-sm text-slate-900 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/50 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-100/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-600 min-w-[950px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                <th className="px-6 py-4 text-left">{t("HỌ TÊN", "FULL NAME")}</th>
                                <th className="px-6 py-4 text-left">{t("GIỚI TÍNH", "GENDER")}</th>
                                <th className="px-6 py-4 text-left">{t("NGÀY SINH", "DATE OF BIRTH")}</th>
                                <th className="px-6 py-4 text-left">{t("CCCD / CMND", "ID CARD")}</th>
                                <th className="px-6 py-4 text-left">{t("SỐ ĐIỆN THOẠI", "PHONE NUMBER")}</th>
                                <th className="px-6 py-4 text-left">{t("QUAN HỆ", "RELATIONSHIP")}</th>
                                <th className="px-6 py-4 text-center">{t("HÀNH ĐỘNG", "ACTIONS")}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 bg-slate-100 rounded-full" />
                                                <div className="h-4.5 bg-slate-100 rounded-md w-1/4" />
                                                <div className="h-4.5 bg-slate-100 rounded-md w-1/12 ml-auto" />
                                                <div className="h-4.5 bg-slate-100 rounded-md w-1/6 ml-auto" />
                                                <div className="h-4.5 bg-slate-100 rounded-md w-1/6 ml-auto" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                profiles.map((item) => {
                                    const genderBadge = getGenderBadge(item.gender);
                                    return (
                                        <tr
                                            key={item.id_patientProfile}
                                            className="hover:bg-slate-50/70 transition-colors duration-150 group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 font-semibold text-slate-900">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="group-hover:text-primary transition-colors">{item.fullName}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${genderBadge.className}`}>
                                                    {genderBadge.text}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {item.dob}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600 tracking-wide">
                                                {item.identityNumber ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <IdCard className="w-3.5 h-3.5 text-slate-400" />
                                                        {item.identityNumber}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    {item.phoneNumber || <span className="text-slate-300">—</span>}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
                                                    <Users className="w-3 h-3 text-slate-500" />
                                                    {getRelationshipLabel(item.relationship)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(item.id_patientProfile)}
                                                    className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary hover:text-white active:scale-95 shadow-sm transition-all cursor-pointer"
                                                >
                                                    {t("Xem đơn thuốc & Chi tiết", "View Prescriptions & Details")}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && profiles.length === 0 && (
                    <div className="py-20 px-4 flex flex-col items-center justify-center text-center animate-in fade-in">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100 shadow-inner">
                            <UserPlus className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                            {t("Không tìm thấy hồ sơ bệnh nhân", "No patient profiles found")}
                        </h3>
                        <p className="text-sm text-slate-400 max-w-xs mb-5">
                            {t("Hệ thống chưa ghi nhận hồ sơ nào khớp với bộ lọc của bạn.", "No profiles match your search criteria.")}
                        </p>
                        <button
                            onClick={handleCreateProfile}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-slate-500" />
                            {t("Tạo mới hồ sơ", "Add New Profile")}
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {metadata && metadata.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">
                            {t("Trang", "Page")} <span className="text-slate-900 font-bold">{metadata.page}</span> {t("trên", "of")} <span className="text-slate-900 font-bold">{metadata.totalPages}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={!metadata.hasPrevious}
                                onClick={() => setPageNumber((p) => p - 1)}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 active:bg-slate-100 transition-all shadow-sm disabled:pointer-events-none"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>

                            <button
                                disabled={!metadata.hasNext}
                                onClick={() => setPageNumber((p) => p + 1)}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 active:bg-slate-100 transition-all shadow-sm disabled:pointer-events-none"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}