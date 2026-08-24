"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  User,
  Stethoscope,
  Clock,
  Check,
  ShieldCheck,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Eye,
  Printer,
  X,
  Loader2,
} from "lucide-react"
import {
  recordApprovalService,
  type MedicalRecordEditRequestItem as MedicalRecordEditRequestDetail,
} from "@/services/record-approval.service"

export default function RecordApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const recordId = resolvedParams.id

  const [requestDetail, setRequestDetail] = useState<MedicalRecordEditRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [showPdfModal, setShowPdfModal] = useState(false)

  useEffect(() => {
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  const loadDetail = async () => {
    setLoading(true)
    try {
      const res = await recordApprovalService.getByRecordId(recordId)
      if (res.data) {
        setRequestDetail(res.data)
      } else {
        setRequestDetail(null)
      }
    } catch {
      setRequestDetail(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const res = await recordApprovalService.approveRequest(recordId)
      if (res.data) {
        setRequestDetail(res.data)
        setActionSuccess("Đã phê duyệt thành công! Bác sĩ đã được mở quyền cập nhật hồ sơ bệnh án.")
      }
    } catch {
      // ignore
    }
  }

  const handleReject = async () => {
    try {
      const res = await recordApprovalService.rejectRequest(recordId)
      if (res.data) {
        setRequestDetail(res.data)
        setActionSuccess("Đã từ chối đơn đề nghị chỉnh sửa hồ sơ.")
      }
    } catch {
      // ignore
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }

  if (!requestDetail) return null

  const timesNewRomanFont = {
    fontFamily: "'Times New Roman', Times, serif",
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto print:p-0 print:m-0 print:max-w-none print:bg-white">
      {/* ─── PRINT ONLY: Clean A4 PDF Paper Document ─── */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0 print:bg-white text-gray-900 font-serif">
        <div
          style={timesNewRomanFont}
          className="bg-white w-full p-8 sm:p-12 text-gray-900 space-y-6 text-sm leading-relaxed antialiased"
        >
          {/* Header of PDF */}
          <div className="grid grid-cols-2 text-center border-b-2 border-gray-900 pb-4 gap-4 w-full">
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase text-xs tracking-tight text-gray-900">SỞ Y TẾ THÀNH PHỐ HỒ CHÍ MINH</p>
              <p className="font-bold uppercase text-xs text-blue-950 tracking-tight">PHÒNG KHÁM CHUYÊN KHOA MẮT ECS</p>
              <p className="italic text-xs text-gray-600 mt-1">Số: {requestDetail.permissionDoc}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase text-xs tracking-tight text-gray-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-xs text-gray-900">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-xs text-gray-600 mt-1">TP. Hồ Chí Minh, ngày 18 tháng 08 năm 2026</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1.5 py-2">
            <h2 className="text-lg font-bold uppercase tracking-wide text-red-900">
              QUYẾT ĐỊNH / GIẤY PHÉP ỦY QUYỀN
            </h2>
            <p className="font-bold italic text-sm text-gray-800">
              Về việc cho phép điều chỉnh & cập nhật thông tin hồ sơ bệnh án điện tử EMR
            </p>
          </div>

          {/* Document Content Body */}
          <div className="space-y-4 text-sm text-gray-900 leading-relaxed">
            <p className="font-semibold">
              Căn cứ Quy chế Quản lý & Lưu trữ Hồ sơ bệnh án điện tử EMR tại Phòng khám Chuyên khoa Mắt ECS;
            </p>
            <p className="font-semibold">
              Căn cứ Đơn đề nghị điều chỉnh chuyên môn bài bản gửi ngày <strong>{requestDetail.requestedAt}</strong>;
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 my-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><strong>Bệnh nhân sở hữu:</strong> <span className="font-bold text-gray-900">{requestDetail.patientName}</span></p>
                <p><strong>Bác sĩ xin điều chỉnh:</strong> <span className="font-bold text-gray-900">{requestDetail.doctorName}</span></p>
                <p className="col-span-2"><strong>Mã Giấy Phép Cấp:</strong> <span className="font-bold font-mono text-blue-800">{requestDetail.permissionDoc}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-gray-900 uppercase">NỘI DUNG GIẢI TRÌNH LÝ DO CHUYÊN MÔN BÀI BẢN:</p>
              <p className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-gray-900 italic leading-relaxed text-sm">
                "{requestDetail.reason}"
              </p>
            </div>

            <p className="pt-2 leading-relaxed">
              Ban Giám đốc Clinic Admin phê duyệt cấp quyền chỉnh sửa hồ sơ nêu trên. Bác sĩ chuyên khoa được phép cập nhật diễn biến lâm sàng, tổng kết chẩn đoán và đơn thuốc/đơn kính chính xác theo đúng quy chuẩn y tế.
            </p>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 pt-6 border-t border-gray-200 text-sm gap-4">
            <div className="space-y-1">
              <p className="font-bold text-gray-800">Nơi nhận:</p>
              <p className="text-xs text-gray-600">- Bác sĩ chuyên khoa điều trị</p>
              <p className="text-xs text-gray-600">- Bộ phận Lưu trữ EMR</p>
            </div>

            <div className="text-center space-y-2">
              <p className="font-bold uppercase text-gray-900">TM. BAN GIÁM ĐỐC CLINIC ADMIN</p>
              <p className="text-xs text-gray-600">Giám đốc Quản lý Phòng khám</p>
              <div className="py-3">
                <div className="inline-block p-2.5 border-2 border-dashed border-emerald-600 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                  ĐÃ KÝ SỐ VÀ PHÊ DUYỆT HỢP LỆ (DIGITAL SIGNED)
                </div>
              </div>
              <p className="font-bold text-gray-900">Bs. Nguyễn Văn Quân</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SCREEN ONLY: UI Layout ─── */}
      {/* Back link */}
      <div className="print:hidden">
        <Link
          href="/clinic-admin/record-approvals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách phê duyệt
        </Link>
      </div>

      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Building2 className="w-4 h-4" /> Đơn Đề Nghị Chỉnh Sửa Hồ Sơ EMR
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Chi Tiết Đơn Phê Duyệt Hồ Sơ
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Giấy Phép Số: <span className="font-bold text-blue-700 font-mono">{requestDetail.permissionDoc}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {requestDetail.status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Chờ Clinic Admin Phê Duyệt
            </span>
          )}
          {requestDetail.status === "APPROVED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã Phê Duyệt Cấp Quyền
            </span>
          )}
          {requestDetail.status === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-900 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" /> Đã Từ Chối Đơn
            </span>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Patient & Doctor Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4 md:col-span-1">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Thông Tin Đối Tượng
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Bệnh nhân:</span>
              <span className="font-bold text-gray-900 text-sm">{requestDetail.patientName}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Bác sĩ đề nghị:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                {requestDetail.doctorName}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Thời gian gửi đơn:</span>
              <span className="text-gray-700 font-medium">{requestDetail.requestedAt}</span>
            </div>
          </div>
        </div>

        {/* Edit Reason & Document Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5 md:col-span-2">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> Lý Do Chuyên Môn & Giấy Phép
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 text-[11px] font-medium mb-1">
                Lý do & Nguyên nhân điều chỉnh chuyên môn bài bản:
              </label>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-gray-900 leading-relaxed font-medium">
                "{requestDetail.reason}"
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                <span className="text-blue-600 text-[11px] font-semibold block">Mã Giấy Phép / Số VB Ủy Quyền:</span>
                <span className="font-bold text-blue-950 font-mono text-sm block">{requestDetail.permissionDoc}</span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <span className="text-indigo-600 text-[11px] font-semibold block">Tệp văn bản giấy phép đính kèm:</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-indigo-950 flex items-center gap-1.5 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{requestDetail.attachedFileName || "GiayPhepChinhSua.pdf"}</span>
                  </span>
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex items-center justify-end gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {requestDetail.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Từ Chối Yêu Cầu
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" /> Phê Duyệt Cấp Quyền
              </button>
            </>
          )}

          {requestDetail.status === "APPROVED" && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Đã Phê Duyệt Cấp Quyền Cho Bác Sĩ
            </div>
          )}

          {requestDetail.status === "REJECTED" && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 border border-red-200 text-red-800 font-bold text-xs rounded-xl">
              Đã Từ Chối Yêu Cầu Chỉnh Sửa
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal Viewer */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-400/30 flex items-center justify-center text-red-400 font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Văn Bản Giấy Phép Ủy Quyền (PDF Document)</h3>
                  <p className="text-xs text-slate-300 font-mono">Số VB: {requestDetail.permissionDoc}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div
                style={timesNewRomanFont}
                className="bg-white w-full max-w-3xl shadow-2xl p-8 sm:p-12 border border-gray-300 text-gray-900 space-y-6 text-sm leading-relaxed antialiased box-border my-auto"
              >
                {/* Header of PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 text-center border-b-2 border-gray-900 pb-4 gap-4 w-full">
                  <div className="flex flex-col items-center">
                    <p className="font-bold uppercase text-xs tracking-tight text-gray-900">SỞ Y TẾ THÀNH PHỐ HỒ CHÍ MINH</p>
                    <p className="font-bold uppercase text-xs text-blue-950 tracking-tight">PHÒNG KHÁM CHUYÊN KHOA MẮT ECS</p>
                    <p className="italic text-xs text-gray-600 mt-1">Số: {requestDetail.permissionDoc}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold uppercase text-xs tracking-tight text-gray-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs text-gray-900">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-xs text-gray-600 mt-1">TP. Hồ Chí Minh, ngày 18 tháng 08 năm 2026</p>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1.5 py-2">
                  <h2 className="text-base sm:text-xl font-bold uppercase tracking-wide text-red-900">
                    QUYẾT ĐỊNH / GIẤY PHÉP ỦY QUYỀN
                  </h2>
                  <p className="font-bold italic text-xs sm:text-sm text-gray-800">
                    Về việc cho phép điều chỉnh & cập nhật thông tin hồ sơ bệnh án điện tử EMR
                  </p>
                </div>

                {/* Document Content Body */}
                <div className="space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed">
                  <p className="font-semibold">
                    Căn cứ Quy chế Quản lý & Lưu trữ Hồ sơ bệnh án điện tử EMR tại Phòng khám Chuyên khoa Mắt ECS;
                  </p>
                  <p className="font-semibold">
                    Căn cứ Đơn đề nghị điều chỉnh chuyên môn bài bản gửi ngày <strong>{requestDetail.requestedAt}</strong>;
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 my-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <p><strong>Bệnh nhân sở hữu:</strong> <span className="font-bold text-gray-900">{requestDetail.patientName}</span></p>
                      <p><strong>Bác sĩ xin điều chỉnh:</strong> <span className="font-bold text-gray-900">{requestDetail.doctorName}</span></p>
                      <p className="sm:col-span-2"><strong>Mã Giấy Phép Cấp:</strong> <span className="font-bold font-mono text-blue-800">{requestDetail.permissionDoc}</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-gray-900 uppercase">NỘI DUNG GIẢI TRÌNH LÝ DO CHUYÊN MÔN BÀI BẢN:</p>
                    <p className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-gray-900 italic leading-relaxed text-xs sm:text-sm">
                      "{requestDetail.reason}"
                    </p>
                  </div>

                  <p className="pt-2 leading-relaxed">
                    Ban Giám đốc Clinic Admin phê duyệt cấp quyền chỉnh sửa hồ sơ nêu trên. Bác sĩ chuyên khoa được phép cập nhật diễn biến lâm sàng, tổng kết chẩn đoán và đơn thuốc/đơn kính chính xác theo đúng quy chuẩn y tế.
                  </p>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 pt-6 border-t border-gray-200 text-xs sm:text-sm gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">Nơi nhận:</p>
                    <p className="text-xs text-gray-600">- Bác sĩ chuyên khoa điều trị</p>
                    <p className="text-xs text-gray-600">- Bộ phận Lưu trữ EMR</p>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="font-bold uppercase text-gray-900">TM. BAN GIÁM ĐỐC CLINIC ADMIN</p>
                    <p className="text-xs text-gray-600">Giám đốc Quản lý Phòng khám</p>
                    <div className="py-3">
                      <div className="inline-block p-2.5 border-2 border-dashed border-emerald-600 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                        ĐÃ KÝ SỐ VÀ PHÊ DUYỆT HỢP LỆ (DIGITAL SIGNED)
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">Bs. Nguyễn Văn Quân</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 shrink-0">
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> In Văn Bản PDF
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                {requestDetail.status === "PENDING" && (
                  <button
                    onClick={() => {
                      handleApprove()
                      setShowPdfModal(false)
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Phê Duyệt Ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
