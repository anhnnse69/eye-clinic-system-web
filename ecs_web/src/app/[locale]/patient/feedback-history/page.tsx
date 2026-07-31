"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
    Search,
    Loader2,
    Star,
    User,
    Stethoscope,
    Building2,
    Calendar,
    MessageSquare,
    Clock,
    X,
} from "lucide-react";
import patientFeedbackService, {
    FeedbackHistoryItem,
} from "@/services/patient-feedback.service";

export default function FeedbackHistoryPage() {
    const initialLocale = useLocale();

    const [currentLocale, setCurrentLocale] = useState<"vi" | "en">(() => {
        if (typeof window !== "undefined") {
            const match = window.location.pathname.match(/^\/(vi|en)(\/|$)/)
            if (match) return match[1] as "vi" | "en"
            const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)
            if (cookieMatch && (cookieMatch[1] === "vi" || cookieMatch[1] === "en")) {
                return cookieMatch[1] as "vi" | "en"
            }
            const stored = localStorage.getItem("locale")
            if (stored === "vi" || stored === "en") return stored
        }
        return initialLocale === "en" ? "en" : "vi"
    })

    useEffect(() => {
        const handleLocaleChanged = (e: any) => {
            if (e?.detail?.locale === "vi" || e?.detail?.locale === "en") {
                setCurrentLocale(e.detail.locale)
            }
        }
        window.addEventListener("ecs-locale-changed", handleLocaleChanged)
        return () => window.removeEventListener("ecs-locale-changed", handleLocaleChanged)
    }, [])

    const locale = currentLocale
    const t = (vi: string, en: string) => (locale === "en" ? en : vi);

    const [feedbacks, setFeedbacks] = useState<FeedbackHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async (overrideSearchTerm?: string) => {
        try {
            setLoading(true);
            const response = await patientFeedbackService.getMyFeedbackHistory({
                pageNumber: 1,
                pageSize: 10,
                searchTerm: overrideSearchTerm ?? searchTerm,
            });

            if (response?.data) {
                setFeedbacks(response.data);
            }
        } catch (error) {
            console.error("Load feedback history failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        loadData("");
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        className={`w-4 h-4 ${index < rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-100"
                            }`}
                    />
                ))}
                <span className="text-xs font-bold text-slate-600 ml-1">({rating}/5)</span>
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr.split("T")[0] || dateStr;
            return date.toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6 w-full min-w-0 px-4 py-4 max-w-5xl mx-auto">

            <div className="pb-4 border-b border-slate-200/80">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    {t("Lịch sử đánh giá của tôi", "My Feedback & Review History")}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {t("Xem lại toàn bộ đóng góp ý kiến và đánh giá của bạn dành cho đội ngũ bác sĩ & phòng khám", "Review all your feedback and reviews for doctors and clinic facilities")}
                </p>
            </div>

            <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex flex-col gap-1.5 w-full flex-1">
                    <label className="text-sm font-semibold text-slate-600">{t("Tìm kiếm", "Search")}</label>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("Tìm theo tên bác sĩ, phòng khám, nội dung...", "Search by doctor name, clinic name, content...")}
                            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                aria-label={t("Xóa tìm kiếm", "Clear search")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="submit"
                        className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 h-[38px] cursor-pointer"
                    >
                        {t("Tìm kiếm", "Search")}
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 h-[38px] transition-all active:scale-95"
                        >
                            <X className="h-4 w-4" />
                            {t("Xóa", "Clear")}
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">{t("Đang tải lịch sử phản hồi...", "Loading feedback history...")}</p>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-700 font-bold text-base">
                        {searchTerm ? t("Không tìm thấy đánh giá phù hợp", "No matching reviews found") : t("Bạn chưa có lịch sử đánh giá nào", "You have no review history yet")}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                            {t("Xóa tìm kiếm", "Clear search")}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {feedbacks.map((item) => (
                        <div
                            key={item.feedbackId}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all space-y-4"
                        >

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg w-fit">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{t("Bệnh nhân:", "Patient:")} {item.patientName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {t("Khám:", "Exam Date:")} {formatDate(item.appointmentDate)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t("Gửi:", "Submitted:")} {formatDate(item.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span>{t("Bác sĩ:", "Doctor:")} <span className="font-semibold text-slate-800">{item.doctorName}</span></span>
                                    </div>
                                    {renderStars(item.ratingDoctor)}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>{t("Phòng khám:", "Clinic:")} <span className="font-semibold text-slate-800">{item.clinicName}</span></span>
                                    </div>
                                    {renderStars(item.ratingClinic)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("Ý kiến phản hồi", "Feedback comments")}</div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line italic border-l-2 border-blue-100 pl-3">
                                    {item.comment ? `"${item.comment}"` : t("Không có nội dung bình luận.", "No comment content.")}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}