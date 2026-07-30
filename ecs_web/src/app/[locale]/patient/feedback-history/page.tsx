"use client";

import { useEffect, useState } from "react";
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
            return date.toLocaleDateString("vi-VN", {
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
                    Lịch sử đánh giá của tôi
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Xem lại toàn bộ đóng góp ý kiến và đánh giá của bạn dành cho đội ngũ bác sĩ &amp; phòng khám
                </p>
            </div>

            <form onSubmit={handleSearch} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex flex-col gap-1.5 w-full flex-1">
                    <label className="text-sm font-semibold text-slate-600">Tìm kiếm</label>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên bác sĩ, phòng khám, nội dung..."
                            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                aria-label="Xóa tìm kiếm"
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
                        Tìm kiếm
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 h-[38px] transition-all active:scale-95"
                        >
                            <X className="h-4 w-4" />
                            Xóa
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Đang tải lịch sử phản hồi...</p>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-700 font-bold text-base">
                        {searchTerm ? "Không tìm thấy đánh giá phù hợp" : "Bạn chưa có lịch sử đánh giá nào"}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                            Xóa tìm kiếm
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
                                    <span>Bệnh nhân: {item.patientName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Khám: {formatDate(item.appointmentDate)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Gửi: {formatDate(item.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <span>Bác sĩ: <span className="font-semibold text-slate-800">{item.doctorName}</span></span>
                                    </div>
                                    {renderStars(item.ratingDoctor)}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span>Phòng khám: <span className="font-semibold text-slate-800">{item.clinicName}</span></span>
                                    </div>
                                    {renderStars(item.ratingClinic)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ý kiến phản hồi</div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line italic border-l-2 border-blue-100 pl-3">
                                    {item.comment ? `"${item.comment}"` : "Không có nội dung bình luận."}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}