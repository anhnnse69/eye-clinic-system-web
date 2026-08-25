"use client"

/**
 * ExaminationClient — Main orchestration component cho examination flow v3.0
 * 
 * Flow:
 * 1. [AI TRIAGE] - Nhập triệu chứng → AI dự đoán bệnh
 * 2. [AI RESULT] - Xem kết quả: Primary + Differentials + Risk Level
 * 3. [EXAMINATION] - Form khám chi tiết (reuse CreateMedicalRecordClient)
 */
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Loader2, AlertCircle, ArrowLeft, Sparkles, Check, Stethoscope, Brain, ShieldAlert } from "lucide-react"

import { type AITriageSymptomInput, type AITriageResponse } from "@/types"
import AITriageStep from "./AITriageStep"
import CreateMedicalRecordClient from "./CreateMedicalRecordClient"
import { aiTriageService } from "@/services/ai-triage.service"
import { medicalRecordsService } from "@/services"
import {
  DISEASE_EXAMINATION_MAP,
  DISEASE_DISPLAY_NAMES,
  getDiseaseDisplayName,
} from "@/types"

type ExaminationStep = "ai-triage" | "ai-result" | "examination"

/** Map AI disease prediction → MedicalRecordType */
const DISEASE_TO_RECORD_TYPE: Record<string, string> = {
  // Corneal conditions → Anterior
  Corneal_Ulcer: "MS22_ANTERIOR",
  Keratitis: "MS22_ANTERIOR",
  Corneal_Scar: "MS22_ANTERIOR",
  
  // Conjunctival conditions → Anterior  
  Conjunctivitis: "MS22_ANTERIOR",
  Pterygium: "MS22_ANTERIOR",
  
  // Retina conditions → Fundus
  Retinal_Detachment: "MS23_FUNDUS",
  Diabetic_Retinopathy: "MS23_FUNDUS",
  Age_Macular_Degeneration: "MS23_FUNDUS",
  Macular_Edema: "MS23_FUNDUS",
  Retinal_Vein_Occlusion: "MS23_FUNDUS",
  Retinal_Artery_Occlusion: "MS23_FUNDUS",
  
  // Glaucoma conditions
  Glaucoma: "MS24_GLAUCOMA",
  Ocular_Hypertension: "MS24_GLAUCOMA",
  
  // Pediatric/Strabismus
  Strabismus: "MS25_STRABISMUS_PTOSIS",
  Ptosis: "MS25_STRABISMUS_PTOSIS",
  Amblyopia: "MS25_STRABISMUS_PTOSIS",
  Congenital_Cataract: "MS26_PEDIATRIC",
  
  // Trauma
  Corneal_Foreign_Body: "MS21_TRAUMA",
  Intraocular_Foreign_Body: "MS21_TRAUMA",
  Chemical_Injury: "MS21_TRAUMA",
  Orbital_Fracture: "MS21_TRAUMA",
  
  // Cataract
  Cataract: "MS22_ANTERIOR",
  Nuclear_Cataract: "MS22_ANTERIOR",
  Cortical_Cataract: "MS22_ANTERIOR",
  
  // Normal / General
  Normal: "MS22_ANTERIOR",
  Blepharitis: "MS22_ANTERIOR",
  Dry_Eye: "MS22_ANTERIOR",
  Diplopia: "MS22_ANTERIOR",
}

interface ExaminationClientProps {
  appointmentId: string
  patientProfileId: string
  initialRecordType?: string
  aiTaskId?: string
}

interface AITriageData {
  symptoms: AITriageSymptomInput
  result: AITriageResponse
}

export default function ExaminationClient({
  appointmentId,
  patientProfileId,
  initialRecordType,
  aiTaskId,
}: ExaminationClientProps) {
  const router = useRouter()
  const t = useTranslations("examination")
  const tAiTriage = useTranslations("aiTriage")
  
  // Step management
  const [step, setStep] = useState<ExaminationStep>("ai-triage")
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null)
  const [checkingExisting, setCheckingExisting] = useState(true)
  
  // AI Triage data
  const [aiTriageData, setAITriageData] = useState<AITriageData | null>(null)

  // Check if medical record already exists for this appointment (skips triage to continue examination steps)
  useEffect(() => {
    if (!appointmentId) {
      setCheckingExisting(false)
      return
    }
    let isMounted = true
    setCheckingExisting(true)
    medicalRecordsService
      .getMedicalRecords({ searchTerm: appointmentId, pageSize: 1 })
      .then((res: any) => {
        if (!isMounted) return
        const items = res?.data ?? []
        if (items.length > 0) {
          setExistingRecordId(items[0].id)
          setStep("examination")
        }
      })
      .catch((err: any) => {
        console.warn("Error checking existing record for appointment:", appointmentId, err)
      })
      .finally(() => {
        if (isMounted) setCheckingExisting(false)
      })

    return () => {
      isMounted = false
    }
  }, [appointmentId])

  // Derived record type from AI
  const suggestedRecordType = useMemo<string | undefined>(() => {
    if (!aiTriageData?.result.predictedDisease) return undefined
    return DISEASE_TO_RECORD_TYPE[aiTriageData.result.predictedDisease]
  }, [aiTriageData])

  // Active record type (user can override)
  const [activeRecordType, setActiveRecordType] = useState<string | undefined>(
    initialRecordType || suggestedRecordType
  )

  // Update active record type when AI suggests new one
  useEffect(() => {
    if (suggestedRecordType && !activeRecordType) {
      setActiveRecordType(suggestedRecordType)
    }
  }, [suggestedRecordType, activeRecordType])

  // Handle AI Triage completion
  const handleAITriageComplete = (data: AITriageData) => {
    setAITriageData(data)

    // Auto-suggest record type
    const suggested = DISEASE_TO_RECORD_TYPE[data.result.predictedDisease || ""]
    if (suggested) {
      setActiveRecordType(suggested)
    }

    // Move to result step
    setStep("ai-result")
  }

  // Handle confirmation to proceed to examination
  const handleProceedToExamination = () => {
    setStep("examination")
  }

  // Handle back navigation
  const handleBack = () => {
    if (step === "ai-result") {
      setStep("ai-triage")
    } else if (step === "examination") {
      setStep("ai-result")
    } else {
      router.push("/doctor/queue")
    }
  }

  // Get localized disease name
  const getLocalizedDisease = (diseaseKey: string) => {
    if (!diseaseKey) return "—"
    if (tAiTriage.has(`diseases.${diseaseKey}`)) {
      return tAiTriage(`diseases.${diseaseKey}`)
    }
    return getDiseaseDisplayName(diseaseKey)
  }

  // Render AI Triage Step
  if (step === "ai-triage") {
    return (
      <AITriageStep
        appointmentId={appointmentId}
        patientProfileId={patientProfileId}
        onComplete={handleAITriageComplete}
        onBack={() => router.push("/doctor/queue")}
      />
    )
  }

  // Render AI Result Summary + Confirmation
  if (step === "ai-result" && aiTriageData) {
    return (
      <AITriageResultView
        data={aiTriageData}
        suggestedRecordType={suggestedRecordType}
        activeRecordType={activeRecordType}
        onSelectRecordType={setActiveRecordType}
        onConfirm={handleProceedToExamination}
        onBack={handleBack}
      />
    )
  }

  // Render Examination Form
  // Render Examination Form
  if (step === "examination") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Banner with AI Summary */}
        {aiTriageData && (
          <div className="bg-primary px-4 py-3 text-on-primary shadow-xs">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-surface-container-lowest/20 backdrop-blur-xs">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-on-primary/80 uppercase tracking-wider">
                    {tAiTriage("aiPrediction")}
                  </p>
                  <p className="font-bold text-sm sm:text-base">
                    {getLocalizedDisease(aiTriageData.result.predictedDisease || "")}
                    <span className="ml-2 text-xs font-normal text-on-primary/80">
                      ({((aiTriageData.result.confidence || 0) * 100).toFixed(1)}% {tAiTriage("confidence")})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container-lowest/15 px-3.5 py-1.5 text-xs font-semibold hover:bg-surface-container-lowest/25 transition-all active:scale-95 cursor-pointer text-on-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </button>
            </div>
          </div>
        )}

        {/* Examination Form */}
        <CreateMedicalRecordClient
          appointmentId={appointmentId}
          patientProfileId={patientProfileId}
          initialRecordType={activeRecordType}
          skipPreliminary={true}
          aiTriageData={aiTriageData}
          existingRecordId={existingRecordId}
        />
      </div>
    )
  }
  
  return null
}

/** AI Result Summary Component */
interface AITriageResultViewProps {
  data: AITriageData
  suggestedRecordType?: string
  activeRecordType?: string
  onSelectRecordType: (type: string) => void
  onConfirm: () => void
  onBack: () => void
}

function AITriageResultView({
  data,
  suggestedRecordType,
  activeRecordType,
  onSelectRecordType,
  onConfirm,
  onBack,
}: AITriageResultViewProps) {
  const t = useTranslations("examination")
  const tAiTriage = useTranslations("aiTriage")
  
  const { result } = data
  const riskConfig = aiTriageService.getRiskLevelConfig(result.riskLevel)
  
  // Localized disease lookup
  const getLocalizedDisease = (diseaseKey: string) => {
    if (!diseaseKey) return "—"
    if (tAiTriage.has(`diseases.${diseaseKey}`)) {
      return tAiTriage(`diseases.${diseaseKey}`)
    }
    return getDiseaseDisplayName(diseaseKey)
  }

  // Record type options definitions
  const recordTypeOptionKeys = [
    "MS21_TRAUMA",
    "MS22_ANTERIOR",
    "MS23_FUNDUS",
    "MS24_GLAUCOMA",
    "MS25_STRABISMUS_PTOSIS",
    "MS26_PEDIATRIC",
  ]
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </button>
        
        {/* AI Result Card */}
        <div className={`rounded-2xl border-2 ${riskConfig.borderColor} ${riskConfig.bgColor} p-6 mb-6 shadow-xs`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 shrink-0">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {tAiTriage("aiPrediction")}
                </p>
                <h2 className="text-2xl font-extrabold text-on-surface mt-1">
                  {getLocalizedDisease(result.predictedDisease || "")}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-36 bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.max(5, (result.confidence || 0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-on-surface">
                    {tAiTriage("confidence")}: {((result.confidence || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Risk Badge */}
            <div className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase border ${riskConfig.badgeBg} self-start shrink-0`}>
              {tAiTriage(`riskLevels.${riskConfig.labelKey}`)}
            </div>
          </div>
          
          {/* Differentials */}
          {result.differentials.length > 0 && (
            <div className="mt-5 pt-4 border-t border-outline-variant/30">
              <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">
                {tAiTriage("differentialDiagnoses")}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.differentials.map((diff, idx) => (
                  <div key={diff.disease} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-3 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-5 h-5 rounded-full bg-surface-container-low font-bold text-on-surface-variant text-[10px] flex items-center justify-center">
                        #{idx + 2}
                      </span>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {((diff.confidence) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface line-clamp-1">
                      {getLocalizedDisease(diff.disease)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Disclaimer */}
          <div className="mt-4 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              <strong>{tAiTriage("note")}</strong>{" "}
              {result.disclaimer &&
              result.disclaimer !==
                "Preliminary AI assessment based on symptoms only. Does NOT replace professional eye care consultation."
                ? result.disclaimer
                : tAiTriage("disclaimer")}
            </p>
          </div>
        </div>
        
        {/* Record Type Selection */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 mb-6 shadow-xs">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            {t("selectRecordType")}
          </h3>
          
          {suggestedRecordType && suggestedRecordType !== activeRecordType && (
            <div className="mb-4 p-3.5 bg-[#c6e7ff]/30 border border-[#81cfff]/40 rounded-xl flex items-center justify-between">
              <p className="text-xs font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("aiSuggestion")}: <strong>{t(`recordTypes.${suggestedRecordType}`)}</strong>
              </p>
              <button
                type="button"
                onClick={() => onSelectRecordType(suggestedRecordType)}
                className="text-xs font-bold text-primary underline hover:opacity-80 cursor-pointer"
              >
                {tAiTriage("useAiSuggestion")}
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recordTypeOptionKeys.map((key) => {
              const isSelected = activeRecordType === key
              const isAiSuggested = suggestedRecordType === key
              const labelText = t.has(`recordTypes.${key}`) ? t(`recordTypes.${key}`) : key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectRecordType(key)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer
                    ${isSelected
                      ? "border-primary bg-[#c6e7ff]/30 shadow-xs ring-1 ring-primary/20"
                      : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-on-surface">{labelText}</p>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {isAiSuggested && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-primary bg-[#c6e7ff]/40 px-2 py-0.5 rounded-md border border-[#81cfff]/40">
                      <Sparkles className="w-3 h-3" /> {t("aiRecommended")}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          {suggestedRecordType && (
            <button
              type="button"
              onClick={() => onSelectRecordType(suggestedRecordType)}
              className="text-xs font-semibold text-primary hover:opacity-80 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {tAiTriage("useAiSuggestion")}
            </button>
          )}
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={!activeRecordType}
            className="ml-auto px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            {t("proceedToExam")}
          </button>
        </div>
      </div>
    </div>
  )
}
