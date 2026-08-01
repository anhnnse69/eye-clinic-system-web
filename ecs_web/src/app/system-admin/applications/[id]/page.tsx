"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ChevronRight, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Calendar, 
  Eye, 
  Info, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { clinicApplicationsService } from "@/services"
import type { GetClinicApplicationDetailResponse } from "@/types"

export default function ClinicApplicationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string

  const [requestData, setRequestData] = useState<GetClinicApplicationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Fetch chi tiết đơn đăng ký
  useEffect(() => {
    const fetchApplicationDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await clinicApplicationsService.getApplicationById(applicationId)
        
        if (response && response.data) {
          setRequestData(response.data)
        } else {
          setError("Không thể tải chi tiết đơn đăng ký")
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.")
        console.error("Error fetching application detail:", err)
      } finally {
        setLoading(false)
      }
    }

    if (applicationId) {
      fetchApplicationDetail()
    }
  }, [applicationId])

  const triggerSuccessRedirect = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
      router.push("/system-admin/applications")
    }, 2500)
  }

  const handleConfirmApprove = async () => {
    try {
      setSubmitting(true)
      const response = await clinicApplicationsService.approveApplication(applicationId)
      
      if (response && response.data) {
        setShowApproveModal(false)
        setRequestData(prev => prev ? { ...prev, status: "APPROVED" } : null)
        triggerSuccessRedirect("Đơn đăng ký đã được phê duyệt thành công")
      } else {
        setError("Không thể phê duyệt đơn. Vui lòng thử lại.")
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
      console.error("Error approving application:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối!")
      return
    }

    try {
      setSubmitting(true)
      const response = await clinicApplicationsService.rejectApplication(applicationId, {
        reviewNote: rejectReason
      })
      
      if (response && response.data) {
        setShowRejectModal(false)
        setRequestData(prev => prev ? { ...prev, status: "REJECTED", reviewNote: rejectReason } : null)
        triggerSuccessRedirect("Đơn đăng ký đã bị từ chối")
      } else {
        setError("Không thể từ chối đơn. Vui lòng thử lại.")
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
      console.error("Error rejecting application:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-on-surface-variant">Đang tải chi tiết đơn đăng ký...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !requestData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-error mx-auto" />
          <p className="text-error font-semibold">{error}</p>
          <button 
            onClick={() => router.push("/system-admin/applications")}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-on-surface-variant">Không tìm thấy đơn đăng ký</p>
      </div>
    )
  }

  return (
    <div className="space-y-lg relative w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-xl py-md rounded-xl shadow-xl z-50 flex items-center gap-sm font-medium text-body-md animate-fade-in-down">
          <CheckCircle className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-error-container border border-error rounded-2xl p-lg flex items-start gap-md">
          <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error mb-xs">Lỗi</h3>
            <p className="text-body-md text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Breadcrumb & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span 
              className="font-label-md text-label-md cursor-pointer hover:text-primary flex items-center gap-xs"
              onClick={() => router.push("/system-admin/applications")}
            >
              <ArrowLeft className="h-3 w-3" /> Đơn đăng ký
            </span>
            <ChevronRight className="h-3 w-3 text-outline" />
            <span className="font-label-md text-label-md text-primary font-semibold">Chi tiết đơn #{requestData.id_clinic_registration}</span>
          </nav>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Thẩm định đơn đăng ký phòng khám</h2>
        </div>

        <div className="flex items-center gap-3">
          {requestData.status === "PENDING" && (
            <div className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full flex items-center gap-2 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-label-md font-bold uppercase tracking-wider">Chờ phê duyệt</span>
            </div>
          )}
          {requestData.status === "APPROVED" && (
            <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full flex items-center gap-2 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              <span className="text-label-md font-bold uppercase tracking-wider">Đã chấp thuận</span>
            </div>
          )}
          {requestData.status === "REJECTED" && (
            <div className="px-4 py-1.5 bg-error-container/40 text-error rounded-full flex items-center gap-2 border border-error/20">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span className="text-label-md font-bold uppercase tracking-wider">Đã từ chối</span>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        
        {/* ================= CỘT TRÁI (Span 8) ================= */}
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          
          {/* Section 1: Thông tin phòng khám */}
          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-surface-container pb-4">
              <Building2 className="text-primary h-6 w-6" />
              <h3 className="text-title-lg font-title-lg text-on-surface">Thông tin phòng khám</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Tên cơ sở y tế</p>
                <p className="text-body-lg font-semibold text-on-surface">{requestData.clinicName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Thời gian gửi yêu cầu</p>
                <p className="text-body-lg text-on-surface flex items-center gap-sm">
                  <Calendar className="h-4 w-4 text-outline" /> {requestData.requestedAt}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1 border-t border-dashed border-outline-variant/50 pt-4">
                <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Địa chỉ hoạt động</p>
                <p className="text-body-lg text-on-surface flex items-start gap-xs">
                  <MapPin className="h-5 w-5 text-error mt-0.5 shrink-0" />
                  <span className="font-medium">{requestData.clinicAddress}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Nếu đơn bị từ chối, hiển thị ghi chú lý do */}
          {requestData.reviewNote && (
            <section className="bg-error-container/20 p-lg rounded-2xl border border-error/30">
              <div className="flex items-center gap-3 text-error mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-semibold text-body-lg">Ghi chú từ chối từ hệ thống:</h4>
              </div>
              <p className="text-body-md text-on-surface pl-8 italic">"{requestData.reviewNote}"</p>
            </section>
          )}

          {/* Section 2: Khung hành động Thao duyệt/Từ chối (Ngang hàng với Tài liệu đính kèm) */}
          {requestData.status === "PENDING" && (
            <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant shadow-sm space-y-md">
              <div className="flex items-center gap-2 text-on-surface-variant border-b border-surface-container pb-3">
                <Info className="h-5 w-5 text-primary" />
                <h4 className="text-body-md font-semibold">Quyết định thẩm định hồ sơ</h4>
              </div>
              <p className="text-body-md text-on-surface-variant">
                Vui lòng đối chiếu kỹ thông tin đăng ký vãng lai và tệp tài liệu pháp lý đính kèm bên cạnh trước khi đưa ra quyết định phê duyệt.
              </p>
              <div className="flex items-center gap-md pt-2">
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="flex-1 px-xl py-md rounded-xl border-2 border-error text-error font-semibold text-label-md hover:bg-error-container/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Từ chối tiếp nhận
                </button>
                <button 
                  onClick={() => setShowApproveModal(true)}
                  disabled={submitting}
                  className="flex-1 px-xl py-md rounded-xl bg-primary text-on-primary font-semibold text-label-md shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Phê duyệt & Cấp không gian
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ================= CỘT PHẢI (Span 4) ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          
          {/* Section 3: Người đại diện liên hệ */}
          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="flex items-center gap-3 mb-6 border-b border-surface-container pb-4 relative z-10">
              <User className="text-primary h-6 w-6" />
              <h3 className="text-title-lg font-title-lg text-on-surface">Thông tin liên hệ vãng lai</h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold text-title-lg">
                  {requestData.contactName.split(" ").pop()?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-body-lg font-semibold text-on-surface">{requestData.contactName}</p>
                  <p className="text-xs text-on-surface-variant font-medium">Người nộp đơn đăng ký (Guest)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <Phone className="text-on-surface-variant h-4 w-4" />
                  <span className="text-body-md font-medium text-on-surface">{requestData.contactPhone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  <Mail className="text-on-surface-variant h-4 w-4" />
                  <span className="text-body-md font-medium text-on-surface break-all">{requestData.contactEmail}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Hồ sơ tài liệu đính kèm */}
          <section className="bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-surface-container pb-4">
              <FileText className="text-primary h-6 w-6" />
              <h3 className="text-title-lg font-title-lg text-on-surface">Tài liệu đính kèm</h3>
            </div>

            <div className="space-y-3">
              {requestData.businessLicenseUrl ? (
                <div className="group flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg text-error">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface truncate max-w-[160px]">Giấy phép kinh doanh.pdf</p>
                      <p className="text-xs text-on-surface-variant">Đã tải lên tự động</p>
                    </div>
                  </div>
                  <a 
                    href={requestData.businessLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-sm text-outline hover:text-primary rounded-lg hover:bg-surface-container-highest transition-all"
                    title="Xem tài liệu"
                  >
                    <Eye className="h-5 w-5" />
                  </a>
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant italic">Không có tài liệu đính kèm nào.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ================= MODAL LỚP PHỦ 1: XÁC NHẬN PHÊ DUYỆT ================= */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[448px] max-w-[95vw] p-6 border border-outline-variant shadow-2xl block text-left">
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Phê duyệt đơn đăng ký</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Xác nhận này sẽ tự động cấp phát phân vùng Workspace cơ sở dữ liệu riêng biệt và kích hoạt quyền cho phòng khám <strong>{requestData.clinicName}</strong>.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3">
                <button 
                  onClick={() => setShowApproveModal(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy để kiểm tra lại
                </button>
                <button 
                  onClick={handleConfirmApprove}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-sky-700 text-white font-semibold text-sm hover:bg-sky-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận cấp quyền"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* ================= MODAL LỚP PHỦ 2: TỪ CHỐI TIẾP NHẬN ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[448px] max-w-[95vw] p-6 border border-slate-200 shadow-2xl block text-left">
            
            {/* Tiêu đề & Icon */}
            <div className="flex flex-col items-center text-center gap-3 w-full">
              <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Từ chối đơn đăng ký</h3>
                <p className="text-sm text-slate-500">
                  Bạn đang thực hiện từ chối hồ sơ đăng ký của cơ sở này. Vui lòng nhập lý do rõ ràng.
                </p>
              </div>
            </div>

            {/* Ô nhập dữ liệu */}
            <div className="space-y-2 mt-4 w-full block">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Giấy phép hoạt động y tế đã hết hạn hoặc hình ảnh chứng minh bị mờ..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-800 outline-none resize-none block"
              />
            </div>

            {/* Cụm nút bấm */}
            <div className="flex items-center gap-3 mt-5 w-full">
              <button 
                onClick={() => { setShowRejectModal(false); setRejectReason(""); }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || submitting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all text-center shadow-sm flex items-center justify-center gap-2
                  disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                  bg-red-600 text-white hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận từ chối"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}