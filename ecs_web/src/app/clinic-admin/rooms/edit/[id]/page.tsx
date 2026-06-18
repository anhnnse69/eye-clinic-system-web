"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { roomService } from "@/services/room.service"
import type { EditRoomRequest } from "@/services/room.service"

export default function EditClinicRoomPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.id as string

    const [loadingData, setLoadingData] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Khởi tạo trạng thái mặc định của biểu mẫu theo cấu trúc của EditRoomRequest
    const [formData, setFormData] = useState<EditRoomRequest>({
        roomId: "",
        roomName: "",
        roomType: "",
    })

    // Bước 1: Fetch thông tin phòng cần sửa từ hệ thống khi trang được nạp
    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setLoadingData(true)
                setError(null)

                // Gọi danh sách phòng để tìm kiếm phòng có id_room trùng với params.id trên URL
                const response = await roomService.getClinicRooms({
                    pageNumber: 1,
                    pageSize: 100,
                })

                if (response.data && response.data.length > 0) {
                    const currentRoom = response.data.find((r) => r.id_room === roomId)

                    if (currentRoom) {
                        setFormData({
                            roomId: currentRoom.id_room,
                            roomName: currentRoom.roomName,
                            roomType: currentRoom.roomType || "",
                        })
                    } else {
                        setError("Không tìm thấy thông tin căn phòng chức năng này trên hệ thống.")
                    }
                } else {
                    setError("Phòng khám hiện tại chưa được thiết lập bất kỳ phân khu phòng chức năng nào.")
                }
            } catch (err: any) {
                setError("Đã xảy ra lỗi khi đồng bộ dữ liệu cấu trúc phòng ban từ máy chủ.")
            } finally {
                setLoadingData(false)
            }
        }

        if (roomId) {
            fetchRoomDetail()
        }
    }, [roomId])

    // Lắng nghe sự thay đổi giá trị của các ô nhập liệu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Bước 2: Xử lý gửi Form cập nhật lên API thông qua Service
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Thực hiện tiền kiểm tra dữ liệu ở phía Client (Client-side validation)
        if (!formData.roomName.trim()) {
            setError("Tên phòng không được phép để trống.")
            return
        }
        if (!formData.roomType.trim()) {
            setError("Phân loại phân khu phòng không được phép để trống.")
            return
        }

        try {
            setSubmitting(true)
            
            // Gọi API PUT editClinicRoom từ service
            const response = await roomService.editClinicRoom({
                roomId: formData.roomId,
                roomName: formData.roomName.trim(),
                roomType: formData.roomType.trim()
            })

            if (response) {
                router.refresh()
                // Điều hướng an toàn quay trở về trang danh sách quản lý phòng sau khi thành công
                router.push("/clinic-admin/rooms")
            }
        } catch (err: any) {
            console.error("[Edit Room Error Debug]:", err);

            // 1. Trích xuất mã lỗi đa tầng từ mọi cấu trúc phản hồi có thể xảy ra của hệ thống
            const errCode = 
                err?.response?.data?.codeMessage || 
                err?.data?.codeMessage || 
                err?.codeMessage ||
                err?.response?.data?.code ||
                err?.code;

            const errorString = err ? JSON.stringify(err) : "";

            // 2. Khớp chuẩn xác và xử lý nghiêm ngặt các mã lỗi bao gồm quét chuỗi dự phòng
            if (errCode === "APP_MESSAGE_4001" || errorString.includes("APP_MESSAGE_4001")) {
                setError("Hành động bị từ chối! Phiên đăng nhập Quản trị viên phòng khám (CLINIC_ADMIN) không hợp lệ hoặc hết hạn.");
            } else if (errCode === "APP_MESSAGE_4020" || errorString.includes("APP_MESSAGE_4020")) {
                setError("Lỗi hệ thống: Phòng chức năng mục tiêu không tồn tại trong cơ sở dữ liệu của phòng khám hoặc đã bị xóa trước đó.");
            } else if (errCode === "APP_MESSAGE_4019" || errCode === "APP_MESSAGE_4021" || errorString.includes("APP_MESSAGE_4019") || errorString.includes("APP_MESSAGE_4021")) {
                setError("Tên phòng này đã tồn tại trong phân khu của phòng khám. Vui lòng chọn một tên gọi khác để tránh trùng lặp danh định!");
            } else {
                // Dự phòng cuối cùng: Hiện thông báo lỗi trực tiếp từ server hoặc câu mặc định
                setError(err?.response?.data?.message || err?.message || "Đã xảy ra sự cố không xác định trong quá trình cập nhật cơ sở dữ liệu phòng khám.");
            }
        } finally {
            setSubmitting(false)
        }
    }

    // Hiển thị trạng thái chờ khi đang nạp dữ liệu gốc của phòng khám
    if (loadingData) {
        return (
            <div className="flex flex-col justify-center items-center py-20 space-y-4 w-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-body-md text-on-surface-variant animate-pulse">
                    Đang truy xuất thông tin cấu trúc vật lý phòng bệnh...
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
            
            {/* Thanh điều hướng tiêu đề và nút quay lại */}
            <div className="flex items-start gap-4 w-full min-w-0">
                <Link
                    href="/clinic-admin/rooms"
                    className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        Chỉnh sửa cấu trúc phòng bệnh
                    </h2>
                </div>
            </div>

            {/* Khối hiển thị thông báo lỗi (Error Banner) */}
            {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20 w-full min-w-0">
                    <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    <span className="break-words flex-1 min-w-0">{error}</span>
                </div>
            )}

            {/* Thân biểu mẫu nhập liệu */}
            <div className="w-full block bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm min-w-0">
                <form onSubmit={handleSubmit} className="block space-y-5 w-full min-w-0">
                    
                    {/* Tên phòng */}
                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            Tên phòng chức năng *
                        </label>
                        <input
                            type="text"
                            name="roomName"
                            required
                            placeholder="Ví dụ: Phòng khám Nội 1, Phòng Siêu Âm..."
                            value={formData.roomName}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Loại phòng */}
                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            Loại phòng / Chuyên khoa *
                        </label>
                        <input
                            type="text"
                            name="roomType"
                            required
                            placeholder="Ví dụ: Phòng Khám, Phòng Cấp Cứu, Xét Nghiệm..."
                            value={formData.roomType}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Thanh hành động (Hủy bỏ / Lưu thông tin) */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link
                            href="/clinic-admin/rooms"
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
                                "Lưu thông tin"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}