"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Building2, ArrowLeft, AlertCircle, Loader2, CheckCircle, MapPin,
    Phone, Mail, X, ChevronLeft, ChevronRight
} from "lucide-react"
import { clinicsService } from "@/services"
import { handleApiError } from "@/lib/axios"
import type { ClinicManagementItem, MetaResponse } from "@/types"

export default function ClinicsPendingPublicationPage() {
    const router = useRouter()
    const t = useTranslations("systemAdmin.clinics.pendingPublications")
    const [allClinics, setAllClinics] = useState<ClinicManagementItem[]>([])
    const [displayedClinics, setDisplayedClinics] = useState<ClinicManagementItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize] = useState<number>(10)
    const [totalPending, setTotalPending] = useState<number>(0)

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: "",
        name: ""
    })
    const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
        isOpen: false,
        message: "",
        type: "success"
    })

    useEffect(() => {
        fetchPendingClinics()
    }, [])

    useEffect(() => {
        if (toast.isOpen) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, isOpen: false }))
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [toast.isOpen])

    const fetchPendingClinics = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await clinicsService.getClinics({
                pageNumber: 1,
                pageSize: 100,
            })

            const resData = response?.data || (response as any)?.Data

            if (resData && Array.isArray(resData)) {
                const pendingList = resData.filter((clinic: any) => {
                    const status = (clinic.status || clinic.Status || "").toUpperCase()
                    const isPublished = clinic.isPublished ?? clinic.IsPublished
                    const isPublicationRequested = clinic.isPublicationRequested ?? clinic.IsPublicationRequested

                    return status === "ACTIVE" && !isPublished && isPublicationRequested
                })

                setAllClinics(pendingList)
                setTotalPending(pendingList.length)
                setCurrentPage(1)
            } else {
                setAllClinics([])
                setTotalPending(0)
            }
        } catch (err) {
            setError(t("loadingList"))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        const slicedClinics = allClinics.slice(startIndex, endIndex)
        setDisplayedClinics(slicedClinics)
    }, [allClinics, currentPage, pageSize])

    const openConfirmModal = (id: string, name: string) => {
        setConfirmModal({ isOpen: true, id, name })
    }

    const handleApprovePublication = async () => {
        const { id } = confirmModal
        setConfirmModal({ isOpen: false, id: "", name: "" })

        try {
            setLoading(true)
            setError(null)

            await clinicsService.approveClinicPublication(id)

            setToast({
                isOpen: true,
                message: t("approveSuccess"),
                type: "success"
            })

            await fetchPendingClinics()
        } catch (err) {
            const apiErrorMessage = handleApiError(err)
            setToast({
                isOpen: true,
                message: t("approveFailure", { message: apiErrorMessage }),
                type: "error"
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    const handleNextPage = () => {
        const totalPages = Math.ceil(totalPending / pageSize)
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    return (
        <div className="space-y-6 w-full min-w-0 px-4 py-4 relative bg-background min-h-screen">

            {/* --- ELEGANT TOAST NOTIFICATION --- */}
            {toast.isOpen && (
                <div className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 min-w-80 max-w-md ${toast.type === "success"
                    ? "bg-[#6ffbbe]/30 border-[#4edea3]/60 text-[#003925]"
                    : "bg-error-container/40 border-error-container text-on-error-container"
                    }`}>
                    {toast.type === "success" ? (
                        <CheckCircle className="h-5 w-5 text-[#006c49] shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    )}
                    <span className="text-sm font-semibold pr-4 leading-normal">{toast.message}</span>
                    <button
                        onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
                        className="p-1 hover:bg-black/5 rounded-lg transition-colors ms-auto shrink-0 text-on-surface-variant hover:text-on-surface"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* --- CONFIRMATION MODAL --- */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 m-0">
                    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 p-6 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 shrink-0 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-2xl text-amber-600 shrink-0">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">{t("confirmTitle")}</h3>
                        </div>

                        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                            {t("confirmMessage", { name: confirmModal.name })}
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, id: "", name: "" })}
                                className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleApprovePublication}
                                className="px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-sm font-semibold hover:bg-[#006c49]/90 shadow-xs transition-colors cursor-pointer"
                            >
                                {t("confirmApprove")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-surface-container rounded-xl transition-colors border border-outline-variant/40 bg-surface-container-lowest shadow-xs text-on-surface-variant hover:text-primary cursor-pointer"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">{t("title")}</h2>
                    <p className="text-sm text-on-surface-variant mt-0.5">{t("subtitle")}</p>
                </div>
            </div>

            {error && (
                <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-on-error-container mb-0.5">{t("systemError")}</h3>
                        <p className="text-sm text-on-error-container">{error}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-12 text-center flex flex-col items-center justify-center min-h-75">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-on-surface-variant">{t("loading")}</p>
                </div>
            )}

            {/* --- DATA TABLE --- */}
            {!loading && totalPending === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-75 w-full">
                    <Building2 className="h-12 w-12 text-on-surface-variant/50 mb-3" />
                    <h3 className="text-lg font-bold text-on-surface mb-1">{t("emptyTitle")}</h3>
                    <p className="text-sm text-on-surface-variant">{t("emptyDescription")}</p>
                </div>
            ) : !loading && (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-250">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-30">{t("tableId")}</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableClinic")}</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("tableContact")}</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-65 whitespace-nowrap">{t("tableActions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {displayedClinics.map((clinic) => {
                                    const id = clinic.id_clinic || (clinic as any).Id_clinic
                                    const name = clinic.clinicName || (clinic as any).ClinicName
                                    const address = clinic.address || (clinic as any).Address
                                    const email = clinic.contactEmail || (clinic as any).ContactEmail
                                    const phone = clinic.contactPhone || (clinic as any).ContactPhone

                                    return (
                                        <tr key={id} className="hover:bg-surface-container-low/60 transition-colors">
                                            <td className="px-6 py-4 font-mono font-semibold text-primary text-sm">{id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#c6e7ff]/40 text-primary flex items-center justify-center border border-[#81cfff]/40 shrink-0 mt-0.5">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-sm text-on-surface">{name}</span>
                                                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant" />
                                                            {address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-on-surface-variant font-medium">
                                                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-on-surface-variant" /> {phone}</span>
                                                    <span className="flex items-center gap-1.5 text-on-surface-variant"><Mail className="h-3.5 w-3.5 text-on-surface-variant" /> {email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-full">
                                                    <button
                                                        onClick={() => openConfirmModal(id, name)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#006c49] hover:bg-[#006c49]/90 px-3 py-1.5 rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
                                                    >
                                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                                        <span>{t("approve")}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* --- COMPONENT --- */}
                    {totalPending > 0 && (
                        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">
                                {t("showing", { from: currentPage === 1 ? 1 : (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, totalPending), total: totalPending })}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1 || loading}
                                    className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center text-sm font-medium shadow-xs">
                                    {currentPage}
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === Math.ceil(totalPending / pageSize) || loading}
                                    className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}