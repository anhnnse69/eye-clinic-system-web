"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Phone,
    Mail,
    Briefcase,
    GraduationCap,
    History,
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    Camera
} from "lucide-react"
import { authService } from "@/services/auth.service"
import { UpdatePersonalProfileRequest, SpecialtyCategoryResponse } from "@/types"

interface EditProfileContentProps {
    roleSegment: "receptionist" | "doctor"
}

interface ProfileFormState {
    fullName: string
    phone: string
    email: string
    avatarUrl: string
    title: string
    specialtyId: string
    experienceYears: number
    bio: string
}

export default function EditProfileContent({ roleSegment }: EditProfileContentProps) {
    const router = useRouter()

    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [specialties, setSpecialties] = useState<SpecialtyCategoryResponse[]>([])
    const [formData, setFormData] = useState<ProfileFormState>({
        fullName: "",
        phone: "",
        email: "",
        avatarUrl: "",
        title: "",
        specialtyId: "",
        experienceYears: 0,
        bio: ""
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState<boolean>(false)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        const loadProfileAndSpecialties = async () => {
            try {
                setLoading(true)
                setErrors({})
                setSuccessMessage(null)

                const accountInfoResponse = await authService.getAccountInfo()

                if (!accountInfoResponse || !accountInfoResponse.data?.id) {
                    setErrors({ global: "Không tìm thấy phiên đăng nhập hợp lệ. Vui lòng đăng nhập lại." })
                    return
                }

                const userId = accountInfoResponse.data.id
                setCurrentUserId(userId)

                // Đồng bộ đợi cả 2 dữ liệu danh mục và thông tin cá nhân về cùng lúc
                const [profileResponse, specialtiesResponse] = await Promise.all([
                    authService.getPersonalProfile(userId).catch(err => {
                        console.error("Lỗi tải thông tin cá nhân từ server:", err)
                        return null
                    }),
                    authService.getActiveSpecialties().catch(err => {
                        console.error("Lỗi danh mục chuyên khoa:", err)
                        return null
                    })
                ])

                if (specialtiesResponse?.data) {
                    setSpecialties(specialtiesResponse.data)
                }

                if (profileResponse && profileResponse.data) {
                    const profile = profileResponse.data
                    const isDoctor = profile.role === "DOCTOR" && !!profile.doctorProfile
                    const docProfile = profile.doctorProfile

                    setFormData({
                        fullName: profile.fullName || "",
                        phone: profile.phone || "",
                        email: profile.email || "",
                        avatarUrl: profile.avatarUrl || "",
                        title: isDoctor ? (docProfile?.title || "") : "",
                        specialtyId: isDoctor ? (docProfile?.specialtyId || "") : "",
                        experienceYears: isDoctor ? (docProfile?.experienceYears ?? 0) : 0,
                        bio: isDoctor ? (docProfile?.bio || "") : ""
                    })
                }
            } catch (err: any) {
                console.error("Lỗi hệ thống nghiêm trọng:", err)
                setErrors({ global: "Phiên làm việc hết hạn hoặc không thể kết nối tới máy chủ phòng khám." })
            } finally {
                setLoading(false)
            }
        }

        loadProfileAndSpecialties()
    }, [roleSegment])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "experienceYears" ? parseInt(value) || 0 : value
        }))

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const phoneRegex = /^0[0-9]{9}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Vui lòng nhập họ và tên không được để trống."
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại liên hệ."
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = "Số điện thoại không hợp lệ. Phải đủ 10 chữ số bắt đầu bằng số 0."
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập địa chỉ email."
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = "Địa chỉ email không đúng định dạng (Ví dụ: abc@gmail.com)."
        }

        if (roleSegment === "doctor") {
            if (formData.experienceYears < 0) {
                newErrors.experienceYears = "Số năm kinh nghiệm làm việc không thể âm."
            }
            // 🔥 THÊM CHECK: Nếu role là doctor và specialtyId trống thì báo lỗi bắt buộc chọn
            if (!formData.specialtyId) {
                newErrors.specialtyId = "Vui lòng chọn chuyên khoa phụ trách chính của bác sĩ."
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Xác nhận hủy bằng confirm mặc định của trình duyệt
    const handleCancelClick = () => {
        const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi và quay lại hồ sơ?")
        if (confirmCancel) {
            router.push(`/${roleSegment}/profile`)
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Bước 1: Gọi hàm check validate dữ liệu trước
        const isValid = validateForm()
        if (!isValid) {
            // Nếu có lỗi, chủ động cuộn mượt lên trên đầu để hiển thị lỗi text đỏ, và chặn hoàn toàn confirm
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        // Bước 2: Chỉ khi hợp lệ hoàn toàn (isValid === true) mới thực hiện hiển thị hộp thoại confirm hệ thống
        const confirmSave = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi này không?")
        if (!confirmSave) return

        if (!currentUserId) return

        try {
            setSubmitting(true)
            setErrors({})
            setSuccessMessage(null)

            const payload: UpdatePersonalProfileRequest = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                email: formData.email?.trim() || null,
                avatarUrl: formData.avatarUrl || null,
                title: roleSegment === "doctor" ? (formData.title?.trim() || null) : null,
                experienceYears: roleSegment === "doctor" ? formData.experienceYears : 0,
                bio: roleSegment === "doctor" ? (formData.bio?.trim() || null) : null,
                specialtyId: roleSegment === "doctor" ? formData.specialtyId : null
            }

            const response = await authService.updatePersonalProfile(currentUserId, payload)

            if (response) {
                const currentUser = authService.getUser()
                if (currentUser) {
                    currentUser.name = formData.fullName.trim()
                    authService.setUser(currentUser)
                }
                setSuccessMessage("Cập nhật dữ liệu thông tin hồ sơ thành công!")
                window.scrollTo({ top: 0, behavior: "smooth" })
                setTimeout(() => router.push(`/${roleSegment}/profile`), 1200)
            }
        } catch (err: any) {
            console.error("Lỗi cập nhật từ API server:", err)
            const errorCode = typeof err === "string" ? err : (err?.codeMessage || err?.response?.data?.codeMessage || "")
            const serverErrors: Record<string, string> = {}

            if (errorCode === "APP_MESSAGE_4018" || errorCode === "APP_MESSAGE_4000") {
                serverErrors.phone = "Số điện thoại này đã tồn tại hoặc không hợp lệ."
            }
            if (errorCode === "APP_MESSAGE_4017" || errorCode === "APP_MESSAGE_4019") {
                serverErrors.email = "Địa chỉ Email này không hợp lệ hoặc đã được sử dụng."
            }
            if (errorCode === "APP_MESSAGE_4003") {
                if (!formData.fullName.trim()) serverErrors.fullName = "Trường họ tên bắt buộc."
                if (!formData.phone.trim()) serverErrors.phone = "Trường số điện thoại bắt buộc."
                if (!formData.email.trim()) serverErrors.email = "Trường email bắt buộc."
            }

            if (Object.keys(serverErrors).length === 0) {
                serverErrors.global = "Cập nhật dữ liệu thất bại. Vui lòng kiểm tra lại cấu hình."
            }
            setErrors(serverErrors)
            window.scrollTo({ top: 0, behavior: "smooth" })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 w-full min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-slate-500">Đang tải dữ liệu hồ sơ phòng khám...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/30 w-full pb-12 relative">
            <main className="w-full px-8 py-8">

                {/* Tiêu đề trang */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh sửa hồ sơ</h1>
                        <p className="text-xs text-slate-500 mt-1">Cập nhật thông tin định danh cá nhân và hồ sơ năng lực hành nghề.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại
                    </button>
                </div>

                {/* Thông báo Alert */}
                {successMessage && (
                    <div className="p-4 rounded-xl mb-6 border text-sm font-semibold flex items-center gap-2 shadow-sm bg-emerald-50 border-emerald-200 text-emerald-800 animate-fadeIn">
                        <CheckCircle className="h-4 w-4 text-emerald-600" /> {successMessage}
                    </div>
                )}

                {errors.global && (
                    <div className="p-4 rounded-xl mb-6 border text-sm font-semibold flex items-center gap-2 shadow-sm bg-red-50 border-red-200 text-red-800 animate-fadeIn">
                        <AlertCircle className="h-4 w-4 text-red-600" /> {errors.global}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                        {/* Ảnh đại diện tài khoản */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center gap-4">
                            <div className="relative group">
                                <img
                                    alt="Avatar Profile"
                                    className="w-28 h-28 rounded-full border-2 border-slate-200 object-cover bg-slate-50"
                                    src={formData.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200"}
                                />
                                <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-md transition-transform active:scale-95">
                                    <Camera className="h-4 w-4" />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-800">Ảnh đại diện tài khoản</p>
                                <p className="text-xs text-slate-400 mt-0.5">Định dạng JPG, PNG dưới 2MB.</p>
                            </div>
                        </div>

                        {/* Khối thông tin hành chính */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <UserIcon className="text-blue-600 h-4 w-4" />
                                    <h3 className="text-sm font-bold text-slate-800">Thông tin hành chính chung</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Họ tên */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Họ và Tên <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.fullName ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="Nguyễn Văn A"
                                            />
                                            <UserIcon className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Điện thoại */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Số điện thoại <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.phone ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="090XXXXXXXX"
                                            />
                                            <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Địa chỉ Email <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="example@clinic.com"
                                            />
                                            <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Khối chuyên môn hành nghề (Doctor Only) */}
                    {roleSegment === "doctor" && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                <Briefcase className="text-blue-600 h-4 w-4" />
                                <h3 className="text-sm font-bold text-slate-800">Thông tin hồ sơ hành nghề lâm sàng</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Học vị / Học hàm</label>
                                    <div className="relative flex items-center w-full">
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            placeholder="Thạc sĩ, Bác sĩ..."
                                        />
                                        <GraduationCap className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thâm niên (năm kinh nghiệm)</label>
                                    <div className="relative flex items-center w-full">
                                        <input
                                            type="number"
                                            name="experienceYears"
                                            min={0}
                                            value={formData.experienceYears}
                                            onChange={handleInputChange}
                                            className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.experienceYears ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                        />
                                        <History className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                    {errors.experienceYears && (
                                        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                            <AlertCircle className="h-3 w-3" /> {errors.experienceYears}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Chuyên khoa phụ trách chính <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <select
                                        name="specialtyId"
                                        value={formData.specialtyId}
                                        onChange={handleInputChange}
                                        // Thêm logic: Nếu danh sách chuyên khoa > 5 thì khi focus sẽ hiển thị tối đa 5 dòng kèm scroll
                                        onFocus={(e) => { if (specialties.length > 5) e.target.size = 5 }}
                                        onBlur={(e) => e.target.size = 1}
                                        className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.specialtyId ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'} rounded-xl px-3.5 py-2.5 focus:outline-none transition-all`}
                                        style={{ position: 'relative', zIndex: 10 }}
                                    >
                                        <option value="">-- Chọn chuyên khoa lâm sàng --</option>
                                        {specialties.map((spec) => (
                                            <option key={spec.id} value={spec.id} className="py-2">{spec.name}</option>
                                        ))}
                                    </select>
                                    {errors.specialtyId && (
                                        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                            <AlertCircle className="h-3 w-3" /> {errors.specialtyId}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiểu sử năng lực nghề nghiệp</label>
                                    <div className="relative flex w-full">
                                        <textarea
                                            name="bio"
                                            rows={3}
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                                            placeholder="Mô tả sơ lược năng lực công tác lâm sàng..."
                                        />
                                        <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thanh hành động */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleCancelClick}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all rounded-xl disabled:opacity-50"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100 disabled:opacity-50"
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</>
                            ) : (
                                <><Save className="h-4 w-4" /> Lưu thay đổi</>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}