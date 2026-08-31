"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header" // Cập nhật đường dẫn chuẩn của bạn
import Footer from "@/components/layout/Footer" // Cập nhật đường dẫn chuẩn của bạn

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDdDCtCIew6gT1X16gRcMNxwYyAWMG9SNb6mhHflFfULdWB7uwYDSc_r82ayzhyyZJOGaaoxKp4_h8BxBW81XkjyxCpnaTDRcOLmRvoHZoDG1qVg8mj1DZ7fUC9iJgzxY9GuzXWhSmYWmTBGBE9jlnj1Om3VTmmlb83TxpNFUK_MLgGAPNnDeUNZXKNAw91ami9uHm5RcFqyB4PzAFj1PJ4bjzZuqDsJqhmU1FdBWfiz3SRf3sJaQxrgKhhdifm-iKTy1Bb9rI9vgQE"
const DOCTOR_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBP9GThm66yTARn7OMup1-PBwa53ela2cNgBGYbnH-rvP9Q23eqwtOzsoee_KDNWLDOjUIjyZAFE-LD7ILzZJBQhYHQN2PDMIjXkHBc1a86WSAAbMihxQpourJ4fvA2mgF7BarZvv7fHV_Xh4VHG4ayQD19qkiy_GcrOs4BXyEW6Sx0DFSBqGXD4_rVW4ukU09WpvhGwAVrHGEbximay8S-DsZhX7tloCsGtdunb3tQXZKGnIQuLXwP9kfCYvvlY1ooSh1owieuZLtw"

export function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [searchTab, setSearchTab] = useState<"clinics" | "doctors">( "clinics" )
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    router.push(
      `/${locale}/search/${searchTab}${q ? `?q=${encodeURIComponent(q)}` : ""}`
    )
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("button")
      if (btn) (btn as HTMLButtonElement).style.transform = "scale(0.95)"
    }
    const handleMouseUp = () => {
      document.querySelectorAll("button").forEach((b) => {
        ;(b as HTMLButtonElement).style.transform = "scale(1)"
      })
    }
    const handleMouseLeave = () => {
      document.querySelectorAll("button").forEach((b) => {
        ;(b as HTMLButtonElement).style.transform = "scale(1)"
      })
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseleave", handleMouseLeave)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0")
            entry.target.classList.remove("opacity-0", "translate-y-10")
          }
        })
      },
      { threshold: 0.1 }
    )

    const targets = document.querySelectorAll(".grid > div, blockquote")
    targets.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-10")
      observer.observe(el)
    })

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hero-gradient {
          background: radial-gradient(circle at 70% 30%, #dae2fd 0%, #f7f9fb 60%);
        }
      `}</style>

      <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-fixed-dim selection:text-on-primary-fixed">

        {/* Header Component */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          handleSearch={handleSearch}
        />

        <main>
          {/* ── Hero ── */}
          <section className="relative overflow-hidden hero-gradient pt-2xl pb-2xl md:py-2xl">
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-xl items-center">
              <div className="md:col-span-6 space-y-lg transition-all duration-700 opacity-100 translate-y-0">
                <div className="inline-flex items-center px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full gap-xs">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span className="text-label-md font-label-md uppercase tracking-wider">
                    {t("hero.badge")}
                  </span>
                </div>

                <h1 className="text-display-lg font-display-lg text-on-background leading-tight">
                  {t("hero.title1")} <span className="text-primary">{t("hero.title2")}</span>
                </h1>

                <p className="text-body-lg font-body-lg text-on-surface-variant max-w-1xl mx-auto">
                  {t("hero.subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-md pt-sm">
                  <button 
                    type="button"
                    onClick={() => router.push(`/${locale}/search/doctors`)}
                    className="px-2xl py-md bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-sm cursor-pointer"
                  >
                    {t("hero.bookAppointment")}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => router.push(`/${locale}/register`)}
                    className="px-2xl py-md bg-white border border-outline-variant text-primary font-headline-md text-headline-md rounded-xl hover:bg-surface-container transition-all flex items-center justify-center gap-sm cursor-pointer"
                  >
                    {t("hero.viewTour")}
                  </button>
                </div>
              </div>

              <div className="md:col-span-6 relative transition-all duration-700 opacity-100 translate-y-0">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative z-10">
                  <img className="w-full h-full object-cover" alt="Ophthalmology clinic" src={HERO_IMG} />
                </div>

                <div className="hidden md:block absolute -bottom-8 -left-8 glass-card border border-white/50 p-lg rounded-xl shadow-xl z-20 max-w-[240px]">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-10 w-10 rounded-full bg-tertiary-container flex items-center justify-center text-white">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        monitoring
                      </span>
                    </div>
                    <div>
                      <p className="text-label-md font-label-md text-on-surface-variant">{t("hero.clinicEfficiency")}</p>
                      <p className="text-headline-md font-headline-md text-tertiary">+34%</p>
                    </div>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">{t("hero.throughput")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Features Bento Grid ── */}
          <section className="py-2xl bg-white">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="text-center mb-2xl">
                <h2 className="text-headline-lg font-headline-lg text-on-surface mb-md">{t("features.title")}</h2>
                <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl mx-auto">{t("features.subtitle")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg h-auto">
                <div className="md:col-span-2 bg-surface-container-low border border-outline-variant p-2xl rounded-2xl flex flex-col justify-between group hover:border-primary transition-all duration-700 opacity-100 translate-y-0">
                  <div>
                    <span className="material-symbols-outlined text-primary text-[40px] mb-lg">domain</span>
                    <h3 className="text-headline-md font-headline-md mb-sm">{t("features.multiClinic.title")}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl">{t("features.multiClinic.description")}</p>
                  </div>
                  <div className="mt-xl flex items-center justify-between gap-md flex-wrap">
                    <div className="flex items-center gap-md">
                      <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed">NY</div>
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">LA</div>
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed">CH</div>
                      </div>
                      <span className="text-label-md font-label-md text-on-surface-variant">+8 {t("features.multiClinic.connected")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/${locale}/search/clinics`)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{locale === "vi" ? "Tìm phòng khám" : "Find Clinics"}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div 
                  onClick={() => router.push(`/${locale}/search/doctors`)}
                  className="bg-primary-container p-2xl rounded-2xl text-on-primary-container flex flex-col justify-between transition-all duration-700 opacity-100 translate-y-0 cursor-pointer hover:opacity-95"
                >
                  <div>
                    <span className="material-symbols-outlined text-white text-[40px] mb-lg">group</span>
                    <h3 className="text-headline-md font-headline-md mb-sm">{t("features.queue.title")}</h3>
                    <p className="text-body-md font-body-md opacity-90">{t("features.queue.description")}</p>
                  </div>
                  <div className="mt-xl flex items-center justify-between">
                    <span className="text-xs font-bold underline">{locale === "vi" ? "Tìm bác sĩ ngay" : "Find Doctors Now"}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                </div>

                <div className="bg-surface-container-low border border-outline-variant p-2xl rounded-2xl hover:border-primary transition-all duration-700 opacity-100 translate-y-0">
                  <span className="material-symbols-outlined text-primary text-[40px] mb-lg">medical_information</span>
                  <h3 className="text-headline-md font-headline-md mb-sm">{t("features.emr.title")}</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">{t("features.emr.description")}</p>
                </div>

                <div className="md:col-span-2 bg-surface-container-high border border-outline-variant p-2xl rounded-2xl flex flex-col md:flex-row gap-xl items-center group hover:border-primary transition-all duration-700 opacity-100 translate-y-0">
                  <div className="flex-1">
                    <span className="material-symbols-outlined text-primary text-[40px] mb-lg">patient_list</span>
                    <h3 className="text-headline-md font-headline-md mb-sm">{t("features.portal.title")}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant">{t("features.portal.description")}</p>
                  </div>
                  <div className="w-full md:w-1/3 bg-white p-md rounded-xl border border-outline-variant shadow-sm rotate-2 group-hover:rotate-0 transition-transform">
                    <div className="flex flex-col gap-sm">
                      <div className="h-3 w-3/4 bg-surface-container rounded"></div>
                      <div className="h-3 w-1/2 bg-surface-container rounded"></div>
                      <button
                        type="button"
                        onClick={() => router.push(`/${locale}/book-appointment`)}
                        className="h-8 w-full bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <span className="text-primary font-bold text-label-md">{t("features.portal.nextAppointment")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="py-2xl bg-surface-container-low border-y border-outline-variant">
            <div className="max-w-5xl mx-auto px-gutter text-center">
              <span className="material-symbols-outlined text-primary text-[48px] mb-lg">format_quote</span>
              <blockquote className="text-headline-lg font-headline-lg text-on-surface italic leading-relaxed mb-xl transition-all duration-700 opacity-100 translate-y-0">
                "{t("testimonial.quote")}"
              </blockquote>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-sm border-2 border-primary">
                  <img className="w-full h-full object-cover" alt="Dr. Elena Sterling" src={DOCTOR_IMG} />
                </div>
                <cite className="not-italic">
                  <p className="text-headline-md font-headline-md text-on-surface">{t("testimonial.name")}</p>
                  <p className="text-label-md font-label-md text-primary uppercase">{t("testimonial.role")}</p>
                </cite>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-2xl px-gutter">
            <div className="max-w-7xl mx-auto bg-on-surface rounded-3xl p-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
              <div className="relative z-10">
                <h2 className="text-display-lg font-display-lg text-white mb-lg">{t("cta.title")}</h2>
                <p className="text-body-lg font-body-lg text-surface-container-highest max-w-3xl mx-auto mb-2xl">{t("cta.subtitle")}</p>
                <div className="flex flex-wrap justify-center gap-md">
                  <button 
                    type="button"
                    onClick={() => router.push(`/${locale}/register-clinic-application`)}
                    className="px-2xl py-md bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-xl hover:bg-primary-container/90 transition-all cursor-pointer"
                  >
                    {t("cta.startTrial")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => router.push(`/${locale}/search/doctors`)}
                    className="px-2xl py-md bg-white/10 text-white border border-white/20 font-headline-md text-headline-md rounded-xl hover:bg-white/20 transition-all cursor-pointer"
                  >
                    {t("cta.speakExpert")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer Component */}
        <Footer />

      </div>
    </>
  )
}
