import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AboutPage } from "@/components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.seo");

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

export default function About() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://framegenerator.net/about" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "About Frame Generator",
              url: "https://framegenerator.net/about",
              description:
                "Learn more about Frame Generator, the tool helping users create stunning profile frames for LinkedIn, Facebook, and more.",
            }),
          }}
        />
      </Head>

      <AboutPage />
    </>
  );
}
