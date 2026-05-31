import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="checkbox"
          className={`w-4 h-4 rounded border border-neutral-300 appearance-none cursor-pointer accent-primary-600 checked:bg-primary-600 checked:border-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-colors ${className}`}
          {...props}
        />
        {props.checked && (
          <Check className="absolute inset-0 w-4 h-4 text-white pointer-events-none" />
        )}
      </div>
      {label && <label className="text-sm text-neutral-900 cursor-pointer">{label}</label>}
    </div>
  );
}
