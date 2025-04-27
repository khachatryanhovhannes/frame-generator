"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "use-intl";

interface INavItemProps {
  href: string;
  tKey: string;
  onNavigate?: () => void;
}

function NavItem({ href, tKey, onNavigate }: INavItemProps) {
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
      onClick={onNavigate}
    >
      {t(tKey)}
    </Link>
  );
}

export default NavItem;
