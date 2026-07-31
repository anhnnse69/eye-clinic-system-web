"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Camera,
    Edit3,
    BadgeInfo,
    Contact,
    Info,
    Loader2,
    AlertCircle,
    Stethoscope,
    Shield,        // Icon khiên cho tag Lễ tân / Bác sĩ
    CheckCircle2,  // Icon tích v cho trạng thái hoạt động
    XCircle,       // Icon cho trạng thái ngưng hoạt động
    ArrowLeft
} from "lucide-react"
import { authService } from "@/services"
import { apiClient, handleApiError } from "@/lib/axios"
import type { GetPersonalProfileResponse } from "@/types"

const t = (vi: string, en: string) => vi;

interface PersonalProfileContentProps {
    roleSegment: "receptionist" | "doctor"
    showAccountHeader?: boolean
}

export default function PersonalProfileContent({ roleSegment, showAccountHeader = false }: PersonalProfileContentProps) {
    const router = useRouter()

    const [profile, setProfile] = useState<GetPersonalProfileResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            setError(null)
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

            if (!token) {
                setError("APP_MESSAGE_401_UNAUTHORIZED")
                setProfile(null)
                return
            }

            let userId = ""
            try {
                const base64Url = token.split(".")[1]
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                )
                const decoded = JSON.parse(jsonPayload)
                userId = decoded.id || decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
            } catch (jwtError) {
                console.error("Lỗi giải mã token xác thực:", jwtError)
                userId = localStorage.getItem("userId") || ""
            }

            if (!userId) {
                setError("Hệ thống không tìm thấy định danh tài khoản hợp lệ.")
                return
            }

            const response = await authService.getPersonalProfile(userId)
            const resData = response?.data || (response as any)?.Data

            if (resData) {
                setProfile(resData as GetPersonalProfileResponse)
            } else {
                setProfile(null)
            }
        } catch (err) {
            const apiErrorMessage = handleApiError(err)
            setError(`Không thể tải thông tin chi tiết hồ sơ: ${apiErrorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const refetch = () => {
        fetchProfileData()
    }

    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null)
    const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        const handleAvatarUpdated = (e: Event) => {
            const customEvt = e as CustomEvent
            if (customEvt.detail?.avatarUrl) {
                setProfile((prev) => prev ? { ...prev, avatarUrl: customEvt.detail.avatarUrl } : prev)
            }
        }
        window.addEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
        return () => window.removeEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
    }, [])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        try {
            setUploadingAvatar(true)
            setAvatarSuccessMsg(null)
            setAvatarErrorMsg(null)

            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", "avatars")

            const res = await apiClient.post("/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            const uploadedUrl = res.data?.data?.url || res.data?.url
            if (uploadedUrl) {
                await apiClient.put(`/auth/profile/${profile.id}`, {
                    fullName: profile.fullName,
                    phone: profile.phone || "0900000000",
                    email: profile.email,
                    avatarUrl: uploadedUrl,
                })
                setProfile((prev) => prev ? { ...prev, avatarUrl: uploadedUrl } : prev)
                window.dispatchEvent(new CustomEvent("ecs-user-avatar-updated", { detail: { avatarUrl: uploadedUrl } }))
                setAvatarSuccessMsg(t("Cập nhật ảnh đại diện thành công!", "Avatar updated successfully!"))
                setTimeout(() => setAvatarSuccessMsg(null), 5000)
            }
        } catch (err: any) {
            setAvatarErrorMsg(err?.response?.data?.message || t("Tải ảnh thất bại, vui lòng thử lại.", "Upload failed, please try again."))
        } finally {
            setUploadingAvatar(false)
        }
    }

    const displayRoleLabel = profile?.role === "DOCTOR" ? "Bác sĩ" : "Lễ tân"
    const isIncomplete = profile ? (!profile.email || (profile.role === "DOCTOR" && (!profile.doctorProfile?.bio || !profile.doctorProfile?.title))) : false

    return (
        <div className="min-h-screen bg-background w-full">
            {/* Đã tăng từ max-w-4xl lên max-w-7xl để layout to rộng ra */}
            <main className="max-w-7xl mx-auto px-gutter py-2xl w-full">
                
                {/* Khối tiêu đề và nút quay lại nằm ngang hàng (Dùng flex items-start justify-between) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-xl">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {t("Hồ sơ cá nhân", "Personal Profile")}
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            {t(
                                "Thông tin cá nhân và cấu hình hồ sơ hành nghề của bạn trên hệ thống phòng khám.",
                                "Your personal information and practice profile configuration on the clinic system."
                            )}
                        </p>
                    </div>
                </div>

                {avatarSuccessMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{avatarSuccessMsg}</span>
                    </div>
                )}

                {avatarErrorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>{avatarErrorMsg}</span>
                    </div>
                )}


                {/* Trạng thái Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 w-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                        <p className="text-sm text-slate-500">Đang tải cấu trúc hồ sơ nhân sự...</p>
                    </div>
                )}

                {/* Trạng thái Lỗi */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-4 w-full shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">
                                {t("Không thể tải thông tin hồ sơ cá nhân", "Failed to load personal profile info")}
                            </p>
                            <p className="text-xs text-red-600/90 mt-1">{error}</p>
                            <button
                                onClick={refetch}
                                className="mt-3 text-sm font-semibold text-blue-600 hover:underline block"
                            >
                                {t("Thử lại", "Retry")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Hiển thị nội dung thông tin chi tiết */}
                {!loading && !error && profile && (
                    <div className="space-y-6 animate-fade-in w-full">

                        {/* Banner cảnh báo hồ sơ thiếu thông tin */}
                        {isIncomplete && (
                            <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-start gap-3 shadow-sm">
                                <Info className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <strong className="font-semibold">Thông báo hồ sơ chưa hoàn thiện:</strong> Giao diện đang hiển thị một số trường thông tin dưới dạng "Chưa cập nhật". Vui lòng nhấn vào nút <strong className="font-semibold">"Chỉnh sửa"</strong> để cập nhật đầy đủ thông tin hành nghề của bạn.
                                </div>
                            </div>
                        )}

                        {/* Profile Header Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">

                            {/* Khung ảnh đại diện */}
                            <div className="relative shrink-0">
                                {profile.avatarUrl ? (
                                    <img
                                        alt={profile.fullName}
                                        className="w-24 h-24 rounded-full border-4 border-blue-500/20 object-cover aspect-square shadow-md bg-slate-50"
                                        src={profile.avatarUrl}
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-blue-500/20 shadow-md">
                                        {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}

                                <label
                                    htmlFor="profile-avatar-file-input"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all cursor-pointer hover:scale-110 active:scale-95 border-2 border-white"
                                    title={t("Cập nhật ảnh đại diện", "Update avatar")}
                                >
                                    {uploadingAvatar ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                                    ) : (
                                        <Camera className="h-4 w-4 text-white" />
                                    )}
                                    <input
                                        id="profile-avatar-file-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            </div>

                            {/* Thông tin định danh cơ bản */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 w-full text-center sm:text-left">
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start items-center">
                                        <h2 className="text-2xl font-bold text-slate-800 truncate">{profile.fullName}</h2>

                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full shrink-0 max-w-fit mx-auto sm:mx-0 border border-blue-100 shadow-sm">
                                            <Shield className="h-3.5 w-3.5 text-blue-600" />
                                            {displayRoleLabel}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 font-medium truncate">
                                        {profile.clinic?.name || "Chưa phân bổ cơ sở làm việc"}
                                    </p>

                                    <div className="flex items-center justify-center sm:justify-start mt-1">
                                        {profile.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                {t("Đang hoạt động", "Active")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                {t("Vô hiệu hóa", "Inactive")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Nút điều hướng sang chỉnh sửa hồ sơ */}
                                <button
                                    onClick={() => router.push(`/${roleSegment}/profile/edit`)}
                                    className="shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto active:scale-95"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>

                        {/* Info Grid chia làm các khối thông tin */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Khối 1: Thông tin công tác */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <BadgeInfo className="text-blue-600 h-5 w-5" />
                                    <h3 className="text-lg font-bold text-slate-800">Thông tin công tác</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và Tên</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò phân quyền</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{displayRoleLabel}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cơ sở trực thuộc</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.clinic?.name || "Chưa phân bổ"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Khối 2: Thông tin liên hệ */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <Contact className="text-blue-600 h-5 w-5" />
                                    <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email</label>
                                        {profile.email ? (
                                            <p className="text-sm font-semibold text-slate-700 mt-1">{profile.email}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic font-medium mt-1">Chưa cập nhật (Not Provided)</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 mt-auto pt-4">
                                    <Info className="text-slate-400 h-4 w-4 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-500 leading-normal">
                                        Thông tin hành chính này được hiển thị nội bộ dùng để phân phối lịch trực công tác và quản lý nhân sự trên toàn hệ thống phòng khám.
                                    </p>
                                </div>
                            </div>

                            {/* Khối 3: HIỂN THỊ ĐẶC THÙ NẾU ACTOR LÀ DOCTOR */}
                            {profile.role === "DOCTOR" && profile.doctorProfile && (
                                <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                        <Stethoscope className="text-blue-600 h-5 w-5" />
                                        <h3 className="text-lg font-bold text-slate-800">Hồ sơ hành nghề lâm sàng (Bác sĩ)</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Học vị / Học hàm</label>
                                            {profile.doctorProfile.title ? (
                                                <p className="text-sm font-semibold text-slate-700 mt-1">{profile.doctorProfile.title}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic font-medium mt-1">Chưa cập nhật</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuyên khoa lâm sàng</label>
                                            <p className="text-sm font-semibold text-slate-700 mt-1">{profile.doctorProfile.specialtyName || "Mắt tổng quát"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thâm niên hành nghề</label>
                                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                                {profile.doctorProfile.experienceYears > 0 ? `${profile.doctorProfile.experienceYears} năm kinh nghiệm` : "Chưa cập nhật thâm niên"}
                                            </p>
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiểu sử năng lực nghề nghiệp</label>
                                            {profile.doctorProfile.bio ? (
                                                <p className="text-sm text-slate-600 mt-2 p-3.5 bg-slate-50 border border-slate-150 rounded-xl leading-relaxed whitespace-pre-line">
                                                    {profile.doctorProfile.bio}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-400 mt-2 p-3.5 bg-slate-50 border border-slate-150 rounded-xl italic font-medium">
                                                    Chưa có thông tin giới thiệu chi tiết về tiểu sử chuyên môn.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Trạng thái dữ liệu trống rỗng */}
                {!loading && !error && !profile && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full shadow-sm">
                        <Info className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Thông tin hồ sơ không khả dụng</h3>
                        <p className="text-sm text-slate-500">Hệ thống không tìm thấy dữ liệu tương ứng với tài khoản đăng nhập này.</p>
                    </div>
                )}
            </main>
        </div>
    )
}