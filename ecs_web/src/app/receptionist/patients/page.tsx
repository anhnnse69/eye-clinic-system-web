"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Users, RotateCcw, Edit2, Eye, Calendar,
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

export default function PatientProfilesListPage() {
    const router = useRouter()

    // --- States quản lý Bộ Lọc (Đã xóa bộ lọc giới tính) ---
    const [searchName, setSearchName] = useState<string>("")
    const [searchPhone, setSearchPhone] = useState<string>("")

    // --- States lưu giá trị Debounce ---
    const [debouncedName, setDebouncedName] = useState<string>("")
    const [debouncedPhone, setDebouncedPhone] = useState<string>("")

    // --- States dữ liệu từ API ---
    const [patients, setPatients] = useState<PatientProfileItem[]>([])

    // --- States Phân trang ---
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const pageSize = 5

    // --- States UI/UX ---
    const [loading, setLoading] = useState<boolean>(true)
    const [systemError, setSystemError] = useState<string | null>(null)

    // 1. Xử lý Debounce cho ô nhập tên (400ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedName(searchName)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchName])

    // 2. Xử lý Debounce cho ô nhập SĐT (400ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPhone(searchPhone)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchPhone])

    // Hàm gọi API lấy dữ liệu thực tế từ Server (Đã loại bỏ tham số genderFilter)
    const fetchPatientsData = useCallback(async () => {
        setLoading(true)
        setSystemError(null)
        try {
            const response = await receptionistService.getPatients({
                pageNumber: currentPage,
                pageSize: pageSize,
                searchName: debouncedName,
                searchPhone: debouncedPhone
            })

            if (response.data) {
                setPatients(response.data)
            }

            if (response.meta) {
                setTotalItems(response.meta.total)
                setTotalPages(response.meta.totalPages)
            } else {
                setTotalItems(response.data?.length || 0)
                setTotalPages(1)
            }
        } catch (error) {
            console.error("Error fetching patients:", error)
            const errorMsg = handleApiError(error)
            setSystemError(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedName, debouncedPhone])

    // Kích hoạt gọi dữ liệu khi các điều kiện filter hoặc trang thay đổi
    useEffect(() => {
        fetchPatientsData()
    }, [fetchPatientsData])

    // Reset filter: đưa bộ lọc về rỗng và quay về trang số 1
    const handleResetFilters = () => {
        setSearchName("")
        setSearchPhone("")
        setCurrentPage(1)
    }

    const formatGender = (gender: string) => {
        switch (gender) {
            case Gender.MALE:
                return (
                    <div className="inline-flex items-center justify-center gap-2 text-blue-600 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="10" cy="14" r="5" /><path d="M14 10l7-7M15 3h6v6" /></svg>
                        <span>Nam</span>
                    </div>
                )
            case Gender.FEMALE:
                return (
                    <div className="inline-flex items-center justify-center gap-2 text-pink-500 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" /></svg>
                        <span>Nữ</span>
                    </div>
                )
            default:
                return (
                    <div className="inline-flex items-center justify-center gap-2 text-slate-600 font-semibold">
                        <User className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <span>Khác</span>
                    </div>
                )
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "—"
        if (dateString.includes("T")) {
            dateString = dateString.split("T")[0]
        }
        const parts = dateString.split("-")
        if (parts.length !== 3) return dateString
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
    }

    const startIndex = (currentPage - 1) * pageSize

    return (
        <div className="space-y-6 w-full min-w-0 px-4 py-4">

            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Danh sách hồ sơ bệnh nhân
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Hệ thống tự động tra cứu tức thì danh sách hành chính bệnh nhân
                    </p>
                </div>

                <button
                    onClick={() => router.push("/receptionist/patients/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    Tạo Hồ Sơ Mới
                </button>
            </div>

            {/* Thông báo lỗi hệ thống nếu có */}
            {systemError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>Có lỗi xảy ra: {systemError}. Vui lòng thử lại sau.</span>
                </div>
            )}

            {/* 2. Bộ lọc thông minh tự động */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-600">Họ tên bệnh nhân</label>
                    <div className="relative w-full">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nhập họ tên bệnh nhân..."
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-600">Số điện thoại</label>
                    <div className="relative w-full">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nhập số điện thoại..."
                            value={searchPhone}
                            onChange={(e) => {
                                setSearchPhone(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleResetFilters}
                    className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 h-[38px] transition-all active:scale-95 w-full"
                >
                    <RotateCcw className="h-4 w-4" />
                    Xóa toàn bộ lọc
                </button>
            </div>

            {/* Bảng dữ liệu / Loading */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-sm text-slate-500 font-medium">Đang đồng bộ danh sách hồ sơ bệnh nhân từ hệ thống...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
                    <Users className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-700 font-bold text-base">Không tìm thấy hồ sơ nào phù hợp</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3.5 w-[250px]">Họ và Tên Bệnh Nhân</th>
                                        <th className="px-4 py-3.5 text-center w-[120px]">Giới tính</th>
                                        <th className="px-4 py-3.5 text-center w-[120px]">Ngày sinh</th>
                                        <th className="px-4 py-3.5 w-[140px]">Số điện thoại</th>
                                        <th className="px-4 py-3.5">Số CCCD / Thẻ BHYT</th>
                                        <th className="px-6 py-3.5 text-center w-[260px] whitespace-nowrap">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-sm">
                                    {patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <span className="truncate">{patient.fullName}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-center text-xs">
                                                {formatGender(patient.gender)}
                                            </td>

                                            <td className="px-4 py-4 text-center font-medium text-slate-600">
                                                <div className="flex items-center justify-center gap-1 text-xs">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span>{formatDate(patient.dob)}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 font-medium text-slate-700">
                                                <span className="text-xs">{patient.phoneNumber || "—"}</span>
                                            </td>

                                            <td className="px-4 py-4 text-xs space-y-1 text-slate-600">
                                                {patient.identityNumber ? (
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="h-3 w-3 text-slate-400" />
                                                        <span>CCCD: <span className="font-semibold text-slate-700">{patient.identityNumber}</span></span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block italic">Chưa cập nhật CCCD</span>
                                                )}
                                                
                                                {patient.bhytNumber ? (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px] font-extrabold">✓</div>
                                                        <span>BHYT: <span className="font-semibold text-slate-700">{patient.bhytNumber}</span></span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block italic">Chưa cập nhật BHYT</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-4 w-full">
                                                    <button
                                                        onClick={() => router.push(`/receptionist/patients/edit/${patient.id}`)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
                                                    >
                                                        <Edit2 className="h-4 w-4 shrink-0" />
                                                        <span>Chỉnh sửa</span>
                                                    </button>

                                                    <button
                                                        onClick={() => router.push(`/receptionist/patients/view/${patient.id}`)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
                                                    >
                                                        <Eye className="h-4 w-4 shrink-0" />
                                                        <span>Xem chi tiết</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân Trang */}
                    <div className="flex items-center justify-between bg-white px-5 py-3.5 border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-600">
                        <div className="font-medium text-xs text-slate-500">
                            Hiển thị <span className="font-semibold text-slate-700">{startIndex + 1}</span> đến{" "}
                            <span className="font-semibold text-slate-700">
                                {Math.min(startIndex + pageSize, totalItems)}
                            </span>{" "}
                            trong tổng số <span className="font-semibold text-slate-700">{totalItems}</span> bệnh nhân
                        </div>

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
                                            ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    aria-label={`Trang ${page}`}
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