"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { clinicService } from "@/services/clinic.service"
import { cn, isValidEmail } from "@/lib/utils" 

interface EditClinicForm {
    name: string
    address: string
    phone: string
    email: string
    logoUrl: string
    description: string
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
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setGeneralError("")
            const res = await clinicService.getProfile()

            if (res && res.data) {
                const clinic = res.data as any
                setForm({
                    name: clinic.name || "",
                    address: clinic.address || "",
                    phone: clinic.phone || "",
                    email: clinic.email || "",
                    logoUrl: clinic.logoUrl || "",
                    description: clinic.description || "",
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
            const response = await clinicService.updateProfile(form) as any

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
            "w-full border rounded-lg p-3 outline-none transition-all",
            fieldErrors[field]
                ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
                : "border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary"
        )

    const FieldMsg = ({ field }: { field: keyof FieldErrors }) =>
        fieldErrors[field] ? (
            <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {fieldErrors[field]}
            </p>
        ) : null

    if (loading) {
        return <div className="p-xl text-center">Đang tải dữ liệu...</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-lg">
            <div className="bg-surface-container-lowest border rounded-2xl p-xl">
                <h1 className="text-2xl font-bold mb-xl">
                    Chỉnh sửa thông tin phòng khám
                </h1>

                <form onSubmit={handleSubmit} className="space-y-lg" noValidate>

                    {generalError && (
                        <div className="p-3.5 rounded-lg bg-error-container text-error text-sm flex items-center gap-2 border border-error/20" role="alert">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {generalError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 border border-emerald-200 animate-fadeIn" role="alert">
                            <svg className="w-5 h-5 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{successMessage}</span>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 font-semibold">Tên phòng khám *</label>
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

                    <div>
                        <label className="block mb-2 font-semibold">Địa chỉ *</label>
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
                        <label className="block mb-2 font-semibold">Số điện thoại *</label>
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
                        <label className="block mb-2 font-semibold">Email</label>
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

                    <div>
                        <label className="block mb-2 font-semibold">Logo URL</label>
                        <input
                            name="logoUrl"
                            value={form.logoUrl}
                            onChange={handleChange}
                            className={inputCls("logoUrl")}
                            placeholder="https://domain.com/logo.png"
                            disabled={saving}
                        />
                        <FieldMsg field="logoUrl" />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">Mô tả</label>
                        <textarea
                            rows={5}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className={inputCls("description")}
                            placeholder="Nhập giới thiệu ngắn về phòng khám..."
                            disabled={saving}
                        />
                        <FieldMsg field="description" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                            disabled={saving}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "px-5 py-2 rounded-lg text-white transition flex items-center gap-2 generic-button",
                                saving 
                                    ? "bg-primary/70 cursor-not-allowed" 
                                    : "bg-primary hover:opacity-90"
                            )}
                        >
                            {saving ? (
                                <>
                                    {/* Spinner Icon chuyển động tròn xoay xoay góc trái của nút */}
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}