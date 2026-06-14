"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, Mail, Star, Globe, Loader2,
  Stethoscope, Clock, DollarSign, ChevronLeft,
  Building2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// ── Helpers ──────────────────────────────────────────────

function StarRow({ value, count }: { value?: number; count?: number }) {
  if (!value) return null;
  return (
    <span className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="font-medium text-on-surface">{value.toFixed(1)}</span>
      {count != null && count > 0 && (
        <span className="text-outline text-sm">({count})</span>
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
              : "fill-surface-container text-outline"
          )}
        />
      ))}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-headline-md font-headline-md text-on-surface mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function ClinicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const clinicId = params.id as string;

  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "doctors" | "services" | "reviews"
  >("overview");

  const toggleLocale = () =>
    router.push(
      `/${locale === "vi" ? "en" : "vi"}/clinics/${clinicId}`
    );

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await fetch(`/api/clinics/${clinicId}`);
        console.log("status", res.status);
        const data = await res.json();
console.log("clinic response", data);

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

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not Found ──
  if (notFound || !clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-container-lowest">
        <Building2 className="w-16 h-16 text-outline/40" />
        <p className="text-on-surface-variant font-body-md">
          {locale === "vi" ? "Không tìm thấy phòng khám" : "Clinic not found"}
        </p>
        <Link
          href={`/${locale}/search/clinics`}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm"
        >
          {locale === "vi" ? "Quay lại tìm kiếm" : "Back to search"}
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: locale === "vi" ? "Tổng quan" : "Overview" },
    {
      key: "doctors",
      label:
        locale === "vi"
          ? `Bác sĩ (${clinic.doctors.length})`
          : `Doctors (${clinic.doctors.length})`,
    },
    {
      key: "services",
      label:
        locale === "vi"
          ? `Dịch vụ (${clinic.services.length})`
          : `Services (${clinic.services.length})`,
    },
    {
      key: "reviews",
      label:
        locale === "vi"
          ? `Đánh giá (${clinic.feedbacks.length})`
          : `Reviews (${clinic.feedbacks.length})`,
    },
  ] as const;

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
            {clinic.name}
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Hero card ── */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
          {/* Logo + basic info */}
          <div className="p-6 flex gap-5 items-start">
            <div className="w-20 h-20 rounded-xl bg-surface-container-high shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant">
              {clinic.logoUrl ? (
                <img
                  src={clinic.logoUrl}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {clinic.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-headline-lg text-on-surface font-bold mb-1">
                {clinic.name}
              </h1>

              {clinic.ratingAvg && (
                <div className="mb-2">
                  <StarRow value={clinic.ratingAvg} count={clinic.reviewCount} />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-outline" />
                  <span>{clinic.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Phone className="w-4 h-4 shrink-0 text-outline" />
                  <span>{clinic.phone}</span>
                </div>
                {clinic.email && (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Mail className="w-4 h-4 shrink-0 text-outline" />
                    <span>{clinic.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {clinic.description && (
            <div className="px-6 pb-6 border-t border-outline-variant pt-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {clinic.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-surface-container rounded-xl p-1 border border-outline-variant">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container rounded-xl border border-outline-variant p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {clinic.doctors.length}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {locale === "vi" ? "Bác sĩ" : "Doctors"}
                </p>
              </div>
              <div className="bg-surface-container rounded-xl border border-outline-variant p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {clinic.services.length}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {locale === "vi" ? "Dịch vụ" : "Services"}
                </p>
              </div>
              <div className="bg-surface-container rounded-xl border border-outline-variant p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {clinic.ratingAvg?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {locale === "vi" ? "Đánh giá" : "Rating"}
                </p>
              </div>
            </div>

            {/* Doctor preview */}
            {clinic.doctors.length > 0 && (
              <div className="bg-surface-container rounded-xl border border-outline-variant p-4">
                <SectionTitle>
                  <Stethoscope className="w-5 h-5 text-primary" />
                  {locale === "vi" ? "Bác sĩ nổi bật" : "Featured Doctors"}
                </SectionTitle>
                <div className="space-y-3">
                  {clinic.doctors.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container/30 shrink-0 overflow-hidden flex items-center justify-center">
                        {d.avatarUrl ? (
                          <img
                            src={d.avatarUrl}
                            alt={d.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {d.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {d.title ? `${d.title} ${d.fullName}` : d.fullName}
                        </p>
                        {d.specialty && (
                          <p className="text-xs text-primary truncate">
                            {d.specialty}
                          </p>
                        )}
                      </div>
                      {d.ratingAvg && (
                        <StarRow value={d.ratingAvg} />
                      )}
                    </div>
                  ))}
                </div>
                {clinic.doctors.length > 3 && (
                  <button
                    onClick={() => setActiveTab("doctors")}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    {locale === "vi"
                      ? `Xem tất cả ${clinic.doctors.length} bác sĩ →`
                      : `View all ${clinic.doctors.length} doctors →`}
                  </button>
                )}
              </div>
            )}

            {/* Service preview */}
            {clinic.services.length > 0 && (
              <div className="bg-surface-container rounded-xl border border-outline-variant p-4">
                <SectionTitle>
                  <DollarSign className="w-5 h-5 text-primary" />
                  {locale === "vi" ? "Dịch vụ" : "Services"}
                </SectionTitle>
                <div className="space-y-2">
                  {clinic.services.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {s.serviceName}
                        </p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {s.durationMinutes}{" "}
                          {locale === "vi" ? "phút" : "mins"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary shrink-0">
                        {s.price != null
                          ? new Intl.NumberFormat(
                              locale === "vi" ? "vi-VN" : "en-US",
                              {
                                style: "currency",
                                currency: locale === "vi" ? "VND" : "USD",
                                maximumFractionDigits: 0,
                              }
                            ).format(s.price)
                          : locale === "vi"
                          ? "Liên hệ"
                          : "Contact"}
                      </p>
                    </div>
                  ))}
                </div>
                {clinic.services.length > 4 && (
                  <button
                    onClick={() => setActiveTab("services")}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    {locale === "vi"
                      ? `Xem tất cả ${clinic.services.length} dịch vụ →`
                      : `View all ${clinic.services.length} services →`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Doctors ── */}
        {activeTab === "doctors" && (
          <div className="space-y-3">
            {clinic.doctors.length === 0 ? (
              <EmptyState
                icon={<Stethoscope className="w-10 h-10 text-outline/40" />}
                label={
                  locale === "vi" ? "Chưa có bác sĩ" : "No doctors yet"
                }
              />
            ) : (
              clinic.doctors.map((d) => (
                <div
                  key={d.id}
                  className="bg-surface-container rounded-xl border border-outline-variant p-4 flex gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-container/30 shrink-0 overflow-hidden flex items-center justify-center">
                    {d.avatarUrl ? (
                      <img
                        src={d.avatarUrl}
                        alt={d.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {d.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-on-surface">
                          {d.title ? `${d.title} ${d.fullName}` : d.fullName}
                        </p>
                        {d.specialty && (
                          <p className="text-sm text-primary">{d.specialty}</p>
                        )}
                      </div>
                      <StarRow value={d.ratingAvg} count={d.reviewCount} />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {d.experienceYears}{" "}
                      {locale === "vi" ? "năm kinh nghiệm" : "years exp."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab: Services ── */}
        {activeTab === "services" && (
          <div className="bg-surface-container rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
            {clinic.services.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="w-10 h-10 text-outline/40" />}
                label={
                  locale === "vi" ? "Chưa có dịch vụ" : "No services yet"
                }
              />
            ) : (
              clinic.services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-on-surface">
                      {s.serviceName}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {s.durationMinutes}{" "}
                      {locale === "vi" ? "phút" : "minutes"}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {s.price != null
                      ? new Intl.NumberFormat(
                          locale === "vi" ? "vi-VN" : "en-US",
                          {
                            style: "currency",
                            currency: locale === "vi" ? "VND" : "USD",
                            maximumFractionDigits: 0,
                          }
                        ).format(s.price)
                      : locale === "vi"
                      ? "Liên hệ"
                      : "Contact"}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab: Reviews ── */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            {clinic.feedbacks.length === 0 ? (
              <EmptyState
                icon={
                  <MessageSquare className="w-10 h-10 text-outline/40" />
                }
                label={
                  locale === "vi" ? "Chưa có đánh giá" : "No reviews yet"
                }
              />
            ) : (
              clinic.feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="bg-surface-container rounded-xl border border-outline-variant p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-on-surface text-sm">
                      {f.patientName}
                    </p>
                    <p className="text-xs text-outline">
                      {new Date(f.createdAt).toLocaleDateString(
                        locale === "vi" ? "vi-VN" : "en-US"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-4 mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Building2 className="w-3.5 h-3.5 text-outline" />
                      <StarStatic value={f.ratingClinic} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Stethoscope className="w-3.5 h-3.5 text-outline" />
                      <StarStatic value={f.ratingDoctor} />
                    </div>
                  </div>
                  {f.comment && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {f.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      {icon}
      <p className="text-on-surface-variant text-sm">{label}</p>
    </div>
  );
}