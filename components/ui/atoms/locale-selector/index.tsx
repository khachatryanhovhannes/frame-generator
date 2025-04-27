"use client";
import { GrLanguage } from "react-icons/gr";
import { Link, routing, usePathname } from "@/i18n/routing";
import { useState, useEffect, useRef } from "react";

export default function LocaleSelector() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const localeInfo = {
    en: { native: "English", default: "English" },
    hy: { native: "Հայերեն", default: "Armenian" },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-background text-text hover:scale-110 transition-all shadow cursor-pointer"
        aria-label="Toggle language selector"
      >
        <GrLanguage />
      </button>

      {isOpen && (
        <div className="absolute translate-y-3 right-0 text-primary z-50 bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
          <ul className="flex flex-col divide-y divide-gray-200">
            {routing.locales.map((locale) => (
              <Link key={locale} href={pathname} locale={locale}>
                <li className="flex flex-col items-start justify-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <h2 className="text-md font-medium text-neutral-950">
                    {localeInfo[locale].native}
                  </h2>
                  <p className="text-xs text-neutral-600">
                    {localeInfo[locale].default}
                  </p>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
