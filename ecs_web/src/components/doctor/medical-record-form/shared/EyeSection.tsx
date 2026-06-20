"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface EyeSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

export default function EyeSection({ title, icon, children }: EyeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-blue-500">{icon}</span>
        <span className="text-sm font-medium text-gray-700 flex-1">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="p-3">{children}</div>}
    </div>
  )
}
