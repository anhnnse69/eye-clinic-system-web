"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Loader2, Calendar, Clock, 
  Building2, Stethoscope, ChevronRight, 
  MapPin, Award, CheckCircle2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const daysShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return { 
      dow: days[date.getDay()], 
      dowShort: daysShort[date.getDay()],
      day: date.getDate(), 
      month: date.getMonth() + 1,
      full: `Ngày ${date.getDate()} tháng ${date.getMonth() + 1}`
    };
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return { 
    dow: days[date.getDay()], 
    dowShort: days[date.getDay()].substring(0,3),
    day: date.getDate(), 
    month: months[date.getMonth()],
    full: `${months[date.getMonth()]} ${date.getDate()}`
  };
}

function shiftLabel(shift: string, locale: string) {
  const map: Record<string, { vi: string; en: string }> = {
    MORNING:   { vi: "Buổi Sáng", en: "Morning" },
    AFTERNOON: { vi: "Buổi Chiều", en: "Afternoon" },
    EVENING:   { vi: "Buổi Tối", en: "Evening" },
    FULL_DAY:  { vi: "Cả ngày", en: "Full Day" },
  };
  return map[shift]?.[locale as "vi" | "en"] ?? shift;
}

// ── Page ─────────────────────────────────────────────────
export default function DoctorSlotsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const doctorId = params.id as string;
  const isVI = locale === "vi";

  const [data, setData] = useState<DoctorSlotsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Header Search States (đồng bộ với layout mẫu)
  const [searchTab, setSearchTab] = useState<"clinics" | "doctors">("doctors");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    router.push(`/${locale}/search/${searchTab}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  };

  const handleContinueBooking = async () => {
    if (!selectedSlot) return;

    try {
      setIsCheckingAuth(true);
      const res = await fetch(`/api/booking-appointment`, { credentials: "include" });
      if (res.ok) {
        router.push(`/${locale}/book-appointment?doctorId=${data?.doctorId}&slotId=${selectedSlot}`);
        return;
      }

      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/book-appointment?doctorId=${data?.doctorId}&slotId=${selectedSlot}`)}`);
    } catch {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/book-appointment?doctorId=${data?.doctorId}&slotId=${selectedSlot}`)}`);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const groupedSchedules = useMemo(() => {
    if (!data?.scheduleDays) return {};
    return data.scheduleDays.reduce((acc, curr) => {
      if (!acc[curr.workDate]) acc[curr.workDate] = [];
      acc[curr.workDate].push(curr);
      return acc;
    }, {} as Record<string, DoctorScheduleDay[]>);
  }, [data]);

  const uniqueDates = Object.keys(groupedSchedules);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/doctors/${doctorId}/slots`);
        const json = await res.json();
        if (json?.data) {
          setData(json.data);
          if (json.data.scheduleDays?.length > 0) {
            const firstDate = json.data.scheduleDays[0].workDate;
            setSelectedDate(firstDate);
            setSelectedScheduleId(json.data.scheduleDays[0].scheduleId);
          }
        } else { setNotFound(true); }
      } catch { setNotFound(true); } finally { setIsLoading(false); }
    };
    fetch_();
  }, [doctorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex flex-col">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchTab={searchTab} setSearchTab={setSearchTab} handleSearch={handleSearch} />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
        <Footer />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex flex-col">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchTab={searchTab} setSearchTab={setSearchTab} handleSearch={handleSearch} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500 font-semibold">{isVI ? "Không tìm thấy bác sĩ" : "Doctor not found"}</p>
          <button onClick={() => router.back()} className="text-primary font-bold flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> {isVI ? "Quay lại" : "Go back"}</button>
        </div>
        <Footer />
      </div>
    );
  }

  const activeShiftsInDay = selectedDate ? groupedSchedules[selectedDate] : [];
  const activeShiftData = activeShiftsInDay.find(s => s.scheduleId === selectedScheduleId);
  const activeSlots = activeShiftData?.slots ?? [];

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-on-surface font-body-md flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchTab={searchTab}
        setSearchTab={setSearchTab}
        handleSearch={handleSearch}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 animate-fadeIn">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {isVI ? "Quay lại trang trước" : "Back to previous"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: Thông tin bác sĩ */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-200/80 p-6 shadow-sm sticky top-24">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 overflow-hidden ring-4 ring-white shadow-md">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} className="w-full h-full object-cover" alt={data.fullName} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                        {data.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-800">{data.fullName}</h1>
                  <p className="text-sm font-semibold text-primary">{data.specialty}</p>
                </div>

                <div className="w-full pt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{isVI ? "Phòng khám" : "Clinic"}</p>
                      <p className="text-xs font-bold text-slate-700">{data.clinicName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{isVI ? "Địa chỉ" : "Address"}</p>
                      <p className="text-xs font-medium text-slate-500 line-clamp-2">{data.clinicAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <Award className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{isVI ? "Kinh nghiệm" : "Experience"}</p>
                      <p className="text-xs font-bold text-slate-700">{data.experienceYears} {isVI ? "năm công tác" : "years"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT GIỮA/PHẢI: Chọn lịch */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-8">
              
              {/* BƯỚC 1: CHỌN NGÀY */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">{isVI ? "1. Chọn ngày khám" : "1. Select Date"}</h2>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                  {uniqueDates.map((date) => {
                    const fmt = formatDate(date, locale);
                    const isActive = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          const shifts = groupedSchedules[date];
                          setSelectedScheduleId(shifts[0].scheduleId);
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          "flex flex-col items-center shrink-0 min-w-[70px] py-4 rounded-2xl border transition-all",
                          isActive 
                            ? "bg-primary text-white border-primary shadow-[0_8px_20px_rgba(59,130,246,0.3)] scale-105" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-primary/50 hover:bg-slate-50"
                        )}
                      >
                        <span className={cn("text-[10px] font-bold uppercase mb-1", isActive ? "text-white/80" : "text-slate-400")}>{fmt.dowShort}</span>
                        <span className="text-xl font-black">{fmt.day}</span>
                        <span className={cn("text-[10px] font-bold", isActive ? "text-white/80" : "text-slate-400")}>T{fmt.month}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* BƯỚC 2: CHỌN CA */}
              {activeShiftsInDay.length > 0 && (
                <section className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-700">{isVI ? "2. Chọn buổi làm việc" : "2. Select Session"}</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {activeShiftsInDay.map((shift) => (
                      <button
                        key={shift.scheduleId}
                        onClick={() => {
                          setSelectedScheduleId(shift.scheduleId);
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          "py-3 px-6 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2",
                          selectedScheduleId === shift.scheduleId 
                            ? "bg-primary/5 border-primary text-primary shadow-sm" 
                            : "bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30"
                        )}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {shiftLabel(shift.shiftType, locale)}
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500">
                          {shift.slots.length} Slots
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* BƯỚC 3: CHỌN GIỜ (SLOTS) */}
              <section className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">{isVI ? "3. Giờ khám còn trống" : "3. Available Slots"}</h2>
                </div>
                
                {activeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {activeSlots.map(slot => (
                      <button
                        key={slot.slotId}
                        onClick={() => setSelectedSlot(slot.slotId === selectedSlot ? null : slot.slotId)}
                        className={cn(
                          "py-4 rounded-2xl border text-sm font-bold transition-all relative overflow-hidden group",
                          selectedSlot === slot.slotId 
                            ? "bg-primary text-white border-primary shadow-md" 
                            : "bg-white border-slate-100 text-slate-700 hover:border-primary/50"
                        )}
                      >
                        {formatTime(slot.startTime, locale)}
                        {selectedSlot === slot.slotId && (
                           <div className="absolute top-0 right-0 p-1">
                             <CheckCircle2 className="w-3 h-3 text-white" />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                    {isVI ? "Không có giờ khám nào cho buổi này." : "No slots available for this session."}
                  </div>
                )}
              </section>

              {/* TỔNG KẾT & ĐẶT LỊCH */}
              <div className="pt-6">
                <div className={cn(
                  "p-6 rounded-[24px] transition-all flex flex-col md:flex-row items-center justify-between gap-4",
                  selectedSlot ? "bg-primary/5 border border-primary/20" : "bg-slate-50 border border-slate-100"
                )}>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isVI ? "Lịch khám đã chọn" : "Your Selection"}</p>
                    <p className="text-sm font-bold text-slate-700">
                      {selectedSlot && selectedDate ? (
                        `${formatTime(activeSlots.find(s => s.slotId === selectedSlot)?.startTime || "", locale)} — ${formatDate(selectedDate, locale).full}`
                      ) : (
                        isVI ? "Vui lòng chọn thời gian" : "Please select time"
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handleContinueBooking}
                    disabled={!selectedSlot || isCheckingAuth}
                    className={cn(
                      "w-full md:w-auto px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                      selectedSlot && !isCheckingAuth
                        ? "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    {isCheckingAuth ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {isVI ? "ĐANG KIỂM TRA" : "CHECKING"}</>
                    ) : (
                      <>
                        {isVI ? "TIẾP TỤC ĐẶT LỊCH" : "CONTINUE BOOKING"}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}