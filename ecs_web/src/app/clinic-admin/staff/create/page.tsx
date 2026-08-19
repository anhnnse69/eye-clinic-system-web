"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2, Info } from "lucide-react"
import { useTranslations } from "next-intl"
import { staffService } from "@/services/staff.service"
import type { CreateStaffAccountRequest } from "@/services/staff.service"
import { handleApiError } from "@/lib/axios"

enum StaffRoleEnum {
    DOCTOR = 0,
    RECEPTIONIST = 1,
    CLINIC_ADMIN = 2
}

export default function CreateStaffPage() {
    const t = useTranslations("clinicAdmin.staff")
    const tCommon = useTranslations("clinicAdmin.common")
    const router = useRouter()
    
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [loadingCheck, setLoadingCheck] = useState<boolean>(true)
    const [hasActiveReceptionist, setHasActiveReceptionist] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<CreateStaffAccountRequest>({
        phone: "",
        email: "",
        fullName: "",
        password: "",
        staffRole: StaffRoleEnum.RECEPTIONIST,
    })

    // 1. Kiểm tra xem phòng khám đã có tài khoản lễ tân active chưa khi load trang
    useEffect(() => {
        const checkExistingReceptionist = async () => {
            try {
                setLoadingCheck(true)
                const response = await staffService.getStaffList({ isActive: true })
                
                // Kiểm tra danh sách nhân viên active có ai mang role RECEPTIONIST không
                const receptionistExists = response.data?.some(
                    (staff) => staff.role?.toUpperCase() === "RECEPTIONIST"
                ) ?? false

                setHasActiveReceptionist(receptionistExists)

                // Nếu đã có lễ tân, tự động đổi vai trò mặc định chọn thành Bác sĩ
                if (receptionistExists) {
                    setFormData((prev) => ({
                        ...prev,
                        staffRole: StaffRoleEnum.DOCTOR,
                    }))
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra danh sách nhân viên:", err)
            } finally {
                setLoadingCheck(false)
            }
        }

        checkExistingReceptionist()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: name === "staffRole" ? parseInt(value, 10) : value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(formData.phone)) {
            setError(t("create.validation.phoneInvalid"))
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
            setError(t("create.validation.emailInvalid"))
            return
        }

        if (formData.password.length < 8) {
            setError(t("create.validation.passwordTooShort"))
            return
        }

        try {
            setSubmitting(true)
            await staffService.createStaffAccount(formData)
            router.push("/clinic-admin/staff")
        } catch (err: unknown) {
            // 2. Sử dụng helper handleApiError lấy đúng mã codeMessage từ axios.ts
            const codeMessage = handleApiError(err)

            if (codeMessage === "APP_MESSAGE_4019") {
                setError("Phòng khám đã có tài khoản lễ tân đang hoạt động. Vui lòng vô hiệu hóa tài khoản cũ trước khi tạo mới.")
            } else if (codeMessage === "APP_MESSAGE_4018") {
                setError("Số điện thoại này đã được sử dụng trong hệ thống.")
            } else if (codeMessage === "APP_MESSAGE_4017") {
                setError("Email này đã được sử dụng trong hệ thống.")
            } else {
                setError(t("create.errors.generic"))
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
            <div className="flex items-start gap-4 w-full min-w-0">
                <Link
                    href="/clinic-admin/staff"
                    className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
                    aria-label={tCommon("back")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        {t("createTitle")}
                    </h2>
                </div>
            </div>

            {/* Thông báo nhắc nhở nếu đã có lễ tân đang active */}
            {hasActiveReceptionist && !loadingCheck && (
                <div className="p-4 bg-info-container text-on-info-container rounded-xl flex items-center gap-3 border border-info/20 w-full">
                    <Info className="h-5 w-5 text-info shrink-0" />
                    <span className="text-body-md">
                        Phòng khám hiện đã có 1 lễ tân đang hoạt động. Bạn chỉ có thể tạo tài khoản <b>Bác sĩ</b> hoặc cần vô hiệu hóa tài khoản lễ tân hiện tại trước.
                    </span>
                </div>
            )}

            {error && (
                <div className="p-md bg-error-container text-on-error-container rounded-xl flex items-center gap-sm text-body-md font-medium border border-error/20 w-full min-w-0">
                    <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    <span className="break-words flex-1 min-w-0">{error}</span>
                </div>
            )}

            <div className="w-full block bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm min-w-0">
                <form onSubmit={handleSubmit} className="block space-y-5 w-full min-w-0">

                    {/* Họ và tên */}
                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">{t("fields.fullNameRequired")}</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                        />
                    </div>

                    {/* Email & Số điện thoại */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">{t("fields.emailRequired")}</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder={t("placeholders.email")}
                                value={formData.email}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">{t("fields.phoneRequired")}</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                placeholder={t("placeholders.phone")}
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                            />
                        </div>
                    </div>

                    {/* Mật khẩu & Chức vụ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">{t("fields.passwordRequired")}</label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder={t("placeholders.password")}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">{t("fields.roleRequired")}</label>
                            <select
                                name="staffRole"
                                value={formData.staffRole}
                                onChange={handleChange}
                                disabled={submitting || loadingCheck}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-on-surface focus:outline-none"
                            >
                                <option 
                                    value={StaffRoleEnum.RECEPTIONIST} 
                                    disabled={hasActiveReceptionist}
                                >
                                    {t("receptionist")} {hasActiveReceptionist ? "(Đã có 1 tài khoản đang hoạt động)" : ""}
                                </option>
                                <option value={StaffRoleEnum.DOCTOR}>{t("doctor")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link href="/clinic-admin/staff" className="px-5 py-2.5 border border-outline rounded-xl text-label-md">
                            {tCommon("cancel")}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || loadingCheck}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[130px] disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("saveInfo")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}