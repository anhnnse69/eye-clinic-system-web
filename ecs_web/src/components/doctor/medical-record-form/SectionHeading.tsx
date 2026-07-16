"use client"

/**
 * SectionHeading — heading dùng chung cho mọi section trong bệnh án.
 *
 * Hỗ trợ:
 *  - Cấp 2 (heading chính của phần "A. Bệnh Án" / "Khám bệnh" / "Tổng kết")
 *  - Cấp 3 (heading tiểu mục: "Thị lực & Nhãn áp", "Mi mắt", ...)
 *  - Icon Lucide + accent color
 *  - Optional subtitle
 *  - Optional collapsible (mặc định mở)
 *
 * Không hiển thị số La Mã theo yêu cầu Bộ Y tế PDF — chỉ hiển thị tiêu đề chữ.
 */

import { type LucideIcon } from "lucide-react"
import { useState } from "react"

export type SectionAccent =
  | "indigo"
  | "teal"
  | "rose"
  | "amber"
  | "sky"
  | "violet"
  | "emerald"
  | "slate"

interface SectionHeadingProps {
  /** Tiêu đề chính (chữ thuần, không số La Mã) */
  title: string
  /** Mô tả phụ, hiển thị nhỏ hơn bên dưới title */
  subtitle?: string
  /** Icon Lucide */
  icon: LucideIcon
  /** Màu accent (mỗi mẫu bệnh án dùng 1 màu riêng) */
  accentColor?: SectionAccent
  /** Cấp heading: 2 = heading chính của phần lớn, 3 = tiểu mục */
  level?: 2 | 3
  /** Cho phép thu gọn/mở rộng */
  collapsible?: boolean
  /** Trạng thái mở ban đầu (chỉ áp dụng khi collapsible=true) */
  defaultOpen?: boolean
}

const accentMap: Record<
  SectionAccent,
  { bg: string; text: string; ring: string; chip: string }
> = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    chip: "bg-indigo-100 text-indigo-700",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-200",
    chip: "bg-teal-100 text-teal-700",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    chip: "bg-rose-100 text-rose-700",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    chip: "bg-amber-100 text-amber-700",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-200",
    chip: "bg-sky-100 text-sky-700",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
    chip: "bg-violet-100 text-violet-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    chip: "bg-emerald-100 text-emerald-700",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-200",
    chip: "bg-slate-100 text-slate-700",
  },
}

export function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  accentColor = "indigo",
  level = 2,
  collapsible = false,
  defaultOpen = true,
}: SectionHeadingProps) {
  const [open, setOpen] = useState(defaultOpen)
  const accent = accentMap[accentColor]

  const sizing =
    level === 2
      ? {
          wrapper: "px-5 py-4",
          iconBox: "h-10 w-10",
          iconSize: "h-5 w-5",
          title: "text-base font-semibold",
          subtitle: "text-xs",
        }
      : {
          wrapper: "px-4 py-3",
          iconBox: "h-8 w-8",
          iconSize: "h-4 w-4",
          title: "text-sm font-semibold",
          subtitle: "text-xs",
        }

  const content = (
    <div className={`flex items-center gap-3 ${sizing.wrapper}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-md ${accent.chip} ${sizing.iconBox}`}
        aria-hidden="true"
      >
        <Icon className={sizing.iconSize} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className={`${sizing.title} text-gray-900`}>{title}</h2>
        {subtitle && (
          <p className={`${sizing.subtitle} mt-0.5 text-gray-600`}>{subtitle}</p>
        )}
      </div>
      {collapsible && (
        <span className={`text-xs font-medium ${accent.text}`}>
          {open ? "Thu gọn" : "Mở rộng"}
        </span>
      )}
    </div>
  )

  if (!collapsible) {
    return (
      <div
        className={`rounded-lg border ${accent.ring} ${accent.bg} print:border-gray-300 print:bg-white`}
      >
        {content}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border ${accent.ring} ${accent.bg} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left transition hover:brightness-95"
        aria-expanded={open}
      >
        {content}
      </button>
      {open && (
        <div className="border-t border-gray-200 bg-white p-4">{/* children injected by parent */}</div>
      )}
    </div>
  )
}

/**
 * Hàm tiện ích: lấy accent color mặc định theo recordType.
 * - MS21 (Chấn thương)         → rose
 * - MS22 (Bán phần trước)     → teal
 * - MS23 (Đáy mắt)            → amber
 * - MS24 (Glôcôm)             → indigo
 * - MS25 (Lác, sụp mi)        → sky
 * - MS26 (Mắt trẻ em)         → violet
 */
export function getAccentForRecordType(
  recordType: string | undefined,
): SectionAccent {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "rose"
    case "MS22_ANTERIOR":
      return "teal"
    case "MS23_FUNDUS":
      return "amber"
    case "MS24_GLAUCOMA":
      return "indigo"
    case "MS25_STRABISMUS_PTOSIS":
      return "sky"
    case "MS26_PEDIATRIC":
      return "violet"
    default:
      return "slate"
  }
}
