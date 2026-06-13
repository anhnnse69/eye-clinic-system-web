"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { staffService } from "@/services/staff.service"
import type { CreateStaffAccountRequest } from "@/services/staff.service"

// Định nghĩa Mapping Enum từ Backend để dễ quản lý trong code UI
// Giả định thứ tự thông thường của Enum trong C# (bạn có thể điều chỉnh lại số nếu Backend quy định khác)
enum StaffRoleEnum {
    DOCTOR = 0,
    RECEPTIONIST = 1,
    CLINIC_ADMIN = 2
}

export default function CreateStaffPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Khởi tạo giá trị mặc định ban đầu là số tương ứng với RECEPTIONIST (Ví dụ: 2)
    const [formData, setFormData] = useState<CreateStaffAccountRequest>({
        phone: "",
        email: "",
        fullName: "",
        password: "",
        staffRole: StaffRoleEnum.RECEPTIONIST, 
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        
        setFormData((prev) => ({
            ...prev,
            // Nếu thay đổi trường staffRole, ép kiểu giá trị chuỗi từ option thành số nguyên (number)
            [name]: name === "staffRole" ? parseInt(value, 10) : value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(formData.phone)) {
            setError("Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số.")
            return
        }

        if (formData.password.length < 8) {
            setError("Mật khẩu bảo mật quá ngắn. Chiều dài bắt buộc tối thiểu từ 8 ký tự.")
            return
        }

        try {
            setSubmitting(true)
            await staffService.createStaffAccount(formData)
            router.push("/clinic-admin/staff")
        } catch (err: any) {
            const serverMessage = err?.response?.data?.message || "Đã xảy ra lỗi không xác định từ máy chủ."
            setError(serverMessage)
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
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        Tạo tài khoản nhân viên
                    </h2>
                </div>
            </div>

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
                        <label className="block text-label-md font-medium text-on-surface mb-2">Họ và tên *</label>
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
                            <label className="block text-label-md font-medium text-on-surface mb-2">Địa chỉ Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">Số điện thoại *</label>
                            <input
                                type="text"
                                name="phone"
                                required
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
                            <label className="block text-label-md font-medium text-on-surface mb-2">Mật khẩu ban đầu *</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md"
                            />
                        </div>
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">Phân quyền chức vụ *</label>
                            {/* ĐỒNG BỘ: Chuyển value option thành dạng số để khớp với kiểu dữ liệu của backend */}
                            <select
                                name="staffRole"
                                value={formData.staffRole}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-on-surface focus:outline-none"
                            >
                                <option value={StaffRoleEnum.RECEPTIONIST}>Lễ tân</option>
                                <option value={StaffRoleEnum.CLINIC_ADMIN}>Quản trị phòng khám</option>
                                <option value={StaffRoleEnum.DOCTOR}>Bác sĩ</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link href="/clinic-admin/staff" className="px-5 py-2.5 border border-outline rounded-xl text-label-md">
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[130px] disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu thông tin"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}