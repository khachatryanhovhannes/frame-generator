/**
 * Color picker component for color property controls
 * Provides a styled color input with label
 */

import React from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ColorPicker({
  label,
  value,
  onChange,
  className = "",
}: ColorPickerProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-text/70">{label}</label>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg border-2 border-secondary/50 bg-secondary cursor-pointer"
        />
        <div
          className="absolute inset-2 rounded pointer-events-none"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
