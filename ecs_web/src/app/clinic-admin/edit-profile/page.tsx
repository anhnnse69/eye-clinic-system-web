"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { clinicsService } from "@/services/clinic.service"
import { cn, isValidEmail } from "@/lib/utils"

interface EditClinicForm {
    name: string
    address: string
    phone: string
    email: string
    logoUrl: string
    description: string
    openTime: string
    closeTime: string
}

const FIELD_ERROR_MAP: Record<string, { field: keyof EditClinicForm; msg: string }> = {
    APP_MESSAGE_4003: { field: "name", msg: "Trường dữ liệu này không được để trống" },
    APP_MESSAGE_4019: { field: "name", msg: "Dữ liệu nhập vào vượt quá số ký tự hoặc định dạng không hợp lệ" },
}

const GENERAL_ERROR_MAP: Record<string, string> = {
    APP_MESSAGE_4001: "Tài khoản quản trị viên không hợp lệ hoặc phiên làm việc hết hạn.",
    APP_MESSAGE_4020: "Không tìm thấy thông tin phòng khám hoặc phòng khám đã bị ngưng hoạt động.",
    APP_MESSAGE_5000: "Lỗi hệ thống từ máy chủ, vui lòng thử lại sau.",
};

type FieldErrors = Partial<Record<keyof EditClinicForm, string>>;

export default function EditClinicProfilePage() {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [generalError, setGeneralError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

    const [form, setForm] = useState<EditClinicForm>({
        name: "",
        address: "",
        phone: "",
        email: "",
        logoUrl: "",
        description: "",
        openTime: "08:00",
        closeTime: "17:00",
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setGeneralError("")
            const res = await clinicsService.getProfile()

            if (res && res.data) {
                const clinic = res.data as any
                setForm({
                    name: clinic.name || "",
                    address: clinic.address || "",
                    phone: clinic.phone || "",
                    email: clinic.email || "",
                    logoUrl: clinic.logoUrl || "",
                    description: clinic.description || "",
                    openTime: clinic.openTime?.substring(0, 5) || "08:00",
                    closeTime: clinic.closeTime?.substring(0, 5) || "17:00",
                })
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin phòng khám:", error)
            setGeneralError("Không thể tải thông tin phòng khám. Vui lòng làm mới trang.")
        } finally {
            setLoading(false)
        }
    }

    const clearFieldError = (field: keyof FieldErrors) => {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
        clearFieldError(name as keyof FieldErrors)
    }

    const validateForm = (): FieldErrors | null => {
        const errors: FieldErrors = {}

        if (!form.name.trim()) errors.name = "Vui lòng nhập tên phòng khám"
        else if (form.name.length > 200) errors.name = "Tên phòng khám không được vượt quá 200 ký tự"

        if (!form.address.trim()) errors.address = "Vui lòng nhập địa chỉ phòng khám"
        else if (form.address.length > 500) errors.address = "Địa chỉ không được vượt quá 500 ký tự"

        if (!form.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại"
        else if (form.phone.length > 20) errors.phone = "Số điện thoại không được vượt quá 20 ký tự"

        if (form.email.trim() && !isValidEmail(form.email)) {
            errors.email = "Định dạng Email không hợp lệ"
        } else if (form.email.length > 150) {
            errors.email = "Email không được vượt quá 150 ký tự"
        }

        if (form.logoUrl && form.logoUrl.length > 500) {
            errors.logoUrl = "Đường dẫn logo không được vượt quá 500 ký tự"
        }

        if (form.description && form.description.length > 2000) {
            errors.description = "Mô tả không được vượt quá 2000 ký tự"
        }

        // Validate giờ mở cửa
        if (!form.openTime) errors.openTime = "Vui lòng chọn giờ mở cửa"

        // Validate giờ đóng cửa
        if (!form.closeTime) errors.closeTime = "Vui lòng chọn giờ đóng cửa"

        // Validate giờ mở cửa < giờ đóng cửa
        if (form.openTime && form.closeTime && form.openTime >= form.closeTime) {
            errors.closeTime = "Giờ đóng cửa phải sau giờ mở cửa"
        }

        return Object.keys(errors).length > 0 ? errors : null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGeneralError("")
        setSuccessMessage("")
        setFieldErrors({})

        const validationErrors = validateForm()
        if (validationErrors) {
            setFieldErrors(validationErrors)
            return
        }

        try {
            setSaving(true)
            const response = await clinicsService.updateProfile(form) as any

            if (response && response.data === true) {
                setSuccessMessage("Cập nhật thông tin phòng khám thành công!")
                setSaving(false)
                setTimeout(() => {
                    router.push("/clinic-admin/profile")
                    router.refresh()
                }, 1000)
            } else {
                setSaving(false)
                const code = response?.codeMessage || ""
                if (GENERAL_ERROR_MAP[code]) {
                    setGeneralError(GENERAL_ERROR_MAP[code])
                } else {
                    setGeneralError(response?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại.")
                }
            }
        } catch (error: any) {
            setSaving(false)
            console.error("Lỗi khi cập nhật phòng khám:", error)

            const backendData = error.response?.data
            const code: string = backendData?.codeMessage || ""

            const fieldMapping = FIELD_ERROR_MAP[code]
            if (fieldMapping) {
                setFieldErrors({
                    [fieldMapping.field]: fieldMapping.msg,
                })
            } else {
                setGeneralError(
                    GENERAL_ERROR_MAP[code] ||
                    backendData?.message ||
                    "Không thể kết nối đến hệ thống máy chủ."
                )
            }
        }
    }

    const inputCls = (field: keyof FieldErrors) =>
        cn(
            "w-full border rounded-xl p-3.5 outline-none transition-all duration-200 bg-white",
            fieldErrors[field]
                ? "border-rose-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                : "border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
        )

    const FieldMsg = ({ field }: { field: keyof FieldErrors }) =>
        fieldErrors[field] ? (
            <p className="mt-1.5 text-sm text-rose-600 flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {fieldErrors[field]}
            </p>
        ) : null

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu phòng khám...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Chỉnh sửa hồ sơ phòng khám
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cập nhật thông tin chi tiết về cơ sở y tế của bạn
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7" noValidate>

                    {/* Alerts */}
                    {generalError && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span className="flex-1">{generalError}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-3 animate-fadeIn">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                            </svg>
                            <span className="flex-1 font-medium">{successMessage}</span>
                        </div>
                    )}

                    {/* Basic Information Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Tên phòng khám <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={inputCls("name")}
                                    placeholder="Nhập tên phòng khám"
                                    disabled={saving}
                                />
                                <FieldMsg field="name" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Địa chỉ <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className={inputCls("address")}
                                    placeholder="Nhập địa chỉ phòng khám"
                                    disabled={saving}
                                />
                                <FieldMsg field="address" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Số điện thoại <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={inputCls("phone")}
                                    placeholder="Nhập số điện thoại"
                                    disabled={saving}
                                />
                                <FieldMsg field="phone" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputCls("email")}
                                    placeholder="example@clinic.com"
                                    disabled={saving}
                                />
                                <FieldMsg field="email" />
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours Section - THÊM MỚI */}
                    <div className="space-y-5 pt-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-800">Giờ làm việc</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Giờ mở cửa <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="time"
                                        name="openTime"
                                        value={form.openTime}
                                        onChange={handleChange}
                                        className={cn(
                                            inputCls("openTime"),
                                            "pl-11"
                                        )}
                                        disabled={saving}
                                    />
                                </div>
                                <FieldMsg field="openTime" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Giờ đóng cửa <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="time"
                                        name="closeTime"
                                        value={form.closeTime}
                                        onChange={handleChange}
                                        className={cn(
                                            inputCls("closeTime"),
                                            "pl-11"
                                        )}
                                        disabled={saving}
                                    />
                                </div>
                                <FieldMsg field="closeTime" />
                            </div>
                        </div>

                        {/* Hiển thị preview giờ làm việc */}
                        {form.openTime && form.closeTime && !fieldErrors.openTime && !fieldErrors.closeTime && (
                            <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    <strong>Giờ làm việc:</strong> {form.openTime} - {form.closeTime}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Media & Description Section */}
                    <div className="space-y-5 pt-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-gray-800">Thông tin bổ sung</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                URL Logo
                            </label>
                            <input
                                name="logoUrl"
                                value={form.logoUrl}
                                onChange={handleChange}
                                className={inputCls("logoUrl")}
                                placeholder="https://domain.com/logo.png"
                                disabled={saving}
                            />
                            <FieldMsg field="logoUrl" />
                            {form.logoUrl && (
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                        <img
                                            src={form.logoUrl}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '';
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400">Xem trước logo</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Mô tả
                            </label>
                            <textarea
                                rows={5}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className={cn(
                                    inputCls("description"),
                                    "resize-y min-h-[120px]"
                                )}
                                placeholder="Nhập giới thiệu ngắn về phòng khám..."
                                disabled={saving}
                            />
                            <div className="mt-1.5 flex justify-end">
                                <span className={cn(
                                    "text-xs",
                                    form.description.length > 2000 ? "text-rose-500" : "text-gray-400"
                                )}>
                                    {form.description.length}/2000
                                </span>
                            </div>
                            <FieldMsg field="description" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                            disabled={saving}
                        >
                            Hủy bỏ
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2.5",
                                saving
                                    ? "bg-primary/70 cursor-not-allowed"
                                    : "bg-primary hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
                            )}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}