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
 * Cách dùng:
 *  - Không collapsible: `<SectionHeading ... />` (đứng riêng, không bao bọc).
 *  - Collapsible: `<SectionHeading ... collapsible>{nội dung}</SectionHeading>`.
 *
 * Không hiển thị số La Mã theo yêu cầu Bộ Y tế PDF — chỉ hiển thị tiêu đề chữ.
 */

import { type LucideIcon, ChevronUp, ChevronDown } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"

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
  /** Cho phép thu gọn/mở rộng — bắt buộc truyền children để hoạt động */
  collapsible?: boolean
  /** Trạng thái mở ban đầu (chỉ áp dụng khi collapsible=true) */
  defaultOpen?: boolean
  /** Nội dung section — bắt buộc khi collapsible=true */
  children?: ReactNode
}

const accentMap: Record<
  SectionAccent,
  { bg: string; text: string; ring: string; chip: string }
> = {
  indigo: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  teal: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  rose: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  amber: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  sky: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  violet: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  emerald: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
  slate: {
    bg: "bg-surface-container-lowest",
    text: "text-primary font-bold",
    ring: "border-outline-variant/40",
    chip: "bg-[#c6e7ff]/30 text-primary border border-[#81cfff]/40",
  },
}

export function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  accentColor = "indigo",
  level = 2,
  collapsible = false,
  defaultOpen = false,
  children,
}: SectionHeadingProps) {
  const t = useTranslations("form.sectionHeading")
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

  const headerInner = (
    <>
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
        <span
          className={`flex shrink-0 items-center gap-1 text-xs font-medium ${accent.text}`}
        >
          {open ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              {t("collapse")}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              {t("expand")}
            </>
          )}
        </span>
      )}
    </>
  )

  if (!collapsible) {
    return (
      <div
        className={`rounded-lg border ${accent.ring} ${accent.bg} print:border-gray-300 print:bg-white`}
      >
        <div className={`flex items-center gap-3 ${sizing.wrapper}`}>{headerInner}</div>
      </div>
    )
  }

  const sectionId = `section-content-${title.replace(/\s+/g, "-").toLowerCase()}`

  return (
    <div className={`overflow-hidden rounded-lg border ${accent.ring} ${accent.bg}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 text-left transition hover:brightness-95 ${sizing.wrapper}`}
        aria-expanded={open}
        aria-controls={sectionId}
      >
        {headerInner}
      </button>
      {open && children !== undefined && (
        <div id={sectionId} className="border-t border-gray-200 bg-white p-4">
          {children}
        </div>
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