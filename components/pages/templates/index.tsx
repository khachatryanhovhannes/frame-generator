import { Button } from "@/components/ui/atoms";
import { getTranslations } from "next-intl/server";

export default async function TemplatesPage() {
  const t = await getTranslations("templates");

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
        {t("comingSoonTitle")}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground opacity-80 max-w-2xl mb-8">
        {t("comingSoonDescription")}
      </p>
      <Button text={t("backToHome")} link="/" />
    </main>
  );
}
