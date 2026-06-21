"use client"

import { Check, FileText, AlertCircle, Microscope, Eye, Activity, Brain, Heart } from "lucide-react"
import { RecordType, RECORD_TYPE_LABELS } from "@/types"

const RECORD_TYPES = [
  {
    type: "MS21_TRAUMA" as RecordType,
    label: RECORD_TYPE_LABELS.MS21_TRAUMA,
    icon: AlertCircle,
    color: "red",
    description: "Ghi nhận chấn thương mắt, nguyên nhân, thời gian và các tổn thương",
  },
  {
    type: "MS22_ANTERIOR" as RecordType,
    label: RECORD_TYPE_LABELS.MS22_ANTERIOR,
    icon: Microscope,
    color: "blue",
    description: "Khám bán phần trước: giác mạc, kết mạc, mống mắt",
  },
  {
    type: "MS23_FUNDUS" as RecordType,
    label: RECORD_TYPE_LABELS.MS23_FUNDUS,
    icon: Eye,
    color: "purple",
    description: "Khám đáy mắt: võng mạc, dây thần kinh thị giác, hõm củ mạc",
  },
  {
    type: "MS24_GLAUCOMA" as RecordType,
    label: RECORD_TYPE_LABELS.MS24_GLAUCOMA,
    icon: Activity,
    color: "amber",
    description: "Đo nhãn áp, đánh giá dây thần kinh thị giác, góc tiền phòng",
  },
  {
    type: "MS25_STRABISMUS_PTOSIS" as RecordType,
    label: RECORD_TYPE_LABELS.MS25_STRABISMUS_PTOSIS,
    icon: Brain,
    color: "teal",
    description: "Đánh giá lác, sụp mi, nhãn cầu và thị lực hai mắt",
  },
  {
    type: "MS26_PEDIATRIC" as RecordType,
    label: RECORD_TYPE_LABELS.MS26_PEDIATRIC,
    icon: Heart,
    color: "pink",
    description: "Khám mắt trẻ em: phát triển thị giác, lác, tật khúc xạ",
  },
]

const COLOR_CLASSES = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:border-red-400",
    selected: "border-red-500 bg-red-50",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:border-blue-400",
    selected: "border-blue-500 bg-blue-50",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    hover: "hover:border-purple-400",
    selected: "border-purple-500 bg-purple-50",
    icon: "text-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    hover: "hover:border-amber-400",
    selected: "border-amber-500 bg-amber-50",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    hover: "hover:border-teal-400",
    selected: "border-teal-500 bg-teal-50",
    icon: "text-teal-500",
    badge: "bg-teal-100 text-teal-700",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    hover: "hover:border-pink-400",
    selected: "border-pink-500 bg-pink-50",
    icon: "text-pink-500",
    badge: "bg-pink-100 text-pink-700",
  },
}

interface RecordTypeStepProps {
  selectedRecordType: RecordType | null
  onSelect: (type: RecordType) => void
}

export default function RecordTypeStep({ selectedRecordType, onSelect }: RecordTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Chọn loại bệnh án
        </h2>
        <p className="text-sm text-gray-500">
          Vui lòng chọn loại bệnh án phù hợp với tình trạng bệnh nhân
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECORD_TYPES.map((record) => {
          const Icon = record.icon
          const colors = COLOR_CLASSES[record.color as keyof typeof COLOR_CLASSES]
          const isSelected = selectedRecordType === record.type

          return (
            <button
              key={record.type}
              onClick={() => onSelect(record.type)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${colors.border} ${
                isSelected ? colors.selected : colors.hover
              } ${colors.bg}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} border border-current/10 flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {record.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {record.description}
                  </p>
                </div>
                {isSelected && (
                  <div
                    className={`w-6 h-6 rounded-full ${colors.badge} flex items-center justify-center shrink-0`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
