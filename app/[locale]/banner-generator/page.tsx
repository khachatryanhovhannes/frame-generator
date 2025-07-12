import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { BannerGenerator } from "@/components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("bannerCreator.seo");

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
      locale: t("openGraph.ogLocale"),
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

export default function BannerGeneratorPage() {
  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://framegenerator.net/banner-generator"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Banner Creator",
              operatingSystem: "Web",
              applicationCategory: "DesignApplication",
              description:
                "Create stunning custom banners for social media platforms like LinkedIn, Facebook, Twitter, and YouTube easily and for free.",
              url: "https://framegenerator.net/banner-generator",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "1250",
              },
            }),
          }}
        />
      </Head>

      <BannerGenerator />
    </>
  );
}
