"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  Layers, 
  DoorOpen, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Pencil
} from "lucide-react"
import { useTranslations } from "next-intl"
import { roomService } from "@/services/room.service"
import type { ViewClinicRoomResponse } from "@/services/room.service"

interface MetaResponse {
  page: number
  size: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function RoomManagementPage() {
  const t = useTranslations("clinicAdmin.room")
  const tCommon = useTranslations("clinicAdmin.common")

  const [roomList, setRoomList] = useState<ViewClinicRoomResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // State theo dõi xem ID phòng nào đang được gạt để hiển thị hiệu ứng đợi riêng biệt
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [meta, setMeta] = useState<MetaResponse>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const loadRoomData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const isActiveParam = 
        isActiveFilter === "active" ? true : 
        isActiveFilter === "inactive" ? false : undefined

      const response = await roomService.getClinicRooms({
        pageNumber,
        pageSize,
        isActive: isActiveParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response.data) {
        setRoomList(response.data)
      }
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.codeMessage
      if (errCode === "APP_MESSAGE_4001") {
        setError(t("sessionExpired"))
      } else if (errCode === "APP_MESSAGE_4020") {
        setError(t("clinicNotFound"))
      } else {
        setError(t("connectionError"))
      }
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isActiveFilter, debouncedSearch, t])

  useEffect(() => {
    loadRoomData()
  }, [loadRoomData])

  // Hàm xử lý gạt nút đổi trạng thái phòng bệnh đồng bộ UI như trang dịch vụ
  const handleToggleStatus = async (roomId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(roomId)
      
      // Gọi API Toggle Status lên Backend
      await roomService.toggleRoomStatus({ roomId, isActive: !currentStatus })
      
      // Cập nhật nhanh UI ở client để nút gạt chuyển đổi tức thì mà không cần reload trang
      setRoomList(prev => prev.map(room => 
        room.id_room === roomId ? { ...room, isActive: !currentStatus } : room
      ))
    } catch (err: any) {
      alert(t("updateFailed"))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-primary shrink-0" />
            {t("listTitle")}
          </h2>
          <p className="text-body-md text-on-surface-variant">{t("listSubtitle")}</p>
        </div>
        
        <Link 
          href="/clinic-admin/rooms/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> {t("addRoom")}
        </Link>
      </div>

      {/* Bộ lọc thanh tìm kiếm và bộ lọc trạng thái */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> {t("status")}:
          </span>
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            {t("loadingData")}
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">{t("roomNameLabel")}</th>
                    <th className="p-4">{t("roomTypeLabel")}</th>
                    <th className="p-4 text-center">{t("statusOperational")}</th>
                    <th className="p-4 text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {roomList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-on-surface-variant">
                        {t("noResults")}
                      </td>
                    </tr>
                  ) : (
                    roomList.map((room) => (
                      <tr key={room.id_room} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-on-surface">{room.roomName}</p>
                        </td>
                        
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                            <Layers className="h-4 w-4 text-on-surface-variant shrink-0" />
                            {room.roomType || t("notClassified")}
                          </span>
                        </td>
                        
                        {/* NÚT GẠT (TOGGLE SWITCH) CHUẨN MATERIAL 3 ĐỒNG BỘ THEO TRANG KHÁC */}
                        <td className="p-4">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={updatingId !== null}
                              onClick={() => handleToggleStatus(room.id_room, room.isActive)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                room.isActive ? "bg-emerald-500" : "bg-neutral-300"
                              } ${updatingId === room.id_room ? "opacity-50 cursor-wait" : ""}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  room.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="text-[11px] font-medium text-on-surface-variant/80">
                              {room.isActive ? t("roomOperational") : t("roomPaused")}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <Link
                            href={`/clinic-admin/rooms/edit/${room.id_room}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-xl text-label-sm text-primary font-medium bg-surface-container-lowest hover:bg-primary/5 transition-colors shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" /> {tCommon("edit")}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân trang hệ thống chuẩn token */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                {t("showingRows", { 
                  from: Math.min((meta.page - 1) * meta.size + 1, meta.total), 
                  to: Math.min(meta.page * meta.size, meta.total), 
                  total: meta.total 
                })}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="bg-surface-container-lowest border border-outline-variant text-on-surface px-2 py-1.5 rounded-lg text-label-md focus:outline-none cursor-pointer mr-2 font-medium"
                >
                  <option value={5}>5 {t("rowsPerPage")}</option>
                  <option value={10}>10 {t("rowsPerPage")}</option>
                  <option value={20}>20 {t("rowsPerPage")}</option>
                </select>
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("previousPage")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title={t("nextPage")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}