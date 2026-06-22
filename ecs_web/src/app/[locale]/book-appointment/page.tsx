"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import BookAppointmentPage from "@/components/home/book-appointment/page"

export default function BookAppointmentRoute() {
    const [isAuth, setIsAuth] = useState<boolean | null>(null)
    const router = useRouter()
    const params = useParams() as { locale?: string }
    const locale = params?.locale ?? ""

    useEffect(() => {
        let mounted = true

        async function checkAuth() {
            try {
                const res = await fetch(`/api/booking-appointment`, { credentials: "include" })
                if (!mounted) return
                if (res.ok) {
                    setIsAuth(true)
                } else {
                    setIsAuth(false)
                    const loginPath = locale ? `/${locale}/login` : `/login`
                    router.replace(loginPath)
                }
            } catch (e) {
                if (!mounted) return
                setIsAuth(false)
                const loginPath = locale ? `/${locale}/login` : `/login`
                router.replace(loginPath)
            }
        }

        checkAuth()
        return () => {
            mounted = false
        }
    }, [router, locale])

    if (isAuth === null) return null
    if (isAuth === false) return null

    return <BookAppointmentPage />
}
