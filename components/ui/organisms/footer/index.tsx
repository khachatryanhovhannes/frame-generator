import { Link } from "@/i18n/routing";
import { Logo } from "../../atoms";
import { LinkedinButton } from "@/components/ui/atoms";

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-muted-foreground py-8 px-4 base:px-6 md:px-12 lg:px-20 xl:px-28 2xl:px-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center text-sm">
        <Logo />
        <p className="text-center mt-6 opacity-70 hidden md:block">
          © {new Date().getFullYear()}{" "}
          <Link href="frame-generator">Frame Generator</Link>. All rights
          reserved.
        </p>
        <LinkedinButton />
        <p className="text-center mt-6 opacity-70 block md:hidden">
          © {new Date().getFullYear()}{" "}
          <Link href="frame-generator">Frame Generator</Link>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
