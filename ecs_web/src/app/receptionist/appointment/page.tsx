"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  RefreshCw, ChevronLeft, ChevronRight,
  CalendarDays, Phone, Search, X,
  FileText, Clock, Stethoscope,
  Check, Ban, Loader2,
} from "lucide-react";
import {
  clinicAppointmentService,
  ACTIONABLE_STATUSES,
  type ClinicAppointmentItem,
  type ViewClinicAppointmentsResponse,
  type AppointmentStatusEnum,
} from "@/services/clinic-appointment.service";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: AppointmentStatusEnum | ""; labelKey: string }[] = [
  { value: "", labelKey: "statusAll" },
  { value: "PENDING", labelKey: "statusPending" },
  { value: "BOOKED", labelKey: "statusBooked" },
  { value: "CANCELLED", labelKey: "statusCancelled" },
];

const STATUS_BADGE_KEY: Record<string, string> = {
  PENDING: "pending",
  BOOKED: "confirmed",
  CANCELLED: "cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  DEPOSIT_PAID: "bg-sky-50 text-sky-700 border-sky-200",
  BOOKED: "bg-blue-50 text-blue-700 border-blue-200",
  ARRIVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  NOSHOW: "bg-red-50 text-red-700 border-red-200",
};

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

function isActionable(status: string) {
  return (ACTIONABLE_STATUSES as string[]).includes(status);
}

export default function ClinicAppointmentsClient() {
  const t = useTranslations("receptionist");

  const [data, setData] = useState<ViewClinicAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [rejectTarget, setRejectTarget] = useState<ClinicAppointmentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async (isSilentArg?: boolean | unknown) => {
    const isSilent = isSilentArg === true
    if (!isSilent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await clinicAppointmentService.getAppointments({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        search: search || undefined,
      });

      if (result?.data) {
        setData(result.data);
      } else if (!isSilent) {
        setError(t("error.loadFailed"));
      }
    } catch {
      if (!isSilent) setError(t("error.connectionError"));
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, statusFilter, dateFilter, search, t]);

  useEffect(() => {
    load(false);

    const intervalId = setInterval(() => {
      load(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [load]);

  const clearFilters = () => {
    setStatusFilter("");
    setDateFilter("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const hasFilter = statusFilter || dateFilter || search;

  const from = data && data.totalRecords > 0 ? (data.pageNumber - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.pageNumber * data.pageSize, data.totalRecords) : 0;

  const handleConfirm = async (appt: ClinicAppointmentItem) => {
    setActionLoadingId(appt.appointmentId);
    setActionError(null);
    try {
      const result = await clinicAppointmentService.confirmRejectAppointment(
        appt.appointmentId,
        { decision: "CONFIRM" }
      );
      if (result?.data) {
        await load();
      } else {
        setActionError(t("errors.saveFailed"));
      }
    } catch {
      setActionError(t("errors.saveFailed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (appt: ClinicAppointmentItem) => {
    setRejectTarget(appt);
    setRejectReason("");
    setActionError(null);
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setActionError(t("appointment.cancelReasonRequiredAlert"));
      return;
    }
    setActionLoadingId(rejectTarget.appointmentId);
    setActionError(null);
    try {
      const result = await clinicAppointmentService.confirmRejectAppointment(
        rejectTarget.appointmentId,
        { decision: "REJECT", rejectReason: rejectReason.trim() }
      );
      if (result?.data) {
        setRejectTarget(null);
        await load();
      } else {
        setActionError(t("appointment.cancelFailed", { error: "" }));
      }
    } catch {
      setActionError(t("appointment.cancelFailed", { error: "" }));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t("appointment.listTitle")}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("appointment.receptionDescription")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("appointment.refresh")}
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("appointment.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`appointment.${opt.labelKey}`)}
              </option>
            ))}
          </select>

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
                title={t("common.clearFilters")}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {data && (
          <p className="text-xs text-gray-500 mt-3">
            {t("appointment.foundResults", { count: data.totalRecords })}
          </p>
        )}
      </div>

      {/* Action error toast (không hiện khi modal reject đang mở, lỗi hiện trong modal) */}
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
              {t("appointment.refresh")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("appointment.patient")}</th>
                  <th className="p-4">{t("appointment.doctor")}</th>
                  <th className="p-4">{t("appointment.time")}</th>
                  <th className="p-4">{t("appointment.service")}</th>
                  <th className="p-4">{t("appointment.status")}</th>
                  <th className="p-4">{t("appointment.hasMedicalRecord")}</th>
                  <th className="p-4">{t("common.actions")}</th>
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
                      <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                      <td className="p-4"><div className="h-8 w-32 bg-gray-200 rounded-lg" /></td>
                    </tr>
                  ))
                ) : !data || data.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <CalendarDays className="w-10 h-10" />
                        <p className="font-medium">{t("appointment.noAppointments")}</p>
                        {hasFilter && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {t("common.clearFilters")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.appointments.map((appt) => (
                    <ClinicAppointmentRow
                      key={appt.appointmentId}
                      appt={appt}
                      isActionLoading={actionLoadingId === appt.appointmentId}
                      onConfirm={() => handleConfirm(appt)}
                      onReject={() => openRejectModal(appt)}
                      t={t}
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
              {t("appointment.showEntries", { from, to, total: data.totalRecords })}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-500">
                {t("appointment.page")}{" "}
                <span className="font-bold text-gray-800">{data.pageNumber}</span>
                {" / "}
                <span className="font-bold text-gray-800">{data.totalPages}</span>
              </span>
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
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[700px] max-w-[90vw] p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {t("appointment.cancelAppointment")}
              </h3>
              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">
                {t("appointment.cancelWarning")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("appointment.patient")}:{" "}
                <span className="font-medium">{rejectTarget.patientName}</span>
                {" · "}
                {new Date(rejectTarget.appointmentDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("appointment.cancelReasonRequired")}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
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
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoadingId === rejectTarget.appointmentId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoadingId === rejectTarget.appointmentId && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Row Component ─────────────────────────────────────────

function ClinicAppointmentRow({
  appt,
  isActionLoading,
  onConfirm,
  onReject,
  t,
}: {
  appt: ClinicAppointmentItem;
  isActionLoading: boolean;
  onConfirm: () => void;
  onReject: () => void;
  t: ReturnType<typeof useTranslations<string>>;
}) {
  const statusStyle = STATUS_STYLE[appt.status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const statusBadgeKey = STATUS_BADGE_KEY[appt.status];
  const actionable = isActionable(appt.status);

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
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {appt.patientPhone || t("appointment.noPhone")}
            </span>
          </div>
        </div>
      </td>

      {/* Doctor */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Avatar name={appt.doctorName ?? "?"} url={appt.doctorAvatarUrl} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {appt.doctorName ?? "—"}
            </p>
            {appt.doctorTitle && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                {appt.doctorTitle}
              </p>
            )}
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
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
          {statusBadgeKey ? t(`appointment.${statusBadgeKey}`) : appt.status}
        </span>
        {appt.depositPaid && (
          <p className="text-xs text-emerald-600 font-medium mt-1">
            ✓ {t("appointment.paidDeposit")} {appt.depositAmount.toLocaleString()}đ
          </p>
        )}
      </td>

      {/* Medical Record */}
      <td className="p-4">
        {appt.hasMedicalRecord ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            {t("appointment.hasMedicalRecord")}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">{t("appointment.noSymptoms")}</span>
        )}
      </td>

      {/* Actions */}
      <td className="p-4">
        {actionable ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onConfirm}
              disabled={isActionLoading}
              title={t("common.confirm")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {isActionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {t("common.confirm")}
            </button>

            <button
              onClick={onReject}
              disabled={isActionLoading}
              title={t("appointment.cancel")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              {t("appointment.cancel")}
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-300 italic">—</span>
        )}
      </td>
    </tr>
  );
}