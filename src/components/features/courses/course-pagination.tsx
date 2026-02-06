"use client";

import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface CoursePaginationProps {
  totalPages: number;
  currentPage: number;
}

export function CoursePagination({
  totalPages,
  currentPage,
}: CoursePaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Courses");

  if (totalPages <= 1) return null;

  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // Generate page numbers to show
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("previous")}</span>
          </Link>
        ) : (
          <span className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("previous")}</span>
          </span>
        )}
      </Button>

      <div className="flex items-center gap-1 mx-2">
        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="sm"
              className="w-9 h-9 p-0"
              asChild={page !== currentPage}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={createPageUrl(page)}>{page}</Link>
              )}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} className="flex items-center gap-1">
            <span className="hidden sm:inline">{t("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">{t("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
