// components/doctor/medical-record-form/MS15BV01OutpatientMedicalRecordPrint.tsx
"use client"

import React from "react"
import type { GetMedicalRecordDetailResponse } from "@/types"

export interface ClinicProfile {
  soYTe?: string | null
  clinicName?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  khoa?: string | null
}

export interface MS15BV01PrintProps {
  record: GetMedicalRecordDetailResponse
  clinicProfile?: ClinicProfile
}

/** Helper to parse a combined address string into parts */
function parseAddress(fullAddress?: string | null) {
  if (!fullAddress || fullAddress.trim() === "" || fullAddress === "—") {
    return {
      soNhaThonPho: "",
      xaPhuong: "",
      huyenQuanTx: "",
      tinhThanhPho: "",
    }
  }
  const parts = fullAddress.split(",").map((p) => p.trim())
  if (parts.length >= 4) {
    return {
      soNhaThonPho: parts[0],
      xaPhuong: parts[1],
      huyenQuanTx: parts[2],
      tinhThanhPho: parts.slice(3).join(", "),
    }
  } else if (parts.length === 3) {
    return {
      soNhaThonPho: parts[0],
      xaPhuong: parts[1],
      huyenQuanTx: parts[2],
      tinhThanhPho: "",
    }
  } else if (parts.length === 2) {
    return {
      soNhaThonPho: parts[0],
      xaPhuong: parts[1],
      huyenQuanTx: "",
      tinhThanhPho: "",
    }
  }
  return {
    soNhaThonPho: fullAddress,
    xaPhuong: "",
    huyenQuanTx: "",
    tinhThanhPho: "",
  }
}

export default function MS15BV01OutpatientMedicalRecordPrint({
  record,
  clinicProfile,
}: MS15BV01PrintProps) {
  const formData = record.formData || {}
  const benhAn = formData.benhAn || formData
  const khamBenh = formData.khamBenh || {}
  const hanhChinh = benhAn.hanhChinh || {}

  // Safe date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr || dateStr === "—" || dateStr === "null" || dateStr === "undefined") {
      return { day: "", month: "", year: "", full: "" }
    }
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) {
        if (typeof dateStr === "string" && dateStr.includes("-")) {
          const [y, m, dayVal] = dateStr.split("-")
          return { day: dayVal || "", month: m || "", year: y || "", full: `${dayVal}/${m}/${y}` }
        }
        return { day: "", month: "", year: "", full: dateStr }
      }
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = String(d.getFullYear())
      return { day, month, year, full: `${day}/${month}/${year}` }
    } catch {
      return { day: "", month: "", year: "", full: String(dateStr) }
    }
  }

  // Calculate age
  const calcAge = (dobStr?: string | null) => {
    if (!dobStr) return ""
    try {
      const dob = new Date(dobStr)
      if (isNaN(dob.getTime())) return ""
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      return age > 0 ? String(age).padStart(2, "0") : ""
    } catch {
      return ""
    }
  }

  // Clinic & Organization Profile
  const soYTe = (clinicProfile?.soYTe || hanhChinh.soYTe || (record as any).soYTe || "").toUpperCase()
  const clinicName = (clinicProfile?.clinicName || (record as any).clinicName || hanhChinh.tenCoSo || "").toUpperCase()
  const khoaName = (clinicProfile?.khoa || hanhChinh.khoa || (record as any).khoa || "NHÃN KHOA").toUpperCase()

  // Patient Administrative Info
  const rawFullName = record.patientFullName || hanhChinh.hoTen || ""
  const fullName = rawFullName ? rawFullName.toUpperCase() : ""

  const dobObj = formatDate(record.patientDob || hanhChinh.ngaySinh)
  const ageStr = calcAge(record.patientDob || hanhChinh.ngaySinh)
  const rawGender = (record.patientGender || hanhChinh.gioiTinh || "").toUpperCase()
  const isNam = rawGender === "NAM" || rawGender === "MALE" || rawGender === "1"
  const isNu = rawGender === "NỮ" || rawGender === "NU" || rawGender === "FEMALE" || rawGender === "0"

  const job = hanhChinh.ngheNghiep || ""
  const ethnicity = hanhChinh.danToc || ""
  const phone = record.patientPhone || hanhChinh.dienThoai || ""
  const rawAddress = record.patientAddress || hanhChinh.diaChi || ""
  const parsedAddress = parseAddress(rawAddress)
  const bhyt = (hanhChinh.soBHYT || "").replace(/[^A-Za-z0-9]/g, "")
  const bhytExpiry = hanhChinh.bhytDenNgay || ""
  const emergencyContact = hanhChinh.nhaBaoTin || ""
  const emergencyPhone = hanhChinh.dienThoaiNhaBaoTin || (emergencyContact ? phone : "")

  // Payment Subject (Đối tượng: 1.BHYT, 2.Thu phí, 3.Miễn, 4.Khác)
  const doiTuongVal = hanhChinh.doiTuong || (bhyt ? "1" : "2")
  const isBhyt = doiTuongVal === "1" || doiTuongVal === "BHYT"
  const isThuPhi = doiTuongVal === "2" || doiTuongVal === "THU_PHI" || doiTuongVal === "Thu phí"
  const isMien = doiTuongVal === "3" || doiTuongVal === "MIEN" || doiTuongVal === "Miễn"
  const isKhac = doiTuongVal === "4" || doiTuongVal === "KHAC" || doiTuongVal === "Khác"

  // BHYT 15 Digits Box Array Helper
  const bhytDigits = Array.from({ length: 15 }, (_, i) => bhyt[i] || "")

  // Exam Date Time
  const examDateObj = formatDate(record.createdAt)
  const examTime = (() => {
    if (!record.createdAt) return { hour: "", minute: "" }
    try {
      const d = new Date(record.createdAt)
      if (isNaN(d.getTime())) return { hour: "", minute: "" }
      return {
        hour: String(d.getHours()).padStart(2, "0"),
        minute: String(d.getMinutes()).padStart(2, "0"),
      }
    } catch {
      return { hour: "", minute: "" }
    }
  })()

  // Clinical Data
  const lyDoVaoVien = benhAn.lyDoVaoVien || record.chiefComplaint || ""
  const benhSu = benhAn.benhSu || (record as any).summary || ((record as any).illnessDayNumber ? `Bệnh diễn tiến ${(record as any).illnessDayNumber} ngày.` : "")
  const tienSuBanThan = benhAn.tienSuBanThanMat || record.personalHistoryEye || record.personalHistorySystemic || ""
  const tienSuGiaDinh = benhAn.tienSuGiaDinh || record.familyHistory || ""

  // Vitals
  const vitals = khamBenh.khamToanThan || {}
  const mach = vitals.mach ?? record.vitalPulse ?? ""
  const nhietDo = vitals.nhietDo ?? record.vitalTemperature ?? ""
  const huyetAp = vitals.huyetAp ?? record.vitalBloodPressure ?? ""
  const nhipTho = vitals.nhipTho ?? record.vitalRespiratoryRate ?? ""
  const canNang = vitals.canNang ?? record.vitalWeightKg ?? ""

  // Eye Exam Detailed Breakdown
  const odThiLuc = khamBenh.thiLucNhanApVaoVien?.matPhai || (record as any).rightEyeExamBasic || {}
  const osThiLuc = khamBenh.thiLucNhanApVaoVien?.matTrai || (record as any).leftEyeExamBasic || {}
  
  const visualOdKhongKinh = odThiLuc.thiLucKhongKinh || odThiLuc.visionWithoutGlasses || ""
  const visualOsKhongKinh = osThiLuc.thiLucKhongKinh || osThiLuc.visionWithoutGlasses || ""
  const iopOd = odThiLuc.nhanAp || odThiLuc.iopMmHg || ""
  const iopOs = osThiLuc.nhanAp || osThiLuc.iopMmHg || ""

  // Diagnosis & Prescriptions
  const diagnosisMain = benhAn.chanDoanChinh || record.diagnosisMain || ""
  const rawIcd = (benhAn.chanDoanMaICD?.raVienBenhChinhMaICD || (record as any).icdCode || "").replace(/[^A-Za-z0-9]/g, "")
  const icdDigits = Array.from({ length: 4 }, (_, i) => rawIcd[i] || "")

  const diagnosisComorbid = benhAn.chanDoanKemTheo || record.diagnosisComorbid || ""
  const treatmentPlan = benhAn.keHoachDieuTri || record.treatmentPlan || ""

  // Paraclinical Summary
  const paraclinicalSummary = (() => {
    const list: string[] = []
    if (record.octResults && record.octResults.length > 0) {
      list.push(`OCT: ${record.octResults.map(o => o.conclusion || "").filter(Boolean).join("; ")}`)
    }
    if (record.ultrasoundEyes && record.ultrasoundEyes.length > 0) {
      list.push(`Siêu Âm: ${record.ultrasoundEyes.map(u => u.conclusion || "").filter(Boolean).join("; ")}`)
    }
    if (record.visualFieldTests && record.visualFieldTests.length > 0) {
      list.push(`Thị Trường: ${record.visualFieldTests.map((v: any) => v.conclusion || v.testPattern || "").filter(Boolean).join("; ")}`)
    }
    return list.join(". ")
  })()

  // Prescriptions Summary
  const prescriptionSummary = (() => {
    if (record.prescriptions && record.prescriptions.length > 0) {
      const items = record.prescriptions.flatMap(p => p.items || [])
      if (items.length > 0) {
        return items.map((it: any, idx) => `${idx + 1}. ${it.medicineName} ${it.dosage || ""} x ${it.quantity} ${it.unit || it.donViTinh || "viên"} (${it.instruction || ""})`).join("; ")
      }
    }
    const drugs = record.formData?.prescription?.drugs || record.formData?.keDonThuoc?.danhSachThuoc
    if (drugs && drugs.length > 0) {
      return drugs.map((it: any, idx: number) => `${idx + 1}. ${it.medicineName || it.tenThuoc} ${it.dosage || it.hamLuong || ""} x ${it.quantity || it.soLuong} ${it.unit || it.donViTinh || "viên"}`).join("; ")
    }
    return ""
  })()

  const doctorDisplayName = record.doctorFullName
    ? record.doctorFullName.trim().startsWith("BS.")
      ? record.doctorFullName.trim()
      : `BS. ${record.doctorFullName.trim()}`
    : ""

  return (
    <div className="ms15bv01-print-wrapper flex flex-col items-center gap-6 my-4 print:my-0">
      {/* ─────────────────────────────────────────────────────────────
          GLOBAL PRINT STYLES FOR EXACT 2-PAGE A4 PREVIEW & PRINT
          ───────────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

        .font-tnr {
          font-family: "Times New Roman", Times, "Times New Roman PS", Georgia, serif !important;
        }

        .ms15bv01-a4-page {
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          max-height: 297mm;
          padding: 10mm 12mm 10mm 12mm;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
          color: #000000;
          font-family: "Times New Roman", Times, "Times New Roman PS", Georgia, serif !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body, #__next, main, [role="main"] {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            box-sizing: border-box !important;
            font-family: "Times New Roman", Times, "Times New Roman PS", Georgia, serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, header, nav, aside, footer, button, [role="banner"], [role="navigation"] {
            display: none !important;
          }
          .ms15bv01-print-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
          }
          .ms15bv01-a4-page {
            width: 100% !important;
            max-width: 100% !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm 12mm 10mm 12mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .ms15bv01-a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }

        .digit-box-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 18px;
          border: 1px solid #000;
          font-family: "Times New Roman", Times, serif !important;
          font-weight: bold;
          font-size: 9pt;
          margin-right: 1px;
        }

        .check-box-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 13px;
          height: 13px;
          border: 1px solid #000;
          font-size: 8pt;
          font-weight: bold;
          margin: 0 2px;
        }

        .dotted-field {
          border-bottom: 1px dotted #222;
          min-height: 18px;
          display: inline-block;
          word-break: break-word;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          TRANG 1: BỆNH ÁN NGOẠI TRÚ (A4 SHEET 1)
          ───────────────────────────────────────────────────────────── */}
      <div className="ms15bv01-a4-page font-tnr text-[9.5pt] leading-snug space-y-0.5">
        {/* Top Header Block - Centered Title & Balanced Columns */}
        <div className="flex justify-between items-start pt-1">
          <div className="w-4/12 space-y-0.5 text-[9.5pt]">
            <p>Sở Y tế: <span className="font-semibold">{soYTe || "................................................"}</span></p>
            <p>Bệnh viện: <span className="font-bold uppercase">{clinicName || "................................................"}</span></p>
          </div>

          <div className="w-5/12 text-center">
            <h1 className="text-[14pt] font-bold uppercase tracking-wide font-tnr leading-tight">BỆNH ÁN NGOẠI TRÚ</h1>
            <p className="text-[10pt] font-semibold mt-0.5">KHOA: {khoaName}</p>
          </div>

          <div className="w-3/12 text-right text-[8.5pt] space-y-0.5 font-tnr">
            <p className="font-bold">MS: 15/BV-01</p>
            <p>Số ngoại trú: <strong className="font-tnr">{record.id ? record.id.slice(0, 8).toUpperCase() : "............"}</strong></p>
            <p>Số lưu trữ: <strong className="font-tnr">{record.appointmentId ? record.appointmentId.slice(0, 6).toUpperCase() : "............"}</strong></p>
          </div>
        </div>

        {/* I. HÀNH CHÍNH */}
        <div className="space-y-0.5 pt-0.5 font-tnr">
          <h2 className="font-bold text-[10.5pt] uppercase">I. HÀNH CHÍNH:</h2>

          {/* 1 & 2 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <span>1. Họ và tên <i>(In hoa)</i>:</span>
              <span className="font-bold uppercase text-[11pt] ml-1.5 tracking-wider">
                {fullName || <span className="dotted-field w-48"></span>}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span>2. Sinh ngày:</span>
              <div className="flex items-center ml-0.5">
                <span className="digit-box-sm">{dobObj.day[0] || ""}</span>
                <span className="digit-box-sm">{dobObj.day[1] || ""}</span>
                <span className="mx-0.5">/</span>
                <span className="digit-box-sm">{dobObj.month[0] || ""}</span>
                <span className="digit-box-sm">{dobObj.month[1] || ""}</span>
                <span className="mx-0.5">/</span>
                <span className="digit-box-sm">{dobObj.year[0] || ""}</span>
                <span className="digit-box-sm">{dobObj.year[1] || ""}</span>
                <span className="digit-box-sm">{dobObj.year[2] || ""}</span>
                <span className="digit-box-sm">{dobObj.year[3] || ""}</span>
              </div>
              <span className="ml-2">Tuổi:</span>
              <div className="flex items-center ml-0.5">
                <span className="digit-box-sm">{ageStr[0] || ""}</span>
                <span className="digit-box-sm">{ageStr[1] || ""}</span>
              </div>
            </div>
          </div>

          {/* 3, 4, 5 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span>3. Giới:</span>
              <span className="ml-1.5">1. Nam</span>
              <span className="check-box-sm">{isNam ? "x" : ""}</span>
              <span className="ml-1.5">2. Nữ</span>
              <span className="check-box-sm">{isNu ? "x" : ""}</span>
            </div>

            <div className="flex items-center flex-1 ml-2">
              <span>4. Nghề nghiệp:</span>
              <span className="font-medium ml-1 dotted-field flex-1">{job}</span>
              <div className="flex items-center ml-1">
                <span className="digit-box-sm">{job ? "0" : ""}</span>
                <span className="digit-box-sm">{job ? "1" : ""}</span>
              </div>
            </div>

            <div className="flex items-center ml-2">
              <span>5. Dân tộc:</span>
              <span className="font-medium ml-1">{ethnicity}</span>
              <div className="flex items-center ml-1">
                <span className="digit-box-sm">{ethnicity ? "0" : ""}</span>
                <span className="digit-box-sm">{ethnicity ? "1" : ""}</span>
              </div>
            </div>
          </div>

          {/* 6 & 7 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <span>6. Ngoại kiều:</span>
              <span className="check-box-sm ml-1"></span>
              <div className="flex items-center ml-1">
                <span className="digit-box-sm"></span>
                <span className="digit-box-sm"></span>
              </div>
              <span className="ml-2">7. Địa chỉ: Số nhà:</span>
              <span className="font-medium ml-1 flex-1 dotted-field">{parsedAddress.soNhaThonPho}</span>
              <span className="ml-2">Thôn, phố:</span>
              <span className="font-medium ml-1 flex-1 dotted-field">{parsedAddress.soNhaThonPho}</span>
              <span className="ml-2">Xã, phường:</span>
              <span className="font-medium ml-1 flex-1 dotted-field">{parsedAddress.xaPhuong}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <span>Huyện (Q, Tx):</span>
              <span className="font-medium ml-1 flex-1 dotted-field">{parsedAddress.huyenQuanTx}</span>
              <span className="ml-2">Tỉnh, thành phố:</span>
              <span className="font-medium ml-1 flex-1 dotted-field">{parsedAddress.tinhThanhPho}</span>
              <div className="flex items-center ml-1">
                <span className="digit-box-sm"></span>
                <span className="digit-box-sm"></span>
              </div>
            </div>
          </div>

          {/* 8 & 9 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <span>8. Nơi làm việc:</span>
              <span className="font-medium ml-1 dotted-field flex-1"></span>
            </div>

            <div className="flex items-center ml-2">
              <span>9. Đối tượng:</span>
              <span className="ml-1">1.BHYT</span>
              <span className="check-box-sm">{isBhyt ? "x" : ""}</span>
              <span className="ml-1">2.Thu phí</span>
              <span className="check-box-sm">{isThuPhi ? "x" : ""}</span>
              <span className="ml-1">3.Miễn</span>
              <span className="check-box-sm">{isMien ? "x" : ""}</span>
              <span className="ml-1">4.Khác</span>
              <span className="check-box-sm">{isKhac ? "x" : ""}</span>
              <div className="flex items-center ml-1">
                <span className="digit-box-sm">{doiTuongVal ? doiTuongVal : ""}</span>
              </div>
            </div>
          </div>

          {/* 10 */}
          <div className="flex items-center">
            <span>10. BHYT giá trị đến ngày:</span>
            <span className="font-medium ml-1">{bhytExpiry}</span>
            <span className="ml-3">Số thẻ BHYT:</span>
            <div className="flex items-center ml-1.5">
              {bhytDigits.map((digit, idx) => (
                <span key={idx} className="digit-box-sm font-mono">{digit}</span>
              ))}
            </div>
          </div>

          {/* 11 */}
          <div className="flex items-center">
            <span>11. Họ tên, địa chỉ người nhà khi cần báo tin:</span>
            <span className="font-medium ml-1 flex-1 dotted-field">{emergencyContact}</span>
            <span className="ml-2">Điện thoại số:</span>
            <span className="font-medium ml-1">{emergencyPhone}</span>
          </div>

          {/* 12 & 13 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span>12. Đến khám bệnh lúc:</span>
              <span className="font-bold ml-1">{examTime.hour}</span>
              <span className="ml-0.5">giờ</span>
              <span className="font-bold ml-1">{examTime.minute}</span>
              <span className="ml-0.5">phút ngày</span>
              <span className="font-bold ml-1">{examDateObj.day}</span>
              <span className="ml-0.5">tháng</span>
              <span className="font-bold ml-1">{examDateObj.month}</span>
              <span className="ml-0.5">năm</span>
              <span className="font-bold ml-1">{examDateObj.year}</span>
            </div>

            <div className="flex items-center">
              <span>13. Chẩn đoán nơi giới thiệu:</span>
              <span className="ml-1.5">1. Y tế</span>
              <span className="check-box-sm"></span>
              <span className="ml-1">2. Tự đến</span>
              <span className="check-box-sm">x</span>
            </div>
          </div>
        </div>

        {/* II. LÝ DO VÀO VIỆN */}
        <div className="pt-0.5">
          <div className="flex items-baseline">
            <h2 className="font-bold text-[10.5pt] uppercase whitespace-nowrap">II. LÝ DO VÀO VIỆN:</h2>
            <span className="font-medium ml-1.5 flex-1 dotted-field">{lyDoVaoVien}</span>
          </div>
        </div>

        {/* III. HỎI BỆNH */}
        <div className="space-y-0.5 pt-0.5 font-tnr">
          <h2 className="font-bold text-[10.5pt] uppercase">III. HỎI BỆNH:</h2>

          <div>
            <span className="font-bold">1. Quá trình bệnh lý:</span>
            <p className="dotted-field w-full pl-2 font-medium">{benhSu}</p>
          </div>

          <div>
            <span className="font-bold">2. Tiền sử bệnh:</span>
            <div className="pl-2 space-y-0.5">
              <p className="dotted-field w-full"><span className="font-semibold">+ Bản thân:</span> {tienSuBanThan}</p>
              <p className="dotted-field w-full"><span className="font-semibold">+ Gia đình:</span> {tienSuGiaDinh}</p>
            </div>
          </div>
        </div>

        {/* IV. KHÁM BỆNH - Fixed Side-by-Side layout preventing Vitals Box overlap */}
        <div className="space-y-0.5 pt-0.5 font-tnr">
          {/* Top Section: Left (IV. KHÁM BỆNH + 1. Toàn thân) & Right (Vitals Box) */}
          <div className="flex justify-between items-start gap-2">
            {/* Left Column constrained to space next to Vitals Box */}
            <div className="flex-1 space-y-0.5 pr-2">
              <h2 className="font-bold text-[10.5pt] uppercase">IV. KHÁM BỆNH:</h2>
              <div>
                <span className="font-bold">1. Toàn thân:</span>
                <p className="dotted-field w-full pl-2 font-medium">
                  {record.systemicExam || (mach || nhietDo || huyetAp ? "Bệnh nhân tỉnh táo, tiếp xúc tốt. Niêm mạc hồng." : "")}
                </p>
              </div>
            </div>

            {/* Right Column: Vitals Table Box */}
            <div className="border border-black p-1 text-[8.5pt] w-[180px] shrink-0 space-y-0.5 font-tnr">
              <div className="flex justify-between"><span>Mạch.......................</span><span className="font-bold">{mach ? `${mach} lần/ph` : ""}</span></div>
              <div className="flex justify-between"><span>Nhiệt độ...................</span><span className="font-bold">{nhietDo ? `${nhietDo} °C` : ""}</span></div>
              <div className="flex justify-between"><span>Huyết áp........../......</span><span className="font-bold">{huyetAp ? `${huyetAp} mmHg` : ""}</span></div>
              <div className="flex justify-between"><span>Nhịp thở...................</span><span className="font-bold">{nhipTho ? `${nhipTho} lần/ph` : ""}</span></div>
              <div className="flex justify-between"><span>Cân nặng...................</span><span className="font-bold">{canNang ? `${canNang} kg` : ""}</span></div>
            </div>
          </div>

          {/* Full-width Section below Vitals Box */}
          <div className="space-y-0.5 pt-0.5">
            <div>
              <span className="font-bold">2. Các bộ phận (Khám chuyên khoa Nhãn Khoa):</span>
              <div className="pl-2 space-y-0.5 text-[9.5pt]">
                <p className="dotted-field w-full">
                  <strong>+ Mắt Phải (OD):</strong> {visualOdKhongKinh ? `Thị lực không kính: ${visualOdKhongKinh}; ` : ""}{iopOd ? `Nhãn áp: ${iopOd} mmHg.` : ""}
                </p>
                <p className="dotted-field w-full">
                  <strong>+ Mắt Trái (OS):</strong> {visualOsKhongKinh ? `Thị lực không kính: ${visualOsKhongKinh}; ` : ""}{iopOs ? `Nhãn áp: ${iopOs} mmHg.` : ""}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold">3. Tóm tắt kết quả cận lâm sàng:</span>
              <p className="dotted-field w-full pl-2 font-medium">{paraclinicalSummary}</p>
            </div>

            <div>
              <span className="font-bold">4. Chẩn đoán ban đầu:</span>
              <p className="dotted-field w-full pl-2 font-bold text-black">{diagnosisMain}</p>
            </div>

            <div>
              <span className="font-bold">5. Đã xử lý (thuốc, chăm sóc):</span>
              <p className="dotted-field w-full pl-2 font-medium">{prescriptionSummary}</p>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center flex-1">
                <span className="font-bold">6. Chẩn đoán khi ra viện:</span>
                <span className="font-bold ml-1.5 text-[11pt]">{diagnosisMain}</span>
              </div>
              <div className="flex items-center ml-2">
                <span>Mã</span>
                <div className="flex items-center ml-1">
                  {icdDigits.map((digit, idx) => (
                    <span key={idx} className="digit-box-sm font-mono">{digit}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center pt-0.5">
              <span className="font-bold">7. Điều trị ngoại trú từ ngày</span>
              <span className="font-semibold ml-1">{examDateObj.full}</span>
              <span className="ml-2 font-bold">đến ngày</span>
              <span className="font-semibold ml-1">{examDateObj.full}</span>
            </div>
          </div>
        </div>

        {/* Page 1 Signatures */}
        <div className="pt-2 flex justify-between items-start text-center text-[9.5pt] avoid-break font-tnr">
          <div className="w-1/2 space-y-0.5">
            <p className="font-bold uppercase">Giám đốc bệnh viện</p>
            <p className="italic text-[8.5pt] text-gray-600">(Ký tên và đóng dấu)</p>
            <div className="h-10"></div>
            <p className="font-bold uppercase text-[10pt]">................................................</p>
          </div>

          <div className="w-1/2 space-y-0.5">
            <p className="italic text-[9pt]">
              {examDateObj.day ? `Ngày ${examDateObj.day} tháng ${examDateObj.month} năm ${examDateObj.year}` : "Ngày ..... tháng ..... năm 20..."}
            </p>
            <p className="font-bold uppercase">Bác sĩ khám bệnh</p>
            <p className="italic text-[8.5pt] text-gray-600">(Ký và ghi rõ họ tên)</p>
            <div className="h-10"></div>
            <p className="font-bold uppercase text-[10pt]">{doctorDisplayName || "................................................"}</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TRANG 2: TỔNG KẾT BỆNH ÁN (A4 SHEET 2)
          ───────────────────────────────────────────────────────────── */}
      <div className="ms15bv01-a4-page font-tnr text-[9.5pt] leading-snug space-y-1.5 text-black">
        {/* Page 2 Top Header */}
        <div className="flex justify-between items-center text-[9.5pt]">
          <div>Họ và tên: <strong className="uppercase">{fullName || "................................................"}</strong></div>
          <div>Họ và tên: <strong className="uppercase">{fullName || "................................................"}</strong></div>
        </div>

        <h1 className="text-[13.5pt] font-bold uppercase text-center tracking-wide my-1 font-tnr">TỔNG KẾT BỆNH ÁN:</h1>

        <div className="space-y-1.5 text-[9.5pt] font-tnr">
          <div>
            <span className="font-bold">1. Quá trình bệnh lý và diễn biến lâm sàng:</span>
            <p className="dotted-field w-full pl-2 font-medium leading-relaxed">
              {benhSu || "................................................................................................................................................................"}
            </p>
          </div>

          <div>
            <span className="font-bold">2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:</span>
            <p className="dotted-field w-full pl-2 font-medium leading-relaxed">
              {paraclinicalSummary || "................................................................................................................................................................"}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="font-bold">3. Chẩn đoán ra viện:</span>
            <div className="pl-2 space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="dotted-field flex-1">
                  <span className="font-semibold">- Bệnh chính:</span> <strong className="text-black">{diagnosisMain}</strong>
                </p>
                <div className="flex items-center ml-2">
                  <span className="text-[9pt]">Mã</span>
                  <div className="flex items-center ml-1">
                    {icdDigits.map((digit, idx) => (
                      <span key={idx} className="digit-box-sm font-mono">{digit}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="dotted-field w-full">
                <span className="font-semibold">- Bệnh kèm theo (nếu có):</span> {diagnosisComorbid}
              </p>
            </div>
          </div>

          <div>
            <span className="font-bold">4. Phương pháp điều trị:</span>
            <p className="dotted-field w-full pl-2 font-medium leading-relaxed">
              {treatmentPlan || "................................................................................................................................................................"}
            </p>
          </div>

          <div>
            <span className="font-bold">5. Tình trạng người bệnh ra viện:</span>
            <p className="dotted-field w-full pl-2 font-medium">
              {diagnosisMain ? "Tình trạng người bệnh ổn định, triệu chứng thuyên giảm." : "................................................................................................................................................................"}
            </p>
          </div>

          <div>
            <span className="font-bold">6. Hướng điều trị và các chế độ tiếp theo:</span>
            <p className="dotted-field w-full pl-2 font-medium">
              {prescriptionSummary ? "Điều trị theo đơn thuốc, tái khám theo lịch hẹn." : "................................................................................................................................................................"}
            </p>
          </div>
        </div>

        {/* Table of Records & Document Signatures Side-by-Side */}
        <div className="pt-2 avoid-break flex items-start gap-4 font-tnr">
          {/* Left Table - Dynamically populated counts from record */}
          <div className="w-1/2">
            <table className="w-full border-collapse border border-black text-[9pt]">
              <thead>
                <tr className="font-bold text-center border-b border-black">
                  <th className="p-1 border-r border-black w-3/4 text-left">Hồ sơ, phim, ảnh</th>
                  <th className="p-1 w-1/4">Số tờ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1 border-r border-black">- X - quang</td>
                  <td className="p-1 text-center font-mono font-bold"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 border-r border-black">- CT Scanner</td>
                  <td className="p-1 text-center font-mono font-bold"></td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 border-r border-black">- Siêu âm</td>
                  <td className="p-1 text-center font-mono font-bold">{record.ultrasoundEyes?.length || ""}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 border-r border-black">- Xét nghiệm</td>
                  <td className="p-1 text-center font-mono font-bold">{record.octResults?.length || ""}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1 border-r border-black">- Khác</td>
                  <td className="p-1 text-center font-mono font-bold">{record.prescriptions?.length || ""}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-1 border-r border-black">- Toàn bộ hồ sơ</td>
                  <td className="p-1 text-center font-mono font-bold">2</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Handover & Doctor Signatures */}
          <div className="w-1/2 space-y-2.5 text-[9.5pt]">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <p className="font-bold">Người giao hồ sơ:</p>
                <p className="pt-3">Họ tên...................................</p>
              </div>

              <div className="text-right space-y-0.5">
                <p className="italic">{examDateObj.day ? `Ngày ${examDateObj.day} tháng ${examDateObj.month} năm ${examDateObj.year}` : "Ngày ..... tháng ..... năm 20..."}</p>
                <p className="font-bold text-center">Bác sĩ điều trị</p>
              </div>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div className="space-y-0.5">
                <p className="font-bold">Người nhận hồ sơ:</p>
                <p className="pt-4">Họ tên...................................</p>
              </div>

              <div className="text-center font-bold uppercase text-[10pt] pb-0.5">
                {doctorDisplayName || "..................................."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
