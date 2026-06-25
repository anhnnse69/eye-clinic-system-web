"use client"

import { Eye } from "lucide-react"
import { RecordType, UpdateMedicalRecordRequest } from "@/types"
import EyeExaminationCard from "../shared/EyeExaminationCard"

interface EyeExamStepProps {
  formData: Partial<UpdateMedicalRecordRequest>
  updateFormData: (updates: Partial<UpdateMedicalRecordRequest>) => void
  recordType: RecordType
}

export default function EyeExamStep({
  formData,
  updateFormData,
  recordType,
}: EyeExamStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Khám mắt</h2>
        <p className="text-sm text-gray-500">
          Nhập kết quả khám thị lực và các chỉ số mắt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EyeExaminationCard
          title="Mắt phải (OD)"
          side="right"
          basicData={formData.rightEyeBasic}
          eyelidData={formData.rightEyeEyelid}
          conjunctivaData={formData.rightEyeConjunctiva}
          corneaData={formData.rightEyeCornea}
          scleraData={formData.rightEyeSclera}
          acData={formData.rightEyeAnteriorChamber}
          irisData={formData.rightEyeIrisPupil}
          lensData={formData.rightEyeLens}
          vitreousData={formData.rightEyeVitreous}
          fundusDiscData={formData.rightEyeFundusDiscMacula}
          fundusRetinaData={formData.rightEyeFundusRetinaVessel}
          updateBasic={(data) =>
            updateFormData({ rightEyeBasic: { ...formData.rightEyeBasic, ...data } })
          }
          updateEyelid={(data) =>
            updateFormData({ rightEyeEyelid: { ...formData.rightEyeEyelid, ...data } })
          }
          updateConjunctiva={(data) =>
            updateFormData({ rightEyeConjunctiva: { ...formData.rightEyeConjunctiva, ...data } })
          }
          updateCornea={(data) =>
            updateFormData({ rightEyeCornea: { ...formData.rightEyeCornea, ...data } })
          }
          updateSclera={(data) =>
            updateFormData({ rightEyeSclera: { ...formData.rightEyeSclera, ...data } })
          }
          updateAC={(data) =>
            updateFormData({ rightEyeAnteriorChamber: { ...formData.rightEyeAnteriorChamber, ...data } })
          }
          updateIris={(data) =>
            updateFormData({ rightEyeIrisPupil: { ...formData.rightEyeIrisPupil, ...data } })
          }
          updateLens={(data) =>
            updateFormData({ rightEyeLens: { ...formData.rightEyeLens, ...data } })
          }
          updateVitreous={(data) =>
            updateFormData({ rightEyeVitreous: { ...formData.rightEyeVitreous, ...data } })
          }
          updateFundusDisc={(data) =>
            updateFormData({ rightEyeFundusDiscMacula: { ...formData.rightEyeFundusDiscMacula, ...data } })
          }
          updateFundusRetina={(data) =>
            updateFormData({ rightEyeFundusRetinaVessel: { ...formData.rightEyeFundusRetinaVessel, ...data } })
          }
          recordType={recordType}
        />

        <EyeExaminationCard
          title="Mắt trái (OS)"
          side="left"
          basicData={formData.leftEyeBasic}
          eyelidData={formData.leftEyeEyelid}
          conjunctivaData={formData.leftEyeConjunctiva}
          corneaData={formData.leftEyeCornea}
          scleraData={formData.leftEyeSclera}
          acData={formData.leftEyeAnteriorChamber}
          irisData={formData.leftEyeIrisPupil}
          lensData={formData.leftEyeLens}
          vitreousData={formData.leftEyeVitreous}
          fundusDiscData={formData.leftEyeFundusDiscMacula}
          fundusRetinaData={formData.leftEyeFundusRetinaVessel}
          updateBasic={(data) =>
            updateFormData({ leftEyeBasic: { ...formData.leftEyeBasic, ...data } })
          }
          updateEyelid={(data) =>
            updateFormData({ leftEyeEyelid: { ...formData.leftEyeEyelid, ...data } })
          }
          updateConjunctiva={(data) =>
            updateFormData({ leftEyeConjunctiva: { ...formData.leftEyeConjunctiva, ...data } })
          }
          updateCornea={(data) =>
            updateFormData({ leftEyeCornea: { ...formData.leftEyeCornea, ...data } })
          }
          updateSclera={(data) =>
            updateFormData({ leftEyeSclera: { ...formData.leftEyeSclera, ...data } })
          }
          updateAC={(data) =>
            updateFormData({ leftEyeAnteriorChamber: { ...formData.leftEyeAnteriorChamber, ...data } })
          }
          updateIris={(data) =>
            updateFormData({ leftEyeIrisPupil: { ...formData.leftEyeIrisPupil, ...data } })
          }
          updateLens={(data) =>
            updateFormData({ leftEyeLens: { ...formData.leftEyeLens, ...data } })
          }
          updateVitreous={(data) =>
            updateFormData({ leftEyeVitreous: { ...formData.leftEyeVitreous, ...data } })
          }
          updateFundusDisc={(data) =>
            updateFormData({ leftEyeFundusDiscMacula: { ...formData.leftEyeFundusDiscMacula, ...data } })
          }
          updateFundusRetina={(data) =>
            updateFormData({ leftEyeFundusRetinaVessel: { ...formData.leftEyeFundusRetinaVessel, ...data } })
          }
          recordType={recordType}
        />
      </div>
    </div>
  )
}
