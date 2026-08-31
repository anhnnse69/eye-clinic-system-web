"use client"

import React, { useState } from "react"
import { useTranslations } from "next-intl"
import { 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Loader2,
  RefreshCw
} from "lucide-react"
import { aiOctService, type AIOctPredictResponse, type OctClassCode } from "@/services/ai-oct.service"

interface OctAiAnalysisCardProps {
  initialImageBase64?: string;
  onAnalysisComplete?: (result: AIOctPredictResponse) => void;
  onSelectConclusion?: (conclusion: string) => void;
  className?: string;
}

export const OctAiAnalysisCard: React.FC<OctAiAnalysisCardProps> = ({
  initialImageBase64 = "",
  onAnalysisComplete,
  onSelectConclusion,
  className = "",
}) => {
  const t = useTranslations("octAnalysis")
  const [imageBase64, setImageBase64] = useState<string>(initialImageBase64)
  const [imagePreview, setImagePreview] = useState<string>(
    initialImageBase64.startsWith("data:") 
      ? initialImageBase64 
      : initialImageBase64 ? `data:image/jpeg;base64,${initialImageBase64}` : ""
  )
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [result, setResult] = useState<AIOctPredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh (JPEG, PNG)")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImagePreview(dataUrl)
      const base64Str = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl
      setImageBase64(base64Str)
      setError(null)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const runAnalysis = async () => {
    if (!imageBase64) {
      setError("Vui lòng tải ảnh OCT trước khi phân tích")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const resp = await aiOctService.predictOctImage(imageBase64)
      if (resp.success && resp.data) {
        setResult(resp.data)
        if (onAnalysisComplete) {
          onAnalysisComplete(resp.data)
        }
      } else {
        setError(resp.message || t("error"))
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi phân tích ảnh OCT với AI.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskBadgeConfig = (classCode: OctClassCode, riskLevel: string) => {
    if (classCode === "NORMAL" || riskLevel === "LOW") {
      return {
        label: t("classes.NORMAL.label"),
        badge: "bg-emerald-50 text-emerald-800 border border-emerald-200",
        iconColor: "text-emerald-600",
        barColor: "bg-emerald-500",
      }
    }
    if (classCode === "DRUSEN" || riskLevel === "MODERATE") {
      return {
        label: t("classes.DRUSEN.label"),
        badge: "bg-amber-50 text-amber-800 border border-amber-200",
        iconColor: "text-amber-600",
        barColor: "bg-amber-500",
      }
    }
    if (classCode === "DME") {
      return {
        label: t("classes.DME.label"),
        badge: "bg-rose-50 text-rose-800 border border-rose-200",
        iconColor: "text-rose-600",
        barColor: "bg-rose-500",
      }
    }
    return {
      label: t("classes.CNV.label"),
      badge: "bg-rose-50 text-rose-800 border border-rose-200",
      iconColor: "text-rose-600",
      barColor: "bg-rose-500",
    }
  }

  const getClassDescription = (classCode: string) => {
    switch (classCode) {
      case "NORMAL":
        return {
          desc: t("classes.NORMAL.description"),
          rec: t("classes.NORMAL.recommendation"),
        }
      case "CNV":
        return {
          desc: t("classes.CNV.description"),
          rec: t("classes.CNV.recommendation"),
        }
      case "DME":
        return {
          desc: t("classes.DME.description"),
          rec: t("classes.DME.recommendation"),
        }
      case "DRUSEN":
        return {
          desc: t("classes.DRUSEN.description"),
          rec: t("classes.DRUSEN.recommendation"),
        }
      default:
        return {
          desc: "Đã phân tích cấu trúc lớp võng mạc.",
          rec: "Cần tham khảo thêm ý kiến bác sĩ chuyên khoa.",
        }
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-200 shadow-2xs bg-white overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00658D] text-white shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{t("title")}</h3>
            <p className="text-xs text-slate-500">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Upload & Controls Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
            {imagePreview ? (
              <div className="relative group w-full flex flex-col items-center">
                <img 
                  src={imagePreview} 
                  alt="OCT Scan" 
                  className="max-h-48 rounded-lg object-cover shadow-2xs border border-slate-200"
                />
                <label className="mt-2 text-xs font-semibold text-[#00658D] hover:text-[#004c6b] cursor-pointer flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Thay đổi ảnh OCT
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <label className="w-full flex flex-col items-center justify-center cursor-pointer py-4">
                <Upload className="w-8 h-8 text-[#00658D] mb-2" />
                <span className="text-sm font-semibold text-slate-700">{t("uploadPrompt")}</span>
                <span className="text-xs text-slate-400 mt-1">{t("clickOrDrag")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-3">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={!imageBase64 || isAnalyzing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00658D] hover:bg-[#005273] active:scale-95 disabled:opacity-50 text-white font-semibold text-sm shadow-2xs transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {t("analyzeBtn")}
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Results */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-slate-200">
            {/* Low confidence warning */}
            {result.isLowConfidence && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t("lowConfidenceWarning")}</span>
              </div>
            )}

            {/* Main Result Box */}
            {(() => {
              const badgeCfg = getRiskBadgeConfig(result.predictedClass, result.riskLevel)
              const details = getClassDescription(result.predictedClass)
              return (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-5 h-5 ${badgeCfg.iconColor} shrink-0`} />
                      <h4 className="text-base font-bold text-slate-900">
                        {badgeCfg.label}
                      </h4>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full ${badgeCfg.badge} font-bold text-xs`}>
                      {t("confidence")}: {aiOctService.formatConfidence(result.confidence)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Độ chính xác nhận diện</span>
                      <span>{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                      <div 
                        className={`h-full ${badgeCfg.barColor} transition-all duration-500`} 
                        style={{ width: `${Math.min(100, Math.max(0, result.confidence * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Multilingual Description */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Mô tả y khoa:</strong> {details.desc}
                    </p>
                    <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                      <strong className="text-[#00658D]">Khuyến nghị cận lâm sàng:</strong> {details.rec}
                    </p>
                  </div>

                  {/* Probabilities Breakdown */}
                  {result.probabilities && (
                    <div className="pt-1">
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        Phân bố xác suất các nhóm tổn thương võng mạc:
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(result.probabilities).map(([cls, prob]) => (
                          <div 
                            key={cls} 
                            className={`p-2 rounded-lg border text-center text-xs transition-all ${
                              cls === result.predictedClass 
                                ? "bg-[#00658D] text-white border-[#00658D] font-bold shadow-2xs" 
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="block font-semibold">{cls}</span>
                            <span>{(prob * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply AI Conclusion Button */}
                  {onSelectConclusion && (
                    <button
                      type="button"
                      onClick={() => {
                        const text = `Chẩn đoán AI Máy OCT: ${result.predictedClass} (Độ tin cậy: ${aiOctService.formatConfidence(result.confidence)}). ${details.desc}`
                        onSelectConclusion(text)
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00658D] hover:bg-[#005273] active:scale-95 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer mt-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Áp dụng nhận định AI này vào kết luận lâm sàng
                    </button>
                  )}
                </div>
              )
            })()}

            {/* Disclaimer Banner */}
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{t("disclaimer")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OctAiAnalysisCard
