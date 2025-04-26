import React from "react";
import { NAVBAR } from "@/constants";
import { NavItem } from "../../atoms";

function Navbar() {
  return (
    <nav className="w-full flex gap-3 md:flex-row flex-col text-center">
      {NAVBAR.map((item) => (
        <NavItem key={item.key} tKey={item.key} href={item.href} />
      ))}
    </nav>
  );
}

export default Navbar;
