"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

interface SearchResult {
  course_code: string;
  name_th: string;
  name_en: string;
}

interface SearchBarProps {
  variant?: "hero" | "navbar";
  onSelect?: () => void;
}

export function SearchBar({ variant = "hero", onSelect }: SearchBarProps) {
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("Common");

  const isNavbar = variant === "navbar";

  const collapseSearch = useCallback(() => {
    setExpanded(false);
    setShowDropdown(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        if (isNavbar && !query.trim()) {
          collapseSearch();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavbar, query, collapseSearch]);

  useEffect(() => {
    if (isNavbar) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && expanded) {
          collapseSearch();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isNavbar, expanded, collapseSearch]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchResults();
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = () => {
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/${locale}/courses?query=${encodeURIComponent(query)}`);
    } else {
      router.push(`/${locale}/courses`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectResult = (code: string) => {
    router.push(`/${locale}/courses/${code}`);
    setShowDropdown(false);
    setQuery("");
    if (isNavbar) collapseSearch();
    onSelect?.();
  };

  const autocompleteDropdown = showDropdown && query.trim().length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-lg shadow-lg border z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
      <div className="max-h-75 overflow-y-auto p-1">
        {loading ? (
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t("searching")}
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-1">
            {results.map((course) => (
              <button
                key={course.course_code}
                onClick={() => handleSelectResult(course.course_code)}
                className="flex flex-col items-start px-4 py-3 text-left hover:bg-muted/50 rounded-md transition-colors w-full group"
              >
                <div className="flex items-center w-full mb-1">
                  <BookOpen className="h-4 w-4 mr-2 text-primary opacity-70 group-hover:opacity-100" />
                  <span className="font-semibold text-sm bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-mono">
                    {course.course_code}
                  </span>
                </div>
                <span className="text-sm font-medium truncate w-full pl-6">
                  {course.name_en}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full pl-6">
                  {course.name_th}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </div>
        )}
      </div>
    </div>
  );

  // Navbar: expandable icon → input
  if (isNavbar) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center">
          {!expanded ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setExpanded(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="hover:bg-muted/50"
            >
              <Search className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t("searchButton")}</span>
            </Button>
          ) : (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder={t("searchPlaceholder")}
                className="h-9 w-60 text-sm bg-muted/40 border-border/50 focus:bg-background pl-9 pr-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  if (e.key === "Enter") {
                    collapseSearch();
                    onSelect?.();
                  }
                }}
                onFocus={() => {
                  if (query.trim()) setShowDropdown(true);
                }}
              />
              <button
                onClick={collapseSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {autocompleteDropdown}
      </div>
    );
  }

  // Hero: always visible input with search button
  return (
    <div className={cn("relative w-full max-w-xl")} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 h-12! text-base shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              handleKeyDown(e);
              if (e.key === "Enter") onSelect?.();
            }}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
          />
        </div>
        <Button size="lg" className="h-12! px-8" onClick={handleSearch}>
          {t("searchButton")}
        </Button>
      </div>
      {autocompleteDropdown}
    </div>
  );
}
