import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { DonatePage } from "@/components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("donate.seo");

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

export default function Donate() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://framegenerator.net/donate" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Support Frame Generator",
              url: "https://framegenerator.net/donate",
              description:
                "Support the Frame Generator project and help us create more awesome tools for LinkedIn and social media users!",
            }),
          }}
        />
      </Head>

      <DonatePage />
    </>
  );
}
