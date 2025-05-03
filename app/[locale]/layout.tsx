import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Locale } from "../../i18n/routing";
import { ThemeProvider } from "next-themes";
import { Footer, Header } from "@/components/ui/organisms";
import type { Metadata } from "next";
import "../globals.css";
import BackToTop from "@/components/ui/atoms/back-to-top";
import Script from "next/script";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("seo.title"),
    description: t("seo.description"),
    keywords: t("seo.keywords"),
    openGraph: {
      title: t("seo.openGraph.title"),
      description: t("seo.openGraph.description"),
      siteName: t("seo.openGraph.siteName"),
      images: [
        {
          url: "https://framegenerator.net/logo.png",
          width: 1200,
          height: 630,
          alt: t("seo.openGraph.imageAlt"),
        },
      ],
      locale: t("seo.ogLocale"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("seo.twitter.title"),
      description: t("seo.twitter.description"),
      images: ["https://framegenerator.net/logo.png"],
    },
    metadataBase: new URL("https://framegenerator.net"),
  };
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const locale = await params?.locale;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://framegenerator.net/" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-L4WR2S8F41`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L4WR2S8F41');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Frame Generator",
              url: "https://framegenerator.net",
              description:
                "Generate professional profile picture frames in seconds. Perfect for LinkedIn, Facebook, job applications, and more.",
            }),
          }}
        />
      </head>
      <body className="font-sans-armenian bg-background">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Footer />
            <BackToTop />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
