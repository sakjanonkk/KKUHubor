"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterItem {
  key: string;
  label: string;
}

interface ActiveFiltersProps {
  filters: FilterItem[];
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Courses");

  if (filters.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page"); // Reset pagination
    router.push(`/${locale}/courses?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(`/${locale}/courses`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="text-sm text-muted-foreground font-medium">
        {t("activeFilters")}
      </span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="text-xs px-2.5 py-1 gap-1.5 group cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => removeFilter(filter.key)}
        >
          {filter.label}
          <X className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Badge>
      ))}
      {filters.length >= 2 && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
