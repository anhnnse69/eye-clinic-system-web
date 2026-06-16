"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2, Clock, FileText } from "lucide-react" // Đã xóa DollarSign khỏi đây
import { serviceService } from "@/services/service.service"
import type { CreateServiceRequest } from "@/services/service.service"

export default function CreateClinicServicePage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<CreateServiceRequest>({
        serviceName: "",
        price: 0,
        durationMinutes: 15, 
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" || name === "durationMinutes" ? parseInt(value, 10) || 0 : value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!formData.serviceName.trim()) {
            setError("Tên dịch vụ y tế không được để trống.")
            return
        }
        if (formData.price < 0) {
            setError("Đơn giá dịch vụ không được phép là số âm.")
            return
        }
        if (formData.durationMinutes <= 0) {
            setError("Thời gian thực hiện dịch vụ phải lớn hơn 0 phút.")
            return
        }

        try {
            setSubmitting(true)
            const response = await serviceService.createService(formData)
            if (response.data) {
                router.push("/clinic-admin/clinic-services")
            }
        } catch (err: any) {
            console.error("[Create Service Error Debug - Toàn bộ Object]:", err);
            const errCode = 
                err?.response?.data?.codeMessage || 
                err?.data?.codeMessage || 
                err?.codeMessage ||
                err?.response?.data?.code ||
                err?.code;
            const errorString = err ? JSON.stringify(err) : "";
            if (errCode === "APP_MESSAGE_4041" || errCode === "4041" || errorString.includes("APP_MESSAGE_4041")) {
                setError("Tên dịch vụ y tế này đã tồn tại trong hệ thống phòng khám của bạn.");
            } else if (errCode === "APP_MESSAGE_4001" || errCode === "4001" || errorString.includes("APP_MESSAGE_4001")) {
                setError("Phiên đăng nhập không hợp lệ hoặc tài khoản không có quyền Admin.");
            } else if (errCode === "APP_MESSAGE_4020" || errCode === "4020" || errorString.includes("APP_MESSAGE_4020")) {
                setError("Hệ thống không tìm thấy hồ sơ phòng khám gắn liền với tài khoản quản trị này.");
            } else {
                const serverMessage = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi hệ thống trong quá trình khởi tạo dịch vụ.";
                setError(serverMessage);
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
            <div className="flex items-start gap-4 w-full min-w-0">
                <Link
                    href="/clinic-admin/clinic-services"
                    className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        Thêm mới dịch vụ khám bệnh
                    </h2>
                    <p className="text-body-md text-on-surface-variant">
                        Đăng ký thêm một dòng dịch vụ hoặc danh mục kỹ thuật y tế mới cho cơ sở phòng khám
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20 w-full min-w-0">
                    <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    <span className="break-words flex-1 min-w-0">{error}</span>
                </div>
            )}

            <div className="w-full block bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm min-w-0">
                <form onSubmit={handleSubmit} className="block space-y-5 w-full min-w-0">

                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            Tên dịch vụ y tế *
                        </label>
                        <div className="relative w-full">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                            <input
                                type="text"
                                name="serviceName"
                                required
                                placeholder="Ví dụ: Khám nội tổng quát, Siêu âm tim Doppler..."
                                value={formData.serviceName}
                                onChange={handleChange}
                                disabled={submitting}
                                className="w-full block pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                Giá dịch vụ (VNĐ) *
                            </label>
                            <div className="relative w-full">
                                {/* ĐÃ XÓA ICON VÀ THAY pl-10 THÀNH px-4 ĐỂ CHỮ SÁT RA LỀ */}
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="1000"
                                    placeholder="0"
                                    value={formData.price || ""}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                Thời lượng thực hiện (Phút) *
                            </label>
                            <div className="relative w-full">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                                <input
                                    type="number"
                                    name="durationMinutes"
                                    required
                                    min="1"
                                    placeholder="15"
                                    value={formData.durationMinutes || ""}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="w-full block pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link
                            href="/clinic-admin/clinic-services"
                            className="px-5 py-2.5 border border-outline rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[140px] disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Khởi tạo dịch vụ"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}