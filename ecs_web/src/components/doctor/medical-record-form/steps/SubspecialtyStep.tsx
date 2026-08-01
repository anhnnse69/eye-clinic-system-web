"use client"

/**
 * Stub SubspecialtyStep — xem HistoryStep để biết lý do.
 */
interface SubspecialtyStepProps {
  formData: unknown
  updateFormData: (updates: unknown) => void
}

export default function SubspecialtyStep(_: SubspecialtyStepProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>SubspecialtyStep (stub)</strong>.
    </div>
  )
}
