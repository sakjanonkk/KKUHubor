"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Home,
  BookOpen,
  ShieldCheck,
  Heart,
  Languages,
  Search,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { UserIdentityDialog } from "@/components/features/user/user-identity-dialog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchBar } from "@/components/features/search-bar";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("courses"), href: "/courses", icon: BookOpen },
    { name: t("bookmarks"), href: "/bookmarks", icon: Heart },
    ...(isAdmin
      ? [{ name: t("admin"), href: "/admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight">
          {t("brand")}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
          <SearchBar variant="navbar" />
          <UserIdentityDialog />
          <LanguageSwitcher />
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1">
          {/* Mobile Search */}
          <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/50"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto border-b shadow-lg p-0 bg-background/95 backdrop-blur-xl">
              <div className="p-4 pt-10">
                <SearchBar variant="hero" onSelect={() => setMobileSearchOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-muted/50"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-l-0 shadow-2xl p-0 bg-background/95 backdrop-blur-xl"
            >
              {/* Background Gradients */}
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 blur-[80px] rounded-full pointer-events-none -z-10" />
              <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-violet-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

              <div className="flex flex-col h-full">
                <SheetHeader className="p-6 text-left border-b">
                  <SheetTitle className="font-bold text-2xl tracking-tight flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    {t("brand")}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <div className="flex flex-col gap-3">
                    <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {t("menu")}
                    </div>
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-base font-medium",
                            pathname === item.href
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              pathname === item.href
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  <Separator className="my-6 opacity-50" />

                  <div className="space-y-4">
                    <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("settings")}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <Languages className="h-4 w-4 text-orange-500" />
                        </div>
                        <span className="font-medium text-sm">{t("language")}</span>
                      </div>
                      <LanguageSwitcher />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <Heart className="h-4 w-4 text-rose-500" />
                        </div>
                        <span className="font-medium text-sm">
                          {t("theme")}
                        </span>
                      </div>
                      <ModeToggle />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="font-medium text-sm">
                          {t("identity")}
                        </span>
                      </div>
                      <UserIdentityDialog />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-muted/10">
                  <p className="text-xs text-center text-muted-foreground/60">
                    © 2024 KKUHubor. All rights reserved.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
