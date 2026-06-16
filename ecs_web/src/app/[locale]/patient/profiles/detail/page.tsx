"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, Loader2, ArrowLeft, Pencil } from "lucide-react"

import {
    patientProfileService,
    type GetPatientProfileDetailResponse,
} from "@/services/patient-profile.service"

export default function PatientProfileDetailPage() {
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || ""

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<GetPatientProfileDetailResponse | null>(null)

    const profileId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null

    useEffect(() => {
        if (!profileId) {
            setError("Không tìm thấy mã định danh hồ sơ bệnh nhân.")
            setLoading(false)
            return
        }

        loadProfile()
    }, [profileId])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await patientProfileService.getById(profileId!)

            if (response && response.data) {
                setProfile(response.data)
            } else {
                setError("Không tìm thấy dữ liệu hồ sơ bệnh nhân.")
            }
        } catch (err: any) {
            console.error("Load profile failed:", err)
            setError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tải thông tin hồ sơ.")
        } finally {
            setLoading(false)
        }
    }

    const handleBackToList = () => {
        if (locale) router.push(`/${locale}/patient/profiles`)
        else router.push(`/patient/profiles`)
    }

    const handleGoToEditPage = () => {
        if (!profileId) return
        if (locale) router.push(`/${locale}/patient/profiles/edit?id=${profileId}`)
        else router.push(`/patient/profiles/edit?id=${profileId}`)
    }

    const renderGender = (gender: number) => {
        if (gender === 0) return "Nam"
        if (gender === 1) return "Nữ"
        return "Khác"
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-gray-500">Đang tải thông tin hồ sơ...</p>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-4">
                <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/60">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="font-medium">{error || "Hồ sơ không tồn tại hoặc đã bị xóa."}</span>
                </div>
                <button
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto antialiased animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBackToList}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-gray-600 transition-colors border border-gray-200 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chi tiết hồ sơ bệnh nhân</h1>
                        <p className="text-sm text-gray-500 mt-1">Thông tin y tế chi tiết phục vụ công tác khám chữa bệnh</p>
                    </div>
                </div>

            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ và tên</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900">
                            {profile.fullName}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mối quan hệ</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900">
                            {profile.relationship || "Bản thân"}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày sinh</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900">
                            {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "-"}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Giới tính</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900">
                            {renderGender(Number(profile.gender))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số CCCD / CMND</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900">
                            {profile.identityNumber || "—"}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số điện thoại</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900">
                            {profile.phoneNumber || "—"}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số thẻ BHYT</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-mono">
                            {profile.bhytNumber || "—"}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhóm máu</label>
                        <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900">
                            {profile.bloodType || "—"}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa chỉ hiện tại</label>
                    <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900 min-h-[42px]">
                        {profile.address || "—"}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiền sử dị ứng thuốc / thức ăn</label>
                    <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900 min-h-[80px] whitespace-pre-line">
                        {profile.allergies || "Không có ghi nhận dị ứng"}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiền sử bệnh lý nền</label>
                    <div className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-900 min-h-[80px] whitespace-pre-line">
                        {profile.medicalHistory || "Không có ghi nhận bệnh lý nền"}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={handleBackToList}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors border border-gray-200 shadow-sm"
                    >
                        Quay lại danh sách
                    </button>
                    <button
                        type="button"
                        onClick={handleGoToEditPage}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Chỉnh sửa hồ sơ
                    </button>
                </div>
            </div>
        </div>
    )
}