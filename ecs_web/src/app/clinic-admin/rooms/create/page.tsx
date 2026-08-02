"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { roomService } from "@/services/room.service"
import type { CreateRoomRequest } from "@/services/room.service"

export default function CreateRoomPage() {
    const router = useRouter()
    const t = useTranslations("clinicAdmin.room")
    const tCommon = useTranslations("clinicAdmin.common")

    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<CreateRoomRequest>({
        roomName: "",
        roomType: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.roomName.trim()) {
            setError(t("create.validation.roomNameRequired"))
            return
        }

        try {
            setSubmitting(true)
            await roomService.createRoom({
                roomName: formData.roomName.trim(),
                roomType: formData.roomType?.trim() || undefined
            })
            router.push("/clinic-admin/rooms")
        } catch (err: any) {
            console.error("[Create Room Error]:", err)

            const errCode =
                err?.response?.data?.codeMessage ||
                err?.data?.codeMessage ||
                err?.codeMessage ||
                err?.response?.data?.code ||
                err?.code

            const errorString = err ? JSON.stringify(err) : ""

            if (errCode === "APP_MESSAGE_4021" || errCode === "4021" || errorString.includes("APP_MESSAGE_4021")) {
                setError(t("create.errors.duplicateRoom"))
            } else if (errCode === "APP_MESSAGE_4001" || errCode === "4001" || errorString.includes("APP_MESSAGE_4001")) {
                setError(t("create.errors.sessionExpired"))
            } else if (errCode === "APP_MESSAGE_4020" || errCode === "4020" || errorString.includes("APP_MESSAGE_4020")) {
                setError(t("create.errors.clinicUnavailable"))
            } else {
                const serverMessage = err?.response?.data?.message || err?.message || t("create.errors.generic")
                setError(serverMessage)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
            <div className="flex items-start gap-4 w-full min-w-0">
                <Link
                    href="/clinic-admin/rooms"
                    className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
                    aria-label={tCommon("back")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
                        {t("createTitle")}
                    </h2>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20 w-full min-w-0">
                    <AlertCircle className="h-5 w-5 text-error shrink-0" />
                    <span className="break-words flex-1 min-w-0">{error}</span>
                </div>
            )}

            <div className="w-full block bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm min-w-0">
                <form onSubmit={handleSubmit} className="block space-y-5 w-full min-w-0">

                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            {t("fields.roomNameRequired")}
                        </label>
                        <input
                            type="text"
                            name="roomName"
                            required
                            placeholder={t("placeholders.roomName")}
                            value={formData.roomName}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="block w-full">
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            {t("fields.roomTypeLabel")}
                        </label>
                        <input
                            type="text"
                            name="roomType"
                            placeholder={t("placeholders.roomType")}
                            value={formData.roomType}
                            onChange={handleChange}
                            disabled={submitting}
                            className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
                        <Link
                            href="/clinic-admin/rooms"
                            className="px-5 py-2.5 border border-outline rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                            {tCommon("cancel")}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[140px] disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                t("saveInfo")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
