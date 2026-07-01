"use client";

import { useState, useEffect } from "react";
import {
  X, Loader2, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, DoorOpen, Stethoscope, Search, ArrowLeft,
} from "lucide-react";
import {
  doctorScheduleService,
  type ClinicRoomItem,
  type DoctorOptionItem,
  type CreateDoctorScheduleResponse,
} from "@/services/doctor.schedule.service";
import { ShiftType } from "@/types";

const SHIFT_OPTIONS = [
  { value: ShiftType.MORNING,   label: "Ca Sáng (8h - 12h)" },
  { value: ShiftType.AFTERNOON, label: "Ca Chiều (12h - 17h)" },
  { value: ShiftType.EVENING,   label: "Ca Tối (17h - 20h)" },
];

function toDateStr(d: Date) {
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().split("T")[0];
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function CreateScheduleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  // ── Bước 1: chọn doctor ──
  const [doctors, setDoctors] = useState<DoctorOptionItem[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOptionItem | null>(null);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await doctorScheduleService.getActiveDoctors();
        setDoctors((res.data ?? []).filter((d) => d.isActive));
      } catch {
        setError("Không thể tải danh sách bác sĩ.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((d) =>
    d.fullName.toLowerCase().includes(doctorSearch.trim().toLowerCase())
  );

  // ── Bước 2: form tạo lịch (chỉ hiện sau khi đã chọn doctor) ──
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectedShifts, setSelectedShifts] = useState<Set<ShiftType>>(new Set());
  const [roomId, setRoomId] = useState("");
  const [note, setNote] = useState("");

  const [rooms, setRooms] = useState<ClinicRoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateDoctorScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayStr = toDateStr(today);

  useEffect(() => {
    if (!selectedDoctor) return;
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await doctorScheduleService.getActiveRoomsForReceptionist();
        setRooms(res.data ?? []);
        if (res.data && res.data.length > 0) setRoomId(res.data[0].roomId);
      } catch {
        setError("Không thể tải danh sách phòng.");
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [selectedDoctor]);

  const toggleDate = (date: Date) => {
    const str = toDateStr(date);
    if (str < todayStr) return;

    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(str)) next.delete(str);
      else next.add(str);
      return next;
    });
  };

  const toggleShift = (shift: ShiftType) => {
    setSelectedShifts((prev) => {
      const next = new Set(prev);
      if (next.has(shift)) next.delete(shift);
      else next.add(shift);
      return next;
    });
  };

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const totalCombinations = selectedDates.size * selectedShifts.size;

  const handleBackToDoctorSelect = () => {
    setSelectedDoctor(null);
    setSelectedDates(new Set());
    setSelectedShifts(new Set());
    setRoomId("");
    setRooms([]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor) {
      setError("Vui lòng chọn bác sĩ.");
      return;
    }
    if (selectedDates.size === 0) {
      setError("Vui lòng chọn ít nhất 1 ngày.");
      return;
    }
    if (selectedShifts.size === 0) {
      setError("Vui lòng chọn ít nhất 1 ca làm việc.");
      return;
    }
    if (!roomId) {
      setError("Vui lòng chọn phòng khám.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await doctorScheduleService.createSchedule(selectedDoctor.doctorId, {
        workDates: Array.from(selectedDates).sort(),
        shiftTypes: Array.from(selectedShifts),
        roomId,
      });
      if (res?.data) {
        setResult(res.data);
        if (res.data.created.length > 0) onCreated();
      }
    } catch {
      setError("Không thể tạo lịch. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const monthCells = getMonthMatrix(viewYear, viewMonth);
  const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {selectedDoctor && !result && (
              <button
                onClick={handleBackToDoctorSelect}
                className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Chọn lại bác sĩ"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {selectedDoctor ? "Tạo lịch trực mới" : "Chọn bác sĩ"}
              </h3>
              {selectedDoctor && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  {selectedDoctor.fullName}
                  {selectedDoctor.specialty ? ` · ${selectedDoctor.specialty}` : ""}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Bước 1: chọn doctor ── */}
        {!selectedDoctor && (
          <div className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Tìm bác sĩ theo tên..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Đang tải danh sách bác sĩ...</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">
                  Không tìm thấy bác sĩ nào.
                </p>
              ) : (
                filteredDoctors.map((d) => (
                  <button
                    key={d.doctorId}
                    onClick={() => setSelectedDoctor(d)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      {d.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {d.fullName}
                      </p>
                      {d.specialty && (
                        <p className="text-xs text-slate-500 truncate">{d.specialty}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Bước 2: form tạo lịch ── */}
        {selectedDoctor && (
          <div className="p-6 space-y-6">

            {/* Result summary */}
            {result && (
              <div className="space-y-3">
                {result.created.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã tạo {result.created.length} lịch trực
                    </p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {result.created.map((c) => (
                        <p key={c.scheduleId} className="text-xs text-emerald-700">
                          {new Date(c.workDate).toLocaleDateString("vi-VN")} —{" "}
                          {SHIFT_OPTIONS.find((s) => s.value === c.shiftType)?.label}
                          {" · "}{c.slotCount} slot
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {result.skipped.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Đã tồn tại {result.skipped.length} ca trực, không thể tạo
                    </p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {result.skipped.map((s, i) => (
                        <p key={i} className="text-xs text-amber-700">
                          {new Date(s.workDate).toLocaleDateString("vi-VN")} —{" "}
                          {SHIFT_OPTIONS.find((x) => x.value === s.shiftType)?.label}
                          {" · "}{s.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleBackToDoctorSelect}
                    className="flex-1 px-4 py-2.5 text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Tạo lịch cho bác sĩ khác
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            {!result && (
              <>
                {/* Calendar */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    Chọn ngày làm việc ({selectedDates.size} ngày đã chọn)
                  </label>
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="font-semibold text-sm text-slate-800">
                        Tháng {viewMonth + 1} / {viewYear}
                      </span>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekdayLabels.map((w) => (
                        <div key={w} className="text-center text-[11px] font-bold text-slate-400 py-1">
                          {w}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {monthCells.map((date, idx) => {
                        if (!date) return <div key={idx} />;
                        const str = toDateStr(date);
                        const isPast = str < todayStr;
                        const isSelected = selectedDates.has(str);
                        const isToday = str === todayStr;

                        return (
                          <button
                            key={idx}
                            disabled={isPast}
                            onClick={() => toggleDate(date)}
                            className={`
                              aspect-square rounded-lg text-sm font-medium transition-all
                              ${isPast ? "text-slate-300 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50"}
                              ${isSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700"}
                              ${isToday && !isSelected ? "ring-2 ring-blue-300" : ""}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Multi-select Ca */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    Chọn ca làm việc ({selectedShifts.size} ca đã chọn)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SHIFT_OPTIONS.map((s) => {
                      const isSelected = selectedShifts.has(s.value);
                      return (
                        <button
                          key={s.value}
                          onClick={() => toggleShift(s.value)}
                          className={`
                            px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left
                            ${isSelected
                              ? "bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-400"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span>{s.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Summary tổ hợp */}
                {totalCombinations > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                    Sẽ tạo <span className="font-bold">{totalCombinations}</span> lịch trực
                    {" "}cho <span className="font-bold">{selectedDoctor.fullName}</span>
                    {" "}({selectedDates.size} ngày × {selectedShifts.size} ca)
                  </div>
                )}

                {/* Room */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1.5 block">
                    Phòng khám
                  </label>
                  <div className="relative">
                    <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      disabled={loadingRooms}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 disabled:opacity-50"
                    >
                      {loadingRooms ? (
                        <option>Đang tải...</option>
                      ) : rooms.length === 0 ? (
                        <option>Không có phòng nào</option>
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

                {/* Actions */}
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
                    disabled={submitting || totalCombinations === 0}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Tạo {totalCombinations > 0 ? `${totalCombinations} lịch` : "lịch"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}