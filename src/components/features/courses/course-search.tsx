"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function CourseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Courses");

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  // Track the latest query to avoid stale closures in debounce
  const latestQueryRef = useRef(query);
  // Track if change is from user typing vs URL sync to avoid feedback loops
  const isUserTypingRef = useRef(false);

  // Sync state when URL params change externally (e.g. clearing from ActiveFilters)
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setQuery(searchParams.get("query") || "");
    }
    isUserTypingRef.current = false;
  }, [searchParams]);

  const navigate = useCallback(
    (searchQuery: string) => {
      // Race condition guard: only navigate if this matches the latest input
      if (searchQuery !== latestQueryRef.current) return;

      isUserTypingRef.current = true;
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
      } else {
        params.delete("query");
      }
      params.delete("page"); // Reset to page 1 on search
      router.push(`/${locale}/courses?${params.toString()}`);
    },
    [router, locale, searchParams]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    latestQueryRef.current = value;
    isUserTypingRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate(value);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      latestQueryRef.current = query;
      navigate(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    latestQueryRef.current = "";
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate("");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t("searchPlaceholder")}
        className="pl-10 pr-9 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl shadow-md"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
