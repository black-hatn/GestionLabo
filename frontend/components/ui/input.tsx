import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-900">
          {label}
          {props.required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors",
            "border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400",
            "dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "dark:focus-visible:ring-blue-500 dark:focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger-500 focus-visible:ring-danger-500",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
      {helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
    </div>
  )
)
Input.displayName = "Input"

export { Input }
