"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, CheckCircle2, User, Calendar, 
  Clock, Stethoscope, AlertCircle, Loader2,
  ShieldAlert, Armchair, DoorOpen, FileText
} from "lucide-react"
import { receptionistService } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"

export default function WalkInRegistrationPage() {
  const router = useRouter()
  
  const [walkInFlow, setWalkInFlow] = useState<any>(null)
  const [symptoms, setSymptoms] = useState<string>("") 
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any>(null)
  
  // State phụ dùng để lưu trữ bản sao dữ liệu hiển thị lên màn hình thành công sau khi xóa session
  const [summaryInfo, setSummaryInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFlow = sessionStorage.getItem("pending_walkin_appointment")
      if (savedFlow) {
        const parsed = JSON.parse(savedFlow)
        if (!parsed.patientProfileId) {
          router.push("/receptionist/patients") 
          return
        }
        setWalkInFlow(parsed)
        setSummaryInfo(parsed) 
      } else {
        router.push("/receptionist/available-slots") 
      }
    }
  }, [router])

  const handleConfirmRegistration = async () => {
    if (!walkInFlow) return

    try {
      setLoading(true)
      setErrorMsg(null)

      const payload = {
        patientProfileId: walkInFlow.patientProfileId,
        doctorId: walkInFlow.doctorId, 
        slotId: walkInFlow.slotId,
        symptoms: symptoms.trim() || null
      }

      const response = await receptionistService.registerWalkIn(payload)

      if (response && response.data) {
        setSuccessData(response.data)
        // Xóa luồng tạm trong session, dữ liệu hiển thị đã có summaryInfo lo liệu
        sessionStorage.removeItem("pending_walkin_appointment")
      } else {
        setErrorMsg(`Đăng ký không thành công. Mã phản hồi: ${response.codeMessage}`)
      }
    } catch (error: any) {
      const apiErrorCodeMessage = handleApiError(error)
      setErrorMsg(apiErrorCodeMessage || "APP_MESSAGE_5000")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistrationFlow = () => {
    sessionStorage.removeItem("pending_walkin_appointment")
    router.push("/receptionist/available-slots")
  }

  const handleBackToSelectPatient = () => {
    if (walkInFlow) {
      const rollbackFlow = { ...walkInFlow, step: 1 }
      delete rollbackFlow.patientProfileId
      delete rollbackFlow.patientName
      delete rollbackFlow.patientPhone
      delete rollbackFlow.patientDob
      sessionStorage.setItem("pending_walkin_appointment", JSON.stringify(rollbackFlow))
    }
    router.push("/receptionist/patients")
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // --- MÀN HÌNH THÔNG BÁO XÁC NHẬN THÀNH CÔNG ---
  if (successData) {
    return (
      <div className="flex justify-center items-center w-full my-12">
        <div className="w-[550px] p-8 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center justify-center space-y-6 shrink-0">
          
          {/* Icon Vòng tròn tích xanh */}
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          {/* Khối tiêu đề - Ép text căn giữa độc lập */}
          <div className="w-full text-center space-y-2">
            <h1 className="text-xl font-bold text-slate-800 block w-full whitespace-normal">
              Đăng Ký Khám Vãng Lai Thành Công!
            </h1>
            <p className="text-xs text-slate-500 block w-full whitespace-normal px-4">
              Hệ thống đã xếp số thứ tự hàng chờ và khởi tạo hồ sơ lịch hẹn thành công.
            </p>
          </div>

          {/* Khối thông tin Mã và STT dạng Grid ổn định */}
          <div className="w-full p-5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Mã lịch hẹn khám</span>
              <span className="text-slate-800 font-mono font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 inline-block text-xs select-all">
                {successData.appointmentId || "N/A"}
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Số thứ tự (STT)</span>
              <div>
                <span className="text-emerald-700 text-sm font-extrabold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block">
                 #{successData.walkInQueue?.queueNumber !== undefined ? successData.walkInQueue.queueNumber : "---"}
                </span>
              </div>
            </div>
          </div>

          {/* Khối chi tiết thông tin tiếp đón được phục hồi từ summaryInfo */}
          {summaryInfo && (
            <div className="w-full border border-slate-100 rounded-xl p-4 bg-white space-y-3 text-xs text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Chi tiết thông tin tiếp đón
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Bệnh nhân:</span>
                  <span className="font-bold text-slate-800">{summaryInfo.patientName || "---"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Số điện thoại:</span>
                  <span className="font-bold text-slate-700 font-mono">{summaryInfo.patientPhone || "---"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bác sĩ phụ trách:</span>
                  <span className="font-bold text-slate-800">BS. {summaryInfo.doctorName || "---"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phòng khám:</span>
                  <span className="font-bold text-indigo-700">{summaryInfo.roomName || "Chờ xếp phòng"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ngày khám:</span>
                  <span className="font-bold text-slate-700">{formatDateDisplay(summaryInfo.date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Khung giờ hẹn:</span>
                  <span className="font-bold text-emerald-700">{summaryInfo.timeSlot || "---"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Nút điều hướng chân trang */}
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => router.push("/receptionist/appointments")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-100"
            >
              Đi đến danh sách điều phối lịch hẹn
            </button>
          </div>

        </div>
      </div>
    )
  }

  if (!walkInFlow) {
    return (
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        <p className="text-xs">Đang đồng bộ luồng thông tin đăng ký...</p>
      </div>
    )
  }

  // --- MÀN HÌNH FORM ĐĂNG KÝ XÁC NHẬN CHÍNH ---
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header thanh điều hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={handleBackToSelectPatient}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại bước chọn bệnh nhân</span>
        </button>
        
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>1. Giờ trống</span>
          <span className="text-slate-300">/</span>
          <span>2. Bệnh nhân</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-extrabold">3. Xác nhận hoàn tất</span>
        </div>
      </div>

      {/* Banner tiêu đề trang */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
          <Armchair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Xác nhận Đăng ký Khám Vãng lai</h1>
          <p className="text-xs text-slate-400 mt-0.5">Kiểm tra thông tin chi tiết của người bệnh và khung giờ trước khi cấp số thứ tự</p>
        </div>
      </div>

      {/* Khối hiển thị lỗi API nếu có */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold">Đăng ký không thành công</p>
            <p className="opacity-90">Hệ thống báo phản hồi: {errorMsg}</p>
          </div>
        </div>
      )}

      {/* Bố cục Thông tin 2 cột bên trên */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Cột trái: Thông tin Bệnh nhân */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100 uppercase tracking-wider">
            <User className="h-4 w-4 text-blue-500" />
            Thông tin người bệnh đã chọn
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Họ và tên bệnh nhân</span>
              <span className="font-extrabold text-slate-800 text-sm block">{walkInFlow.patientName}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Ngày sinh</span>
                <span className="font-bold text-slate-700 block">{walkInFlow.patientDob || "---"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Số điện thoại</span>
                <span className="font-bold text-slate-700 font-mono block">{walkInFlow.patientPhone || "---"}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Mã hồ sơ (ID)</span>
              <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 border border-slate-200 rounded-md inline-block select-all">
                {walkInFlow.patientProfileId}
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin Lịch hẹn cấu hình */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100 uppercase tracking-wider">
            <Stethoscope className="h-4 w-4 text-purple-500" />
            Lịch trình khám dự kiến
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Chuyên khoa đăng ký</span>
              <span className="font-bold text-slate-800 block">{walkInFlow.specialtyName || "Khám chung"}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Bác sĩ phụ trách</span>
                <span className="font-bold text-slate-700 block">BS. {walkInFlow.doctorName || "Chỉ định ngẫu nhiên"}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block flex items-center gap-1 mb-0.5">
                  <DoorOpen className="h-3 w-3 text-slate-400" /> Phòng khám
                </span>
                <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-[11px] inline-block">
                  {walkInFlow.roomName || "Chờ xếp phòng"}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày khám
                </span>
                <span className="font-extrabold text-slate-800 text-xs block">
                  {formatDateDisplay(walkInFlow.date)}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Giờ hẹn hờ
                </span>
                <span className="font-extrabold text-emerald-700 text-xs block">
                  {walkInFlow.timeSlot || "---"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Khối Nhập Triệu Chứng (Symptom Textarea) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="h-4 w-4 text-slate-500" /> 
          Lý do khám bệnh / Triệu chứng lâm sàng <span className="text-slate-400 font-normal lowercase italic">(Không bắt buộc)</span>
        </label>
        <textarea
          rows={3}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Ví dụ: Bệnh nhân đau đầu sốt nhẹ, ho có đờm 2 ngày..."
          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 leading-relaxed resize-none"
        />
        <p className="text-[11px] text-slate-400 italic">
          * Nếu để trống, hệ thống sẽ tự động lưu nội dung: &quot;Khám vãng lai tại quầy (Đăng ký trực tiếp)&quot;.
        </p>
      </div>

      {/* Cảnh báo quy trình */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
        <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold">Lưu ý nghiệp vụ dành cho Lễ tân:</p>
          <p className="opacity-90">Bằng việc bấm nút xác nhận, bệnh nhân sẽ được đưa vào hàng đợi chờ khám của bác sĩ ngay lập tức. Vui lòng nhắc nhở bệnh nhân di chuyển tới đúng phòng khám chuyên khoa.</p>
        </div>
      </div>

      {/* Cụm nút bấm hành động */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={handleCancelRegistrationFlow}
          className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          Hủy bỏ & Quay lại chọn giờ trống
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirmRegistration}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <span>Xác nhận đăng ký khám</span>
          )}
        </button>
      </div>

    </div>
  )
}