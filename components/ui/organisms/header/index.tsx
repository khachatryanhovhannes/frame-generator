"use client";
import { useState } from "react";
import { LocaleSelector, Logo, ThemeSwitcher } from "../../atoms";
import { Navbar } from "../../molecules";
import { Menu, X } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-primary flex justify-between items-center py-4 relative px-4 base:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
      <Logo />

      <div className="hidden md:flex items-center gap-4">
        <Navbar />
        <ThemeSwitcher />
        <LocaleSelector />
      </div>

      <div className="flex md:hidden items-center gap-4">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full bg-background text-text hover:scale-110 transition-all shadow"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-primary shadow-md z-[999] transform transition-transform duration-300
    ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
  `}
      >
        <div className="flex flex-col items-start gap-6 p-6 pt-20">
          <Navbar onNavigate={() => setIsMenuOpen(false)} />
          <div className="flex justify-center w-full gap-5">
            <ThemeSwitcher />
            <LocaleSelector />
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black opacity-80 z-[80]"
        />
      )}
    </header>
  );
}

export default Header;
