"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, Loader2, RefreshCw, CheckCircle2,
  ChevronLeft, ChevronRight, BellOff, AlertCircle,
} from "lucide-react";
import {
  patientNotificationService,
  type NotificationItem,
  type ViewNotificationListResponse,
} from "@/services/patient.notification.service";
import { renderNotificationText } from "@/lib/notification.helper";

const PAGE_SIZE = 10;

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function NotificationListClient({
  patientUserId,
}: {
  patientUserId: string;
}) {
  const [data, setData] = useState<ViewNotificationListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientNotificationService.getNotifications(patientUserId, {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        isRead: filterUnread ? false : undefined,
      });
      if (res.data) setData(res.data);
      else setError("Không thể tải thông báo.");
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [patientUserId, page, filterUnread]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkRead = async (n: NotificationItem) => {
    if (n.isRead) return;
    try {
      await patientNotificationService.markAsRead(patientUserId, n.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              unreadCount: Math.max(0, prev.unreadCount - 1),
              notifications: prev.notifications.map((x) =>
                x.id === n.id ? { ...x, isRead: true } : x
              ),
            }
          : prev
      );
    } catch {
      // im lặng bỏ qua lỗi nhỏ
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thông báo</h1>
            <p className="text-sm text-gray-500 mt-1">
              Các thông báo quan trọng về lịch hẹn và sức khỏe của bạn
            </p>
          </div>
        </div>

        {data && data.unreadCount > 0 && (
          <div className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 w-fit">
            {data.unreadCount} thông báo chưa đọc
          </div>
        )}
      </div>

      {/* Filters & Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <button
          onClick={() => {
            setFilterUnread(!filterUnread);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl border transition-all duration-200 ${
            filterUnread
              ? "bg-red-600 border-red-600 text-white shadow-sm hover:bg-red-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {filterUnread ? "Hiển thị tất cả" : "Chỉ hiện chưa đọc"}
        </button>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition disabled:opacity-50 text-sm font-medium border border-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <BellOff className="w-12 h-12 stroke-[1.5]" />
              <p className="font-medium text-gray-500">Bạn không có thông báo nào</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.notifications.map((noti) => {
              // 👈 GỌI HÀM BIÊN DỊCH CHUỖI ĐỘNG TẠI ĐÂY
              const { title, content } = renderNotificationText(noti.title, noti.content);

              return (
                <div
                  key={noti.id}
                  onClick={() => handleMarkRead(noti)}
                  className={`p-5 transition-all duration-150 flex gap-4 items-start cursor-pointer group ${
                    noti.isRead ? "bg-white opacity-80" : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  <div className="mt-1">
                    {noti.isRead ? (
                      <CheckCircle2 className="w-5 h-5 text-gray-400" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 ring-4 ring-blue-100" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold truncate ${noti.isRead ? "text-gray-700" : "text-gray-950"}`}>
                        {title} {/* 👈 HIỂN THỊ TIÊU ĐỀ SAU DỊCH */}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0 font-medium">
                        {timeAgo(noti.sentAt)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${noti.isRead ? "text-gray-500" : "text-gray-600"}`}>
                      {content} {/* 👈 HIỂN THỊ NỘI DUNG SAU DỊCH */}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/70 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Trang <span className="font-bold text-gray-800">{data.pageNumber}</span> /{" "}
              <span className="font-bold text-gray-800">{data.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages || loading}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 transition shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}