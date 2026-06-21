"use client";

import { useState, useEffect } from "react";
import { X, Loader2, DoorOpen, CalendarIcon } from "lucide-react";
import {
  doctorScheduleService,
  type ClinicRoomItem,
  type ScheduleShiftItem,
} from "@/services/doctor.schedule.service";

function toDateStr(d: Date) {
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().split("T")[0];
}

export default function EditScheduleModal({
  doctorId,
  schedule,
  onClose,
  onUpdated,
}: {
  doctorId: string;
  schedule: ScheduleShiftItem;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const currentWorkDate = schedule.slots[0]
    ? schedule.slots[0].startTime.split("T")[0]
    : toDateStr(new Date());

  const [workDate, setWorkDate] = useState(currentWorkDate);
  const [roomId, setRoomId] = useState<string>("");
  const [rooms, setRooms] = useState<ClinicRoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const todayStr = toDateStr(new Date());

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await doctorScheduleService.getActiveRooms(doctorId);
        const list = res.data ?? [];
        setRooms(list);

        // ── FIX: luôn đảm bảo roomId có giá trị hợp lệ ──
        // Ưu tiên giữ room hiện tại của ca nếu nó còn active trong list.
        // Nếu không có, fallback sang room đầu tiên trong list.
        const currentRoomStillActive = list.find(
          (r) => r.roomId === schedule.roomId
        );

        if (currentRoomStillActive) {
          setRoomId(currentRoomStillActive.roomId);
        } else if (list.length > 0) {
          setRoomId(list[0].roomId);
        }
      } catch {
        setError("Không thể tải danh sách phòng.");
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [doctorId, schedule.roomId]);

  const handleSubmit = async () => {
    if (workDate < todayStr) {
      setError("Không thể chọn ngày trong quá khứ.");
      return;
    }

    if (!roomId) {
      setError("Vui lòng chọn phòng khám.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await doctorScheduleService.editSchedule(doctorId, schedule.scheduleId, {
        workDate: workDate !== currentWorkDate ? workDate : undefined,

        roomId: roomId,
      });
      setSuccess("Cập nhật ca trực thành công.");
      setTimeout(() => {
        onUpdated();
      }, 3500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Không thể cập nhật ca. Có thể ca này đã có bệnh nhân đặt lịch hoặc đã có ca."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Sửa ca trực</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600 mb-1.5 block">
            Ngày làm việc
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={workDate}
              min={todayStr}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-600 mb-1.5 block">
            Phòng khám
          </label>
          <div className="relative">
            <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={loadingRooms || rooms.length === 0}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 disabled:opacity-50"
            >
              {loadingRooms ? (
                <option value="">Đang tải...</option>
              ) : rooms.length === 0 ? (
                <option value="">Không có phòng nào</option>
              ) : (
                rooms.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    {r.roomName} ({r.roomType})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingRooms || !roomId}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}