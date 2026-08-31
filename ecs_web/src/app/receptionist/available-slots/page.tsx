"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Calendar as CalendarIcon, Search, User, Stethoscope,
  CheckCircle2, XCircle, Ban, Loader2, RefreshCw, Layers,
  DoorOpen, UserPlus, Plus, Pencil, Trash2
} from "lucide-react"

import { receptionistService } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"
import { ShiftType, SlotStatus, type DoctorScheduleMatrixRow, type SpecialtyCategoryResponse } from "@/types"
import CreateScheduleModal from "@/components/doctor/CreateScheduleModal"
import { doctorScheduleService } from "@/services/doctor.schedule.service"
import EditScheduleModal from "@/components/doctor/EditScheduleModal"

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
  const t = useTranslations("receptionist.slots")

  const getLocalCurrentDateString = () => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzoffset).toISOString();
    return localISOTime.split("T")[0];
  };

  const [dateFilter, setDateFilter] = useState<string>(getLocalCurrentDateString());
  const [searchDoctor, setSearchDoctor] = useState<string>("")
  const [debouncedDoctor, setDebouncedDoctor] = useState<string>("")
  const [shiftFilter, setShiftFilter] = useState<string>("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All")

  const [scheduleData, setScheduleData] = useState<DoctorScheduleMatrixRow[]>([])
  const [specialties, setSpecialties] = useState<SpecialtyCategoryResponse[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [editingRow, setEditingRow] = useState<DoctorScheduleMatrixRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DoctorScheduleMatrixRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteSchedule = (row: DoctorScheduleMatrixRow) => {
    if (row.hasBookedSlot) return;
    setDeleteTarget(row);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await doctorScheduleService.deleteSchedule(deleteTarget.doctorId, deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        t("deleteFailed")
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };
  const currentUserId = "F533F6FF-7601-47A7-A15F-1FFA2D79672E"

  const isTodaySelected = dateFilter === getLocalCurrentDateString();

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
        console.error("Cannot load specialty list", err);
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
      setError(`${t("loadError")} (${msg})`);
    } finally {
      setLoading(false)
    }
  }
  const handleToggleSlot = async (doctorId: string, slotId: string, block: boolean) => {
    try {
      await doctorScheduleService.toggleSlotBlockForReceptionist(doctorId, slotId, block);
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    }
  };


  const handleSelectWalkInShift = (row: DoctorScheduleMatrixRow, shiftType: ShiftType) => {
    const formattedWorkDate = dateFilter.toString().split('T')[0];

    const shiftLabels: Record<ShiftType, string> = {
      [ShiftType.MORNING]: t("morningShift"),
      [ShiftType.AFTERNOON]: t("afternoonShift"),
      [ShiftType.EVENING]: t("eveningShift")
    };

    const walkInFlowData = {
      step: 1,
      doctorId: row.doctorId,
      doctorName: row.doctorName,
      specialtyName: row.specialtyName,
      slotId: null,
      timeSlot: shiftLabels[shiftType] || shiftType,
      date: formattedWorkDate,
      roomName: row.roomName || t("notAssignedRoom")
    };

    sessionStorage.setItem("pending_walkin_appointment", JSON.stringify(walkInFlowData));
    router.push(`/receptionist/patients`);
  };

  const groupedByShift = scheduleData.reduce((acc, row) => {
    const type = row.shiftType as ShiftType;
    if (!acc[type]) acc[type] = []
    acc[type].push(row)
    return acc
  }, {} as Record<ShiftType, DoctorScheduleMatrixRow[]>)

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t("manageTitle")}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("manageSubtitle")}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors active:scale-95"
          style={{ backgroundColor: "#00658D" }}
        >
          <Plus className="w-4 h-4" />
          <span>{t("createSchedule")}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">{t("workDate")}</label>
          <div className="relative w-full">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2"
              style={{ "--tw-ring-color": "#00658D" } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">{t("specialty")}</label>
          <div className="relative w-full">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-700 font-medium cursor-pointer focus:ring-2 appearance-none"
              style={{ "--tw-ring-color": "#00658D" } as React.CSSProperties}
            >
              <option value="All">{t("allSpecialties")}</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">{t("searchDoctor")}</label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("doctorPlaceholder")}
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#00658D" } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-slate-600">{t("filterShift")}</label>
          <div className="relative w-full">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full px-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-700 font-medium cursor-pointer focus:ring-2 appearance-none"
              style={{ "--tw-ring-color": "#00658D" } as React.CSSProperties}
            >
              <option value="">{t("allShifts")}</option>
              <option value={ShiftType.MORNING}>{t("morningShift")}</option>
              <option value={ShiftType.AFTERNOON}>{t("afternoonShift")}</option>
              <option value={ShiftType.EVENING}>{t("eveningShift")}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="border text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 h-9.5w-full"
          style={{ borderColor: "#00658D", backgroundColor: "transparent", color: "#00658D" }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t("syncing") : t("reloadSchedule")}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300"></div><span>{t("legendAvailable")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div><span>{t("legendBooked")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-200"></div><span>{t("legendBlocked")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div><span>{t("legendNotRegistered")}</span></div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-62.5">
          <Loader2 className="h-8 w-8 animate-spin mb-2" style={{ color: "#00658D" }} />
          <p className="text-sm text-slate-500">{t("syncingData")}</p>
        </div>
      ) : scheduleData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          {t("noResults")}
        </div>
      ) : (
        <div className="space-y-8">
          {SHIFT_ORDER.map((currentShift) => {
            const rows = groupedByShift[currentShift] || []
            if (rows.length === 0) return null
            const timeLabels = SHIFT_TIMELINE_MAP[currentShift]

            const shiftLabel = 
              currentShift === ShiftType.MORNING ? t("shiftBlock") :
              currentShift === ShiftType.AFTERNOON ? t("shiftAfternoon") :
              t("shiftEvening")

            return (
              <div key={currentShift} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" style={{ color: "#00658D" }} />
                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                      {shiftLabel}
                    </span>
                  </div>
                  <span className="text-xs font-semibold bg-white px-2.5 py-1 border border-slate-200 rounded-full text-slate-600">
                    {rows.length} {t("doctorsOnDuty")}
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="px-6 py-3 w-[300px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {t("doctorRoom")}
                        </th>
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
                          <td className="px-6 py-4 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">
                            <div className="flex flex-col space-y-3">
                              {/* Doctor info */}
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#00658D10", borderColor: "#00658D30", color: "#00658D" }}>
                                  <User className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col min-w-0 space-y-1.5 w-full">
                                  <span className="font-bold text-xs text-slate-800 truncate">
                                    {row.title ? `${row.title} ` : ""}{row.doctorName}
                                  </span>
                                  <div className="flex flex-col gap-1 w-full items-start">
                                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                                      <Stethoscope className="h-2.5 w-2.5 text-indigo-500 flex-shrink-0" />
                                      <span>{row.specialtyName}</span>
                                    </span>
                                    <span className="text-[10px] text-slate-700 font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 w-full break-words">
                                      <DoorOpen className="h-2.5 w-2.5 text-slate-500 flex-shrink-0" />
                                      <span>{row.roomName || t("notAssignedRoom")}</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => setEditingRow(row)}
                                          disabled={row.hasBookedSlot}
                                          title={row.hasBookedSlot ? t("cannotEdit") : t("editSchedule")}
                                          className="p-1 rounded opacity-30 cursor-not-allowed"
                                          style={{ color: "#00658D", backgroundColor: "#00658D10" }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSchedule(row)}
                                          disabled={row.hasBookedSlot}
                                          title={row.hasBookedSlot ? t("cannotDelete") : t("deleteSchedule")}
                                          className="p-1 rounded opacity-30 cursor-not-allowed"
                                          style={{ color: "#dc2626", backgroundColor: "#fee2e2" }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Walk-in registration button */}
                              {isTodaySelected && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectWalkInShift(row, currentShift)}
                                  className="p-1.5 px-3 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                                  style={{ backgroundColor: "#00658D" }}
                                >
                                  <UserPlus className="h-3 w-3" />
                                  <span>{t("registerWalkin")}</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {timeLabels.map((time) => {
                            const slot = row.slots.find(s => {
                              if (!s.startTime) return false;
                              const timePart = s.startTime.split("T")[1];
                              return timePart ? timePart.substring(0, 5) === time : false;
                            });

                            if (!slot) {
                              return (
                                <td key={time} className="p-1.5 bg-slate-50 border-r border-slate-200 text-center text-[10px] text-slate-400 font-medium select-none">
                                  <div className="w-full min-h-[44px] flex items-center justify-center border border-dashed border-slate-200 rounded-lg">-</div>
                                </td>
                              );
                            }

                            const slotStartTime = new Date(slot.startTime);
                            const currentTime = new Date();
                            const diffInMinutes = (currentTime.getTime() - slotStartTime.getTime()) / (1000 * 60);
                            const todayStr = getLocalCurrentDateString();
                            const isPastDate = dateFilter < todayStr;

                            const isExpired = slot.status === SlotStatus.AVAILABLE && (isPastDate || diffInMinutes >= 30);
                            const effectiveStatus = isExpired ? SlotStatus.BLOCKED : slot.status;

                            return (
                              <td key={time} className="p-1.5 border-r border-slate-200 text-center align-middle bg-white">
                                {effectiveStatus === SlotStatus.AVAILABLE && !isExpired && (
                                  <div
                                    onClick={() => handleToggleSlot(row.doctorId, slot.id, true)}
                                    title={t("clickToBlock")}
                                    className="w-full min-h-[44px] p-1 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-center flex flex-col items-center justify-center select-none shadow-sm cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                      <span>{slot.maxPatients - slot.currentPatients} {t("slotsAvailable")}</span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-emerald-600 bg-white border border-emerald-100 px-1 mt-0.5 rounded">
                                      {slot.currentPatients}/{slot.maxPatients} {t("patients")}
                                    </span>
                                  </div>
                                )}

                                {effectiveStatus === SlotStatus.BOOKED && (
                                  <div className="w-full min-h-[44px] p-1 rounded-xl bg-amber-50 border border-amber-200 text-center flex flex-col items-center justify-center select-none cursor-not-allowed">
                                    <div className="flex items-center gap-0.5 font-bold text-amber-700 text-[11px]">
                                      <XCircle className="h-3 w-3 text-amber-500" />
                                      <span>{t("slotFull")}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1 mt-0.5 rounded">
                                      {slot.currentPatients}/{slot.maxPatients} {t("patients")}
                                    </span>
                                  </div>
                                )}

                                {effectiveStatus === SlotStatus.BLOCKED && (
                                  <div
                                    className="w-full min-h-[44px] p-1 rounded-xl bg-rose-50 border border-rose-200 text-center flex flex-col items-center justify-center select-none cursor-not-allowed"
                                    title={isExpired ? t("slotExpiredTitle") : t("slotBlockedTitle")}
                                  >
                                    <Ban className="h-3 w-3 text-rose-400" />
                                    <span className="text-[9px] font-bold text-rose-500 mt-0.5">
                                      {isExpired ? t("slotExpired") : t("slotBlocked")}
                                    </span>
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
      {showCreateModal && (
        <CreateScheduleModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}
      {editingRow && (
        <EditScheduleModal
          doctorId={editingRow.doctorId}
          schedule={{
            scheduleId: editingRow.id,
            shiftType: editingRow.shiftType,
            roomId: editingRow.roomId ?? undefined,
            slots: editingRow.slots.map((s) => ({
              slotId: s.slotId,
              startTime: s.startTime,
              endTime: s.endTime,
              maxPatients: s.maxPatients,
              currentPatients: s.currentPatients,
              status: s.status,
              appointments: [],
            })),
          }}
          onClose={() => setEditingRow(null)}
          onUpdated={() => {
            setEditingRow(null);
            fetchData();
          }}
        />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-800">{t("deleteConfirmTitle")}</h3>
            <p className="text-sm text-slate-600">
              {t("deleteConfirmBody", { doctor: deleteTarget.doctorName, date: dateFilter })}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "#ba1a1a" }}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
