"use client";

import { Link } from "@/i18n/routing";
import { Home, Bookmark, Info, BookOpen } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navbar");

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2 w-fit">
              <Image src="/logo.png" alt="KKUHubor" width={32} height={32} className="rounded-lg" />
              {tNav("brand")}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {t("description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t("quickLinks")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <Home className="h-3.5 w-3.5" />
                {tNav("home")}
              </Link>
              <Link
                href="/courses"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {tNav("courses")}
              </Link>
              <Link
                href="/bookmarks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {tNav("bookmarks")}
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <Info className="h-3.5 w-3.5" />
                {tNav("about")}
              </Link>
            </nav>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t("settings")}
            </h3>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} KKUHubor. {t("builtFor")}
          </p>
        </div>
      </div>
    </footer>
  );
}
