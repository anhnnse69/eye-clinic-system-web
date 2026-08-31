"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  X, Loader2, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, DoorOpen, Search, ArrowLeft, Trash2,
  CalendarPlus,
} from "lucide-react";
import {
  doctorScheduleService,
  type ClinicRoomItem,
  type DoctorOptionItem,
  type ShiftRangeItem,
  type BatchCreateDoctorScheduleResponse,
} from "@/services/doctor.schedule.service";
import { ShiftType } from "@/types";

function formatHm(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return m === "00" ? `${hour}h` : `${hour}h${m}`;
}

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

type SelectionMap = Map<string, string>;

export default function BatchCreateScheduleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useTranslations("doctor.schedule")

  const [step, setStep] = useState<1 | 2>(1);

  const [doctors, setDoctors] = useState<DoctorOptionItem[]>([]);
  const [rooms, setRooms] = useState<ClinicRoomItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [doctorSearch, setDoctorSearch] = useState("");

  const [shiftOptions, setShiftOptions] = useState<
    { value: ShiftType; label: string }[]
  >([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [doctorRes, roomRes] = await Promise.all([
          doctorScheduleService.getActiveDoctors(),
          doctorScheduleService.getActiveRoomsForReceptionist(),
        ]);
        setDoctors((doctorRes.data ?? []).filter((d) => d.isActive));
        setRooms(roomRes.data ?? []);
      } catch {
        setError(t("submitError"));
      } finally {
        setLoadingData(false);
      }
    };
    loadAll();
  }, [t]);

  useEffect(() => {
    const loadShiftRanges = async () => {
      setLoadingShifts(true);
      try {
        const res = await doctorScheduleService.getShiftRanges();
        const options = (res.data ?? []).map((r: ShiftRangeItem) => {
          let shiftKey = '';
          if (r.shiftType === ShiftType.MORNING) {
            shiftKey = 'morning';
          } else if (r.shiftType === ShiftType.AFTERNOON) {
            shiftKey = 'afternoon';
          } else if (r.shiftType === ShiftType.EVENING) {
            shiftKey = 'evening';
          }
          return {
            value: r.shiftType,
            label: `${t(shiftKey)} (${formatHm(r.startTime)} - ${formatHm(r.endTime)})`,
          };
        });
        setShiftOptions(options);
      } catch {
        setError(t("submitError"));
      } finally {
        setLoadingShifts(false);
      }
    };
    loadShiftRanges();
  }, [t]);

  const [selection, setSelection] = useState<SelectionMap>(new Map());

  const filteredDoctors = doctors.filter((d) =>
    d.fullName.toLowerCase().includes(doctorSearch.trim().toLowerCase())
  );

  const defaultRoomId = rooms.length > 0 ? rooms[0].roomId : "";

  const toggleDoctor = (doctorId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      if (next.has(doctorId)) {
        next.delete(doctorId);
      } else {
        next.set(doctorId, defaultRoomId);
      }
      return next;
    });
  };

  const setDoctorRoom = (doctorId: string, roomId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      next.set(doctorId, roomId);
      return next;
    });
  };

  const removeDoctor = (doctorId: string) => {
    setSelection((prev) => {
      const next = new Map(prev);
      next.delete(doctorId);
      return next;
    });
  };

  const selectedDoctors = useMemo(
    () =>
      Array.from(selection.keys())
        .map((id) => doctors.find((d) => d.doctorId === id))
        .filter((d): d is DoctorOptionItem => !!d),
    [selection, doctors]
  );

  const allRoomsAssigned =
    selection.size > 0 &&
    Array.from(selection.values()).every((roomId) => !!roomId);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [selectedShifts, setSelectedShifts] = useState<Set<ShiftType>>(new Set());

  const todayStr = toDateStr(today);

  const getAllDatesInCurrentMonth = () => {
    const dates: string[] = [];
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateStr = toDateStr(date);
      if (dateStr >= todayStr) {
        dates.push(dateStr);
      }
    }
    return dates;
  };

  const handleSelectAllMonth = () => {
    const allDates = getAllDatesInCurrentMonth();
    setSelectedDates((prev) => {
      const next = new Set(prev);
      const isAllSelected = allDates.every((d) => prev.has(d));
      
      if (isAllSelected) {
        allDates.forEach((d) => next.delete(d));
      } else {
        allDates.forEach((d) => next.add(d));
      }
      return next;
    });
  };

  const isAllMonthSelected = useMemo(() => {
    const allDates = getAllDatesInCurrentMonth();
    return allDates.length > 0 && allDates.every((d) => selectedDates.has(d));
  }, [selectedDates, viewYear, viewMonth]);

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

  const totalCombinations =
    selection.size * selectedDates.size * selectedShifts.size;

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BatchCreateDoctorScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoToStep2 = () => {
    if (selection.size === 0) {
      setError(t("step1Error"));
      return;
    }
    if (!allRoomsAssigned) {
      setError(t("step1RoomError"));
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
    setSelection(new Map());
    setSelectedDates(new Set());
    setSelectedShifts(new Set());
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedDates.size === 0) {
      setError(t("step2DateError"));
      return;
    }
    if (selectedShifts.size === 0) {
      setError(t("step2ShiftError"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await doctorScheduleService.batchCreateSchedule({
        assignments: Array.from(selection.entries()).map(([doctorId, roomId]) => ({
          doctorId,
          roomId,
        })),
        workDates: Array.from(selectedDates).sort(),
        shiftTypes: Array.from(selectedShifts),
      });
      if (res?.data) {
        setResult(res.data);
        if (res.data.totalCreated > 0) onCreated();
      }
    } catch {
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const monthCells = getMonthMatrix(viewYear, viewMonth);
  const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const roomName = (roomId: string) =>
    rooms.find((r) => r.roomId === roomId)?.roomName ?? "—";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {step === 2 && !result && (
              <button
                onClick={() => setStep(1)}
                className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title={t("back") || "Back"}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {t("batchCreateTitle")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 1
                  ? t("step1SelectDoctor")
                  : t("step2SelectDateShift")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder={t("searchDoctorPlaceholder")}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00658d] text-slate-700"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {loadingData ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00658D" }} />
                  <span className="text-sm">{t("loadingData")}</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">
                  {t("noDoctorsFound")}
                </p>
              ) : (
                filteredDoctors.map((d) => {
                  const isChecked = selection.has(d.doctorId);
                  const roomId = selection.get(d.doctorId) ?? "";
                  return (
                    <div
                      key={d.doctorId}
                      className={`rounded-xl border transition ${
                        isChecked
                          ? "border-[#00658d] bg-[#00658d]/5"
                          : "border-slate-200"
                      }`}
                    >
                      <label className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDoctor(d.doctorId)}
                          className="w-4 h-4 rounded border-slate-300 text-[#00658d] focus:ring-[#00658d] accent-[#00658d] shrink-0"
                        />
                        <div className="w-9 h-9 rounded-full bg-[#00658d]/10 text-[#00658d] flex items-center justify-center font-bold shrink-0 text-sm">
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
                      </label>

                      {isChecked && (
                        <div className="px-4 pb-3 pl-16">
                          <div className="relative">
                            <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                              value={roomId}
                              onChange={(e) => setDoctorRoom(d.doctorId, e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00658d] text-slate-700"
                            >
                              {rooms.length === 0 ? (
                                <option value="">{t("noRoomsAvailable")}</option>
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
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {selection.size > 0 && (
              <div className="bg-[#00658d]/10 border border-[#00658d]/20 rounded-xl px-4 py-3 text-sm text-[#00658d] font-medium">
                {t("selectedCount", { count: selection.size })}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleGoToStep2}
                disabled={selection.size === 0}
                className="px-5 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-50"
                style={{ backgroundColor: "#00658D" }}
              >
                {t("continue")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6">

            {result && (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> {t("created")} {result.totalCreated}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                    <AlertCircle className="w-4 h-4" /> {t("skipped")} {result.totalSkipped}
                  </span>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {result.results.map((r) => (
                    <div key={r.doctorId} className="border border-slate-200 rounded-xl p-3">
                      <p className="text-sm font-bold text-slate-800 mb-2">{r.doctorName}</p>

                      {r.created.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2">
                          <p className="text-xs font-semibold text-emerald-700 mb-1.5">
                            {t("schedulesCreated", { count: r.created.length })}
                          </p>
                          <div className="space-y-1 max-h-[140px] overflow-y-auto">
                            {r.created.map((c) => (
                              <p key={c.scheduleId} className="text-xs text-emerald-700">
                                {new Date(c.workDate).toLocaleDateString()} —{" "}
                                {shiftOptions.find((s) => s.value === c.shiftType)?.label ?? c.shiftType}
                                {" · "}{c.slotCount} {t("slots")}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.skipped.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-amber-700 mb-1.5">
                            {t("skippedCount", { count: r.skipped.length })}
                          </p>
                          <div className="space-y-1 max-h-[140px] overflow-y-auto">
                            {r.skipped.map((s, i) => (
                              <p key={i} className="text-xs text-amber-700">
                                {new Date(s.workDate).toLocaleDateString()} —{" "}
                                {shiftOptions.find((x) => x.value === s.shiftType)?.label ?? s.shiftType}
                                {" · "}{s.reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {r.created.length === 0 && r.skipped.length === 0 && (
                        <p className="text-xs text-slate-400">{t("noChanges")}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2.5 text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    {t("createAnother")}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition"
                  >
                    {t("close")}
                  </button>
                </div>
              </div>
            )}

            {!result && (
              <>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    {t("selectedDoctors", { count: selectedDoctors.length })}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctors.map((d) => (
                      <div
                        key={d.doctorId}
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-3 pr-1.5 py-1.5"
                      >
                        <span className="text-xs font-medium text-slate-700">
                          {d.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          · {roomName(selection.get(d.doctorId) ?? "")}
                        </span>
                        <button
                          onClick={() => removeDoctor(d.doctorId)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                          title={t("removeDoctor")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-600">
                      {t("selectDates", { count: selectedDates.size })}
                    </label>
                    <button
                      onClick={handleSelectAllMonth}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition
                        ${isAllMonthSelected 
                          ? "bg-[#00658d]/10 text-[#00658d] hover:bg-[#00658d]/20" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
                      `}
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      {isAllMonthSelected ? t("deselectAllMonth") : t("selectAllMonth")}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="font-semibold text-sm text-slate-800">
                        {t("month") || "Month"} {viewMonth + 1} / {viewYear}
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
                              ${isPast ? "text-slate-300 cursor-not-allowed" : "cursor-pointer hover:bg-[#00658d]/10"}
                              ${isSelected ? "text-white hover:opacity-90" : "text-slate-700"}
                              ${isToday && !isSelected ? "ring-2 ring-[#00658d]/40" : ""}
                            `}
                            style={isSelected ? { backgroundColor: "#00658D" } : undefined}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">
                    {t("selectShifts", { count: selectedShifts.size })}
                  </label>
                  {loadingShifts ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00658D" }} />
                      <span className="text-sm">{t("loadingShiftRanges")}</span>
                    </div>
                  ) : shiftOptions.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">
                      {t("noShiftsAvailable")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {shiftOptions.map((s) => {
                        const isSelected = selectedShifts.has(s.value);
                        return (
                          <button
                            key={s.value}
                            onClick={() => toggleShift(s.value)}
                            className={`
                              px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left
                              ${isSelected
                                ? "bg-[#00658d]/10 border-[#00658d] text-[#00658d] ring-1 ring-[#00658d]"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span>{s.label}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00658d] shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {totalCombinations > 0 && (
                  <div className="bg-[#00658d]/10 border border-[#00658d]/20 rounded-xl px-4 py-3 text-sm text-[#00658d] font-medium">
                    {t("willCreateSchedule", { 
                      count: totalCombinations,
                      doctorCount: selection.size,
                      dateCount: selectedDates.size,
                      shiftCount: selectedShifts.size
                    })}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || totalCombinations === 0}
                    className="px-5 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: "#00658D" }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {totalCombinations > 0 ? `${t("create")} ${totalCombinations}` : t("create")}
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
