"use client"

import { useState } from "react"
import {
  FileText,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Pill,
  ArrowRight,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { medicalRecordService } from "@/services/medical-record.service"
import type { MedicalRecordFormDataPayload } from "@/types"

interface SummaryDiagnosisModalProps {
  recordId: string
  initialData?: MedicalRecordFormDataPayload
  onClose: () => void
  onSuccess: (updatedData: any) => void
  onNavigateToPrescription?: () => void
}

// Common ICD-10 Codes for Ophthalmology (ICD-10 Nhãn khoa thường gặp)
const COMMON_EYE_ICD10 = [
  { code: "H10.1", label: "Viêm kết mạc dị ứng cấp tính (Acute allergic conjunctivitis)" },
  { code: "H10.3", label: "Viêm kết mạc cấp không đặc hiệu (Acute conjunctivitis)" },
  { code: "H16.0", label: "Loét giác mạc (Corneal ulcer)" },
  { code: "H26.9", label: "Đục thủy tinh thể không đặc hiệu (Cataract, unspecified)" },
  { code: "H40.1", label: "Glôcôm góc mở nguyên phát (Primary open-angle glaucoma)" },
  { code: "H40.2", label: "Glôcôm góc đóng nguyên phát (Primary angle-closure glaucoma)" },
  { code: "H35.3", label: "Thoái hóa hoàng điểm người già (Age-related macular degeneration)" },
  { code: "E11.3", label: "Bệnh võng mạc đái tháo đường (Diabetic retinopathy)" },
  { code: "S05.0", label: "Chấn thương kết mạc và trầy xước giác mạc (Corneal abrasion)" },
  { code: "H50.9", label: "Lác không đặc hiệu (Strabismus, unspecified)" },
  { code: "H02.4", label: "Sụp mi (Ptosis of eyelid)" },
  { code: "H52.1", label: "Cận thị (Myopia)" },
]

export default function SummaryDiagnosisModal({
  recordId,
  initialData,
  onClose,
  onSuccess,
  onNavigateToPrescription,
}: SummaryDiagnosisModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)

  const init: any = initialData || {}

  // Form states pre-filled from initialData if available
  const [chanDoanChinh, setChanDoanChinh] = useState(
    init?.chanDoanVaRaVien?.chanDoanChinh ||
    init?.benhAn?.chanDoanMaICD?.raVienBenhChinhTonThuong ||
    ""
  )
  const [maIcdChinh, setMaIcdChinh] = useState(
    init?.benhAn?.chanDoanMaICD?.raVienBenhChinhMaICD || ""
  )
  const [nguyenNhan, setNguyenNhan] = useState(
    init?.benhAn?.chanDoanMaICD?.raVienBenhChinhNguyenNhan || ""
  )
  const [chanDoanKemTheo, setChanDoanKemTheo] = useState(
    init?.chanDoanVaRaVien?.chanDoanKemTheo ||
    init?.benhAn?.chanDoanMaICD?.raVienBenhKemTheo ||
    ""
  )
  const [maIcdKemTheo, setMaIcdKemTheo] = useState(
    init?.benhAn?.chanDoanMaICD?.raVienBenhKemTheoMaICD || ""
  )
  const [huongDieuTri, setHuongDieuTri] = useState(
    init?.chanDoanVaRaVien?.huongDieuTri || ""
  )
  const [ketQuaDieuTri, setKetQuaDieuTri] = useState(
    init?.tinhTrangRaVien?.ketQuaDieuTri || "Đỡ"
  )

  const handleSelectICD = (code: string, label: string) => {
    setMaIcdChinh(code)
    if (!chanDoanChinh) {
      setChanDoanChinh(label)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Build updated formData payload
      const updatedPayload: MedicalRecordFormDataPayload = {
        ...init,
        chanDoanVaRaVien: {
          ...init?.chanDoanVaRaVien,
          chanDoanChinh,
          chanDoanKemTheo,
          huongDieuTri,
        },
        benhAn: {
          ...init?.benhAn,
          chanDoanMaICD: {
            ...init?.benhAn?.chanDoanMaICD,
            raVienBenhChinhTonThuong: chanDoanChinh,
            raVienBenhChinhMaICD: maIcdChinh,
            raVienBenhChinhNguyenNhan: nguyenNhan,
            raVienBenhKemTheo: chanDoanKemTheo,
            raVienBenhKemTheoMaICD: maIcdKemTheo,
          },
        },
        tinhTrangRaVien: {
          ...init?.tinhTrangRaVien,
          ketQuaDieuTri,
        },
      } as any

      const response = await medicalRecordService.update(recordId, {
        formData: updatedPayload,
        editReason: "Cập nhật tổng kết bệnh án và hướng điều trị theo diễn biến khám bệnh.",
        editPermissionDocument: "GP-AUTO-SUMMARY",
      })

      if (response?.data?.isSuccess) {
        setSuccessMsg(true)
        onSuccess(updatedPayload)
      } else {
        setErrorMessage("Cập nhật tổng kết bệnh án không thành công.")
      }
    } catch (err) {
      console.error("Error updating summary diagnosis:", err)
      setErrorMessage("Đã xảy ra lỗi khi lưu tổng kết bệnh án. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-sky-50 via-white to-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00658D] text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Chẩn Đoán Tổng Kết & Ra Viện
              </h2>
              <p className="text-xs text-gray-600">
                Tổng hợp lâm sàng, mã ICD-10 và định hướng kê đơn thuốc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {successMsg ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Đã cập nhật Chẩn đoán tổng kết thành công!
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Chẩn đoán chính: <strong className="text-slate-900">{chanDoanChinh}</strong> (Mã ICD: {maIcdChinh || "Chưa chọn"})
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
                {onNavigateToPrescription && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onNavigateToPrescription()
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00658D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#005273] shadow-xs cursor-pointer"
                  >
                    <Pill className="h-4 w-4" /> Kê đơn thuốc ngay
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Gợi ý Mã ICD-10 nhanh */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Gợi ý Mã ICD-10 Nhãn Khoa Thường Gặp (Bấm chọn nhanh):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/80 p-2 text-xs">
                  {COMMON_EYE_ICD10.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleSelectICD(item.code, item.label)}
                      className={`rounded-md border px-2 py-1 text-left transition-colors cursor-pointer ${maIcdChinh === item.code
                        ? "border-[#00658D] bg-sky-100 font-semibold text-[#00658D]"
                        : "border-gray-200 bg-white hover:border-[#00658D] hover:bg-sky-50/50 text-gray-700"
                        }`}
                    >
                      <strong className="text-[#00658D]">{item.code}</strong> — {item.label.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chẩn đoán chính & Mã ICD */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px]">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chẩn đoán chính (Lâm sàng + Cận lâm sàng) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={chanDoanChinh}
                    onChange={(e) => setChanDoanChinh(e.target.value)}
                    placeholder="vd: Viêm kết mạc cấp tính hai mắt / Trầy xước giác mạc nông OD..."
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mã ICD-10 chính
                  </label>
                  <input
                    type="text"
                    value={maIcdChinh}
                    onChange={(e) => setMaIcdChinh(e.target.value)}
                    placeholder="vd: H10.1"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D] font-mono"
                  />
                </div>
              </div>

              {/* Chẩn đoán phụ */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px]">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chẩn đoán phụ / Bệnh kèm theo
                  </label>
                  <input
                    type="text"
                    value={chanDoanKemTheo}
                    onChange={(e) => setChanDoanKemTheo(e.target.value)}
                    placeholder="vd: Cận thị nhẹ hai mắt, Tăng huyết áp..."
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mã ICD phụ
                  </label>
                  <input
                    type="text"
                    value={maIcdKemTheo}
                    onChange={(e) => setMaIcdKemTheo(e.target.value)}
                    placeholder="vd: H52.1"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D] font-mono"
                  />
                </div>
              </div>

              {/* Hướng điều trị & Tình trạng ra viện */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hướng điều trị tiếp theo / Tái khám
                  </label>
                  <textarea
                    rows={2}
                    value={huongDieuTri}
                    onChange={(e) => setHuongDieuTri(e.target.value)}
                    placeholder="vd: Nhỏ kháng sinh Tobradex + Nước mắt nhân tạo + Tái khám sau 7 ngày"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kết quả / Tình trạng ra viện
                  </label>
                  <select
                    value={ketQuaDieuTri}
                    onChange={(e) => setKetQuaDieuTri(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#00658D] focus:ring-1 focus:ring-[#00658D]"
                  >
                    <option value="Khỏi">Khỏi bệnh</option>
                    <option value="Đỡ">Đỡ / Giảm triệu chứng</option>
                    <option value="Không đổi">Không thay đổi</option>
                    <option value="Nặng hơn">Tiến triển nặng hơn</option>
                    <option value="Chuyển viện">Chuyển viện tuyến trên</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00658D] px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#005273] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu tổng kết...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Lưu tổng kết bệnh án
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
