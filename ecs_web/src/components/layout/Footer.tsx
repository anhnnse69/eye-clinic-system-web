"use client"

import { useTranslations } from "next-intl"

const LOGO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCwR5I14Ti14lR3BYE4S0RtQO-d8r8udA0haqFhxTaWQ9yQ-jmxbSRgYSkcBkNwuYRPxAbe8JXfK0F1YyrjzCFly6Lq3OZKEvx1ur-E7AyiXkpaXAzTA7fU0BJWAs3bleQjIy9M4iQHcccCFbjJuDPzFrUn_bu0p0mQxPoyXF7BOJMQYc0C1GCWXA0JfldNcZ4O0CzfxkpvbMhmEFf6B_IaHns3GgbAB4_djZJGV8mIcaRS8VLHh7-bKrri-dHqeG15ux8Eq6zGs31k"

export default function Footer() {
  const t = useTranslations()

  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant">
      <div className="w-full py-xl px-gutter flex flex-col md:flex-row justify-between items-start max-w-7xl mx-auto gap-xl">
        <div className="space-y-md max-w-prose">
          <div className="flex items-center gap-sm">
            <img alt="Logo" className="h-10 w-10 object-contain" src={LOGO_IMG} />
            <span className="text-headline-md font-headline-md text-on-surface">
              {t("common.brand")}
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
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.features")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.integrations")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.pricing")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.changelog")}</a></li>
            </ul>
          </div>

          <div className="space-y-sm transition-all duration-700 opacity-100 translate-y-0">
            <h4 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
              {t("footer.company")}
            </h4>
            <ul className="space-y-xs">
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.aboutUs")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.careers")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.contact")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.partners")}</a></li>
            </ul>
          </div>

          <div className="space-y-sm transition-all duration-700 opacity-100 translate-y-0">
            <h4 className="text-label-md font-label-md text-on-surface uppercase tracking-wider">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-xs">
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.privacy")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.terms")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.hipaaCompliance")}</a></li>
              <li><a className="text-body-sm font-body-sm text-on-surface-variant hover:text-primary" href="#">{t("footer.accessibility")}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-gutter py-lg border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="text-body-sm font-body-sm text-on-surface-variant">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  )
}