import { Link } from "@/i18n/routing";
import { FaLinkedin } from "react-icons/fa";
import { getTranslations } from "next-intl/server";

async function LinkedinButton() {
  const t = await getTranslations("home.hero");
  return (
    <Link
      href="https://www.linkedin.com/company/106869066/"
      className="mt-6 inline-flex items-center gap-2 bg-[#0077B5] hover:bg-[#006097] text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaLinkedin className="w-5 h-5" />
      {t("linkedinButton")}
    </Link>
  );
}

export default LinkedinButton;
