"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SearchResult {
  course_code: string;
  name_th: string;
  name_en: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = () => {
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/courses?query=${encodeURIComponent(query)}`);
    } else {
      router.push("/courses");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectResult = (code: string) => {
    router.push(`/courses/${code}`);
    setShowDropdown(false);
    setQuery("");
  };

  const t = useTranslations("Common");

  return (
    <div className="relative w-full max-w-xl" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-10 h-12 text-base shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
          />
        </div>
        <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
          {t("searchButton")}
        </Button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-lg shadow-lg border z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
          <div className="max-h-[300px] overflow-y-auto p-1">
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
      )}
    </div>
  );
}
