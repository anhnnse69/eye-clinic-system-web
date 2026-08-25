"use client"

/**
 * PrescriptionTemplatePicker
 * 
 * Component cho phép bác sĩ chọn nhanh bộ đơn thuốc mẫu
 * theo nhóm bệnh phổ biến trong nhãn khoa.
 * 
 * Khi chọn template, sẽ auto-fill vào form đơn thuốc.
 */

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Pill,
  Search,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import {
  prescriptionTemplateService,
  type PrescriptionTemplate,
} from "@/services/prescription-template.service"

interface PrescriptionTemplatePickerProps {
  onSelect: (template: PrescriptionTemplate) => void
  onClose?: () => void
}

export default function PrescriptionTemplatePicker({
  onSelect,
  onClose,
}: PrescriptionTemplatePickerProps) {
  const t = useTranslations("prescription")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null)

  const templates = prescriptionTemplateService.getAll()
  const categories = ["ALL", ...prescriptionTemplateService.getCategories()]

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      !searchTerm ||
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "ALL" || tpl.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleApplyTemplate = (template: PrescriptionTemplate) => {
    onSelect(template)
    setSelectedTemplate(template)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#00658D]/10 text-[#00658D]">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {t("templatePicker.title") || "Chọn bộ đơn thuốc mẫu"}
              </h3>
              <p className="text-xs text-gray-500">
                {t("templatePicker.subtitle") || "Các đơn thuốc phổ biến trong nhãn khoa"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bộ đơn..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#00658D] focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${selectedCategory === cat
                  ? "bg-[#00658D] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
              `}
            >
              {cat === "ALL" ? "Tất cả" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template List */}
      <div className="max-h-96 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không tìm thấy bộ đơn phù hợp</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id
              return (
                <div
                  key={tpl.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${isSelected
                      ? "border-[#00658D] bg-[#00658D]/5 shadow-2xs"
                      : "border-slate-200 hover:border-[#00658D]/40 hover:bg-slate-50"
                    }
                  `}
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {tpl.name}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-[#00658D] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tpl.nameEn}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {tpl.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                          {tpl.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#00658D]/10 text-[10px] text-[#00658D]">
                          {tpl.medicines.length} thuốc
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApplyTemplate(tpl)
                      }}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00658D] text-white text-xs font-medium hover:bg-[#005273] transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      Áp dụng
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Thuốc trong đơn:
                      </p>
                      <ul className="space-y-1.5">
                        {tpl.medicines.map((m, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex gap-2">
                            <span className="font-medium text-gray-900 min-w-6">
                              {idx + 1}.
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{m.name}</p>
                              <p className="text-gray-500">
                                {m.dosage} • {m.frequency} • {m.duration}
                                {m.eye && ` • ${m.eye}`}
                              </p>
                              {m.notes && (
                                <p className="text-gray-500 italic mt-0.5 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-[#00658D] shrink-0" /> {m.notes}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}