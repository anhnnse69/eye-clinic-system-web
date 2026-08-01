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
  )
}