"use client"

/**
 * Stub DiagnosisStep — xem HistoryStep để biết lý do.
 */
interface DiagnosisStepProps {
  formData: unknown
  updateFormData: (updates: unknown) => void
}

export default function DiagnosisStep(_: DiagnosisStepProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>DiagnosisStep (stub)</strong>.
    </div>
  )
}
