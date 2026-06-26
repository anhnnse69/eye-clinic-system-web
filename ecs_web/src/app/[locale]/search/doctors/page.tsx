"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Stethoscope, Star, Loader2, Building2, ChevronRight, ChevronDown, Award, Sparkles, HeartPulse, CalendarCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PAGE_SIZE = 4;
const INITIAL_COUNT = 12;

interface DoctorItem {
  id: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  specialty?: string;
  clinicName?: string;
  experienceYears: number;
  bio?: string;
  ratingAvg?: number;
  reviewCount?: number;
}

function StarRating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold text-amber-700">{value.toFixed(1)}</span>
    </span>
  );
}

function DoctorAvatar({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-white shrink-0"
      />
    );
  }
  const initials = name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm ring-2 ring-white shrink-0">
      <span className="text-xl font-bold text-white">{initials}</span>
    </div>
  );
}

export default function SearchDoctorsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [searchTab, setSearchTab] = useState<"clinics" | "doctors">("doctors");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isVI = locale === "vi";

  const fetchResults = useCallback(async (kw: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setVisibleCount(INITIAL_COUNT);
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(kw)}`);
      const data = await res.json();
      setDoctors(data?.data?.doctors ?? []);
    } catch {
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    router.replace(
      `/${locale}/search/${searchTab}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`
    );
    fetchResults(trimmed);
  };

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchQuery(q);
    fetchResults(q);
  }, [searchParams, fetchResults]);

  const visibleDoctors = doctors.slice(0, visibleCount);
  const hasMore = visibleCount < doctors.length;
  const remaining = doctors.length - visibleCount;

  // Khối Chuyên khoa - Tĩnh (Decor)
  const staticSpecialties = [
    { nameVi: "Khám mắt tổng quát", nameEn: "Comprehensive Eye Examination", icon: Sparkles, color: "text-teal-600 bg-teal-50" },
    { nameVi: "Nhãn khoa nhi", nameEn: "Pediatric Ophthalmology", icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
    { nameVi: "Điều trị đục thủy tinh thể", nameEn: "Cataract Treatment", icon: Stethoscope, color: "text-violet-600 bg-violet-50" },
  ];

  // Khối Quy trình các bước an tâm
  const steps = [
    { titleVi: "1. Chọn bác sĩ", titleEn: "1. Select Doctor", descVi: "Xem thông tin & kinh nghiệm", descEn: "View profile & experience" },
    { titleVi: "2. Đặt lịch nhanh", titleEn: "2. Book Appointment", descVi: "Chọn giờ khám chỉ trong 1 phút", descEn: "Choose time in 1 minute" },
    { titleVi: "3. Khám an toàn", titleEn: "3. Safe Consultation", descVi: "Được ưu tiên tại cơ sở y tế", descEn: "Get priority at clinic" }
  ];

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <div className="min-h-screen bg-[#F0F4FF] text-on-surface font-body-md flex flex-col">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          handleSearch={handleSearch}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">

          {/* Hàng số lượng kết quả tìm thấy */}
          {hasSearched && !isLoading && (searchQuery || doctors.length > 0) && (
            <p className="text-xs font-medium text-slate-500 mb-5 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                {doctors.length}
              </span>
              {searchQuery
                ? isVI ? `kết quả cho "${searchQuery}"` : `result(s) for "${searchQuery}"`
                : isVI ? "bác sĩ" : "doctor(s) available"}
            </p>
          )}

          {/* BỐ CỤC 2 CỘT CHÍNH */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* CỘT TRÁI: SIDEBAR TRANG TRÍ (Giữ y chang phòng khám) */}
            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24">

              {/* Khối 1: Danh sách dịch vụ mũi nhọn (Tĩnh - Decor) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-primary" />
                  {isVI ? "Dịch vụ chăm sóc mắt" : "Eye Care Services"}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {staticSpecialties.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-white"
                      >
                        <div className={cn("p-2 rounded-lg shrink-0 shadow-sm", item.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">
                            {isVI ? item.nameVi : item.nameEn}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isVI ? "Chuyên khoa đạt chuẩn" : "Certified Specialty"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Khối 2: Quy trình đặt lịch tinh tế */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  {isVI ? "Quy trình đặt hẹn" : "Booking Journey"}
                </h4>
                <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-700">
                          {isVI ? step.titleVi : step.titleEn}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isVI ? step.descVi : step.descEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Khối 3: Banner Cam kết Đáng tin cậy */}
              <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="bg-white/20 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="font-bold text-sm leading-snug mb-1">
                    {isVI ? "Đặt lịch an tâm 100%" : "100% Verified Doctors"}
                  </h5>
                  <p className="text-[11px] text-white/80 leading-relaxed">
                    {isVI 
                      ? "Mọi phòng khám đều được cấp phép bởi Bộ Y Tế và có đội ngũ bác sĩ xác thực." 
                      : "All medical facilities are fully licensed and certified by local authorities."}
                  </p>
                </div>
              </div>

            </aside>

            {/* CỘT PHẢI: KẾT QUẢ TÌM KIẾM BÁC SĨ (ĐỔI SANG THIẾT KẾ CARD DÀI) */}
            <div className="flex-1 w-full">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-400">{isVI ? "Đang tìm kiếm..." : "Searching..."}</p>
                </div>
              )}

              {!isLoading && hasSearched && doctors.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                    <Search className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-600">
                    {isVI ? "Không tìm thấy bác sĩ" : "No doctors found"}
                  </p>
                  <p className="text-xs text-slate-400 w-64 text-center leading-relaxed">
                    {isVI ? "Thử lại bằng một từ khóa hoặc tên chuyên khoa khác" : "Try searching with a different keyword or specialty"}
                  </p>
                </div>
              )}

              {!isLoading && doctors.length > 0 && (
                <>
                  {/* Sử dụng grid 1 cột trên màn hình nhỏ và tối đa 2 cột trên màn hình siêu rộng xl tương tự như bên danh sách phòng khám */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {visibleDoctors.map((doctor) => (
                      <Link
                        key={doctor.id}
                        href={`/${locale}/detail-doctor/${doctor.id}/slots`}
                        className={cn(
                          "group bg-white rounded-2xl border border-slate-200/80 p-5",
                          "hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
                          "transition-all duration-200 flex gap-4"
                        )}
                      >
                        {/* Bên Trái: Avatar bác sĩ */}
                        <DoctorAvatar url={doctor.avatarUrl} name={doctor.fullName} />

                        {/* Bên Phải: Toàn bộ thông tin kéo dài */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          
                          {/* Hàng Tiêu đề & Tên + Rating */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {doctor.title ? `${doctor.title} ${doctor.fullName}` : doctor.fullName}
                            </h3>
                            <StarRating value={doctor.ratingAvg} />
                          </div>

                          {/* Chuyên khoa */}
                          {doctor.specialty && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-xs text-primary font-medium truncate">{doctor.specialty}</span>
                            </div>
                          )}

                          {/* Bio/Mô tả ngắn gọn */}
                          {doctor.bio && (
                            <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed mt-1.5">
                              {doctor.bio}
                            </p>
                          )}

                          {/* Chi tiết Phòng khám & Kinh nghiệm */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                            {doctor.clinicName && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-xs text-slate-500 truncate max-w-[200px]">{doctor.clinicName}</span>
                              </div>
                            )}
                            <div className="text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">{doctor.experienceYears}</span>
                              {" "}{isVI ? "năm kinh nghiệm" : "yrs experience"}
                            </div>
                          </div>

                          {/* Footer Card: Số lượng đánh giá + Nút đặt lịch hành động */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                            {doctor.reviewCount != null && doctor.reviewCount > 0 ? (
                              <span className="text-xs text-slate-400">
                                {doctor.reviewCount} {isVI ? "đánh giá" : "reviews"}
                              </span>
                            ) : <span />}
                            
                            <div className="flex items-center gap-0.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              {isVI ? "Đặt lịch" : "Book"}
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>

                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-xl",
                          "bg-white border border-slate-200 text-sm font-semibold text-slate-600",
                          "hover:border-primary/40 hover:text-primary hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]",
                          "transition-all duration-200 active:scale-95"
                        )}
                      >
                        <ChevronDown className="w-4 h-4" />
                        {isVI
                          ? `Xem thêm ${Math.min(remaining, PAGE_SIZE)} bác sĩ`
                          : `Show ${Math.min(remaining, PAGE_SIZE)} more doctor${Math.min(remaining, PAGE_SIZE) > 1 ? "s" : ""}`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}