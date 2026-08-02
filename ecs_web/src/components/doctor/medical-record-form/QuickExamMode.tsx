"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import {
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-0.5 block text-xs font-medium text-gray-700"

/**
 * Simplified schema for Quick Exam Mode (tái khám)
 */
const quickExamSchema = z.object({
  visitType: z.enum(["first", "followup"]),
  chiefComplaint: z.string().optional(),

  vaWithoutCorrectionOd: z.string().optional(),
  vaWithoutCorrectionOs: z.string().optional(),
  vaCorrectedOd: z.string().optional(),
  vaCorrectedOs: z.string().optional(),
  iopOd: z.string().optional(),
  iopOs: z.string().optional(),
  iopMethod: z.string().optional(),

  rightEyelid: z.string().optional(),
  leftEyelid: z.string().optional(),
  rightConjunctiva: z.string().optional(),
  leftConjunctiva: z.string().optional(),
  rightCornea: z.string().optional(),
  leftCornea: z.string().optional(),
  rightAnteriorChamber: z.string().optional(),
  leftAnteriorChamber: z.string().optional(),
  rightLens: z.string().optional(),
  leftLens: z.string().optional(),
  rightFundus: z.string().optional(),
  leftFundus: z.string().optional(),

  bloodPressure: z.string().optional(),
  pulse: z.string().optional(),
  temperature: z.string().optional(),
  spo2: z.string().optional(),

  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
})

type QuickExamFormData = z.infer<typeof quickExamSchema>

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          {title}
        </span>
      </button>
      {open && <div className="border-t border-gray-100 p-4">{children}</div>}
    </div>
  )
}

interface QuickExamModeProps {
  patientProfile?: {
    fullName?: string | null
    gender?: string | null
    dob?: string | null
  }
  onComplete?: (data: QuickExamFormData) => void
  onCancel?: () => void
}

export default function QuickExamMode({
  patientProfile,
  onComplete,
  onCancel,
}: QuickExamModeProps) {
  const t = useTranslations("form.quickExam")
  const tCommon = useTranslations("common")

  const methods = useForm<QuickExamFormData>({
    resolver: zodResolver(quickExamSchema),
    defaultValues: {
      visitType: "followup",
    },
  })

  const { register, handleSubmit } = methods

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null
    try {
      const birthDate = new Date(dob)
      const today = new Date()
      return today.getFullYear() - birthDate.getFullYear()
    } catch {
      return null
    }
  }

  const onSubmit = (data: QuickExamFormData) => {
    onComplete?.(data)
  }

  const age = patientProfile?.dob ? calculateAge(patientProfile.dob) : null

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 p-2">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{t("title")}</h2>
              <p className="text-sm text-gray-600">
                {patientProfile?.fullName || tCommon("patient")}
                {age != null ? t("ageSuffix", { age }) : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Visit Type */}
        <CollapsibleSection title={t("visitTypeTitle")} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="first"
                {...register("visitType")}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="text-sm">{t("firstVisit")}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="followup"
                {...register("visitType")}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="text-sm">{t("followup")}</span>
            </label>
          </div>
        </CollapsibleSection>

        {/* Chief Complaint */}
        <CollapsibleSection title={t("chiefTitle")} defaultOpen={true}>
          <textarea
            {...register("chiefComplaint")}
            className={`${inputClass} min-h-[60px]`}
            placeholder={t("chiefPh")}
          />
        </CollapsibleSection>

        {/* Vision & IOP */}
        <CollapsibleSection title={t("visionTitle")} defaultOpen={true}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-700">
                {t("matPhai")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>{t("withoutGlasses")}</label>
                  <input
                    {...register("vaWithoutCorrectionOd")}
                    className={inputClass}
                    placeholder="10/10"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("withGlasses")}</label>
                  <input {...register("vaCorrectedOd")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("iopUnit")}</label>
                  <input {...register("iopOd")} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-700">
                {t("matTrai")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>{t("withoutGlasses")}</label>
                  <input
                    {...register("vaWithoutCorrectionOs")}
                    className={inputClass}
                    placeholder="10/10"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("withGlasses")}</label>
                  <input {...register("vaCorrectedOs")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("iopUnit")}</label>
                  <input {...register("iopOs")} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>{t("iopMethod")}</label>
            <select {...register("iopMethod")} className={inputClass}>
              <option value="">—</option>
              <option value="Non-contact">Non-contact</option>
              <option value="Goldmann">Goldmann</option>
              <option value="Maclakov">Maclakov</option>
              <option value="Schiotz">Schiotz</option>
            </select>
          </div>
        </CollapsibleSection>

        {/* Eye Exam Summary */}
        <CollapsibleSection title={t("examStructuresTitle")} defaultOpen={false}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">{t("matPhai")}</p>
              <div>
                <label className={labelClass}>{t("eyelid")}</label>
                <input {...register("rightEyelid")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("conjunctiva")}</label>
                <input {...register("rightConjunctiva")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("cornea")}</label>
                <input {...register("rightCornea")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("anteriorChamber")}</label>
                <input {...register("rightAnteriorChamber")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("lens")}</label>
                <input {...register("rightLens")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("fundus")}</label>
                <input {...register("rightFundus")} className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">{t("matTrai")}</p>
              <div>
                <label className={labelClass}>{t("eyelid")}</label>
                <input {...register("leftEyelid")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("conjunctiva")}</label>
                <input {...register("leftConjunctiva")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("cornea")}</label>
                <input {...register("leftCornea")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("anteriorChamber")}</label>
                <input {...register("leftAnteriorChamber")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("lens")}</label>
                <input {...register("leftLens")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("fundus")}</label>
                <input {...register("leftFundus")} className={inputClass} />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Vitals */}
        <CollapsibleSection title={t("vitalsTitle")} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <label className={labelClass}>{t("bp")}</label>
              <input
                {...register("bloodPressure")}
                className={inputClass}
                placeholder="120/80"
              />
            </div>
            <div>
              <label className={labelClass}>{t("pulse")}</label>
              <input {...register("pulse")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("temperature")}</label>
              <input {...register("temperature")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("spo2")}</label>
              <input {...register("spo2")} className={inputClass} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Diagnosis & Plan */}
        <CollapsibleSection title={t("diagnosisPlanTitle")} defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>{t("diagnosis")}</label>
              <textarea
                {...register("diagnosis")}
                className={`${inputClass} min-h-[60px]`}
                placeholder={t("diagnosisPh")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("treatmentPlan")}</label>
              <textarea
                {...register("treatmentPlan")}
                className={`${inputClass} min-h-[60px]`}
                placeholder={t("treatmentPlanPh")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("followUpDate")}</label>
                <input type="date" {...register("followUpDate")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("notes")}</label>
                <input {...register("notes")} className={inputClass} />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {tCommon("cancel")}
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <FileText className="h-4 w-4" />
            {t("save")}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
