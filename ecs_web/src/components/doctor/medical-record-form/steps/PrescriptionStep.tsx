"use client"

/**
 * Stub PrescriptionStep — xem HistoryStep để biết lý do.
 */
interface PrescriptionStepProps {
  formData: unknown
  updateFormData: (updates: unknown) => void
}

export default function PrescriptionStep(_: PrescriptionStepProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>PrescriptionStep (stub)</strong>.
    </div>
  )
}
