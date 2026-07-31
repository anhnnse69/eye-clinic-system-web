"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, Mail, Star, Globe, Loader2,
  Stethoscope, Clock, DollarSign, ChevronLeft,
  Building2, MessageSquare, ChevronRight, ShieldCheck,
  CalendarDays, ArrowRight, Sparkles, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ── Types ────────────────────────────────────────────────

interface ClinicDoctorItem {
  id: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  specialty?: string;
  experienceYears: number;
  ratingAvg?: number;
  reviewCount?: number;
}

interface ClinicServiceItem {
  id: string;
  serviceName: string;
  price?: number;
  durationMinutes: number;
}

interface ClinicFeedbackItem {
  id: string;
  patientName: string;
  ratingDoctor: number;
  ratingClinic: number;
  comment?: string;
  createdAt: string;
}

interface ClinicProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  description?: string;
  ratingAvg?: number;
  reviewCount?: number;
  doctors: ClinicDoctorItem[];
  services: ClinicServiceItem[];
  feedbacks: ClinicFeedbackItem[];
}

interface FeedbacksResponse {
  ratingAvg?: number;
  reviewCount?: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  feedbacks: ClinicFeedbackItem[];
}

// ── Helpers & Inner Components ───────────────────────────

function StarRating({ value, count }: { value?: number; count?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-bold text-amber-700">{value.toFixed(1)}</span>
      {count != null && count > 0 && (
        <span className="text-[10px] text-amber-600 font-medium ml-0.5">({count})</span>
      )}
    </span>
  );
}

function StarStatic({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-300"
          )}
        />
      ))}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-slate-200/80">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 text-slate-400">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function ClinicLogo({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-sm ring-4 ring-white shrink-0"
      />
    );
  }
  return (
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md ring-4 ring-white shrink-0">
      <span className="text-3xl font-extrabold text-white">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────

export default function ClinicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const clinicId = params.id as string;
  const isVI = locale === "vi";

  // State hỗ trợ Header Search để đồng bộ chính xác với format mẫu
  const [searchTab, setSearchTab] = useState<"clinics" | "doctors">("clinics");
  const [searchQuery, setSearchQuery] = useState("");

  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "doctors" | "services" | "reviews">("overview");

  // Feedback states
  const [feedbacksData, setFeedbacksData] = useState<FeedbacksResponse | null>(null);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const FEEDBACK_PAGE_SIZE = 5;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    router.push(
      `/${locale}/search/${searchTab}${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`
    );
  };

  // Fetch feedbacks khi activeTab chuyển sang reviews hoặc đổi trang feedback
  useEffect(() => {
    if (activeTab !== "reviews") return;

    const fetchFeedbacks = async () => {
      setFeedbacksLoading(true);
      try {
        const res = await fetch(
          `/api/clinics/${clinicId}/feedbacks?pageNumber=${feedbackPage}&pageSize=${FEEDBACK_PAGE_SIZE}`
        );
        const data = await res.json();
        if (data?.data) {
          setFeedbacksData(data.data);
        }
      } catch {
        // ignore, keep previous state
      } finally {
        setFeedbacksLoading(false);
      }
    };

    fetchFeedbacks();
  }, [activeTab, clinicId, feedbackPage]);

  // Fetch clinic profile
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await fetch(`/api/clinics/${clinicId}`);
        const data = await res.json();
        if (data?.data) {
          setClinic(data.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClinic();
  }, [clinicId]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] text-on-surface font-body-md flex flex-col">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          handleSearch={handleSearch}
        />
        <main className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-slate-400">{isVI ? "Đang tải thông tin..." : "Loading details..."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Found State
  if (notFound || !clinic) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] text-on-surface font-body-md flex flex-col">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          handleSearch={handleSearch}
        />
        <main className="flex-1 flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Building2 className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600">
            {isVI ? "Không tìm thấy phòng khám" : "Clinic not found"}
          </p>
          <Link
            href={`/${locale}/search/clinics`}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            {isVI ? "Quay lại tìm kiếm" : "Back to search"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: isVI ? "Tổng quan" : "Overview" },
    {
      key: "doctors",
      label: isVI ? `Bác sĩ (${clinic.doctors.length})` : `Doctors (${clinic.doctors.length})`,
    },
    {
      key: "services",
      label: isVI ? `Dịch vụ (${clinic.services.length})` : `Services (${clinic.services.length})`,
    },
    {
      key: "reviews",
      label: isVI ? `Đánh giá (${clinic.feedbacks.length})` : `Reviews (${clinic.feedbacks.length})`,
    },
  ] as const;

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <div className="min-h-screen bg-[#F0F4FF] text-on-surface font-body-md flex flex-col animate-fadeIn">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          handleSearch={handleSearch}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

          {/* Breadcrumb quay lại */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {isVI ? "Quay lại danh sách" : "Back to list"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CỘT TRÁI & GIỮA: Thông tin chính */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. Profile Hero Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />

                <ClinicLogo url={clinic.logoUrl} name={clinic.name} />

                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                      {clinic.name}
                    </h1>
                    <StarRating value={clinic.ratingAvg} count={clinic.reviewCount} />
                  </div>

                  {clinic.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {clinic.description}
                    </p>
                  )}

                  <hr className="border-slate-100" />

                  {/* Chi tiết liên hệ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-500 line-clamp-2">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs text-slate-500">{clinic.phone}</span>
                    </div>
                    {clinic.email && (
                      <div className="flex items-center gap-2 md:col-span-2">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{clinic.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Custom Tabs Navigator */}
              <div className="flex gap-1.5 p-1 bg-white/60 backdrop-blur rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setFeedbackPage(1); // reset page feedback khi đổi tab
                    }}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      activeTab === tab.key
                        ? "bg-primary text-white shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
                        : "text-slate-500 hover:text-primary hover:bg-white/80"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 3. Chi tiết nội dung các Tabs */}
              <div className="space-y-6">

                {/* ── Tab: Overview ── */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-fadeIn">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center hover:shadow-sm transition-shadow">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-2">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">{clinic.doctors.length}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {isVI ? "Bác sĩ" : "Doctors"}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center hover:shadow-sm transition-shadow">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-2">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">{clinic.services.length}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {isVI ? "Dịch vụ" : "Services"}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center hover:shadow-sm transition-shadow">
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2">
                          <Star className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">
                          {clinic.ratingAvg ? clinic.ratingAvg.toFixed(1) : "—"}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {isVI ? "Đánh giá" : "Rating"}
                        </p>
                      </div>
                    </div>

                    {/* Giới thiệu chi tiết */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
                      <SectionTitle>
                        <Building2 className="w-4 h-4 text-primary" />
                        {isVI ? "Giới thiệu chung" : "Overview"}
                      </SectionTitle>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                        {clinic.description || (isVI ? "Chưa có bài giới thiệu chi tiết cho phòng khám này." : "No description available.")}
                      </p>
                    </div>

                    {/* Bản xem trước Bác Sĩ nổi bật */}
                    {clinic.doctors.length > 0 && (
                      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <SectionTitle>
                            <Stethoscope className="w-4 h-4 text-primary" />
                            {isVI ? "Đội ngũ bác sĩ" : "Medical Team"}
                          </SectionTitle>
                          {clinic.doctors.length > 3 && (
                            <button
                              onClick={() => setActiveTab("doctors")}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                            >
                              {isVI ? "Xem tất cả" : "See all"} <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {clinic.doctors.slice(0, 3).map((doc) => (
                            <Link
                              key={doc.id}
                              href={`/${locale}/detail-doctor/${doc.id}/slots`}
                              className="group p-3 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all flex flex-col items-center text-center bg-slate-50/50"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden mb-2 ring-2 ring-white">
                                {doc.avatarUrl ? (
                                  <img src={doc.avatarUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                                    {doc.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary transition-colors">
                                {doc.title ? `${doc.title} ${doc.fullName}` : doc.fullName}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate w-full">{doc.specialty}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab: Doctors ── */}
                {activeTab === "doctors" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                    {clinic.doctors.length === 0 ? (
                      <div className="col-span-2">
                        <EmptyState
                          icon={<Stethoscope className="w-6 h-6" />}
                          label={isVI ? "Chưa cập nhật danh sách bác sĩ" : "No doctors listed yet"}
                        />
                      </div>
                    ) : (
                      clinic.doctors.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/${locale}/detail-doctor/${doc.id}/slots`}
                          className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-primary/40 hover:shadow-md transition-all flex gap-3 items-start"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden ring-2 ring-white shrink-0">
                            {doc.avatarUrl ? (
                              <img src={doc.avatarUrl} alt={doc.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                {doc.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                              {doc.title ? `${doc.title} ${doc.fullName}` : doc.fullName}
                            </h3>
                            <p className="text-[10px] text-primary font-semibold">{doc.specialty}</p>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3 shrink-0" />
                                {doc.experienceYears} {isVI ? "năm kinh nghiệm" : "years exp."}
                              </span>
                              {doc.ratingAvg && <StarRating value={doc.ratingAvg} count={doc.reviewCount} />}
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-300 self-center group-hover:text-primary transition-colors" />
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {/* ── Tab: Services ── */}
                {activeTab === "services" && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden animate-fadeIn">
                    {clinic.services.length === 0 ? (
                      <EmptyState
                        icon={<DollarSign className="w-6 h-6" />}
                        label={isVI ? "Chưa cập nhật danh mục dịch vụ" : "No services listed yet"}
                      />
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {clinic.services.map((sv) => (
                          <div key={sv.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="space-y-1 min-w-0 pr-4">
                              <p className="text-xs font-bold text-slate-800 truncate">{sv.serviceName}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" /> {sv.durationMinutes} {isVI ? "phút" : "minutes"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-xs font-bold text-primary">
                                {sv.price != null ? (
                                  new Intl.NumberFormat(
                                    isVI ? "vi-VN" : "en-US",
                                    {
                                      style: "currency",
                                      currency: isVI ? "VND" : "USD",
                                      maximumFractionDigits: 0,
                                    }
                                  ).format(sv.price)
                                ) : (
                                  isVI ? "Liên hệ" : "Contact"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab: Reviews ── */}
                {activeTab === "reviews" && (
                  <div className="space-y-4 animate-fadeIn">

                    {/* Tóm tắt điểm số */}
                    {clinic.ratingAvg && (
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4">
                        <div className="text-center shrink-0 pr-4 border-r border-slate-100">
                          <p className="text-3xl font-extrabold text-slate-800">{clinic.ratingAvg.toFixed(1)}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{isVI ? "Trên 5 sao" : "Out of 5"}</p>
                        </div>
                        <div>
                          <StarStatic value={Math.round(clinic.ratingAvg)} />
                          <p className="text-[11px] text-slate-400 mt-1">
                            {isVI
                              ? `Tổng cộng ${clinic.reviewCount ?? 0} lượt đánh giá thực tế từ người bệnh`
                              : `Based on ${clinic.reviewCount ?? 0} authentic patient reviews`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Danh sách Feedback phân trang */}
                    {feedbacksLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : !feedbacksData || feedbacksData.feedbacks.length === 0 ? (
                      <EmptyState
                        icon={<MessageSquare className="w-6 h-6" />}
                        label={isVI ? "Chưa có lượt đánh giá nào" : "No reviews yet"}
                      />
                    ) : (
                      <div className="space-y-3">
                        {feedbacksData.feedbacks.map((fb) => (
                          <div key={fb.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{fb.patientName}</p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(fb.createdAt).toLocaleDateString(isVI ? "vi-VN" : "en-US")}
                                </p>
                              </div>
                              <StarStatic value={fb.ratingClinic} />
                            </div>
                            {fb.comment && (
                              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                                "{fb.comment}"
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Phân trang feedback */}
                        {feedbacksData.totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 pt-2">
                            <button
                              onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                              disabled={feedbackPage === 1}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 text-slate-600 hover:text-primary transition-colors text-xs"
                            >
                              {isVI ? "Trước" : "Prev"}
                            </button>
                            <span className="text-xs text-slate-400 font-medium">
                              {feedbackPage} / {feedbacksData.totalPages}
                            </span>
                            <button
                              onClick={() => setFeedbackPage((p) => Math.min(feedbacksData.totalPages, p + 1))}
                              disabled={feedbackPage === feedbacksData.totalPages}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 text-slate-600 hover:text-primary transition-colors text-xs"
                            >
                              {isVI ? "Sau" : "Next"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* CỘT PHẢI: Card CTA / Đặt lịch trực tuyến */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                {/* Booking CTA card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {isVI ? "Đặt lịch trực tuyến" : "Book online"}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {isVI ? "Nhanh chóng, an toàn & bảo mật" : "Fast, safe & secured"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isVI
                      ? "Chọn trước dịch vụ và bác sĩ phù hợp với nhu cầu để giảm thời gian chờ đợi tại phòng khám."
                      : "Pre-select services and preferred doctors to reduce waiting time at the clinic."}
                  </p>

                  <div className="space-y-2.5">
                    <Link
                      href={`/${locale}/book-by-clinic?clinicId=${clinic.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-2xl font-bold shadow-[0_4px_16px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.35)] transition-all transform active:scale-95 text-xs text-center"
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      {isVI ? "ĐẶT LỊCH HẸN NGAY" : "BOOK BY CLINIC"}
                    </Link>

                    <Link
                      href={`/${locale}/book-appointment?clinicId=${clinic.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-2xl font-bold transition-all transform active:scale-95 text-xs text-center"
                    >
                      <User className="w-4 h-4 shrink-0" />
                      {isVI ? "ĐẶT LỊCH THEO BÁC SĨ" : "BOOK BY DOCTOR"}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-[9px] text-slate-400 bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100">
                      <span className="block font-semibold text-primary text-[10px]"> Nhanh chóng</span>
                      {isVI ? "Tự động phân công bác sĩ phù hợp" : "Auto-assign best doctor"}
                    </div>
                    <div className="text-[9px] text-slate-400 bg-slate-50/80 rounded-xl p-2 text-center border border-slate-100">
                      <span className="block font-semibold text-primary text-[10px]"> Chính xác</span>
                      {isVI ? "Chọn đúng bác sĩ bạn muốn" : "Pick your preferred doctor"}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Hot Support Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        {isVI ? "Chính sách tin cậy" : "Trust & Guarantee"}
                      </span>
                    </div>
                    <ul className="text-[10px] text-slate-400 space-y-1 pl-2 list-disc">
                      <li>{isVI ? "Không phụ thu phí dịch vụ đặt hẹn" : "No hidden booking fees"}</li>
                      <li>{isVI ? "Nhắc lịch khám tự động qua SMS/Email" : "Auto reminder via Email/SMS"}</li>
                    </ul>
                  </div>
                </div>

                {/* Phụ trợ liên hệ khẩn cấp */}
                <div className="bg-slate-900 rounded-3xl p-5 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                      {isVI ? "Cần hỗ trợ?" : "Need Help?"}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {isVI ? "Yêu cầu gọi lại tư vấn" : "Request a callbacks"}
                    </p>
                  </div>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}