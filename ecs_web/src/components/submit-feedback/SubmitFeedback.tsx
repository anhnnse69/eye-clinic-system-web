// components/submit-feedback/SubmitFeedback.tsx
"use client"

import { useState } from "react"
import { Star, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { appointmentHistoryService } from "@/services"
import { ApiError } from "@/lib/axios"

interface SubmitFeedbackProps {
    appointmentId: string
    appointmentDate: string
    clinicName: string
    doctorName: string
    serviceName: string
    onSuccess?: () => void
    onCancel?: () => void
}

export default function SubmitFeedback({
    appointmentId,
    appointmentDate,
    clinicName,
    doctorName,
    serviceName,
    onSuccess,
    onCancel
}: SubmitFeedbackProps) {
    const t = useTranslations("feedback")
    const [ratingDoctor, setRatingDoctor] = useState(0)
    const [ratingClinic, setRatingClinic] = useState(0)
    const [comment, setComment] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async () => {
        if (ratingDoctor === 0 || ratingClinic === 0) {
            setError(t("errors.selectBoth"))
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await appointmentHistoryService.submitFeedback({
                appointmentId,
                ratingDoctor,
                ratingClinic,
                comment: comment.trim() || undefined,
                isPublic
            })

            if (response.data) {
                setSuccess(true)
                if (onSuccess) {
                    setTimeout(onSuccess, 1500)
                }
            } else {
                setError(t("errors.submitFailed"))
            }
        } catch (err: any) {
            let errorMessage = t("errors.submitFailed")

            if (err instanceof ApiError) {
                switch (err.codeMessage) {
                    case "APP_MESSAGE_4046":
                        errorMessage = t("errors.notFound")
                        break
                    case "APP_MESSAGE_4053":
                        errorMessage = t("errors.noPermission")
                        break
                    case "APP_MESSAGE_4055":
                        errorMessage = t("errors.completedOnly")
                        break
                    case "APP_MESSAGE_4056":
                        errorMessage = t("errors.alreadyRated")
                        break
                    case "APP_MESSAGE_4057":
                        errorMessage = t("errors.starRange")
                        break
                    default:
                        errorMessage = err.codeMessage || t("errors.submitFailed")
                }
            } else {
                errorMessage = err?.response?.data?.message || err?.message || t("errors.submitFailed")
            }

            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const StarRating = ({ rating, onChange, label }: { rating: number; onChange: (value: number) => void; label: string }) => {
        const [hover, setHover] = useState(0)

        return (
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="p-1 transition-all hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${star <= (hover || rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300 fill-gray-100"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-500">
                        {rating > 0 ? `${rating}/5` : t("selectStars")}
                    </span>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t("thanksTitle")}</h3>
                    <p className="text-sm text-gray-500">{t("thanksSubtitle")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t("appointmentRating")}</h3>
                    <p className="text-sm text-gray-500">{t("subtitle")}</p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">{t("clinic")}</p>
                        <p className="font-medium text-gray-900">{clinicName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">{t("doctor")}</p>
                        <p className="font-medium text-gray-900">{doctorName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">{t("service")}</p>
                        <p className="font-medium text-gray-900">{serviceName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">{t("appointmentDate")}</p>
                        <p className="font-medium text-gray-900">{appointmentDate}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-3 mb-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/50">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="space-y-4">
                <StarRating
                    label={t("rateDoctor")}
                    rating={ratingDoctor}
                    onChange={setRatingDoctor}
                />

                <StarRating
                    label={t("rateClinic")}
                    rating={ratingClinic}
                    onChange={setRatingClinic}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("commentLabel")}
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t("commentPlaceholder")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {t("charLimit", { count: comment.length })}
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {t("cancel")}
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || ratingDoctor === 0 || ratingClinic === 0}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("submitting")}
                            </>
                        ) : (
                            t("submit")
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}