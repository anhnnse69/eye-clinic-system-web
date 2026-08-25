"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, Calendar, Users, ClipboardList,
  RotateCw, ShieldAlert, Filter, HelpCircle, AlertCircle,
  Activity, CheckCircle2, XCircle, Clock, UserCheck,
  DoorOpen, Lock, CalendarCheck, Phone, TrendingUp,
} from "lucide-react";

import {
  doctorDashboardService,
  type DoctorDashboardResponse,
} from "@/services/doctor.dashboard.service";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

function toDateStr(d: Date) {
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().split("T")[0];
}

export default function DoctorDashboardClient({
  doctorId,
}: {
  doctorId: string;
}) {
  const t = useTranslations("doctor")
  const tDashboard = useTranslations("doctor.dashboard")
  const tAppointments = useTranslations("doctor.appointment")
  const tCommon = useTranslations("doctor.common")

  const today = toDateStr(new Date());
  const defaultStart = toDateStr(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  );

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);

  const [data, setData] = useState<DoctorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorDashboardService.getDashboard(doctorId, {
        startDate,
        endDate,
      });
      if (res.data) {
        setData(res.data);
      } else {
        setError(t("errors.loadFailed"));
      }
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setLoading(false);
    }
  }, [doctorId, startDate, endDate, t]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const resetFilter = () => {
    setStartDate(defaultStart);
    setEndDate(today);
  };

  const getAppointmentStatusGrid = (
    s: DoctorDashboardResponse["todayAppointments"]
  ) => [
      {
        label: tAppointments("pending"),
        count: s.pending,
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
        bgBox: "bg-amber-50/60",
        iconColor: "text-amber-600",
        icon: HelpCircle
      },
      {
        label: tAppointments("depositPaid"),
        count: s.depositPaid,
        badgeBg: "bg-[#00658D]/10 text-[#00658D] border-[#00658D]/20",
        bgBox: "bg-[#00658D]/10",
        iconColor: "text-[#00658D]",
        icon: AlertCircle
      },
      {
        label: tAppointments("booked"),
        count: s.booked,
        badgeBg: "bg-[#00658D]/10 text-[#00658D] border-[#00658D]/20",
        bgBox: "bg-[#00658D]/10",
        iconColor: "text-[#00658D]",
        icon: Calendar
      },
      {
        label: tAppointments("arrived"),
        count: s.arrived,
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200/80",
        bgBox: "bg-sky-50/60",
        iconColor: "text-sky-600",
        icon: UserCheck
      },
      {
        label: tAppointments("inProgress"),
        count: s.inProgress,
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
        bgBox: "bg-amber-50/60",
        iconColor: "text-amber-600",
        icon: Activity
      },
      {
        label: tAppointments("completed"),
        count: s.completed,
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        bgBox: "bg-emerald-50/60",
        iconColor: "text-emerald-600",
        icon: CheckCircle2
      },
      {
        label: tAppointments("cancelled"),
        count: s.cancelled,
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
        bgBox: "bg-rose-50/60",
        iconColor: "text-rose-600",
        icon: XCircle
      },
      {
        label: tAppointments("noShow"),
        count: s.noShow,
        badgeBg: "bg-slate-100 text-slate-600 border-slate-200",
        bgBox: "bg-slate-100/60",
        iconColor: "text-slate-500",
        icon: Clock
      },
    ];

  const maxTrendValue = data
    ? Math.max(...data.trend.map((t) => t.totalCount), 1)
    : 1;

  return (
    <div className="space-y-5 w-full min-w-0 px-6 py-5 bg-[#f8fafc] min-h-screen text-slate-600 font-sans antialiased">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
            <LayoutDashboard className="h-6 w-6 text-[#00658D]" />
            {tDashboard("overview")}
          </h2>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 shadow-2xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[260px] shadow-2xs">
          <RotateCw className="h-6 w-6 text-[#00658D] animate-spin mb-2" />
          <p className="text-xs text-slate-500 font-medium">{tDashboard("syncingData")}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">

          {/* ═══ TODAY SECTION ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <CalendarCheck className="h-4 w-4 text-[#00658D]" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                {tDashboard("today")} ({new Date().toLocaleDateString()})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Today's Shifts */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{tDashboard("shiftWork")}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {data.todaySchedule.totalShifts} <span className="text-xs font-normal text-slate-500">{tDashboard("totalShifts")}</span>
                  </h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-600 border-t border-slate-100 pt-2.5">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="h-3 w-3 text-emerald-600" />
                    {data.todaySchedule.availableSlots} {tDashboard("available")}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-amber-600" />
                    {data.todaySchedule.bookedSlots} {tDashboard("booked")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-rose-500" />
                    {data.todaySchedule.blockedSlots} {tDashboard("blocked")}
                  </span>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{tDashboard("todayAppointments")}</span>
                    <span className="text-[10px] font-bold text-[#00658D] bg-[#00658D]/10 px-2 py-0.5 rounded-md border border-[#00658D]/20">
                      {data.todayAppointments.total} {tDashboard("appointmentCount")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {data.todayAppointments.completed}
                    <span className="text-xs font-normal text-slate-500">
                      {" "}/ {data.todayAppointments.activeTotal} {tDashboard("hoànThanh")}
                    </span>
                  </h3>
                  {(data.todayAppointments.cancelled > 0 || data.todayAppointments.noShow > 0) && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {tDashboard("excludedCancelled", { cancelled: data.todayAppointments.cancelled })}
                      {data.todayAppointments.noShow > 0 && `, ${tDashboard("noShow", { noShow: data.todayAppointments.noShow })}`}
                    </p>
                  )}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: data.todayAppointments.activeTotal
                          ? `${Math.round((data.todayAppointments.completed / data.todayAppointments.activeTotal) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Patients */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{tDashboard("totalPatients")}</span>
                    <span className="text-[10px] font-bold text-[#00658D] bg-[#00658D]/10 px-2 py-0.5 rounded-md border border-[#00658D]/20">
                      <Users className="h-3 w-3 inline mr-0.5 text-[#00658D]" />
                      {tDashboard("completed")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
                    {data.totalPatients.toLocaleString()} <span className="text-xs font-normal text-slate-500">{tDashboard("uniquePatients")}</span>
                  </h3>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    {tDashboard("uniquePatientsDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ TREND SECTION ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <TrendingUp className="h-4 w-4 text-[#00658D]" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                {tDashboard("trendTitle")}
              </span>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tDashboard("fromDate")}</label>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] outline-none text-slate-800 transition-all min-h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tDashboard("toDate")}</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00658D]/20 focus:border-[#00658D] outline-none text-slate-800 transition-all min-h-[36px]"
                  />
                </div>
                <button
                  onClick={resetFilter}
                  className="text-slate-700 hover:text-[#00658D] text-xs font-semibold h-[36px] flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#00658D]/10 rounded-xl border border-slate-200 transition-all shadow-2xs"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {tDashboard("resetFilter")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Appointment status grid */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#00658D]" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tDashboard("appointmentsInRange")}</h4>
                    </div>
                    <span className="text-xs font-bold text-[#00658D] bg-[#00658D]/10 px-2.5 py-0.5 rounded-md border border-[#00658D]/20">
                      {data.periodAppointments.total} {tDashboard("appointmentCount")}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
                    {getAppointmentStatusGrid(data.periodAppointments).map((item, index) => {
                      const StatusIcon = item.icon;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 transition-all text-xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`p-1 rounded-md ${item.bgBox} shrink-0 flex items-center justify-center`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                            </div>
                            <span className="font-medium text-slate-700 truncate">{item.label}</span>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] border min-w-[32px] text-center ${item.badgeBg}`}>
                            {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <TrendingUp className="h-4 w-4 text-[#00658D]" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tDashboard("chartByDate")}</h4>
                  </div>

                  {data.trend.length === 0 ? (
                    <p className="text-xs text-slate-400 py-12 text-center font-medium">{tDashboard("noDataInRange")}</p>
                  ) : (
                    <div className="flex items-end gap-2" style={{ height: "200px" }}>
                      {data.trend.map((t) => {
                        const CHART_HEIGHT = 160;
                        const totalPx = t.totalCount > 0
                          ? Math.max((t.totalCount / maxTrendValue) * CHART_HEIGHT, 6)
                          : 2;
                        const completedPx = t.totalCount
                          ? (t.completedCount / t.totalCount) * totalPx
                          : 0;

                        return (
                          <div key={t.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group">
                            <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.completedCount}/{t.totalCount}
                            </div>
                            <div
                              className="w-full rounded-md relative bg-[#00658D]/20 overflow-hidden"
                              style={{ height: `${totalPx}px` }}
                            >
                              <div
                                className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-md"
                                style={{ height: `${completedPx}px` }}
                              />
                            </div>
                            <span className="text-[9px] font-medium text-slate-500 whitespace-nowrap">
                              {new Date(t.date).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-[10px] font-medium text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-[#00658D]/20 border border-[#00658D]/40" />
                      {tDashboard("totalAppointments")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-emerald-500" />
                      {tDashboard("completed")}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center text-slate-400 py-12 text-xs font-medium">{tDashboard("noDataFound")}</div>
      )}
    </div>
  );
}
