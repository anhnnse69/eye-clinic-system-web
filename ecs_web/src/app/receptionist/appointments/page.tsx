"use client"

import { useState, useEffect } from "react"
import {
    Calendar, Clock, User, Search, RotateCcw, AlertTriangle,
    ChevronLeft, ChevronRight, Activity, Users, Landmark,
    UserCheck, CalendarX, UserX, X, CheckCircle2
} from "lucide-react"
import { receptionistService, DailyAppointmentItemResponse } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"

enum AppointmentStatus {
    PENDING = "PENDING",
    DEPOSIT_PAID = "DEPOSIT_PAID",
    CONFIRMED = "CONFIRMED",
    BOOKED = "BOOKED",
    ARRIVED = "ARRIVED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NOSHOW = "NOSHOW"
}

const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const StatCard = ({ icon, title, value, iconBgClass, iconColorClass, shadowColor }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    iconBgClass: string;
    iconColorClass: string;
    shadowColor: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const colorMap: Record<string, string> = {
        'text-indigo-600': '#4f46e5',
        'text-emerald-600': '#10b981',
        'text-sky-600': '#0ea5e9',
        'text-rose-600': '#f43f5e'
    };
    const activeColor = colorMap[iconColorClass] || '#94a3b8';

    return (
        <div
            className="p-5 bg-white border border-slate-100 rounded-3xl transition-all duration-300 relative overflow-hidden"
            style={{
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered
                    ? `0 20px 25px -5px rgba(${shadowColor}, 0.15), 0 8px 10px -6px rgba(${shadowColor}, 0.15)`
                    : '0 4px 6px -1px rgb(0 0 0 / 0.02)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${iconBgClass} ${iconColorClass} transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                    {icon}
                </div>
            </div>

            {/* THANH CHẠY DƯỚI ĐÁY CARD */}
            <div className={`absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-3xl bg-slate-100 transition-all duration-300 ${isHovered ? 'h-[6px]' : 'h-[4px]'}`}>
                <div
                    className="h-full rounded-r-full transition-all duration-500"
                    style={{
                        width: isHovered ? '100%' : '16%',
                        backgroundColor: activeColor,
                        filter: isHovered ? `drop-shadow(0 0 4px ${activeColor})` : 'none',
                        opacity: isHovered ? 1 : 0.75
                    }}
                />
            </div>
        </div>
    );
};

export default function ReceptionistDailyAppointmentsPage() {
    const [appointments, setAppointments] = useState<DailyAppointmentItemResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    const [targetDate, setTargetDate] = useState(() => new Date().toLocaleDateString("fr-CA"))
    const [shiftFilter, setShiftFilter] = useState<"MORNING" | "AFTERNOON" | "EVENING" | "">("")
    const [searchPatient, setSearchPatient] = useState("")
    const [searchDoctor, setSearchDoctor] = useState("")

    const [selectedAppointment, setSelectedAppointment] = useState<DailyAppointmentItemResponse | null>(null)
    const [stats, setStats] = useState({ total: 0, arrived: 0, completed: 0, cancelled: 0 })

    const fetchDailyAppointments = async () => {
        try {
            setIsLoading(true)
            const response = await receptionistService.getDailyAppointments({
                pageNumber,
                pageSize,
                targetDate: targetDate || undefined,
                shiftFilter: shiftFilter || undefined,
                searchPatient: searchPatient || undefined,
                searchDoctor: searchDoctor || undefined
            })

            if (response.codeMessage === "APP_MESSAGE_2000" && response.data) {
                setAppointments(response.data)
                if (response.meta) setTotalItems(response.meta.total)
                calculateStats(response.data)
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách lịch hẹn:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const calculateStats = (list: DailyAppointmentItemResponse[]) => {
        const counters = { total: list.length, arrived: 0, completed: 0, cancelled: 0 }
        list.forEach(item => {
            if (item.status === "ARRIVED" || item.status === "IN_PROGRESS") counters.arrived++
            else if (item.status === "COMPLETED") counters.completed++
            else if (item.status === "CANCELLED" || item.status === "NOSHOW") counters.cancelled++
        })
        setStats(counters)
    }

    useEffect(() => {
        fetchDailyAppointments()
    }, [pageNumber, targetDate, shiftFilter, searchPatient, searchDoctor])

    const handleResetFilters = () => {
        setTargetDate(new Date().toLocaleDateString("fr-CA"))
        setShiftFilter("")
        setSearchPatient("")
        setSearchDoctor("")
        setPageNumber(1)
    }

    // ======================== TÁC VỤ XỬ LÝ API ========================
    const handlePayDeposit = async (appointmentId: string) => {
        const isConfirmed = window.confirm("Xác nhận đã thu tiền cọc của bệnh nhân trực tiếp tại quầy?");
        if (!isConfirmed) return;

        try {
            setIsActionLoading(true)
            const response = await receptionistService.payDepositAtCounter({ appointmentId })

            if (response.codeMessage === "APP_MESSAGE_2000") {
                alert("Đã ghi nhận thu tiền cọc tại quầy thành công!")
                setSelectedAppointment(prev => prev ? { ...prev, depositPaid: true } : null)
                fetchDailyAppointments()
            }
        } catch (error) {
            alert("Không thể ghi nhận đóng cọc: " + handleApiError(error))
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleArrived = async (appointmentId: string) => {
        const isConfirmed = window.confirm("Xác nhận bệnh nhân này đã đến quầy và tiến hành cấp số thứ tự khám?");
        if (!isConfirmed) return;

        try {
            setIsActionLoading(true)
            const response = await receptionistService.handleArrived({ appointmentId })
            if (response.codeMessage === "APP_MESSAGE_2000" && response.data) {
                const checkInResult = response.data
                alert("Tiếp đón check-in thành công! Số thứ tự hàng đợi đã được cấp.")
                setSelectedAppointment(prev => prev ? {
                    ...prev,
                    status: checkInResult.status as any,
                    queue: checkInResult.queue
                } : null)
                fetchDailyAppointments()
            }
        } catch (error) {
            alert("Tiếp đón thất bại: " + handleApiError(error))
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleCancel = async (id: string) => {
        const isConfirmed = window.confirm(
            "Lưu ý: Lịch hẹn sau khi hủy sẽ không được hoàn lại chi phí (nếu có).\nBạn có chắc chắn muốn tiếp tục hủy lịch hẹn này không?"
        );
        if (!isConfirmed) return;
        const reason = window.prompt("Nhập lý do hủy lịch hẹn khám này (bắt buộc):");
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Bạn phải nhập lý do hủy lịch hẹn!");
            return;
        }
        try {
            setIsActionLoading(true)
            const response = await receptionistService.handleCancel({
                appointmentId: id,
                noteReason: reason.trim()
            })
            if (response.codeMessage === "APP_MESSAGE_2000") {
                alert("Đã hủy lịch hẹn thành công.")
                setSelectedAppointment(prev => prev ? { ...prev, status: "CANCELLED" } : null)
                fetchDailyAppointments()
            } else {
                alert(`Không thể hủy lịch: ${response.codeMessage}`)
            }
        } catch (error) {
            alert("Lỗi hủy lịch hẹn: " + handleApiError(error))
        } finally {
            setIsActionLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Chờ duyệt cọc</span>
            case "DEPOSIT_PAID":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">Đã đóng cọc</span>
            case "CONFIRMED":
            case "BOOKED":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">Sẵn sàng khám</span>
            case "ARRIVED":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Đã đến quầy</span>
            case "IN_PROGRESS":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">Đang khám</span>
            case "COMPLETED":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">Hoàn thành</span>
            case "CANCELLED":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">Đã hủy</span>
            case "NOSHOW":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Vắng mặt</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600">{status}</span>
        }
    }

    const appointmentDateStr = selectedAppointment?.appointmentDate
    const todayStr = new Date().toLocaleDateString("fr-CA")
    const isToday = appointmentDateStr === todayStr

    const canPayDeposit = selectedAppointment && isToday && !selectedAppointment.depositPaid && ["PENDING", "CONFIRMED", "BOOKED"].includes(selectedAppointment.status)
    const canArrive = selectedAppointment && isToday && selectedAppointment.depositPaid && ["CONFIRMED", "BOOKED", "NOSHOW"].includes(selectedAppointment.status)
    const canCancel =
        selectedAppointment &&
        appointmentDateStr &&
        appointmentDateStr >= todayStr &&
        ["PENDING", "DEPOSIT_PAID", "CONFIRMED", "BOOKED"].includes(
            selectedAppointment.status
        )

    const totalPages = Math.ceil(totalItems / pageSize)

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">

            {/* Tiêu đề chính */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-600" />
                        Quản lý Tiếp Đón & Lịch Hẹn Hàng Ngày
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        Tra cứu lịch hẹn khám, hỗ trợ thu tiền cọc trực tiếp tại quầy tiếp đón và điều phối check-in sinh số thứ tự hàng đợi khám bệnh.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchDailyAppointments}
                    className="w-full sm:w-auto bg-white text-indigo-700 font-bold text-xs h-[40px] rounded-xl px-4 border border-indigo-100 shadow-sm shadow-indigo-100/50 hover:bg-indigo-50/50 hover:text-indigo-800 hover:border-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap group"
                >
                    <RotateCcw className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-600 group-hover:rotate-[-45deg] transition-all duration-300 shrink-0" />
                    <span>Làm mới danh sách</span>
                </button>
            </div>

            {/* DASHBOARD STATISTICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="h-5 w-5" />} title="Tổng lịch hẹn trong ngày" value={stats.total} iconBgClass="bg-indigo-50" iconColorClass="text-indigo-600" shadowColor="79, 70, 229" />
                <StatCard icon={<Activity className="h-5 w-5" />} title="Đã đến & Đang khám" value={stats.arrived} iconBgClass="bg-emerald-50" iconColorClass="text-emerald-600" shadowColor="5, 150, 105" />
                <StatCard icon={<CheckCircle2 className="h-5 w-5" />} title="Hoàn thành ca khám" value={stats.completed} iconBgClass="bg-sky-50" iconColorClass="text-sky-600" shadowColor="2, 132, 199" />
                <StatCard icon={<AlertTriangle className="h-5 w-5" />} title="Lịch bị hủy bỏ" value={stats.cancelled} iconBgClass="bg-rose-50" iconColorClass="text-rose-600" shadowColor="220, 38, 38" />
            </div>

            {/* THANH BỘ LỌC TÌM KIẾM */}
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Ngày kiểm tra</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="date" value={targetDate} onChange={(e) => { setTargetDate(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 font-semibold text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Ca làm việc</label>
                    <div className="relative">
                        <select value={shiftFilter} onChange={(e) => { setShiftFilter(e.target.value as any); setPageNumber(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl px-3 py-2.5 bg-slate-50 font-bold text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer">
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

                <div className="md:col-span-3 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Tên / Số điện thoại Bệnh nhân</label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="text" placeholder="Tìm họ tên, số điện thoại..." value={searchPatient} onChange={(e) => { setSearchPatient(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 font-medium placeholder-slate-400 text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider pl-1">Bác sĩ phụ trách</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input type="text" placeholder="Tên bác sĩ..." value={searchDoctor} onChange={(e) => { setSearchDoctor(e.target.value); setPageNumber(1); }} className="w-full text-sm border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50/50 font-medium placeholder-slate-400 text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                </div>

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

            {/* BẢNG DANH SÁCH CHÍNH */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                <th className="py-3 px-4">Bệnh nhân</th>
                                <th className="py-3 px-4">Giờ hẹn / Ca</th>
                                <th className="py-3 px-4">Bác sĩ & Phòng</th>
                                <th className="py-3 px-4">Triệu chứng lâm sàng</th>
                                <th className="py-3 px-4">Tiền cọc quầy</th>
                                <th className="py-3 px-4">Trạng thái</th>
                                <th className="py-3 px-4 text-center">STT Hàng chờ</th>
                                <th className="py-3 px-4 text-right">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <span className="font-semibold text-xs">Đang nạp bảng dữ liệu tiếp đón...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-400 font-semibold">
                                        Không tìm thấy bất kỳ lịch hẹn khám bệnh nào phù hợp với bộ lọc đã chọn.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.patient.fullName}</div>
                                            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.patient.phoneNumber || "Không có SĐT"}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1 font-bold text-slate-700">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                {item.slot.startTime.split('T')[1]?.substring(0, 5) || "00:00"} - {item.slot.endTime.split('T')[1]?.substring(0, 5) || "00:00"}
                                            </div>
                                            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mt-0.5">{item.slot.shiftType}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800">{item.doctor.fullName}</div>
                                            <div className="text-[11px] font-bold text-indigo-500 mt-0.5">{item.doctor.clinicRoomName || "Chưa gán phòng"}</div>
                                        </td>
                                        <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-500 font-normal">
                                            {item.symptoms || <span className="text-slate-300 italic">Không có triệu chứng ghi nhận</span>}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800">{item.depositAmount.toLocaleString('vi-VN')}đ</div>
                                            <div className="mt-0.5">
                                                {item.depositPaid ? (
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wide">Đã đóng cọc</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">Chưa thu cọc</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            {item.queue ? (
                                                <div className="inline-block px-2.5 py-1 bg-emerald-600 text-white font-black rounded-lg text-xs shadow-sm">
                                                    #{item.queue.queueNumber}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-semibold italic text-[11px]">Chưa cấp số</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAppointment(item)}
                                                className="bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                            >
                                                Xem & Xử lý
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* THANH ĐIỀU KHIỂN PHÂN TRANG */}
                {!isLoading && totalItems > 0 && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-slate-400 font-semibold">
                            Hiển thị lịch hẹn từ <strong className="text-slate-600">{(pageNumber - 1) * pageSize + 1}</strong> đến <strong className="text-slate-600">{Math.min(pageNumber * pageSize, totalItems)}</strong> trong tổng số <strong className="text-slate-600">{totalItems}</strong> lịch hẹn
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value))
                                    setPageNumber(1)
                                }}
                                className="bg-white border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer mr-2 font-medium hover:bg-slate-50 transition-colors"
                            >
                                <option value={5}>5 lịch / trang</option>
                                <option value={10}>10 lịch / trang</option>
                                <option value={20}>20 lịch / trang</option>
                                <option value={50}>50 lịch / trang</option>
                            </select>
                            <button
                                disabled={pageNumber === 1}
                                onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                                {pageNumber} / {totalPages}
                            </span>

                            <button
                                disabled={pageNumber === totalPages}
                                onClick={() => setPageNumber(p => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL OVERLAY - ĐÃ KHÔI PHỤC HOÀN TOÀN THIẾT KẾ GỐC CỦA BẠN */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    {/* KHÔI PHỤC LẠI CLASS GỐC: w-full max-w-4xl (Không bị bóp nghẹt layout) */}
                    <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-left space-y-0 animate-scale-in">

                        {/* MODAL HEADER */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                                    THÔNG TIN TIẾP ĐÓN CHI TIẾT
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* MODAL BODY */}
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
                                            <span className={`font-bold px-2.5 py-0.5 rounded-md text-xs uppercase ${selectedAppointment.patient.gender?.toUpperCase() === "MALE" ?
                                                "bg-blue-50 text-blue-700 border border-blue-100" :
                                                selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ?
                                                    "bg-pink-50 text-pink-700 border border-pink-100" :
                                                    "bg-slate-100 text-slate-700 border border-slate-200"
                                                }`}>
                                                {selectedAppointment.patient.gender?.toUpperCase() === "MALE" ? "Nam" : selectedAppointment.patient.gender?.toUpperCase() === "FEMALE" ? "Nữ" : "Khác"}
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
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${selectedAppointment.status === AppointmentStatus.COMPLETED ?
                                                "bg-emerald-100 text-emerald-800" :
                                                selectedAppointment.status === AppointmentStatus.ARRIVED || selectedAppointment.status === AppointmentStatus.IN_PROGRESS ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                                                    selectedAppointment.status === AppointmentStatus.CONFIRMED ?
                                                        "bg-sky-100 text-sky-800" :
                                                        selectedAppointment.status === AppointmentStatus.CANCELLED ?
                                                            "bg-rose-100 text-rose-800" :
                                                            "bg-amber-100 text-amber-800"
                                                }`}>
                                                {selectedAppointment.status === AppointmentStatus.CONFIRMED ? "ĐÃ XÁC NHẬN" : selectedAppointment.status}
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
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${selectedAppointment.depositPaid ?
                                                "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                                }`}>
                                                {selectedAppointment.depositPaid ? "✓ Đã thu quỹ thành công" : "✗ Chưa đóng tạm ứng"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ALERTS CẢNH BÁO TIẾP ĐÓN */}
                            {!selectedAppointment.depositPaid && [AppointmentStatus.PENDING, AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED].includes(selectedAppointment.status as AppointmentStatus) && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-medium text-rose-700 flex gap-2 items-center shadow-sm">
                                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                                    <span><strong>Lưu ý lễ tân:</strong> Cần thực hiện thu phí tạm ứng tại quầy trước khi chuyển trạng thái sang tiếp nhận thành công.</span>
                                </div>
                            )}

                            {/* Biển báo nếu không thuộc ngày hôm nay */}
                            {!isToday && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl text-xs font-semibold border border-amber-100">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    Tính năng tiếp đón và đóng cọc bị khóa vì cuộc hẹn không thuộc ngày hôm nay ({todayStr}).
                                </div>
                            )}
                        </div>

                        {/* MODAL ACTIONS FOOTER */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            {/* Nhóm hành động phụ (Bên trái) */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => handleCancel(selectedAppointment.id)}
                                    disabled={!canCancel || isActionLoading}
                                    className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${canCancel && !isActionLoading ?
                                        'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                                        }`}
                                >
                                    <CalendarX className="h-4 w-4" />
                                    Hủy lịch hẹn
                                </button>
                            </div>

                            {/* Nhóm hành động quyết định tiến trình (Bên phải) */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {canPayDeposit && (
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => handlePayDeposit(selectedAppointment.id)}
                                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        <Landmark className="h-4 w-4" />
                                        Thu tiền cọc tại quầy
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleArrived(selectedAppointment.id)}
                                    disabled={!canArrive || isActionLoading}
                                    className={`w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${canArrive && !isActionLoading
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                                        : selectedAppointment.status === "ARRIVED"
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <UserCheck className="h-4 w-4" />
                                    {selectedAppointment.status === "ARRIVED"
                                        ? `Đã Check-in (STT: ${selectedAppointment.queue?.queueNumber ?? '...'})`
                                        : "Xác nhận đã đến quầy & Cấp số khám"
                                    }
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}