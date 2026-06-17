// components/doctor/DoctorPatientListClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  User,
  Phone,
  CalendarDays,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import type {
  ViewListPatientResponse,
  PatientAppointmentItem,
} from "@/types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "CHECKED_IN", label: "Đã check-in" },
  { value: "IN_PROGRESS", label: "Đang khám" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "NO_SHOW", label: "Không đến" },
];

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "CHECKED_IN":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "IN_PROGRESS":
      return "bg-purple-50 text-purple-700 border-purple-100";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "NO_SHOW":
      return "bg-gray-50 text-gray-600 border-gray-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

const STATUS_LABEL_VI: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  CHECKED_IN: "Đã check-in",
  IN_PROGRESS: "Đang khám",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};

function Avatar({ name, url }: { name: string; url?: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 overflow-hidden flex items-center justify-center font-bold text-blue-600 text-sm">
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export default function DoctorPatientListClient() {
  const [data, setData] = useState<ViewListPatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        pageNumber: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (statusFilter) query.set("status", statusFilter);

      const res = await fetch(`/api/doctor/patients?${query.toString()}`);
      const json = await res.json();

      if (json?.data) {
        setData(json.data);
      } else {
        setError("Không thể tải danh sách bệnh nhân");
      }
    } catch {
      setError("Không thể tải danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleCreateProfile = () => {
    window.location.href = "/patient/profiles/create";
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Danh Sách Bệnh Nhân
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Xem và tìm kiếm danh sách bệnh nhân đã đặt lịch với bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateProfile}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-100 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Tạo mới hồ sơ
          </button>
          <button
            onClick={loadPatients}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        {/* Status */}
        <div className="relative md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="p-8 text-center min-h-[300px] bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-4">
          <Users className="w-12 h-12 text-gray-300" />
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={loadPatients}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-sm"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Bệnh nhân</th>
                  <th className="p-4">Số điện thoại</th>
                  <th className="p-4">Ngày hẹn</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
                    </tr>
                  ))
                ) : data && data.patients.length > 0 ? (
                  data.patients.map((p) => (
                    <PatientRow key={p.appointmentId} patient={p} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-10 h-10" />
                        <p className="font-medium">Chưa có bệnh nhân nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Trang{" "}
                <span className="font-bold text-gray-800">{data.pageNumber}</span>
                {" / "}
                <span className="font-bold text-gray-800">{data.totalPages}</span>
                {" "}(Tổng{" "}
                <span className="font-bold text-gray-800">{data.totalRecords}</span>
                {" "}bệnh nhân)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1 || loading}
                  className="p-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages || loading}
                  className="p-2 border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition rounded-xl disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatientRow({ patient }: { patient: PatientAppointmentItem }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="p-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar name={patient.patientName} url={patient.patientAvatarUrl} />
          <span className="font-semibold text-gray-900">
            {patient.patientName}
          </span>
        </div>
      </td>

      <td className="p-4">
        {patient.patientPhone ? (
          <div className="flex items-center gap-1.5 text-gray-700">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            {patient.patientPhone}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      <td className="p-4">
        <div className="flex items-center gap-1.5 font-medium text-gray-900">
          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
          {new Date(patient.appointmentDate).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </td>

      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(patient.status)}`}
        >
          {STATUS_LABEL_VI[patient.status] ?? patient.status}
        </span>
      </td>
    </tr>
  );
}
