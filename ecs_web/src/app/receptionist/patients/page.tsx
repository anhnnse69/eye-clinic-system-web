"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Users, RotateCcw, Edit2, Eye,
    Phone, CreditCard, User, AlertCircle,
    ChevronLeft, ChevronRight, Plus
} from "lucide-react"
import { receptionistService, PatientProfileItem } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"

enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

const PRIMARY_COLOR = "#00658D"

export default function PatientProfilesListPage() {
    const router = useRouter()
    const t = useTranslations("receptionist.patient")

    // --- Filter States ---
    const [searchName, setSearchName] = useState<string>("")
    const [searchPhone, setSearchPhone] = useState<string>("")

    // --- Debounce States ---
    const [debouncedName, setDebouncedName] = useState<string>("")
    const [debouncedPhone, setDebouncedPhone] = useState<string>("")

    // --- API Data States ---
    const [patients, setPatients] = useState<PatientProfileItem[]>([])

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [pageSize] = useState<number>(10)

    // --- UI Status States ---
    const [loading, setLoading] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // ==========================================
    // Walk-in Examination Flow
    // ==========================================
    const [walkInFlow, setWalkInFlow] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedFlow = sessionStorage.getItem("pending_walkin_appointment")
            if (savedFlow) {
                setWalkInFlow(JSON.parse(savedFlow))
            }
        }
    }, [])

    const handleSelectPatientForWalkIn = (patient: PatientProfileItem) => {
        if (!walkInFlow) return

        const updatedFlow = {
            ...walkInFlow,
            step: 2,
            patientProfileId: patient.id,
            patientName: patient.fullName,
            patientPhone: patient.phoneNumber,
            patientDob: patient.dob
        }

        sessionStorage.setItem("pending_walkin_appointment", JSON.stringify(updatedFlow))
        router.push("/receptionist/walk-in-registration")
    }
    // ==========================================

    // --- Debounce Handler ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedName(searchName)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchName])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPhone(searchPhone)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchPhone])

    // --- Fetch Patient Profiles API ---
    const fetchPatientProfiles = useCallback(async () => {
        try {
            setLoading(true)
            setErrorMsg(null)

            const response = await receptionistService.getPatients({
                pageNumber: currentPage,
                pageSize: pageSize,
                searchName: debouncedName.trim() || undefined,
                searchPhone: debouncedPhone.trim() || undefined,
            })

            if (response && response.data) {
                setPatients(response.data)
                if (response.meta) {
                    setTotalItems(response.meta.total || 0)
                    setTotalPages(response.meta.totalPages || 1)
                }
            } else {
                setPatients([])
                setErrorMsg(t("loadErrorCode", { code: response.codeMessage }))
            }
        } catch (error: any) {
            setPatients([])
            const apiErrorCodeMessage = handleApiError(error)
            setErrorMsg(apiErrorCodeMessage || "APP_MESSAGE_5000")
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, debouncedName, debouncedPhone, t])

    useEffect(() => {
        fetchPatientProfiles()
    }, [fetchPatientProfiles])

    const handleResetFilters = () => {
        setSearchName("")
        setSearchPhone("")
        setCurrentPage(1)
    }

    const renderGender = (gender: string) => {
        switch (gender) {
            case Gender.MALE: return t("male")
            case Gender.FEMALE: return t("female")
            default: return t("other")
        }
    }

    const notAvailableText = t("notAvailable")
    const addressNotUpdatedText = t("addressNotUpdated")

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 rounded-xl"
                        style={{ backgroundColor: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR }}
                    >
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            {t("manageTitle")}
                            {walkInFlow && (
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 animate-pulse">
                                    {t("walkInBadge")}
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">{t("manageSubtitle")}</p>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/receptionist/patients/create")}
                    className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    <Plus className="h-4 w-4" />
                    <span>{t("createBtn")}</span>
                </button>
            </div>

            {/* Search Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {t("searchNameLabel")}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t("searchNamePlaceholder")}
                                value={searchName}
                                onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-400"
                                style={{
                                    borderColor: searchName ? PRIMARY_COLOR : undefined,
                                    boxShadow: searchName ? `0 0 0 2px ${PRIMARY_COLOR}20` : undefined,
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            {t("searchPhoneLabel")}
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t("searchPhonePlaceholder")}
                                value={searchPhone}
                                onChange={(e) => { setSearchPhone(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-400"
                                style={{
                                    borderColor: searchPhone ? PRIMARY_COLOR : undefined,
                                    boxShadow: searchPhone ? `0 0 0 2px ${PRIMARY_COLOR}20` : undefined,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {(searchName || searchPhone) && (
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white font-semibold px-3 py-1.5 hover:rounded-lg transition-colors border border-dashed border-slate-200"
                            style={{ color: undefined }}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t("resetFilters")}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 shadow-sm">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-bold">{t("errorTitle")}</p>
                        <p className="opacity-90">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Data Display Block */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-3"
                        style={{ borderColor: `${PRIMARY_COLOR} transparent ${PRIMARY_COLOR} ${PRIMARY_COLOR}` }}
                    ></div>
                    <p className="text-sm font-medium">{t("loadingData")}</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium">{t("noResults")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse block md:table">
                                <thead className="bg-slate-50/70 border-b border-slate-100 block md:table-header-group">
                                    <tr className="block md:table-row">
                                        <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider block md:table-cell">
                                            {t("thCode")}
                                        </th>
                                        <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider block md:table-cell">
                                            {t("thDobGender")}
                                        </th>
                                        <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider block md:table-cell">
                                            {t("thContact")}
                                        </th>
                                        <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider block md:table-cell">
                                            {t("thCccdBhyt")}
                                        </th>
                                        <th className="p-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right block md:table-cell">
                                            {t("thActions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 block md:table-row-group">
                                    {patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors block md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-100 relative">
                                            <td className="p-3 block md:table-cell before:content-['Họ_tên:'] md:before:content-none before:font-bold before:text-xs before:text-slate-400 before:block md:before:inline mb-1.5 md:mb-0">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{patient.fullName}</span>
                                                </div>
                                            </td>

                                            <td className="p-3 block md:table-cell before:content-['Ngày_sinh_/_GT:'] md:before:content-none before:font-bold before:text-xs before:text-slate-400 before:block md:before:inline mb-1.5 md:mb-0">
                                                <div className="flex flex-col text-sm text-slate-600">
                                                    <span>{patient.dob}</span>
                                                    <span className="text-xs text-slate-400 mt-0.5">{renderGender(patient.gender)}</span>
                                                </div>
                                            </td>

                                            <td className="p-3 block md:table-cell before:content-['Liên_hệ:'] md:before:content-none before:font-bold before:text-xs before:text-slate-400 before:block md:before:inline mb-1.5 md:mb-0">
                                                <div className="flex flex-col text-sm text-slate-600 max-w-[250px]">
                                                    <span className="font-medium flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {patient.phoneNumber || notAvailableText}
                                                    </span>
                                                    <span className="text-xs text-slate-400 truncate mt-0.5" title={patient.address || ""}>
                                                        {patient.address || addressNotUpdatedText}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-3 block md:table-cell before:content-['CCCD_/_BHYT:'] md:before:content-none before:font-bold before:text-xs before:text-slate-400 before:block md:before:inline mb-1.5 md:mb-0">
                                                <div className="flex flex-col text-xs text-slate-500 font-mono space-y-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3 text-slate-400" />
                                                        {t("identityLabel")} {patient.identityNumber || notAvailableText}
                                                    </span>
                                                    <span>{t("bhytLabel")} {patient.bhytNumber || notAvailableText}</span>
                                                </div>
                                            </td>

                                            <td className="p-3 text-right block md:table-cell">
                                                {walkInFlow ? (
                                                    <button
                                                        onClick={() => handleSelectPatientForWalkIn(patient)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1 ml-auto"
                                                    >
                                                        <User className="h-3.5 w-3.5" />
                                                        {t("selectWalkin")}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => router.push(`/receptionist/patients/view/${patient.id}`)}
                                                            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                            title={t("viewDetail")}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => router.push(`/receptionist/patients/edit/${patient.id}`)}
                                                            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                                                            title={t("editProfile")}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50">
                        <span className="text-xs font-medium text-slate-500">
                            {t("paginationInfo", {
                                from: Math.min((currentPage - 1) * pageSize + 1, totalItems),
                                to: Math.min(currentPage * pageSize, totalItems),
                                total: totalItems
                            })}
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[32px] h-8 text-xs font-bold rounded-xl border transition-all ${currentPage === page
                                        ? "text-white border-transparent shadow-sm"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    style={currentPage === page ? { backgroundColor: PRIMARY_COLOR } : undefined}
                                    aria-label={t("pageLabel", { page })}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}