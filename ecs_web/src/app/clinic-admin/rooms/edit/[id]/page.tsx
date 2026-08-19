"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowLeft, AlertCircle, Loader2, DoorOpen, ChevronDown, Layers } from "lucide-react"
import { roomService } from "@/services/room.service"
import type { EditRoomRequest } from "@/services/room.service"

const CLINIC_ROOM_PRESETS = [
    { category: "Khám bệnh & Đo kiểm", name: "Phòng Khám Mắt Tổng Quát", type: "Khám bệnh" },
    { category: "Khám bệnh & Đo kiểm", name: "Phòng Đo Khúc Xạ & Thử Kính", type: "Khám bệnh" },
    { category: "Khám bệnh & Đo kiểm", name: "Phòng Khám Mắt Trẻ Em", type: "Khám bệnh" },
    { category: "Khám bệnh & Đo kiểm", name: "Phòng Huấn Luyện & Kiểm Soát Cận Thị (Ortho-K)", type: "Khám bệnh" },

    { category: "Chẩn đoán hình ảnh & Cận lâm sàng", name: "Phòng Chụp Cắt Lớp Võng Mạc (OCT)", type: "Cận lâm sàng" },
    { category: "Chẩn đoán hình ảnh & Cận lâm sàng", name: "Phòng Chụp Ảnh Đáy Mắt & Siêu Âm", type: "Cận lâm sàng" },
    { category: "Chẩn đoán hình ảnh & Cận lâm sàng", name: "Phòng Đo Thị Trường & Bản Đồ Giác Mạc", type: "Cận lâm sàng" },

    { category: "Điều trị & Phẫu thuật", name: "Phòng Laser Nhãn Khoa", type: "Điều trị" },
    { category: "Điều trị & Phẫu thuật", name: "Phòng Thủ Thuật & Phẫu Thuật Nhỏ", type: "Phẫu thuật" },
    { category: "Điều trị & Phẫu thuật", name: "Phòng Mổ Phaco / Khúc Xạ", type: "Phẫu thuật" },
    { category: "Điều trị & Phẫu thuật", name: "Phòng Hồi Sức / Theo Dõi Sau Thủ Thuật", type: "Hồi sức" },

    { category: "Kinh doanh & Dịch vụ", name: "Khu Vực Tư Vấn & Mài Lắp Kính Thuốc", type: "Dịch vụ" },
    { category: "Kinh doanh & Dịch vụ", name: "Phòng Đón Tiếp & Tiếp Nhận Bệnh Nhân", type: "Hành chính" },
]

const ROOM_TYPE_PRESETS = [
    "Khám bệnh",
    "Cận lâm sàng",
    "Điều trị",
    "Phẫu thuật",
    "Hồi sức",
    "Dịch vụ",
    "Hành chính",
    "Xét nghiệm",
]

export default function EditClinicRoomPage() {
    const router = useRouter()
    const params = useParams()
    const roomId = params.id as string
    const t = useTranslations("clinicAdmin.room")
    const tCommon = useTranslations("clinicAdmin.common")

    const [loadingData, setLoadingData] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // State cho Dropdown Tên phòng
    const [isOpenRoomDropdown, setIsOpenRoomDropdown] = useState<boolean>(false)
    const [selectedRoomOption, setSelectedRoomOption] = useState<string>("")
    const [customRoomName, setCustomRoomName] = useState<string>("")
    const roomDropdownRef = useRef<HTMLDivElement>(null)

    // State cho Dropdown Loại phòng
    const [isOpenTypeDropdown, setIsOpenTypeDropdown] = useState<boolean>(false)
    const [selectedTypeOption, setSelectedTypeOption] = useState<string>("")
    const [customRoomType, setCustomRoomType] = useState<string>("")
    const typeDropdownRef = useRef<HTMLDivElement>(null)

    const [formData, setFormData] = useState<EditRoomRequest>({
        roomId: "",
        roomName: "",
        roomType: "",
    })

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setIsOpenRoomDropdown(false)
            }
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsOpenTypeDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setLoadingData(true)
                setError(null)

                const response = await roomService.getClinicRooms({
                    pageNumber: 1,
                    pageSize: 100,
                })

                if (response.data && response.data.length > 0) {
                    const currentRoom = response.data.find((r) => r.id_room === roomId)

                    if (currentRoom) {
                        const fetchedName = currentRoom.roomName || ""
                        const fetchedType = currentRoom.roomType || ""

                        setFormData({
                            roomId: currentRoom.id_room,
                            roomName: fetchedName,
                            roomType: fetchedType,
                        })

                        // Map Tên phòng vào Preset hoặc Tự nhập
                        const isPresetRoom = CLINIC_ROOM_PRESETS.some((item) => item.name === fetchedName)
                        if (isPresetRoom) {
                            setSelectedRoomOption(fetchedName)
                        } else {
                            setSelectedRoomOption("other")
                            setCustomRoomName(fetchedName)
                        }

                        // Map Loại phòng vào Preset hoặc Tự nhập
                        const isPresetType = ROOM_TYPE_PRESETS.includes(fetchedType)
                        if (isPresetType) {
                            setSelectedTypeOption(fetchedType)
                        } else if (fetchedType) {
                            setSelectedTypeOption("other")
                            setCustomRoomType(fetchedType)
                        }
                    } else {
                        setError(t("edit.loadErrors.roomNotFound"))
                    }
                } else {
                    setError(t("edit.loadErrors.noRoomsYet"))
                }
            } catch (err: any) {
                setError(t("edit.loadErrors.syncFailed"))
            } finally {
                setLoadingData(false)
            }
        }

        if (roomId) {
            fetchRoomDetail()
        }
    }, [roomId, t])

    // Xử lý chọn Tên phòng
    const handleSelectRoom = (item: { name: string; type: string } | "other") => {
        setIsOpenRoomDropdown(false)

        if (item === "other") {
            setSelectedRoomOption("other")
            setFormData((prev) => ({ ...prev, roomName: customRoomName }))
        } else {
            setSelectedRoomOption(item.name)
            setSelectedTypeOption(item.type) // Tự động đồng bộ loại phòng phù hợp
            setFormData((prev) => ({
                ...prev,
                roomName: item.name,
                roomType: item.type,
            }))
        }
    }

    // Xử lý chọn Loại phòng
    const handleSelectType = (type: string) => {
        setIsOpenTypeDropdown(false)
        setSelectedTypeOption(type)

        if (type !== "other") {
            setFormData((prev) => ({ ...prev, roomType: type }))
        } else {
            setFormData((prev) => ({ ...prev, roomType: customRoomType }))
        }
    }

    const handleCustomRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setCustomRoomName(value)
        setFormData((prev) => ({ ...prev, roomName: value }))
    }

    const handleCustomRoomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setCustomRoomType(value)
        setFormData((prev) => ({ ...prev, roomType: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.roomName.trim()) {
            setError(t("edit.validation.roomNameRequired"))
            return
        }

        try {
            setSubmitting(true)

           const response = await roomService.editClinicRoom({
    roomId: formData.roomId,
    roomName: formData.roomName.trim(),
    roomType: formData.roomType?.trim() || "",
})

            if (response) {
                router.refresh()
                router.push("/clinic-admin/rooms")
            }
        } catch (err: any) {
            console.error("[Edit Room Error]:", err)

            const errCode =
                err?.response?.data?.codeMessage ||
                err?.data?.codeMessage ||
                err?.codeMessage ||
                err?.response?.data?.code ||
                err?.code

            const errorString = err ? JSON.stringify(err) : ""

            if (errCode === "APP_MESSAGE_4001" || errorString.includes("APP_MESSAGE_4001")) {
                setError(t("edit.errors.sessionExpired"))
            } else if (errCode === "APP_MESSAGE_4020" || errorString.includes("APP_MESSAGE_4020")) {
                setError(t("edit.errors.roomNotFound"))
            } else if (errCode === "APP_MESSAGE_4019" || errCode === "APP_MESSAGE_4021" || errorString.includes("APP_MESSAGE_4019") || errorString.includes("APP_MESSAGE_4021")) {
                setError(t("edit.errors.duplicateRoom"))
            } else {
                setError(err?.response?.data?.message || err?.message || t("edit.errors.generic"))
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex flex-col justify-center items-center py-20 space-y-4 w-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-body-md text-on-surface-variant animate-pulse">
                    {t("fetching")}
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
            <div className="flex items-start gap-4 w-full min-w-0">
                <Link
                    href="/clinic-admin/rooms"
                    className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
                    aria-label={tCommon("back")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        {t("editTitle")}
                    </h2>
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

                    {/* 1. Custom Dropdown Tên phòng */}
                    <div className="block w-full space-y-3">
                        <label className="block text-label-md font-medium text-on-surface">
                            {t("fields.roomNameRequired")}
                        </label>
                        
                        <div className="relative w-full" ref={roomDropdownRef}>
                            <button
                                type="button"
                                onClick={() => !submitting && setIsOpenRoomDropdown(!isOpenRoomDropdown)}
                                className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-left focus:outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                                <span className={selectedRoomOption ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                                    {!selectedRoomOption ? "-- Chọn tên phòng --" : selectedRoomOption === "other" ? "-- Tên phòng khác (Tự nhập) --" : selectedRoomOption}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${isOpenRoomDropdown ? "rotate-180" : ""}`} />
                            </button>

                            {isOpenRoomDropdown && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto py-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectRoom("other")}
                                        className={`w-full text-left px-4 py-2 text-body-md font-semibold text-primary hover:bg-primary-container/20 transition-colors ${selectedRoomOption === "other" ? "bg-primary-container/30" : ""}`}
                                    >
                                        -- Tên phòng khác (Tự nhập) --
                                    </button>

                                    <div className="my-1 border-t border-outline-variant/50" />

                                    {Array.from(new Set(CLINIC_ROOM_PRESETS.map(s => s.category))).map((cat, catIdx) => (
                                        <div key={catIdx} className="py-1">
                                            <div className="px-4 py-1 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                                                {cat}
                                            </div>
                                            {CLINIC_ROOM_PRESETS.filter(s => s.category === cat).map((item, itemIdx) => (
                                                <button
                                                    key={itemIdx}
                                                    type="button"
                                                    onClick={() => handleSelectRoom(item)}
                                                    className={`w-full text-left px-6 py-2 text-body-md hover:bg-surface-container-low transition-colors ${selectedRoomOption === item.name ? "bg-primary/10 font-medium text-primary" : "text-on-surface"}`}
                                                >
                                                    {item.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedRoomOption === "other" && (
                            <div className="relative w-full pt-1">
                                <input
                                    type="text"
                                    name="customRoomName"
                                    required
                                    placeholder={t("placeholders.roomName")}
                                    value={customRoomName}
                                    onChange={handleCustomRoomNameChange}
                                    disabled={submitting}
                                    className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* 2. Custom Dropdown Loại phòng */}
                    <div className="block w-full space-y-3">
                        <label className="block text-label-md font-medium text-on-surface">
                            {t("fields.roomTypeLabel")}
                        </label>
                        
                        <div className="relative w-full" ref={typeDropdownRef}>
                            <button
                                type="button"
                                onClick={() => !submitting && setIsOpenTypeDropdown(!isOpenTypeDropdown)}
                                className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-left focus:outline-none focus:border-primary transition-colors cursor-pointer"
                            >
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                                <span className={selectedTypeOption ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                                    {!selectedTypeOption ? "-- Chọn loại phòng --" : selectedTypeOption === "other" ? "-- Loại phòng khác (Tự nhập) --" : selectedTypeOption}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${isOpenTypeDropdown ? "rotate-180" : ""}`} />
                            </button>

                            {isOpenTypeDropdown && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto py-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectType("other")}
                                        className={`w-full text-left px-4 py-2 text-body-md font-semibold text-primary hover:bg-primary-container/20 transition-colors ${selectedTypeOption === "other" ? "bg-primary-container/30" : ""}`}
                                    >
                                        -- Loại phòng khác (Tự nhập) --
                                    </button>

                                    <div className="my-1 border-t border-outline-variant/50" />

                                    {ROOM_TYPE_PRESETS.map((type, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectType(type)}
                                            className={`w-full text-left px-4 py-2 text-body-md hover:bg-surface-container-low transition-colors ${selectedTypeOption === type ? "bg-primary/10 font-medium text-primary" : "text-on-surface"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedTypeOption === "other" && (
                            <div className="relative w-full pt-1">
                                <input
                                    type="text"
                                    name="customRoomType"
                                    placeholder={t("placeholders.roomType")}
                                    value={customRoomType}
                                    onChange={handleCustomRoomTypeChange}
                                    disabled={submitting}
                                    className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link
                            href="/clinic-admin/rooms"
                            className="px-5 py-2.5 border border-outline rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                            {tCommon("cancel")}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[140px] disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                t("saveInfo")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}