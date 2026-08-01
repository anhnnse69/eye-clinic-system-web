"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { staffService } from "@/services/staff.service"
import type { EditStaffRequest } from "@/services/staff.service"

enum StaffRoleEnum {
    DOCTOR = "DOCTOR",
    RECEPTIONIST = "RECEPTIONIST",
    CLINIC_ADMIN = "CLINIC_ADMIN"
}

export default function UpdateStaffPage() {
    const router = useRouter()
    const params = useParams()
    const staffUserId = params.id as string

    const [loadingData, setLoadingData] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<EditStaffRequest>({
        staffUserId: "",
        phone: "",
        email: "",
        fullName: "",
        staffRole: StaffRoleEnum.RECEPTIONIST, 
        isActive: true
    })

    useEffect(() => {
        const fetchStaffDetailsFromList = async () => {
            try {
                setLoadingData(true)
                setError(null)
                
                const response = await staffService.getStaffList()
                
                if (response.data && response.data.length > 0) {
                    const currentStaff = response.data.find(staff => staff.userId === staffUserId)
                    
                    if (currentStaff) {
                        let currentRoleEnum = StaffRoleEnum.RECEPTIONIST
                        const roleUpper = currentStaff.role?.toUpperCase()
                        if (roleUpper === "DOCTOR") currentRoleEnum = StaffRoleEnum.DOCTOR
                        else if (roleUpper === "CLINIC_ADMIN") currentRoleEnum = StaffRoleEnum.CLINIC_ADMIN

                        setFormData({
                            staffUserId: currentStaff.userId,
                            phone: currentStaff.phone || "",
                            email: currentStaff.email || "",
                            fullName: currentStaff.fullName || "",
                            staffRole: currentRoleEnum,
                            isActive: Boolean(currentStaff.isActive) 
                        })
                    } else {
                        setError("Không tìm thấy thông tin nhân viên này hoặc tài khoản đã bị khóa/ẩn khỏi danh sách.")
                    }
                } else {
                    setError("Hệ thống phòng khám hiện chưa có nhân viên nào.")
                }
            } catch (err: any) {
                setError("Không thể kết nối máy chủ để tải danh sách và trích xuất thông tin nhân viên.")
            } finally {
                setLoadingData(false)
            }
        }

        if (staffUserId) {
            fetchStaffDetailsFromList()
        }
    }, [staffUserId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleToggleChange = () => {
        setFormData((prev) => ({
            ...prev,
            isActive: !prev.isActive
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(formData.phone)) {
            setError("Số điện thoại không hợp lệ. Vui lòng nhập chính xác 10 chữ số.")
            return
        }

        try {
            setSubmitting(true)
            await staffService.editStaffAccount(formData)
            router.refresh() 
            router.push("/clinic-admin/staff") 
        } catch (err: any) {
            const serverMessage = err?.response?.data?.message || "Đã xảy ra lỗi không mong muốn trong quá trình cập nhật dữ liệu."
            setError(serverMessage)
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex flex-col justify-center items-center py-2xl space-y-4 w-full min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-body-md text-on-surface-variant animate-pulse">Đang tìm kiếm dữ liệu nhân viên...</p>
            </div>
        )
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
                        Chỉnh sửa thông tin nhân viên
                    </h2>
                    <p className="text-body-md text-on-surface-variant">Cập nhật tài khoản định danh hoặc phân quyền chức năng trong hệ thống phòng khám</p>
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

                    {/* Email và Số điện thoại */}
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

                    {/* Phân quyền Chức vụ & Nút gạt trạng thái hoạt động */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-end">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">Phân quyền chức vụ *</label>
                            <select
                                name="staffRole"
                                value={formData.staffRole}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-on-surface focus:outline-none"
                            >
                                <option value={StaffRoleEnum.RECEPTIONIST}>Tiếp tân</option>
                                {/* <option value={StaffRoleEnum.CLINIC_ADMIN}>Quản trị phòng khám</option> */}
                                <option value={StaffRoleEnum.DOCTOR}>Bác sĩ</option>
                            </select>
                        </div>

                        {/* CẢI TIẾN: Thay thế Checkbox bằng Toggle Switch */}
                        <div className="flex flex-col pb-1 pl-2">
                            <span className="block text-label-md font-medium text-on-surface mb-3">Trạng thái hoạt động</span>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleToggleChange}
                                className="flex items-center gap-3 group focus:outline-none w-fit select-none"
                            >
                                <div 
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border ${
                                        formData.isActive 
                                            ? "bg-primary border-primary" 
                                            : "bg-surface-container-highest border-outline"
                                    } ${submitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <div 
                                        className={`absolute top-[2px] left-[2px] bg-white w-[18px] h-[18px] rounded-full shadow-sm transform transition duration-200 ease-in-out ${
                                            formData.isActive ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </div>
                                <span className={`text-body-md font-medium transition-colors ${
                                    formData.isActive ? "text-primary" : "text-on-surface-variant"
                                }`}>
                                    {formData.isActive ? "Tài khoản đang hoạt động (Active)" : "Tài khoản đang bị khóa (Inactive)"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link href="/clinic-admin/staff" className="px-5 py-2.5 border border-outline rounded-xl text-label-md">
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[155px] disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}