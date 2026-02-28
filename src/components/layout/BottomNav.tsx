"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "首页", icon: Home, color: "bg-accent-mint" },
  { href: "/insights", label: "洞察", icon: BarChart3, color: "bg-accent-lavender" },
  { href: "/profile", label: "我的", icon: User, color: "bg-accent-cream" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed z-50 bg-background",
        "bottom-0 left-0 right-0 border-t border-foreground/20",
        "lg:top-0 lg:bottom-0 lg:left-0 lg:right-auto lg:w-56 lg:border-t-0 lg:border-r-0 lg:p-4"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div
        className={cn(
          "flex h-14 items-center justify-around",
          "lg:h-auto lg:flex-col lg:items-stretch lg:justify-start lg:gap-2 lg:rounded-3xl lg:border-2 lg:border-foreground/80 lg:bg-content-bg lg:p-4 lg:pt-6"
        )}
      >
        <div className="hidden lg:block lg:mb-4 lg:px-2">
          <h2 className="text-lg font-bold">MoodLens</h2>
        </div>
        {tabs.map(({ href, label, icon: Icon, color }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center gap-0.5 px-4 py-2 text-xs transition-all",
                "flex-col",
                "lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:border-2 lg:px-3 lg:py-3 lg:text-sm",
                isActive
                  ? cn("text-foreground lg:border-foreground/80 lg:bg-card", color && `lg:${color}`)
                  : "text-muted-foreground hover:text-foreground lg:border-transparent lg:hover:border-foreground/40 lg:hover:bg-card/50"
              )}
            >
              <div className={cn(
                "flex items-center justify-center",
                "lg:h-8 lg:w-8 lg:rounded-lg",
                isActive && color
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="lg:font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
