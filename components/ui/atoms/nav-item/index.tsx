"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "use-intl";

interface INavItemProps {
  href: string;
  tKey: string;
}

function NavItem({ href, tKey }: INavItemProps) {
  const t = useTranslations("navbar");
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`inline-block transform transition-transform duration-200
        ${isActive ? "font-semibold" : ""}
        hover:scale-105
        hover:opacity-95
        px-2 py-1
      `}
    >
      {t(tKey)}
    </Link>
  );
}

export default NavItem;
