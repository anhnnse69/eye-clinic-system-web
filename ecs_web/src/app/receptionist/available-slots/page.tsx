"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar as CalendarIcon, Search, User, Stethoscope,
  CheckCircle2, XCircle, Ban, Loader2, RefreshCw, Layers,
  DoorOpen 
} from "lucide-react"

import { receptionistService } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"
import { ShiftType, SlotStatus, type DoctorScheduleMatrixRow, type SpecialtyCategoryResponse } from "@/types"

const SHIFT_TIMELINE_MAP: Record<ShiftType, string[]> = {
  [ShiftType.MORNING]: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  [ShiftType.AFTERNOON]: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  [ShiftType.EVENING]: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"]
}

const SHIFT_ORDER: ShiftType[] = [
  ShiftType.MORNING,
  ShiftType.AFTERNOON,
  ShiftType.EVENING
]

export default function RealShiftTimeSchedulerPage() {
  const router = useRouter()

  const [dateFilter, setDateFilter] = useState<string>("2026-06-17")
  const [searchDoctor, setSearchDoctor] = useState<string>("")
  const [debouncedDoctor, setDebouncedDoctor] = useState<string>("")
  const [shiftFilter, setShiftFilter] = useState<string>("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All")

  const [scheduleData, setScheduleData] = useState<DoctorScheduleMatrixRow[]>([])
  const [specialties, setSpecialties] = useState<SpecialtyCategoryResponse[]>([])
  
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const currentUserId = "F533F6FF-7601-47A7-A15F-1FFA2D79672E" 

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDoctor(searchDoctor), 400)
    return () => clearTimeout(handler)
  }, [searchDoctor])

  useEffect(() => {
    async function loadSpecialties() {
      try {
        const res = await receptionistService.getActiveSpecialties();
        if (res.data) setSpecialties(res.data);
      } catch (err) {
        console.error("Không thể tải danh mục chuyên khoa động", err);
      }
    }
    loadSpecialties();
  }, [])

  useEffect(() => {
    fetchData()
  }, [dateFilter, debouncedDoctor, shiftFilter, specialtyFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await receptionistService.getAvailableSlots({
        currentUserId: currentUserId,
        workDate: dateFilter,
        searchDoctor: debouncedDoctor,
        shiftType: shiftFilter,
        specialtyId: specialtyFilter
      });

      setScheduleData(response.data || [])
    } catch (err) {
      const msg = handleApiError(err);
      setError(`Lỗi hệ thống (${msg}): Không thể tải sơ đồ điều phối ca trực từ Server.`);
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSlot = (slotId: string, doctorName: string, timeLabel: string, roomName: string | null | undefined) => {
    const encodedDoctor = encodeURIComponent(doctorName)
    const encodedRoom = encodeURIComponent(roomName || "Chưa gán phòng")
    router.push(`/receptionist/appointments/create-walk-in?slotId=${slotId}&doctor=${encodedDoctor}&time=${timeLabel}&date=${dateFilter}&room=${encodedRoom}`)
  }

  const findSlotByTimeLabel = (slots: any[], timeLabel: string) => {
    return slots.find(s => {
      const dateObj = new Date(s.startTime);
      const hours = String(dateObj.getUTCHours()).padStart(2, '0');
      const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}` === timeLabel;
    })
  }

  const groupedByShift = scheduleData.reduce((acc, row) => {
    const type = row.shiftType as ShiftType;
    if (!acc[type]) acc[type] = []
    acc[type].push(row)
    return acc
  }, {} as Record<ShiftType, DoctorScheduleMatrixRow[]>)

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Lịch trống Khám bệnh</h2>
        <p className="text-sm text-slate-500 mt-0.5">Hệ thống hiển thị trạng thái lịch thực tế của bác sĩ và vị trí phòng chức năng phụ trách</p>
      </div>

      {/* Thanh Bộ Lọc */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">Ngày làm việc</label>
          <div className="relative w-full">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">Chuyên khoa chuyên môn</label>
          <div className="relative w-full">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-700 font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="All">Tất cả chuyên khoa</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">Tên bác sĩ cần tìm</label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Nhập tên bác sĩ..."
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">Xem riêng lẻ Ca</label>
          <div className="relative w-full">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-700 font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Tất cả các ca</option>
              <option value={ShiftType.MORNING}>Ca Sáng (8h - 12h)</option>
              <option value={ShiftType.AFTERNOON}>Ca Chiều (12h - 17h)</option>
              <option value={ShiftType.EVENING}>Ca Tối (17h - 20h)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 h-[38px] w-full"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Đang đồng bộ..." : "Tải lại sơ đồ"}
        </button>
      </div>

      {/* Legend trạng thái */}
      <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-50 border border-green-300"></div><span>Mở trống (Bấm xếp lịch vãng lai)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div><span>Đã đặt kín chỗ (Booked)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-200"></div><span>Khóa/Chặn (Blocked)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div><span>Bác sĩ không đăng ký giờ này</span></div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
      
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
          <p className="text-sm text-slate-500">Đang đồng bộ dữ liệu lịch phân phối thực tế từ cơ sở dữ liệu phòng khám...</p>
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          Không tìm thấy bác sĩ hoặc lịch trực nào khớp với bộ lọc chuyên khoa / tên đang chọn.
        </div>
      ) : (
        <div className="space-y-8">
          {SHIFT_ORDER.map((currentShift) => {
            const rows = groupedByShift[currentShift] || []
            if (rows.length === 0) return null
            const timeLabels = SHIFT_TIMELINE_MAP[currentShift]

            return (
              <div key={currentShift} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                      {currentShift === ShiftType.MORNING && "☀️ KHỐI CA SÁNG (08:00 - 12:00)"}
                      {currentShift === ShiftType.AFTERNOON && "⛅ KHỐI CA CHIỀU (12:00 - 17:00)"}
                      {currentShift === ShiftType.EVENING && "🌙 KHỐI CA TỐI (17:00 - 20:00)"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-white px-2.5 py-1 border border-slate-200 rounded-full text-slate-600">
                    {rows.length} Bác sĩ đang trực
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="px-6 py-3 w-[280px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Bác sĩ & Phòng khám</th>
                        {timeLabels.map((time) => (
                          <th key={time} className="px-2 py-3 text-center border-r border-slate-200 min-w-[95px]">
                            {time}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                          
                          <td className="px-6 py-3.5 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <User className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0 space-y-1.5 w-full">
                                <span className="font-bold text-xs text-slate-800 truncate">
                                  {row.title ? `${row.title} ` : ""}{row.doctorName}
                                </span>
                                
                                <div className="flex flex-col gap-1 w-full items-start">
                                  {/* Chuyên khoa */}
                                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                                    <Stethoscope className="h-2.5 w-2.5 text-indigo-500 flex-shrink-0" />
                                    <span>{row.specialtyName}</span>
                                  </span>
                                  
                                  {/* Phòng khám: Đã đổi sang icon DoorOpen (Cánh cửa) */}
                                  <span className="text-[10px] text-slate-700 font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 w-full break-words">
                                    <DoorOpen className="h-2.5 w-2.5 text-slate-500 flex-shrink-0" />
                                    <span>{row.roomName || "Chưa xếp phòng"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {timeLabels.map((time) => {
                            const slot = findSlotByTimeLabel(row.slots, time)

                            if (!slot) {
                              return (
                                <td key={time} className="p-1.5 bg-slate-50 border-r border-slate-200 text-center text-[10px] text-slate-400 font-medium select-none">
                                  <div className="w-full min-h-[44px] flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                                    -
                                  </div>
                                </td>
                              )
                            }

                            return (
                              <td key={time} className="p-1.5 border-r border-slate-200 text-center align-middle bg-white">
                                {slot.status === SlotStatus.AVAILABLE && (
                                  <button
                                    onClick={() => handleSelectSlot(slot.id, row.doctorName, time, row.roomName)}
                                    title={`Bấm để xếp lịch khám tại ${row.roomName || 'phòng trực'}`}
                                    className="w-full min-h-[44px] p-1 rounded-xl bg-green-50 hover:bg-green-600 border border-green-200 hover:border-green-700 text-center flex flex-col items-center justify-center transition-all duration-150 active:scale-95 shadow-sm group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1 font-bold text-green-700 group-hover:text-white text-[11px] transition-colors">
                                      <CheckCircle2 className="h-3 w-3 text-green-600 group-hover:text-white transition-colors" />
                                      <span>Trống</span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-green-600 group-hover:text-green-700 bg-white border border-green-100 px-1 mt-0.5 rounded transition-colors">
                                      {slot.currentPatients}/{slot.maxPatients} BN
                                    </span>
                                  </button>
                                )}

                                {slot.status === SlotStatus.BOOKED && (
                                  <div className="w-full min-h-[44px] p-1 rounded-xl bg-amber-50 border border-amber-200 text-center flex flex-col items-center justify-center select-none cursor-not-allowed">
                                    <div className="flex items-center gap-0.5 font-bold text-amber-700 text-[11px]">
                                      <XCircle className="h-3 w-3 text-amber-500" />
                                      <span>Kín</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1 mt-0.5 rounded">
                                      {slot.currentPatients}/{slot.maxPatients} BN
                                    </span>
                                  </div>
                                )}

                                {slot.status === SlotStatus.BLOCKED && (
                                  <div className="w-full min-h-[44px] p-1 rounded-xl bg-rose-50 border border-rose-100 text-center flex flex-col items-center justify-center select-none cursor-not-allowed">
                                    <Ban className="h-3 w-3 text-rose-400" />
                                    <span className="text-[9px] font-bold text-rose-500 mt-0.5">Khóa</span>
                                  </div>
                                )}
                              </td>
                            )
                          })}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}