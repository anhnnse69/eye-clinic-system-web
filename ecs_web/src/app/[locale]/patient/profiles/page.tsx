"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
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
} from "lucide-react"

import { patientProfileService } from "@/services"
import type { GetPatientProfileResponse } from "@/services/patient-profile.service"
import type { MetaResponse } from "@/types"

export default function PatientProfilesPage() {
    const [profiles, setProfiles] = useState<GetPatientProfileResponse[]>([])
    const [metadata, setMetadata] = useState<MetaResponse | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(10)
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || ""

    const handleViewDetail = (profileId: string) => {
        if (locale) {
            router.push(
                `/${locale}/patient/profiles/detail?id=${profileId}`
            )
        } else {
            router.push(
                `/patient/profiles/detail?id=${profileId}`
            )
        }
    }

    const handleCreateProfile = () => {
        // navigate including current locale so route stays under /{locale}
        if (locale) {
            router.push(`/${locale}/patient/profiles/create`)
        } else {
            router.push('/patient/profiles/create')
        }
        console.log("Mở form tạo mới hồ sơ")
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setPageNumber(1)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const loadProfiles = useCallback(async () => {
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
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải danh sách hồ sơ bệnh nhân"
            )
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm, pageNumber, pageSize])

    useEffect(() => {
        loadProfiles()
    }, [loadProfiles])

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Hồ sơ bệnh nhân
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Danh sách hồ sơ của bạn và người thân đã liên kết trong hệ thống
                    </p>
                </div>

                <button
                    onClick={handleCreateProfile}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-100 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Tạo mới hồ sơ
                </button>
            </div>

            {/* Search Box */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm transition-all duration-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo họ tên, CCCD hoặc số điện thoại..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50/50">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600 min-w-[950px]">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold">
                                <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                                <th className="px-6 py-4 text-left font-semibold">Giới tính</th>
                                <th className="px-6 py-4 text-left font-semibold">Ngày sinh</th>
                                <th className="px-6 py-4 text-left font-semibold">CCCD</th>
                                <th className="px-6 py-4 text-left font-semibold">Số điện thoại</th>
                                <th className="px-6 py-4 text-left font-semibold">Quan hệ</th>
                                <th className="px-6 py-4 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4.5">
                                            <div className="h-5 bg-gray-100 rounded-lg w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                profiles.map((item) => (
                                    <tr
                                        key={item.id_patientProfile}
                                        className="hover:bg-gray-50/80 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5 font-medium text-gray-900">
                                                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                {item.fullName}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${item.gender === 'Nam' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>
                                                {item.gender}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {item.dob}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                                            {item.identityNumber || "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {item.phoneNumber}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                                <Users className="w-3 h-3" />
                                                {item.relationship}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() =>
                                                    handleViewDetail(item.id_patientProfile)
                                                }
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && profiles.length === 0 && (
                    <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            Không tìm thấy hồ sơ bệnh nhân
                        </h3>
                        <button
                            onClick={handleCreateProfile}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 text-gray-500" />
                            Tạo mới hồ sơ ngay
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {metadata && metadata.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Trang <span className="text-gray-900 font-semibold">{metadata.page}</span> trên <span className="text-gray-900 font-semibold">{metadata.totalPages}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={!metadata.hasPrevious}
                                onClick={() => setPageNumber((p) => p - 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>

                            <button
                                disabled={!metadata.hasNext}
                                onClick={() => setPageNumber((p) => p + 1)}
                                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
