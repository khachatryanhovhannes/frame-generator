import { Button, LinkedinButton } from "@/components/ui/atoms";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="px-4 base:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
      <section className="text-center min-h-[80vh] flex flex-col items-center justify-center gap-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
          {t("hero.title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground opacity-80 max-w-2xl">
          {t("hero.description")}
        </p>
        <div className="flex justify-center items-center gap-5 sm:flex-row flex-col">
          <Button text={t("hero.startButton")} link="/frame-generator" />
          <LinkedinButton />
        </div>
      </section>

      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {t("examples.title")}
          </h2>
          <p className="text-muted-foreground opacity-80 max-w-2xl mx-auto">
            {t("examples.description")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {["example1", "example2", "example3", "example4", "example5"].map(
            (img, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-full shadow-2xl"
              >
                <Image
                  src={`/images/${img}.png`}
                  alt={`Example Frame ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )
          )}
        </div>

        <div className="w-full flex justify-center">
          <Button
            text={t("examples.browseTemplatesButton")}
            link="/templates"
          />
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="bg-primary rounded-xl p-10 shadow-lg max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg mb-8 text-muted-foreground opacity-80">
            {t("cta.description")}
          </p>
          <Button text={t("hero.startButton")} link="/frame-generator" />
        </div>
      </section>
    </main>
  );
}
