/**
 * File upload button component for image uploads
 * Provides consistent styling for file input buttons with icons and tooltips
 */

"use client";

import React, { useRef } from "react";
import { LucideIcon } from "lucide-react";

interface FileUploadButtonProps {
  icon: LucideIcon;
  label: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  tooltip?: string;
  className?: string;
}

const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
};

export default function FileUploadButton({
  icon: Icon,
  label,
  accept = "*",
  onChange,
  variant = "secondary",
  tooltip,
  className = "",
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={tooltip || label}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
          transition-all duration-200 text-sm cursor-pointer
          ${variantStyles[variant]}
          ${className}
        `}
      >
        <Icon size={18} />
        <span className="hidden sm:inline">{label}</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        aria-label={label}
      />
    </>
  );
}
