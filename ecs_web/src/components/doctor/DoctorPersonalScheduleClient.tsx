"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon, Loader2, RefreshCw, Layers,
  DoorOpen, User, Phone, CheckCircle2,
  XCircle, Ban, Plus, Pencil, Trash2,
} from "lucide-react";

import {
  doctorScheduleService,
  type ScheduleShiftItem,
  type ScheduleSlotItem,
} from "@/services/doctor.schedule.service";
import { ShiftType, SlotStatus } from "@/types";
import CreateScheduleModal from "./CreateScheduleModal";
import EditScheduleModal from "./EditScheduleModal";

const SHIFT_TIMELINE_MAP: Record<ShiftType, string[]> = {
  [ShiftType.MORNING]: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  [ShiftType.AFTERNOON]: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  [ShiftType.EVENING]: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"],
};

const SHIFT_ORDER: ShiftType[] = [
  ShiftType.MORNING,
  ShiftType.AFTERNOON,
  ShiftType.EVENING,
];

const SHIFT_TITLE: Record<ShiftType, string> = {
  [ShiftType.MORNING]: "☀️ CA SÁNG (08:00 - 12:00)",
  [ShiftType.AFTERNOON]: "⛅ CA CHIỀU (12:00 - 17:00)",
  [ShiftType.EVENING]: "🌙 CA TỐI (17:00 - 20:00)",
};

export default function DoctorPersonalScheduleClient({
  doctorId,
}: {
  doctorId: string;
}) {
  const getLocalCurrentDateString = () => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().split("T")[0];
  };

  const [dateFilter, setDateFilter] = useState<string>(getLocalCurrentDateString());
  const [shiftFilter, setShiftFilter] = useState<string>("");

  const [shifts, setShifts] = useState<ScheduleShiftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleShiftItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ScheduleShiftItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorScheduleService.getPersonalSchedule(doctorId, {
        workDate: dateFilter,
        shiftType: (shiftFilter as ShiftType) || undefined,
      });
      setShifts(res.data?.shifts ?? []);
    } catch {
      setError("Không thể tải lịch cá nhân. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateFilter, shiftFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const groupedByShift = shifts.reduce((acc, shift) => {
    acc[shift.shiftType] = shift;
    return acc;
  }, {} as Record<ShiftType, ScheduleShiftItem>);

  const todayStr = getLocalCurrentDateString();
  const isPastDate = dateFilter < todayStr;

  // ── Toggle block/unblock 1 slot ──
  const handleToggleBlock = async (slotId: string, block: boolean) => {
    try {
      await doctorScheduleService.toggleSlotBlock(doctorId, slotId, block);
      fetchData();
    } catch {
      setError("Không thể thay đổi trạng thái slot. Vui lòng thử lại.");
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await doctorScheduleService.deleteSchedule(doctorId, deleteTarget.scheduleId);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Không thể xóa ca này. Ca đã có bệnh nhân đặt lịch.";
      setError(msg);
      setDeleteTarget(null); // đóng modal, hiện lỗi ở ngoài
    } finally {
      setDeleting(false);
    }
  };

  // ── Kiểm tra ca có slot đã booked không (để disable nút sửa) ──
  const hasBookedSlot = (shift: ScheduleShiftItem) =>
    shift.slots.some((s) => s.status === SlotStatus.BOOKED);

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch cá nhân</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Sơ đồ lịch trực và lịch hẹn của bạn theo từng khung giờ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo lịch trực
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 h-[38px] w-full"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Đang đồng bộ..." : "Tải lại"}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-50 border border-green-300"></div><span>Còn trống (bấm để khóa)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div><span>Đã đặt kín chỗ</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-200"></div><span>Khóa (bấm để mở lại)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div><span>Không có lịch</span></div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu lịch...</p>
        </div>
      ) : shifts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          Bạn không có lịch trực vào ngày này.
        </div>
      ) : (
        <div className="space-y-8">
          {SHIFT_ORDER.map((currentShift) => {
            const shift = groupedByShift[currentShift];
            if (!shift) return null;
            const timeLabels = SHIFT_TIMELINE_MAP[currentShift];
            const disableEdit = hasBookedSlot(shift);

            return (
              <div key={currentShift} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                      {SHIFT_TITLE[currentShift]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-white px-2.5 py-1 border border-slate-200 rounded-full text-slate-600 flex items-center gap-1.5">
                      <DoorOpen className="h-3 w-3 text-slate-500" />
                      {shift.roomName || "Chưa xếp phòng"}
                    </span>

                    <button
                      onClick={() => setEditTarget(shift)}
                      disabled={disableEdit}
                      title={
                        disableEdit
                          ? "Ca này đã có bệnh nhân đặt lịch, không thể sửa"
                          : "Sửa ngày/phòng của ca này"
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <Pencil className="h-3 w-3" />
                      Sửa ca
                    </button>
                    <button
                      onClick={() => setDeleteTarget(shift)}
                      disabled={disableEdit}
                      title={
                        disableEdit
                          ? "Ca này đã có bệnh nhân đặt lịch, không thể xóa"
                          : "Xóa ca này"
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa ca
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase">
                        {timeLabels.map((time) => (
                          <th key={time} className="px-2 py-3 text-center border-r border-slate-200 min-w-[140px]">
                            {time}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {timeLabels.map((time) => {
                          const slot = shift.slots.find((s) => {
                            const timePart = s.startTime.split("T")[1];
                            return timePart ? timePart.substring(0, 5) === time : false;
                          });

                          if (!slot) {
                            return (
                              <td key={time} className="p-1.5 bg-slate-50 border-r border-slate-200 text-center text-[10px] text-slate-400 font-medium select-none align-top">
                                <div className="w-full min-h-[80px] flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                                  -
                                </div>
                              </td>
                            );
                          }

                          const slotStartTime = new Date(slot.startTime);
                          const currentTime = new Date();
                          const diffInMinutes =
                            (currentTime.getTime() - slotStartTime.getTime()) / (1000 * 60);

                          const isExpired =
                            slot.status === SlotStatus.AVAILABLE &&
                            (isPastDate || diffInMinutes >= 30);

                          const effectiveStatus = isExpired ? SlotStatus.BLOCKED : slot.status;

                          return (
                            <td key={time} className="p-1.5 border-r border-slate-200 text-center align-top bg-white">
                              <SlotCell
                                slot={slot}
                                effectiveStatus={effectiveStatus}
                                onToggleBlock={handleToggleBlock}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateScheduleModal
          doctorId={doctorId}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}

      {editTarget && (
        <EditScheduleModal
          doctorId={doctorId}
          schedule={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => {
            setEditTarget(null);
            fetchData();
          }}
        />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Xóa ca trực</h3>
            <p className="text-sm text-slate-600">
              Bạn chắc chắn muốn xóa{" "}
              <span className="font-semibold">
                {SHIFT_TITLE[deleteTarget.shiftType]}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Slot Cell ─────────────────────────────────────────────

function SlotCell({
  slot,
  effectiveStatus,
  onToggleBlock,
}: {
  slot: ScheduleSlotItem;
  effectiveStatus: SlotStatus;
  onToggleBlock: (slotId: string, block: boolean) => void;
}) {
  // BLOCKED — bấm để mở lại
  if (effectiveStatus === SlotStatus.BLOCKED) {
    return (
      <button
        onClick={() => onToggleBlock(slot.slotId, false)}
        title="Bấm để mở lại slot"
        className="w-full min-h-[80px] p-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 flex flex-col items-center justify-center transition-colors"
      >
        <Ban className="h-3 w-3 text-rose-400" />
        <span className="text-[9px] font-bold text-rose-500 mt-0.5">Khóa</span>
      </button>
    );
  }

  // BOOKED — kín lịch, hiển thị danh sách BN, không thao tác được
  if (effectiveStatus === SlotStatus.BOOKED) {
    return (
      <div className="w-full min-h-[80px] p-2 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-bold text-amber-700 text-[10px]">
            <XCircle className="h-3 w-3 text-amber-500" />
            Kín
          </span>
          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1 rounded">
            {slot.currentPatients}/{slot.maxPatients}
          </span>
        </div>

        {slot.appointments.length > 0 && (
          <div className="space-y-1 mt-0.5 max-h-[160px] overflow-y-auto pr-1">
            {slot.appointments.map((a) => (
              <div
                key={a.appointmentId}
                title={a.symptoms || ""}
                className="bg-white border border-amber-100 rounded-lg px-1.5 py-1 text-left text-xs"
              >
                <p className="font-semibold text-slate-800 truncate flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  {a.patientName}
                </p>
                {a.patientPhone && (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 shrink-0" />
                    {a.patientPhone}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // AVAILABLE — bấm để khóa
  return (
    <button
      onClick={() => onToggleBlock(slot.slotId, true)}
      title="Bấm để khóa slot này"
      className="w-full min-h-[80px] p-2 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 flex flex-col items-center justify-center transition-colors"
    >
      <div className="flex items-center gap-1 font-bold text-green-700 text-[11px]">
        <CheckCircle2 className="h-3 w-3 text-green-600" />
        <span>Trống</span>
      </div>
      <span className="text-[9px] font-extrabold text-green-600 bg-white border border-green-100 px-1 mt-0.5 rounded">
        {slot.currentPatients}/{slot.maxPatients} BN
      </span>
    </button>
  );
}