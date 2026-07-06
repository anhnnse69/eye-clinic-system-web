"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Building2, ArrowLeft, AlertCircle, Loader2, CheckCircle, MapPin,
    Phone, Mail, X, ChevronLeft, ChevronRight
} from "lucide-react"
import { clinicsService } from "@/services"
import { handleApiError } from "@/lib/axios"
import type { ClinicManagementItem, MetaResponse } from "@/types"

export default function ClinicsPendingPublicationPage() {
    const router = useRouter()
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
            setError("Không thể tải danh sách phòng khám chờ duyệt công khai.")
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
                message: "Duyệt công khai phòng khám thành công!",
                type: "success"
            })

            await fetchPendingClinics()
        } catch (err) {
            const apiErrorMessage = handleApiError(err)
            setToast({
                isOpen: true,
                message: `Duyệt thất bại: ${apiErrorMessage}`,
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
        <div className="space-y-6 w-full min-w-0 px-4 py-4 relative">

            {/* --- ELEGANT TOAST NOTIFICATION --- */}
            {toast.isOpen && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 min-w-[320px] max-w-md ${toast.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                    }`}>
                    {toast.type === "success" ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    )}
                    <span className="text-sm font-semibold pr-4 leading-normal">{toast.message}</span>
                    <button
                        onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
                        className="p-1 hover:bg-black/5 rounded-lg transition-colors ms-auto shrink-0 text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* --- CONFIRMATION MODAL --- */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 m-0">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 shrink-0 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-600 shrink-0">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Xác nhận duyệt</h3>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Bạn có chắc chắn muốn duyệt yêu cầu công khai cho phòng khám
                            <span className="font-semibold text-slate-800 px-1">"{confirmModal.name}"</span>?
                            Thay đổi này sẽ kích hoạt không gian làm việc của phòng khám trên hệ thống ngay lập tức.
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, id: "", name: "" })}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleApprovePublication}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
                            >
                                Duyệt yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Yêu cầu công khai chờ duyệt</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Danh sách các phòng khám đang nộp đơn xin phát hành lên hệ thống</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800 mb-0.5">Lỗi hệ thống</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Đang kiểm tra hồ sơ công khai...</p>
                </div>
            )}

            {/* --- DATA TABLE --- */}
            {!loading && totalPending === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
                    <Building2 className="h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Hiện tại không có yêu cầu nào</h3>
                    <p className="text-sm text-slate-500">Tất cả các phòng khám hoạt động hiện đã được xuất bản hoặc chưa gửi đơn.</p>
                </div>
            ) : !loading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">Mã cơ sở</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng khám / Địa chỉ</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[260px] whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {displayedClinics.map((clinic) => {
                                    const id = clinic.id_clinic || (clinic as any).Id_clinic
                                    const name = clinic.clinicName || (clinic as any).ClinicName
                                    const address = clinic.address || (clinic as any).Address
                                    const email = clinic.contactEmail || (clinic as any).ContactEmail
                                    const phone = clinic.contactPhone || (clinic as any).ContactPhone

                                    return (
                                        <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-sm">{id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 mt-0.5">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-sm text-slate-800">{name}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                            {address}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                                                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {phone}</span>
                                                    <span className="flex items-center gap-1.5 text-slate-500"><Mail className="h-3.5 w-3.5 text-slate-400" /> {email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-full">
                                                    <button
                                                        onClick={() => openConfirmModal(id, name)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                                    >
                                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                                        <span>Duyệt công khai</span>
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
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Hiển thị {currentPage === 1 ? 1 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalPending)} của {totalPending} phòng khám
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1 || loading}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                    {currentPage}
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === Math.ceil(totalPending / pageSize) || loading}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
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