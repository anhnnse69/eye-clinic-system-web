"use client";

/**
 * AITriageStep Component
 * 
 * Bước 1 trong quy trình khám bệnh (v3.0)
 * 
 * Flow:
 * 1. Bác sĩ nhập triệu chứng cơ bản (toggles / selects)
 * 2. Submit lên AI để dự đoán bệnh (19-class ML model)
 * 3. Hiển thị kết quả: Primary prediction + Top 3 differentials + Risk level
 * 4. Confirm để tiến hành khám chi tiết
 */

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Activity,
  Heart,
  Clock,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  Info,
  RotateCcw,
} from "lucide-react";
import { aiTriageService } from "@/services/ai-triage.service";
import {
  type AITriageSymptomInput,
  type AITriageResponse,
  type AITriageDifferential,
  DEFAULT_AI_TRIAGE_INPUT,
  getDiseaseDisplayName,
} from "@/types";

interface AITriageStepProps {
  patientName?: string | null;
  patientProfileId?: string;
  appointmentId?: string;
  onComplete: (data: { symptoms: AITriageSymptomInput; result: AITriageResponse }) => void;
  onBack?: () => void;
}

// Symptom categories structure
const SYMPTOM_CATEGORIES = [
  {
    id: "main",
    icon: Eye,
    fields: [
      {
        key: "symptom",
        type: "select" as const,
        options: [
          { value: "Eye_Pain" },
          { value: "Redness" },
          { value: "Blurred_Vision" },
          { value: "Eye_Discharge" },
          { value: "Swelling" },
          { value: "Foreign_Body" },
          { value: "Itching" },
          { value: "Tearing" },
          { value: "Floaters" },
          { value: "Halos" },
          { value: "Vision_Loss" },
          { value: "Headache" },
        ],
      },
      {
        key: "duration",
        type: "select" as const,
        options: [{ value: "acute" }, { value: "chronic" }],
      },
      {
        key: "pain_level",
        type: "select" as const,
        options: [{ value: "no" }, { value: "low" }, { value: "moderate" }, { value: "high" }],
      },
    ],
  },
  {
    id: "eye",
    icon: Activity,
    fields: [
      { key: "eye_redness", type: "bool" as const },
      { key: "blurred_vision", type: "bool" as const },
      { key: "light_sensitivity", type: "bool" as const },
      { key: "discharge", type: "bool" as const },
      { key: "tearing", type: "bool" as const },
      { key: "swelling", type: "bool" as const },
      { key: "foreign_body_sensation", type: "bool" as const },
      { key: "floaters", type: "bool" as const },
      { key: "halos", type: "bool" as const },
      {
        key: "eye_pressure",
        type: "select" as const,
        options: [{ value: "normal" }, { value: "high" }, { value: "very_high" }, { value: "low" }],
      },
      { key: "corneal_opacity", type: "bool" as const },
      {
        key: "pupil_response",
        type: "select" as const,
        options: [{ value: "normal" }, { value: "sluggish" }],
      },
      { key: "white_reflection", type: "bool" as const },
    ],
  },
  {
    id: "general",
    icon: Heart,
    fields: [
      { key: "headache", type: "bool" as const },
      { key: "nausea", type: "bool" as const },
      { key: "night_blindness", type: "bool" as const },
      { key: "double_vision", type: "bool" as const },
      { key: "eye_turning", type: "bool" as const },
    ],
  },
  {
    id: "history",
    icon: Clock,
    fields: [
      {
        key: "age",
        type: "select" as const,
        options: [
          { value: "child" },
          { value: "young" },
          { value: "adult" },
          { value: "middle_age" },
          { value: "senior" },
        ],
      },
      { key: "diabetes", type: "bool" as const },
      { key: "hypertension", type: "bool" as const },
      { key: "family_history", type: "bool" as const },
    ],
  },
];

export default function AITriageStep({
  patientName,
  patientProfileId,
  appointmentId,
  onComplete,
  onBack,
}: AITriageStepProps) {
  const t = useTranslations("aiTriage");

  const [symptoms, setSymptoms] = useState<AITriageSymptomInput>(DEFAULT_AI_TRIAGE_INPUT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AITriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>("main");

  // Helper for disease name translation with fallbacks
  const getDiseaseName = (diseaseKey: string) => {
    if (!diseaseKey) return "—";
    if (t.has(`diseases.${diseaseKey}`)) {
      return t(`diseases.${diseaseKey}`);
    }
    return getDiseaseDisplayName(diseaseKey);
  };

  // Helper for field label translation
  const getFieldLabel = (key: string) => {
    if (t.has(`symptomFields.${key}`)) {
      return t(`symptomFields.${key}`);
    }
    return key;
  };

  // Helper for option label translation
  const getOptionLabel = (fieldKey: string, optValue: string) => {
    if (t.has(`options.${fieldKey}.${optValue}`)) {
      return t(`options.${fieldKey}.${optValue}`);
    }
    return optValue;
  };

  // Update a single symptom field
  const updateSymptom = (key: keyof AITriageSymptomInput, value: string) => {
    setSymptoms((prev) => ({ ...prev, [key]: value }));
  };

  // Count active symptoms in category
  const getCategoryActiveCount = (categoryId: string) => {
    const cat = SYMPTOM_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) return 0;
    let count = 0;
    cat.fields.forEach((f) => {
      if (f.type === "bool") {
        if (symptoms[f.key as keyof AITriageSymptomInput] === "yes") {
          count++;
        }
      }
    });
    return count;
  };

  // Submit for AI prediction
  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiTriageService.submitTriage(symptoms);

      if (response.data?.isSuccess) {
        setResult(response.data);
      } else {
        setError(response.codeMessage || t("error"));
      }
    } catch (err) {
      setError(t("error"));
      console.error("AI Triage error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation to proceed
  const handleConfirm = () => {
    if (result) {
      onComplete({ symptoms, result });
    }
  };

  // Render a single symptom field
  const renderField = (field: typeof SYMPTOM_CATEGORIES[0]["fields"][0]) => {
    const value = symptoms[field.key as keyof AITriageSymptomInput];

    if (field.type === "bool") {
      const isYes = value === "yes";
      return (
        <div
          key={field.key}
          onClick={() => updateSymptom(field.key as keyof AITriageSymptomInput, isYes ? "no" : "yes")}
          className={`
            flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none
            ${isYes
              ? "border-blue-500 bg-blue-50/70 text-slate-900 shadow-xs ring-1 ring-blue-500/20"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }
          `}
        >
          <span className="text-sm font-medium text-slate-800">{getFieldLabel(field.key)}</span>
          <div
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0
              ${isYes
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-500 border border-slate-200"
              }
            `}
          >
            {isYes ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("boolean.yes")}
              </>
            ) : (
              t("boolean.no")
            )}
          </div>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {getFieldLabel(field.key)}
          </label>
          <select
            value={value as string}
            onChange={(e) => updateSymptom(field.key as keyof AITriageSymptomInput, e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all cursor-pointer"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {getOptionLabel(field.key, opt.value)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  };

  // Render AI result card
  const renderResultCard = () => {
    if (!result) return null;

    const riskConfig = aiTriageService.getRiskLevelConfig(result.riskLevel);
    const primaryDiseaseName = getDiseaseName(result.predictedDisease || "");
    const confidencePct = (result.confidence || 0) * 100;
    const riskLabelKey = riskConfig.labelKey;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Primary Prediction Card */}
        <div className={`rounded-2xl border-2 ${riskConfig.borderColor} ${riskConfig.bgColor} p-6 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100 shrink-0">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t("aiPrediction")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> ML 19-Class
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {primaryDiseaseName}
                </h2>
                {/* Confidence Bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="w-36 sm:w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, confidencePct)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {confidencePct.toFixed(1)}% {t("confidence")}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-extrabold uppercase border ${riskConfig.badgeBg} shadow-xs`}>
              {t(`riskLevels.${riskLabelKey}`)}
            </div>
          </div>
        </div>

        {/* Differential Diagnoses */}
        {result.differentials.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              {t("differentialDiagnoses")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.differentials.map((diff: AITriageDifferential, index: number) => {
                const diffName = getDiseaseName(diff.disease);
                const diffPct = diff.confidence * 100;
                return (
                  <div
                    key={diff.disease}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                        #{index + 2}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {diffPct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                      {diffName}
                    </p>
                    <div className="mt-2.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.max(4, diffPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-4 flex items-start gap-3 text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong>{t("note")}</strong>{" "}
            {result.disclaimer &&
            result.disclaimer !==
              "Preliminary AI assessment based on symptoms only. Does NOT replace professional eye care consultation."
              ? result.disclaimer
              : t("disclaimer")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 gap-4">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            {t("adjustSymptoms")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md shadow-blue-600/25"
          >
            <Stethoscope className="h-5 w-5" />
            {t("proceedToExam")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {t("subtitle")}
              {patientName && (
                <span className="ml-1.5 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {patientName}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
            1. {t("title")}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500">
            2. {t("proceedToExam")}
          </span>
        </div>
      </header>

      {/* Main Content */}
      {!result ? (
        <>
          {/* Symptom Categories Accordion */}
          <div className="space-y-4">
            {SYMPTOM_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;
              const activeCount = getCategoryActiveCount(category.id);
              const categoryTitle = t(`categories.${category.id}`);

              // Group fields into selects vs bools for clean grid layout
              const selectFields = category.fields.filter((f) => f.type === "select");
              const boolFields = category.fields.filter((f) => f.type === "bool");

              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
                >
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isExpanded ? "" : category.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${isExpanded ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-slate-800 text-base">{categoryTitle}</span>
                      {activeCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {t("reportedCount", { count: activeCount })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90 text-blue-600" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Category Content */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/30">
                      {/* Select Dropdowns */}
                      {selectFields.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {selectFields.map((field) => renderField(field))}
                        </div>
                      )}

                      {/* Boolean Symptom Toggles Grid */}
                      {boolFields.length > 0 && (
                        <div>
                          {selectFields.length > 0 && (
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              Triệu chứng chi tiết
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {boolFields.map((field) => renderField(field))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-5 rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("back")}
            </button>
            <button
              type="button"
              onClick={handlePredict}
              disabled={loading}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  {t("getAiPrediction")}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        /* AI Result Display */
        renderResultCard()
      )}
    </div>
  );
}
