"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"

const LOGO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdDCtCIew6gT1X16gRcMNxwYyAWMG9SNb6mhHflFfULdWB7uwYDSc_r82ayzhyyZJOGaaoxKp4_h8BxBW81XkjyxCpnaTDRcOLmRvoHZoDG1qVg8mj1DZ7fUC9iJgzxY9GuzXWhSmYWmTBGBE9jlnj1Om3VTmmlb83TxpNFUK_MLgGAPNnDeUNZXKNAw91ami9uHm5RcFqyB4PzAFj1PJ4bjzZuqDsJqhmU1FdBWfiz3SRf3sJaQxrgKhhdifm-iKTy1Bb9rI9vgQE"

const DOCTOR_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBP9GThm66yTARn7OMup1-PBwa53ela2cNgBGYbnH-rvP9Q23eqwtOzsoee_KDNWLDOjUIjyZAFE-LD7ILzZJBQhYHQN2PDMIjXkHBc1a86WSAAbMihxQpourJ4fvA2mgF7BarZvv7fHV_Xh4VHG4ayQD19qkiy_GcrOs4BXyEW6Sx0DFSBqGXD4_rVW4ukU09WpvhGwAVrHGEbximay8S-DsZhX7tloCsGtdunb3tQXZKGnIQuLXwP9kfCYvvlY1ooSh1owieuZLtw"

export function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLang = () => {
    if (locale === "en") {
      localStorage.setItem("locale", "vi")
      router.replace("/vi/home")
    } else {
      localStorage.setItem("locale", "en")
      router.replace("/en/home")
    }
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
        {/* ── Header ── */}
        <header className="bg-surface-container-lowest sticky top-0 z-50 border-b border-outline-variant">
          <nav className="flex justify-between items-center w-full px-gutter max-w-7xl mx-auto h-16">
            <div className="flex items-center gap-sm">
              <img alt="OcularLink Logo" className="h-12 w-12 object-contain" src={LOGO_IMG} />
              <span className="text-headline-md font-headline-md font-bold text-primary">
                {t("brand")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-xl">
              <a
                className="text-primary border-b-2 border-primary font-bold pb-1 text-label-md font-label-md transition-all"
                href="#"
              >
                {t("nav.solutions")}
              </a>
              <a
                className="text-on-surface-variant font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200"
                href="#"
              >
                {t("nav.features")}
              </a>
              <a
                className="text-on-surface-variant font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200"
                href="#"
              >
                {t("nav.forDoctors")}
              </a>
              <a
                className="text-on-surface-variant font-medium text-label-md font-label-md hover:text-primary transition-colors duration-200"
                href="#"
              >
                {t("nav.forPatients")}
              </a>
            </div>

            <div className="flex items-center gap-md">
              <button
                onClick={toggleLang}
                className="hidden md:block px-lg py-sm text-label-md font-label-md text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container transition-colors"
                title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
              >
                {locale === "vi" ? "EN" : "VI"}
              </button>
              <button className="hidden md:block px-lg py-sm font-label-md text-label-md text-primary border border-primary rounded-lg hover:bg-primary-fixed transition-colors">
                {t("nav.login")}
              </button>
              <button className="px-lg py-sm font-label-md text-label-md bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all">
                {t("nav.requestDemo")}
              </button>
              <button className="md:hidden text-on-surface-variant">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* ── Hero ── */}
          <section className="relative overflow-hidden hero-gradient pt-2xl pb-2xl md:py-2xl">
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 md:grid-cols-12 gap-xl items-center">
              <div className="md:col-span-6 space-y-lg transition-all duration-700 opacity-100 translate-y-0">
                <div className="inline-flex items-center px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full gap-xs">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="text-label-md font-label-md uppercase tracking-wider">
                    {t("hero.badge")}
                  </span>
                </div>

                <h1 className="text-display-lg font-display-lg text-on-background leading-tight">
                  {t("hero.title1")}
                  <span className="text-primary">{t("hero.title2")}</span>
                </h1>

                <p className="text-body-lg font-body-lg text-on-surface-variant max-w-1xl mx-auto">
                  {t("hero.subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-md pt-sm">
                  <button className="px-2xl py-md bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-sm">
                    {t("hero.bookAppointment")}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <button className="px-2xl py-md bg-white border border-outline-variant text-primary font-headline-md text-headline-md rounded-xl hover:bg-surface-container transition-all flex items-center justify-center gap-sm">
                    {t("hero.viewTour")}
                  </button>
                </div>
              </div>

              <div className="md:col-span-6 relative transition-all duration-700 opacity-100 translate-y-0">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative z-10">
                  <img
                    className="w-full h-full object-cover"
                    alt="Ophthalmology clinic"
                    src={HERO_IMG}
                  />
                </div>

                <div className="hidden md:block absolute -bottom-8 -left-8 glass-card border border-white/50 p-lg rounded-xl shadow-xl z-20 max-w-[240px]">
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="h-10 w-10 rounded-full bg-tertiary-container flex items-center justify-center text-white">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        monitoring
                      </span>
                    </div>
                    <div>
                      <p className="text-label-md font-label-md text-on-surface-variant">
                        {t("hero.clinicEfficiency")}
                      </p>
                      <p className="text-headline-md font-headline-md text-tertiary">+34%</p>
                    </div>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    {t("hero.throughput")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Features Bento Grid ── */}
          <section className="py-2xl bg-white">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="text-center mb-2xl">
                <h2 className="text-headline-lg font-headline-lg text-on-surface mb-md">
                  {t("features.title")}
                </h2>
                <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl mx-auto">
                  {t("features.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg h-auto">
                {/* Multi-Clinic Hub */}
                <div className="md:col-span-2 bg-surface-container-low border border-outline-variant p-2xl rounded-2xl flex flex-col justify-between group hover:border-primary transition-colors transition-all duration-700 opacity-100 translate-y-0">
                  <div>
                    <span className="material-symbols-outlined text-primary text-[40px] mb-lg">
                      domain
                    </span>
                    <h3 className="text-headline-md font-headline-md mb-sm">
                      {t("features.multiClinic.title")}
                    </h3>
                    <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl">
                      {t("features.multiClinic.description")}
                    </p>
                  </div>
                  <div className="mt-xl flex items-center gap-md">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed">
                        NY
                      </div>
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">
                        LA
                      </div>
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed">
                        CH
                      </div>
                    </div>
                    <span className="text-label-md font-label-md text-on-surface-variant">
                      +8 {t("features.multiClinic.connected")}
                    </span>
                  </div>
                </div>

                {/* Intelligent Queueing */}
                <div className="bg-primary-container p-2xl rounded-2xl text-on-primary-container flex flex-col justify-between transition-all duration-700 opacity-100 translate-y-0">
                  <div>
                    <span className="material-symbols-outlined text-white text-[40px] mb-lg">
                      group
                    </span>
                    <h3 className="text-headline-md font-headline-md mb-sm">
                      {t("features.queue.title")}
                    </h3>
                    <p className="text-body-md font-body-md opacity-90">
                      {t("features.queue.description")}
                    </p>
                  </div>
                  <div className="bg-white/20 h-1 w-full rounded-full mt-xl">
                    <div className="bg-white h-full w-3/4 rounded-full"></div>
                  </div>
                </div>

                {/* Specialized EMR */}
                <div className="bg-surface-container-low border border-outline-variant p-2xl rounded-2xl hover:border-primary transition-colors transition-all duration-700 opacity-100 translate-y-0">
                  <span className="material-symbols-outlined text-primary text-[40px] mb-lg">
                    medical_information
                  </span>
                  <h3 className="text-headline-md font-headline-md mb-sm">
                    {t("features.emr.title")}
                  </h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">
                    {t("features.emr.description")}
                  </p>
                </div>

                {/* Patient Portal */}
                <div className="md:col-span-2 bg-surface-container-high border border-outline-variant p-2xl rounded-2xl flex flex-col md:flex-row gap-xl items-center group hover:border-primary transition-colors transition-all duration-700 opacity-100 translate-y-0">
                  <div className="flex-1">
                    <span className="material-symbols-outlined text-primary text-[40px] mb-lg">
                      patient_list
                    </span>
                    <h3 className="text-headline-md font-headline-md mb-sm">
                      {t("features.portal.title")}
                    </h3>
                    <p className="text-body-md font-body-md text-on-surface-variant">
                      {t("features.portal.description")}
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 bg-white p-md rounded-xl border border-outline-variant shadow-sm rotate-2 group-hover:rotate-0 transition-transform">
                    <div className="flex flex-col gap-sm">
                      <div className="h-3 w-3/4 bg-surface-container rounded"></div>
                      <div className="h-3 w-1/2 bg-surface-container rounded"></div>
                      <div className="h-8 w-full bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-label-md">
                          {t("features.portal.nextAppointment")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="py-2xl bg-surface-container-low border-y border-outline-variant">
            <div className="max-w-5xl mx-auto px-gutter text-center">
              <span className="material-symbols-outlined text-primary text-[48px] mb-lg">
                format_quote
              </span>
              <blockquote className="text-headline-lg font-headline-lg text-on-surface italic leading-relaxed mb-xl transition-all duration-700 opacity-100 translate-y-0">
                &quot;{t("testimonial.quote")}&quot;
              </blockquote>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-sm border-2 border-primary">
                  <img
                    className="w-full h-full object-cover"
                    alt="Dr. Elena Sterling"
                    src={DOCTOR_IMG}
                  />
                </div>
                <cite className="not-italic">
                  <p className="text-headline-md font-headline-md text-on-surface">
                    {t("testimonial.name")}
                  </p>
                  <p className="text-label-md font-label-md text-primary uppercase">
                    {t("testimonial.role")}
                  </p>
                </cite>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-2xl px-gutter">
            <div className="max-w-7xl mx-auto bg-on-surface rounded-3xl p-2xl text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
              <div className="relative z-10">
                <h2 className="text-display-lg font-display-lg text-white mb-lg">
                  {t("cta.title")}
                </h2>
                <p className="text-body-lg font-body-lg text-surface-container-highest max-w-3xl mx-auto mb-2xl">
                  {t("cta.subtitle")}
                </p>
                <div className="flex flex-wrap justify-center gap-md">
                  <button className="px-2xl py-md bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-xl hover:bg-primary-container/90 transition-all">
                    {t("cta.startTrial")}
                  </button>
                  <button className="px-2xl py-md bg-white/10 text-white border border-white/20 font-headline-md text-headline-md rounded-xl hover:bg-white/20 transition-all">
                    {t("cta.speakExpert")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="bg-surface-container-highest border-t border-outline-variant">
          <div className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-start max-w-7xl mx-auto gap-xl">
            <div className="space-y-md max-w-prose">
              <div className="flex items-center gap-sm">
                <img
                  alt="Logo"
                  className="h-10 w-10 object-contain"
                  src={LOGO_IMG}
                />
                <span className="text-headline-md font-headline-md text-on-surface">
                  {t("brand")}
                </span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                {t("footer.tagline")}
              </p>
              <div className="flex gap-md">
                <div className="px-sm py-xs bg-white border border-outline-variant rounded flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    verified_user
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {t("footer.hipaa")}
                  </span>
                </div>
                <div className="px-sm py-xs bg-white border border-outline-variant rounded flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    security
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {t("footer.soc2")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-xl">
              <div className="space-y-sm transition-all duration-700 opacity-100 translate-y-0">
                <h4 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
                  {t("footer.product")}
                </h4>
                <ul className="space-y-xs">
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.features")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.integrations")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.pricing")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.changelog")}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-sm transition-all duration-700 opacity-100 translate-y-0">
                <h4 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
                  {t("footer.company")}
                </h4>
                <ul className="space-y-xs">
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.aboutUs")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.careers")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.contact")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.partners")}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-sm transition-all duration-700 opacity-100 translate-y-0">
                <h4 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
                  {t("footer.legal")}
                </h4>
                <ul className="space-y-xs">
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.privacy")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.terms")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.hipaaCompliance")}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary"
                      href="#"
                    >
                      {t("footer.accessibility")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-gutter py-lg border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              {t("footer.copyright")}
            </p>
            <div className="flex gap-lg">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}