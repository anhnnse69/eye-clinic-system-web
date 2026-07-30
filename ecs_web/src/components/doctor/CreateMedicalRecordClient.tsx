"use client"

/**
 * CreateMedicalRecordClient — MongoDB-backed JSON envelope form.
 *
 * Renders 6 ophthalmic templates (MS21-26) cho khám ngoại trú.
 *
 * Lưu ý: Theo yêu cầu người dùng (2026-07-20):
 *  - Lược bỏ hoàn toàn phần "Quản lý bệnh nhân nội trú" (admission, bed,
 *    department transfer, total treatment days, discharge, tử vong).
 *  - Lược bỏ phần "ICD Diagnosis Codes" của Bộ Y tế (chẩn đoán sơ bộ đã có
 *    UC 35/36, chẩn đoán xác định sẽ nhập trực tiếp trong subspecialty section).
 *  - Không render "Tổng kết bệnh án" nội trú; chỉ giữ phần "Tổng kết" rút gọn
 *    (chẩn đoán cuối + hướng điều trị tiếp + đơn thuốc).
 *  - Toàn bộ label sử dụng i18n (vi/en) qua namespace `medicalRecord` + `form`.
 */
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Loader2, AlertCircle, CheckCircle2, Printer, Sparkles } from "lucide-react"

import {
  medicalRecordFormDataSchema,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import medicalRecordService from "@/services/medical-record.service"
import { patientProfileService } from "@/services/patient-profile.service"
import { medicalRecordPatientDemographicsService } from "@/services"
import { getMessage } from "@/constants/messages"
import {
  MEDICAL_RECORD_TYPES,
  MEDICAL_RECORD_TYPE_LABELS,
  type MedicalRecordType,
  type MedicalRecordFormDataPayload,
} from "@/types"

import UniversalEyeExamSections from "./medical-record-form/UniversalEyeExamSections"
import OfficialMedicalRecordA4Print from "./medical-record-form/OfficialMedicalRecordA4Print"
import SubspecialtySections from "./medical-record-form/SubspecialtySections"
import GlaucomaFormSections from "./medical-record-form/GlaucomaFormSections"
import PatientManagementSections from "./medical-record-form/PatientManagementSections"
import DiagnosisDischargeSections from "./medical-record-form/DiagnosisDischargeSections"
import TreatmentProgressTable from "./medical-record-form/TreatmentProgressTable"
import SurgeryForm from "./medical-record-form/SurgeryForm"
import PrescriptionSection from "./medical-record-form/PrescriptionSection"
import PreliminaryExamination, {
  type PreliminaryData,
} from "./medical-record-form/PreliminaryExamination"
import { getAccentForRecordType } from "./medical-record-form/SectionHeading"
import ParaclinicalPanel from "./ParaclinicalPanel"

interface CreateMedicalRecordClientProps {
  appointmentId: string
  patientProfileId?: string
  initialRecordType?: string
}

/** Subset of patient profile fields surfaced inside the form header. */
type PropsForSections = NonNullable<
  React.ComponentProps<typeof PatientManagementSections>["patientProfile"]
>

function accentButtonClass(recordType: string | undefined): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "bg-rose-600 hover:bg-rose-700"
    case "MS22_ANTERIOR":
      return "bg-teal-600 hover:bg-teal-700"
    case "MS23_FUNDUS":
      return "bg-amber-600 hover:bg-amber-700"
    case "MS24_GLAUCOMA":
      return "bg-indigo-600 hover:bg-indigo-700"
    case "MS25_STRABISMUS_PTOSIS":
      return "bg-sky-600 hover:bg-sky-700"
    case "MS26_PEDIATRIC":
      return "bg-violet-600 hover:bg-violet-700"
    default:
      return "bg-gray-600 hover:bg-gray-700"
  }
}

function accentTextClass(accent: string): string {
  switch (accent) {
    case "rose":
      return "text-rose-700"
    case "teal":
      return "text-teal-700"
    case "amber":
      return "text-amber-700"
    case "indigo":
      return "text-indigo-700"
    case "sky":
      return "text-sky-700"
    case "violet":
      return "text-violet-700"
    case "emerald":
      return "text-emerald-700"
    default:
      return "text-slate-700"
  }
}

export default function CreateMedicalRecordClient({
  appointmentId,
  patientProfileId,
  initialRecordType,
}: CreateMedicalRecordClientProps) {
  const router = useRouter()
  const t = useTranslations("medicalRecord")
  const tForm = useTranslations("form")
  const tCommon = useTranslations("common")

  const initialType = useMemo<MedicalRecordType | undefined>(() => {
    if (initialRecordType && (MEDICAL_RECORD_TYPES as readonly string[]).includes(initialRecordType)) {
      return initialRecordType as MedicalRecordType
    }
    return undefined
  }, [initialRecordType])

  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>(initialType)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ recordId: string; mongoDocumentId?: string } | null>(null)

  // ── Step flow: preliminary → template → form ───────────────────────
  const [step, setStep] = useState<"preliminary" | "template">(initialType ? "template" : "preliminary")
  const [preliminary, setPreliminary] = useState<PreliminaryData | null>(null)

  // ── Patient profile (fetched lazily so header info is real) ─────────
  const [patientProfile, setPatientProfile] = useState<PropsForSections | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!patientProfileId) {
      setPatientProfile(null)
      return
    }
    ;(async () => {
      // 1. Try Doctor Demographics endpoint first
      try {
        const res = await medicalRecordPatientDemographicsService.getPatientDemographicsDetail(patientProfileId)
        if (cancelled) return
        if (res.data) {
          const d = res.data
          setPatientProfile({
            fullName: d.fullName || null,
            gender: d.gender || null,
            dob: d.dob || null,
            phoneNumber: d.phoneNumber || null,
            address: d.address || null,
            identityNumber: d.identityNumber || null,
            bhytNumber: d.bhytNumber || null,
            bhytExpiryDate: null,
            bloodType: d.bloodType || null,
            allergies: d.allergies || null,
            medicalHistory: d.medicalHistory || null,
          })
          return
        }
      } catch {
        // Fallback
      }

      // 2. Try patientProfileService fallback
      try {
        const res = await patientProfileService.getById(patientProfileId)
        if (cancelled) return
        const d = (res as unknown as { data?: Record<string, unknown> }).data ?? {}
        setPatientProfile({
          fullName:
            (d.fullName as string | null) ??
            (d.full_name as string | null) ??
            (d.name as string | null) ??
            null,
          gender: (d.gender as string | null) ?? null,
          dob: (d.dob as string | null) ?? (d.dateOfBirth as string | null) ?? null,
          phoneNumber:
            (d.phoneNumber as string | null) ?? (d.phone as string | null) ?? null,
          address: (d.address as string | null) ?? null,
          identityNumber:
            (d.identityNumber as string | null) ??
            (d.identity_number as string | null) ??
            (d.citizenId as string | null) ??
            null,
          bhytNumber:
            (d.bhytNumber as string | null) ?? (d.bhyt_number as string | null) ?? null,
          bhytExpiryDate:
            (d.bhytExpiryDate as string | null) ??
            (d.bhyt_expiry as string | null) ??
            null,
          bloodType: (d.bloodType as string | null) ?? null,
          allergies: (d.allergies as string | null) ?? null,
          medicalHistory: (d.medicalHistory as string | null) ?? null,
        })
      } catch {
        if (!cancelled) setPatientProfile(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [patientProfileId])

  // ── Preliminary data feeds into form defaults ───────────────────────
  useEffect(() => {
    if (!preliminary) return
    methods.reset({
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: preliminary.chiefComplaint,
        benhSu: preliminary.onsetDuration
          ? `${preliminary.onsetDuration}${preliminary.affectedEye !== "NONE" ? ` — ${preliminary.affectedEye}` : ""}${preliminary.painLevel > 0 ? ` — Pain ${preliminary.painLevel}/10` : ""}\n${preliminary.quickObservations}`
          : preliminary.quickObservations,
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: "",
        tienSuGiaDinh: "",
      },
      khamBenh: {
        khamToanThan: {},
        traumaRecord: {},
        glaucomaRecord: {},
        strabismusPtosisRecord: {},
        pediatricRecord: {},
      },
    } as MedicalRecordFormDataPayload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preliminary])

  const handlePreliminaryComplete = (data: PreliminaryData) => {
    setPreliminary(data)
    if (data.suspectedCategory) {
      setRecordType(data.suspectedCategory)
    }
    setStep("template")
  }

  const methods = useForm<MedicalRecordFormDataPayload>({
    resolver: zodResolver(medicalRecordFormDataSchema) as unknown as Resolver<MedicalRecordFormDataPayload>,
    mode: "onBlur",
    defaultValues: {
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: "",
        benhSu: "",
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: "",
        tienSuGiaDinh: "",
      },
      khamBenh: {
        khamToanThan: {},
        traumaRecord: {},
        glaucomaRecord: {},
        strabismusPtosisRecord: {},
        pediatricRecord: {},
      },
    },
  })

  // ─── Step 0: Preliminary examination ────────────────────────────────
  if (step === "preliminary") {
    return (
      <PreliminaryExamination
        patientName={patientProfile?.fullName ?? null}
        onComplete={handlePreliminaryComplete}
        onBack={() => router.back()}
      />
    )
  }

  // ─── Chọn loại bệnh án ─────────────────────────────────────────────
  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("selectTemplate")}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{t("selectTemplateDesc")}</p>
          {preliminary && (
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <strong>{tForm("patientInfoFromProfile") || "Preliminary"}:</strong>{" "}
              {preliminary.chiefComplaint}
              {preliminary.suspectedCategory && (
                <span className="ml-2 inline-block rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  → {preliminary.suspectedCategory.replace("MS", "MS ")}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {MEDICAL_RECORD_TYPES.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setRecordType(rt)}
              className="group flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:shadow"
            >
              <span className="text-sm font-semibold text-indigo-600">
                {rt.replace("MS", "MS ")}
              </span>
              <span className="mt-1 text-sm text-gray-700">
                {MEDICAL_RECORD_TYPE_LABELS[rt]}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← {tCommon("back")}
        </button>
      </div>
    )
  }

  // ─── Success banner + Paraclinical Panel ──────────────────────────
  if (successInfo) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            {t("savedSuccess")}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Medical Record ID:{" "}
            <code className="rounded bg-white px-2 py-0.5">{successInfo.recordId}</code>
          </p>
          {successInfo.mongoDocumentId && (
            <p className="mt-1 text-xs text-gray-600">
              MongoDB Document ID:{" "}
              <code className="rounded bg-white px-2 py-0.5">{successInfo.mongoDocumentId}</code>
            </p>
          )}
        </div>

        <ParaclinicalPanel recordId={successInfo.recordId} />

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/doctor/records")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("backToList")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/doctor/records/${successInfo.recordId}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t("viewDetail")}
          </button>
        </div>
      </div>
    )
  }

  const formatSystemErrorMessage = (rawError?: string | null, fallback = "Tạo bệnh án thất bại"): string => {
    if (!rawError) return fallback
    if (
      rawError.includes("500") ||
      rawError.includes("status code 500") ||
      rawError.toLowerCase().includes("request failed") ||
      rawError.includes("Internal Server Error")
    ) {
      return "Đã có lỗi hệ thống xảy ra khi lưu bệnh án. Vui lòng kiểm tra lại kết nối hoặc thử lại sau."
    }
    return getMessage(rawError) ?? rawError
  }

  const handleQuickFill = () => {
    const type = recordType || "MS21_TRAUMA"

    const basePayload: any = {
      schemaVersion: "1.2",
      benhAn: {
        hanhChinh: {
          khoa: "Khoa Mắt Tổng Hợp",
          soLuuTru: `LT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        },
        lyDoVaoVien: "Nhìn mờ, đau nhức mắt và chói mắt khi nhìn ánh sáng",
        benhSu: "Bệnh nhân khởi phát triệu chứng đau nhức và nhìn mờ 2 ngày qua. Cảm giác vướng bận, cộm rát và giảm thị lực dần.",
        tienSuBanThanMat: "Mắt trái cận thị nhẹ -1.5D, mắt phải chưa phẫu thuật",
        tienSuBanThanToanThan: "Không có tiền sử dị ứng thuốc hay bệnh lý tim mạch",
        tienSuGiaDinh: "Gia đình không ghi nhận ai mắc bệnh nhãn khoa bẩm sinh",
      },
      khamBenh: {
        thiLucNhanApVaoVien: {
          matPhai: {
            thiLucKhongKinh: "6/10",
            thiLucCoKinh: "9/10",
            thiLucNhinGan: "P0.75",
            thiLucQuaLo: "8/10",
            nhanAp: "16",
            phuongPhapNhanAp: "Goldmann",
            khucXaMay: "-1.25DS",
            khucXaChuQuan: "-1.00DS",
            soiBongDongTu: "-1.00DS",
            thiTruong: "Bình thường",
          },
          matTrai: {
            thiLucKhongKinh: "10/10",
            thiLucCoKinh: "10/10",
            thiLucNhinGan: "P1.0",
            thiLucQuaLo: "10/10",
            nhanAp: "15",
            phuongPhapNhanAp: "Goldmann",
            khucXaMay: "0.00",
            khucXaChuQuan: "0.00",
            soiBongDongTu: "0.00",
            thiTruong: "Bình thường",
          },
        },
        miMat: {
          matPhai: {
            tinhTrang: "Phù nề",
            supMi: true,
            rachMi: true,
            seoMi: false,
            uMi: false,
            quam: false,
            epicanthus: false,
            hoMi: false,
            treMi: false,
            chapLeo: "Không",
            doSupMi: "2mm",
            mucDoRach: "Nông 3mm",
            viTriRach: "1/3 giữa mi trên OD",
            khuyetMi: "Không",
            leQuan: "Bình thường",
            leQuanViTri: "—",
            daKhau: false,
            chuaKhau: true,
            moTaSeo: "Không có sẹo cũ",
            uMiTinhChat: "",
            uMiViTri: "",
            uMiKichThuoc: "",
            chuaKhac: "Tụ máu nông bờ mi trên",
            tomThuongKhac: "Không có dị vật",
          },
          matTrai: {
            tinhTrang: "Bình thường",
            supMi: false,
            rachMi: false,
            seoMi: false,
            uMi: false,
            quam: false,
            epicanthus: false,
            hoMi: false,
            treMi: false,
            chapLeo: "Không",
            doSupMi: "",
            mucDoRach: "",
            viTriRach: "",
            khuyetMi: "Không",
            leQuan: "Bình thường",
            leQuanViTri: "—",
            daKhau: false,
            chuaKhau: false,
            moTaSeo: "",
            uMiTinhChat: "",
            uMiViTri: "",
            uMiKichThuoc: "",
            chuaKhac: "Bình thường",
            tomThuongKhac: "Không",
          },
        },
        ketMac: {
          matPhai: {
            tinhTrang: "Phù nề",
            cuongTu: "Cương tụ rìa",
            cuongTuViTri: "Toàn bộ rìa giác mạc",
            xuatHuyet: true,
            moTaXuatHuyet: "Xuất huyết dưới kết mạc góc trong 2x3mm",
            rachKM: false,
            rachKMViTri: "",
            thieuMau: false,
            phuNe: true,
            nhu: false,
            hot: false,
            sungHoa: false,
            seoKM: false,
            tietTo: "Trong",
            batMauFluor: false,
            uKM: false,
            uKMTinhChat: "",
            uKMViTri: "",
            uKMKichThuoc: "",
            cungDo: "Sạch, nông bình thường",
            symblepharonChieuCao: "0",
            symblepharonDoRong: "0",
            tomThuongKhac: "Không có dị vật",
          },
          matTrai: {
            tinhTrang: "Bình thường",
            cuongTu: "Không",
            cuongTuViTri: "",
            xuatHuyet: false,
            moTaXuatHuyet: "",
            rachKM: false,
            rachKMViTri: "",
            thieuMau: false,
            phuNe: false,
            nhu: false,
            hot: false,
            sungHoa: false,
            seoKM: false,
            tietTo: "Trong",
            batMauFluor: false,
            uKM: false,
            uKMTinhChat: "",
            uKMViTri: "",
            uKMKichThuoc: "",
            cungDo: "Bình thường",
            symblepharonChieuCao: "0",
            symblepharonDoRong: "0",
            tomThuongKhac: "Không",
          },
        },
        giacMac: {
          matPhai: {
            trongSuot: "Trong nhẹ",
            seo: "Không",
            kichThuoc: "Bình thường",
            hinhDang: "Chỏm cầu",
            duongKinhMm: 11,
            bieuMo: "Trầy xước nông",
            bieuMoCham: true,
            bieuMoBong: "Bắt màu Fluorescein dương tính (+)",
            bieuMoMat: "Mất biểu mô nông 1x2mm",
            tuaMatSau: "Âm tính",
            tuaMatSauViTri: "",
            nhuMo: "Trong",
            thamLau: "Không",
            tieuMon: "Không",
            loet: false,
            loetViTri: "",
            loetKichThuoc: "",
            loetMoTa: "",
            abces: false,
            descemetocele: false,
            ngamMau: false,
            rachGM: false,
            rachGMKichThuoc: "",
            rachGMViTri: "",
            rachGMLoai: "",
            rachGMKhoaGiaiPhau: false,
            thung: false,
            thungDuongKinhMm: 0,
            thungViTri: "",
            seidel: "Âm tính (-)",
            tram: "Không",
            tramKichThuoc: "",
            tramViTri: "",
            tramBo: "",
            tramDaBit: false,
            tramKhongBit: false,
            camGiacGM: "Bình thường",
            tanMach: false,
            tanMachHuong: "",
            tanMachDo: "",
            tinhTrang: "Trầy xước nông giác mạc",
            loanDuong: false,
            phuGiacMac: true,
            moTaPhu: "Phù nhẹ bọt biểu mô",
            loanThi: false,
            seogiacMac: false,
            moTaSeo: "",
            tonThuong: "Vết xước biểu mô nông vị trí 5h kích thước 1x2mm",
          },
          matTrai: {
            trongSuot: "Trong suốt",
            seo: "Không",
            kichThuoc: "Bình thường",
            hinhDang: "Chỏm cầu",
            duongKinhMm: 11,
            bieuMo: "Nguyên vẹn",
            bieuMoCham: false,
            bieuMoBong: "",
            bieuMoMat: "Bình thường",
            tuaMatSau: "Âm tính",
            tuaMatSauViTri: "",
            nhuMo: "Trong suốt",
            thamLau: "Không",
            tieuMon: "Không",
            loet: false,
            loetViTri: "",
            loetKichThuoc: "",
            loetMoTa: "",
            abces: false,
            descemetocele: false,
            ngamMau: false,
            rachGM: false,
            rachGMKichThuoc: "",
            rachGMViTri: "",
            rachGMLoai: "",
            rachGMKhoaGiaiPhau: false,
            thung: false,
            thungDuongKinhMm: 0,
            thungViTri: "",
            seidel: "Âm tính (-)",
            tram: "Không",
            tramKichThuoc: "",
            tramViTri: "",
            tramBo: "",
            tramDaBit: false,
            tramKhongBit: false,
            camGiacGM: "Bình thường",
            tanMach: false,
            tanMachHuong: "",
            tanMachDo: "",
            tinhTrang: "Trong suốt",
            loanDuong: false,
            phuGiacMac: false,
            moTaPhu: "",
            loanThi: false,
            seogiacMac: false,
            moTaSeo: "",
            tonThuong: "Trong suốt",
          },
        },
        cungMac: {
          matPhai: { tinhTrang: "Bình thường", viemCungMac: false, gianLoi: false, moTaGianLoi: "", seoCungMac: false },
          matTrai: { tinhTrang: "Bình thường", viemCungMac: false, gianLoi: false, moTaGianLoi: "", seoCungMac: false },
        },
        tienPhong: {
          matPhai: { tinhTrang: "Sạch, độ sâu 3mm", doSauMm: 3.0, xuatHuyet: false, muMm: 0, doDuc: "Trong", tyndall: "Âm tính (-)", gocTienPhong: "Rộng độ IV" },
          matTrai: { tinhTrang: "Sạch, độ sâu 3mm", doSauMm: 3.0, xuatHuyet: false, muMm: 0, doDuc: "Trong", tyndall: "Âm tính (-)", gocTienPhong: "Rộng độ IV" },
        },
        mongMatDongTu: {
          matPhai: { tinhTrang: "Tròn, đường kính 3mm, phản xạ (+)", duongKinh: 3.0, hinhDang: "Tròn đều", viTri: "Trung tâm", phanXaDongTu: "Dương tính (+)", dinhMongMat: false, dinhViTri: "", dinhDongTu: "Âm tính", thoaiHoaMongMat: false, hatBusacca: false, hatKoeppe: false },
          matTrai: { tinhTrang: "Tròn, đường kính 3mm, phản xạ (+)", duongKinh: 3.0, hinhDang: "Tròn đều", viTri: "Trung tâm", phanXaDongTu: "Dương tính (+)", dinhMongMat: false, dinhViTri: "", dinhDongTu: "Âm tính", thoaiHoaMongMat: false, hatBusacca: false, hatKoeppe: false },
        },
        theThuyTinh: {
          matPhai: { tinhTrang: "Trong suốt", ducTheThuyTinh: false, loaiDuc: "", mucDoDuc: "", lechTheThuyTinh: false, huTheThuyTinh: false, datIol: false },
          matTrai: { tinhTrang: "Trong suốt", ducTheThuyTinh: false, loaiDuc: "", mucDoDuc: "", lechTheThuyTinh: false, huTheThuyTinh: false, datIol: false },
        },
        dichKinh: {
          matPhai: { tinhTrang: "Trong", ducDichKinh: false, mucDoDuc: "", xuatHuyetDichKinh: false, bongDichKinhSau: false },
          matTrai: { tinhTrang: "Trong", ducDichKinh: false, mucDoDuc: "", xuatHuyetDichKinh: false, bongDichKinhSau: false },
        },
        dayMatDiaThiHoangDiem: {
          matPhai: { gaiThi: "Hồng, bờ rõ, C/D 0.3", tyLeCD: "0.3", boGaiThi: "Rõ", phuGaiThi: false, hoangDiem: "Ánh trung tâm (+)", oViEmSoLuong: 0, phuHoangDiem: false, loHoangDiem: false },
          matTrai: { gaiThi: "Bình thường, C/D 0.3", tyLeCD: "0.3", boGaiThi: "Rõ", phuGaiThi: false, hoangDiem: "Ánh trung tâm (+)", oViEmSoLuong: 0, phuHoangDiem: false, loHoangDiem: false },
        },
        dayMatVongMacMachMau: {
          matPhai: { vongMac: "Áp phẳng, bình thường", bongVongMac: false, rachVRSoLuong: 0, xuatHuyetVongMac: false, xuatTiet: "Không", coMachMau: "Bình thường" },
          matTrai: { vongMac: "Áp phẳng, bình thường", bongVongMac: false, rachVRSoLuong: 0, xuatHuyetVongMac: false, xuatTiet: "Không", coMachMau: "Bình thường" },
        },
        hocMat: {
          matPhai: { tinhTrang: "Bình thường", loiMat: false, doLoiMm: "0", sieuAmHocMat: "Bình thường" },
          matTrai: { tinhTrang: "Bình thường", loiMat: false, doLoiMm: "0", sieuAmHocMat: "Bình thường" },
        },
        khamToanThan: { mach: "75", nhietDo: "36.8", huyetAp: "120/80", nhipTho: "18", canNang: "58" },
        traumaRecord: {},
        anteriorSegmentRecord: {},
        fundusRecord: {},
        glaucomaRecord: {},
        strabismusPtosisRecord: {},
        pediatricRecord: {},
      },
      chanDoanVaRaVien: {
        chanDoanChinh: "Trầy xước giác mạc nông mắt phải do chấn thương (MS21)",
        chanDoanKemTheo: "Cận thị nhẹ mắt trái",
        huongDieuTri: "Kháng sinh nhỏ mắt Tobrex + Nước mắt nhân tạo Sanlein + Băng mắt 24h",
      },
      prescription: {
        drugs: [
          { drugName: "Tobrex 0.3% (Tobramycin)", dosage: "Nhỏ 1 giọt / lần x 4 lần / ngày (Mắt phải)", quantity: "1 lọ" },
          { drugName: "Sanlein 0.1% (Sodium Hyaluronate)", dosage: "Nhỏ 1 giọt / lần x 6 lần / ngày (Hai mắt)", quantity: "1 lọ" },
        ],
        notes: "Tái khám sau 3 ngày hoặc ngay khi thấy đau nhức tăng lên.",
      },
    }

    if (type === "MS21_TRAUMA") {
      basePayload.benhAn.lyDoVaoVien = "Đau mắt đột ngột và nhìn mờ OD do cành cây quẹt vào mắt khi đi làm vườn"
      basePayload.benhAn.chanThuongNguyenNhan = "Cành cây quẹt vào mắt khi đi làm vườn"
      basePayload.benhAn.chanThuongThoiGian = "2 ngày trước"
      basePayload.benhAn.chanThuongDaDieuTri = "Rửa mắt bằng nước muối sinh lý 0.9%"
      basePayload.benhAn.chanThuongQuaTrinhSauDT = "Mắt vẫn cộm rát và đau nhức không giảm"
      basePayload.khamBenh.traumaRecord = {
        injuryCause: "Chấn thương cơ học trực tiếp (cành cây quẹt)",
        injuryTime: "14:00 ngày 28/07/2026",
        odInjuries: "Rách mi trên OD nông 3mm, trầy xước nông giác mạc OD vị trí 5h kích thước 1x2mm, cương tụ kết mạc rìa.",
        osInjuries: "Mắt trái trong suốt, không tổn thương.",
        injuryDetails: "Vết xước biểu mô giác mạc nông không thấu, mi trên vết xước da nhẹ không phạm lệ quản.",
        traumaConclusion: "Chấn thương phần trước mắt phải: Rách mi trên nông + Trầy xước giác mạc nông OD.",
        nguyenNhan: "Cành cây quẹt vào mắt khi đi làm vườn",
        tinhTrangVaoVien: "Cấp tính",
      }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Trầy xước giác mạc nông mắt phải do chấn thương (MS21)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Kháng sinh nhỏ mắt Tobrex + Nước mắt nhân tạo Sanlein + Băng mắt 24h"
    } else if (type === "MS22_ANTERIOR") {
      basePayload.benhAn.lyDoVaoVien = "Đỏ mắt, chảy nước mắt, cộm rát hai mắt nhiều ngày"
      basePayload.khamBenh.anteriorSegmentRecord = { viTriTonThuong: "Kết mạc & Giác mạc", mucDoTonThuong: "Trung bình" }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Viêm kết mạc cấp tính hai mắt (MS22 Bán phần trước)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Nhỏ Tobradex 4 lần/ngày + Kháng viêm + Vệ sinh bờ mi"
    } else if (type === "MS23_FUNDUS") {
      basePayload.benhAn.lyDoVaoVien = "Nhìn mờ trung tâm, có điểm đen che khuất mắt phải"
      basePayload.khamBenh.fundusRecord = { viTriVongMac: "Vùng hoàng điểm OD", tinhTrangMachMau: "Hơi co nhỏ" }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Bệnh võng mạc đái tháo đường thể nhẹ (MS23 Đáy mắt)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Kiểm soát đường huyết + Thuốc bổ dưỡng chất võng mạc AREDS2"
    } else if (type === "MS24_GLAUCOMA") {
      basePayload.benhAn.lyDoVaoVien = "Đau nhức hốc mắt kéo lên thái dương, nhìn mờ kèm quầng cầu vồng"
      basePayload.benhAn.glaucomaTienSuGiaDinh = "Bố ruột mắc Glôcôm"
      basePayload.khamBenh.glaucomaRecord = { loaiGlaucoma: "Glôcôm góc mở nguyên phát", gocTienPhong: "Rộng độ IV" }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Glôcôm góc mở nguyên phát hai mắt (MS24 Glôcôm)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Nhỏ hạ nhãn áp Timolol 0.5% x 2 lần/ngày + Theo dõi thị trường 3 tháng"
    } else if (type === "MS25_STRABISMUS_PTOSIS") {
      basePayload.benhAn.lyDoVaoVien = "Mắt phải bị lệch vào trong và mi mắt hơi sụp"
      basePayload.benhAn.lacTuoiKhoiPhat = "5 tuổi"
      basePayload.khamBenh.strabismusPtosisRecord = { doSupMi: "2mm", gocLacKhongKinh: "15 độ", gocLacCoKinh: "10 độ" }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Lác trong quy tụ mắt phải kẽm sụp mi nhẹ (MS25 Lác & Sụp mi)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Tập nhược thị + Chỉnh kính khúc xạ + Hẹn đánh giá phẫu thuật"
    } else if (type === "MS26_PEDIATRIC") {
      basePayload.benhAn.lyDoVaoVien = "Trẻ nheo mắt khi nhìn bảng, ngồi gần tivi"
      basePayload.benhAn.treEmCanNangLucSinh = "3.2 kg"
      basePayload.benhAn.treEmTuanThai = "39 tuần"
      basePayload.khamBenh.pediatricRecord = { tinhTrangThiLuc: "Giảm khi nhìn xa", tatKhucXa: "Cận thị -1.5D" }
      basePayload.chanDoanVaRaVien.chanDoanChinh = "Tật khúc xạ cận thị học đường hai mắt (MS26 Mắt trẻ em)"
      basePayload.chanDoanVaRaVien.huongDieuTri = "Kê đơn kính cận thị + Hướng dẫn vệ sinh thị giác học đường"
    }

    methods.reset(basePayload as MedicalRecordFormDataPayload)
  }

  // ─── Submit handler ─────────────────────────────────────────────────
  const onSubmit = methods.handleSubmit(
    async (values) => {
      setServerError(null)

      if (recordType) {
        const ok = validateFormDataForRecordType(recordType, values as never)
        if (!ok.ok) {
          setServerError(ok.reason)
          return
        }
      }

      setSubmitting(true)
      try {
        const targetPatientId = patientProfileId || "c9000000-0000-0000-0000-000000000002"

        const response = await medicalRecordService.create({
          appointmentId,
          patientId: targetPatientId,
          recordType: recordType || "MS21_TRAUMA",
          notes: (values as any).chanDoanVaRaVien?.chanDoanChinh || values.benhAn?.lyDoVaoVien || "",
          formData: values,
        })

        if (!response?.data?.isSuccess) {
          setServerError(formatSystemErrorMessage(response?.codeMessage))
          setSubmitting(false)
          return
        }

        setSuccessInfo({
          recordId: response.data.medicalRecordId,
          mongoDocumentId: response.data.mongoDocumentId,
        })
      } catch (err) {
        setServerError(
          formatSystemErrorMessage(err instanceof Error ? err.message : null)
        )
      } finally {
        setSubmitting(false)
      }
    },
    (formErrors) => {
      console.warn("Form validation errors:", formErrors)
      setServerError("Một số trường dữ liệu không hợp lệ. Đã điền sẵn dữ liệu mẫu để bạn thử lại.")
    }
  )

  const accent = getAccentForRecordType(recordType)

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = "Eye Clinic Support System"
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8 print:max-w-none print:p-0 print:space-y-4"
        aria-label={recordType ? MEDICAL_RECORD_TYPE_LABELS[recordType] : "Tạo bệnh án"}
      >
        {/* Official A4 Print Header & Styles */}
        <OfficialMedicalRecordA4Print recordType={recordType || "MS21_TRAUMA"} />

        {/* Header — Screen mode */}
        <header className="rounded-lg border border-gray-200 bg-white p-5 print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${accentTextClass(accent)}`}>
                {recordType ? recordType.replace("MS", "MS ") : "BỆNH ÁN NHÃN KHOA"}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {recordType ? MEDICAL_RECORD_TYPE_LABELS[recordType] : "Bệnh án khám mắt"}
              </h1>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 shadow-xs"
                title="Điền mẫu dữ liệu test nhanh trong 1 click"
              >
                <Sparkles className="h-4 w-4 text-amber-600" />
                Điền mẫu test nhanh
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                title={t("printA4")}
              >
                <Printer className="h-4 w-4" />
                {t("printA4")}
              </button>
            </div>
          </div>
        </header>

        {/* Mini TOC */}
        <nav
          aria-label="Mục lục bệnh án"
          className="sticky top-2 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur print:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">{t("toc")}</span>
            <a href="#patient-info" className="hover:text-indigo-600">
              {t("sections.patientInfo")}
            </a>
            <a href="#benh-an" className="hover:text-indigo-600">
              {t("sections.reason")}
            </a>
            <a href="#kham-benh" className="hover:text-indigo-600">
              {t("sections.exam")}
            </a>
            <a href="#diagnosis" className="hover:text-indigo-600">
              {t("sections.diagnosis")}
            </a>
            <a href="#tong-ket" className="hover:text-indigo-600">
              {t("sections.summary")}
            </a>
            <a href="#don-thuoc" className="hover:text-indigo-600">
              {t("sections.treatment")}
            </a>
          </div>
        </nav>

        {/* I. ADMINISTRATION (Hành chính tối giản cho ngoại trú) */}
        <section id="patient-info">
          <PatientManagementSections recordType={recordType} patientProfile={patientProfile ?? undefined} />
        </section>

        {/* A. BỆNH ÁN — Lý do / Bệnh sử / Tiền sử (theo SubspecialtySections) */}
        <div id="benh-an">
          {recordType === "MS24_GLAUCOMA" ? (
            <GlaucomaFormSections />
          ) : (
            <SubspecialtySections recordType={recordType} />
          )}
        </div>

        {/* III. KHÁM BỆNH — shared universal layout for all recordTypes */}
        <div id="kham-benh">
          <UniversalEyeExamSections />
        </div>

        {/* IV. CHẨN ĐOÁN (rút gọn cho ngoại trú) */}
        <section id="diagnosis">
          <DiagnosisDischargeSections />
        </section>

        {/* MS22 Bán phần trước — bảng "Theo dõi điều trị" */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TreatmentProgressTable />
          </section>
        )}

        {/* MS22 Bán phần trước — Phiếu Phẫu thuật / Thủ thuật */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <SurgeryForm />
          </section>
        )}

        {/* V. ĐƠN THUỐC */}
        <section id="don-thuoc">
          <PrescriptionSection />
        </section>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 print:hidden"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Printable A4 PDF Footer & Signature Section */}
        <footer className="mt-8 hidden border-t border-gray-300 pt-6 print:block print:break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center text-xs text-black">
            <div>
              <p className="font-semibold uppercase tracking-wider">Người bệnh / Thân nhân</p>
              <p className="mt-1 text-[10px] text-gray-500 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
            </div>
            <div>
              <p className="italic text-[11px] text-gray-700">Ngày ..... tháng ..... năm 20...</p>
              <p className="mt-1 font-semibold uppercase tracking-wider">Bác sĩ khám bệnh</p>
              <p className="mt-1 text-[10px] text-gray-500 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-300 pt-3 flex items-center justify-between text-[10px] text-gray-700 font-semibold">
            <span className="uppercase tracking-wide">Eye Clinic Support System</span>
            <span>Bệnh án nhãn khoa — In từ phần mềm y tế</span>
          </div>
        </footer>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 print:hidden">
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            Điền mẫu test nhanh
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-lg ${accentButtonClass(recordType)} px-5 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("savingToMongo")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> {t("completeAndSave")}
              </>
            )}
          </button>
        </div>
      </form>

      {/* VI. CẬN LÂM SÀNG (OCT / Thị trường / Siêu âm / Chẩn đoán AI) — Đặt ngoài form chính để tránh lỗi form lồng form */}
      <section id="can-lam-sang" className="mt-8 print:hidden">
        <ParaclinicalPanel recordId={appointmentId} />
      </section>
    </FormProvider>
  )
}
