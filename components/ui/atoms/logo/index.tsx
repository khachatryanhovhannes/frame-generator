"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
function Logo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    theme === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png";

  return (
    <Link href="/">
      <div>
        <Image
          src={mounted ? logoSrc : "/images/logo-light.png"}
          alt="Frame Generator Logo"
          width={150}
          height={50}
          priority
        />
      </div>
    </Link>
  );
}

export default Logo;
