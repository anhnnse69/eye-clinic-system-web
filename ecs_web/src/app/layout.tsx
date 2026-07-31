import { Inter, JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { Providers } from "@/components/Providers"
import { useActiveLocale } from "@/lib/locale"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

export const metadata: Metadata = {
  title: "Precision Eye Care Support System",
  description: "Digitizing the ophthalmology workflow from check-in to surgery",
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolve locale from URL > NEXT_LOCALE cookie > Accept-Language > default.
  // This must run BEFORE getMessages() so that messages are loaded for the
  // correct locale (especially for routes under /doctor, /system-admin,
  // /clinic-admin, /receptionist where next-intl middleware does not run).
  const locale = await useActiveLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href={LOGO_URL} />
        <link rel="shortcut icon" href={LOGO_URL} />
        <link rel="apple-touch-icon" href={LOGO_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-background text-on-surface font-body-md selection:bg-primary-fixed-dim selection:text-on-primary-fixed antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
