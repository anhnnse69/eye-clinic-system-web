"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw, ChevronLeft, ChevronRight,
  CalendarDays, Phone, Search, X,
  Stethoscope, FileText, Clock, User,
} from "lucide-react";
import {
  doctorAppointmentService,
  type AppointmentItem,
  type ViewDoctorAppointmentsResponse,
} from "@/services/doctor.appointment.service";

// ── Constants ─────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "",             label: "Tất cả" },
  { value: "PENDING",      label: "Chờ thanh toán" },
  { value: "DEPOSIT_PAID", label: "Đã cọc" },
  { value: "BOOKED",       label: "Đã đặt lịch" },
  { value: "ARRIVED",      label: "Đã đến" },
  { value: "IN_PROGRESS",  label: "Đang khám" },
  { value: "COMPLETED",    label: "Hoàn thành" },
  { value: "CANCELLED",    label: "Đã hủy" },
  { value: "NOSHOW",       label: "Không đến" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING:      "bg-amber-50 text-amber-700 border-amber-200",
  DEPOSIT_PAID: "bg-sky-50 text-sky-700 border-sky-200",
  BOOKED:       "bg-blue-50 text-blue-700 border-blue-200",
  ARRIVED:      "bg-purple-50 text-purple-700 border-purple-200",
  IN_PROGRESS:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  COMPLETED:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED:    "bg-red-50 text-red-600 border-red-200",
  NOSHOW:       "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:      "Chờ thanh toán",
  DEPOSIT_PAID: "Đã cọc",
  BOOKED:       "Đã đặt lịch",
  ARRIVED:      "Đã đến",
  IN_PROGRESS:  "Đang khám",
  COMPLETED:    "Hoàn thành",
  CANCELLED:    "Đã hủy",
  NOSHOW:       "Không đến",
};

const BOOKING_SOURCE_LABEL: Record<string, string> = {
  ONLINE: "Online",
  WEB:    "Website",
  APP:    "App",
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
    (Date.now() - new Date(dob).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
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
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

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
      const result = await doctorAppointmentService.getAppointments(
        doctorId,
        {
          pageNumber: page,
          pageSize:   PAGE_SIZE,
          status:     statusFilter || undefined,
          date:       dateFilter   || undefined,
          search:     search       || undefined,
        }
      );

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
  }, [doctorId, page, statusFilter, dateFilter, search]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => {
    setStatusFilter("");
    setDateFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasFilter = statusFilter || dateFilter || search;

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Danh sách lịch hẹn
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tất cả lịch hẹn của bệnh nhân với bạn
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

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Search */}
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

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer text-gray-900"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Date + Clear */}
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
            lịch hẹn
            {dateFilter &&
              ` · Ngày ${new Date(dateFilter).toLocaleDateString("vi-VN")}`}
            {statusFilter && ` · ${STATUS_LABEL[statusFilter] ?? statusFilter}`}
            {search && ` · "${search}"`}
          </p>
        )}
      </div>

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
                  <th className="p-4">Trạng thái</th>
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
                      <td className="p-4">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </td>
                      <td className="p-4">
                        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : !data || data.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <CalendarDays className="w-10 h-10" />
                        <p className="font-medium">Không có lịch hẹn nào</p>
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
                    <AppointmentRow key={appt.appointmentId} appt={appt} />
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
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages || loading}
                className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
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

// ── Row Component ─────────────────────────────────────────

function AppointmentRow({ appt }: { appt: AppointmentItem }) {
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

      {/* Trạng thái */}
      <td className="p-4">
        <div className="space-y-1.5">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
              STATUS_STYLE[appt.status] ??
              "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {STATUS_LABEL[appt.status] ?? appt.status}
          </span>
          {appt.depositPaid && (
            <p className="text-xs text-emerald-600 font-medium">
              ✓ Đã cọc {appt.depositAmount.toLocaleString("vi-VN")}đ
            </p>
          )}
        </div>
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
        <div className="flex items-center gap-2">
          <Link
            href={`/doctor/patients/${appt.patientId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Bệnh nhân
          </Link>
          {appt.symptoms && (
            <span
              title={appt.symptoms}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg cursor-help"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              TC
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}