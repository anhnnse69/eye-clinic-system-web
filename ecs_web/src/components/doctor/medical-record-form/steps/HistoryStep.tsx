"use client"

/**
 * Stub HistoryStep — phiên bản multi-step cũ (đã lỗi thời).
 *
 * Sau khi Cloudinary refactor (2026-07-14): medical record form data lưu raw
 * JSON trên Cloudinary. Multi-step UI cũ (gồm nhiều bảng con đã bị drop khỏi
 * ERD) không còn tương thích.
 *
 * Trang edit hiện chưa được port sang form mới. Component này được giữ lại để
 * build pass — sẽ được viết lại trong UC/US tiếp theo.
 */
// Dùng kiểu rộng để chấp nhận prop tuỳ UI cũ truyền vào (recordType, ...).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HistoryStepProps {
  formData: unknown
  updateFormData: (updates: unknown) => void
  [key: string]: any
}

export default function HistoryStep(_: HistoryStepProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>HistoryStep (stub)</strong> — phiên bản multi-step đã lỗi thời.
      Form bệnh án hiện dùng <code>formData</code> JSON envelope (Cloudinary).
    </div>
  )
}
