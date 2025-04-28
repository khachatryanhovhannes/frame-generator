import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { TemplatesPage } from "@/components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates.seo");

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      siteName: t("openGraph.siteName"),
      images: [
        {
          url: "https://framegenerator.net/logo.png",
          width: 1200,
          height: 630,
          alt: t("openGraph.imageAlt"),
        },
      ],
      locale: t("ogLocale"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: ["https://framegenerator.net/logo.png"],
    },
    metadataBase: new URL("https://framegenerator.net"),
  };
}

export default function Templates() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://framegenerator.net/templates" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Templates - Frame Generator",
              url: "https://framegenerator.net/templates",
              description:
                "Explore a collection of ready-made LinkedIn profile frame templates. Choose your style and generate your profile frame instantly!",
            }),
          }}
        />
      </Head>

      <TemplatesPage />
    </>
  );
}
