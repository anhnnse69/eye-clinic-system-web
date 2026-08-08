import * as XLSX from "xlsx"
import { ExportClinicReportResponse } from "@/services/clinic-dashboard.service"

export function generateClinicReportExcel(data: ExportClinicReportResponse) {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Thông tin cơ sở & Thống kê
  const clinicInfoRows = [
    ["BÁO CÁO TỔNG QUAN PHÒNG KHÁM"],
    [],
    ["Tên cơ sở:", data.clinicInfo.name || ""],
    ["Địa chỉ:", data.clinicInfo.address || ""],
    ["Số điện thoại:", data.clinicInfo.phone || ""],
    ["Email:", data.clinicInfo.email || ""],
    ["Giờ mở cửa:", `${data.clinicInfo.openTime || ""} - ${data.clinicInfo.closeTime || ""}`],
    ["Đánh giá trung bình:", data.clinicInfo.ratingAvg ?? 0],
    ["Số lượt đánh giá:", data.clinicInfo.reviewCount ?? 0],
    ["Trạng thái hoạt động:", data.clinicInfo.isActive ? "Đang hoạt động" : "Đã ngưng"],
    ["Trạng thái xuất bản:", data.clinicInfo.isPublished ? "Đã xuất bản" : "Chưa xuất bản"],
    ["Ngày tạo hệ thống:", data.clinicInfo.createdAt ? new Date(data.clinicInfo.createdAt).toLocaleDateString("vi-VN") : ""],
    [],
    ["TỔNG QUAN SỐ LIỆU HỆ THỐNG"],
    ["Chỉ số", "Số lượng"],
    ["Tổng số nhân viên", data.clinicInfo.totalStaffs],
    ["Tổng số hồ sơ bệnh án", data.clinicInfo.totalMedicalRecords],
    ["Tổng số dịch vụ y tế", data.clinicInfo.totalServices],
    ["Tổng số phòng chức năng", data.clinicInfo.totalRooms],
  ]
  const sheet1 = XLSX.utils.aoa_to_sheet(clinicInfoRows)
  sheet1["!cols"] = [{ wch: 25 }, { wch: 45 }]
  XLSX.utils.book_append_sheet(workbook, sheet1, "Thông tin cơ sở")

  // Sheet 2: Danh sách nhân viên
  const staffHeaders = ["STT", "Họ và tên", "Email", "Số điện thoại", "Chức vụ", "Trạng thái", "Ngày tạo"]
  const staffRows = data.staffs.map((s, idx) => [
    idx + 1,
    s.fullName,
    s.email,
    s.phone,
    s.role,
    s.isActive ? "Hoạt động" : "Tạm khóa",
    s.createdAt ? new Date(s.createdAt).toLocaleDateString("vi-VN") : ""
  ])
  const sheet2 = XLSX.utils.aoa_to_sheet([["DANH SÁCH NHÂN VIÊN PHÒNG KHÁM"], [], staffHeaders, ...staffRows])
  sheet2["!cols"] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, sheet2, "Danh sách nhân viên")

  // Sheet 3: Hồ sơ bệnh án
  const recordHeaders = [
    "STT",
    "Tên bệnh nhân",
    "Số điện thoại",
    "Giới tính",
    "Ngày sinh",
    "Bác sĩ phụ trách",
    "Loại bệnh án",
    "Lý do khám",
    "Tóm tắt chẩn đoán",
    "Ghi chú / Dặn dò",
    "Trạng thái",
    "Ngày chốt bệnh án",
    "Ngày khám/tạo"
  ]
  const recordRows = data.medicalRecords.map((r, idx) => [
    idx + 1,
    r.patientName,
    r.patientPhone,
    r.patientGender,
    r.patientDob,
    r.doctorName,
    r.recordType,
    r.chiefComplaint || "",
    r.summary || "",
    r.notes || "",
    r.status,
    r.finalizedAt ? new Date(r.finalizedAt).toLocaleDateString("vi-VN") : "",
    r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : ""
  ])
  const sheet3 = XLSX.utils.aoa_to_sheet([["DANH SÁCH HỒ SƠ BỆNH ÁN CƠ SỞ"], [], recordHeaders, ...recordRows])
  sheet3["!cols"] = [
    { wch: 6 }, { wch: 22 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
    { wch: 22 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 25 },
    { wch: 15 }, { wch: 18 }, { wch: 15 }
  ]
  XLSX.utils.book_append_sheet(workbook, sheet3, "Hồ sơ bệnh án")

  // Sheet 4: Dịch vụ & Phòng
  const serviceHeaders = ["STT", "Tên dịch vụ", "Đơn giá (VNĐ)", "Thời lượng (Phút)", "Trạng thái"]
  const serviceRows = data.services.map((s, idx) => [
    idx + 1,
    s.serviceName,
    s.price,
    s.durationMinutes,
    s.isActive ? "Hoạt động" : "Ngưng"
  ])
  
  const roomHeaders = ["STT", "Tên phòng", "Loại phòng", "Trạng thái"]
  const roomRows = data.rooms.map((r, idx) => [
    idx + 1,
    r.roomName,
    r.roomType || "",
    r.isActive ? "Hoạt động" : "Ngưng"
  ])

  const sheet4Data = [
    ["DANH SÁCH DỊCH VỤ KHÁM CHỮA BỆNH"],
    serviceHeaders,
    ...serviceRows,
    [],
    ["DANH SÁCH PHÒNG CHỨC NĂNG"],
    roomHeaders,
    ...roomRows
  ]
  const sheet4 = XLSX.utils.aoa_to_sheet(sheet4Data)
  sheet4["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, sheet4, "Dịch vụ & Phòng")

  // File Name
  const cleanName = (data.clinicInfo.name || "Clinic").replace(/[/\\?%*:|"<>]/g, "-")
  const todayStr = new Date().toISOString().split("T")[0]
  const fileName = `BaoCao_PhongKham_${cleanName}_${todayStr}.xlsx`

  XLSX.writeFile(workbook, fileName)
}
