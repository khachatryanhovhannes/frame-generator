import { getTranslations } from "next-intl/server";
import { FaLinkedin } from "react-icons/fa";
import { Link } from "@/i18n/routing";

export default async function ContactPage() {
  const t = await getTranslations("contact.hero");

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

          <Link
            href="https://www.linkedin.com/company/106869066/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0077B5] hover:bg-[#006097] text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
          >
            <FaLinkedin className="w-5 h-5" />
            {t("linkedinButton")}
          </Link>
        </div>
      </section>
    </main>
  );
}
