"use client"

/**
 * CreateMedicalRecordClient — MongoDB-backed JSON envelope form.
 *
 * Renders 6 ophthalmic templates (MS21-26) for outpatient examination.
 *
 * Notes (per user request, 2026-07-20):
 *  - The "Inpatient management" section (admission, bed, department transfer,
 *    total treatment days, discharge, death) has been removed entirely.
 *  - The Ministry-of-Health "ICD Diagnosis Codes" section has been removed
 *    (preliminary diagnosis is already handled by UC 35/36; final diagnosis
 *    is entered directly inside the subspecialty section).
 *  - The inpatient "Medical record summary" section is no longer
 *    rendered here; only a condensed "Summary" remains (final diagnosis,
 *    next-step treatment plan, prescription).
 *  - All labels use i18n (vi/en) via the `medicalRecord` + `form` namespaces.
 */
import { useMemo, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations, useLocale } from "next-intl"
import { Loader2, AlertCircle, CheckCircle2, Lock, Printer, Sparkles, Plus, X, Microscope, History, Zap, Stethoscope, Eye, Globe, HeartPulse, Pill, FileText, ClipboardCheck, ListChecks, ArrowRight, ArrowLeft, Check, Glasses } from "lucide-react"
import SummaryDiagnosisModal from "./medical-record-form/SummaryDiagnosisModal"
import CompletionCheckModal from "./CompletionCheckModal"
import CreatePrescriptionModal from "./medical-record-form/CreatePrescriptionModal"

import {
  medicalRecordFormDataSchema,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import medicalRecordService from "@/services/medical-record.service"
import medicalRecordsService from "@/services/medical-records.service"
import { patientProfileService } from "@/services/patient-profile.service"
import { medicalRecordPatientDemographicsService } from "@/services"
import { getMessage } from "@/constants/messages"
import {
  MEDICAL_RECORD_TYPES,
  MEDICAL_RECORD_TYPE_LABELS,
  type MedicalRecordType,
  type MedicalRecordFormDataPayload,
  type AITriageSymptomInput,
  type AITriageResponse,
} from "@/types"

import UniversalEyeExamSections from "./medical-record-form/UniversalEyeExamSections"
import OfficialMedicalRecordA4Print from "./medical-record-form/OfficialMedicalRecordA4Print"
import TreatmentProgressTable from "./medical-record-form/TreatmentProgressTable"
import SurgeryForm from "./medical-record-form/SurgeryForm"
import PreliminaryExamination, {
  type PreliminaryData,
} from "./medical-record-form/PreliminaryExamination"
import { getAccentForRecordType } from "./medical-record-form/SectionHeading"
import ParaclinicalPanel, { CreateLabRequestForm } from "./ParaclinicalPanel"

interface CreateMedicalRecordClientProps {
  appointmentId: string
  patientProfileId?: string
  initialRecordType?: string
  /** Skip preliminary step if already done via AI Triage */
  skipPreliminary?: boolean
  /** AI Triage data to pre-populate form */
  aiTriageData?: {
    symptoms: AITriageSymptomInput
    result: AITriageResponse
  } | null
  existingRecordId?: string | null
}

/** Subset of patient profile fields surfaced inside the form header. */
type PropsForSections = {
  fullName?: string | null
  gender?: string | null
  dob?: string | null
  phoneNumber?: string | null
  address?: string | null
  identityNumber?: string | null
  bhytNumber?: string | null
  bhytExpiryDate?: string | null
  bloodType?: string | null
  allergies?: string | null
  medicalHistory?: string | null
}

function accentButtonClass(recordType: string | undefined): string {
  return "bg-primary text-on-primary font-bold hover:opacity-90 active:scale-95 shadow-xs transition-all cursor-pointer"
}

function accentTextClass(accent: string): string {
  return "text-primary font-bold"
}

export default function CreateMedicalRecordClient({
  appointmentId,
  patientProfileId,
  initialRecordType,
  skipPreliminary = false,
  aiTriageData = null,
  existingRecordId = null,
}: CreateMedicalRecordClientProps) {
  const router = useRouter()
  const t = useTranslations("medicalRecord")
  const tWorkflow = useTranslations("medicalRecord.workflow")
  const tForm = useTranslations("form")
  const tCommon = useTranslations("common")
  const tParaclinical = useTranslations("doctor.paraclinical")

  const initialType = useMemo<MedicalRecordType | undefined>(() => {
    if (initialRecordType && (MEDICAL_RECORD_TYPES as readonly string[]).includes(initialRecordType)) {
      return initialRecordType as MedicalRecordType
    }
    return undefined
  }, [initialRecordType])

  const [recordType, setRecordType] = useState<MedicalRecordType | undefined>(initialType)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{
    recordId: string
    mongoDocumentId?: string
    /**
     * Snapshot of the AI pre-diagnosis result that was used to choose the
     * record template. Persisted in the successInfo so the post-save stepper
     * can render Step 1 as "done" without a second fetch. Also embedded into
     * the formData.aiSuggestion envelope on save so it survives full reloads.
     */
    aiTriage?: AITriageResponse
  } | null>(existingRecordId ? { recordId: existingRecordId } : null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showLabRequestForm, setShowLabRequestForm] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showCompletionCheckModal, setShowCompletionCheckModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [recordDetail, setRecordDetail] = useState<any | null>(null)
  const [pendingLabRequest, setPendingLabRequest] = useState(false)
  // Once-only flag so the persisted-record prefill does NOT clobber later
  // user edits when refreshKey bumps (e.g. after paraclinical / summary modal
  // saves). Set after the first successful reset() of methods.
  const prefillDoneRef = useRef(false)

  // Auto-check if existing record exists for appointmentId
  useEffect(() => {
    if (existingRecordId) {
      setSuccessInfo({ recordId: existingRecordId })
      return
    }
    if (!appointmentId || successInfo) return
    let cancelled = false
    medicalRecordsService
      .getMedicalRecords({ searchTerm: appointmentId, pageSize: 1 })
      .then((res) => {
        if (cancelled) return
        const items = res?.data ?? []
        if (items.length > 0) {
          setSuccessInfo({ recordId: items[0].id })
        }
      })
      .catch((err) => {
        console.warn("Could not check existing record for appointment:", appointmentId, err)
      })
    return () => {
      cancelled = true
    }
  }, [appointmentId, existingRecordId])

  // Fetch detail of saved record to evaluate stepper completion in real time
  useEffect(() => {
    if (!successInfo?.recordId) {
      setRecordDetail(null)
      return
    }
    let isMounted = true
    medicalRecordsService
      .getMedicalRecordById(successInfo.recordId)
      .then((res) => {
        if (isMounted && res.data) {
          setRecordDetail(res.data)
          // Sync the local recordType state from the persisted record so the
          // main form can render (the success banner uses MEDICAL_RECORD_TYPE_LABELS
          // which needs a real recordType). Without this sync, the resume path
          // (entering via existingRecordId) would early-return at `if (!recordType)`
          // and re-show the template selector even though a record already exists.
          const detailType = (res.data as { recordType?: string }).recordType
          if (detailType && MEDICAL_RECORD_TYPES.includes(detailType as MedicalRecordType)) {
            setRecordType(detailType as MedicalRecordType)
          }
          // Prefill the form from the persisted MongoDB formData ONCE on initial
          // load, so the resume view shows exactly what the doctor saved. We
          // only prefill when the local form is still empty (defaultValues) —
          // otherwise we'd clobber in-progress edits after a Save or after the
          // paraclinical / summary modals refresh the detail.
          const persistedFormData = (res.data as { formData?: MedicalRecordFormDataPayload })
            .formData
          if (
            persistedFormData &&
            typeof persistedFormData === "object" &&
            !prefillDoneRef.current
          ) {
            methods.reset(persistedFormData as MedicalRecordFormDataPayload)
            prefillDoneRef.current = true
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load record detail for stepper badges:", err)
      })

    return () => {
      isMounted = false
    }
  }, [successInfo?.recordId, refreshKey])

  // Auto-scroll to the current stepper step on initial load so the doctor
  // always lands exactly where they left off — even after a refresh / session
  // expiry / navigation. Only fires once per recordId.
  useEffect(() => {
    if (!successInfo?.recordId) return
    const t = setTimeout(() => {
      const detail = recordDetail
      if (!detail) return
      const isStep1Done = Boolean(
        successInfo?.aiTriage || (detail?.formData?.aiSuggestion && detail.formData.aiSuggestion.suggestedDisease)
      )
      const isStep2Done = Boolean(detail?.recordType && String(detail.recordType).trim() !== "")
      const isStep3Done = Boolean(successInfo?.recordId)
      const isStep4Done = Boolean(
        (detail?.octResults && detail.octResults.length > 0) ||
          (detail?.visualFieldTests && detail.visualFieldTests.length > 0) ||
          (detail?.ultrasoundEyes && detail.ultrasoundEyes.length > 0)
      )
      const isStep5Done = Boolean(
        detail?.diagnosisMain?.trim() ||
          detail?.formData?.chanDoanVaRaVien?.chanDoanChinh?.trim() ||
          detail?.formData?.benhAn?.chanDoanMaICD?.raVienBenhChinhTonThuong?.trim()
      )
      const isStep6Done = Boolean(
        (detail?.prescriptions && detail.prescriptions.length > 0) ||
          (detail?.glassesPrescriptions && detail.glassesPrescriptions.length > 0) ||
          (detail?.formData?.prescription?.drugs && detail.formData.prescription.drugs.length > 0) ||
          (detail?.formData?.keDonThuoc?.danhSachThuoc && detail.formData.keDonThuoc.danhSachThuoc.length > 0) ||
          (detail?.formData?.glassesPrescription && Object.values(detail.formData.glassesPrescription).some((v: any) => v !== null && v !== undefined && String(v).trim() !== ""))
      )
      const completion = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done, isStep6Done]
      const mandatory = [true, true, true, false, true, true]
      const firstPending = completion.findIndex((d, i) => !d && mandatory[i])
      const stepNumber = firstPending === -1 ? 7 : firstPending + 1
      // Map the "current step" to the action-card the doctor should resume on:
      //   step 5 → summary card (#summary), step 6 → prescription card (#prescription)
      const targetId = stepNumber === 5 ? "emr-step-5" : stepNumber === 6 ? "emr-step-6" : `emr-step-${stepNumber}`
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successInfo?.recordId, refreshKey])

  // ── Smart History Prefill States ───────────────────────────────────
  const [historyRecord, setHistoryRecord] = useState<{
    id: string
    date: string
    doctorName: string
    formData: MedicalRecordFormDataPayload
  } | null>(null)
  const [checkingHistory, setCheckingHistory] = useState(false)
  const [historyStatus, setHistoryStatus] = useState<"none" | "found" | "first-visit" | "applied">("none")

  // Auto-check patient history filtering strictly by (patientProfileId AND recordType)
  useEffect(() => {
    if (!patientProfileId || !recordType) return
    let cancelled = false
    setCheckingHistory(true)
    setHistoryStatus("none")
    setHistoryRecord(null)

    async function checkHistory() {
      try {
        const listRes = await medicalRecordsService.getMedicalRecords({
          patientId: patientProfileId,
          recordType: recordType,
          pageSize: 1,
        })
        if (cancelled) return
        const items = listRes?.data
        if (items && items.length > 0) {
          const latest = items[0]
          const detailRes = await medicalRecordService.getById(latest.id)
          if (cancelled) return
          if (detailRes?.data?.formData) {
            setHistoryRecord({
              id: latest.id,
              date: latest.createdAt ? new Date(latest.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
              doctorName: latest.doctorFullName || "Bác sĩ",
              formData: detailRes.data.formData as MedicalRecordFormDataPayload,
            })
            setHistoryStatus("found")
            return
          }
        }
        setHistoryStatus("first-visit")
      } catch (err) {
        console.warn("Could not check patient history for recordType:", recordType, err)
        if (!cancelled) setHistoryStatus("first-visit")
      } finally {
        if (!cancelled) setCheckingHistory(false)
      }
    }

    checkHistory()
    return () => {
      cancelled = true
    }
  }, [patientProfileId, recordType])

  const handleApplyHistoryPrefill = () => {
    if (!historyRecord?.formData) return
    const currentValues = methods.getValues()
    const mergedData = {
      ...historyRecord.formData,
      benhAn: {
        ...historyRecord.formData.benhAn,
        lyDoVaoVien: currentValues.benhAn?.lyDoVaoVien || historyRecord.formData.benhAn?.lyDoVaoVien || "",
        benhSu: currentValues.benhAn?.benhSu || historyRecord.formData.benhAn?.benhSu || "",
      },
    }
    methods.reset(mergedData as MedicalRecordFormDataPayload)
    setHistoryStatus("applied")
  }

  const locale = useLocale()
  const isEn = locale === "en"

  const handleApplyStandardDefaults = () => {
    const currentValues = methods.getValues()
    const standardData: any = {
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: currentValues.benhAn?.lyDoVaoVien || (isEn ? "Routine eye examination" : "Khám mắt định kỳ"),
        benhSu: currentValues.benhAn?.benhSu || (isEn ? "Routine ophthalmic check-up, no acute ocular symptoms." : "Bệnh nhân khám kiểm tra mắt định kỳ, không ghi nhận diễn biến bất thường cấp tính."),
        tienSuBanThanMat: isEn ? "No prior eye disease recorded" : "Chưa ghi nhận bệnh lý mắt trước đây",
        tienSuBanThanToanThan: isEn ? "Normal, no systemic diseases recorded" : "Bình thường, chưa ghi nhận bệnh lý toàn thân",
        tienSuGiaDinh: isEn ? "No family history of congenital eye diseases" : "Không ghi nhận ai mắc bệnh mắt bẩm sinh/di truyền",
      },
      khamBenh: {
        thiLucNhanApVaoVien: {
          matPhai: { thiLucKhongKinh: "10/10", thiLucCoKinh: "10/10", thiLucNhinGan: "P1.0", thiLucQuaLo: "10/10", nhanAp: "15", phuongPhapNhanAp: "Goldmann" },
          matTrai: { thiLucKhongKinh: "10/10", thiLucCoKinh: "10/10", thiLucNhinGan: "P1.0", thiLucQuaLo: "10/10", nhanAp: "15", phuongPhapNhanAp: "Goldmann" },
        },
        miMat: {
          matPhai: { tinhTrang: isEn ? "Normal" : "Bình thường", chuaKhac: isEn ? "Normal" : "Bình thường" },
          matTrai: { tinhTrang: isEn ? "Normal" : "Bình thường", chuaKhac: isEn ? "Normal" : "Bình thường" },
        },
        ketMac: {
          matPhai: { tinhTrang: isEn ? "Normal" : "Bình thường", cuongTu: isEn ? "None" : "Không", tietTo: isEn ? "Clear" : "Trong" },
          matTrai: { tinhTrang: isEn ? "Normal" : "Bình thường", cuongTu: isEn ? "None" : "Không", tietTo: isEn ? "Clear" : "Trong" },
        },
        giacMac: {
          matPhai: { trongSuot: isEn ? "Clear" : "Trong suốt", seo: isEn ? "None" : "Không", bieuMo: isEn ? "Intact" : "Nguyên vẹn", tuaMatSau: isEn ? "Negative (-)" : "Âm tính", nhuMo: isEn ? "Clear" : "Trong suốt" },
          matTrai: { trongSuot: isEn ? "Clear" : "Trong suốt", seo: isEn ? "None" : "Không", bieuMo: isEn ? "Intact" : "Nguyên vẹn", tuaMatSau: isEn ? "Negative (-)" : "Âm tính", nhuMo: isEn ? "Clear" : "Trong suốt" },
        },
        tienPhong: {
          matPhai: { tinhTrang: isEn ? "Clear, depth 3mm" : "Sạch, độ sâu 3mm", doSauMm: 3.0, doDuc: isEn ? "Clear" : "Trong", tyndall: isEn ? "Negative (-)" : "Âm tính (-)", gocTienPhong: isEn ? "Wide (Grade IV)" : "Rộng độ IV" },
          matTrai: { tinhTrang: isEn ? "Clear, depth 3mm" : "Sạch, độ sâu 3mm", doSauMm: 3.0, doDuc: isEn ? "Clear" : "Trong", tyndall: isEn ? "Negative (-)" : "Âm tính (-)", gocTienPhong: isEn ? "Wide (Grade IV)" : "Rộng độ IV" },
        },
        mongMatDongTu: {
          matPhai: { tinhTrang: isEn ? "Round, 3mm diameter, prompt (+)" : "Tròn, đường kính 3mm, phản xạ (+)", duongKinh: 3.0, hinhDang: isEn ? "Round, regular" : "Tròn đều", phanXaDongTu: isEn ? "Prompt (+)" : "Dương tính (+)" },
          matTrai: { tinhTrang: isEn ? "Round, 3mm diameter, prompt (+)" : "Tròn, đường kính 3mm, phản xạ (+)", duongKinh: 3.0, hinhDang: isEn ? "Round, regular" : "Tròn đều", phanXaDongTu: isEn ? "Prompt (+)" : "Dương tính (+)" },
        },
        theThuyTinh: {
          matPhai: { tinhTrang: isEn ? "Clear" : "Trong suốt" },
          matTrai: { tinhTrang: isEn ? "Clear" : "Trong suốt" },
        },
        dichKinh: {
          matPhai: { tinhTrang: isEn ? "Clear" : "Trong" },
          matTrai: { tinhTrang: isEn ? "Clear" : "Trong" },
        },
        dayMatDiaThiHoangDiem: {
          matPhai: { gaiThi: isEn ? "Pink, sharp margin, C/D 0.3" : "Hồng, bờ rõ, C/D 0.3", tyLeCD: "0.3", boGaiThi: isEn ? "Sharp" : "Rõ", hoangDiem: isEn ? "Normal reflex (+)" : "Ánh trung tâm (+)" },
          matTrai: { gaiThi: isEn ? "Normal, C/D 0.3" : "Bình thường, C/D 0.3", tyLeCD: "0.3", boGaiThi: isEn ? "Sharp" : "Rõ", hoangDiem: isEn ? "Normal reflex (+)" : "Ánh trung tâm (+)" },
        },
        dayMatVongMacMachMau: {
          matPhai: { vongMac: isEn ? "Flat, attached" : "Áp phẳng, bình thường" },
          matTrai: { vongMac: isEn ? "Flat, attached" : "Áp phẳng, bình thường" },
        },
        hocMat: {
          matPhai: { tinhTrang: isEn ? "Normal" : "Bình thường" },
          matTrai: { tinhTrang: isEn ? "Normal" : "Bình thường" },
        },
        khamToanThan: { mach: "75", nhietDo: "36.8", huyetAp: "120/80", nhipTho: "18", canNang: "58" },
        traumaRecord: recordType === "MS21_TRAUMA" ? { injuryCause: isEn ? "None" : "Không", odInjuries: isEn ? "Normal" : "Bình thường", osInjuries: isEn ? "Normal" : "Bình thường" } : {},
        anteriorSegmentRecord: recordType === "MS22_ANTERIOR" ? { viTriTonThuong: isEn ? "Normal anterior segment" : "Bán phần trước bình thường", mucDoTonThuong: isEn ? "Normal" : "Bình thường" } : {},
        fundusRecord: recordType === "MS23_FUNDUS" ? { viTriVongMac: isEn ? "Normal macula" : "Hoàng điểm bình thường", tinhTrangMachMau: isEn ? "Normal" : "Bình thường" } : {},
        glaucomaRecord: recordType === "MS24_GLAUCOMA" ? { loaiGlaucoma: isEn ? "Glaucoma suspect" : "Theo dõi Glôcôm", gocTienPhong: isEn ? "Wide (Grade IV)" : "Rộng độ IV" } : {},
        strabismusPtosisRecord: recordType === "MS25_STRABISMUS_PTOSIS" ? { doSupMi: "0mm", gocLacKhongKinh: isEn ? "0 deg" : "0 độ" } : {},
        pediatricRecord: recordType === "MS26_PEDIATRIC" ? { tinhTrangThiLuc: isEn ? "Normal" : "Bình thường" } : {},
      },
    }
    methods.reset(standardData as MedicalRecordFormDataPayload)
    setHistoryStatus("applied")
  }

  // ── Step flow: template → form (preliminary step handled by AI Triage) ────
  const initialStep = "template"
  const [step, setStep] = useState<"preliminary" | "template">(initialStep)
  const [preliminary, setPreliminary] = useState<PreliminaryData | null>(null)

  // ── Patient profile (fetched lazily so header info is real) ─────────
  const [patientProfile, setPatientProfile] = useState<PropsForSections | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!patientProfileId) {
      setPatientProfile(null)
      return
    }
    ; (async () => {
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

  // ── AI Triage data feeds into form defaults ────────────────────────
  useEffect(() => {
    if (!aiTriageData) return
    
    const { symptoms, result } = aiTriageData
    
    // Build chief complaint from main symptom
    const chiefComplaint = `${symptoms.symptom} - ${symptoms.duration}`
    
    // Build disease history from symptoms
    const symptomParts: string[] = []
    if (symptoms.eye_redness === "yes") symptomParts.push("Đỏ mắt")
    if (symptoms.blurred_vision === "yes") symptomParts.push("Mờ mắt")
    if (symptoms.light_sensitivity === "yes") symptomParts.push("Sợ ánh sáng")
    if (symptoms.discharge === "yes") symptomParts.push("Chảy dịch")
    if (symptoms.swelling === "yes") symptomParts.push("Sưng mắt")
    if (symptoms.floaters === "yes") symptomParts.push("Ruồi bay")
    if (symptoms.headache === "yes") symptomParts.push("Đau đầu")
    
    const benhSu = symptomParts.length > 0 
      ? `Triệu chứng: ${symptomParts.join(", ")}.\nMức độ đau: ${symptoms.pain_level}.\nAI Prediction: ${result.predictedDisease} (${((result.confidence || 0) * 100).toFixed(1)}%)`
      : `AI Prediction: ${result.predictedDisease} (${((result.confidence || 0) * 100).toFixed(1)}%)`
    
    methods.reset({
      schemaVersion: "1.2",
      benhAn: {
        lyDoVaoVien: chiefComplaint,
        benhSu: benhSu,
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: `Tiểu đường: ${symptoms.diabetes}. Cao huyết áp: ${symptoms.hypertension}.`,
        tienSuGiaDinh: symptoms.family_history === "yes" ? "Có tiền sử gia đình bệnh mắt" : "",
      },
      khamBenh: {
        khamToanThan: {},
        traumaRecord: {},
        glaucomaRecord: {},
        strabismusPtosisRecord: {},
        pediatricRecord: {},
      },
    } as MedicalRecordFormDataPayload)
    
    // Mark AI data as processed to prevent re-run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTriageData])

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

  // ─── Choose medical record type ─────────────────────────────────────────────
  // Skip the template selector when resuming an existing record. The doctor
  // already committed to a recordType when they first saved the medical record
  // (Step 2). Forcing them through the template picker again would reset the
  // form, drop the success hub banner, and require them to re-pick the same
  // template. We just wait for the detail fetch (above) to hydrate recordType.
  if (!recordType && !successInfo?.recordId) {
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
              className="group flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-[#00658D] hover:shadow-xs"
            >
              <span className="text-sm font-semibold text-[#00658D]">
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
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
        </button>
      </div>
    )
  }

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = "Eye Clinic Support System"
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  // ─── Success banner + Professional EMR Workflow Stepper & Hub ──────────
  if (successInfo) {
    const targetPatientId = patientProfileId || "c9000000-0000-0000-0000-000000000002"
    // ── Derive 6-step completion flags deterministically from persisted data ──
    // Step 1: AI pre-diagnosis
    //   Done when EITHER (a) successInfo already carries an AI snapshot, OR
    //   (b) the persisted formData contains an aiSuggestion envelope (added at
    //   submit time so it survives reloads).
    const persistedAiSuggestion = recordDetail?.formData?.aiSuggestion
    const isStep1Done = Boolean(
      successInfo?.aiTriage || (persistedAiSuggestion && persistedAiSuggestion.suggestedDisease)
    )
    // Step 2: Record type chosen
    //   Done when the saved record has a non-empty recordType (recordType is
    //   persisted on MedicalRecord.RecordType in SQL).
    const isStep2Done = Boolean(
      recordDetail?.recordType && String(recordDetail.recordType).trim() !== ""
    )
    // Step 3: EMR saved
    //   Done when we have a recordId (i.e. the form was submitted).
    const isStep3Done = Boolean(successInfo?.recordId)
    // Step 4: Paraclinical (optional) — done when any lab result has been recorded.
    const isStep4Done = Boolean(
      (recordDetail?.octResults && recordDetail.octResults.length > 0) ||
        (recordDetail?.visualFieldTests && recordDetail.visualFieldTests.length > 0) ||
        (recordDetail?.ultrasoundEyes && recordDetail.ultrasoundEyes.length > 0)
    )
    // Step 5: medical record summary (final diagnosis + ICD-10).
    const isStep5Done = Boolean(
      recordDetail?.diagnosisMain?.trim() ||
        recordDetail?.formData?.chanDoanVaRaVien?.chanDoanChinh?.trim() ||
        recordDetail?.formData?.benhAn?.chanDoanMaICD?.raVienBenhChinhTonThuong?.trim()
    )
    // Step 6: prescription / glasses Rx.
    const isStep6Done = Boolean(
      (recordDetail?.prescriptions && recordDetail.prescriptions.length > 0) ||
        (recordDetail?.glassesPrescriptions && recordDetail.glassesPrescriptions.length > 0) ||
        (recordDetail?.formData?.prescription?.drugs && recordDetail.formData.prescription.drugs.length > 0) ||
        (recordDetail?.formData?.keDonThuoc?.danhSachThuoc && recordDetail.formData.keDonThuoc.danhSachThuoc.length > 0) ||
        (recordDetail?.formData?.glassesPrescription && Object.values(recordDetail.formData.glassesPrescription).some((v: any) => v !== null && v !== undefined && String(v).trim() !== ""))
    )

    // Current step = first non-done mandatory step. The EMR workflow mandates
    // that steps 1, 2, 3, 5, 6 must be completed in order; step 4 is optional.
    // Doctors must always pick up where they left off.
    const stepCompletion = [isStep1Done, isStep2Done, isStep3Done, isStep4Done, isStep5Done, isStep6Done]
    const mandatorySteps = [true, true, true, false, true, true] // step 4 is optional
    // The "current" step is the smallest N where stepN is mandatory and not done.
    const currentStepNumber = (() => {
      // Skip optional step 4 when computing the "current" mandatory step — that
      // way doctors don't feel stuck on an optional step.
      let firstPending = stepCompletion.findIndex((done, i) => !done && mandatorySteps[i])
      if (firstPending === -1) return 7 // all mandatory done
      return firstPending + 1
    })()

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 print:max-w-none print:p-0">
        {/* Success Banner */}
        <div className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-yellow-50 p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-950">
                {tWorkflow("title", { defaultValue: "QUY TRÌNH 6 BƯỚC KHÁM BỆNH EMR" })}
              </h2>
              <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                <strong className="font-bold">
                  {MEDICAL_RECORD_TYPE_LABELS[recordType ?? (recordDetail?.recordType as MedicalRecordType) ?? "MS21_TRAUMA"]}
                </strong>{" "}
                {successInfo?.aiTriage
                  ? `(AI gợi ý: ${successInfo.aiTriage.predictedDisease})`
                  : ""}{" "}
                đã lưu thành công. <strong>Ca khám chưa kết thúc</strong> — theo quy trình EMR,
                bác sĩ <u>cần hoàn thành thêm 2 bước bắt buộc</u>:
                <strong> Tổng kết bệnh án (chẩn đoán cuối + ICD-10)</strong> và <strong>Kê đơn thuốc/kính</strong>,
                trước khi có thể xác nhận hoàn thành ca khám.
              </p>
            </div>
          </div>
        </div>

        {/* EMR Professional Stepper Indicator — 6 STEPS (AI → Template → Save → Paraclinical → Summary → Prescription) */}
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              {tWorkflow("title")}
            </h3>
            <span className="rounded-full bg-amber-50 border border-amber-200/70 px-3 py-1 text-xs font-bold text-amber-800">
              {tWorkflow("currentBadge", { current: Math.min(currentStepNumber, 6), total: 6 })}
            </span>
          </div>

          {/* 6-step horizontal stepper */}
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            {[
              { n: 1, done: isStep1Done, mandatory: true,  enKey: "step1" },
              { n: 2, done: isStep2Done, mandatory: true,  enKey: "step2" },
              { n: 3, done: isStep3Done, mandatory: true,  enKey: "step3" },
              { n: 4, done: isStep4Done, mandatory: false, enKey: "step4" },
              { n: 5, done: isStep5Done, mandatory: true,  enKey: "step5" },
              { n: 6, done: isStep6Done, mandatory: true,  enKey: "step6" },
            ].map((s) => {
              const isCurrent = s.n === currentStepNumber
              const baseColor = isCurrent
                ? "border-primary bg-[#c6e7ff]/30 shadow-xs ring-1 ring-primary/20"
                : s.done
                  ? "border-emerald-300 bg-emerald-50/80"
                  : s.mandatory
                    ? "border-amber-200 bg-amber-50/60"
                    : "border-outline-variant/40 bg-surface-container-low/60"
              const badgeColor = s.done ? "bg-[#006c49]" : isCurrent ? "bg-primary" : s.mandatory ? "bg-amber-600" : "bg-on-surface-variant/40"
              const subColor = s.done ? "text-[#006c49]" : isCurrent ? "text-primary" : s.mandatory ? "text-amber-800" : "text-on-surface-variant"
              const tagColor = s.done ? "bg-emerald-100 text-emerald-800" : s.mandatory ? "bg-amber-100 text-amber-800" : "bg-surface-container text-on-surface-variant"
              const tagText = s.done ? tWorkflow("done") : s.mandatory ? tWorkflow("mandatory") : tWorkflow("optional")
              return (
                <li
                  key={s.n}
                  id={`emr-step-${s.n}`}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 ${baseColor}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${badgeColor}`}>
                    {s.done ? <Check className="h-4 w-4 stroke-[3]" /> : s.n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      {tWorkflow("stepLabelPrefix", { defaultValue: "Bước" })} {s.n}
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {tWorkflow(`${s.enKey}.label`)}
                    </p>
                    <p className={`text-[10px] truncate font-semibold flex items-center gap-1 ${subColor}`}>
                      {s.done ? (
                        <>
                          {tWorkflow("done")} <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        </>
                      ) : (
                        tWorkflow(`${s.enKey}.hint`)
                      )}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${tagColor}`}>
                      {tagText}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* Hint pointing doctor to current step (auto-derived) */}
          {currentStepNumber === 5 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-bold">{tWorkflow("nextStep")}:</strong> Bấm nút <strong>"Tổng kết bệnh án & ICD-10"</strong> bên dưới
                để điền chẩn đoán cuối, mã ICD-10, hướng điều trị tiếp theo. Đây là bước bắt buộc trước khi kê đơn.
              </div>
            </div>
          )}
          {currentStepNumber === 6 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-bold">{tWorkflow("nextStep")}:</strong> Bấm nút <strong>"Kê đơn thuốc/kính"</strong> bên dưới
                để hoàn tất đơn thuốc hoặc đơn kính cho bệnh nhân. Sau đó bạn có thể xác nhận hoàn thành ca khám.
              </div>
            </div>
          )}
          {currentStepNumber === 7 && (
            <div className="flex items-start gap-2 rounded-xl border border-green-300 bg-green-50 p-3 text-xs text-green-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
              <div>
                <strong className="font-bold">Đủ điều kiện hoàn thành ca khám!</strong> Tất cả các bước bắt buộc đã hoàn tất.
                Bác sĩ có thể bấm nút <strong className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> "Hoàn thành ca khám"</strong> ở dưới cùng trang để kết thúc và chuyển bệnh nhân ra viện.
              </div>
            </div>
          )}
          {currentStepNumber <= 4 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-bold">{tWorkflow("nextStep")}:</strong>{" "}
                {currentStepNumber === 1 && "Tiếp tục chạy AI chẩn đoán sơ bộ nếu chưa xong."}
                {currentStepNumber === 2 && "Chọn mẫu bệnh án phù hợp với chẩn đoán sơ bộ."}
                {currentStepNumber === 3 && "Bổ sung các mục khám rồi bấm \"Hoàn tất & lưu bệnh án\" ở cuối form."}
                {currentStepNumber === 4 && "Cận lâm sàng là bước tùy chọn — có thể bỏ qua nếu không cần thiết."}
              </div>
            </div>
          )}
        </div>

        {/* EMR Interactive Action Hub */}
        {/* EMR Interactive Action Hub */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Paraclinical (Optional) — Step 4 */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Microscope className="h-5 w-5" />
                <span>Bước 4 · Cận lâm sàng</span>
                <span className="ml-auto rounded-full bg-surface-container-low border border-outline-variant/30 px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">Tùy chọn</span>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Tạo phiếu chỉ định OCT võng mạc, Thị trường, Siêu âm hoặc xét nghiệm cho bệnh nhân này.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLabRequestForm(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-xs hover:opacity-90 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {isStep4Done ? "Xem / Thêm cận lâm sàng" : "Tạo phiếu cận lâm sàng"}
            </button>
          </div>

          {/* Card 2: Medical Record Summary (MANDATORY) — Step 5 */}
          <div className={`rounded-2xl border-2 ${isStep5Done ? "border-emerald-300 bg-emerald-50/30" : "border-amber-300 bg-amber-50/30"} p-5 shadow-xs flex flex-col justify-between space-y-3`}>
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <FileText className="h-5 w-5" />
                <span>Bước 5 · Tổng kết bệnh án</span>
                <span className="ml-auto rounded-full bg-amber-100 border border-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-800">BẮT BUỘC</span>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Điền <strong>Chẩn đoán chính</strong>, gắn <strong>Mã ICD-10</strong>, <strong>Hướng điều trị tiếp theo</strong> & tình trạng ra viện.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSummaryModal(true)}
              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors ${isStep5Done ? "bg-[#006c49] hover:bg-[#005237]" : "bg-amber-700 hover:bg-amber-800"}`}
            >
              <Sparkles className="h-4 w-4 text-amber-200" />
              {isStep5Done ? (
                <>
                  Sửa tổng kết bệnh án <CheckCircle2 className="h-3.5 w-3.5 text-emerald-100" />
                </>
              ) : (
                "Tổng kết bệnh án & ICD-10 (Cần làm)"
              )}
            </button>
          </div>

          {/* Card 3: Prescription / Glasses Rx (MANDATORY) — Step 6 */}
          <div className={`rounded-2xl border-2 ${isStep6Done ? "border-emerald-300 bg-emerald-50/30" : "border-[#81cfff]/40 bg-[#c6e7ff]/20"} p-5 shadow-xs flex flex-col justify-between space-y-3`}>
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Pill className="h-5 w-5" />
                <span>Bước 6 · Kê đơn thuốc/kính</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${isStep6Done ? "bg-emerald-100 text-emerald-800 border border-emerald-200/70" : "bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40"}`}>
                  {isStep6Done ? "ĐÃ HOÀN THÀNH" : "BẮT BUỘC"}
                </span>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Mở cửa sổ kê <strong>đơn thuốc điện tử</strong> hoặc <strong>đơn kính khúc xạ</strong> EMR. Hoàn tất bước này để có thể kết thúc ca khám.
              </p>

              {/* Summary Chip when done */}
              {isStep6Done && (
                <div className="mt-2 rounded-xl bg-white p-2.5 border border-green-200 text-xs text-green-900 space-y-1 shadow-2xs">
                  {recordDetail?.formData?.glassesPrescription?.sphOd && (
                    <p className="font-semibold text-[11px] text-indigo-800 flex items-center gap-1">
                      <Glasses className="h-3.5 w-3.5" /> Đơn kính: OD {recordDetail.formData.glassesPrescription.sphOd}D / OS {recordDetail.formData.glassesPrescription.sphOs || "—"}D
                    </p>
                  )}
                  {(recordDetail?.formData?.prescription?.drugs?.length > 0 || recordDetail?.formData?.keDonThuoc?.danhSachThuoc?.length > 0) && (
                    <p className="font-semibold text-[11px] text-emerald-800 flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5" /> Đơn thuốc: {recordDetail?.formData?.prescription?.drugs?.length || recordDetail?.formData?.keDonThuoc?.danhSachThuoc?.length} loại thuốc
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPrescriptionModal(true)}
              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors ${isStep6Done ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#00658D] hover:bg-[#005273] ring-2 ring-[#00658D]/30"}`}
            >
              <Pill className="h-4 w-4" />
              {isStep6Done ? (
                <>
                  Xem / Sửa đơn thuốc & kính <CheckCircle2 className="h-3.5 w-3.5 text-emerald-100" />
                </>
              ) : (
                "Kê đơn thuốc/kính (Cần làm)"
              )}
            </button>
          </div>
        </div>

        {/* Modal: Prescription / Glasses Rx */}
        {showPrescriptionModal && (
          <CreatePrescriptionModal
            recordId={successInfo.recordId}
            patientName={recordDetail?.patientFullName || patientProfile?.fullName || undefined}
            initialFormData={recordDetail?.formData}
            onClose={() => setShowPrescriptionModal(false)}
            onSuccess={() => {
              setShowPrescriptionModal(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}

        {/* Modal: Paraclinical Order */}
        {showLabRequestForm && (
          <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-gray-100">
              {/* Fixed Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-sky-50 via-white to-slate-50 px-6 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00658D] text-white shadow-xs">
                    <Microscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Tạo phiếu chỉ định Cận lâm sàng mới
                    </h2>
                    <p className="text-xs text-gray-500">
                      OCT, Thị trường, Siêu âm và Chụp ảnh cận lâm sàng
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabRequestForm(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label={tParaclinical("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-4">
                <CreateLabRequestForm
                  recordId={successInfo.recordId}
                  onCreated={() => {
                    setShowLabRequestForm(false)
                    setRefreshKey((k) => k + 1)
                  }}
                  t={tParaclinical}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Summary Diagnosis & Discharge */}
        {showSummaryModal && (
          <SummaryDiagnosisModal
            recordId={successInfo.recordId}
            initialData={methods.getValues() as any}
            onClose={() => setShowSummaryModal(false)}
            onSuccess={() => {
              setRefreshKey((k) => k + 1)
            }}
            onNavigateToPrescription={() => {
              setShowPrescriptionModal(true)
            }}
          />
        )}

        {/* Modal Validation Completing Examination */}
        {showCompletionCheckModal && (
          <CompletionCheckModal
            isOpen={showCompletionCheckModal}
            onClose={() => setShowCompletionCheckModal(false)}
            recordId={successInfo.recordId}
            appointmentId={appointmentId}
            patientId={targetPatientId}
            patientName={recordDetail?.patientFullName || patientProfile?.fullName || undefined}
            onOpenSummaryModal={() => setShowSummaryModal(true)}
          />
        )}

        {/* Navigation & Print Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6 print:hidden">
          <button
            type="button"
            onClick={() => router.push("/doctor/queue")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Hàng chờ bác sĩ
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/doctor/records/${successInfo.recordId}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
            >
              {t("viewDetail")}
            </button>
            <button
              type="button"
              onClick={() => setShowCompletionCheckModal(true)}
              disabled={!isStep5Done || !isStep6Done}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-md hover:shadow-lg ${(!isStep5Done || !isStep6Done) ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              title={(!isStep5Done || !isStep6Done)
                ? "Vui lòng hoàn thành Tổng kết bệnh án (Bước 5) và Kê đơn thuốc/kính (Bước 6) trước khi kết thúc ca khám."
                : "Xác nhận hoàn thành các bước bắt buộc và kết thúc ca khám"}
            >
              {(!isStep5Done || !isStep6Done) ? (
                <>
                  <Lock className="h-4 w-4 text-slate-200 shrink-0" />
                  Hoàn thành ca khám (chưa đủ điều kiện)
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-200 shrink-0" />
                  Hoàn thành ca khám
                </>
              )}
            </button>
          </div>
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

        // Persist the AI pre-diagnosis snapshot inside the formData envelope so
        // it survives MongoDB round-trips. The post-save stepper uses this to
        // detect "Step 1 done" on page reload (when React state is gone).
        const formDataWithAi = aiTriageData
          ? ({
              ...(values as unknown as Record<string, unknown>),
              aiSuggestion: {
                suggestedRecordType: recordType || "MS21_TRAUMA",
                suggestedDisease: aiTriageData.result.predictedDisease,
                confidence: aiTriageData.result.confidence,
                riskLevel: aiTriageData.result.riskLevel,
                topDifferentials: aiTriageData.result.differentials ?? [],
                capturedAt: new Date().toISOString(),
              },
            } as unknown as MedicalRecordFormDataPayload)
          : values

        const response = await medicalRecordService.create({
          appointmentId,
          patientId: targetPatientId,
          recordType: recordType || "MS21_TRAUMA",
          notes: (values as any).chanDoanVaRaVien?.chanDoanChinh || values.benhAn?.lyDoVaoVien || "",
          formData: formDataWithAi,
        })

        if (!response?.data?.isSuccess) {
          setServerError(formatSystemErrorMessage(response?.codeMessage))
          setSubmitting(false)
          return
        }

        setSuccessInfo({
          recordId: response.data.medicalRecordId,
          mongoDocumentId: response.data.mongoDocumentId,
          aiTriage: aiTriageData?.result,
        })

        if (pendingLabRequest) {
          setShowLabRequestForm(true)
          setPendingLabRequest(false)
        }
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
      const firstKey = Object.keys(formErrors)[0]
      const firstErr: any = (formErrors as any)[firstKey]
      const detailedMessage = firstErr?.message || firstErr?.root?.message
      setServerError(
        detailedMessage
          ? `Lỗi dữ liệu: ${detailedMessage}`
          : "Một số trường dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
      )
    }
  )

  const accent = getAccentForRecordType(recordType)

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

        {/* Smart Fast-Fill & History Prefill Banner */}
        <div className="print:hidden">
          {checkingHistory ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-700 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Đang kiểm tra lịch sử khám mẫu <strong>{recordType ? MEDICAL_RECORD_TYPE_LABELS[recordType] : ""}</strong> cho bệnh nhân này...</span>
            </div>
          ) : historyStatus === "found" && historyRecord ? (
            <div className="rounded-xl border border-sky-200 bg-linear-to-r from-sky-50/90 via-white to-slate-50/90 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00658D] text-white shadow-xs">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Phát hiện lịch sử khám mẫu {recordType ? MEDICAL_RECORD_TYPE_LABELS[recordType] : ""} ngày {historyRecord.date}
                      </span>
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#00658D]">
                        Lần khám trước
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Bác sĩ thực hiện: <strong className="text-slate-800">{historyRecord.doctorName}</strong>. Bạn có muốn sao chép lại chỉ số khám để điền nhanh không?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyHistoryPrefill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#00658D] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#005273] transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Sao chép khám gần nhất
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryStatus("none")}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Bỏ qua (Điền mới)
                  </button>
                </div>
              </div>
            </div>
          ) : historyStatus === "first-visit" ? (
            <div className="rounded-xl border border-amber-200 bg-linear-to-r from-amber-50/80 via-white to-orange-50/80 p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 text-sm">
                      Lần đầu khám bằng mẫu {recordType ? MEDICAL_RECORD_TYPE_LABELS[recordType] : ""} cho bệnh nhân này
                    </span>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Hệ thống có thể hỗ trợ bác sĩ tự động điền các chỉ số khám mắt bình thường (10/10, nhãn áp 15mmHg, mắt trong) chỉ với 1 click.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyStandardDefaults}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors"
                  >
                    <Zap className="h-4 w-4 text-amber-200" />
                    Điền mẫu khám chuẩn (Bình thường)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryStatus("none")}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            </div>
          ) : historyStatus === "applied" ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Đã hỗ trợ điền nhanh dữ liệu khám thành công. Bác sĩ có thể kiểm tra và tùy chỉnh thêm.
              </span>
              <button
                type="button"
                onClick={() => setHistoryStatus("none")}
                className="text-emerald-700 hover:underline font-semibold text-[11px]"
              >
                Ẩn thông báo
              </button>
            </div>
          ) : null}
        </div>

        {/* Mini TOC — Clinical Navigation */}
        <nav
          aria-label={isEn ? "Clinical examination TOC" : "Mục lục khám mắt lâm sàng"}
          className="sticky top-2 z-10 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 p-3 backdrop-blur print:hidden shadow-xs"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              {isEn ? "EMR Clinical Examination:" : "Khám mắt lâm sàng EMR:"}
            </span>
            <a href="#sec-thi-luc" className="hover:text-primary font-bold text-on-surface-variant flex items-center gap-1.5 transition-colors">
              <Eye className="h-3.5 w-3.5 text-primary" />
              {isEn ? "Visual Acuity & IOP" : "Thị lực & Nhãn áp"}
            </a>
            <a href="#sec-ban-phan-truoc" className="hover:text-primary font-bold text-on-surface-variant flex items-center gap-1.5 transition-colors">
              <Microscope className="h-3.5 w-3.5 text-primary" />
              {isEn ? "Anterior Segment" : "Bán phần trước"}
            </a>
            <a href="#sec-ban-phan-sau" className="hover:text-primary font-bold text-on-surface-variant flex items-center gap-1.5 transition-colors">
              <Globe className="h-3.5 w-3.5 text-primary" />
              {isEn ? "Posterior Segment" : "Bán phần sau"}
            </a>
            {recordType && (
              <a href="#sec-chuyen-khoa" className="hover:text-primary font-bold text-on-surface-variant flex items-center gap-1.5 transition-colors">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                {isEn ? "Specialty Examination" : "Khám Chuyên Khoa"}
              </a>
            )}
            <a href="#sec-toan-than" className="hover:text-primary font-bold text-on-surface-variant flex items-center gap-1.5 transition-colors">
              <HeartPulse className="h-3.5 w-3.5 text-primary" />
              {isEn ? "Systemic Examination" : "Khám Toàn Thân"}
            </a>
          </div>
        </nav>

        {/* Clinical Examination — detailed clinical eye exam (including specialty-specific sub-sections) */}
        <div id="kham-benh">
          <UniversalEyeExamSections recordType={recordType} />
        </div>

        {/* MS22 Anterior Segment — "Treatment Follow-up" table */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TreatmentProgressTable />
          </section>
        )}

        {/* MS22 Anterior Segment — Surgery / Procedure Form */}
        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <SurgeryForm />
          </section>
        )}

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

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-6 print:hidden">
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
            className={`inline-flex items-center gap-2 rounded-lg ${accentButtonClass(recordType)} px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition-all hover:shadow-lg`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("savingToMongo")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Lưu hồ sơ khám bệnh
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
