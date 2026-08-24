"use client"

/**
 * GlassesTemplatePicker
 * 
 * Component cho phép bác sĩ chọn nhanh bộ đơn kính mẫu
 * theo tật khúc xạ phổ biến.
 */

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Glasses,
  Search,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import {
  glassesTemplateService,
  type GlassesTemplate,
} from "@/services/glasses-template.service"

interface GlassesTemplatePickerProps {
  onSelect: (template: GlassesTemplate) => void
  onClose?: () => void
}

export default function GlassesTemplatePicker({
  onSelect,
  onClose,
}: GlassesTemplatePickerProps) {
  const t = useTranslations("glasses")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedTemplate, setSelectedTemplate] = useState<GlassesTemplate | null>(null)

  const templates = glassesTemplateService.getAll()
  const categories = ["ALL", ...glassesTemplateService.getCategories()]

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      !searchTerm ||
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.nameEn.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "ALL" || tpl.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleApply = (template: GlassesTemplate) => {
    onSelect(template)
    setSelectedTemplate(template)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Glasses className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Chọn bộ đơn kính mẫu
              </h3>
              <p className="text-xs text-gray-500">
                Các đơn kính phổ biến theo tật khúc xạ
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm đơn kính..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-500 focus:outline-none"
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
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            <Glasses className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không tìm thấy đơn kính phù hợp</p>
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
                      ? "border-purple-500 bg-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
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
                          <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tpl.nameEn}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {tpl.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600">
                          {tpl.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-[10px] text-purple-700">
                          {tpl.patientGroup}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(tpl)
                      }}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      Áp dụng
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        {/* OD */}
                        <div className="bg-white rounded-lg border border-gray-200 p-2">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Mắt phải (OD)
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>SPH:</div>
                            <div className="font-medium">{tpl.rightEye.sphere}</div>
                            <div>CYL:</div>
                            <div className="font-medium">{tpl.rightEye.cylinder}</div>
                            <div>AXIS:</div>
                            <div className="font-medium">{tpl.rightEye.axis}°</div>
                            {tpl.rightEye.add && (
                              <>
                                <div>ADD:</div>
                                <div className="font-medium">{tpl.rightEye.add}</div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* OS */}
                        <div className="bg-white rounded-lg border border-gray-200 p-2">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Mắt trái (OS)
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>SPH:</div>
                            <div className="font-medium">{tpl.leftEye.sphere}</div>
                            <div>CYL:</div>
                            <div className="font-medium">{tpl.leftEye.cylinder}</div>
                            <div>AXIS:</div>
                            <div className="font-medium">{tpl.leftEye.axis}°</div>
                            {tpl.leftEye.add && (
                              <>
                                <div>ADD:</div>
                                <div className="font-medium">{tpl.leftEye.add}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {tpl.pd && (
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>PD:</strong> {tpl.pd} mm
                        </p>
                      )}
                      {tpl.recommendations && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          📌 {tpl.recommendations}
                        </p>
                      )}
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