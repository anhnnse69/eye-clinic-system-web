"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Phone, Mail, Star, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCeUucgwDtb70ZPDmE3v2bDk0sQt523IIANyQgHLHTtPq42KR9R5ZvqYYRKIJL1M2hFj1sVYmsB6LEU2qCnTXlUfVK2OCa6aYP1lve83OKBKhZFoBoBi6g0l2uJ2nb8pChVnYqRA4yXEJV67ldP5Am_k6Gm-yoyKTc2qeT2K_4sp43WkBj8nbDuGZez8_429pg9hzpbcxT3CQyTZobmllIi61Zv7075i-mgT7xsReCIK4_GnauC_zxk_DS7l1f6W1iBuqaNyE7cAXLS";

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
  if (!value) return <span className="text-xs text-outline">—</span>;
  return (
    <span className="flex items-center gap-1 text-sm">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-on-surface font-medium">{value.toFixed(1)}</span>
    </span>
  );
}

export default function SearchClinicsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleLocale = () =>
    router.push(`/${locale === "vi" ? "en" : "vi"}/search/clinics?q=${keyword}`);

  const fetchResults = useCallback(async (kw: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `/api/search?keyword=${encodeURIComponent(kw)}`
      );
      const data = await res.json();
      if (data?.data?.clinics) {
        setClinics(data.data.clinics);
      } else {
        setClinics([]);
      }
    } catch {
      setClinics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on mount if there's a query param
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q) {
      setKeyword(q);
      setInputValue(q);
      fetchResults(q);
    } else {
      fetchResults("");
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setKeyword(trimmed);
    router.replace(
      `/${locale}/search/clinics${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`
    );
    fetchResults(trimmed);
  };

  return (
    <main className="min-h-screen bg-surface-container-lowest">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href={`/${locale}/home`} className="shrink-0">
            <img src={BRAND_LOGO} alt="Logo" className="h-14 w-14 object-contain"
            />
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  locale === "vi"
                    ? "Tìm kiếm phòng khám..."
                    : "Search clinics..."
                }
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant",
                  "bg-transparent text-on-surface font-body-md text-body-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary",
                  "placeholder:text-outline/50"
                )}
              />
            </div>
            <button
              type="submit"
              className="h-12 px-5 rounded-xl bg-primary text-on-primary border border-primary font-medium hover:opacity-90 transition-all shrink-0"
            >
              {locale === "vi" ? "Tìm" : "Search"}
            </button>
          </form>

          {/* Tab switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-surface-container rounded-lg p-1 shrink-0">
            <span className="px-5 py-3 rounded-xl bg-primary text-on-primary border border-primary text-sm font-medium">              {locale === "vi" ? "Phòng khám" : "Clinics"}
            </span>
            <Link
              href={`/${locale}/search/doctors${keyword ? `?q=${encodeURIComponent(keyword)}` : ""}`}
              className="px-5 py-3 rounded-xl border border-outline-variant bg-white text-on-surface hover:bg-surface-container text-sm font-medium transition-all"           >
              {locale === "vi" ? "Bác sĩ" : "Doctors"}
            </Link>
          </div>

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-sm font-medium transition-colors shrink-0"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{locale}</span>
          </button>
        </div>

        {/* Mobile tab switcher */}
        <div className="sm:hidden flex border-t border-outline-variant">
          <span className="flex-1 py-2 text-center text-sm font-medium text-primary border-b-2 border-primary">
            {locale === "vi" ? "Phòng khám" : "Clinics"}
          </span>
          <Link
            href={`/${locale}/search/doctors${keyword ? `?q=${encodeURIComponent(keyword)}` : ""}`}
            className="flex-1 py-2 text-center text-sm font-medium text-on-surface-variant"
          >
            {locale === "vi" ? "Bác sĩ" : "Doctors"}
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Result count */}
        {hasSearched && !isLoading && (
          <p className="text-sm text-on-surface-variant mb-4">
            {keyword
              ? locale === "vi"
                ? `Kết quả cho "${keyword}": ${clinics.length} phòng khám`
                : `Results for "${keyword}": ${clinics.length} clinic(s)`
              : locale === "vi"
                ? `${clinics.length} phòng khám`
                : `${clinics.length} clinic(s)`}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && hasSearched && clinics.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <Search className="w-12 h-12 text-outline/40" />
            <p className="text-on-surface-variant font-body-md">
              {locale === "vi"
                ? "Không tìm thấy phòng khám phù hợp"
                : "No clinics found"}
            </p>
          </div>
        )}

        {/* Clinic cards */}
        {!isLoading && clinics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-surface-container rounded-xl border border-outline-variant p-4 hover:shadow-md transition-shadow flex gap-4"
              >
                {/* Logo */}
                <div className="w-14 h-14 rounded-lg bg-surface-container-high shrink-0 overflow-hidden flex items-center justify-center">
                  {clinic.logoUrl ? (
                    <img
                      src={clinic.logoUrl}
                      alt={clinic.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {clinic.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-headline-sm text-on-surface font-semibold truncate">
                      {clinic.name}
                    </h3>
                    <StarRating value={clinic.ratingAvg} />
                  </div>

                  {clinic.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                      {clinic.description}
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-outline" />
                      <span className="line-clamp-1">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-outline" />
                      <span>{clinic.phone}</span>
                    </div>
                    {clinic.email && (
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-outline" />
                        <span className="truncate">{clinic.email}</span>
                      </div>
                    )}
                  </div>

                  {clinic.reviewCount != null && clinic.reviewCount > 0 && (
                    <p className="mt-2 text-xs text-outline">
                      {clinic.reviewCount}{" "}
                      {locale === "vi" ? "đánh giá" : "reviews"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}