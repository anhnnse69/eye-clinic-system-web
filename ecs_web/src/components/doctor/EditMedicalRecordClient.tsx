"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
import {
  RecordType,
  RECORD_TYPE_LABELS,
  type UpdateMedicalRecordRequest,
  type GetMedicalRecordDetailResponse,
  type UpdateSystemicExamData,
} from "@/types"
import { medicalRecordsService } from "@/services"
import HistoryStep from "./medical-record-form/steps/HistoryStep"
import EyeExamStep from "./medical-record-form/steps/EyeExamStep"
import SubspecialtyStep from "./medical-record-form/steps/SubspecialtyStep"
import DiagnosisStep from "./medical-record-form/steps/DiagnosisStep"
import PrescriptionStep from "./medical-record-form/steps/PrescriptionStep"
import { getMessage } from "@/constants/messages"

interface EditMedicalRecordClientProps {
  recordId: string
  appointmentId?: string
}

const STEPS = [
  { id: 1, title: "Loại bệnh án", icon: FileText },
  { id: 2, title: "Lý do & Tiền sử", icon: Stethoscope },
  { id: 3, title: "Khám mắt", icon: Eye },
  { id: 4, title: "Chuyên khoa", icon: Activity },
  { id: 5, title: "Chẩn đoán", icon: ClipboardList },
  { id: 6, title: "Kê đơn", icon: Pill },
]

// ─── Map GetMedicalRecordDetailResponse → UpdateMedicalRecordRequest ───
function mapDetailToUpdate(record: GetMedicalRecordDetailResponse): UpdateMedicalRecordRequest {
  const formData: UpdateMedicalRecordRequest = {
    recordType: record.recordType,
    chiefComplaint: record.chiefComplaint ?? undefined,
    illnessDayNumber: record.illnessDayNumber ?? undefined,
    medicalHistory: record.medicalHistory ?? undefined,
    personalHistoryEye: record.personalHistoryEye ?? undefined,
    personalHistorySystemic: record.personalHistorySystemic ?? undefined,
    familyHistory: record.familyHistory ?? undefined,
    vitalPulse: record.vitalPulse ?? undefined,
    vitalTemperature: record.vitalTemperature ?? undefined,
    vitalBloodPressure: record.vitalBloodPressure ?? undefined,
    vitalRespiratoryRate: record.vitalRespiratoryRate ?? undefined,
    vitalWeightKg: record.vitalWeightKg ?? undefined,
    diagnosisMain: record.diagnosisMain ?? undefined,
    diagnosisComorbid: record.diagnosisComorbid ?? undefined,
    diagnosisDifferential: record.diagnosisDifferential ?? undefined,
    prognosis: record.prognosis ?? undefined,
    treatmentPlan: record.treatmentPlan ?? undefined,
    notes: record.notes ?? undefined,
    systemicExam: record.systemicExam
      ? ((): UpdateSystemicExamData | undefined => {
          try {
            const parsed = JSON.parse(record.systemicExam!)
            return {
              bloodPressure: parsed.bloodPressure ?? undefined,
              temperature: parsed.temperature ?? undefined,
              pulse: parsed.pulse ?? undefined,
              respiratoryRate: parsed.respiratoryRate ?? undefined,
              endocrineStatus: parsed.endocrineStatus ?? undefined,
              endocrineFindings: parsed.endocrineFindings ?? undefined,
              neuroStatus: parsed.neuroStatus ?? undefined,
              neuroFindings: parsed.neuroFindings ?? undefined,
              cardiovascularStatus: parsed.cardiovascularStatus ?? undefined,
              cardiovascularFindings: parsed.cardiovascularFindings ?? undefined,
              respiratoryStatus: parsed.respiratoryStatus ?? undefined,
              respiratoryFindings: parsed.respiratoryFindings ?? undefined,
              digestiveStatus: parsed.digestiveStatus ?? undefined,
              digestiveFindings: parsed.digestiveFindings ?? undefined,
              musculoskeletalStatus: parsed.musculoskeletalStatus ?? undefined,
              musculoskeletalFindings: parsed.musculoskeletalFindings ?? undefined,
              urogenitalStatus: parsed.urogenitalStatus ?? undefined,
              urogenitalFindings: parsed.urogenitalFindings ?? undefined,
              otherFindings: parsed.otherFindings ?? undefined,
            }
          } catch {
            return { otherFindings: record.systemicExam ?? undefined }
          }
        })()
      : undefined,

    // Basic Eye Exam
    rightEyeBasic: mapBasicExam(record.rightEyeExamBasic),
    leftEyeBasic: mapBasicExam(record.leftEyeExamBasic),

    // Eyelid & Conjunctiva
    rightEyeEyelid: mapEyelid(record.rightEyeEyelidConjunctiva),
    leftEyeEyelid: mapEyelid(record.leftEyeEyelidConjunctiva),

    // Cornea
    rightEyeCornea: mapCornea(record.rightEyeCornea),
    leftEyeCornea: mapCornea(record.leftEyeCornea),

    // AC/Iris
    rightEyeAnteriorChamber: mapAnteriorChamber(record.rightEyeAcIris),
    rightEyeIrisPupil: mapIrisPupil(record.rightEyeAcIris),
    leftEyeAnteriorChamber: mapAnteriorChamber(record.leftEyeAcIris),
    leftEyeIrisPupil: mapIrisPupil(record.leftEyeAcIris),

    // Lens/Vitreous
    rightEyeLens: mapLens(record.rightEyeLensVitreous),
    rightEyeVitreous: mapVitreous(record.rightEyeLensVitreous),
    leftEyeLens: mapLens(record.leftEyeLensVitreous),
    leftEyeVitreous: mapVitreous(record.leftEyeLensVitreous),

    // Sclera
    rightEyeSclera: mapSclera(record.rightEyeSclera),
    leftEyeSclera: mapSclera(record.leftEyeSclera),

    // Fundus Disc/Macula
    rightEyeFundusDiscMacula: mapFundusDiscMacula(record.rightEyeFundusDiscMacula),
    leftEyeFundusDiscMacula: mapFundusDiscMacula(record.leftEyeFundusDiscMacula),

    // Fundus Retina/Vessel
    rightEyeFundusRetinaVessel: mapFundusRetinaVessel(record.rightEyeFundusRetinaVessel),
    leftEyeFundusRetinaVessel: mapFundusRetinaVessel(record.leftEyeFundusRetinaVessel),

    // Trauma Record
    traumaRecord: record.traumaRecord
      ? {
          injuryCause: record.traumaRecord.injuryCause ?? undefined,
          injuryTime: record.traumaRecord.injuryTime
            ? new Date(record.traumaRecord.injuryTime).toISOString().slice(0, 16)
            : undefined,
          priorTreatment: record.traumaRecord.priorTreatment ?? undefined,
          postTreatmentCourse: record.traumaRecord.postTreatmentCourse ?? undefined,
          odInjuries: record.traumaRecord.odInjuries ?? undefined,
          osInjuries: record.traumaRecord.osInjuries ?? undefined,
          injuryDetails: record.traumaRecord.injuryDetails ?? undefined,
          traumaConclusion: record.traumaRecord.traumaConclusion ?? undefined,
        }
      : undefined,
    traumaSurgeries: record.traumaRecord?.surgeries?.map((s) => ({
      id: s.id,
      surgeryDate: s.surgeryDate
        ? new Date(s.surgeryDate).toISOString().slice(0, 16)
        : undefined,
      surgeryType: s.surgeryType ?? undefined,
      surgeryDescription: s.surgeryDescription ?? undefined,
      surgeonName: s.surgeonName ?? undefined,
      anesthesiaType: s.anesthesiaType ?? undefined,
      postSurgeryCondition: s.postSurgeryCondition ?? undefined,
      notes: s.notes ?? undefined,
    })),

    // Lacrimal
    lacrimalRecord: record.lacrimalRecords?.[0]
      ? {
          side: record.lacrimalRecords[0].side,
          irrigationFree: record.lacrimalRecords[0].irrigationFree,
          irrigationRegurgitationSame: record.lacrimalRecords[0].irrigationRegurgitationSame,
          irrigationRegurgitationOpposite: record.lacrimalRecords[0].irrigationRegurgitationOpposite,
          irrigationNote: record.lacrimalRecords[0].irrigationNote ?? undefined,
          lacrimalOther: record.lacrimalRecords[0].lacrimalOther ?? undefined,
        }
      : undefined,

    // Glaucoma Record
    glaucomaRecord: record.glaucomaRecord
      ? {
          eyePainLevel: record.glaucomaRecord.eyePainLevel ?? undefined,
          visionSymptoms: record.glaucomaRecord.visionSymptoms ?? undefined,
          visionProgression: record.glaucomaRecord.visionProgression ?? undefined,
          hasPhotophobia: record.glaucomaRecord.hasPhotophobia,
          hasTearing: record.glaucomaRecord.hasTearing,
          hasRedness: record.glaucomaRecord.hasRedness,
          systemicSymptoms: record.glaucomaRecord.systemicSymptoms ?? undefined,
          vaWithoutCorrectionOd: record.glaucomaRecord.vaWithoutCorrectionOd ?? undefined,
          vaWithoutCorrectionOs: record.glaucomaRecord.vaWithoutCorrectionOs ?? undefined,
          vaWithCorrectionOd: record.glaucomaRecord.vaWithCorrectionOd ?? undefined,
          vaWithCorrectionOs: record.glaucomaRecord.vaWithCorrectionOs ?? undefined,
          iopOd: record.glaucomaRecord.iopOd ?? undefined,
          iopOs: record.glaucomaRecord.iopOs ?? undefined,
          iopMethod: record.glaucomaRecord.iopMethod ?? undefined,
          iopTargetOd: record.glaucomaRecord.iopTargetOd ?? undefined,
          iopTargetOs: record.glaucomaRecord.iopTargetOs ?? undefined,
          historyEye: record.glaucomaRecord.historyEye ?? undefined,
          historyEyeSurgery: record.glaucomaRecord.historyEyeSurgery ?? undefined,
          priorEyeSurgeryDetails: record.glaucomaRecord.priorEyeSurgeryDetails ?? undefined,
          steroidUse: record.glaucomaRecord.steroidUse ?? undefined,
          steroidPrescribed: record.glaucomaRecord.steroidPrescribed ?? undefined,
          hasCardiovascularDisease: record.glaucomaRecord.hasCardiovascularDisease,
          hasHypertension: record.glaucomaRecord.hasHypertension,
          hasDiabetes: record.glaucomaRecord.hasDiabetes,
          hasCarotidFistula: record.glaucomaRecord.hasCarotidFistula,
          otherSystemicDisease: record.glaucomaRecord.otherSystemicDisease ?? undefined,
          familyHasGlaucoma: record.glaucomaRecord.familyHasGlaucoma,
          familyGlaucomaRelation: record.glaucomaRecord.familyGlaucomaRelation ?? undefined,
          glaucomaMedications: record.glaucomaRecord.glaucomaMedications ?? undefined,
          otherMedications: record.glaucomaRecord.otherMedications ?? undefined,
          treatmentProgress: record.glaucomaRecord.treatmentProgress ?? undefined,
          medicationChangeReason: record.glaucomaRecord.medicationChangeReason ?? undefined,
          glaucomaType: record.glaucomaRecord.glaucomaType ?? undefined,
          stageOd: record.glaucomaRecord.stageOd ?? undefined,
          stageOs: record.glaucomaRecord.stageOs ?? undefined,
          hasEyelidSwelling: record.glaucomaRecord.hasEyelidSwelling,
          hasConjunctivalInjection: record.glaucomaRecord.hasConjunctivalInjection,
          hasFilteringBleb: record.glaucomaRecord.hasFilteringBleb,
          blebLocation: record.glaucomaRecord.blebLocation ?? undefined,
          blebStatus: record.glaucomaRecord.blebStatus ?? undefined,
          conjunctivalScarLocation: record.glaucomaRecord.conjunctivalScarLocation ?? undefined,
          cornealTransparency: record.glaucomaRecord.cornealTransparency ?? undefined,
          cornealEdemaLevel: record.glaucomaRecord.cornealEdemaLevel ?? undefined,
          cornealThickness: record.glaucomaRecord.cornealThickness ?? undefined,
          hasScleralThinning: record.glaucomaRecord.hasScleralThinning,
          scleralScarLocation: record.glaucomaRecord.scleralScarLocation ?? undefined,
          acDepthSmith: record.glaucomaRecord.acDepthSmith ?? undefined,
          acDepthHerick: record.glaucomaRecord.acDepthHerick ?? undefined,
          gonioscopyOd: record.glaucomaRecord.gonioscopyOd ?? undefined,
          gonioscopyOs: record.glaucomaRecord.gonioscopyOs ?? undefined,
          angleFindings: record.glaucomaRecord.angleFindings ?? undefined,
          irisColor: record.glaucomaRecord.irisColor ?? undefined,
          irisCondition: record.glaucomaRecord.irisCondition ?? undefined,
          hasIrisNeovascularization: record.glaucomaRecord.hasIrisNeovascularization,
          pupilDiameter: record.glaucomaRecord.pupilDiameter ?? undefined,
          pupilPigmentBorder: record.glaucomaRecord.pupilPigmentBorder ?? undefined,
          pupilReflexResponse: record.glaucomaRecord.pupilReflexResponse ?? undefined,
          lensStatus: record.glaucomaRecord.lensStatus ?? undefined,
          fundusRetinaFindings: record.glaucomaRecord.fundusRetinaFindings ?? undefined,
          fundusMaculaFindings: record.glaucomaRecord.fundusMaculaFindings ?? undefined,
          hasCNV: record.glaucomaRecord.hasCNV,
          hasRetinalHemorrhage: record.glaucomaRecord.hasRetinalHemorrhage,
          opticDiscDescription: record.glaucomaRecord.opticDiscDescription ?? undefined,
          nerveRimOd: record.glaucomaRecord.nerveRimOd ?? undefined,
          nerveRimOs: record.glaucomaRecord.nerveRimOs ?? undefined,
          opticDiscCupRatio: record.glaucomaRecord.opticDiscCupRatio ?? undefined,
          opticDiscVesselChange: record.glaucomaRecord.opticDiscVesselChange ?? undefined,
          hasOpticDiscHemorrhage: record.glaucomaRecord.hasOpticDiscHemorrhage,
          hasRimAtrophy: record.glaucomaRecord.hasRimAtrophy,
          eyeAxialLength: record.glaucomaRecord.eyeAxialLength ?? undefined,
          treatmentPlanSurgery: record.glaucomaRecord.treatmentPlanSurgery ?? undefined,
          treatmentPlanLaser: record.glaucomaRecord.treatmentPlanLaser ?? undefined,
          treatmentPlanMedication: record.glaucomaRecord.treatmentPlanMedication ?? undefined,
          followUpPlan: record.glaucomaRecord.followUpPlan ?? undefined,
        }
      : undefined,
    glaucomaHistories: record.glaucomaRecord?.histories?.map((h) => ({
      id: h.id,
      historyType: h.historyType,
      eyeSide: h.eyeSide ?? undefined,
      attemptNumber: h.attemptNumber ?? undefined,
      procedureType: h.procedureType ?? undefined,
      procedureDate: h.procedureDate
        ? new Date(h.procedureDate).toISOString().slice(0, 16)
        : undefined,
      facilityLevel: h.facilityLevel ?? undefined,
      drugName: h.drugName ?? undefined,
      dosage: h.dosage ?? undefined,
      duration: h.duration ?? undefined,
      route: h.route ?? undefined,
      changeReason: h.changeReason ?? undefined,
    })),

    // Strabismus/Ptosis Record
    strabismusPtosisRecord: record.strabismusPtosisRecord
      ? {
          chiefStrabismus: record.strabismusPtosisRecord.chiefStrabismus,
          chiefPtosis: record.strabismusPtosisRecord.chiefPtosis,
          congenital: record.strabismusPtosisRecord.congenital,
          acquired: record.strabismusPtosisRecord.acquired,
          acquiredOnset: record.strabismusPtosisRecord.acquiredOnset ?? undefined,
          strabismusType: record.strabismusPtosisRecord.strabismusType ?? undefined,
          nystagmus: record.strabismusPtosisRecord.nystagmus,
          nystagmusType: record.strabismusPtosisRecord.nystagmusType ?? undefined,
          priorAmblyopiaTreatment: record.strabismusPtosisRecord.priorAmblyopiaTreatment ?? undefined,
          priorAmblyopiaResult: record.strabismusPtosisRecord.priorAmblyopiaResult ?? undefined,
          priorSurgery: record.strabismusPtosisRecord.priorSurgery ?? undefined,
          priorSurgeryResult: record.strabismusPtosisRecord.priorSurgeryResult ?? undefined,
          vaBeforeAtropineOd: record.strabismusPtosisRecord.vaBeforeAtropineOd ?? undefined,
          vaBeforeAtropineOs: record.strabismusPtosisRecord.vaBeforeAtropineOs ?? undefined,
          vaAfterAtropineOd: record.strabismusPtosisRecord.vaAfterAtropineOd ?? undefined,
          vaAfterAtropineOs: record.strabismusPtosisRecord.vaAfterAtropineOs ?? undefined,
          refractionPreAtropine: record.strabismusPtosisRecord.refractionPreAtropine ?? undefined,
          refractionPostAtropine: record.strabismusPtosisRecord.refractionPostAtropine ?? undefined,
          pupilShadowTestOd: record.strabismusPtosisRecord.pupilShadowTestOd ?? undefined,
          pupilShadowTestOs: record.strabismusPtosisRecord.pupilShadowTestOs ?? undefined,
          eomGazeTest: record.strabismusPtosisRecord.eomGazeTest ?? undefined,
          eomGazeIncreaseOd: record.strabismusPtosisRecord.eomGazeIncreaseOd ?? undefined,
          eomGazeIncreaseOs: record.strabismusPtosisRecord.eomGazeIncreaseOs ?? undefined,
          eomGazeLimitOd: record.strabismusPtosisRecord.eomGazeLimitOd ?? undefined,
          eomGazeLimitOs: record.strabismusPtosisRecord.eomGazeLimitOs ?? undefined,
          eomInternalOd: record.strabismusPtosisRecord.eomInternalOd ?? undefined,
          eomInternalOs: record.strabismusPtosisRecord.eomInternalOs ?? undefined,
          convergencePoint: record.strabismusPtosisRecord.convergencePoint ?? undefined,
          coverTestResult: record.strabismusPtosisRecord.coverTestResult ?? undefined,
          hirschbergBeforeAtropine: record.strabismusPtosisRecord.hirschbergBeforeAtropine ?? undefined,
          hirschbergAfterAtropine: record.strabismusPtosisRecord.hirschbergAfterAtropine ?? undefined,
          prismNear: record.strabismusPtosisRecord.prismNear ?? undefined,
          prismDistance: record.strabismusPtosisRecord.prismDistance ?? undefined,
          prismUp: record.strabismusPtosisRecord.prismUp ?? undefined,
          prismDown: record.strabismusPtosisRecord.prismDown ?? undefined,
          strabismusSyndrome: record.strabismusPtosisRecord.strabismusSyndrome ?? undefined,
          synoptophoreObjective: record.strabismusPtosisRecord.synoptophoreObjective ?? undefined,
          synoptophoreSubjective: record.strabismusPtosisRecord.synoptophoreSubjective ?? undefined,
          binocularStatus: record.strabismusPtosisRecord.binocularStatus ?? undefined,
          fusionAmplitude: record.strabismusPtosisRecord.fusionAmplitude ?? undefined,
          retinalCorrespondence: record.strabismusPtosisRecord.retinalCorrespondence ?? undefined,
          diplopia: record.strabismusPtosisRecord.diplopia ?? undefined,
          compensatoryHeadPosture: record.strabismusPtosisRecord.compensatoryHeadPosture ?? undefined,
          ptosisDegreeOd: record.strabismusPtosisRecord.ptosisDegreeOd ?? undefined,
          ptosisDegreeOs: record.strabismusPtosisRecord.ptosisDegreeOs ?? undefined,
          levatorFunctionOd: record.strabismusPtosisRecord.levatorFunctionOd ?? undefined,
          levatorFunctionOs: record.strabismusPtosisRecord.levatorFunctionOs ?? undefined,
          marcusGunn: record.strabismusPtosisRecord.marcusGunn ?? undefined,
          bellPhenomenon: record.strabismusPtosisRecord.bellPhenomenon ?? undefined,
          fixationOd: record.strabismusPtosisRecord.fixationOd ?? undefined,
          fixationOs: record.strabismusPtosisRecord.fixationOs ?? undefined,
          palpebralReflexOd: record.strabismusPtosisRecord.palpebralReflexOd ?? undefined,
          palpebralReflexOs: record.strabismusPtosisRecord.palpebralReflexOs ?? undefined,
        }
      : undefined,

    // Pediatric Record
    pediatricRecord: record.pediatricRecord
      ? {
          congenital: record.pediatricRecord.congenital,
          acquired: record.pediatricRecord.acquired,
          acquiredOnset: record.pediatricRecord.acquiredOnset ?? undefined,
          priorTreatment: record.pediatricRecord.priorTreatment ?? undefined,
          pregnancyIllness: record.pediatricRecord.pregnancyIllness,
          pregnancyIllnessDetail: record.pediatricRecord.pregnancyIllnessDetail ?? undefined,
          intellectualDevelopmentNormal: record.pediatricRecord.intellectualDevelopmentNormal,
          chiefSymptoms: record.pediatricRecord.chiefSymptoms ?? undefined,
          entropionOd: record.pediatricRecord.entropionOd,
          epicanthusOd: record.pediatricRecord.epicanthusOd,
          ptosisOd: record.pediatricRecord.ptosisOd,
          eyelidTumor: record.pediatricRecord.eyelidTumor ?? undefined,
          eyelidTumorLocation: record.pediatricRecord.eyelidTumorLocation ?? undefined,
          eyelidTumorSize: record.pediatricRecord.eyelidTumorSize ?? undefined,
          eyeballOdStatus: record.pediatricRecord.eyeballOdStatus ?? undefined,
          eyeballOsStatus: record.pediatricRecord.eyeballOsStatus ?? undefined,
          eyeballTexture: record.pediatricRecord.eyeballTexture ?? undefined,
          amblyopiaStatus: record.pediatricRecord.amblyopiaStatus ?? undefined,
          fixationPreferenceOd: record.pediatricRecord.fixationPreferenceOd ?? undefined,
          fixationPreferenceOs: record.pediatricRecord.fixationPreferenceOs ?? undefined,
          fundusSummaryOd: record.pediatricRecord.fundusSummaryOd ?? undefined,
          fundusSummaryOs: record.pediatricRecord.fundusSummaryOs ?? undefined,
          intellectualDevelopmentStatus: record.pediatricRecord.intellectualDevelopmentStatus ?? undefined,
          generalHealthStatus: record.pediatricRecord.generalHealthStatus ?? undefined,
        }
      : undefined,

    // Prescriptions
    prescriptionItems: record.prescriptions?.[0]?.items?.map((item) => ({
      id: item.id,
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency ?? undefined,
      durationDays: item.durationDays ?? undefined,
      quantity: item.quantity,
      instruction: item.instruction ?? undefined,
    })),
    prescription: record.prescriptions?.[0]?.notes
      ? { notes: record.prescriptions[0].notes }
      : undefined,

    // Glasses Prescription
    glassesPrescription: record.glassesPrescriptions?.[0]
      ? {
          sphOd: record.glassesPrescriptions[0].sphOd ?? undefined,
          cylOd: record.glassesPrescriptions[0].cylOd ?? undefined,
          axisOd: record.glassesPrescriptions[0].axisOd ?? undefined,
          addOd: record.glassesPrescriptions[0].addOd ?? undefined,
          sphOs: record.glassesPrescriptions[0].sphOs ?? undefined,
          cylOs: record.glassesPrescriptions[0].cylOs ?? undefined,
          axisOs: record.glassesPrescriptions[0].axisOs ?? undefined,
          addOs: record.glassesPrescriptions[0].addOs ?? undefined,
          pd: record.glassesPrescriptions[0].pd ?? undefined,
          lensType: record.glassesPrescriptions[0].lensType ?? undefined,
          notes: record.glassesPrescriptions[0].notes ?? undefined,
        }
      : undefined,
  }

  return formData
}

// ─── Eye Exam Detail → Update Eye Exam Data mappers ───

function mapBasicExam(
  src?: { vaUncorrected?: string | null; vaCorrected?: string | null; vaNear?: string | null; vaPinhole?: string | null; iopMmhg?: string | null; iopMethod?: string | null; autoRefraction?: string | null; retinoscopy?: string | null; subjectiveRefraction?: string | null; eomStatus?: string | null; eomNote?: string | null; nystagmus?: string | null; nystagmusType?: string | null; visualField?: string | null } | null
) {
  if (!src) return undefined
  return {
    vaUncorrected: src.vaUncorrected ?? undefined,
    vaCorrected: src.vaCorrected ?? undefined,
    vaNear: src.vaNear ?? undefined,
    vaPinhole: src.vaPinhole ?? undefined,
    iopMmhg: src.iopMmhg ?? undefined,
    iopMethod: src.iopMethod ?? undefined,
    autoRefraction: src.autoRefraction ?? undefined,
    retinoscopy: src.retinoscopy ?? undefined,
    subjectiveRefraction: src.subjectiveRefraction ?? undefined,
    eomStatus: src.eomStatus ?? undefined,
    eomNote: src.eomNote ?? undefined,
    nystagmus: src.nystagmus ?? undefined,
    nystagmusType: src.nystagmusType ?? undefined,
    visualField: src.visualField ?? undefined,
  }
}

function mapEyelid(
  src?: { status?: string | null; ptosis: boolean; ptosisDegree?: string | null; laceration: boolean; lacerationExtent?: string | null; lacerationLocation?: string | null; lacerationSutured: boolean; lacerationUnsutured: boolean; scar: boolean; otherFindings?: string | null; entropion: boolean; epicanthus: boolean; hasTumor: boolean; tumorNature?: string | null; tumorLocation?: string | null; tumorSize?: string | null; lagophthalmos: boolean } | null
) {
  if (!src) return undefined
  return {
    status: src.status ?? undefined,
    ptosis: src.ptosis,
    ptosisDegree: src.ptosisDegree ?? undefined,
    laceration: src.laceration,
    lacerationExtent: src.lacerationExtent ?? undefined,
    lacerationLocation: src.lacerationLocation ?? undefined,
    lacerationSutured: src.lacerationSutured,
    lacerationUnsutured: src.lacerationUnsutured,
    scar: src.scar,
    otherFindings: src.otherFindings ?? undefined,
    entropion: src.entropion,
    epicanthus: src.epicanthus,
    hasTumor: src.hasTumor,
    tumorNature: src.tumorNature ?? undefined,
    tumorLocation: src.tumorLocation ?? undefined,
    tumorSize: src.tumorSize ?? undefined,
    lagophthalmos: src.lagophthalmos,
  }
}

function mapCornea(
  src?: { clarity?: string | null; size?: string | null; shape?: string | null; diameterMm?: number | null; sensation?: string | null; epitheliumPunctate: boolean; epitheliumEdemaLevel?: string | null; epitheliumLoss?: string | null; stromaEdemaLevel?: string | null; stromaInfiltrate?: string | null; stromaThinning?: string | null; ulcer: boolean; ulcerLocation?: string | null; ulcerSize?: string | null; ulcerDescription?: string | null; abscess: boolean; descemetocele: boolean; bloodStaining: boolean; laceration: boolean; lacerationSize?: string | null; lacerationLocation?: string | null; lacerationType?: string | null; lacerationSutured?: boolean | null; perforation: boolean; perforationDiameterMm?: number | null; perforationLocation?: string | null; seidelTest?: string | null; neovascularization: boolean; neovascularizationDepth?: string | null; neovascularizationExtent?: string | null; limbalStatus?: string | null; cornealThickness?: number | null; otherFindings?: string | null; foreignBody: boolean } | null
) {
  if (!src) return undefined
  return {
    clarity: src.clarity ?? undefined,
    size: src.size ?? undefined,
    shape: src.shape ?? undefined,
    diameterMm: src.diameterMm ?? undefined,
    sensation: src.sensation ?? undefined,
    epitheliumPunctate: src.epitheliumPunctate,
    epitheliumEdemaLevel: src.epitheliumEdemaLevel ?? undefined,
    epitheliumLoss: src.epitheliumLoss ?? undefined,
    stromaEdemaLevel: src.stromaEdemaLevel ?? undefined,
    stromaInfiltrate: src.stromaInfiltrate ?? undefined,
    stromaThinning: src.stromaThinning ?? undefined,
    ulcer: src.ulcer,
    ulcerLocation: src.ulcerLocation ?? undefined,
    ulcerSize: src.ulcerSize ?? undefined,
    ulcerDescription: src.ulcerDescription ?? undefined,
    abscess: src.abscess,
    descemetocele: src.descemetocele,
    bloodStaining: src.bloodStaining,
    laceration: src.laceration,
    lacerationSize: src.lacerationSize ?? undefined,
    lacerationLocation: src.lacerationLocation ?? undefined,
    lacerationType: src.lacerationType ?? undefined,
    lacerationSutured: src.lacerationSutured ?? undefined,
    perforation: src.perforation,
    perforationDiameterMm: src.perforationDiameterMm ?? undefined,
    perforationLocation: src.perforationLocation ?? undefined,
    seidelTest: src.seidelTest ?? undefined,
    neovascularization: src.neovascularization,
    neovascularizationDepth: src.neovascularizationDepth ?? undefined,
    neovascularizationExtent: src.neovascularizationExtent ?? undefined,
    limbalStatus: src.limbalStatus ?? undefined,
    foreignBody: src.foreignBody,
    otherFindings: src.otherFindings ?? undefined,
  }
}

function mapAnteriorChamber(
  src?: { depth?: string | null; depthMm?: number | null; herickClassification?: string | null; vitreousInAC: boolean; pus: boolean; pusMm?: number | null; tyndall?: string | null; exudate: boolean; exudateDescription?: string | null; hemorrhage: boolean; hemorrhageLevel?: string | null; foreignBody: boolean; otherFindings?: string | null } | null
) {
  if (!src) return undefined
  return {
    depth: src.depth ?? undefined,
    depthMm: src.depthMm ?? undefined,
    herickClassification: src.herickClassification ?? undefined,
    vitreousInAC: src.vitreousInAC,
    pus: src.pus,
    pusMm: src.pusMm ?? undefined,
    tyndall: src.tyndall ?? undefined,
    exudate: src.exudate,
    exudateDescription: src.exudateDescription ?? undefined,
    hemorrhage: src.hemorrhage,
    hemorrhageLevel: src.hemorrhageLevel ?? undefined,
    foreignBody: src.foreignBody,
    otherFindings: src.otherFindings ?? undefined,
  }
}

function mapIrisPupil(
  src?: { irisColor?: string | null; irisCondition?: string | null; irisDegeneration: boolean; irisNeovascularization: boolean; irisCiliaryProcesses: boolean; koeppeNodules: boolean; busaccaNodules: boolean; irisRootTear: boolean; irisRootTearDegree?: string | null; irisLoss: boolean; irisPerforation: boolean; pupilShape?: string | null; pupilPosition?: string | null; pupilReflex?: string | null; pupilDilated: boolean; ptdtTest: boolean; fundusReflex?: string | null; angleFindings?: string | null; angleSynechiae: boolean; anglePigment: boolean; angleNeovascularization: boolean } | null
) {
  if (!src) return undefined
  return {
    irisColor: src.irisColor ?? undefined,
    irisCondition: src.irisCondition ?? undefined,
    irisDegeneration: src.irisDegeneration,
    irisNeovascularization: src.irisNeovascularization,
    irisCiliaryProcesses: src.irisCiliaryProcesses,
    koeppeNodules: src.koeppeNodules,
    busaccaNodules: src.busaccaNodules,
    irisRootTear: src.irisRootTear,
    irisRootTearDegree: src.irisRootTearDegree ?? undefined,
    irisLoss: src.irisLoss,
    irisPerforation: src.irisPerforation,
    pupilShape: src.pupilShape ?? undefined,
    pupilPosition: src.pupilPosition ?? undefined,
    pupilReflex: src.pupilReflex ?? undefined,
    pupilDilated: src.pupilDilated,
    ptdtTest: src.ptdtTest,
    fundusReflex: src.fundusReflex ?? undefined,
  }
}

function mapLens(
  src?: { lensStatus?: string | null; opacityType?: string | null; opacityLocation?: string | null; subluxation: boolean; lensInAnterior: boolean; lensInVitreous: boolean; purulent: boolean; anteriorPigmentation: boolean; iolPresent: boolean; iolStatus?: string | null; iolPosition?: string | null } | null
) {
  if (!src) return undefined
  return {
    status: src.lensStatus ?? undefined,
    opacityType: src.opacityType ?? undefined,
    opacityLocation: src.opacityLocation ?? undefined,
    subluxation: src.subluxation,
    lensInAnterior: src.lensInAnterior,
    lensInVitreous: src.lensInVitreous,
    purulent: src.purulent,
    anteriorPigmentation: src.anteriorPigmentation,
    iolPresent: src.iolPresent,
    iolStatus: src.iolStatus ?? undefined,
    iolPosition: src.iolPosition ?? undefined,
  }
}

function mapVitreous(
  src?: { status?: string | null; opacityLevel?: string | null; tyndall?: string | null; hemorrhage: boolean; organized: boolean; pvd: boolean; vitreousPurulent: boolean; foreignBody: boolean; otherFindings?: string | null } | null
) {
  if (!src) return undefined
  return {
    status: src.status ?? undefined,
    opacityLevel: src.opacityLevel ?? undefined,
    tyndall: src.tyndall ?? undefined,
    hemorrhage: src.hemorrhage,
    organized: src.organized,
    pvd: src.pvd,
    purulent: src.vitreousPurulent,
    foreignBody: src.foreignBody,
    otherFindings: src.otherFindings ?? undefined,
  }
}

function mapSclera(
  src?: { status?: string | null; laceration: boolean; lacerationSize?: string | null; lacerationLocation?: string | null; lacerationSutured?: boolean | null; lacerationUnsutured: boolean; tissueEntrapped: boolean; otherFindings?: string | null } | null
) {
  if (!src) return undefined
  return {
    status: src.status ?? undefined,
    laceration: src.laceration,
    lacerationSize: src.lacerationSize ?? undefined,
    lacerationLocation: src.lacerationLocation ?? undefined,
    lacerationSutured: src.lacerationSutured ?? undefined,
    lacerationUnsutured: src.lacerationUnsutured,
    tissueEntrapped: src.tissueEntrapped,
    otherFindings: src.otherFindings ?? undefined,
  }
}

function mapFundusDiscMacula(
  src?: { discStatus?: string | null; discColor?: string | null; cdRatio?: string | null; rimStatus?: string | null; rimLocation?: string | null; vesselChange?: string | null; discHemorrhage: boolean; neovascularization: boolean; discNotVisible: boolean; maculaStatus?: string | null; maculaReflexAbsent: boolean; maculaEdemaType?: string | null; maculaHoleDegree?: string | null; maculaScar: boolean; serousDetachment: boolean; maculaHemorrhage: boolean; choroidStatus?: string | null; choroidalFindings?: string | null; cnv: boolean; chorioretinitisActive: boolean; chorioretinitisScar: boolean; chorioretinitisCount?: number | null; chorioretinitisLocation?: string | null } | null
) {
  if (!src) return undefined
  return {
    discStatus: src.discStatus ?? undefined,
    discColor: src.discColor ?? undefined,
    cdRatio: src.cdRatio ?? undefined,
    rimStatus: src.rimStatus ?? undefined,
    rimLocation: src.rimLocation ?? undefined,
    vesselChange: src.vesselChange ?? undefined,
    discHemorrhage: src.discHemorrhage,
    neovascularization: src.neovascularization,
    discNotVisible: src.discNotVisible,
    maculaStatus: src.maculaStatus ?? undefined,
    maculaReflexAbsent: src.maculaReflexAbsent,
    maculaEdemaType: src.maculaEdemaType ?? undefined,
    maculaHoleDegree: src.maculaHoleDegree ?? undefined,
    maculaScar: src.maculaScar,
    serousDetachment: src.serousDetachment,
    maculaHemorrhage: src.maculaHemorrhage,
    choroidStatus: src.choroidStatus ?? undefined,
    choroidFindings: src.choroidalFindings ?? undefined,
    cnv: src.cnv,
    chorioretinitisActive: src.chorioretinitisActive,
    chorioretinitisScar: src.chorioretinitisScar,
    chorioretinitisCount: src.chorioretinitisCount ?? undefined,
    chorioretinitisLocation: src.chorioretinitisLocation ?? undefined,
  }
}

function mapFundusRetinaVessel(
  src?: { vesselStatus?: string | null; arteryOcclusion?: string | null; veinOcclusion?: string | null; occlusionType?: string | null; occlusionEdema: boolean; occlusionIschemia: boolean; vasculitis: boolean; retinalNeovascularization: boolean; retinaStatus?: string | null; retinalCondition?: string | null; retinalEdema: boolean; edemaType?: string | null; hemorrhage: boolean; hemorrhageType?: string | null; degeneration: boolean; degenerationType?: string | null; degenerationDescription?: string | null; detachment: boolean; detachmentLevel?: string | null; retinalTear: boolean; tearCount?: number | null; tearLocation?: string | null; tearMorphology?: string | null; bmscDetachment: boolean; iofb: boolean; iofbLocation?: string | null; iofbSize?: string | null; combinedFindings?: string | null; otherFindings?: string | null } | null
) {
  if (!src) return undefined
  return {
    vesselStatus: src.vesselStatus ?? undefined,
    arteryOcclusion: src.arteryOcclusion ?? undefined,
    veinOcclusion: src.veinOcclusion ?? undefined,
    occlusionType: src.occlusionType ?? undefined,
    vasculitis: src.vasculitis,
    retinalNeovascularization: src.retinalNeovascularization,
    retinaStatus: src.retinaStatus ?? undefined,
    retinalCondition: src.retinalCondition ?? undefined,
    retinalEdema: src.retinalEdema,
    edemaType: src.edemaType ?? undefined,
    hemorrhage: src.hemorrhage,
    hemorrhageType: src.hemorrhageType ?? undefined,
    degeneration: src.degeneration,
    degenerationType: src.degenerationType ?? undefined,
    degenerationDescription: src.degenerationDescription ?? undefined,
    detachment: src.detachment,
    detachmentLevel: src.detachmentLevel ?? undefined,
    retinalTear: src.retinalTear,
    tearCount: src.tearCount ?? undefined,
    tearLocation: src.tearLocation ?? undefined,
    tearMorphology: src.tearMorphology ?? undefined,
    bmscDetachment: src.bmscDetachment,
    iofb: src.iofb,
    iofbLocation: src.iofbLocation ?? undefined,
    iofbSize: src.iofbSize ?? undefined,
    combinedFindings: src.combinedFindings ?? undefined,
    otherFindings: src.otherFindings ?? undefined,
  }
}

// ─── Main Component ───
export default function EditMedicalRecordClient({
  recordId,
  appointmentId,
}: EditMedicalRecordClientProps) {
  const router = useRouter()

  const [loadingRecord, setLoadingRecord] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [recordType, setRecordType] = useState<RecordType | null>(null)
  const [formData, setFormData] = useState<Partial<UpdateMedicalRecordRequest>>({})

  // Fetch existing record on mount
  useEffect(() => {
    const fetchRecord = async () => {
      setLoadingRecord(true)
      setLoadError(null)
      try {
        const response = await medicalRecordsService.getMedicalRecordById(recordId)
        if (!response.data) {
          setLoadError("Không tìm thấy hồ sơ bệnh án")
          return
        }
        const mapped = mapDetailToUpdate(response.data)
        setFormData(mapped)
        setRecordType(response.data.recordType as RecordType)
      } catch (err: unknown) {
        console.error("Error fetching record:", err)
        setLoadError("Không thể tải hồ sơ bệnh án để chỉnh sửa")
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [recordId])

  const updateFormData = useCallback(
    (updates: Partial<UpdateMedicalRecordRequest>) => {
      setFormData((prev) => ({ ...prev, ...updates }))
    },
    []
  )

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
    setSubmitError(null)
    try {
      const response = await medicalRecordsService.updateMedicalRecord(
        recordId,
        formData as UpdateMedicalRecordRequest
      )
      if (response.data?.isSuccess) {
        router.push(`/doctor/records/${recordId}${appointmentId ? `?appointmentId=${appointmentId}` : ""}`)
      } else {
        setSubmitError(getMessage(response.codeMessage) || "Có lỗi xảy ra khi cập nhật bệnh án")
      }
    } catch (err: unknown) {
      const error = err as { codeMessage?: string; message?: string }
      setSubmitError(
        getMessage(error?.codeMessage) ||
          error?.message ||
          "Có lỗi xảy ra khi cập nhật bệnh án"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return recordType !== null
    if (currentStep === 2) return true // formData.chiefComplaint?.trim() !== ""
    return true
  }

  const recordTypeColor = useMemo(() => {
    if (!recordType) return "blue"
    const colors: Record<string, string> = {
      MS21_TRAUMA: "red",
      MS22_ANTERIOR: "blue",
      MS23_FUNDUS: "purple",
      MS24_GLAUCOMA: "amber",
      MS25_STRABISMUS_PTOSIS: "teal",
      MS26_PEDIATRIC: "pink",
    }
    return colors[recordType] || "blue"
  }, [recordType])

  // ─── Loading State ───
  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Đang tải dữ liệu</h3>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    )
  }

  // ─── Error State ───
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{loadError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

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
                Chỉnh sửa bệnh án
              </h1>
              <p className="text-sm text-gray-500">
                {recordType
                  ? RECORD_TYPE_LABELS[recordType]
                  : "Đang tải..."}
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
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Step 1: Record Type (read-only display) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Loại bệnh án</p>
                <p className="text-sm text-blue-700 mt-0.5">
                  {recordType ? RECORD_TYPE_LABELS[recordType] : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Chief Complaint & History */}
        {currentStep === 2 && recordType && (
          <HistoryStep
            formData={formData as Parameters<typeof HistoryStep>[0]["formData"]}
            updateFormData={updateFormData as Parameters<typeof HistoryStep>[0]["updateFormData"]}
            recordType={recordType}
          />
        )}

        {/* Step 3: Eye Exam */}
        {currentStep === 3 && recordType && (
          <EyeExamStep
            formData={formData as Parameters<typeof EyeExamStep>[0]["formData"]}
            updateFormData={updateFormData as Parameters<typeof EyeExamStep>[0]["updateFormData"]}
            recordType={recordType}
          />
        )}

        {/* Step 4: Subspecialty */}
        {currentStep === 4 && recordType && (
          <SubspecialtyStep
            formData={formData as Parameters<typeof SubspecialtyStep>[0]["formData"]}
            updateFormData={updateFormData as Parameters<typeof SubspecialtyStep>[0]["updateFormData"]}
            recordType={recordType}
          />
        )}

        {/* Step 5: Diagnosis */}
        {currentStep === 5 && (
          <DiagnosisStep
            formData={formData as Parameters<typeof DiagnosisStep>[0]["formData"]}
            updateFormData={updateFormData as Parameters<typeof DiagnosisStep>[0]["updateFormData"]}
          />
        )}

        {/* Step 6: Prescription */}
        {currentStep === 6 && (
          <PrescriptionStep
            formData={formData as Parameters<typeof PrescriptionStep>[0]["formData"]}
            updateFormData={updateFormData as Parameters<typeof PrescriptionStep>[0]["updateFormData"]}
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
                  Lưu thay đổi
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
