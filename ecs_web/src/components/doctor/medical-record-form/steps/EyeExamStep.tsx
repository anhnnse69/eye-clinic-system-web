"use client"

/**
 * Stub EyeExamStep — xem HistoryStep để biết lý do.
 */
interface EyeExamStepProps {
  formData: unknown
  updateFormData: (updates: unknown) => void
}

export default function EyeExamStep(_: EyeExamStepProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>EyeExamStep (stub)</strong> — sẽ được thay thế bằng Form Glaucoma unified.
    </div>
  )
}
