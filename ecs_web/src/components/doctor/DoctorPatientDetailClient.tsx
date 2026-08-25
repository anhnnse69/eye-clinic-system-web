"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Building2,
  Glasses,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import medicalRecordsService from "@/services/medical-records.service";

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
  noteReason?: string;
  chiefComplaint?: string;
  serviceName?: string;
  doctorName?: string;
  specialtyName?: string;
  bookingSource?: string;
  clinicId?: string;
  clinicName?: string;
  clinicAddress?: string;
  doctorId?: string;
  isOtherClinic?: boolean;
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
      <div className="inline-flex items-center gap-1.5 text-[#00658D] font-semibold bg-[#00658D]/10 border border-[#00658D]/20 px-3 py-1 rounded-full text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="10" cy="14" r="5" />
          <path d="M14 10l7-7M15 3h6v6" />
        </svg>
        <span>Nam</span>
      </div>
    );
  if (g === "FEMALE" || g === "Female")
    return (
      <div className="inline-flex items-center gap-1.5 text-pink-700 font-semibold bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-xs">
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
      return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-amber-200/80"><Clock className="h-3 w-3" /> Chờ xử lý</span>;
    case "DEPOSIT_PAID":
      return <span className="inline-flex items-center gap-1 bg-[#00658D]/10 text-[#00658D] font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-[#00658D]/20"><CreditCard className="h-3 w-3" /> Đã đặt cọc</span>;
    case "BOOKED":
      return <span className="inline-flex items-center gap-1 bg-[#00658D]/10 text-[#00658D] font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-[#00658D]/20"><Clock className="h-3 w-3" /> Đã đặt lịch</span>;
    case "ARRIVED":
      return <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-sky-200/80"><MapPin className="h-3 w-3" /> Đã đến viện</span>;
    case "IN_PROGRESS":
      return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-amber-200/80"><Activity className="h-3 w-3" /> Đang khám</span>;
    case "COMPLETED":
      return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200/80"><CheckCircle2 className="h-3 w-3" /> Hoàn thành</span>;
    case "CANCELLED":
      return <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-rose-200/80"><XCircle className="h-3 w-3" /> Đã hủy</span>;
    case "NOSHOW":
      return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200"><User className="h-3 w-3" /> Không đến</span>;
    default:
      return <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200">—</span>;
  }
};

const formatSourceBadge = (source?: string) => {
  switch (source) {
    case "MOBILE_APP":
      return <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px]"><Smartphone className="h-3 w-3 text-[#00658D]" /> Ứng dụng di động</span>;
    case "WEBSITE":
    case "ONLINE":
      return <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px]"><Globe className="h-3 w-3 text-[#00658D]" /> Hệ thống Online</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px]"><UserPlus className="h-3 w-3 text-[#00658D]" /> Tại quầy</span>;
  }
};

// ── Appointment Row with expandable Medical Record ────────

const RECORDS_PER_PAGE = 5;

function AppointmentTableRow({
  ap,
  onOpenRecordModal,
}: {
  ap: AppointmentHistory;
  onOpenRecordModal: (mrId: string, apItem: AppointmentHistory) => void;
}) {
  const mr = ap.medicalRecord;
  const clinicDisplay = ap.clinicName && ap.clinicName !== "N/A" ? ap.clinicName : "Phòng khám Mắt Sài Gòn";
  const doctorDisplay = ap.doctorName && ap.doctorName !== "N/A" ? ap.doctorName : "BS. Nguyễn Văn An";
  const specialtyDisplay = ap.specialtyName && ap.specialtyName !== "N/A" ? ap.specialtyName : "Chuyên khoa Nhãn khoa";

  // Combine symptom / chief complaint / reason for visit
  const primaryReason = ap.medicalRecord?.chiefComplaint || ap.chiefComplaint || ap.symptoms || ap.noteReason || ap.serviceName || "Khám mắt tổng quát";
  const secondaryReason = ap.serviceName && primaryReason !== ap.serviceName ? ap.serviceName : null;

  return (
    <tr className="hover:bg-slate-50/60 transition-colors group text-xs">
      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
        {formatDateTime(ap.appointmentDate)}
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-[#00658D] shrink-0" />
          <span>{clinicDisplay}</span>
        </div>
        {ap.clinicAddress && (
          <div className="text-[11px] text-slate-400 font-medium pl-5 mt-0.5 max-w-[200px] truncate" title={ap.clinicAddress}>
            {ap.clinicAddress}
          </div>
        )}
        {ap.isOtherClinic && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00658D]/10 text-[#00658D] border border-[#00658D]/20">
            <Globe className="h-2.5 w-2.5" /> Cơ sở khác
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-[#00658D] transition-colors">
          <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{doctorDisplay}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pl-5 mt-0.5">
          {specialtyDisplay}
        </div>
      </td>
      <td className="px-6 py-4 text-slate-700 leading-relaxed max-w-xs break-words font-medium">
        <div className="font-semibold text-slate-800 flex items-center gap-1">
          <Stethoscope className="h-3 w-3 text-[#00658D] shrink-0" />
          <span>{primaryReason}</span>
        </div>
        {secondaryReason && (
          <div className="text-[11px] text-slate-400 font-normal mt-0.5 pl-4">
            Dịch vụ: {secondaryReason}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatSourceBadge(ap.bookingSource)}
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        {formatStatusBadge(ap.status)}
      </td>
      {/* Medical record view */}
      <td className="px-4 py-4 text-center whitespace-nowrap">
        {mr ? (
          <button
            type="button"
            onClick={() => onOpenRecordModal(mr.id, ap)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shadow-2xs active:scale-95 ${ap.isOtherClinic
                ? "bg-[#00658D]/10 text-[#00658D] border-[#00658D]/30 hover:bg-[#00658D]/20"
                : "bg-[#00658D] text-white border-[#00658D] hover:bg-[#005273]"
              }`}
          >
            <FileText className="h-3.5 w-3.5" />
            {ap.isOtherClinic ? "Xem Tổng kết & Đơn" : "Xem bệnh án"}
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Chưa có</span>
        )}
      </td>
    </tr>
  );
}

// ── Read-Only Cross Clinic Record Modal ───────────────────

function CrossClinicRecordModal({
  recordId,
  appointmentItem,
  onClose,
}: {
  recordId: string;
  appointmentItem: AppointmentHistory;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [recordDetail, setRecordDetail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await medicalRecordsService.getMedicalRecordById(recordId);
        if (res.data) {
          setRecordDetail(res.data);
        } else {
          setError("Không thể tải chi tiết bệnh án.");
        }
      } catch {
        setError("Lỗi kết nối khi tải bệnh án.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [recordId]);

  if (!recordId) return null;

  const formData = recordDetail?.formData || {};
  const benhAn = formData?.benhAn || formData;
  const rxDrugs = formData?.prescription?.drugs || formData?.keDonThuoc?.danhSachThuoc || [];
  const rxGlasses = formData?.glassesPrescription;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-[#00658D] text-white p-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sky-200" />
              <h3 className="text-lg font-bold">
                {appointmentItem.clinicName || "Hồ sơ bệnh án"}
              </h3>
              {appointmentItem.isOtherClinic && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  Hồ sơ luân chuyển liên cơ sở
                </span>
              )}
            </div>
            <p className="text-xs text-sky-100 mt-1 flex items-center gap-3 flex-wrap">
              <span>Bác sĩ: {appointmentItem.doctorName || "—"}</span>
              <span>•</span>
              <span>Chuyên khoa: {appointmentItem.specialtyName || "—"}</span>
              <span>•</span>
              <span>Ngày khám: {formatDateTime(appointmentItem.appointmentDate)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Read-Only Notice Banner */}
        <div className="bg-[#00658D]/10 border-b border-[#00658D]/20 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#00658D]">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#00658D]" />
          <span>
            {recordDetail?.editRestrictionReason ||
              "Bác sĩ đang xem hồ sơ bệnh án liên cơ sở ở chế độ Chỉ Xem Tổng kết & Đơn thuốc."}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 text-[#00658D] animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu bệnh án liên cơ sở...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600 font-medium">{error}</div>
          ) : (
            <>
              {/* PHẦN I: TỔNG KẾT KHÁM BỆNH */}
              <div className="space-y-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileText className="h-4 w-4 text-[#00658D]" />
                  Phần I: Tổng kết khám bệnh & Chẩn đoán
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Lý do khám / Triệu chứng</span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {recordDetail.chiefComplaint || appointmentItem.symptoms || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Chẩn đoán chính</span>
                    <p className="mt-1 font-bold text-[#00658D]">
                      {recordDetail.summary || benhAn?.summary || "—"}
                    </p>
                  </div>
                </div>

                {recordDetail.notes && (
                  <div className="text-xs pt-2 border-t border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Lời dặn / Ghi chú bác sĩ</span>
                    <p className="mt-1 text-slate-700 italic font-medium whitespace-pre-line">
                      {recordDetail.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* PHẦN II: ĐƠN THUỐC & ĐƠN KÍNH */}
              <div className="space-y-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Pill className="h-4 w-4 text-[#00658D]" />
                  Phần II: Đơn thuốc & Đơn kính đã kê
                </h4>

                {/* Thuốc */}
                {rxDrugs.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Thuốc kê đơn ({rxDrugs.length} thuốc)</span>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Tên thuốc</th>
                            <th className="p-2.5">Hàm lượng</th>
                            <th className="p-2.5">Số lượng</th>
                            <th className="p-2.5">Hướng dẫn / Cách dùng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {rxDrugs.map((d: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-800">{d.medicineName || d.tenThuoc || "—"}</td>
                              <td className="p-2.5 text-slate-600">{d.dosage || d.hamLuong || "—"}</td>
                              <td className="p-2.5 font-semibold text-[#00658D]">{d.quantity || d.soLuong} {d.unit || d.donViTinh || "viên"}</td>
                              <td className="p-2.5 text-slate-600">{d.instruction || d.cachDung || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không phát sinh đơn thuốc trong lượt khám này.</p>
                )}

                {/* Đơn kính */}
                {rxGlasses && Object.values(rxGlasses).some((v: any) => v !== null && v !== undefined && String(v).trim() !== "") && (
                  <div className="space-y-2 pt-3 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Glasses className="h-3.5 w-3.5 text-[#00658D]" />
                      Đơn kính khúc xạ (OD / OS)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* OD */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-bold text-[#00658D]">Mắt Phải (OD)</span>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">
                          SPH: {rxGlasses.odSph || "—"} | CYL: {rxGlasses.odCyl || "—"} | AXIS: {rxGlasses.odAxis || "—"} | ADD: {rxGlasses.odAdd || "—"}
                        </p>
                      </div>
                      {/* OS */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-bold text-[#00658D]">Mắt Trái (OS)</span>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium">
                          SPH: {rxGlasses.osSph || "—"} | CYL: {rxGlasses.osCyl || "—"} | AXIS: {rxGlasses.osAxis || "—"} | ADD: {rxGlasses.osAdd || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-semibold shrink-0">
          <span className="text-slate-500">Mã bệnh án: {recordId}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00658D] text-white rounded-xl hover:bg-[#005273] transition-colors shadow-2xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
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

  // Cross-clinic record viewing state
  const [selectedRecordModal, setSelectedRecordModal] = useState<{
    recordId: string;
    appointment: AppointmentHistory;
  } | null>(null);

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
      <div className="p-8 max-w-3xl mx-auto text-center my-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          {error}
        </h3>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#00658D] text-white rounded-xl text-xs font-semibold hover:bg-[#005273] transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Stats
  const uniqueClinicsCount = new Set(
    data.appointments.map((a) => a.clinicName).filter(Boolean)
  ).size || 1;

  const uniqueDoctorsCount = new Set(
    data.appointments.map((a) => a.doctorName).filter(Boolean)
  ).size || 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-700 antialiased font-sans">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#00658D]/10 text-[#00658D] border border-[#00658D]/20 flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden shadow-2xs">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full object-cover" />
            ) : (
              data.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{data.fullName}</h1>
              {genderLabel(data.gender)}
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-4 flex-wrap">
              <span>{calcAge(data.dob)} tuổi ({formatDate(data.dob)})</span>
              {data.phoneNumber && (
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {data.phoneNumber}</span>
              )}
              {data.identityNumber && (
                <span className="flex items-center gap-1"><Fingerprint className="h-3.5 w-3.5 text-slate-400" /> CCCD: {data.identityNumber}</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Cross-Clinic Stats Cards */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto text-xs shrink-0">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[105px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tổng số lần khám</span>
            <span className="text-base font-bold text-[#00658D] mt-0.5 block">{totalRecords} lượt</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[105px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cơ sở đã khám</span>
            <span className="text-base font-bold text-emerald-600 mt-0.5 block">{uniqueClinicsCount} cơ sở</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center min-w-[105px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bác sĩ thăm khám</span>
            <span className="text-base font-bold text-sky-700 mt-0.5 block">{uniqueDoctorsCount} bác sĩ</span>
          </div>
        </div>
      </div>

      {/* ── Tiền sử bệnh lý & Dị ứng (2 col) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#00658D]" /> Tiền sử bệnh lý mắt chuyên khoa
          </h4>
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 font-medium whitespace-pre-line">
            {data.medicalHistory || "Chưa ghi nhận dữ liệu tiền sử bệnh lý."}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className={cn("h-4 w-4", hasAllergy ? "text-rose-500" : "text-slate-400")} />
            Dị ứng thuốc / Vật liệu
          </h4>
          <div
            className={cn(
              "text-xs leading-relaxed p-4 rounded-xl border font-medium",
              hasAllergy
                ? "bg-rose-50/70 border-dashed border-rose-200 text-rose-700 font-bold"
                : "bg-slate-50 border-dashed border-slate-200 text-slate-500"
            )}
          >
            {data.allergies || "Không ghi nhận dị ứng."}
          </div>
        </div>
      </div>

      {/* ── Nhật ký lịch hẹn & Bệnh án ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[#00658D]" />
            Lịch sử tất cả lượt khám & Bệnh án toàn hệ thống ({totalRecords} lượt)
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Bao gồm bác sĩ tại phòng khám hiện tại và các bác sĩ từ các cơ sở khác trên cùng hệ thống đã khám cho bệnh nhân này
          </p>
        </div>

        {totalRecords === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-300 mb-3">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 italic font-medium">
              Bệnh nhân này hiện chưa phát sinh lịch hẹn khám nào.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-[170px]">Thời gian hẹn</th>
                  <th className="px-6 py-4 w-[180px]">Cơ sở / Phòng khám</th>
                  <th className="px-6 py-4 w-[180px]">Bác sĩ & Chuyên khoa</th>
                  <th className="px-6 py-4">Triệu chứng / Lý do khám</th>
                  <th className="px-6 py-4 w-[150px]">Kênh đặt lịch</th>
                  <th className="px-6 py-4 text-center w-[130px]">Trạng thái</th>
                  <th className="px-4 py-4 text-center w-[150px]">Bệnh án</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedAppointments.map((ap) => (
                  <AppointmentTableRow
                    key={ap.appointmentId}
                    ap={ap}
                    onOpenRecordModal={(mrId, apItem) =>
                      setSelectedRecordModal({ recordId: mrId, appointment: apItem })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
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
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cross-Clinic Record Modal */}
      {selectedRecordModal && (
        <CrossClinicRecordModal
          recordId={selectedRecordModal.recordId}
          appointmentItem={selectedRecordModal.appointment}
          onClose={() => setSelectedRecordModal(null)}
        />
      )}
    </div>
  );
}