"use client"

import { useTranslations } from "next-intl"

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
export default function HistoryStep() {
  const t = useTranslations("form.steps")
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>{t("historyStubTitle")}</strong> — {t("historyStubDesc")}
    </div>
  )
}
