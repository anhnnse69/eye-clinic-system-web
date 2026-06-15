"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Globe, Loader2, Star, Stethoscope,
  MapPin, Clock, Calendar, Users, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

interface DoctorTimeSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  currentPatients: number;
  remaining: number;
  status: string;
}

interface DoctorScheduleDay {
  scheduleId: string;
  workDate: string;
  shiftType: string;
  slots: DoctorTimeSlot[];
}

interface DoctorSlotsData {
  doctorId: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  specialty?: string;
  clinicName: string;
  clinicAddress: string;
  experienceYears: number;
  bio?: string;
  ratingAvg?: number;
  reviewCount?: number;
  scheduleDays: DoctorScheduleDay[];
}

// ── Helpers ──────────────────────────────────────────────

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(
    locale === "vi" ? "vi-VN" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );
}

function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  if (locale === "vi") {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      dow: days[date.getDay()],
      day: date.getDate(),
      month: date.getMonth() + 1,
    };
  }
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return {
    dow: days[date.getDay()],
    day: date.getDate(),
    month: months[date.getMonth()],
  };
}

function shiftLabel(shift: string, locale: string) {
  const map: Record<string, { vi: string; en: string }> = {
    MORNING:   { vi: "Buổi sáng", en: "Morning" },
    AFTERNOON: { vi: "Buổi chiều", en: "Afternoon" },
    EVENING:   { vi: "Buổi tối", en: "Evening" },
    FULL_DAY:  { vi: "Cả ngày", en: "Full Day" },
  };
  return map[shift]?.[locale as "vi" | "en"] ?? shift;
}

// ── Page ─────────────────────────────────────────────────

export default function DoctorSlotsPage() {
  const params  = useParams();
  const router  = useRouter();
  const locale  = params.locale as string;
  const doctorId = params.id as string;

  const [data, setData]           = useState<DoctorSlotsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [selectedDay, setSelectedDay]   = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const toggleLocale = () =>
    router.push(`/${locale === "vi" ? "en" : "vi"}/doctors/${doctorId}/slots`);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch(`/api/doctors/${doctorId}/slots`);
        const json = await res.json();
        if (json?.data) {
          setData(json.data);
          // Auto-select first available day
          if (json.data.scheduleDays?.length > 0) {
            setSelectedDay(json.data.scheduleDays[0].workDate);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetch_();
  }, [doctorId]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not Found ──
  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-container-lowest">
        <Stethoscope className="w-16 h-16 text-outline/40" />
        <p className="text-on-surface-variant">
          {locale === "vi" ? "Không tìm thấy bác sĩ" : "Doctor not found"}
        </p>
        <Link
          href={`/${locale}/search/doctors`}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm"
        >
          {locale === "vi" ? "Quay lại tìm kiếm" : "Back to search"}
        </Link>
      </div>
    );
  }

  const activeDayData = data.scheduleDays.find(
    (d) => d.workDate === selectedDay
  );

  const activeSlots = activeDayData?.slots ?? [];

  return (
    <main className="min-h-screen bg-surface-container-lowest">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {locale === "vi" ? "Quay lại" : "Back"}
          </button>

          <span className="font-headline-sm text-on-surface font-semibold truncate flex-1 text-center">
            {data.title ? `${data.title} ${data.fullName}` : data.fullName}
          </span>

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-sm transition-colors shrink-0"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{locale}</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── Doctor card ── */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary-container/30 shrink-0 overflow-hidden flex items-center justify-center">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {data.fullName.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-md text-on-surface font-bold">
              {data.title ? `${data.title} ${data.fullName}` : data.fullName}
            </h1>

            {data.specialty && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm text-primary font-medium">
                  {data.specialty}
                </span>
              </div>
            )}

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-outline" />
                <span className="truncate">{data.clinicName}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-outline" />
                <span className="line-clamp-1">{data.clinicAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              {data.ratingAvg && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-on-surface">
                    {data.ratingAvg.toFixed(1)}
                  </span>
                  {data.reviewCount != null && data.reviewCount > 0 && (
                    <span className="text-outline">({data.reviewCount})</span>
                  )}
                </span>
              )}
              <span className="text-xs text-on-surface-variant">
                {data.experienceYears}{" "}
                {locale === "vi" ? "năm kinh nghiệm" : "years exp."}
              </span>
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        {data.bio && (
          <div className="bg-surface-container rounded-xl border border-outline-variant px-5 py-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {data.bio}
            </p>
          </div>
        )}

        {/* ── No slots available ── */}
        {data.scheduleDays.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 bg-surface-container rounded-2xl border border-outline-variant">
            <Calendar className="w-12 h-12 text-outline/40" />
            <p className="text-on-surface-variant text-sm">
              {locale === "vi"
                ? "Hiện chưa có lịch khám trống trong 30 ngày tới"
                : "No available slots in the next 30 days"}
            </p>
          </div>
        ) : (
          <>
            {/* ── Date picker ── */}
            <div>
              <h2 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {locale === "vi" ? "Chọn ngày" : "Select Date"}
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {data.scheduleDays.map((day) => {
                  const fmt = formatDate(day.workDate, locale);
                  const isActive = selectedDay === day.workDate;
                  return (
                    <button
                      key={day.workDate}
                      onClick={() => {
                        setSelectedDay(day.workDate);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        "flex flex-col items-center shrink-0 w-14 py-2.5 rounded-xl border transition-all",
                        isActive
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface-container border-outline-variant text-on-surface hover:border-primary"
                      )}
                    >
                      <span className="text-[10px] font-medium uppercase opacity-80">
                        {fmt.dow}
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {fmt.day}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {typeof fmt.month === "number"
                          ? `T${fmt.month}`
                          : fmt.month}
                      </span>
                      <span
                        className={cn(
                          "mt-1 text-[9px] px-1.5 py-0.5 rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {day.slots.length}{" "}
                        {locale === "vi" ? "slot" : "slots"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Shift label + Slots ── */}
            {activeDayData && (
              <div>
                <h2 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {shiftLabel(activeDayData.shiftType, locale)}
                  <span className="text-outline font-normal">
                    — {activeSlots.length}{" "}
                    {locale === "vi" ? "slot trống" : "available"}
                  </span>
                </h2>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {activeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.slotId;
                    return (
                      <button
                        key={slot.slotId}
                        onClick={() =>
                          setSelectedSlot(
                            isSelected ? null : slot.slotId
                          )
                        }
                        className={cn(
                          "flex flex-col items-center py-3 rounded-xl border text-sm transition-all",
                          isSelected
                            ? "bg-primary text-on-primary border-primary shadow-sm"
                            : "bg-surface-container border-outline-variant text-on-surface hover:border-primary"
                        )}
                      >
                        <span className="font-semibold">
                          {formatTime(slot.startTime, locale)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] mt-0.5",
                            isSelected
                              ? "text-white/70"
                              : "text-on-surface-variant"
                          )}
                        >
                          {formatTime(slot.endTime, locale)}
                        </span>
                        <span
                          className={cn(
                            "mt-1.5 flex items-center gap-0.5 text-[10px]",
                            isSelected ? "text-white/80" : "text-outline"
                          )}
                        >
                          <Users className="w-2.5 h-2.5" />
                          {slot.remaining}/{slot.maxPatients}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Book button ── */}
            <div className="pt-2">
              <button
                disabled={!selectedSlot}
                onClick={() => {
                  if (!selectedSlot) return;
                  router.push(
                    `/${locale}/appointments/book?doctorId=${data.doctorId}&slotId=${selectedSlot}`
                  );
                }}
                className={cn(
                  "w-full py-3.5 rounded-xl font-label-lg text-label-lg transition-all flex items-center justify-center gap-2",
                  selectedSlot
                    ? "bg-primary text-on-primary hover:opacity-90 shadow-md"
                    : "bg-surface-container text-outline border border-outline-variant cursor-not-allowed"
                )}
              >
                <Calendar className="w-5 h-5" />
                {selectedSlot
                  ? locale === "vi"
                    ? "Đặt lịch khám"
                    : "Book Appointment"
                  : locale === "vi"
                  ? "Chọn giờ khám để tiếp tục"
                  : "Select a time slot to continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}