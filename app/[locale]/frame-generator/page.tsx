import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { FrameGenerator } from "../../../components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("generator.seo");

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

export default function Generator() {
  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://framegenerator.net/frame-generator"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Frame Generator",
              operatingSystem: "Web",
              applicationCategory: "PhotoEditorApplication",
              description:
                "Create stunning, custom profile frames for LinkedIn, Facebook, and other social media easily and for free.",
              url: "https://framegenerator.net/frame-generator",
            }),
          }}
        />
      </Head>

      <FrameGenerator />
    </>
  );
}
