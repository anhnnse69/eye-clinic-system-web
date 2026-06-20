"use client"

import { useState } from "react"
import { Stethoscope } from "lucide-react"
import { RecordType, CreateMedicalRecordRequest } from "@/types"
import TraumaSubspecialtySection from "../subspecialty/TraumaSubspecialtySection"
import AnteriorSubspecialtySection from "../subspecialty/AnteriorSubspecialtySection"
import GlaucomaSubspecialtySection from "../subspecialty/GlaucomaSubspecialtySection"
import StrabismusSubspecialtySection from "../subspecialty/StrabismusSubspecialtySection"
import PediatricSubspecialtySection from "../subspecialty/PediatricSubspecialtySection"
import SystemicExamSection from "../subspecialty/SystemicExamSection"

interface SubspecialtyStepProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  recordType: RecordType
}

export default function SubspecialtyStep({
  formData,
  updateFormData,
  recordType,
}: SubspecialtyStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    systemic: true,
    trauma: recordType === "MS21_TRAUMA",
    lacrimal: recordType === "MS22_ANTERIOR",
    glaucoma: recordType === "MS24_GLAUCOMA",
    strabismus: recordType === "MS25_STRABISMUS_PTOSIS",
    pediatric: recordType === "MS26_PEDIATRIC",
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Khám chuyên khoa
        </h2>
        <p className="text-sm text-gray-500">
          Nhập thông tin khám chuyên khoa mắt theo loại bệnh án
        </p>
      </div>

      {/* Systemic Exam - Always visible */}
      <SystemicExamSection
        formData={formData}
        updateFormData={updateFormData}
        isExpanded={expandedSections.systemic}
        onToggle={() => toggleSection("systemic")}
      />

      {/* Trauma Section - MS21 */}
      {recordType === "MS21_TRAUMA" && (
        <TraumaSubspecialtySection
          formData={formData}
          updateFormData={updateFormData}
          isExpanded={expandedSections.trauma}
          onToggle={() => toggleSection("trauma")}
        />
      )}

      {/* Anterior Section - MS22 */}
      {recordType === "MS22_ANTERIOR" && (
        <AnteriorSubspecialtySection
          formData={formData}
          updateFormData={updateFormData}
          isExpanded={expandedSections.lacrimal}
          onToggle={() => toggleSection("lacrimal")}
        />
      )}

      {/* Glaucoma Section - MS24 */}
      {recordType === "MS24_GLAUCOMA" && (
        <GlaucomaSubspecialtySection
          formData={formData}
          updateFormData={updateFormData}
          isExpanded={expandedSections.glaucoma}
          onToggle={() => toggleSection("glaucoma")}
        />
      )}

      {/* Strabismus Section - MS25 */}
      {recordType === "MS25_STRABISMUS_PTOSIS" && (
        <StrabismusSubspecialtySection
          formData={formData}
          updateFormData={updateFormData}
          isExpanded={expandedSections.strabismus}
          onToggle={() => toggleSection("strabismus")}
        />
      )}

      {/* Pediatric Section - MS26 */}
      {recordType === "MS26_PEDIATRIC" && (
        <PediatricSubspecialtySection
          formData={formData}
          updateFormData={updateFormData}
          isExpanded={expandedSections.pediatric}
          onToggle={() => toggleSection("pediatric")}
        />
      )}
    </div>
  )
}
