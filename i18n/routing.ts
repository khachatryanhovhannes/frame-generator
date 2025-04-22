import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "hy"],

  defaultLocale: "en",
  localePrefix: "as-needed",
  pathnames: {
    "/": {
      en: "/",
      hy: "/",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type RouteType = keyof typeof routing.pathnames;
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
