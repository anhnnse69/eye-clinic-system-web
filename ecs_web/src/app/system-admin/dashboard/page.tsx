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
      return { text: tDashboard("systemWorkingWell"), color: "text-[#006c49]", barColor: "bg-[#00ae78]", badgeBg: "bg-[#6ffbbe]/30 text-[#003925] border-[#4edea3]/60" }
    } else if (percentage >= 50) {
      return { text: tDashboard("systemStable"), color: "text-amber-600", barColor: "bg-amber-500", badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80" }
    } else {
      return { text: tDashboard("lowPerformance"), color: "text-[#ba1a1a]", barColor: "bg-[#ba1a1a]", badgeBg: "bg-[#ffdad6]/60 text-[#93000a] border-[#ffdad6]" }
    }
  }
  const statusConfig = getClinicStatusLabel(clinicPercentage)

  // Mảng cấu trúc trạng thái lịch hẹn đồng bộ màu sắc chuẩn DESIGN.md kèm Icon lucide-react
  const getAppointmentStatusGrid = (data: AdminSystemDashboardResponse["appointments"]) => [
    { label: tDashboard("pending"), count: data.pending, bg: 'bg-amber-500', color: 'text-amber-700', iconColor: 'text-amber-600', bgBox: 'bg-amber-50', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/70', icon: HelpCircle },
    { label: tDashboard("depositPaid"), count: data.depositPaid, bg: 'bg-sky-500', color: 'text-sky-700', iconColor: 'text-sky-600', bgBox: 'bg-sky-50', badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/70', icon: AlertCircle },
    { label: tDashboard("booked"), count: data.booked, bg: 'bg-[#00a3e0]', color: 'text-[#00658d]', iconColor: 'text-[#00658d]', bgBox: 'bg-[#c6e7ff]/40', badgeBg: 'bg-[#c6e7ff]/40 text-[#00354b] border-[#81cfff]/60', icon: Calendar },
    { label: tDashboard("arrived"), count: data.arrived, bg: 'bg-[#00658d]', color: 'text-[#00658d]', iconColor: 'text-[#00658d]', bgBox: 'bg-[#c6e7ff]/30', badgeBg: 'bg-[#c6e7ff]/30 text-[#001e2d] border-[#81cfff]/60', icon: UserCheck },
    { label: tDashboard("inProgress"), count: data.inProgress, bg: 'bg-[#565e74]', color: 'text-[#565e74]', iconColor: 'text-[#565e74]', bgBox: 'bg-[#dae2fd]/50', badgeBg: 'bg-[#dae2fd]/50 text-[#131b2e] border-[#bec6e0]', icon: Activity },
    { label: tDashboard("completed"), count: data.completed, bg: 'bg-[#00ae78]', color: 'text-[#006c49]', iconColor: 'text-[#006c49]', bgBox: 'bg-[#6ffbbe]/25', badgeBg: 'bg-[#6ffbbe]/25 text-[#003925] border-[#4edea3]/60', icon: CheckCircle2 },
    { label: tDashboard("cancelled"), count: data.cancelled, bg: 'bg-[#ba1a1a]', color: 'text-[#93000a]', iconColor: 'text-[#ba1a1a]', bgBox: 'bg-[#ffdad6]/60', badgeBg: 'bg-[#ffdad6]/60 text-[#93000a] border-[#ffdad6]', icon: XCircle },
    { label: tDashboard("noShow"), count: data.noShow, bg: 'bg-[#6e7881]', color: 'text-[#3e4850]', iconColor: 'text-[#3e4850]', bgBox: 'bg-[#e0e3e5]/60', badgeBg: 'bg-[#e0e3e5]/60 text-[#191c1e] border-[#bdc8d1]', icon: Clock },
  ]

  return (
    <div className="space-y-5 w-full min-w-0 px-6 py-5 bg-background min-h-screen text-on-surface-variant font-sans antialiased">
      
      {/* HEADER TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 tracking-tight">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            {tDashboard("title")}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            onClick={fetchDashboardMetrics}
            disabled={loading}
            className="p-2 bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-3 bg-error-container/40 border border-error-container rounded-xl text-xs text-on-error-container flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-error" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
          <RefreshCw className="h-6 w-6 text-primary animate-spin mb-2" />
          <p className="text-xs text-on-surface-variant font-medium">{tDashboard("loading")}</p>
        </div>
      ) : dashboardData ? (
        <div className="space-y-6">
          
          {/* ================= VÙNG 1: CHỈ SỐ DỮ LIỆU TOÀN HỆ THỐNG ================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {tDashboard("systemIndicators")}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant bg-surface-container font-medium px-2 py-0.5 rounded-md border border-outline-variant/30">
                {tDashboard("macroIndicator")}
              </span>
            </div>

            {/* Grid 4 cột chứa các chỉ số cố định hệ thống */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* PHÒNG KHÁM VẬN HÀNH */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col justify-between min-h-[135px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("operationalClinics")}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 ${statusConfig.badgeBg}`}>
                      {tDashboard("percentage")} {clinicPercentage}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface tracking-tight">
                    {dashboardData.operationalClinics.active} <span className="text-xs font-normal text-on-surface-variant">/ {dashboardData.operationalClinics.total} {tDashboard("total")}</span>
                  </h3>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${statusConfig.barColor}`} style={{ width: `${clinicPercentage}%` }}></div>
                  </div>
                  <p className={`text-[10px] text-left font-medium ${statusConfig.color}`}>
                    {statusConfig.text}
                  </p>
                </div>
              </div>

              {/* HỒ SƠ BỆNH NHÂN GỐC */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col justify-between min-h-[135px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("patientRecords")}</span>
                    <span className="text-[10px] font-bold text-[#006c49] bg-[#6ffbbe]/20 px-2 py-0.5 rounded-md border border-[#4edea3]/50 shrink-0">
                      {tDashboard("systemScale")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface tracking-tight mt-1">
                    {dashboardData.registeredPatients.toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">{tDashboard("records")}</span>
                  </h3>
                </div>
                <div className="mt-3 border-t border-outline-variant/20 pt-2">
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                    {tDashboard("systemScaleDescription")}
                  </p>
                </div>
              </div>

              {/* ĐƠN ĐĂNG KÝ CHỜ DUYỆT */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs lg:col-span-2 flex flex-col justify-between min-h-[135px]">
                <div className="flex items-center justify-between mb-2 border-b border-outline-variant/20 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("pendingApplications")}</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200/60">
                    {dashboardData.pendingClinics.length} {tDashboard("newApplications")}
                  </span>
                </div>
                <div className="divide-y divide-outline-variant/20 max-h-[80px] overflow-y-auto pr-1 scrollbar-thin">
                  {dashboardData.pendingClinics.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-4 font-medium">{tDashboard("noApplications")}</p>
                  ) : (
                    dashboardData.pendingClinics.map((req) => (
                      <div key={req.id} className="flex items-center justify-between py-1.5 text-xs hover:bg-surface-container-low px-1 rounded transition-colors">
                        <div className="font-semibold text-on-surface truncate max-w-[200px]">{req.name}</div>
                        <div className="text-on-surface-variant text-[11px]">{tDashboard("representative")}: <span className="text-on-surface font-medium">{req.owner}</span></div>
                        <div className="text-on-surface-variant font-mono text-[10px]">{req.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ================= VÙNG 2: SỐ LIỆU KINH DOANH & NGHIỆP VỤ Y TẾ ================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {tDashboard("networkPerformance")}
                </span>
              </div>
              <span className="text-[10px] text-primary bg-[#c6e7ff]/30 font-medium px-2 py-0.5 rounded-md border border-[#81cfff]/40">
                {tDashboard("detailedDataAnalysis")}
              </span>
            </div>
            
            {/* THANH BỘ LỌC */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                
                {/* BỘ LỌC CHI NHÁNH */}
                <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("allClinics")}</label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface cursor-pointer flex items-center justify-between transition-all hover:bg-surface-container select-none min-h-[36px]"
                  >
                    <span className="truncate pr-2 font-medium">{selectedClinicName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-on-surface-variant transition-transform shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-[110%] left-0 w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl z-50 flex flex-col max-h-[300px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                      <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-on-surface-variant shrink-0 ml-1" />
                        <input
                          type="text"
                          placeholder={tCommon("search")}
                          value={clinicSearchTerm}
                          onChange={(e) => setClinicSearchTerm(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none border-none py-1 text-on-surface placeholder-on-surface-variant/60 font-medium"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto max-h-56 divide-y divide-outline-variant/20">
                        <div
                          onClick={() => {
                            setSelectedClinic("")
                            setSelectedClinicName(tDashboard("allClinics"))
                            setIsDropdownOpen(false)
                            setClinicSearchTerm("")
                          }}
                          className={`px-4 py-2.5 text-xs font-semibold cursor-pointer sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant/20 transition-colors ${!selectedClinic ? "bg-[#c6e7ff]/30 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                        >
                          {tDashboard("allClinics")}
                        </div>

                        {loadingClinics ? (
                          <div className="p-4 text-center text-xs text-on-surface-variant font-medium flex items-center justify-center gap-1.5">
                            <RefreshCw className="h-3 w-3 animate-spin text-primary" /> {tCommon("loading")}
                          </div>
                        ) : clinicsList.length === 0 ? (
                          <div className="p-4 text-center text-xs text-on-surface-variant font-medium">{tDashboard("noClinics")}</div>
                        ) : (
                          <div className="divide-y divide-outline-variant/20">
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
                                  className={`px-4 py-2.5 text-xs cursor-pointer transition-colors flex flex-col gap-0.5 ${selectedClinic === id ? "bg-[#c6e7ff]/30 text-primary font-bold" : "text-on-surface hover:bg-surface-container-low"}`}
                                >
                                  <span className="font-medium truncate">{name}</span>
                                  <span className="text-[9px] text-on-surface-variant font-mono">ID: {id.substring(0, 8)}...</span>
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
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("fromDate")}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all min-h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("toDate")}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all min-h-[36px]"
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
                  className="text-on-surface-variant hover:text-primary text-xs font-semibold h-[36px] flex items-center justify-center gap-1.5 bg-surface-container hover:bg-[#c6e7ff]/30 rounded-xl border border-transparent hover:border-[#81cfff]/40 transition-all shadow-xs cursor-pointer"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {tCommon("reset")}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* KHỐI TÀI KHOẢN NHÂN SỰ */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[70px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#c6e7ff]/40 text-primary rounded-xl shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{tDashboard("totalAccounts")}</p>
                    <h3 className="text-2xl font-bold text-on-surface mt-0.5 tracking-tight">{dashboardData.totalSystemAccounts.total} <span className="text-xs font-normal text-on-surface-variant">{tDashboard("totalStaff")}</span></h3>
                  </div>
                </div>
                <div className="flex items-center justify-start sm:justify-end text-[11px] text-on-surface-variant font-medium gap-x-2.5 flex-wrap max-w-full sm:max-w-[70%]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a3e0]"></span>
                    <span>{tDashboard("doctor")}: <strong className="text-on-surface font-semibold">{dashboardData.totalSystemAccounts.doctor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#565e74]"></span>
                    <span>{tDashboard("receptionist")}: <strong className="text-on-surface font-semibold">{dashboardData.totalSystemAccounts.receptionist}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ae78]"></span>
                    <span>{tDashboard("clinicAdmin")}: <strong className="text-on-surface font-semibold">{dashboardData.totalSystemAccounts.clinicAdmin}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                    <span>{tDashboard("systemAdmin")}: <strong className="text-on-surface font-semibold">{dashboardData.totalSystemAccounts.systemAdmin}</strong></span>
                  </div>
                </div>
              </div>

              {/* Hai khối "Tổng số lịch hẹn" và "Cơ cấu gói dịch vụ" nằm song song */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* PHẦN BÊN TRÁI: TỔNG SỐ LƯỢNG LỊCH HẸN KHÁM CÓ ICON TỪNG TRẠNG THÁI */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">{tDashboard("appointments")}</h4>
                      </div>
                      <span className="text-xs font-bold text-primary bg-[#c6e7ff]/30 px-2.5 py-0.5 rounded-md border border-[#81cfff]/50">
                        {dashboardData.appointments.total} {tDashboard("pending")}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {getAppointmentStatusGrid(dashboardData.appointments).map((item, index) => {
                        const StatusIcon = item.icon;
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/30 transition-all text-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              {/* Điểm tròn màu nhận diện */}
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.bg}`}></span>
                              
                              {/* Box chứa Icon đồng bộ thiết kế */}
                              <div className={`p-1 rounded-md ${item.bgBox} text-on-surface-variant shrink-0 flex items-center justify-center`}>
                                <StatusIcon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                              </div>
                              
                              <span className="font-medium text-on-surface-variant truncate">{item.label}</span>
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
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/20">
                      <Star className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">{tDashboard("topServices")}</h4>
                    </div>
                    
                    <div className="space-y-1 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {dashboardData.topServices.length === 0 ? (
                        <p className="text-xs text-on-surface-variant py-12 text-center font-medium">{tDashboard("noData") || tCommon("noData")}</p>
                      ) : (
                        dashboardData.topServices.map((service, index) => (
                          <div 
                            key={index} 
                            className="py-2.5 px-2 bg-transparent hover:bg-surface-container-low/80 rounded-xl flex items-center justify-between transition-all text-xs border-b border-outline-variant/20 last:border-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 max-w-[75%]">
                              <span className="text-xs font-bold text-on-surface-variant w-4 text-center shrink-0">
                                {index + 1}
                              </span>
                              <div className="truncate">
                                <div className="font-semibold text-on-surface truncate">{service.name}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-2.5">
                              <span className="font-bold text-on-surface font-mono">
                                {service.count} {tDashboard("cases")}
                              </span>
                              <span className="text-[10px] font-bold text-[#006c49] bg-[#6ffbbe]/25 px-1.5 py-0.5 rounded border border-[#4edea3]/50">
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
        <div className="text-center text-on-surface-variant py-12 text-xs font-medium">{tDashboard("noData")}</div>
      )}
    </div>
  )
}