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
  { value: "DEPOSIT_PAID", labelKey: "statusDepositPaid" },
  { value: "BOOKED", labelKey: "statusBooked" },
  { value: "ARRIVED", labelKey: "statusArrived" },
  { value: "IN_PROGRESS", labelKey: "statusInProgress" },
  { value: "COMPLETED", labelKey: "statusCompleted" },
  { value: "CANCELLED", labelKey: "statusCancelled" },
  { value: "NOSHOW", labelKey: "statusNoshow" },
];

const STATUS_BADGE_KEY: Record<string, string> = {
  PENDING: "statusPending",
  DEPOSIT_PAID: "statusDepositPaid",
  BOOKED: "statusBooked",
  CONFIRMED: "confirmed",
  ARRIVED: "statusArrived",
  IN_PROGRESS: "statusInProgress",
  COMPLETED: "statusCompleted",
  CANCELLED: "statusCancelled",
  NOSHOW: "statusNoshow",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200/70",
  DEPOSIT_PAID: "bg-sky-50 text-sky-800 border-sky-200/70",
  BOOKED: "bg-indigo-50 text-indigo-800 border-indigo-200/70",
  CONFIRMED: "bg-indigo-50 text-indigo-800 border-indigo-200/70",
  ARRIVED: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
  IN_PROGRESS: "bg-purple-50 text-purple-800 border-purple-200/70",
  COMPLETED: "bg-teal-50 text-teal-800 border-teal-200/70",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
  NOSHOW: "bg-rose-50 text-rose-800 border-rose-200/70",
};

function Avatar({ name, url }: { name: string; url?: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#c6e7ff]/40 shrink-0 overflow-hidden flex items-center justify-center font-bold text-primary text-sm border border-[#81cfff]/40">
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
    <div className="space-y-5 p-6 max-w-7xl mx-auto bg-background min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            {t("appointment.listTitle")}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {t("appointment.receptionDescription")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/60 text-primary font-bold rounded-xl hover:bg-surface-container-low transition-all disabled:opacity-50 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("appointment.refresh")}
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder={t("appointment.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface font-medium cursor-pointer"
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
              className="flex-1 px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface font-medium cursor-pointer"
            />
            {hasFilter && (
              <button
                onClick={clearFilters}
                title={t("common.clearFilters")}
                className="px-3 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 rounded-xl text-on-surface-variant transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {data && (
          <p className="text-xs text-on-surface-variant mt-3 font-medium">
            {t("appointment.foundResults", { count: data.totalRecords })}
          </p>
        )}
      </div>

      {/* Action error toast */}
      {actionError && !rejectTarget && (
        <div className="bg-error-container/40 border border-error-container text-on-error-container text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-error font-medium">{error}</p>
            <button
              onClick={load}
              className="px-5 py-2 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition cursor-pointer shadow-xs"
            >
              {t("appointment.refresh")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">{t("appointment.patient")}</th>
                  <th className="p-4">{t("appointment.doctor")}</th>
                  <th className="p-4">{t("appointment.time")}</th>
                  <th className="p-4">{t("appointment.service")}</th>
                  <th className="p-4">{t("appointment.status")}</th>
                  <th className="p-4">{t("appointment.hasMedicalRecord")}</th>
                  <th className="p-4">{t("common.actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-low" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-28 bg-surface-container-low rounded" />
                            <div className="h-3 w-20 bg-surface-container-low rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-24 bg-surface-container-low rounded" /></td>
                      <td className="p-4"><div className="h-4 w-32 bg-surface-container-low rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-surface-container-low rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-surface-container-low rounded" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-surface-container-low rounded" /></td>
                      <td className="p-4"><div className="h-8 w-32 bg-surface-container-low rounded-lg" /></td>
                    </tr>
                  ))
                ) : !data || data.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-on-surface-variant/50">
                        <CalendarDays className="w-10 h-10" />
                        <p className="font-medium">{t("appointment.noAppointments")}</p>
                        {hasFilter && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-primary hover:underline cursor-pointer"
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
          <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-t border-outline-variant/30">
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {t("appointment.showEntries", { from, to, total: data.totalRecords })}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-on-surface-variant">
                {t("appointment.page")}{" "}
                <span className="font-bold text-on-surface">{data.pageNumber}</span>
                {" / "}
                <span className="font-bold text-on-surface">{data.totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1 || loading}
                  className="p-2 border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages || loading}
                  className="p-2 border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl disabled:opacity-40 disabled:pointer-events-none transition shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-[600px] max-w-[90vw] p-6 space-y-5 border border-outline-variant/60 text-left animate-scale-in">
            <div>
              <h3 className="font-bold text-lg text-on-surface">
                {t("appointment.cancelAppointment")}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-line leading-relaxed">
                {t("appointment.cancelWarning")}
              </p>
              <p className="text-sm text-on-surface-variant mt-2 font-medium">
                {t("appointment.patient")}:{" "}
                <span className="font-bold text-on-surface">{rejectTarget.patientName}</span>
                {" · "}
                {new Date(rejectTarget.appointmentDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                {t("appointment.cancelReasonRequired")} <span className="text-error">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-error focus:border-error transition-all resize-none text-on-surface"
              />
              {actionError && (
                <p className="text-xs text-error mt-1.5 font-semibold">{actionError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={actionLoadingId === rejectTarget.appointmentId}
                className="px-4 py-2.5 text-sm font-semibold text-on-surface border border-outline-variant/60 hover:bg-surface-container-low rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoadingId === rejectTarget.appointmentId || !rejectReason.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-on-error bg-error hover:bg-error/90 rounded-xl transition disabled:bg-surface-container disabled:text-on-surface-variant/40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-xs"
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
  const statusStyle = STATUS_STYLE[appt.status] ?? "bg-surface-container text-on-surface-variant border-outline-variant/40";
  const statusBadgeKey = STATUS_BADGE_KEY[appt.status];
  const actionable = isActionable(appt.status);

  return (
    <tr className="hover:bg-surface-container-low/60 transition-colors">

      {/* Patient */}
      <td className="p-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar name={appt.patientName} url={appt.patientAvatarUrl} />
          <div className="min-w-0">
            <p className="font-semibold text-on-surface truncate">
              {appt.patientName}
            </p>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-on-surface-variant" />
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
            <p className="text-sm font-medium text-on-surface truncate">
              {appt.doctorName ?? "—"}
            </p>
            {appt.doctorTitle && (
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-on-surface-variant" />
                {appt.doctorTitle}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Time */}
      <td className="p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-medium text-on-surface">
            <CalendarDays className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
            {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Clock className="w-3 h-3 text-on-surface-variant shrink-0" />
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
            <p className="text-sm text-on-surface font-medium">
              {appt.serviceName}
            </p>
            {appt.servicePrice != null && (
              <p className="text-xs text-on-surface-variant mt-0.5 font-semibold">
                {appt.servicePrice.toLocaleString()}đ
              </p>
            )}
          </div>
        ) : (
          <span className="text-on-surface-variant/40">—</span>
        )}
      </td>

      {/* Status */}
      <td className="p-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
          {statusBadgeKey ? t(`appointment.${statusBadgeKey}`) : appt.status}
        </span>
        {appt.depositPaid && (
          <p className="text-xs text-[#006c49] font-bold mt-1">
            ✓ {t("appointment.paidDeposit")} {appt.depositAmount.toLocaleString()}đ
          </p>
        )}
      </td>

      {/* Medical Record */}
      <td className="p-4">
        {appt.hasMedicalRecord ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#003925] bg-[#6ffbbe]/25 border border-[#4edea3]/60 px-2.5 py-1 rounded-full">
            <FileText className="w-3.5 h-3.5 text-[#006c49]" />
            {t("appointment.hasMedicalRecord")}
          </span>
        ) : (
          <span className="text-xs text-on-surface-variant/40 italic">{t("appointment.noSymptoms")}</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#003925] bg-[#6ffbbe]/25 hover:bg-[#6ffbbe]/40 border border-[#4edea3]/60 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isActionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#006c49]" />
              )}
              {t("common.confirm")}
            </button>

            <button
              onClick={onReject}
              disabled={isActionLoading}
              title={t("appointment.cancel")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-error bg-error-container/40 hover:bg-error-container/70 border border-error-container rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5 text-error" />
              {t("appointment.cancel")}
            </button>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant/30 italic">—</span>
        )}
      </td>
    </tr>
  );
}