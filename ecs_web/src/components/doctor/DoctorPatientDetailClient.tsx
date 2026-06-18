"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  Stethoscope,
  FileText,
  Pill,
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  Fingerprint,
  HeartPulse,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  ShieldAlert,
  Globe,
  Smartphone,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

type AppointmentStatus =
  | "PENDING"
  | "DEPOSIT_PAID"
  | "BOOKED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NOSHOW";

interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency?: string;
  durationDays?: number;
  quantity: number;
  instruction?: string;
}

interface Prescription {
  id: string;
  notes?: string;
  createdAt: string;
  items: PrescriptionItem[];
}

interface MedicalRecord {
  id: string;
  appointmentId: string;
  recordType: string;
  chiefComplaint?: string;
  diagnosisMain?: string;
  diagnosisComorbid?: string;
  treatmentPlan?: string;
  notes?: string;
  isLocked: boolean;
  createdAt: string;
  prescriptions: Prescription[];
}

interface AppointmentHistory {
  appointmentId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  symptoms?: string;
  serviceName?: string;
  doctorName?: string;
  specialtyName?: string;
  bookingSource?: string;
  medicalRecord?: MedicalRecord;
}

interface PatientDetail {
  patientId: string;
  fullName: string;
  gender: string;
  dob: string;
  identityNumber?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  bhytNumber?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  avatarUrl?: string;
  appointments: AppointmentHistory[];
}

// ── Helpers ───────────────────────────────────────────────

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const parts = date.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "—";
  const [datePart, timePart] = dateTimeStr.split("T");
  return `${timePart?.substring(0, 5) ?? ""} — ${formatDate(datePart)}`;
};

const calcAge = (dob: string) =>
  Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

const genderLabel = (g: string) => {
  if (g === "MALE" || g === "Male")
    return (
      <div className="inline-flex items-center gap-1.5 text-blue-700 font-medium bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="10" cy="14" r="5" />
          <path d="M14 10l7-7M15 3h6v6" />
        </svg>
        <span>Nam</span>
      </div>
    );
  if (g === "FEMALE" || g === "Female")
    return (
      <div className="inline-flex items-center gap-1.5 text-pink-700 font-medium bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v7M9 18h6" />
        </svg>
        <span>Nữ</span>
      </div>
    );
  return (
    <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs">
      <span>Khác</span>
    </div>
  );
};

const formatStatusBadge = (status: AppointmentStatus) => {
  switch (status) {
    case "PENDING":
      return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-amber-200"><Clock className="h-3 w-3" /> Chờ xử lý</span>;
    case "DEPOSIT_PAID":
      return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-indigo-200"><CreditCard className="h-3 w-3" /> Đã đặt cọc</span>;
    case "BOOKED":
      return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-blue-200"><Clock className="h-3 w-3" /> Đã đặt lịch</span>;
    case "ARRIVED":
      return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-purple-200"><MapPin className="h-3 w-3" /> Đã đến viện</span>;
    case "IN_PROGRESS":
      return <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-sky-200"><Activity className="h-3 w-3" /> Đang khám</span>;
    case "COMPLETED":
      return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Hoàn thành</span>;
    case "CANCELLED":
      return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-red-100"><XCircle className="h-3 w-3" /> Đã hủy</span>;
    case "NOSHOW":
      return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200"><User className="h-3 w-3" /> Không đến</span>;
    default:
      return <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200">—</span>;
  }
};

const formatSourceBadge = (source?: string) => {
  switch (source) {
    case "MOBILE_APP":
      return <span className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><Smartphone className="h-3 w-3" /> Ứng dụng di động</span>;
    case "WEBSITE":
    case "ONLINE":
      return <span className="inline-flex items-center gap-1.5 text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><Globe className="h-3 w-3" /> Hệ thống Online</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><UserPlus className="h-3 w-3" /> Tại quầy</span>;
  }
};

// ── Appointment Row with expandable Medical Record ────────

const RECORDS_PER_PAGE = 5;

function AppointmentTableRow({ ap }: { ap: AppointmentHistory }) {
  const [expanded, setExpanded] = useState(false);
  const mr = ap.medicalRecord;

  return (
    <>
      <tr
        className={cn(
          "hover:bg-slate-50/50 transition-colors group",
          expanded && "bg-blue-50/30"
        )}
      >
        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap text-xs">
          {formatDateTime(ap.appointmentDate)}
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors text-xs">
            <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{ap.doctorName || "—"}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium pl-5 mt-0.5">
            {ap.specialtyName || "—"}
          </div>
        </td>
        <td className="px-6 py-4 text-slate-600 leading-relaxed max-w-xs break-words font-medium text-xs">
          {ap.symptoms || <span className="text-slate-400 italic font-normal">—</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formatSourceBadge(ap.bookingSource)}
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          {formatStatusBadge(ap.status)}
        </td>
        {/* Medical record toggle */}
        <td className="px-4 py-4 text-center">
          {mr ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all",
                expanded
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              )}
            >
              <FileText className="h-3 w-3" />
              Bệnh án
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Chưa có</span>
          )}
        </td>
      </tr>

      {/* Expandable Medical Record Row */}
      {expanded && mr && (
        <tr className="bg-blue-50/20">
          <td colSpan={6} className="px-6 pb-5 pt-0">
            <div className="rounded-xl border border-blue-100 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-5 py-3 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Chi tiết bệnh án — {formatDate(mr.createdAt.split("T")[0])}
                </span>
                {mr.isLocked && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <Shield className="h-2.5 w-2.5" /> Đã khoá
                  </span>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Chẩn đoán & điều trị */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chẩn đoán & Điều trị
                  </p>
                  {[
                    { label: "Lý do khám", val: mr.chiefComplaint },
                    { label: "Chẩn đoán chính", val: mr.diagnosisMain, highlight: true },
                    { label: "Chẩn đoán kèm", val: mr.diagnosisComorbid },
                    { label: "Kế hoạch điều trị", val: mr.treatmentPlan },
                    { label: "Ghi chú BS", val: mr.notes },
                  ]
                    .filter((r) => r.val)
                    .map((r) => (
                      <div
                        key={r.label}
                        className={cn(
                          "flex flex-col gap-0.5 py-2 border-b border-slate-100 last:border-0",
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {r.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium text-slate-700",
                            r.highlight && "text-blue-700 font-bold text-sm"
                          )}
                        >
                          {r.val}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Đơn thuốc */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="h-3 w-3" /> Đơn thuốc ({mr.prescriptions.length})
                  </p>

                  {mr.prescriptions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Không có đơn thuốc
                    </p>
                  ) : (
                    mr.prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2"
                      >
                        <p className="text-[10px] text-slate-400 font-medium">
                          Kê ngày{" "}
                          {new Date(rx.createdAt).toLocaleDateString("vi-VN")}
                          {rx.notes && ` — ${rx.notes}`}
                        </p>
                        <div className="space-y-2">
                          {rx.items.map((item, idx) => (
                            <div key={item.id} className="flex gap-2.5">
                              <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0 pt-0.5">
                                {idx + 1}.
                              </span>
                              <div>
                                <span className="text-xs font-bold text-slate-800">
                                  {item.medicineName}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {" "}— {item.dosage}
                                  {item.frequency && `, ${item.frequency}`}
                                  {item.durationDays && `, ${item.durationDays} ngày`}
                                  {` (SL: ${item.quantity})`}
                                </span>
                                {item.instruction && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    ↳ {item.instruction}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────

export default function DoctorPatientDetailClient({
  patientId,
}: {
  patientId: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/doctor/patients/${patientId}`);
        const json = await res.json();
        if (json?.data) {
          setData(json.data);
          setCurrentPage(1);
        } else {
          setError("Không tìm thấy thông tin bệnh nhân.");
        }
      } catch {
        setError("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [patientId]);

  const hasAllergy =
    data?.allergies &&
    data.allergies.toLowerCase() !== "không" &&
    data.allergies.toLowerCase() !== "không có";

  // Pagination
  const sortedAppointments = [...(data?.appointments ?? [])].sort(
    (a, b) =>
      new Date(b.appointmentDate).getTime() -
      new Date(a.appointmentDate).getTime()
  );
  const totalRecords = sortedAppointments.length;
  const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE) || 1;
  const indexOfLast = currentPage * RECORDS_PER_PAGE;
  const indexOfFirst = indexOfLast - RECORDS_PER_PAGE;
  const pagedAppointments = sortedAppointments.slice(indexOfFirst, indexOfLast);

  // ── Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6 animate-pulse bg-slate-50/50 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-1/3">
            <div className="h-8 bg-slate-200 rounded-lg" />
            <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[280px] bg-slate-200 rounded-2xl" />
          <div className="h-[280px] bg-slate-200 rounded-2xl lg:col-span-2" />
        </div>
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // ── Error state
  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center my-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          Không thể tải hồ sơ bệnh nhân
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 mx-auto shadow-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 w-full min-w-0 p-6 bg-slate-50/50 min-h-screen">

      {/* ── Header Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-start gap-3.5">
          <button
            onClick={() => router.back()}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl bg-white shadow-sm transition-colors mt-0.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Chi tiết hồ sơ bệnh nhân
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Thông tin lâm sàng, tiền sử bệnh lý và nhật ký phiên khám chữa bệnh
            </p>
          </div>
        </div>
      </div>

      {/* ── KHỐI THÔNG TIN CHÍNH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Cột 1: Thẻ định danh */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-4 overflow-hidden">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-emerald-50/70 flex items-center justify-center">
                <User className="h-10 w-10 text-emerald-500/80" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {data.fullName}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {calcAge(data.dob)} tuổi
          </p>
          <div className="mt-1.5">{genderLabel(data.gender)}</div>

          <div className="w-full border-t border-slate-100 my-4" />

          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 w-full text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Mã bệnh nhân (ID)
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5 select-all">
              {patientId.toUpperCase()}
            </span>
          </div>

          {/* Allergy warning */}
          {hasAllergy && (
            <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                  Cảnh báo dị ứng
                </span>
                <span className="text-xs font-semibold text-red-700 leading-snug block mt-0.5">
                  {data.allergies}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cột 2+3: Thông tin hành chính & lâm sàng */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/40 rounded-t-2xl">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">
              Thông tin hành chính & Lâm sàng cơ bản
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 flex-1 items-start text-sm">

            {/* Nhóm lý lịch */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Ngày sinh
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDate(data.dob)}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Số điện thoại
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {data.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Email
                </span>
                <span
                  className="font-semibold text-slate-800 text-xs truncate max-w-[200px]"
                  title={data.email || ""}
                >
                  {data.email || "—"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Địa chỉ thường trú
                </span>
                <span className="font-medium text-slate-600 text-xs leading-relaxed">
                  {data.address || "—"}
                </span>
              </div>
            </div>

            {/* Nhóm định danh & lâm sàng */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                <span className="font-medium text-slate-500 flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-slate-400" /> Số CCCD
                </span>
                <span className="font-mono font-bold text-slate-800 tracking-wide">
                  {data.identityNumber || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                <span className="font-medium text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" /> Số BHYT
                </span>
                <span className="font-mono font-bold text-slate-800 tracking-wide">
                  {data.bhytNumber || "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1">
                    <HeartPulse className="h-3 w-3 text-red-500" /> Nhóm máu
                  </span>
                  <span className="text-base font-black text-red-600 mt-0.5 block">
                    {data.bloodType || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    Dị ứng
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold block mt-1 line-clamp-2 break-words leading-tight",
                      hasAllergy ? "text-red-600" : "text-slate-500"
                    )}
                  >
                    {data.allergies || "Không"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tiền sử bệnh lý & Dị ứng (2 col) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" /> Tiền sử bệnh lý mắt chuyên khoa
          </h4>
          <div className="text-xs text-slate-700 leading-relaxed bg-amber-50/30 p-4 rounded-xl border border-dashed border-amber-200 font-medium whitespace-pre-line">
            {data.medicalHistory || "Chưa ghi nhận dữ liệu tiền sử bệnh lý."}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className={cn("h-4 w-4", hasAllergy ? "text-red-500" : "text-slate-400")} />
            Dị ứng thuốc / Vật liệu
          </h4>
          <div
            className={cn(
              "text-xs leading-relaxed p-4 rounded-xl border font-medium",
              hasAllergy
                ? "bg-red-50/50 border-dashed border-red-200 text-red-700 font-bold"
                : "bg-slate-50/30 border-dashed border-slate-200 text-slate-500"
            )}
          >
            {data.allergies || "Không ghi nhận dị ứng."}
          </div>
        </div>
      </div>

      {/* ── Nhật ký lịch hẹn & Bệnh án ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-600" />
            Nhật ký lịch hẹn & Bệnh án
          </h4>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Nhấn vào nút <span className="font-bold text-blue-600">Bệnh án</span> để xem chi tiết chẩn đoán và đơn thuốc
          </p>
        </div>

        {totalRecords === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-300 mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-400 italic font-medium">
              Bệnh nhân này hiện chưa phát sinh lịch hẹn khám nào.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-[180px]">Thời gian hẹn</th>
                  <th className="px-6 py-4 w-[220px]">Bác sĩ & Chuyên khoa</th>
                  <th className="px-6 py-4">Triệu chứng / Lý do khám</th>
                  <th className="px-6 py-4 w-[160px]">Kênh đặt lịch</th>
                  <th className="px-6 py-4 text-center w-[130px]">Trạng thái</th>
                  <th className="px-4 py-4 text-center w-[110px]">Bệnh án</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedAppointments.map((ap) => (
                  <AppointmentTableRow key={ap.appointmentId} ap={ap} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div>
              Hiển thị{" "}
              <span className="text-slate-800 font-bold">{indexOfFirst + 1}</span>
              {" "}–{" "}
              <span className="text-slate-800 font-bold">
                {Math.min(indexOfLast, totalRecords)}
              </span>{" "}
              trên{" "}
              <span className="text-slate-800 font-bold">{totalRecords}</span>{" "}
              lịch hẹn
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-2">
                Trang{" "}
                <span className="text-slate-800 font-bold">{currentPage}</span>
                {" "}/ <span className="font-semibold">{totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}