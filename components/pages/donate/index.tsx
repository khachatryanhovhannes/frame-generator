import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { FaHeart } from "react-icons/fa";

export default async function DonatePage() {
  const t = await getTranslations("donate.content");

  return (
    <main className="px-4 base:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
      <section className="text-center min-h-[80vh] flex flex-col items-center justify-center gap-8 py-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text opacity-90">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground opacity-80 mb-8">
            {t("description")}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground opacity-80 mb-8">
            {t("description_second")}
          </p>

          <Link
            href="https://buymeacoffee.com/khachatryaq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 font-semibold px-8 py-3 rounded-lg shadow-md transition"
          >
            <FaHeart className="w-5 h-5" />
            {t("button")}
          </Link>
        </div>
      </section>
    </main>
  );
}
