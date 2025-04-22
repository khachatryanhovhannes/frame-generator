import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("about.seo.title"),
    description: t("about.seo.description"),
    keywords: t("about.seo.keywords"),
    openGraph: {
      title: t("about.seo.openGraph.title"),
      description: t("about.seo.openGraph.description"),
      siteName: t("about.seo.openGraph.siteName"),
      images: [
        {
          url: "https://framegenerator.net/logo.png",
          width: 1200,
          height: 630,
          alt: t("about.seo.openGraph.imageAlt"),
        },
      ],
      locale: t("about.seo.ogLocale"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("about.seo.twitter.title"),
      description: t("about.seo.twitter.description"),
      images: ["https://framegenerator.net/logo.png"],
    },
    metadataBase: new URL("https://framegenerator.net"),
  };
}

export default function About() {
  return <div>About Page</div>;
}
