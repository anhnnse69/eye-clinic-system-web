"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, MapPin, Phone, Star, Loader2, ChevronRight, ChevronDown, Award, Sparkles, HeartPulse, Stethoscope, CalendarCheck, ShieldAlert, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PAGE_SIZE = 4;
const INITIAL_COUNT = 12;

interface ClinicItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  description?: string;
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

function ClinicLogo({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-white shrink-0"
      />
    );
  }
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm ring-2 ring-white shrink-0">
      <span className="text-xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export default function SearchClinicsPage() {
  const t = useTranslations("search");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [searchTab, setSearchTab] = useState<"clinics" | "doctors">("clinics");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async (kw: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setVisibleCount(INITIAL_COUNT);
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(kw)}`);
      const data = await res.json();
      setClinics(data?.data?.clinics ?? []);
    } catch {
      setClinics([]);
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

  const visibleClinics = clinics.slice(0, visibleCount);
  const hasMore = visibleCount < clinics.length;
  const remaining = clinics.length - visibleCount;

  const staticSpecialties = [
    { nameKey: "specialties.comprehensive", icon: Sparkles, color: "text-teal-600 bg-teal-50" },
    { nameKey: "specialties.pediatric", icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
    { nameKey: "specialties.cataract", icon: Stethoscope, color: "text-violet-600 bg-violet-50" },
  ];

  const steps = [
    { titleKey: "steps.step1ClinicTitle", descKey: "steps.step1ClinicDesc" },
    { titleKey: "steps.step2Title", descKey: "steps.step2Desc" },
    { titleKey: "steps.step3Title", descKey: "steps.step3Desc" }
  ];

  const isSearchEmpty = clinics.length === 0 && !!searchQuery;

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

          {hasSearched && !isLoading && (searchQuery || clinics.length > 0) && (
            <p className="text-xs font-medium text-slate-500 mb-5 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                {clinics.length}
              </span>
              {searchQuery
                ? t("clinicResults", { count: clinics.length, query: searchQuery })
                : t("clinicCount", { count: clinics.length })}
            </p>
          )}

          <div className="flex flex-col lg:flex-row gap-6 items-start">

            <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24">

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-primary" />
                  {t("eyeServices")}
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
                            {t(item.nameKey)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {t("certifiedCenter")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  {t("bookingJourney")}
                </h4>
                <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-700">
                          {t(step.titleKey)}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t(step.descKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="bg-white/20 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="font-bold text-sm leading-snug mb-1">
                    {t("trustTitle")}
                  </h5>
                  <p className="text-[11px] text-white/80 leading-relaxed">
                    {t("trustDesc")}
                  </p>
                </div>
              </div>

            </aside>

            <div className="flex-1 w-full">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-slate-400">{t("searching")}</p>
                </div>
              )}

              {!isLoading && hasSearched && clinics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                    {isSearchEmpty ? (
                      <Search className="w-7 h-7 text-slate-300" />
                    ) : (
                      <ShieldAlert className="w-7 h-7 text-slate-300" />
                    )}
                  </div>

                  <p className="font-semibold text-slate-600">
                    {isSearchEmpty ? t("notFound") : t("noClinics")}
                  </p>

                  <p className="text-xs text-slate-400 w-72 leading-relaxed">
                    {isSearchEmpty ? t("notFoundDesc") : t("noClinicsDesc")}
                  </p>
                </div>
              )}

              {!isLoading && clinics.length > 0 && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {visibleClinics.map((clinic) => (
                      <Link
                        key={clinic.id}
                        href={`/${locale}/clinics/${clinic.id}`}
                        className={cn(
                          "group bg-white rounded-2xl border border-slate-200/80 p-5",
                          "hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
                          "transition-all duration-200 flex gap-4"
                        )}
                      >
                        <ClinicLogo url={clinic.logoUrl} name={clinic.name} />

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {clinic.name}
                            </h3>
                            <StarRating value={clinic.ratingAvg} />
                          </div>

                          {clinic.description && (
                            <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed mt-0.5">
                              {clinic.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-xs text-slate-500 truncate max-w-[200px]">{clinic.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-xs text-slate-500">{clinic.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                            {clinic.reviewCount != null && clinic.reviewCount > 0 ? (
                              <span className="text-xs text-slate-400">
                                {clinic.reviewCount} {t("reviews")}
                              </span>
                            ) : <span />}
                            <div className="flex items-center gap-0.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              {t("details")}
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

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
                        {t("showMoreClinics", { count: Math.min(remaining, PAGE_SIZE) })}
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