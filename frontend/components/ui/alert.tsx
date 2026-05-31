import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AlertDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function Alert({ variant = "default", title, children, onClose, className = "" }: AlertProps) {
  const variants = {
    default: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "text-blue-900",
      text: "text-blue-800",
      icon: Info,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      title: "text-green-900",
      text: "text-green-800",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      title: "text-yellow-900",
      text: "text-yellow-800",
      icon: AlertCircle,
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      title: "text-red-900",
      text: "text-red-800",
      icon: XCircle,
    },
    info: {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      title: "text-cyan-900",
      text: "text-cyan-800",
      icon: Info,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
      <div className="flex-1">
        {title && <h4 className={`font-semibold ${config.title}`}>{title}</h4>}
        <div className={`text-sm ${config.text}`}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
