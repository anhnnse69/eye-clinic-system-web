"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Printer,
} from "lucide-react"

import {
  medicalRecordFormDataSchema,
  validateFormDataForRecordType,
} from "@/schemas/medical-record.schema"
import medicalRecordService from "@/services/medical-record.service"
import { getMessage } from "@/constants/messages"
import {
  MEDICAL_RECORD_TYPE_LABELS,
  type MedicalRecordType,
  type MedicalRecordFormDataPayload,
} from "@/types"

import UniversalEyeExamSections from "./medical-record-form/UniversalEyeExamSections"
import OfficialMedicalRecordA4Print from "./medical-record-form/OfficialMedicalRecordA4Print"
import SubspecialtySections from "./medical-record-form/SubspecialtySections"
import GlaucomaFormSections from "./medical-record-form/GlaucomaFormSections"
import PatientManagementSections from "./medical-record-form/PatientManagementSections"
import DiagnosisDischargeSections from "./medical-record-form/DiagnosisDischargeSections"
import TongKetBenhAnSections from "./medical-record-form/TongKetBenhAnSections"
import TreatmentProgressTable from "./medical-record-form/TreatmentProgressTable"
import SurgeryForm from "./medical-record-form/SurgeryForm"
import ParaclinicalPanel from "./ParaclinicalPanel"

interface EditMedicalRecordClientProps {
  recordId: string
  appointmentId?: string
}

export default function EditMedicalRecordClient({
  recordId,
  appointmentId,
}: EditMedicalRecordClientProps) {
  // Touch appointmentId so it is not flagged unused (used by child forms via context).
  void appointmentId
  const router = useRouter()
  const tEdit = useTranslations("form.editPage")

  const [recordType, setRecordType] = useState<MedicalRecordType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{ recordId: string } | null>(null)
  const [initialData, setInitialData] = useState<MedicalRecordFormDataPayload | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      setLoadingRecord(true)
      setLoadError(null)
      try {
        const response = await medicalRecordService.getById(recordId)
        if (!response?.data) {
          setLoadError(tEdit("loadErrorNotFound"))
          return
        }

        const record = response.data

        if (record.canEdit === false || record.isLocked) {
          setLoadError(
            record.editRestrictionReason || tEdit("loadErrorLocked"),
          )
          return
        }

        const formData = record.formData as MedicalRecordFormDataPayload | null

        if (formData) {
          setInitialData(formData)
        } else {
          setLoadError(tEdit("loadErrorLegacy"))
          return
        }

        setRecordType(record.recordType as MedicalRecordType)
      } catch (err) {
        console.error("Error fetching record:", err)
        setLoadError(tEdit("loadErrorGeneric"))
      } finally {
        setLoadingRecord(false)
      }
    }
    fetchRecord()
  }, [recordId, tEdit])

  const methods = useForm<MedicalRecordFormDataPayload>({
    resolver: zodResolver(medicalRecordFormDataSchema) as unknown as Resolver<MedicalRecordFormDataPayload>,
    mode: "onBlur",
    defaultValues: initialData ?? {
      schemaVersion: "1.1",
      benhAn: {
        lyDoVaoVien: "",
        benhSu: "",
        tienSuBanThanMat: "",
        tienSuBanThanToanThan: "",
        tienSuGiaDinh: "",
      },
      khamBenh: {
        khamToanThan: {},
      },
    },
  })

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData)
    }
  }, [initialData, methods])

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!recordType) return

    setServerError(null)

    const ok = validateFormDataForRecordType(recordType, values as never)
    if (!ok.ok) {
      setServerError(ok.reason)
      return
    }

    const formatSystemErrorMessage = (rawError?: string | null, fallback = tEdit("saveErrorGeneric")): string => {
      if (!rawError) return fallback
      if (
        rawError.includes("500") ||
        rawError.includes("status code 500") ||
        rawError.toLowerCase().includes("request failed") ||
        rawError.includes("Internal Server Error")
      ) {
        return tEdit("saveErrorSystem")
      }
      return getMessage(rawError) ?? rawError
    }

    setSubmitting(true)
    try {
      const response = await medicalRecordService.update(recordId, {
        formData: values,
      })

      if (!response?.data?.isSuccess) {
        setServerError(formatSystemErrorMessage(response?.codeMessage))
        setSubmitting(false)
        return
      }

      setSuccessInfo({ recordId })
    } catch (err) {
      setServerError(
        formatSystemErrorMessage(err instanceof Error ? err.message : null)
      )
    } finally {
      setSubmitting(false)
    }
  })

  if (loadingRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{tEdit("loadingTitle")}</h3>
          <p className="text-sm text-gray-500">{tEdit("loadingHint")}</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tEdit("errorTitle")}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{loadError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {tEdit("back")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (successInfo) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">
            {tEdit("successTitle")}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            {tEdit("recordId")}{" "}
            <code className="rounded bg-white px-2 py-0.5">{successInfo.recordId}</code>
          </p>
        </div>

        <ParaclinicalPanel recordId={successInfo.recordId} />

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/doctor/records")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {tEdit("backToList")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/doctor/records/${successInfo.recordId}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {tEdit("viewDetail")}
          </button>
        </div>
      </div>
    )
  }

  if (!recordType) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800">{tEdit("recordTypeUnknown")}</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {tEdit("back")}
        </button>
      </div>
    )
  }

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = tEdit("printTitle")
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8 print:max-w-none print:p-0 print:space-y-4"
        aria-label={`${tEdit("edit")}: ${MEDICAL_RECORD_TYPE_LABELS[recordType]}`}
      >
        <OfficialMedicalRecordA4Print recordType={recordType || "MS21_TRAUMA"} />

        <header className="rounded-lg border border-gray-200 bg-white p-5 print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${accentText(recordType)}`}>
                {recordType.replace("MS", "MS ")}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {MEDICAL_RECORD_TYPE_LABELS[recordType]}
              </h1>
              <p className="mt-1 text-xs text-gray-600">{tEdit("edit")}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                title={tEdit("printTooltip")}
              >
                <Printer className="h-4 w-4" />
                {tEdit("print")}
              </button>
            </div>
          </div>
        </header>

        <nav
          aria-label={tEdit("tocLabel")}
          className="sticky top-2 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur print:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="font-medium text-gray-700">{tEdit("toc")}</span>
            <a href="#hanh-chinh" className="hover:text-indigo-600">
              {tEdit("tocHanhChinh")}
            </a>
            <a href="#benh-an" className="hover:text-indigo-600">
              {tEdit("tocBenhAn")}
            </a>
            <a href="#kham-benh" className="hover:text-indigo-600">
              {tEdit("tocKhamBenh")}
            </a>
            <a href="#chan-doan" className="hover:text-indigo-600">
              {tEdit("tocChanDoan")}
            </a>
            <a href="#tong-ket" className="hover:text-indigo-600">
              {tEdit("tocTongKet")}
            </a>
          </div>
        </nav>

        <section id="hanh-chinh">
          <PatientManagementSections recordType={recordType} />
        </section>

        <div id="benh-an">
          {recordType === "MS24_GLAUCOMA" ? (
            <GlaucomaFormSections />
          ) : (
            <SubspecialtySections recordType={recordType} />
          )}
        </div>

        <div id="kham-benh">
          <UniversalEyeExamSections />
        </div>

        <section id="chan-doan">
          <DiagnosisDischargeSections />
        </section>

        {recordType === "MS22_ANTERIOR" && (
          <section id="theo-doi-dieu-tri">
            <TreatmentProgressTable />
          </section>
        )}

        {recordType === "MS22_ANTERIOR" && (
          <section id="phieu-phau-thuat">
            <SurgeryForm />
          </section>
        )}

        <section id="tong-ket">
          <TongKetBenhAnSections recordType={recordType} />
        </section>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <footer className="mt-8 hidden border-t border-gray-300 pt-6 print:block print:break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center text-xs text-black">
            <div>
              <p className="font-semibold uppercase tracking-wider">{tEdit("footerPatient")}</p>
              <p className="mt-1 text-[10px] text-gray-500 italic">{tEdit("footerSignHint")}</p>
              <div className="h-16" />
            </div>
            <div>
              <p className="italic text-[11px] text-gray-700">{tEdit("footerDate")}</p>
              <p className="mt-1 font-semibold uppercase tracking-wider">{tEdit("footerDoctor")}</p>
              <p className="mt-1 text-[10px] text-gray-500 italic">{tEdit("footerSignHint")}</p>
              <div className="h-16" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-300 pt-3 flex items-center justify-between text-[10px] text-gray-700 font-semibold">
            <span className="uppercase tracking-wide">{tEdit("footerSystem")}</span>
            <span>{tEdit("footerSystemSubtitle")}</span>
          </div>
        </footer>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {tEdit("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-lg ${accentButton(recordType)} px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {tEdit("saving")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> {tEdit("saveChanges")}
              </>
            )}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

function accentText(recordType: string): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "text-rose-700"
    case "MS22_ANTERIOR":
      return "text-teal-700"
    case "MS23_FUNDUS":
      return "text-amber-700"
    case "MS24_GLAUCOMA":
      return "text-indigo-700"
    case "MS25_STRABISMUS_PTOSIS":
      return "text-sky-700"
    case "MS26_PEDIATRIC":
      return "text-violet-700"
    default:
      return "text-gray-700"
  }
}

function accentButton(recordType: string): string {
  switch (recordType) {
    case "MS21_TRAUMA":
      return "bg-rose-600"
    case "MS22_ANTERIOR":
      return "bg-teal-600"
    case "MS23_FUNDUS":
      return "bg-amber-600"
    case "MS24_GLAUCOMA":
      return "bg-indigo-600"
    case "MS25_STRABISMUS_PTOSIS":
      return "bg-sky-600"
    case "MS26_PEDIATRIC":
      return "bg-violet-600"
    default:
      return "bg-gray-600"
  }
}
