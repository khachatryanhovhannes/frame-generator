/**
 * Checkbox component for boolean property controls
 * Provides consistent styling for checkbox inputs with labels
 */

import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  className = "",
}: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-green-600 bg-secondary border-secondary/50 rounded focus:ring-green-500 focus:ring-2"
      />
      <span className="text-sm text-text/70">{label}</span>
    </label>
  );
}
