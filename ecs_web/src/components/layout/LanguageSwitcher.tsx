"use client"

/**
 * LanguageSwitcher — toggles VI / EN by setting the NEXT_LOCALE cookie and
 * triggering a router refresh so SSR re-renders with the new locale.
 *
 * Render this anywhere in the app tree; it auto-detects the current locale
 * from `document.cookie` (NEXT_LOCALE) or `<html lang>` on mount.
 */
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Locale = "vi" | "en"

interface LanguageSwitcherProps {
  /** Optional className to override the wrapper container. */
  className?: string
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter()
  const [current, setCurrent] = useState<Locale>("en")

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(vi|en)/)
    const cookieLocale = match?.[1] as Locale | undefined
    const htmlLang = document.documentElement.lang
    if (cookieLocale === "vi" || cookieLocale === "en") {
      setCurrent(cookieLocale)
    } else if (htmlLang === "vi" || htmlLang === "en") {
      setCurrent(htmlLang)
    }
  }, [])

  const switchTo = useCallback(
    (next: Locale) => {
      if (next === current) return
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`
      setCurrent(next)
      window.location.reload()
    },
    [current]
  )

  return (
    <div
      className={
        "inline-flex items-center bg-surface-container-lowest border border-outline-variant rounded-full overflow-hidden shadow-xs text-xs font-bold select-none " +
        (className ?? "")
      }
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => switchTo("vi")}
        className={
          "px-3 h-9 transition-colors " +
          (current === "vi"
            ? "bg-primary text-on-primary"
            : "text-on-surface-variant hover:bg-surface-container")
        }
        aria-label="Switch to Vietnamese"
        aria-pressed={current === "vi"}
        title="Tiếng Việt"
      >
        VI
      </button>
      <span className="h-5 w-px bg-outline-variant" aria-hidden />
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={
          "px-3 h-9 transition-colors " +
          (current === "en"
            ? "bg-primary text-on-primary"
            : "text-on-surface-variant hover:bg-surface-container")
        }
        aria-label="Switch to English"
        aria-pressed={current === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  )
}
