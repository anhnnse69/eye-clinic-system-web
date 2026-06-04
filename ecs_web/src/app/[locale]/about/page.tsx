import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations()
  
  return (
    <div className="container mx-auto py-8">
      <h1>{t("about.title")}</h1>
      <p>{t("about.description")}</p>
    </div>
  )
}
