"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Stethoscope,
  Eye,
  Pill,
  AlertCircle,
  Loader2,
  Activity,
  ClipboardList,
} from "lucide-react"
import { RecordType, RECORD_TYPE_LABELS, CreateMedicalRecordRequest } from "@/types"
import { createMedicalRecordService } from "@/services/create-medical-record.service"

// Import extracted components
import RecordTypeStep from "./medical-record-form/steps/RecordTypeStep"
import HistoryStep from "./medical-record-form/steps/HistoryStep"
import EyeExamStep from "./medical-record-form/steps/EyeExamStep"
import SubspecialtyStep from "./medical-record-form/steps/SubspecialtyStep"
import DiagnosisStep from "./medical-record-form/steps/DiagnosisStep"
import PrescriptionStep from "./medical-record-form/steps/PrescriptionStep"

interface CreateMedicalRecordClientProps {
  appointmentId: string
  patientProfileId?: string
}

const STEPS = [
  { id: 1, title: "Loại bệnh án", icon: FileText },
  { id: 2, title: "Lý do & Tiền sử", icon: Stethoscope },
  { id: 3, title: "Khám mắt", icon: Eye },
  { id: 4, title: "Chuyên khoa", icon: Activity },
  { id: 5, title: "Chẩn đoán", icon: ClipboardList },
  { id: 6, title: "Kê đơn", icon: Pill },
]

export default function CreateMedicalRecordClient({
  appointmentId,
  patientProfileId,
}: CreateMedicalRecordClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRecordType, setSelectedRecordType] = useState<RecordType | null>(null)
  const [formData, setFormData] = useState<Partial<CreateMedicalRecordRequest>>({
    appointmentId,
    recordType: undefined,
  })

  const updateFormData = useCallback(
    (updates: Partial<CreateMedicalRecordRequest>) => {
      setFormData((prev) => ({ ...prev, ...updates }))
    },
    []
  )

  const handleSelectRecordType = (type: RecordType) => {
    setSelectedRecordType(type)
    updateFormData({ recordType: type })
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await createMedicalRecordService.createMedicalRecord({
        appointmentId,
        recordType: formData.recordType!,
        chiefComplaint: formData.chiefComplaint,
        illnessDayNumber: formData.illnessDayNumber,
        medicalHistory: formData.medicalHistory,
        personalHistoryEye: formData.personalHistoryEye,
        personalHistorySystemic: formData.personalHistorySystemic,
        familyHistory: formData.familyHistory,
        traumaCause: formData.traumaCause,
        traumaTime: formData.traumaTime,
        traumaPriorTreatment: formData.traumaPriorTreatment,
        traumaPostTreatmentCourse: formData.traumaPostTreatmentCourse,
        glaucomaSymptomDuration: formData.glaucomaSymptomDuration,
        glaucomaPriorFacility: formData.glaucomaPriorFacility,
        glaucomaPriorTreatment: formData.glaucomaPriorTreatment,
        glaucomaHistoryEye: formData.glaucomaHistoryEye,
        glaucomaSteroidUse: formData.glaucomaSteroidUse,
        glaucomaFamilyHistory: formData.glaucomaFamilyHistory,
        strabismusCongenital: formData.strabismusCongenital,
        strabismusAcquired: formData.strabismusAcquired,
        strabismusOnsetTime: formData.strabismusOnsetTime,
        strabismusMainSymptom: formData.strabismusMainSymptom,
        pediatricPregnancyHistory: formData.pediatricPregnancyHistory,
        pediatricDevelopment: formData.pediatricDevelopment,
        vitalPulse: formData.vitalPulse,
        vitalTemperature: formData.vitalTemperature,
        vitalBloodPressure: formData.vitalBloodPressure,
        vitalRespiratoryRate: formData.vitalRespiratoryRate,
        vitalWeightKg: formData.vitalWeightKg,
        rightEyeBasic: formData.rightEyeBasic,
        leftEyeBasic: formData.leftEyeBasic,
        rightEyeEyelid: formData.rightEyeEyelid,
        leftEyeEyelid: formData.leftEyeEyelid,
        rightEyeConjunctiva: formData.rightEyeConjunctiva,
        leftEyeConjunctiva: formData.leftEyeConjunctiva,
        rightEyeCornea: formData.rightEyeCornea,
        leftEyeCornea: formData.leftEyeCornea,
        rightEyeSclera: formData.rightEyeSclera,
        leftEyeSclera: formData.leftEyeSclera,
        rightEyeAnteriorChamber: formData.rightEyeAnteriorChamber,
        leftEyeAnteriorChamber: formData.leftEyeAnteriorChamber,
        rightEyeIrisPupil: formData.rightEyeIrisPupil,
        leftEyeIrisPupil: formData.leftEyeIrisPupil,
        rightEyeLens: formData.rightEyeLens,
        leftEyeLens: formData.leftEyeLens,
        rightEyeVitreous: formData.rightEyeVitreous,
        leftEyeVitreous: formData.leftEyeVitreous,
        rightEyeFundusDiscMacula: formData.rightEyeFundusDiscMacula,
        leftEyeFundusDiscMacula: formData.leftEyeFundusDiscMacula,
        rightEyeFundusRetinaVessel: formData.rightEyeFundusRetinaVessel,
        leftEyeFundusRetinaVessel: formData.leftEyeFundusRetinaVessel,
        rightEyeOrbit: formData.rightEyeOrbit,
        leftEyeOrbit: formData.leftEyeOrbit,
        systemicExam: formData.systemicExam,
        traumaRecord: formData.traumaRecord,
        traumaSurgeries: formData.traumaSurgeries,
        lacrimalRecord: formData.lacrimalRecord,
        glaucomaRecord: formData.glaucomaRecord,
        glaucomaHistories: formData.glaucomaHistories,
        strabismusPtosisRecord: formData.strabismusPtosisRecord,
        pediatricRecord: formData.pediatricRecord,
        diagnoses: formData.diagnoses,
        clinicalSummary: formData.clinicalSummary,
        prescriptions: formData.prescriptions,
        surgeryPlans: formData.surgeryPlans,
        followUpDate: formData.followUpDate,
        followUpDays: formData.followUpDays,
        followUpNote: formData.followUpNote,
      })

      if (response.codeMessage === "APP_MESSAGE_2005") {
        const redirectUrl = patientProfileId
          ? `/doctor/patient-demographics/${patientProfileId}?appointmentId=${appointmentId}`
          : `/doctor/appointments`
        router.push(redirectUrl)
      } else {
        setError(response.codeMessage || "Có lỗi xảy ra khi tạo bệnh án")
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.codeMessage ||
          err?.message ||
          "Có lỗi xảy ra khi tạo bệnh án"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRecordType !== null
      case 2:
        return formData.chiefComplaint && formData.chiefComplaint.trim() !== ""
      default:
        return true
    }
  }

  const recordTypeColor = useMemo(() => {
    if (!selectedRecordType) return "blue"
    const colors: Record<string, string> = {
      MS21_TRAUMA: "red",
      MS22_ANTERIOR: "blue",
      MS23_FUNDUS: "purple",
      MS24_GLAUCOMA: "amber",
      MS25_STRABISMUS_PTOSIS: "teal",
      MS26_PEDIATRIC: "pink",
    }
    return colors[selectedRecordType] || "blue"
  }, [selectedRecordType])

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tạo bệnh án mới
              </h1>
              <p className="text-sm text-gray-500">
                {selectedRecordType
                  ? RECORD_TYPE_LABELS[selectedRecordType]
                  : "Chọn loại bệnh án"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium hidden md:block whitespace-nowrap ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Record Type Selection */}
        {currentStep === 1 && (
          <RecordTypeStep
            selectedRecordType={selectedRecordType}
            onSelect={handleSelectRecordType}
          />
        )}

        {/* Step 2: Chief Complaint & History */}
        {currentStep === 2 && (
          <HistoryStep
            formData={formData}
            updateFormData={updateFormData}
            recordType={selectedRecordType!}
          />
        )}

        {/* Step 3: Eye Exam */}
        {currentStep === 3 && (
          <EyeExamStep
            formData={formData}
            updateFormData={updateFormData}
            recordType={selectedRecordType!}
          />
        )}

        {/* Step 4: Subspecialty */}
        {currentStep === 4 && (
          <SubspecialtyStep
            formData={formData}
            updateFormData={updateFormData}
            recordType={selectedRecordType!}
          />
        )}

        {/* Step 5: Diagnosis */}
        {currentStep === 5 && (
          <DiagnosisStep formData={formData} updateFormData={updateFormData} />
        )}

        {/* Step 6: Prescription */}
        {currentStep === 6 && (
          <PrescriptionStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              currentStep === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                canProceed()
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isSubmitting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Lưu bệnh án
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
