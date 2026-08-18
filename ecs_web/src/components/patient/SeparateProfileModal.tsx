"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { AlertCircle, Loader2, X, CheckCircle, Mail } from "lucide-react"
import { patientProfileService } from "@/services/patient-profile.service"
import { getMessage } from "@/constants/messages"

interface SeparateProfileModalProps {
    isOpen: boolean
    profileId: string
    childName: string
    onClose: () => void
    onSuccess: () => void
}

export default function SeparateProfileModal({
    isOpen,
    profileId,
    childName,
    onClose,
    onSuccess,
}: SeparateProfileModalProps) {
    const t = useTranslations("patient.profile")
    const [step, setStep] = useState<"form" | "confirming" | "success">("form")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const [formData, setFormData] = useState({
        newEmail: "",
        newPhone: "",
    })

    const [successData, setSuccessData] = useState<{
        newUserId: string
        newPatientProfileId: string
        message: string
    } | null>(null)

    const [confirmAgreed, setConfirmAgreed] = useState(false)

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        setError(null)
    }

    const validateForm = () => {
        if (!formData.newEmail.trim()) {
            setError(t("emailRequired") || "Email is required")
            return false
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmail)) {
            setError(t("invalidEmailFormat") || "Invalid email format")
            return false
        }

        if (!formData.newPhone.trim()) {
            setError(t("phoneRequired") || "Phone number is required")
            return false
        }

        if (!/^\d{10,}$/.test(formData.newPhone.replace(/\D/g, ""))) {
            setError(t("invalidPhoneFormat") || "Phone number must be at least 10 digits")
            return false
        }

        if (!confirmAgreed) {
            setError(t("confirmAgreementRequired") || "You must agree to the separation")
            return false
        }

        return true
    }

    const getFriendlyErrorMessage = (err: any): string => {
        const serverMessage =
            err?.response?.data?.message ||
            err?.data?.message ||
            err?.message

        const codeMessage =
            err?.response?.data?.codeMessage ||
            err?.codeMessage ||
            ""

        if (typeof serverMessage === "string" && serverMessage.trim()) {
            if (serverMessage.startsWith("APP_MESSAGE_")) {
                return getMessage(serverMessage)
            }
            return serverMessage
        }

        if (codeMessage && codeMessage.startsWith("APP_MESSAGE_")) {
            return getMessage(codeMessage)
        }

        return t("separationFailed") || "Failed to separate profile"
    }

    const handleSeparate = async () => {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await patientProfileService.separate(
                profileId,
                formData.newEmail,
                formData.newPhone
            )

            if (response.data) {
                setStep("success")
                setSuccessData(response.data)
                setTimeout(() => {
                    onSuccess()
                }, 3000)
            } else {
                setError(getMessage(response.codeMessage) || t("separationFailed") || "Failed to separate profile")
            }
        } catch (err: any) {
            console.error("Separation failed:", err)
            setError(getFriendlyErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setStep("form")
            setFormData({ newEmail: "", newPhone: "" })
            setConfirmAgreed(false)
            setError(null)
            setSuccessData(null)
            onClose()
        }
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {step === "success"
                            ? t("separationSuccessful") || "Separation Successful"
                            : t("separateAccount") || "Separate Account"}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === "form" && (
                        <div className="space-y-4">
                            {/* Warning Section */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-900">
                                        {t("importantNotice") || "Important Notice"}
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        {t("separationWarning") ||
                                            "Once separated, you will completely lose access to this child's profile. This action cannot be undone."}
                                    </p>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Info Message */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    {t("separationInfo") ||
                                        `${childName} will receive a new independent account with login credentials sent to their email. All medical records and appointment history will be migrated to the new account.`}
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("newEmail") || "New Email Address"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.newEmail}
                                        onChange={(e) => handleInputChange("newEmail", e.target.value)}
                                        placeholder="child@example.com"
                                        disabled={loading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("newPhone") || "New Phone Number"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.newPhone}
                                        onChange={(e) => handleInputChange("newPhone", e.target.value)}
                                        placeholder="0912345678"
                                        disabled={loading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="confirm-agreement"
                                    checked={confirmAgreed}
                                    onChange={(e) => setConfirmAgreed(e.target.checked)}
                                    disabled={loading}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                                />
                                <label htmlFor="confirm-agreement" className="text-sm text-gray-700 cursor-pointer">
                                    {t("confirmAgreement") ||
                                        "I understand that I will completely lose access to this child's profile after separation"}
                                </label>
                            </div>
                        </div>
                    )}

                    {step === "success" && successData && (
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="bg-green-100 rounded-full p-3">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t("separationCompleted") || "Separation Completed!"}
                                </h3>
                                <p className="text-sm text-gray-600 mt-2">{successData.message}</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-blue-900">
                                        {t("emailSent") || "Email Notification Sent"}
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        {t("emailSentDescription") ||
                                            "Login credentials with a temporary password have been sent to the new email address. The child must change this password on first login."}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 pt-2">
                                {t("redirectingIn") || "Redirecting in 3 seconds..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    {step === "form" && (
                        <>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {t("cancel") || "Cancel"}
                            </button>
                            <button
                                onClick={handleSeparate}
                                disabled={loading || !confirmAgreed}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("processing") || "Processing..."}
                                    </>
                                ) : (
                                    t("separateAccount") || "Separate Account"
                                )}
                            </button>
                        </>
                    )}

                    {step === "success" && (
                        <button
                            onClick={handleClose}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            {t("close") || "Close"}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
