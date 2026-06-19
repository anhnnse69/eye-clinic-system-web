"use client"

import { useState, useEffect } from "react"
import {
    Calendar, Clock, User, Search, RotateCcw, AlertTriangle,
    ChevronLeft, ChevronRight, Activity, Users, Landmark,
    UserCheck, CalendarX, UserX, X, CheckCircle2
} from "lucide-react"
import { receptionistService, DailyAppointmentItemResponse } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"
import { ApiResponse } from "@/types"

enum AppointmentStatus {
    PENDING = "PENDING",
    DEPOSIT_PAID = "DEPOSIT_PAID",
    BOOKED = "BOOKED",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NOSHOW = "NOSHOW"
}

// StatCard Component with enhanced hover and unique shadow
const StatCard = ({ icon, title, value, iconBgClass, iconColorClass, shadowColor }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    iconBgClass: string;
    iconColorClass: string;
    shadowColor: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 transition-all duration-300 ease-in-out cursor-pointer group`}
            style={{
                boxShadow: isHovered
                    ? `0 10px 15px -3px rgba(${shadowColor}, 0.2), 0 4px 6px -4px rgba(${shadowColor}, 0.1)`
                    : `0 4px 6px -1px rgba(${shadowColor}, 0.1), 0 2px 4px -2px rgba(${shadowColor}, 0.05)`,
                transform: isHovered ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`p-3 ${iconBgClass} ${iconColorClass} rounded-xl`}>{icon}</div>
            <div>
                <p className={`text-xs ${iconColorClass} font-bold group-hover:text-opacity-80 transition-colors`}>{title}</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{value}</p>
            </div>
        </div>
    );
};

export default function DailyAppointmentsPage() {
    const [targetDate, setTargetDate] = useState<string>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    });
    const [shiftFilter, setShiftFilter] = useState<string>("")
    const [searchPatient, setSearchPatient] = useState<string>("")
    const [searchDoctor, setSearchDoctor] = useState<string>("")

    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize] = useState<number>(5)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalRecords, setTotalRecords] = useState<number>(0)

    const [appointments, setAppointments] = useState<ApiResponse<DailyAppointmentItemResponse[] | null> | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedAppointment, setSelectedAppointment] = useState<DailyAppointmentItemResponse | null>(null)

    const fetchDailyAppointments = async () => {
        setIsLoading(true)
        setErrorMessage(null)
        try {
            const response = await receptionistService.getDailyAppointments({
                pageNumber: currentPage,
                pageSize: pageSize,
                targetDate: targetDate,
                shiftFilter: shiftFilter as any,
                searchPatient: searchPatient,
                searchDoctor: searchDoctor
            })

            if (response) {
                if ((response as any).data) {
                    setAppointments(response as any)
                } else {
                    setAppointments({
                        codeMessage: "SUCCESS",
                        data: response as any,
                        meta: (response as any).meta || undefined
                    })
                }

                const metaSource = (response as any).meta || response
                if (metaSource) {
                    setTotalPages(metaSource.totalPages || 1)
                    setTotalRecords(metaSource.total || 0)
                }

                if (selectedAppointment) {
                    const currentDataList = (response as any).data || (Array.isArray(response) ? response : [])
                    const updatedItem = currentDataList.find((a: any) => a.id === selectedAppointment.id)
                    if (updatedItem) {
                        setSelectedAppointment(updatedItem)
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching appointments:", error)
            setErrorMessage(handleApiError(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDailyAppointments()
    }, [currentPage, targetDate, shiftFilter, searchPatient, searchDoctor])

    const handleResetFilters = () => {
        const today = new Date().toISOString().split('T')[0]
        setTargetDate(today)
        setShiftFilter("")
        setSearchPatient("")
        setSearchDoctor("")
        setCurrentPage(1)
    }

    const handleArrived = async (id: string) => {
        try {
            await receptionistService.handleArrived(id)
            await fetchDailyAppointments()
        } catch (error) {
            alert("Lỗi tiếp đón: " + handleApiError(error))
        }
    }

    const handleNoShow = async (id: string) => {
        try {
            await receptionistService.handleNoShow(id)
            await fetchDailyAppointments()
        } catch (error) {
            alert("Lỗi báo vắng mặt: " + handleApiError(error))
        }
    }

    const handleCancel = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn khám này không?")) return
        try {
            await receptionistService.handleCancel(id)
            await fetchDailyAppointments()
        } catch (error) {
            alert("Lỗi hủy lịch: " + handleApiError(error))
        }
    }

    const formatVND = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }

    const currentList = appointments?.data || []
    const stats = {
        total: totalRecords,
        arrived: currentList.filter(x => x.status === AppointmentStatus.ARRIVED || x.status === AppointmentStatus.IN_PROGRESS).length,
        completed: currentList.filter(x => x.status === AppointmentStatus.COMPLETED).length,
        cancelled: currentList.filter(x => x.status === AppointmentStatus.CANCELLED).length
    }

    const canArrive = selectedAppointment ? [AppointmentStatus.BOOKED, AppointmentStatus.DEPOSIT_PAID, AppointmentStatus.PENDING].includes(selectedAppointment.status as AppointmentStatus) : false
    const canNoShow = selectedAppointment ? [AppointmentStatus.BOOKED, AppointmentStatus.DEPOSIT_PAID, AppointmentStatus.ARRIVED, AppointmentStatus.PENDING].includes(selectedAppointment.status as AppointmentStatus) : false
    const canCancel = selectedAppointment ? [AppointmentStatus.BOOKED, AppointmentStatus.DEPOSIT_PAID, AppointmentStatus.PENDING].includes(selectedAppointment.status as AppointmentStatus) : false

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/50 min-h-screen">

            {/* TIÊU ĐỀ TRANG */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-600 animate-pulse" />
                        Điều Phối Tiếp Đón Hàng Ngày
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Tra cứu, xác thực thông tin đóng tiền tạm ứng, đổi trạng thái và cấp số thứ tự vào hàng đợi phòng khám tự động.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                        Quầy Tiếp Đón Lễ Tân
                    </span>
                </div>
            </div>

            {/* DASHBOARD STATISTICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="h-5 w-5" />}
                    title="Tổng lịch hẹn trong ngày"
                    value={stats.total}
                    iconBgClass="bg-indigo-50"
                    iconColorClass="text-indigo-600"
                    shadowColor="79, 70, 229"
                />
                <StatCard
                    icon={<Activity className="h-5 w-5" />}
                    title="Đã đến & Đang khám"
                    value={stats.arrived}
                    iconBgClass="bg-emerald-50"
                    iconColorClass="text-emerald-600"
                    shadowColor="5, 150, 105"
                />
                <StatCard
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="Hoàn thành ca khám"
                    value={stats.completed}
                    iconBgClass="bg-sky-50"
                    iconColorClass="text-sky-600"
                    shadowColor="2, 132, 199"
                />
                <StatCard
                    icon={<AlertTriangle className="h-5 w-5" />}
                    title="Lịch bị hủy bỏ"
                    value={stats.cancelled}
                    iconBgClass="bg-rose-50"
                    iconColorClass="text-rose-600"
                    shadowColor="220, 38, 38"
                />
            </div>

            {/* THANH BỘ LỌC TÌM KIẾM - PREMIUM UI */}
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Ngày kiểm tra */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Ngày kiểm tra</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="date" value={targetDate} onChange={(e) => { setTargetDate(e.target.value); setCurrentPage(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 font-semibold text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

                {/* Ca làm việc */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Ca làm việc</label>
                    <div className="relative">
                        <select value={shiftFilter} onChange={(e) => { setShiftFilter(e.target.value); setCurrentPage(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl px-3 py-2.5 bg-slate-50 font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer">
                            <option value="">Tất cả các ca</option>
                            <option value="MORNING">☀️ Ca Sáng</option>
                            <option value="AFTERNOON">⛅ Ca Chiều</option>
                            <option value="EVENING">🌙 Ca Tối</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Tên/SĐT Bệnh nhân */}
                <div className="md:col-span-3 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Tên / Số điện thoại Bệnh nhân</label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="text" placeholder="Tìm họ tên, số điện thoại..." value={searchPatient} onChange={(e) => { setSearchPatient(e.target.value); setCurrentPage(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 font-medium placeholder-slate-400 text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

                {/* Tên Bác sĩ */}
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Bác sĩ phụ trách</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="text" placeholder="Tên bác sĩ..." value={searchDoctor} onChange={(e) => { setSearchDoctor(e.target.value); setCurrentPage(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 font-medium placeholder-slate-400 text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

                {/* Nút Reset */}
                <div className="md:col-span-3">
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="w-full bg-white text-slate-700 font-bold text-sm h-[42px] rounded-xl px-4 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap group"
                    >
                        <RotateCcw className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 group-hover:rotate-[-45deg] transition-all duration-300 shrink-0" />
                        <span>Xóa toàn bộ bộ lọc</span>
                    </button>
                </div>
            </div>

            {/* DANH SÁCH BẢNG LỊCH HẸN (ĐÃ MỞ RỘNG FULL WIDTH) */}
            <div className="w-full">
                {isLoading ? (
                    <div className="p-16 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu từ máy chủ...</p>
                    </div>
                ) : errorMessage ? (
                    <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold flex flex-col items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-rose-500" />
                        Lỗi kết nối API: {errorMessage}
                    </div>
                ) : currentList.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
                        <Calendar className="h-8 w-8 text-slate-300" />
                        Không tìm thấy lịch hẹn nào khớp với điều kiện lọc.
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4 w-[110px]">STT khám</th>
                                        <th className="p-4">Trạng thái hàng đợi</th>
                                        <th className="p-4">Hồ sơ bệnh nhân</th>
                                        <th className="p-4">Khung giờ</th>
                                        <th className="p-4">Bác sĩ khám</th>
                                        <th className="p-4">Phòng chức năng</th>
                                        <th className="p-4 text-center">Trạng thái hẹn</th>
                                        <th className="p-4 text-right">Khoản tạm ứng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {currentList.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedAppointment(item)}
                                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedAppointment?.id === item.id ? "bg-indigo-50/50" : ""}`}
                                        >
                                            <td className="p-4 font-black text-base text-indigo-600">
                                                {item.queue ? `#${item.queue.queueNumber.toString().padStart(2, '0')}` : "---"}
                                            </td>
                                            <td className="p-4">
                                                {item.queue ? (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${item.queue.status === "WAITING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                        item.queue.status === "CALLING" ? "bg-purple-50 text-purple-700 border border-purple-200 animate-pulse" :
                                                            "bg-slate-100 text-slate-600 border border-slate-200"
                                                        }`}>
                                                        {item.queue.status === "WAITING" ? "Chờ khám" :
                                                            item.queue.status === "CALLING" ? "Đang gọi" : "Đã khám"}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Chưa vào hàng đợi</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">{item.patient.fullName}</p>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">{item.patient.phoneNumber || "Chưa cấp SĐT"}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {item.slot.startTime.split('T')[1]?.substring(0, 5) || "00:00"} - {item.slot.endTime.split('T')[1]?.substring(0, 5) || "00:00"}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800">{item.doctor.fullName}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                    {item.doctor.clinicRoomName}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase ${item.status === AppointmentStatus.COMPLETED ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                                    item.status === AppointmentStatus.ARRIVED || item.status === AppointmentStatus.IN_PROGRESS ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                                        item.status === AppointmentStatus.CANCELLED ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                                            item.status === AppointmentStatus.NOSHOW ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                                                "bg-slate-100 text-slate-700 border border-slate-200"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="font-bold text-slate-900">{formatVND(item.depositAmount)}</p>
                                                <p className={`text-[11px] font-black uppercase mt-0.5 ${item.depositPaid ? "text-emerald-600" : "text-rose-500"}`}>
                                                    {item.depositPaid ? "✓ Đã thu" : "✗ Chưa thu"}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ĐIỀU KHIỂN PHÂN TRANG */}
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                Trang {currentPage} / {totalPages} (Tổng số {totalRecords} kết quả)
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[32px] h-8 text-xs font-black rounded-xl border ${currentPage === page ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 border border-slate-200 rounded-xl bg-white disabled:opacity-40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL OVERLAY - THÔNG TIN TIẾP ĐÓN CHI TIẾT (BẢN ROW-GRID ĐỐI XỨNG HIGH-END) */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-left space-y-0 animate-scale-in">

                        {/* MODAL HEADER */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                                    THÔNG TIN TIẾP ĐÓN CHI TIẾT
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* MODAL BODY - SẮP XẾP NGANG HÀNG THEO CẶP */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">

                            {/* HÀNG 1: HÀNH CHÍNH BỆNH NHÂN NGANG HÀNG THÔNG TIN CHỈ ĐỊNH KHÁM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* KHỐI: HÀNH CHÍNH BỆNH NHÂN */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <User className="h-3.5 w-3.5 text-indigo-500" /> Hành chính bệnh nhân
                                    </h4>
                                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2.5 text-xs shadow-sm flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Họ và tên:</span><span className="font-bold text-slate-900 text-sm">{selectedAppointment.patient.fullName}</span></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Giới tính:</span>
                                            <span className={`font-bold px-2.5 py-0.5 rounded-md text-xs uppercase ${selectedAppointment.patient.gender?.toUpperCase() === "MALE" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                                    selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ? "bg-pink-50 text-pink-700 border border-pink-100" :
                                                        "bg-slate-100 text-slate-700 border border-slate-200"
                                                }`}>
                                                {selectedAppointment.patient.gender?.toUpperCase() === "MALE" ? "Nam" :
                                                    selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ? "Nữ" : "Khác"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Ngày sinh:</span><span className="font-bold text-slate-800">{selectedAppointment.patient.dob}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Số điện thoại:</span><span className="font-bold text-indigo-600 select-all">{selectedAppointment.patient.phoneNumber || "Chưa cập nhật"}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Mã số BHYT:</span><span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{selectedAppointment.patient.bhytNumber || "Không đăng ký"}</span></div>
                                    </div>
                                </div>

                                {/* KHỐI: THÔNG TIN CHỈ ĐỊNH KHÁM */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Thông tin chỉ định khám
                                    </h4>
                                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2.5 text-xs shadow-sm flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Bác sĩ khám:</span><span className="font-bold text-slate-800">{selectedAppointment.doctor.fullName}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Phòng khám:</span><span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{selectedAppointment.doctor.clinicRoomName}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400">Giờ hẹn khám:</span><span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{selectedAppointment.slot.startTime.split('T')[1]?.substring(0, 5) || "00:00"} - {selectedAppointment.slot.endTime.split('T')[1]?.substring(0, 5) || "00:00"}</span></div>
                                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                                            <span className="text-slate-400 font-medium">Triệu chứng lâm sàng:</span>
                                            <p className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] text-slate-600 italic line-clamp-2">
                                                "{selectedAppointment.symptoms || "Không có ghi chú triệu chứng đặc biệt."}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* HÀNG 2: TIẾN ĐỘ ĐIỀU PHỐI NGANG HÀNG NGHĨA VỤ TÀI CHÍNH */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* KHỐI: TIẾN ĐỘ ĐIỀU PHỐI */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <Clock className="h-3.5 w-3.5 text-indigo-500" /> Tiến độ điều phối
                                    </h4>
                                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-xs shadow-sm flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Trạng thái lịch hẹn:</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${selectedAppointment.status === AppointmentStatus.COMPLETED ? "bg-emerald-100 text-emerald-800" :
                                                selectedAppointment.status === AppointmentStatus.ARRIVED || selectedAppointment.status === AppointmentStatus.IN_PROGRESS ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                                                    selectedAppointment.status === AppointmentStatus.CANCELLED ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                                                }`}>
                                                {selectedAppointment.status}
                                            </span>
                                        </div>

                                        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-slate-400">Số thứ tự / Hàng đợi:</span>
                                            {selectedAppointment.queue ? (
                                                <span className="text-lg font-black text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                                    #{selectedAppointment.queue.queueNumber.toString().padStart(2, '0')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Chưa cấp số vào hàng đợi</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* KHỐI: NGHĨA VỤ TÀI CHÍNH TẠI QUẦY */}
                                <div className="space-y-2 flex flex-col">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                        <Landmark className="h-3.5 w-3.5 text-indigo-500" /> Nghĩa vụ tài chính tại quầy
                                    </h4>
                                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 text-xs shadow-sm flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Khoản tiền tạm ứng yêu cầu:</span>
                                            <span className="text-sm font-black text-slate-900">{formatVND(selectedAppointment.depositAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                                            <span className="text-slate-400">Trạng thái xác thực:</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${selectedAppointment.depositPaid
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                                }`}>
                                                {selectedAppointment.depositPaid ? "✓ Đã thu quỹ thành công" : "✗ Chưa đóng tạm ứng"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ALERTS CẢNH BÁO TIẾP ĐÓN */}
                            {!selectedAppointment.depositPaid && [AppointmentStatus.PENDING, AppointmentStatus.BOOKED].includes(selectedAppointment.status as AppointmentStatus) && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-medium text-rose-700 flex gap-2 items-center shadow-sm">
                                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span><strong>Lưu ý lễ tân:</strong> Cần thực hiện thu phí tạm ứng tại quầy trước khi chuyển trạng thái sang tiếp tiếp nhận thành công.</span>
                                </div>
                            )}
                        </div>

                        {/* MODAL ACTIONS FOOTER - CHUẨN UX LUỒNG THAO TÁC TỪ TRÁI QUA PHẢI */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            {/* Nhóm hành động phụ (Bên trái) */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => handleNoShow(selectedAppointment.id)}
                                    disabled={!canNoShow}
                                    className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${canNoShow ? 'bg-white text-amber-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300 active:scale-[0.98]' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'}`}
                                >
                                    <UserX className="h-4 w-4" />
                                    Báo vắng mặt
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCancel(selectedAppointment.id)}
                                    disabled={!canCancel}
                                    className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${canCancel ? 'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'}`}
                                >
                                    <CalendarX className="h-4 w-4" />
                                    Hủy lịch hẹn
                                </button>
                            </div>

                            {/* Nhóm hành động chính (Bên phải quyết định tiến trình) */}
                            <button
                                type="button"
                                onClick={() => handleArrived(selectedAppointment.id)}
                                disabled={!canArrive}
                                className={`w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${canArrive ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                <UserCheck className="h-4 w-4" />
                                Xác nhận đã đến quầy & Cấp số khám
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}