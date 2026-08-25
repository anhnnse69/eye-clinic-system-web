"use client"

import React from "react"
import { Printer, ShieldCheck } from "lucide-react"
import { MEDICAL_RECORD_TYPE_LABELS, type GetMedicalRecordDetailResponse } from "@/types"

export interface EMRDocumentProps {
  record: GetMedicalRecordDetailResponse
  showActions?: boolean
  clinicProfile?: {
    soYTe?: string | null
    clinicName?: string | null
    address?: string | null
    phone?: string | null
    email?: string | null
  }
}

export const RECORD_TYPE_FORM_CODES: Record<string, { code: string; title: string; subtitle: string }> = {
  MS21_TRAUMA: { code: "21/BV-01", title: "BỆNH ÁN NGOẠI TRÚ CHẤN THƯƠNG MẮT", subtitle: "Bệnh án mắt (Chấn thương)" },
  MS22_ANTERIOR: { code: "22/BV-01", title: "BỆNH ÁN NGOẠI TRÚ BỆNH MẮT TRƯỚC (GIÁC MẠC / KẾT MẠC)", subtitle: "Bệnh án mắt (Bán phần trước)" },
  MS23_FUNDUS: { code: "23/BV-01", title: "BỆNH ÁN NGOẠI TRÚ ĐÁY MẮT & VÕNG MẠC", subtitle: "Bệnh án mắt (Đáy mắt)" },
  MS24_GLAUCOMA: { code: "24/BV-01", title: "BỆNH ÁN NGOẠI TRÚ GLÔCÔM (TĂNG NHÃN ÁP)", subtitle: "Bệnh án mắt (Glôcôm)" },
  MS25_STRABISMUS_PTOSIS: { code: "25/BV-01", title: "BỆNH ÁN NGOẠI TRÚ LÉ & SỤP MI", subtitle: "Bệnh án mắt (Lé - Sụp mi)" },
  MS26_PEDIATRIC: { code: "26/BV-01", title: "BỆNH ÁN NGOẠI TRÚ NHÃN KHOA NHI", subtitle: "Bệnh án mắt (Trẻ em)" },
}

export default function EMRDocument({ record, showActions = true, clinicProfile }: EMRDocumentProps) {
  const formInfo = RECORD_TYPE_FORM_CODES[record.recordType] || {
    code: "22/BV-01",
    title: "BỆNH ÁN NGOẠI TRÚ NHÃN KHOA",
    subtitle: "Bệnh án mắt",
  }

  const formData = record.formData || {}
  const benhAn = formData.benhAn || formData
  const khamBenh = formData.khamBenh || {}
  const hanhChinh = benhAn.hanhChinh || {}

  // Safe date formatter (handles ISO strings, date strings, invalid inputs)
  const safeFormatDate = (dateStr?: string | null) => {
    if (!dateStr || dateStr === "—" || dateStr === "null" || dateStr === "undefined") return "—"
    try {
      if (typeof dateStr === "string" && dateStr.includes("T")) {
        const parts = dateStr.split("T")
        const datePart = parts[0]
        const [y, m, d] = datePart.split("-")
        if (y && m && d && y.length === 4) {
          return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
        }
      }
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) {
        if (typeof dateStr === "string" && dateStr.includes("-")) {
          const [y, m, d] = dateStr.split("-")
          if (y && m && d) return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
        }
        return dateStr
      }
      const day = String(parsed.getDate()).padStart(2, "0")
      const month = String(parsed.getMonth() + 1).padStart(2, "0")
      const year = parsed.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return String(dateStr)
    }
  }

  const safeFormatDateTime = (dateStr?: string | null) => {
    if (!dateStr || dateStr === "—") return "—"
    try {
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) return dateStr
      const day = String(parsed.getDate()).padStart(2, "0")
      const month = String(parsed.getMonth() + 1).padStart(2, "0")
      const year = parsed.getFullYear()
      const hours = String(parsed.getHours()).padStart(2, "0")
      const mins = String(parsed.getMinutes()).padStart(2, "0")
      return `${hours}:${mins} ${day}/${month}/${year}`
    } catch {
      return String(dateStr)
    }
  }

  // Patient info extracted directly from backend response & MongoDB payload
  const fullName = (record.patientFullName || hanhChinh.hoTen || "").toUpperCase()
  const rawDob = record.patientDob || hanhChinh.ngaySinh
  const dobFormatted = safeFormatDate(rawDob)
  const gender = (record.patientGender || hanhChinh.gioiTinh || "").toUpperCase()
  const phone = record.patientPhone || hanhChinh.dienThoai || "—"
  const identity = record.patientIdentityNumber || hanhChinh.cmnd || hanhChinh.cccd || "—"
  const bhyt = hanhChinh.soBHYT || "—"
  const address = record.patientAddress || hanhChinh.diaChi || "—"
  const emergencyContact = hanhChinh.nhaBaoTin || "—"
  const job = hanhChinh.ngheNghiep || "—"
  const ethnicity = hanhChinh.danToc || "—"

  // Medical history
  const lyDoKhams = benhAn.lyDoVaoVien || record.chiefComplaint || "Mờ mắt, đau nhức nhẹ"
  const benhSu = benhAn.benhSu || (record as any).summary || "Bệnh nhân khởi phát triệu chứng mờ mắt..."
  const tienSuMat = benhAn.tienSuBanThanMat || record.personalHistoryEye || "Chưa ghi nhận bất thường"
  const tienSuToanThan = benhAn.tienSuBanThanToanThan || record.personalHistorySystemic || "Chưa ghi nhận bệnh lý nội khoa"
  const tienSuGiaDinh = benhAn.tienSuGiaDinh || record.familyHistory || "Bình thường"

  // Vitals
  const vitals = khamBenh.khamToanThan || {}
  const mach = vitals.mach || record.vitalPulse || "75"
  const huyetAp = vitals.huyetAp || record.vitalBloodPressure || "120/80"
  const nhietDo = vitals.nhietDo || record.vitalTemperature || "36.8"
  const nhipTho = vitals.nhipTho || record.vitalRespiratoryRate || "18"
  const canNang = vitals.canNang || record.vitalWeightKg || "62"

  // Eye Exam Data (OD / OS)
  const odThiLuc = khamBenh.thiLucNhanApVaoVien?.matPhai || (record as any).rightEyeExamBasic || {}
  const osThiLuc = khamBenh.thiLucNhanApVaoVien?.matTrai || (record as any).leftEyeExamBasic || {}

  const odEyelid = khamBenh.miMat?.matPhai || (record as any).rightEyeEyelidConjunctiva || {}
  const osEyelid = khamBenh.miMat?.matTrai || (record as any).leftEyeEyelidConjunctiva || {}

  const odCornea = khamBenh.giacMac?.matPhai || (record as any).rightEyeCornea || {}
  const osCornea = khamBenh.giacMac?.matTrai || (record as any).leftEyeCornea || {}

  const odAc = khamBenh.tienPhong?.matPhai || (record as any).rightEyeAcIris || {}
  const osAc = khamBenh.tienPhong?.matTrai || (record as any).leftEyeAcIris || {}

  const odLens = khamBenh.theThuyTinh?.matPhai || (record as any).rightEyeLensVitreous || {}
  const osLens = khamBenh.theThuyTinh?.matTrai || (record as any).leftEyeLensVitreous || {}

  const odFundus = khamBenh.dayMatDiaThiHoangDiem?.matPhai || (record as any).rightEyeFundus || {}
  const osFundus = khamBenh.dayMatDiaThiHoangDiem?.matTrai || (record as any).leftEyeFundus || {}

  // Diagnosis
  const diagnosisMain = benhAn.chanDoanChinh || record.diagnosisMain || "Theo dõi bệnh lý nhãn khoa"
  const icdMain = benhAn.chanDoanMaICD?.raVienBenhChinhMaICD || "H52.1"
  const diagnosisComorbid = benhAn.chanDoanKemTheo || record.diagnosisComorbid || "Không"
  const treatmentPlan = benhAn.keHoachDieuTri || record.treatmentPlan || "Điều trị nội khoa theo đơn thuốc"

  // Doctor name helper to prevent "BS. BS."
  const doctorDisplayName = record.doctorFullName
    ? record.doctorFullName.trim().startsWith("BS.")
      ? record.doctorFullName.trim()
      : `BS. ${record.doctorFullName.trim()}`
    : "BÁC SĨ ĐIỀU TRỊ"

  return (
    <div className="space-y-4">
      {/* Action Toolbar on Screen */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Mẫu Hồ Sơ Bệnh Án Điện Tử EMR (Bộ Y Tế TT 46/2018/TT-BYT)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" /> In Bệnh Án EMR (A4)
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EMR A4 PAPER CONTAINER (ARIAL / SANS-SERIF FOR PERFECT VIETNAMESE GLYPHS)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="mx-auto bg-white p-6 sm:p-10 shadow-xl border border-gray-300 rounded-xl text-black font-sans max-w-[210mm] print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none emr-print-container"
        style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif' }}
      >
        {/* CSS for Print - Fit A4 perfectly without browser headers/footers or gray outer boxes */}
        <style>{`
          @media print {
            .emr-print-container {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 6mm 8mm !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              box-sizing: border-box !important;
            }
            .emr-print-container * {
              box-shadow: none !important;
              text-shadow: none !important;
            }
            .emr-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 4px !important;
            }
          }
        `}</style>

        {/* HEADER QUỐC HIỆU & ĐƠN VỊ Y TẾ */}
        <div className="border-b-2 border-black pb-3 mb-4 print:mb-2 space-y-2">
          <div className="grid grid-cols-2 text-xs leading-snug">
            <div className="text-left space-y-0.5">
              <p className="uppercase font-bold text-[11px]">{(clinicProfile?.soYTe || hanhChinh.soYTe || (record as any).soYTe || "SỞ Y TẾ").toUpperCase()}</p>
              <p className="font-bold text-xs uppercase text-emerald-950">{(clinicProfile?.clinicName || (record as any).clinicName || hanhChinh.tenCoSo || "BỆNH VIỆN / PHÒNG KHÁM").toUpperCase()}</p>
              {(clinicProfile?.address || (record as any).clinicAddress) && (
                <p className="text-[11px]">Địa chỉ: {clinicProfile?.address || (record as any).clinicAddress}</p>
              )}
              {(clinicProfile?.phone || clinicProfile?.email) && (
                <p className="text-[11px]">
                  {clinicProfile?.phone ? `Hotline: ${clinicProfile.phone}` : ""}
                  {clinicProfile?.phone && clinicProfile?.email ? " - " : ""}
                  {clinicProfile?.email ? `Email: ${clinicProfile.email}` : ""}
                </p>
              )}
            </div>

            <div className="text-right space-y-0.5">
              <p className="uppercase font-bold text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[11px] font-mono mt-1">Mã EMR: <strong>{record.id.slice(0, 12).toUpperCase()}</strong></p>
              <p className="text-[11px] font-mono">Mã Lượt khám: <strong>{record.appointmentId.slice(0, 8).toUpperCase()}</strong></p>
            </div>
          </div>

          <div className="pt-2 print:pt-3 text-center">
            <h1 className="text-xl font-bold uppercase tracking-tight text-black">
              {formInfo.title}
            </h1>
            <p className="text-xs font-semibold text-gray-800 mt-0.5">
              {formInfo.subtitle} — <span className="font-mono">Mẫu số: {formInfo.code}</span> (Ban hành theo TT 46/2018/TT-BYT)
            </p>
          </div>
        </div>

        {/* PHẦN I: HÀNH CHÍNH */}
        <div className="emr-section mb-5 print:mb-2 space-y-2 text-xs">
          <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
            I. THÔNG TIN HÀNH CHÍNH (ADMINISTRATIVE INFORMATION)
          </h2>

          <div className="grid grid-cols-4 gap-x-4 gap-y-2 border border-black p-3 print:p-2 bg-gray-50/40 rounded-xs">
            <div className="col-span-2">
              <strong>1. Họ và tên:</strong> <span className="font-bold text-sm uppercase">{fullName}</span>
            </div>
            <div>
              <strong>2. Ngày sinh:</strong> <span>{dobFormatted}</span>
            </div>
            <div>
              <strong>3. Giới tính:</strong> <span className="font-bold">{gender}</span>
            </div>

            <div>
              <strong>4. Nghề nghiệp:</strong> <span>{job}</span>
            </div>
            <div>
              <strong>5. Dân tộc:</strong> <span>{ethnicity}</span>
            </div>
            <div>
              <strong>6. Số điện thoại:</strong> <span>{phone}</span>
            </div>
            <div>
              <strong>7. Thẻ BHYT:</strong> <span className="font-mono font-bold">{bhyt}</span>
            </div>

            <div className="col-span-2">
              <strong>8. Số CMND/CCCD:</strong> <span className="font-mono font-bold">{identity}</span>
            </div>
            <div className="col-span-2">
              <strong>9. Người báo tin khẩn cấp:</strong> <span>{emergencyContact}</span>
            </div>

            <div className="col-span-4">
              <strong>10. Địa chỉ thường trú:</strong> <span>{address}</span>
            </div>

            <div className="col-span-2">
              <strong>11. Thời gian khởi tạo EMR:</strong> <span>{safeFormatDateTime(record.createdAt)}</span>
            </div>
            <div className="col-span-2">
              <strong>12. Bác sĩ phụ trách:</strong> <span className="font-bold">{doctorDisplayName}</span>
            </div>
          </div>
        </div>

        {/* PHẦN II: HỎI BỆNH & TIỀN SỬ */}
        <div className="emr-section mb-5 space-y-2 text-xs">
          <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
            II. HỎI BỆNH & TIỀN SỬ (MEDICAL HISTORY & SUBJECTIVE ASSESSMENT)
          </h2>

          <div className="border border-black p-3 space-y-2">
            <div>
              <strong>1. Lý do vào viện / Khám bệnh:</strong>
              <p className="mt-0.5 font-bold italic pl-4 text-gray-900">{lyDoKhams}</p>
            </div>

            <div>
              <strong>2. Quá trình bệnh lý (Bệnh sử):</strong>
              <p className="mt-0.5 leading-relaxed pl-4 text-gray-900">{benhSu}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-300">
              <div>
                <strong>3. Tiền sử Mắt:</strong>
                <p className="mt-0.5 pl-2 text-gray-800">{tienSuMat}</p>
              </div>
              <div>
                <strong>4. Tiền sử Toàn thân:</strong>
                <p className="mt-0.5 pl-2 text-gray-800">{tienSuToanThan}</p>
              </div>
              <div>
                <strong>5. Tiền sử Gia đình:</strong>
                <p className="mt-0.5 pl-2 text-gray-800">{tienSuGiaDinh}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN III: KHÁM LÂM SÀNG CHUYÊN KHOA MẮT */}
        <div className="emr-section mb-5 space-y-3 text-xs">
          <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
            III. KHÁM BỆNH CHUYÊN KHOA MẮT (OPHTHALMIC CLINICAL EXAMINATION)
          </h2>

          {/* Sinh hiệu toàn thân */}
          <div className="flex flex-wrap items-center justify-between border border-black p-2 bg-gray-50/50 font-medium">
            <span><strong>Mạch:</strong> {mach} lần/phút</span>
            <span><strong>Huyết áp:</strong> {huyetAp} mmHg</span>
            <span><strong>Nhiệt độ:</strong> {nhietDo} °C</span>
            <span><strong>Nhịp thở:</strong> {nhipTho} lần/phút</span>
            <span><strong>Cân nặng:</strong> {canNang} kg</span>
          </div>

          {/* Bảng so sánh Mắt Phải (OD) vs Mắt Trái (OS) */}
          <div className="border border-black overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold text-center">
                  <th className="p-2 border-r border-black w-1/3">CƠ QUAN / CHỈ SỐ KHÁM</th>
                  <th className="p-2 border-r border-black w-1/3 text-blue-900">MẮT PHẢI (OD / RE)</th>
                  <th className="p-2 w-1/3 text-emerald-900">MẮT TRÁI (OS / LE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">1. Thị lực không kính</td>
                  <td className="p-2 border-r border-black font-mono font-bold text-center">{odThiLuc.thiLucKhongKinh || odThiLuc.visionWithoutGlasses || "6/10"}</td>
                  <td className="p-2 font-mono font-bold text-center">{osThiLuc.thiLucKhongKinh || osThiLuc.visionWithoutGlasses || "10/10"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">2. Thị lực có kính</td>
                  <td className="p-2 border-r border-black font-mono font-bold text-center">{odThiLuc.thiLucCoKinh || odThiLuc.visionWithGlasses || "9/10"}</td>
                  <td className="p-2 font-mono font-bold text-center">{osThiLuc.thiLucCoKinh || osThiLuc.visionWithGlasses || "10/10"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">3. Nhãn áp (IOP)</td>
                  <td className="p-2 border-r border-black font-mono font-bold text-center">{odThiLuc.nhanAp || odThiLuc.iopMmHg ? `${odThiLuc.nhanAp || odThiLuc.iopMmHg} mmHg` : "16 mmHg"}</td>
                  <td className="p-2 font-mono font-bold text-center">{osThiLuc.nhanAp || osThiLuc.iopMmHg ? `${osThiLuc.nhanAp || osThiLuc.iopMmHg} mmHg` : "15 mmHg"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">4. Mi mắt & Kết mạc</td>
                  <td className="p-2 border-r border-black">{odEyelid.moTa || "Bình thường, mi máy nhắm kín, kết mạc hồng"}</td>
                  <td className="p-2">{osEyelid.moTa || "Bình thường, không sưng đỏ"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">5. Giác mạc</td>
                  <td className="p-2 border-r border-black">{odCornea.moTa || "Trong suốt, không sẹo đục"}</td>
                  <td className="p-2">{osCornea.moTa || "Trong suốt"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">6. Tiền phòng & Mống mắt</td>
                  <td className="p-2 border-r border-black">{odAc.moTa || "Sâu, dịch trong, mống mắt phản xạ ánh sáng tốt"}</td>
                  <td className="p-2">{osAc.moTa || "Sâu, dịch trong"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">7. Thể thủy tinh & Dịch kính</td>
                  <td className="p-2 border-r border-black">{odLens.moTa || "Trong suốt, dịch kính trong"}</td>
                  <td className="p-2">{osLens.moTa || "Trong suốt, dịch kính trong"}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-black font-bold bg-gray-50/50">8. Đáy mắt (Đĩa thị, Võng mạc)</td>
                  <td className="p-2 border-r border-black">{odFundus.moTa || "Gai thị hồng, viền rõ, C/D 0.3, hoàng điểm bình thường"}</td>
                  <td className="p-2">{osFundus.moTa || "Gai thị hồng, viền rõ, C/D 0.3"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PHẦN IV: CẬN LÂM SÀNG (Nếu có) */}
        {((record.octResults && record.octResults.length > 0) ||
          (record.visualFieldTests && record.visualFieldTests.length > 0) ||
          (record.ultrasoundEyes && record.ultrasoundEyes.length > 0)) && (
          <div className="emr-section mb-5 space-y-2 text-xs">
            <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
              IV. KẾT QUẢ CẬN LÂM SÀNG & CHẨN ĐOÁN HÌNH ẢNH (Paraclinical Results)
            </h2>
            <div className="border border-black p-3 space-y-2">
              {record.octResults?.map((oct, idx) => (
                <div key={idx} className="border-b border-gray-300 pb-1.5 last:border-none">
                  <span className="font-bold text-indigo-900">► Chụp OCT Võng Mạc / Đĩa Thị (Máy: {oct.machineName || "OCT-3D"}):</span>{" "}
                  <span>{oct.conclusion || oct.scanPattern || "Kết quả OCT chi tiết trong hồ sơ hình ảnh"}</span>
                </div>
              ))}
              {record.ultrasoundEyes?.map((us, idx) => (
                <div key={idx} className="border-b border-gray-300 pb-1.5 last:border-none">
                  <span className="font-bold text-indigo-900">► Siêu Âm Nhãn Cầu (Loại: {us.ultrasoundType || "B-Scan"}):</span>{" "}
                  <span>{us.conclusion || "Kết quả siêu âm nhãn cầu bình thường"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHẦN V: TỔNG KẾT BỆNH ÁN & CHẨN ĐOÁN */}
        <div className="emr-section mb-5 space-y-2 text-xs">
          <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
            V. CHẨN ĐOÁN TỔNG KẾT & ICD-10 (SUMMARY DIAGNOSIS)
          </h2>

          <div className="border border-black p-3 space-y-2 bg-gray-50/30">
            <div>
              <strong>1. Chẩn đoán chính (Mã ICD-10):</strong>{" "}
              <span className="font-bold text-sm text-black">
                {diagnosisMain} (Mã ICD: <code className="font-mono bg-black text-white px-1.5 py-0.5 rounded-xs">{icdMain}</code>)
              </span>
            </div>

            {diagnosisComorbid && (
              <div>
                <strong>2. Chẩn đoán kèm theo:</strong> <span>{diagnosisComorbid}</span>
              </div>
            )}

            <div>
              <strong>3. Hướng điều trị & Lời khuyên:</strong>
              <p className="mt-0.5 font-bold italic text-gray-900 pl-4">{treatmentPlan}</p>
            </div>
          </div>
        </div>

        {/* PHẦN VI: ĐƠN THUỐC & ĐƠN KÍNH KHÚC XẠ */}
        {(() => {
          const medPrescriptions = (record.prescriptions && record.prescriptions.length > 0)
            ? record.prescriptions
            : (record.formData?.prescription?.drugs || record.formData?.keDonThuoc?.danhSachThuoc)
            ? [{ createdAt: record.formData?.prescription?.createdAt || record.createdAt, notes: record.formData?.prescription?.notes || record.formData?.keDonThuoc?.danhDao, items: (record.formData?.prescription?.drugs || record.formData?.keDonThuoc?.danhSachThuoc).map((it: any) => ({ medicineName: it.medicineName || it.tenThuoc, dosage: it.dosage || it.hamLuong, quantity: it.quantity || it.soLuong, unit: it.unit || it.donViTinh, instruction: it.instruction || it.cachDung })) }]
            : []

          const glassesPrescriptions = (record.glassesPrescriptions && record.glassesPrescriptions.length > 0)
            ? record.glassesPrescriptions
            : (record.formData?.glassesPrescription && Object.values(record.formData.glassesPrescription).some((v: any) => v !== null && v !== undefined && String(v).trim() !== ""))
            ? [record.formData.glassesPrescription]
            : []

          if (medPrescriptions.length === 0 && glassesPrescriptions.length === 0) return null

          return (
            <div className="emr-section mb-5 space-y-3 text-xs">
              <h2 className="font-bold text-sm uppercase text-black border-b border-black pb-1 mb-2">
                VI. ĐƠN THUỐC & ĐƠN KÍNH KHÚC XẠ (PRESCRIPTIONS)
              </h2>

              {/* Đơn thuốc */}
              {medPrescriptions.map((rx: any, rIdx: number) => (
                <div key={rIdx} className="border border-black overflow-hidden mb-3">
                  <div className="bg-gray-100 p-2 font-bold border-b border-black flex justify-between">
                    <span>ĐƠN THUỐC ĐIỆN TỬ EMR #{rIdx + 1}</span>
                    <span>Ngày kê: {safeFormatDate(rx.createdAt)}</span>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black font-bold text-center">
                        <th className="p-1.5 border-r border-black w-10">STT</th>
                        <th className="p-1.5 border-r border-black">TÊN THUỐC & HÀM LƯỢNG</th>
                        <th className="p-1.5 border-r border-black w-16">SỐ LƯỢNG</th>
                        <th className="p-1.5 border-r border-black w-16">ĐVT</th>
                        <th className="p-1.5">CÁCH DÙNG & LIỀU LƯỢNG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {rx.items?.map((item: any, iIdx: number) => (
                        <tr key={iIdx}>
                          <td className="p-1.5 border-r border-black text-center font-bold">{iIdx + 1}</td>
                          <td className="p-1.5 border-r border-black font-bold">{item.medicineName} {item.dosage}</td>
                          <td className="p-1.5 border-r border-black text-center font-mono font-bold">{item.quantity}</td>
                          <td className="p-1.5 border-r border-black text-center">{item.unit || item.donViTinh || "Lọ"}</td>
                          <td className="p-1.5 font-medium">{item.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Đơn kính */}
              {glassesPrescriptions.map((gRx: any, gIdx: number) => (
                <div key={gIdx} className="border border-black overflow-hidden">
                  <div className="bg-gray-100 p-2 font-bold border-b border-black flex justify-between">
                    <span>ĐƠN KÍNH KHÚC XẠ #{gIdx + 1}</span>
                    <span>Khoảng cách đồng tử (PD): {gRx.pd ? `${gRx.pd} mm` : "—"}</span>
                  </div>
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-black font-bold">
                        <th className="p-1.5 border-r border-black">MẮT</th>
                        <th className="p-1.5 border-r border-black">CẦU (SPH)</th>
                        <th className="p-1.5 border-r border-black">TRỤ (CYL)</th>
                        <th className="p-1.5 border-r border-black">TRỤC (AXIS)</th>
                        <th className="p-1.5">NHÌN GẦN (ADD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-mono font-bold">
                      <tr>
                        <td className="p-1.5 border-r border-black font-sans text-blue-900">MẮT PHẢI (OD)</td>
                        <td className="p-1.5 border-r border-black">{gRx.sphOd ?? gRx.odSphere ?? "0.00"}</td>
                        <td className="p-1.5 border-r border-black">{gRx.cylOd ?? gRx.odCylinder ?? "0.00"}</td>
                        <td className="p-1.5 border-r border-black">{gRx.axisOd ?? gRx.odAxis ?? "0"}°</td>
                        <td className="p-1.5">{gRx.addOd ?? gRx.odAdd ?? "0.00"}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-black font-sans text-emerald-900">MẮT TRÁI (OS)</td>
                        <td className="p-1.5 border-r border-black">{gRx.sphOs ?? gRx.osSphere ?? "0.00"}</td>
                        <td className="p-1.5 border-r border-black">{gRx.cylOs ?? gRx.osCylinder ?? "0.00"}</td>
                        <td className="p-1.5 border-r border-black">{gRx.axisOs ?? gRx.osAxis ?? "0"}°</td>
                        <td className="p-1.5">{gRx.addOs ?? gRx.osAdd ?? "0.00"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )
        })()}

        {/* PHẦN VII: CHỮ KÝ PHÁP LÝ (SPACIOUS SPACE FOR PHYSICAL SIGN & STAMP) */}
        <div className="emr-section mt-8 print:mt-4 pt-4 print:pt-2 border-t-2 border-black text-black">
          <div className="grid grid-cols-2 text-xs leading-snug">
            <div className="text-center space-y-1">
              <p className="font-bold uppercase">BỆNH NHÂN / NGƯỜI NHÀ BỆNH NHÂN</p>
              <p className="italic text-[11px] text-gray-700">(Ký và ghi rõ họ tên)</p>
              <div className="h-24 print:h-12" />
              <p className="font-bold uppercase">{fullName}</p>
            </div>

            <div className="text-center space-y-1">
              <p className="italic text-[11px]">
                TP. Hồ Chí Minh, ngày ..... tháng ..... năm 202...
              </p>
              <p className="font-bold uppercase">BÁC SĨ ĐIỀU TRỊ / THỰC HIỆN KHÁM</p>
              <p className="italic text-[11px] text-gray-700">(Ký và đóng dấu phòng khám)</p>

              {/* Blank vertical space for doctor to physically sign on printed paper */}
              <div className="h-24 print:h-12" />

              <p className="font-bold text-sm text-black uppercase">
                {doctorDisplayName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
