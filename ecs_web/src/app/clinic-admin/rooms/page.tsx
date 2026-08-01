"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { 
  DoorOpen, 
  AlertCircle, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Pencil,
  Eye,
  RefreshCw
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
  
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ViewClinicRoomResponse | null>(null)

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

  const handleToggleStatus = async (roomId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(roomId)
      await roomService.toggleRoomStatus({ roomId, isActive: !currentStatus })
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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("listTitle")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t("listSubtitle")}</p>
        </div>
        <button
          onClick={loadRoomData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh") || "Làm mới"}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="md:col-span-8 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="md:col-span-2">
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 cursor-pointer appearance-none"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2 text-sm font-medium text-slate-500">
          <span>{tCommon("total")}:</span>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold">{meta.total}</span>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="p-8 text-center min-h-75 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-rose-500 font-medium">{error}</div>
          <button
            onClick={loadRoomData}
            className="mt-4 px-5 py-2 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm"
          >
            {t("retry") || "Thử lại"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("roomNameLabel")}</th>
                  <th className="p-4">{t("roomTypeLabel")}</th>
                  <th className="p-4 text-center">{tCommon("status")}</th>
                  <th className="p-4 text-center">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                      <td className="p-4"><div className="h-6 w-16 bg-slate-200 rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : roomList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  roomList.map((room) => (
                    <tr key={room.id_room} className="hover:bg-slate-50/50 group transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <span className="p-1.5 bg-slate-100 rounded-lg">
                            <DoorOpen className="w-4 h-4 text-slate-600" />
                          </span>
                          <span className="font-semibold text-slate-900">{room.roomName}</span>
                        </div>
                      </td>
                      
                      <td className="p-4 text-slate-600">
                        <span className="font-medium">{room.roomType || t("notClassified")}</span>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <button
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() => handleToggleStatus(room.id_room, room.isActive)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              room.isActive ? "bg-emerald-500" : "bg-slate-300"
                            } ${updatingId === room.id_room ? "opacity-50 cursor-wait" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                room.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-bold ${
                            room.isActive ? "text-emerald-600" : "text-slate-500"
                          }`}>
                            {room.isActive ? t("roomOperational") : t("roomPaused")}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRoom(room)}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                            title={tCommon("viewDetails")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/clinic-admin/rooms/edit/${room.id_room}`}
                            className="p-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all inline-flex items-center justify-center"
                            title={tCommon("edit")}
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t("showingRows", { 
                  from: Math.min((meta.page - 1) * meta.size + 1, meta.total), 
                  to: Math.min(meta.page * meta.size, meta.total), 
                  total: meta.total 
                })}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 {t("rowsPerPage")}</option>
                  <option value={10}>10 {t("rowsPerPage")}</option>
                  <option value={20}>20 {t("rowsPerPage")}</option>
                </select>
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  title={t("previousPage")}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  title={t("nextPage")}
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-primary" />
                Chi tiết Phòng chức năng
              </h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t("roomName")}</span>
                <span className="font-black text-slate-900 text-lg">{selectedRoom.roomName}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t("roomType")}</span>
                <span className="font-bold text-slate-700">{selectedRoom.roomType || t("notClassified")}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{tCommon("status")}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={updatingId !== null}
                    onClick={() => handleToggleStatus(selectedRoom.id_room, selectedRoom.isActive)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      selectedRoom.isActive ? "bg-emerald-500" : "bg-slate-300"
                    } ${updatingId === selectedRoom.id_room ? "opacity-50 cursor-wait" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        selectedRoom.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-bold ${
                    selectedRoom.isActive ? "text-emerald-600" : "text-slate-500"
                  }`}>
                    {selectedRoom.isActive ? t("roomOperational") : t("roomPaused")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Link
                href={`/clinic-admin/rooms/edit/${selectedRoom.id_room}`}
                className="px-5 py-2 bg-primary hover:opacity-90 text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                {tCommon("edit")}
              </Link>
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
