/**
 * Action button component for banner editor toolbar
 * Provides consistent styling for toolbar buttons with icons and tooltips
 */

import React from "react";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  tooltip?: string;
  className?: string;
}

const variantStyles = {
  primary: "bg-green-600 hover:bg-green-700 text-white",
  secondary: "bg-background hover:bg-background/80 text-text",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
};

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = "secondary",
  tooltip,
  className = "",
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip || label}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
        transition-all duration-200 text-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
