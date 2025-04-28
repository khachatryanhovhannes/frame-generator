import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ContactPage } from "@/components/pages";
import Head from "next/head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact.seo");

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

export default function Contact() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://framegenerator.net/contact" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              name: "Contact Frame Generator",
              url: "https://framegenerator.net/contact",
              description:
                "Get in touch with the Frame Generator team for support, feedback, or inquiries.",
            }),
          }}
        />
      </Head>

      <ContactPage />
    </>
  );
}
