"use client";

import { useState, useEffect, useCallback } from "react";
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

function toDateStr(d: Date) {
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().split("T")[0];
}

export default function DoctorDashboardClient({
  doctorId,
}: {
  doctorId: string;
}) {
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
        setError("Không thể đọc dữ liệu phản hồi từ máy chủ.");
      }
    } catch {
      setError("Lỗi kết nối hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [doctorId, startDate, endDate]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const resetFilter = () => {
    setStartDate(defaultStart);
    setEndDate(today);
  };

  const getAppointmentStatusGrid = (
    s: DoctorDashboardResponse["todayAppointments"]
  ) => [
      { label: "Chờ thanh toán", count: s.pending, badgeBg: "bg-amber-50 text-amber-700 border-amber-100", bgBox: "bg-amber-50/60", iconColor: "text-amber-600", icon: HelpCircle },
      { label: "Đã đặt cọc", count: s.depositPaid, badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-100", bgBox: "bg-cyan-50/60", iconColor: "text-cyan-600", icon: AlertCircle },
      { label: "Đã đặt lịch", count: s.booked, badgeBg: "bg-blue-50 text-blue-700 border-blue-100", bgBox: "bg-blue-50/60", iconColor: "text-blue-600", icon: Calendar },
      { label: "Đã đến", count: s.arrived, badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-100", bgBox: "bg-indigo-50/60", iconColor: "text-indigo-600", icon: UserCheck },
      { label: "Đang khám", count: s.inProgress, badgeBg: "bg-purple-50 text-purple-700 border-purple-100", bgBox: "bg-purple-50/60", iconColor: "text-purple-600", icon: Activity },
      { label: "Hoàn thành", count: s.completed, badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100", bgBox: "bg-emerald-50/60", iconColor: "text-emerald-600", icon: CheckCircle2 },
      { label: "Đã hủy", count: s.cancelled, badgeBgs: "bg-rose-50 text-rose-700 border-rose-100", bgBox: "bg-rose-50/60", iconColor: "text-rose-600", icon: XCircle },
      { label: "Không đến", count: s.noShow, badgeBg: "bg-slate-50 text-slate-700 border-slate-200", bgBox: "bg-slate-100/60", iconColor: "text-slate-500", icon: Clock },
    ];

  const maxTrendValue = data
    ? Math.max(...data.trend.map((t) => t.totalCount), 1)
    : 1;

  return (
    <div className="space-y-5 w-full min-w-0 px-6 py-5 bg-[#f8fafc] min-h-screen text-slate-600 font-sans antialiased">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            Tổng quan
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
          <RotateCw className="h-6 w-6 text-blue-500 animate-spin mb-2" />
          <p className="text-xs text-slate-400 font-medium">Đang đồng bộ số liệu...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">

          {/* ═══ VÙNG 1: HÔM NAY ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <CalendarCheck className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Hôm nay ({new Date().toLocaleDateString("vi-VN")})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ca làm việc hôm nay */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ca làm việc hôm nay</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {data.todaySchedule.totalShifts} <span className="text-xs font-normal text-slate-400">ca trực</span>
                  </h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-500 border-t border-slate-50 pt-2">
                  <span className="flex items-center gap-1">
                    <DoorOpen className="h-3 w-3 text-green-500" />
                    {data.todaySchedule.availableSlots} trống
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-amber-500" />
                    {data.todaySchedule.bookedSlots} đã đặt
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-rose-400" />
                    {data.todaySchedule.blockedSlots} khóa
                  </span>
                </div>
              </div>

              {/* Lịch hẹn hôm nay */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lịch hẹn hôm nay</span>
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100/60">
                      {data.todayAppointments.total} lịch
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {data.todayAppointments.completed}
                    <span className="text-xs font-normal text-slate-400">
                      {" "}/ {data.todayAppointments.activeTotal} hoàn thành
                    </span>
                  </h3>
                  {(data.todayAppointments.cancelled > 0 || data.todayAppointments.noShow > 0) && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Không tính {data.todayAppointments.cancelled} đã hủy
                      {data.todayAppointments.noShow > 0 && `, ${data.todayAppointments.noShow} không đến`}
                    </p>
                  )}
                </div>
                <div className="mt-3 border-t border-slate-50 pt-2">
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

              {/* Tổng bệnh nhân */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng bệnh nhân</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/60">
                      <Users className="h-3 w-3 inline mr-0.5" />
                      Đã khám
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
                    {data.totalPatients.toLocaleString()} <span className="text-xs font-normal text-slate-400">bệnh nhân</span>
                  </h3>
                </div>
                <div className="mt-3 border-t border-slate-50 pt-2">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Tổng số bệnh nhân duy nhất đã hoàn thành khám với bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ VÙNG 2: XU HƯỚNG THEO KHOẢNG NGÀY ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Xu hướng hoạt động theo khoảng thời gian
              </span>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 transition-all min-h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 transition-all min-h-[36px]"
                  />
                </div>
                <button
                  onClick={resetFilter}
                  className="text-slate-600 hover:text-blue-600 text-xs font-semibold h-[36px] flex items-center justify-center gap-1.5 bg-slate-100/80 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all shadow-sm"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Đặt lại (7 ngày gần nhất)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Trạng thái lịch hẹn trong khoảng */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-violet-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lịch hẹn trong khoảng</h4>
                    </div>
                    <span className="text-sm font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md border border-violet-100/70">
                      {data.periodAppointments.total} lịch hẹn
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
                    {getAppointmentStatusGrid(data.periodAppointments).map((item, index) => {
                      const StatusIcon = item.icon;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 transition-all text-xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`p-1 rounded-md ${item.bgBox} shrink-0 flex items-center justify-center`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                            </div>
                            <span className="font-medium text-slate-600 truncate">{item.label}</span>
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

              {/* Biểu đồ xu hướng theo ngày */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100/70">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số lượng lịch hẹn theo ngày</h4>
                  </div>

                  {data.trend.length === 0 ? (
                    <p className="text-xs text-slate-400 py-12 text-center font-medium">Chưa có dữ liệu trong khoảng đã chọn.</p>
                  ) : (
                    <div className="flex items-end gap-2" style={{ height: "200px" }}>
                      {data.trend.map((t) => {
                        const CHART_HEIGHT = 160; // px — chiều cao tối đa cột, để chỗ cho label số/ngày
                        const totalPx = t.totalCount > 0
                          ? Math.max((t.totalCount / maxTrendValue) * CHART_HEIGHT, 6)
                          : 2;
                        const completedPx = t.totalCount
                          ? (t.completedCount / t.totalCount) * totalPx
                          : 0;

                        return (
                          <div key={t.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group">
                            {/* Số liệu hiện khi hover */}
                            <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.completedCount}/{t.totalCount}
                            </div>

                            {/* Bar — chiều cao tính bằng px tuyệt đối, không dùng % */}
                            <div
                              className="w-full rounded-md relative bg-blue-100 overflow-hidden"
                              style={{ height: `${totalPx}px` }}
                            >
                              <div
                                className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-md"
                                style={{ height: `${completedPx}px` }}
                              />
                            </div>

                            <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                              {new Date(t.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-50 text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-blue-100 border border-blue-200" />
                      Tổng lịch hẹn
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-emerald-500" />
                      Hoàn thành
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center text-slate-400 py-12 text-xs font-medium">Không tìm thấy dữ liệu phù hợp.</div>
      )}
    </div>
  );
}