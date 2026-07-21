"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2, RefreshCw, DoorOpen, User, Phone,
  CheckCircle2, Ban, ChevronLeft, ChevronRight, CalendarDays,
} from "lucide-react";

import {
  doctorScheduleService,
  type ScheduleShiftItem,
  type ScheduleSlotItem,
} from "@/services/doctor.schedule.service";
import { ShiftType, SlotStatus } from "@/types";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const PX_PER_HOUR = 88;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;

const SHIFT_BANDS: { shift: ShiftType; from: number; to: number; tint: string }[] = [
  { shift: ShiftType.MORNING, from: 8, to: 12, tint: "bg-amber-50/40" },
  { shift: ShiftType.AFTERNOON, from: 12, to: 17, tint: "bg-sky-50/40" },
  { shift: ShiftType.EVENING, from: 17, to: 20, tint: "bg-indigo-50/40" },
];

const WEEKDAY_LABEL = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

function toLocalDateString(d: Date) {
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().split("T")[0];
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function timeToHourFloat(iso: string) {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function formatHourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

type PositionedSlot = {
  slot: ScheduleSlotItem;
  shift: ScheduleShiftItem;
};

export default function DoctorPersonalScheduleClient({
  doctorId,
}: {
  doctorId: string;
}) {
  const t = useTranslations("doctor")
  const tSchedule = useTranslations("doctor.schedule")
  const tPersonal = useTranslations("doctor.personalSchedule")

  const todayStr = toLocalDateString(new Date());

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [shiftsByDate, setShiftsByDate] = useState<Record<string, ScheduleShiftItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchWeek = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStrings = weekDays.map(toLocalDateString);
      const results = await Promise.all(
        dateStrings.map((d) =>
          doctorScheduleService
            .getPersonalSchedule(doctorId, { workDate: d })
            .then((res) => res.data?.shifts ?? [])
            .catch(() => [] as ScheduleShiftItem[])
        )
      );
      const next: Record<string, ScheduleShiftItem[]> = {};
      dateStrings.forEach((d, i) => { next[d] = results[i]; });
      setShiftsByDate(next);
    } catch {
      setError(tPersonal("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [doctorId, weekDays, tPersonal]);

  useEffect(() => { fetchWeek(); }, [fetchWeek]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const h = Math.min(Math.max(now.getHours(), DAY_START_HOUR), DAY_END_HOUR);
    const offset = (h - DAY_START_HOUR) * PX_PER_HOUR;
    scrollRef.current.scrollTop = Math.max(offset - PX_PER_HOUR, 0);
  }, []);

  const slotsForDate = (dateStr: string): PositionedSlot[] => {
    const shifts = shiftsByDate[dateStr] ?? [];
    const out: PositionedSlot[] = [];
    for (const shift of shifts)
      for (const slot of shift.slots)
        out.push({ slot, shift });
    return out;
  };

  const weekLabel = `${weekDays[0].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} – ${weekDays[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{tSchedule("personalSchedule")}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{tPersonal("subtitle")}</p>
      </div>

      {/* Week nav bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title={tPersonal("previousWeek")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {tPersonal("thisWeek")}
          </button>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title={tPersonal("nextWeek")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-sm font-bold text-slate-700">{weekLabel}</span>
        </div>

        <button
          onClick={fetchWeek}
          disabled={loading}
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all active:scale-95 h-[38px]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? tPersonal("reloading") : tPersonal("reload")}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-50 border border-green-300" /><span>{tPersonal("legend.available")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 border border-amber-300" /><span>{tPersonal("legend.fullyBooked")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" /><span>{tPersonal("legend.locked")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50/70 border border-amber-100" /><span>{tPersonal("legend.morningShiftBand")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-sky-50/70 border border-sky-100" /><span>{tPersonal("legend.afternoonShiftBand")}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-50/70 border border-indigo-100" /><span>{tPersonal("legend.eveningShiftBand")}</span></div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header ngày */}
        <div className="flex border-b border-slate-200 bg-slate-50/80">
          <div className="w-16 shrink-0 border-r border-slate-200" />
          {weekDays.map((d) => {
            const dStr = toLocalDateString(d);
            const isToday = dStr === todayStr;
            return (
              <div
                key={dStr}
                className={`flex-1 min-w-[150px] text-center py-3 border-r border-slate-200 last:border-r-0 ${isToday ? "bg-blue-50" : ""}`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-wide ${isToday ? "text-blue-600" : "text-slate-400"}`}>
                  {WEEKDAY_LABEL[d.getDay()]}
                </p>
                <p className={`text-lg font-bold ${isToday ? "text-blue-700" : "text-slate-700"}`}>
                  {d.getDate()}/{d.getMonth() + 1}
                </p>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div ref={scrollRef} className="relative overflow-y-auto" style={{ maxHeight: 640 }}>
          {loading && (
            <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center">
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-slate-500">{tPersonal("loadingWeek")}</p>
            </div>
          )}

          <div className="flex" style={{ height: GRID_HEIGHT }}>
            {/* Cột giờ */}
            <div className="w-16 shrink-0 border-r border-slate-200 relative bg-white">
              {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i).map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 text-right pr-2 text-[10px] font-semibold text-slate-400 -translate-y-1/2"
                  style={{ top: (h - DAY_START_HOUR) * PX_PER_HOUR }}
                >
                  {formatHourLabel(h)}
                </div>
              ))}
            </div>

            {/* Cột mỗi ngày */}
            {weekDays.map((d) => {
              const dStr = toLocalDateString(d);
              const isToday = dStr === todayStr;
              const isPastDate = dStr < todayStr;
              const positioned = slotsForDate(dStr);

              return (
                <div
                  key={dStr}
                  className={`flex-1 min-w-[150px] relative border-r border-slate-200 last:border-r-0 ${isToday ? "bg-blue-50/30" : ""}`}
                >
                  {/* Dải nền theo ca */}
                  {SHIFT_BANDS.map((band) => (
                    <div
                      key={band.shift}
                      className={`absolute left-0 right-0 ${band.tint} border-b border-dashed border-slate-200/70`}
                      style={{
                        top: (band.from - DAY_START_HOUR) * PX_PER_HOUR,
                        height: (band.to - band.from) * PX_PER_HOUR,
                      }}
                    />
                  ))}

                  {/* Lưới mốc giờ */}
                  {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i).map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-slate-100"
                      style={{ top: (h - DAY_START_HOUR) * PX_PER_HOUR }}
                    />
                  ))}

                  {positioned.length === 0 && (
                    <div className="absolute inset-x-2 top-2 text-center text-[11px] text-slate-300 font-medium">
                      {tPersonal("noSchedule")}
                    </div>
                  )}

                  {positioned.map(({ slot, shift }) => {
                    const startH = timeToHourFloat(slot.startTime);
                    const endH = timeToHourFloat(slot.endTime);
                    const top = (startH - DAY_START_HOUR) * PX_PER_HOUR;
                    const height = Math.max((endH - startH) * PX_PER_HOUR - 2, 24);

                    const diffInMinutes = (Date.now() - new Date(slot.startTime).getTime()) / (1000 * 60);
                    const isExpired = slot.status === SlotStatus.AVAILABLE && (isPastDate || diffInMinutes >= 30);
                    const effectiveStatus = isExpired ? SlotStatus.BLOCKED : slot.status;

                    return (
                      <div
                        key={slot.slotId}
                        className="absolute left-1 right-1 z-10"
                        style={{ top, height }}
                      >
                        <SlotBlock
                          slot={slot}
                          shift={shift}
                          effectiveStatus={effectiveStatus}
                          tPersonal={tPersonal}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slot Block (view only) ────────────────────────────────────

function SlotBlock({
  slot,
  shift,
  effectiveStatus,
  tPersonal,
}: {
  slot: ScheduleSlotItem;
  shift: ScheduleShiftItem;
  effectiveStatus: SlotStatus;
  tPersonal: ReturnType<typeof useTranslations<string>>;
}) {
  const roomBadge = (
    <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium truncate">
      <DoorOpen className="h-2.5 w-2.5 shrink-0" />
      {shift.roomName || tPersonal("slot.unassignedRoom")}
    </span>
  );

  if (effectiveStatus === SlotStatus.BLOCKED) {
    return (
      <div className="w-full h-full rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center overflow-hidden px-1">
        <Ban className="h-3 w-3 text-rose-400" />
        <span className="text-[9px] font-bold text-rose-500">{tPersonal("slot.locked")}</span>
      </div>
    );
  }

  if (effectiveStatus === SlotStatus.BOOKED) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-50 border border-amber-200 flex flex-col gap-0.5 px-1.5 py-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-amber-700">{tPersonal("slot.full")}</span>
          <span className="text-[8px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1 rounded">
            {slot.currentPatients}/{slot.maxPatients}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {slot.appointments.map((a) => (
            <div
              key={a.appointmentId}
              title={a.symptoms || ""}
              className="bg-white/80 border border-amber-100 rounded px-1 py-0.5"
            >
              <p className="font-semibold text-slate-800 truncate flex items-center gap-1 text-[9px]">
                <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                {a.patientName}
              </p>
              {a.patientPhone && (
                <p className="text-[8px] text-slate-500 flex items-center gap-1 truncate">
                  <Phone className="w-2.5 h-2.5 shrink-0" />
                  {a.patientPhone}
                </p>
              )}
            </div>
          ))}
        </div>
        {roomBadge}
      </div>
    );
  }

  // AVAILABLE
  return (
    <div className="w-full h-full rounded-lg bg-green-50 border border-green-200 flex flex-col items-center justify-center gap-0.5 overflow-hidden px-1">
      <div className="flex items-center gap-1 font-bold text-green-700 text-[10px]">
        <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
        <span>{tPersonal("slot.available")}</span>
      </div>
      <span className="text-[8px] font-extrabold text-green-600 bg-white border border-green-100 px-1 rounded">
        {slot.currentPatients}/{slot.maxPatients} {tPersonal("slot.patients")}
      </span>
      {roomBadge}
    </div>
  );
}
