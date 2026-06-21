"use client"

import { ChevronDown, ChevronUp } from "lucide-react"

const COLOR_CLASSES = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-500",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-500",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    icon: "text-teal-500",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: "text-pink-500",
  },
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  color?: "red" | "blue" | "amber" | "teal" | "pink" | "purple"
}

export default function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  color,
}: CollapsibleSectionProps) {
  const colorClass = color ? COLOR_CLASSES[color] : COLOR_CLASSES.blue

  return (
    <div
      className={`bg-white rounded-2xl border ${color ? colorClass.border : "border-gray-200"} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between ${color ? colorClass.bg : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <span className={color ? colorClass.icon : "text-gray-500"}>{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  )
}
