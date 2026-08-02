"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  LayoutDashboard, Building2, Users, Calendar,
  Filter, RotateCw, UserCheck, RefreshCw,
  Star, ClipboardList, ShieldAlert, Search, ChevronDown,
  HelpCircle, AlertCircle, Activity, CheckCircle2, XCircle, Clock, Globe
} from "lucide-react"
import { systemAdminDashboardService } from "@/services/system-admin.dashboard.service"
import { clinicsService } from "@/services/clinic.service"
import { handleApiError } from "@/lib/axios"
import type { AdminSystemDashboardResponse, ClinicManagementItem } from "@/types"

export default function SystemDashboardPage() {
  const t = useTranslations("systemAdmin")
  const tDashboard = useTranslations("systemAdmin.dashboard")
  const tCommon = useTranslations("systemAdmin.common")
  const tAccounts = useTranslations("systemAdmin.accounts")
  const router = useRouter()
  
  // States bộ lọc chính của Dashboard
  const [selectedClinic, setSelectedClinic] = useState<string>("")
  const [selectedClinicName, setSelectedClinicName] = useState<string>(tDashboard("allClinics"))
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  
  // States quản lý dữ liệu và loading của Dashboard
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<AdminSystemDashboardResponse | null>(null)
  
  // --- STATES PHỤC VỤ COMBOBOX SEARCH CLINICS ---
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [clinicSearchTerm, setClinicSearchTerm] = useState<string>("")
  const [debouncedClinicSearch, setDebouncedClinicSearch] = useState<string>("")
  const [clinicsList, setClinicsList] = useState<ClinicManagementItem[]>([])
  const [loadingClinics, setLoadingClinics] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 1. Debounce ô tìm kiếm phòng khám trong dropdown (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedClinicSearch(clinicSearchTerm)
    }, 400)
    return () => clearTimeout(handler)
  }, [clinicSearchTerm])

  // 2. Click ra ngoài để đóng dropdown tìm kiếm phòng khám
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 3. Gọi API lấy danh sách phòng khám khi người dùng gõ từ khóa tìm kiếm
  useEffect(() => {
    const fetchClinicsDropdown = async () => {
      try {
        setLoadingClinics(true)
        const response = await clinicsService.getClinics({
          searchTerm: debouncedClinicSearch || undefined,
          status: "ACTIVE", 
          pageNumber: 1,
          pageSize: 50 
        })
        
        if (response.data) {
          const actives = response.data.filter(c => (c.status || "").toUpperCase() === "ACTIVE")
          setClinicsList(actives)
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách phòng khám:", err)
      } finally {
        setLoadingClinics(false)
      }
    }

    if (isDropdownOpen) {
      fetchClinicsDropdown()
    }
  }, [debouncedClinicSearch, isDropdownOpen])

  // 4. Lấy dữ liệu các chỉ số số liệu thống kê Dashboard chính
  const fetchDashboardMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await systemAdminDashboardService.getSystemDashboard({
        clinicId: selectedClinic || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      })

      if (response.data) {
        setDashboardData(response.data)
      } else {
        setError(tDashboard("noData"))
      }
    } catch (err: unknown) {
      const msgCode = handleApiError(err)
      setError(`${t("errors.connectionError")} (${msgCode}). ${t("errors.permissionError")}`)
    } finally {
      setLoading(false)
    }
  }

  // Tự động tải lại số liệu Dashboard khi bất kỳ bộ lọc nào thay đổi
  useEffect(() => {
    fetchDashboardMetrics()
  }, [selectedClinic, startDate, endDate])

  // Tính tỷ lệ % phòng khám vận hành
  const clinicPercentage = dashboardData?.operationalClinics?.total
    ? Math.round((dashboardData.operationalClinics.active / dashboardData.operationalClinics.total) * 100)
    : 0

  // Hàm trả về Label trạng thái động dựa theo hiệu suất % thực tế
  const getClinicStatusLabel = (percentage: number) => {
    if (percentage >= 80) {
      return { text: tDashboard("systemWorkingWell"), color: "text-emerald-500", barColor: "bg-emerald-500", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100" }
    } else if (percentage >= 50) {
      return { text: tDashboard("systemStable"), color: "text-amber-500", barColor: "bg-amber-500", badgeBg: "bg-amber-50 text-amber-700 border-amber-100" }
    } else {
      return { text: tDashboard("lowPerformance"), color: "text-rose-500", barColor: "bg-rose-500", badgeBg: "bg-rose-50 text-rose-700 border-rose-100" }
    }
  }
  const statusConfig = getClinicStatusLabel(clinicPercentage)

  // Mảng cấu trúc trạng thái lịch hẹn đồng bộ màu sắc nhẹ sang trọng kèm Icon động
  const getAppointmentStatusGrid = (data: AdminSystemDashboardResponse["appointments"]) => [
    { label: tDashboard("pending"), count: data.pending, bg: 'bg-amber-500', color: 'text-amber-500', iconColor: 'text-amber-600', bgBox: 'bg-amber-50/60', badgeBg: 'bg-amber-50 text-amber-700 border-amber-100', icon: HelpCircle },
    { label: tDashboard("depositPaid"), count: data.depositPaid, bg: 'bg-cyan-500', color: 'text-cyan-500', iconColor: 'text-cyan-600', bgBox: 'bg-cyan-50/60', badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: AlertCircle },
    { label: tDashboard("booked"), count: data.booked, bg: 'bg-blue-500', color: 'text-blue-500', iconColor: 'text-blue-600', bgBox: 'bg-blue-50/60', badgeBg: 'bg-blue-50 text-blue-700 border-blue-100', icon: Calendar },
    { label: tDashboard("arrived"), count: data.arrived, bg: 'bg-indigo-500', color: 'text-indigo-500', iconColor: 'text-indigo-600', bgBox: 'bg-indigo-50/60', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: UserCheck },
    { label: tDashboard("inProgress"), count: data.inProgress, bg: 'bg-purple-500', color: 'text-purple-500', iconColor: 'text-purple-600', bgBox: 'bg-purple-50/60', badgeBg: 'bg-purple-50 text-purple-700 border-purple-100', icon: Activity },
    { label: tDashboard("completed"), count: data.completed, bg: 'bg-emerald-500', color: 'text-emerald-500', iconColor: 'text-emerald-600', bgBox: 'bg-emerald-50/60', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    { label: tDashboard("cancelled"), count: data.cancelled, bg: 'bg-rose-500', color: 'text-rose-500', iconColor: 'text-rose-600', bgBox: 'bg-rose-50/60', badgeBg: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
    { label: tDashboard("noShow"), count: data.noShow, bg: 'bg-slate-400', color: 'text-slate-400', iconColor: 'text-slate-500', bgBox: 'bg-slate-100/60', badgeBg: 'bg-slate-50 text-slate-700 border-slate-200', icon: Clock },
  ]

  return (
    <div className="space-y-5 w-full min-w-0 px-6 py-5 bg-[#f8fafc] min-h-screen text-slate-600 font-sans antialiased">
      
      {/* HEADER TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            {tDashboard("title")}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            onClick={fetchDashboardMetrics}
            disabled={loading}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mb-2" />
          <p className="text-xs text-slate-400 font-medium">{tDashboard("loading")}</p>
        </div>
      ) : dashboardData ? (
        <div className="space-y-6">
          
          {/* ================= VÙNG 1: CHỈ SỐ DỮ LIỆU TOÀN HỆ THỐNG ================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {tDashboard("systemIndicators")}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-100 font-medium px-2 py-0.5 rounded-md border border-slate-200/40">
                {tDashboard("macroIndicator")}
              </span>
            </div>

            {/* Grid 4 cột chứa các chỉ số cố định hệ thống */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* PHÒNG KHÁM VẬN HÀNH */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[135px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("operationalClinics")}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${statusConfig.badgeBg}`}>
                      {tDashboard("percentage")} {clinicPercentage}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {dashboardData.operationalClinics.active} <span className="text-xs font-normal text-slate-400">/ {dashboardData.operationalClinics.total} {tDashboard("total")}</span>
                  </h3>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${statusConfig.barColor}`} style={{ width: `${clinicPercentage}%` }}></div>
                  </div>
                  <p className={`text-[10px] text-left font-medium ${statusConfig.color}`}>
                    {statusConfig.text}
                  </p>
                </div>
              </div>

              {/* HỒ SƠ BỆNH NHÂN GỐC */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("patientRecords")}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/60 shrink-0">
                      {tDashboard("systemScale")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
                    {dashboardData.registeredPatients.toLocaleString()} <span className="text-xs font-normal text-slate-400">{tDashboard("records")}</span>
                  </h3>
                </div>
                <div className="mt-3 border-t border-slate-50 pt-2">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    {tDashboard("systemScaleDescription")}
                  </p>
                </div>
              </div>

              {/* ĐƠN ĐĂNG KÝ CHỜ DUYỆT */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] lg:col-span-2 flex flex-col justify-between min-h-[135px]">
                <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("pendingApplications")}</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-100/60">
                    {dashboardData.pendingClinics.length} {tDashboard("newApplications")}
                  </span>
                </div>
                <div className="divide-y divide-slate-100/60 max-h-[80px] overflow-y-auto pr-1 scrollbar-thin">
                  {dashboardData.pendingClinics.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 font-medium">{tDashboard("noApplications")}</p>
                  ) : (
                    dashboardData.pendingClinics.map((req) => (
                      <div key={req.id} className="flex items-center justify-between py-1.5 text-xs hover:bg-slate-50/60 px-1 rounded transition-colors">
                        <div className="font-semibold text-slate-700 truncate max-w-[200px]">{req.name}</div>
                        <div className="text-slate-400 text-[11px]">{tDashboard("representative")}: <span className="text-slate-600 font-medium">{req.owner}</span></div>
                        <div className="text-slate-400 font-mono text-[10px]">{req.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ================= VÙNG 2: SỐ LIỆU KINH DOANH & NGHIỆP VỤ Y TẾ ================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {tDashboard("networkPerformance")}
                </span>
              </div>
              <span className="text-[10px] text-blue-500 bg-blue-50 font-medium px-2 py-0.5 rounded-md border border-blue-100/40">
                {tDashboard("detailedDataAnalysis")}
              </span>
            </div>
            
            {/* THANH BỘ LỌC ĐÃ DI CHUYỂN XUỐNG ĐÂY */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                
                {/* BỘ LỌC CHI NHÁNH */}
                <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("allClinics")}</label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 cursor-pointer flex items-center justify-between transition-all hover:bg-slate-100/50 select-none min-h-[36px]"
                  >
                    <span className="truncate pr-2 font-medium">{selectedClinicName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-200/70 rounded-xl shadow-xl z-50 flex flex-col max-h-[300px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
                        <input
                          type="text"
                          placeholder={tCommon("search")}
                          value={clinicSearchTerm}
                          onChange={(e) => setClinicSearchTerm(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none border-none py-1 text-slate-700 placeholder-slate-400 font-medium"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto max-h-56 divide-y divide-slate-50">
                        <div
                          onClick={() => {
                            setSelectedClinic("")
                            setSelectedClinicName(tDashboard("allClinics"))
                            setIsDropdownOpen(false)
                            setClinicSearchTerm("")
                          }}
                          className={`px-4 py-2.5 text-xs font-semibold cursor-pointer sticky top-0 bg-white z-10 border-b border-slate-100 transition-colors ${!selectedClinic ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          {tDashboard("allClinics")}
                        </div>

                        {loadingClinics ? (
                          <div className="p-4 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                            <RefreshCw className="h-3 w-3 animate-spin text-blue-500" /> {tCommon("loading")}
                          </div>
                        ) : clinicsList.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 font-medium">{tDashboard("noClinics")}</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {clinicsList.map((c) => {
                              const id = c.id_clinic
                              const name = c.clinicName
                              return (
                                <div
                                  key={id}
                                  onClick={() => {
                                    setSelectedClinic(id)
                                    setSelectedClinicName(name)
                                    setIsDropdownOpen(false)
                                    setClinicSearchTerm("") 
                                  }}
                                  className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex flex-col gap-0.5 ${selectedClinic === id ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                                >
                                  <span className="font-medium truncate">{name}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">ID: {id.substring(0, 8)}...</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* BỘ LỌC THỜI GIAN */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("fromDate")}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 transition-all min-h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("toDate")}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 transition-all min-h-[36px]"
                  />
                </div>
                <button
                  onClick={() => { 
                    setSelectedClinic("")
                    setSelectedClinicName(tDashboard("allClinics"))
                    setStartDate("")
                    setEndDate("")
                    setClinicSearchTerm("")
                  }}
                  className="text-slate-600 hover:text-blue-600 text-xs font-semibold h-[36px] flex items-center justify-center gap-1.5 bg-slate-100/80 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all shadow-sm"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {tCommon("reset")}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* KHỐI TÀI KHOẢN NHÂN SỰ CHUYỂN THÀNH CHIẾM TRỌN HÀNG NGANG */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[70px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tDashboard("totalAccounts")}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-0.5 tracking-tight">{dashboardData.totalSystemAccounts.total} <span className="text-xs font-normal text-slate-400">{tDashboard("totalStaff")}</span></h3>
                  </div>
                </div>
                <div className="flex items-center justify-start sm:justify-end text-[11px] text-slate-500 font-medium gap-x-2.5 flex-wrap max-w-full sm:max-w-[70%]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>{tDashboard("doctor")}: <strong className="text-slate-700 font-semibold">{dashboardData.totalSystemAccounts.doctor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    <span>{tDashboard("receptionist")}: <strong className="text-slate-700 font-semibold">{dashboardData.totalSystemAccounts.receptionist}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{tDashboard("clinicAdmin")}: <strong className="text-slate-700 font-semibold">{dashboardData.totalSystemAccounts.clinicAdmin}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>{tDashboard("systemAdmin")}: <strong className="text-slate-700 font-semibold">{dashboardData.totalSystemAccounts.systemAdmin}</strong></span>
                  </div>
                </div>
              </div>

              {/* Hai khối "Tổng số lịch hẹn" và "Cơ cấu gói dịch vụ" nằm song song */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* PHẦN BÊN TRÁI: TỔNG SỐ LƯỢNG LỊCH HẸN KHÁM CÓ ICON TỪNG TRẠNG THÁI */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-500" />
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tDashboard("appointments")}</h4>
                      </div>
                      <span className="text-sm font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md border border-violet-100/70">
                        {dashboardData.appointments.total} {tDashboard("pending")}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {getAppointmentStatusGrid(dashboardData.appointments).map((item, index) => {
                        const StatusIcon = item.icon;
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 transition-all text-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {/* Điểm tròn màu nhận diện */}
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.bg}`}></span>
                              
                              {/* Box chứa Icon đồng bộ thiết kế */}
                              <div className={`p-1 rounded-md ${item.bgBox} text-slate-500 shrink-0 flex items-center justify-center`}>
                                <StatusIcon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                              </div>
                              
                              <span className="font-medium text-slate-600 truncate">{item.label}</span>
                            </div>
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] border min-w-[32px] text-center ${item.badgeBg}`}>
                              {item.count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* PHẦN BÊN PHẢI: CƠ CẤU GÓI DỊCH VỤ Y TẾ PHỔ BIẾN NHẤT */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100/70">
                      <Star className="h-4 w-4 text-blue-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{tDashboard("topServices")}</h4>
                    </div>
                    
                    <div className="space-y-1 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {dashboardData.topServices.length === 0 ? (
                        <p className="text-xs text-slate-400 py-12 text-center font-medium">{tDashboard("noData") || tCommon("noData")}</p>
                      ) : (
                        dashboardData.topServices.map((service, index) => (
                          <div 
                            key={index} 
                            className="py-2.5 px-2 bg-transparent hover:bg-slate-50/80 rounded-xl flex items-center justify-between transition-all text-xs border-b border-slate-100/50 last:border-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 max-w-[75%]">
                              <span className="text-xs font-bold text-slate-400 w-4 text-center shrink-0">
                                {index + 1}
                              </span>
                              <div className="truncate">
                                <div className="font-semibold text-slate-700 truncate">{service.name}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-2.5">
                              <span className="font-bold text-slate-700 font-mono">
                                {service.count} {tDashboard("cases")}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {service.growth}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center text-slate-400 py-12 text-xs font-medium">{tDashboard("noData")}</div>
      )}
    </div>
  )
}