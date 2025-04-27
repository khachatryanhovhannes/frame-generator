import Link from "next/link";
import React from "react";

interface IButtonProps {
  text: string;
  link: string;
}

function Button({ text, link }: IButtonProps) {
  return (
    <Link
      href={link}
      className="mt-6 inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
    >
      {text}
    </Link>
  );
}

export default Button;
