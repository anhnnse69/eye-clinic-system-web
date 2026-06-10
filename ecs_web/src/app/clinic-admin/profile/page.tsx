"use client"

import { useEffect, useState } from "react"
import { clinicService } from "@/services/clinic.service"
import { ApiResponse } from "@/types"

interface ClinicProfile {
    id: string
    name: string
    address: string
    phone: string
    email?: string
    logo?: string
    description?: string
    isActive: boolean
    ratingAvg?: number
    reviewCount?: number
}

export default function ClinicProfilePage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [clinic, setClinic] = useState<ClinicProfile | null>(null)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            try {
                const res = await clinicService.getProfile()
                if (!mounted) return
                
                if (res && res.data) {
                    const d = res.data as any
                    setClinic({
                        id: d.id,
                        name: d.name,
                        address: d.address,
                        phone: d.phone,
                        email: d.email,
                        logo: d.logoUrl || d.logo,
                        description: d.description,
                        isActive: d.isActive,
                        ratingAvg: d.ratingAvg,
                        reviewCount: d.reviewCount,
                    })
                } else {
                    setError("Không thể tải thông tin phòng khám lúc này.")
                }
            } catch (err) {
                setError("Đã xảy ra lỗi khi kết nối đến máy chủ.")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-xl text-center text-on-surface-variant font-semibold text-lg">
                Đang tải dữ liệu phòng khám...
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto my-lg p-lg border border-error bg-error-container/10 text-error rounded-2xl font-bold text-center">
                {error}
            </div>
        )
    }

    if (!clinic) {
        return (
            <div className="max-w-4xl mx-auto my-lg p-xl text-center text-on-surface-variant border border-dashed border-outline rounded-2xl">
                Không tìm thấy dữ liệu phòng khám.
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-md md:p-lg">
            
            {/* KHUNG BO LỚN TOÀN BỘ THÔNG TIN (Giống hệt cấu trúc hình mẫu) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                
                {/* Header của Khung */}
                <div className="px-lg py-md border-b border-outline-variant/60 bg-surface-container-low/30">
                    <h2 className="text-title-md font-bold text-on-surface flex items-center gap-sm">
                        Thông tin phòng khám
                    </h2>
                </div>

                {/* Nội dung bên trong khung chia lưới */}
                <div className="p-lg space-y-xl">
                    
                    {/* Hàng 1: Tên cơ sở & Logo & Trạng thái */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-lg">
                        <div className="space-y-xs flex-1">
                            <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                Tên cơ sở y tế
                            </span>
                            {/* Tên to, rõ ràng, nhấn mạnh */}
                            <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight leading-tight">
                                {clinic.name}
                            </h1>
                        </div>

                        {/* Khối Logo đặt góc phải nếu có */}
                        {clinic.logo && (
                            <div className="w-20 h-20 bg-surface-container border border-outline-variant rounded-xl overflow-hidden shrink-0 self-end sm:self-start">
                                <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Đường phân cách nhạt đứt đoạn nhẹ */}
                    <hr className="border-t border-dashed border-outline-variant/60" />

                    {/* Hàng 2: Địa chỉ hoạt động (Được đưa ra một hàng riêng to rõ ràng) */}
                    <div className="space-y-xs">
                        <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                            Địa chỉ hoạt động
                        </span>
                        {/* Địa chỉ kích thước lớn, hiển thị tường minh */}
                        <p className="text-lg md:text-xl font-bold text-on-surface leading-relaxed">
                            {clinic.address}
                        </p>
                    </div>

                    <hr className="border-t border-dashed border-outline-variant/60" />

                    {/* Hàng 3: Grid thông tin liên hệ và Đánh giá hệ thống */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-xl">
                        
                        <div className="space-y-xs">
                            <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                Số điện thoại liên hệ
                            </span>
                            <span className="text-base md:text-lg font-bold text-on-surface tracking-wide">
                                {clinic.phone}
                            </span>
                        </div>

                        {clinic.email && (
                            <div className="space-y-xs">
                                <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                    Địa chỉ Email
                                </span>
                                <span className="text-base md:text-lg font-bold text-on-surface break-all">
                                    {clinic.email}
                                </span>
                            </div>
                        )}

                        <div className="space-y-xs">
                            <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                Trạng thái hoạt động
                            </span>
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded tracking-wide uppercase ${
                                clinic.isActive 
                                    ? "bg-success-container/30 text-success border border-success/30" 
                                    : "bg-error-container/30 text-error border border-error/30"
                            }`}>
                                {clinic.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                            </span>
                        </div>

                        <div className="space-y-xs sm:col-span-2 md:col-span-3">
                            <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                Đánh giá từ khách hàng
                            </span>
                            <div className="text-base font-bold text-on-surface">
                                <span className="text-xl font-extrabold text-primary">{clinic.ratingAvg ? clinic.ratingAvg.toFixed(1) : "-"}</span>
                                <span className="text-on-surface-variant font-medium text-sm ml-1">
                                    / 5.0 ({clinic.reviewCount ?? 0} lượt đánh giá)
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Hàng 4: Mô tả / Giới thiệu chung (nếu có) */}
                    {clinic.description && (
                        <>
                            <hr className="border-t border-dashed border-outline-variant/60" />
                            <div className="space-y-xs">
                                <span className="text-body-xs font-bold text-on-surface-variant/70 uppercase tracking-wider block">
                                    Giới thiệu chi tiết
                                </span>
                                <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-low/40 p-md rounded-xl border border-outline-variant/40">
                                    {clinic.description}
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>

        </div>
    )
}