import * as XLSX from "xlsx"
import { ExportClinicReportResponse } from "@/services/clinic-dashboard.service"

export function generateClinicReportExcel(data: ExportClinicReportResponse, locale: string = "vi") {
  const isEn = locale === "en"
  const dateLoc = isEn ? "en-US" : "vi-VN"

  const workbook = XLSX.utils.book_new()

  // Helper mappings
  const mapRole = (role?: string) => {
    if (!role) return ""
    if (role === "Bác sĩ" || role === "DOCTOR") return isEn ? "Doctor" : "Bác sĩ"
    if (role === "Tiếp tân" || role === "RECEPTIONIST") return isEn ? "Receptionist" : "Tiếp tân"
    if (role === "Quản lý phòng khám" || role === "CLINIC_ADMIN") return isEn ? "Clinic Admin" : "Quản lý phòng khám"
    return role
  }

  const mapGender = (gender?: string) => {
    if (!gender) return ""
    if (gender === "Nam" || gender === "MALE") return isEn ? "Male" : "Nam"
    if (gender === "Nữ" || gender === "FEMALE") return isEn ? "Female" : "Nữ"
    return isEn ? "Other" : "Khác"
  }

  const mapRecordType = (recordType?: string) => {
    if (!recordType) return ""
    const upper = recordType.toUpperCase()
    if (upper === "GENERAL") return isEn ? "General" : "Tổng quát"
    if (upper === "SPECIALIST") return isEn ? "Specialist" : "Chuyên khoa"
    if (upper === "INITIAL_EXAM") return isEn ? "Initial Exam" : "Khám đầu"
    if (upper === "RE_EXAM" || upper === "FOLLOW_UP") return isEn ? "Follow-up" : "Tái khám"
    if (upper === "EMERGENCY") return isEn ? "Emergency" : "Cấp cứu"
    return recordType
  }

  const mapRecordStatus = (status?: string) => {
    if (!status) return ""
    const upper = status.toUpperCase()
    if (upper === "DRAFT") return isEn ? "Draft" : "Nháp"
    if (upper === "FINALIZED") return isEn ? "Finalized" : "Đã chốt"
    if (upper === "CANCELLED" || upper === "CANCELED") return isEn ? "Cancelled" : "Đã hủy"
    return status
  }

  // Sheet 1: Thông tin cơ sở & Thống kê / Clinic Overview & Metrics
  const clinicInfoRows = [
    [isEn ? "CLINIC OVERVIEW REPORT" : "BÁO CÁO TỔNG QUAN PHÒNG KHÁM"],
    [],
    [isEn ? "Clinic Name:" : "Tên cơ sở:", data.clinicInfo.name || ""],
    [isEn ? "Address:" : "Địa chỉ:", data.clinicInfo.address || ""],
    [isEn ? "Phone Number:" : "Số điện thoại:", data.clinicInfo.phone || ""],
    [isEn ? "Email:" : "Email:", data.clinicInfo.email || ""],
    [isEn ? "Opening Hours:" : "Giờ mở cửa:", `${data.clinicInfo.openTime || ""} - ${data.clinicInfo.closeTime || ""}`],
    [isEn ? "Average Rating:" : "Đánh giá trung bình:", data.clinicInfo.ratingAvg ?? 0],
    [isEn ? "Total Reviews:" : "Số lượt đánh giá:", data.clinicInfo.reviewCount ?? 0],
    [isEn ? "Operating Status:" : "Trạng thái hoạt động:", data.clinicInfo.isActive ? (isEn ? "Active" : "Đang hoạt động") : (isEn ? "Inactive" : "Đã ngưng")],
    [isEn ? "Publish Status:" : "Trạng thái xuất bản:", data.clinicInfo.isPublished ? (isEn ? "Published" : "Đã xuất bản") : (isEn ? "Unpublished" : "Chưa xuất bản")],
    [isEn ? "System Creation Date:" : "Ngày tạo hệ thống:", data.clinicInfo.createdAt ? new Date(data.clinicInfo.createdAt).toLocaleDateString(dateLoc) : ""],
    [],
    [isEn ? "SYSTEM METRICS OVERVIEW" : "TỔNG QUAN SỐ LIỆU HỆ THỐNG"],
    [isEn ? "Metric" : "Chỉ số", isEn ? "Quantity" : "Số lượng"],
    [isEn ? "Total Staff" : "Tổng số nhân viên", data.clinicInfo.totalStaffs],
    [isEn ? "Total Medical Records" : "Tổng số hồ sơ bệnh án", data.clinicInfo.totalMedicalRecords],
    [isEn ? "Total Medical Services" : "Tổng số dịch vụ y tế", data.clinicInfo.totalServices],
    [isEn ? "Total Clinic Rooms" : "Tổng số phòng chức năng", data.clinicInfo.totalRooms],
  ]
  const sheet1 = XLSX.utils.aoa_to_sheet(clinicInfoRows)
  sheet1["!cols"] = [{ wch: 25 }, { wch: 45 }]
  XLSX.utils.book_append_sheet(workbook, sheet1, isEn ? "Clinic Overview" : "Thông tin cơ sở")

  // Sheet 2: Danh sách nhân viên / Staff List
  const staffHeaders = isEn
    ? ["No.", "Full Name", "Email", "Phone Number", "Role", "Status", "Created Date"]
    : ["STT", "Họ và tên", "Email", "Số điện thoại", "Chức vụ", "Trạng thái", "Ngày tạo"]

  const staffRows = data.staffs.map((s, idx) => [
    idx + 1,
    s.fullName,
    s.email,
    s.phone,
    mapRole(s.role),
    s.isActive ? (isEn ? "Active" : "Hoạt động") : (isEn ? "Suspended" : "Tạm khóa"),
    s.createdAt ? new Date(s.createdAt).toLocaleDateString(dateLoc) : ""
  ])
  const sheet2 = XLSX.utils.aoa_to_sheet([
    [isEn ? "CLINIC STAFF LIST" : "DANH SÁCH NHÂN VIÊN PHÒNG KHÁM"],
    [],
    staffHeaders,
    ...staffRows
  ])
  sheet2["!cols"] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, sheet2, isEn ? "Staff List" : "Danh sách nhân viên")

  // Sheet 3: Hồ sơ bệnh án / Medical Records
  const recordHeaders = isEn
    ? [
        "No.",
        "Patient Name",
        "Phone Number",
        "Gender",
        "Date of Birth",
        "Attending Doctor",
        "Record Type",
        "Chief Complaint",
        "Diagnosis Summary",
        "Notes / Instructions",
        "Status",
        "Finalized Date",
        "Created Date"
      ]
    : [
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
    mapGender(r.patientGender),
    r.patientDob,
    r.doctorName,
    mapRecordType(r.recordType),
    r.chiefComplaint || "",
    r.summary || "",
    r.notes || "",
    mapRecordStatus(r.status),
    r.finalizedAt ? new Date(r.finalizedAt).toLocaleDateString(dateLoc) : "",
    r.createdAt ? new Date(r.createdAt).toLocaleDateString(dateLoc) : ""
  ])
  const sheet3 = XLSX.utils.aoa_to_sheet([
    [isEn ? "CLINIC MEDICAL RECORDS" : "DANH SÁCH HỒ SƠ BỆNH ÁN CƠ SỞ"],
    [],
    recordHeaders,
    ...recordRows
  ])
  sheet3["!cols"] = [
    { wch: 6 }, { wch: 22 }, { wch: 15 }, { wch: 10 }, { wch: 12 },
    { wch: 22 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 25 },
    { wch: 15 }, { wch: 18 }, { wch: 15 }
  ]
  XLSX.utils.book_append_sheet(workbook, sheet3, isEn ? "Medical Records" : "Hồ sơ bệnh án")

  // Sheet 4: Dịch vụ & Phòng / Services & Rooms
  const serviceHeaders = isEn
    ? ["No.", "Service Name", "Price (VND)", "Duration (Mins)", "Status"]
    : ["STT", "Tên dịch vụ", "Đơn giá (VNĐ)", "Thời lượng (Phút)", "Trạng thái"]

  const serviceRows = data.services.map((s, idx) => [
    idx + 1,
    s.serviceName,
    s.price,
    s.durationMinutes,
    s.isActive ? (isEn ? "Active" : "Hoạt động") : (isEn ? "Inactive" : "Ngưng")
  ])

  const roomHeaders = isEn
    ? ["No.", "Room Name", "Room Type", "Status"]
    : ["STT", "Tên phòng", "Loại phòng", "Trạng thái"]

  const roomRows = data.rooms.map((r, idx) => [
    idx + 1,
    r.roomName,
    r.roomType || "",
    r.isActive ? (isEn ? "Active" : "Hoạt động") : (isEn ? "Inactive" : "Ngưng")
  ])

  const sheet4Data = [
    [isEn ? "MEDICAL SERVICES LIST" : "DANH SÁCH DỊCH VỤ KHÁM CHỮA BỆNH"],
    serviceHeaders,
    ...serviceRows,
    [],
    [isEn ? "CLINIC ROOMS LIST" : "DANH SÁCH PHÒNG CHỨC NĂNG"],
    roomHeaders,
    ...roomRows
  ]
  const sheet4 = XLSX.utils.aoa_to_sheet(sheet4Data)
  sheet4["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, sheet4, isEn ? "Services & Rooms" : "Dịch vụ & Phòng")

  // File Name
  const cleanName = (data.clinicInfo.name || "Clinic").replace(/[/\\?%*:|"<>]/g, "-")
  const todayStr = new Date().toISOString().split("T")[0]
  const fileName = isEn
    ? `Clinic_Report_${cleanName}_${todayStr}.xlsx`
    : `BaoCao_PhongKham_${cleanName}_${todayStr}.xlsx`

  XLSX.writeFile(workbook, fileName)
}
