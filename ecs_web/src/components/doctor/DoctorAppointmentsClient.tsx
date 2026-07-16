"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

const PAGE_SIZE = 10;

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

export default function DoctorAppointmentsClient({
  doctorId,
}: {
  doctorId: string;
}) {
  const t = useTranslations("doctor.appointment")

  const [data, setData] = useState<ViewDoctorAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [rejectTarget, setRejectTarget] = useState<AppointmentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        status: "PENDING",
        date: dateFilter || undefined,
        search: search || undefined,
      });

      if (result?.data) {
        setData(result.data);
      } else {
        setError(t("error.loadFailed"));
      }
    } catch {
      setError(t("error.connectionError"));
    } finally {
      setLoading(false);
    }
  }, [doctorId, page, dateFilter, search, t]);

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
      setActionError(t("error.confirmFailed"));
    } finally {
      setActionLoadingId(null);
    }
  };

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
      setActionError(t("error.rejectFailed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const getBookingSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      ONLINE: t("bookingSource.online") || "Online",
      WEB: t("bookingSource.website") || "Website",
      APP: t("bookingSource.app") || "App",
      WALKIN: t("bookingSource.walkin") || "Walk-in",
    };
    return labels[source] || source;
  };

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t("pendingTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("pendingSubtitle")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
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
                title={t("clearFilters")}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {data && (
          <p className="text-xs text-gray-500 mt-3">
            {t("foundResults", { count: data.totalRecords })}
            {dateFilter &&
              ` ${t("filterByDate", { date: new Date(dateFilter).toLocaleDateString() })}`}
            {search && ` ${t("filterBySearch", { search })}`}
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

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("patient")}</th>
                  <th className="p-4">{t("time")}</th>
                  <th className="p-4">{t("service")}</th>
                  <th className="p-4">{t("status")}</th>
                  <th className="p-4">{t("hasMedicalRecord")}</th>
                  <th className="p-4">{t("actions")}</th>
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
                          {t("noPendingAppointments")}
                        </p>
                        {hasFilter && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {t("clearFilters")}
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
                      t={t}
                      getBookingSourceLabel={getBookingSourceLabel}
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
              {t("page")}{" "}
              <span className="font-bold text-gray-800">{data.pageNumber}</span>
              {" / "}
              <span className="font-bold text-gray-800">{data.totalPages}</span>
              {" · "}{t("total")}{" "}
              <span className="font-bold text-gray-800">{data.totalRecords}</span>
              {" "}{t("appointments")}
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[700px] max-w-[90vw] p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {t("rejectModalTitle")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t("patientLabel")}{" "}
                <span className="font-medium">{rejectTarget.patientName}</span>
                {" · "}
                {new Date(rejectTarget.appointmentDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("rejectReasonLabel")}{" "}
                <span className="text-gray-400">{t("rejectReasonOptional")}</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder={t("rejectReasonPlaceholder")}
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
                {t("cancel")}
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoadingId === rejectTarget.appointmentId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoadingId === rejectTarget.appointmentId && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {t("confirmReject")}
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
  t,
  getBookingSourceLabel,
}: {
  appt: AppointmentItem;
  isActionLoading: boolean;
  onConfirm: () => void;
  onReject: () => void;
  t: ReturnType<typeof useTranslations<string>>;
  getBookingSourceLabel: (source: string) => string;
}) {
  const age = calcAge(appt.patientDob);

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">

      {/* Patient */}
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
                <span className="text-xs text-gray-400">{age} {t("yearsOld")}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Time */}
      <td className="p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-medium text-gray-900">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            {new Date(appt.slotStartTime).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {new Date(appt.slotEndTime).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <span className="text-xs text-gray-400">
            {getBookingSourceLabel(appt.bookingSource)}
          </span>
        </div>
      </td>

      {/* Service */}
      <td className="p-4">
        {appt.serviceName ? (
          <div>
            <p className="text-sm text-gray-800 font-medium">
              {appt.serviceName}
            </p>
            {appt.servicePrice != null && (
              <p className="text-xs text-gray-500 mt-0.5">
                {appt.servicePrice.toLocaleString()}đ
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Status */}
      <td className="p-4">
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
          {t("pending")}
        </span>
        {appt.depositPaid && (
          <p className="text-xs text-emerald-600 font-medium mt-1">
            ✓ {t("depositPaid")} {appt.depositAmount.toLocaleString()}đ
          </p>
        )}
      </td>

      {/* Medical Record */}
      <td className="p-4">
        {appt.hasMedicalRecord ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            {t("hasMedicalRecord")}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">{t("noMedicalRecord")}</span>
        )}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={isActionLoading}
            title={t("confirm")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {isActionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {t("confirm")}
          </button>

          {/* Reject */}
          <button
            onClick={onReject}
            disabled={isActionLoading}
            title={t("reject")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Ban className="w-3.5 h-3.5" />
            {t("reject")}
          </button>
        </div>
      </td>
    </tr>
  );
}
