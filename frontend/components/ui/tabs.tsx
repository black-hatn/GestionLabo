"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  const currentTab = value !== undefined ? value : activeTab;
  const setTab = onValueChange !== undefined ? onValueChange : setActiveTab;

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            currentTab,
            setTab,
          } as Record<string, unknown>);

        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  currentTab?: string;
  setTab?: (value: string) => void;
}

export function TabsList({ children, className, currentTab, setTab }: TabsListProps) {
  return (
    <div className={cn("flex space-x-1 rounded-xl bg-neutral-100 p-1 border border-neutral-200", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            currentTab,
            setTab,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  currentTab?: string;
  setTab?: (value: string) => void;
}

export function TabsTrigger({ value, children, className, currentTab, setTab }: TabsTriggerProps) {
  const isActive = currentTab === value;

  return (
    <button
      onClick={() => setTab?.(value)}
      className={cn(
        "w-full rounded-lg py-2.5 text-sm font-semibold leading-5 text-neutral-600 transition-all focus:outline-none",
        isActive
          ? "bg-white text-primary-700 shadow-sm border border-neutral-200/50"
          : "hover:bg-white/40 hover:text-neutral-900",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  currentTab?: string;
}

export function TabsContent({ value, children, className, currentTab }: TabsContentProps) {
  if (currentTab !== value) return null;

  return (
    <div className={cn("mt-4 focus:outline-none animate-fade-in", className)}>
      {children}
    </div>
  );
}
