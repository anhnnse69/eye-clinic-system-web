"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw, ChevronLeft, ChevronRight,
  CalendarDays, Phone, Search, X,
  Stethoscope, FileText, Clock, User,
  Check, Ban, Loader2,
} from "lucide-react";
import {
  doctorAppointmentService,
  type AppointmentItem,
  type ViewDoctorAppointmentsResponse,
} from "@/services/doctor.appointment.service";

// ── Constants ─────────────────────────────────────────────

const PAGE_SIZE = 10;

const BOOKING_SOURCE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  WEB: "Website",
  APP: "App",
  WALKIN: "Trực tiếp",
};

// ── Helpers ───────────────────────────────────────────────

function Avatar({ name, url }: { name: string; url?: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 shrink-0 overflow-hidden flex items-center justify-center font-bold text-blue-600 text-sm">
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

function calcAge(dob?: string) {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
}

// ── Main Component ────────────────────────────────────────

export default function DoctorAppointmentsClient({
  doctorId,
}: {
  doctorId: string;
}) {
  const [data, setData] = useState<ViewDoctorAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Action state
  const [rejectTarget, setRejectTarget] = useState<AppointmentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await doctorAppointmentService.getAppointments(doctorId, {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        // Luôn cố định filter PENDING — chỉ hiện lịch hẹn chờ xử lý
        status: "PENDING",
        date: dateFilter || undefined,
        search: search || undefined,
      });

      if (result?.data) {
        setData(result.data);
      } else {
        setError("Không thể tải danh sách lịch hẹn.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, page, dateFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setDateFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasFilter = dateFilter || search;

  // Xóa row khỏi list ngay sau khi confirm / reject thành công
  const removeAppointment = (appointmentId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = prev.appointments.filter(
        (a) => a.appointmentId !== appointmentId
      );
      return {
        ...prev,
        appointments: updated,
        totalRecords: Math.max(0, prev.totalRecords - 1),
      };
    });
  };

  // ── Confirm ──
  const handleConfirm = async (appt: AppointmentItem) => {
    setActionLoadingId(appt.appointmentId);
    setActionError(null);
    try {
      const result = await doctorAppointmentService.confirmRejectAppointment(
        doctorId,
        appt.appointmentId,
        { decision: "CONFIRM" }
      );
      if (result?.data) {
        removeAppointment(appt.appointmentId);
      }
    } catch {
      setActionError("Không thể xác nhận lịch hẹn. Vui lòng thử lại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Reject ──
  const openRejectModal = (appt: AppointmentItem) => {
    setRejectTarget(appt);
    setRejectReason("");
    setActionError(null);
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    setActionLoadingId(rejectTarget.appointmentId);
    setActionError(null);
    try {
      const result = await doctorAppointmentService.confirmRejectAppointment(
        doctorId,
        rejectTarget.appointmentId,
        {
          decision: "REJECT",
          rejectReason: rejectReason.trim() || undefined,
        }
      );
      if (result?.data) {
        removeAppointment(rejectTarget.appointmentId);
        setRejectTarget(null);
      }
    } catch {
      setActionError("Không thể từ chối lịch hẹn. Vui lòng thử lại.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Lịch hẹn chờ xử lý
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Các lịch hẹn cần bạn xác nhận hoặc từ chối
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* ── Filter bar — chỉ Search + Date, bỏ Status ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tên hoặc SĐT bệnh nhân..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
            />
            {hasFilter && (
              <button
                onClick={clearFilters}
                title="Xóa bộ lọc"
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {data && (
          <p className="text-xs text-gray-500 mt-3">
            Tìm thấy{" "}
            <span className="font-semibold text-gray-800">
              {data.totalRecords}
            </span>{" "}
            lịch hẹn chờ xử lý
            {dateFilter &&
              ` · Ngày ${new Date(dateFilter).toLocaleDateString("vi-VN")}`}
            {search && ` · "${search}"`}
          </p>
        )}
      </div>

      {/* Action error toast */}
      {actionError && !rejectTarget && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {actionError}
          <button onClick={() => setActionError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Bệnh nhân</th>
                  <th className="p-4">Thời gian khám</th>
                  <th className="p-4">Dịch vụ</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4">Bệnh án</th>
                  <th className="p-4">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-28 bg-gray-200 rounded" />
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-8 w-36 bg-gray-200 rounded-lg" /></td>
                    </tr>
                  ))
                ) : !data || data.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <CalendarDays className="w-10 h-10" />
                        <p className="font-medium">
                          Không có lịch hẹn nào đang chờ xử lý
                        </p>
                        {hasFilter && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.appointments.map((appt) => (
                    <AppointmentRow
                      key={appt.appointmentId}
                      appt={appt}
                      isActionLoading={actionLoadingId === appt.appointmentId}
                      onConfirm={() => handleConfirm(appt)}
                      onReject={() => openRejectModal(appt)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">
              Trang{" "}
              <span className="font-bold text-gray-800">{data.pageNumber}</span>
              {" / "}
              <span className="font-bold text-gray-800">{data.totalPages}</span>
              {" · Tổng "}
              <span className="font-bold text-gray-800">{data.totalRecords}</span>
              {" lịch hẹn"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages || loading}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[700px] max-w-[90vw] p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Từ chối lịch hẹn
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Bệnh nhân:{" "}
                <span className="font-medium">{rejectTarget.patientName}</span>
                {" · "}
                {new Date(rejectTarget.appointmentDate).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Lý do từ chối{" "}
                <span className="text-gray-400">(không bắt buộc)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Bác sĩ đột xuất bận, vui lòng đặt lại lịch khác..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              />
              {actionError && (
                <p className="text-xs text-red-600 mt-1.5">{actionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={actionLoadingId === rejectTarget.appointmentId}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoadingId === rejectTarget.appointmentId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoadingId === rejectTarget.appointmentId && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Row Component ─────────────────────────────────────────

function AppointmentRow({
  appt,
  isActionLoading,
  onConfirm,
  onReject,
}: {
  appt: AppointmentItem;
  isActionLoading: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const age = calcAge(appt.patientDob);

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">

      {/* Bệnh nhân */}
      <td className="p-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar name={appt.patientName} url={appt.patientAvatarUrl} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {appt.patientName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {appt.patientPhone && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {appt.patientPhone}
                </span>
              )}
              {age !== null && (
                <span className="text-xs text-gray-400">{age} tuổi</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Thời gian */}
      <td className="p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-medium text-gray-900">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {new Date(appt.appointmentDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            {new Date(appt.slotStartTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {new Date(appt.slotEndTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <span className="text-xs text-gray-400">
            {BOOKING_SOURCE_LABEL[appt.bookingSource] ?? appt.bookingSource}
          </span>
        </div>
      </td>

      {/* Dịch vụ */}
      <td className="p-4">
        {appt.serviceName ? (
          <div>
            <p className="text-sm text-gray-800 font-medium">
              {appt.serviceName}
            </p>
            {appt.servicePrice != null && (
              <p className="text-xs text-gray-500 mt-0.5">
                {appt.servicePrice.toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Đặt cọc */}
      <td className="p-4">
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
          Chờ Xử Lý
        </span>
        {appt.depositPaid && (
          <p className="text-xs text-emerald-600 font-medium mt-1">
            ✓ Đã cọc {appt.depositAmount.toLocaleString("vi-VN")}đ
          </p>
        )}
      </td>

      {/* Bệnh án */}
      <td className="p-4">
        {appt.hasMedicalRecord ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            Có bệnh án
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">Chưa có</span>
        )}
      </td>

      {/* Thao tác */}
      <td className="p-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={isActionLoading}
            title="Xác nhận lịch hẹn"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {isActionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Xác nhận
          </button>

          {/* Reject */}
          <button
            onClick={onReject}
            disabled={isActionLoading}
            title="Từ chối lịch hẹn"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Ban className="w-3.5 h-3.5" />
            Từ chối
          </button>
        </div>
      </td>
    </tr>
  );
}