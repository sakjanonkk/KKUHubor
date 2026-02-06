"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SlidersHorizontal,
  Star,
  ArrowUpDown,
  Building2,
  MessageSquare,
  GraduationCap,
  ClipboardList,
  X,
  BookOpen,
  Target,
  Sparkles,
  LayoutGrid,
  Activity,
  CheckCircle2,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Binary,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

// Filter options
const CATEGORIES = [
  {
    value: "GENERAL",
    labelKey: "generalEd",
    icon: <BookOpen className="h-5 w-5 text-blue-500" />,
  },
  {
    value: "MAJOR",
    labelKey: "major",
    icon: <Target className="h-5 w-5 text-red-500" />,
  },
  {
    value: "ELECTIVE",
    labelKey: "elective",
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
  },
  {
    value: "FREE_ELECTIVE",
    labelKey: "freeElective",
    icon: <LayoutGrid className="h-5 w-5 text-emerald-500" />,
  },
];

const GRADING_TYPES = [
  {
    value: "NORM",
    labelKey: "normRef",
    descKey: "normRefDesc",
    icon: <Activity className="h-6 w-6 text-orange-500" />,
  },
  {
    value: "CRITERION",
    labelKey: "criterionRef",
    descKey: "criterionRefDesc",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
];

const SORT_OPTIONS = [
  {
    value: "reviews_desc",
    labelKey: "mostReviews",
    icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
  },
  {
    value: "rating_desc",
    labelKey: "highestRated",
    icon: <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />,
  },
  {
    value: "rating_asc",
    labelKey: "lowestRated",
    icon: <TrendingDown className="h-5 w-5 text-red-500" />,
  },
  {
    value: "name_asc",
    labelKey: "nameAZ",
    icon: <ArrowUpDown className="h-5 w-5 text-blue-400" />,
  },
  {
    value: "code_asc",
    labelKey: "codeAZ",
    icon: <Binary className="h-5 w-5 text-slate-500" />,
  },
];

interface Faculty {
  faculty_id: number;
  name_th: string;
}

export function CourseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Filter");

  const [category, setCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [gradingType, setGradingType] = useState<string>(
    searchParams.get("gradingType") || ""
  );
  const [facultyId, setFacultyId] = useState<string>(
    searchParams.get("facultyId") || "all"
  );
  const [minRating, setMinRating] = useState<number>(
    parseInt(searchParams.get("minRating") || "0", 10)
  );
  const [hasReviews, setHasReviews] = useState<boolean>(
    searchParams.get("hasReviews") === "true"
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "reviews_desc"
  );

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch faculties on mount
  useEffect(() => {
    async function fetchFaculties() {
      try {
        const response = await fetch("/api/faculties");
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Failed to fetch faculties:", error);
      }
    }
    fetchFaculties();
  }, []);

  // Count active filters
  const activeFilterCount = [
    category,
    gradingType,
    facultyId !== "all" ? facultyId : "",
    minRating > 0 ? String(minRating) : "",
    hasReviews,
    sortBy !== "reviews_desc" ? sortBy : "",
  ].filter(Boolean).length;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) params.set("category", category);
    else params.delete("category");

    if (gradingType) params.set("gradingType", gradingType);
    else params.delete("gradingType");

    if (facultyId && facultyId !== "all") params.set("facultyId", facultyId);
    else params.delete("facultyId");

    if (minRating > 0) params.set("minRating", String(minRating));
    else params.delete("minRating");

    if (hasReviews) params.set("hasReviews", "true");
    else params.delete("hasReviews");

    if (sortBy && sortBy !== "reviews_desc") params.set("sortBy", sortBy);
    else params.delete("sortBy");

    router.push(`/${locale}/courses?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setCategory("");
    setGradingType("");
    setFacultyId("all");
    setMinRating(0);
    setHasReviews(false);
    setSortBy("reviews_desc");

    const params = new URLSearchParams();
    const query = searchParams.get("query");
    if (query) params.set("query", query);

    router.push(`/${locale}/courses?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{t("button")}</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-primary/25 animate-in zoom-in-50">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l-0 shadow-2xl p-0">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

        <SheetHeader className="text-left px-6 py-6 border-b space-y-1">
          <SheetTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            {t("title")}
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground/80">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 space-y-8 pb-24">
          {/* Sort By Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <ArrowUpDown className="h-4 w-4" />
              {t("sortBy")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SORT_OPTIONS.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left relative overflow-hidden group",
                    idx === SORT_OPTIONS.length - 1 && SORT_OPTIONS.length % 2 !== 0 && "col-span-2",
                    sortBy === option.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-transparent bg-muted/40 hover:bg-muted hover:scale-[1.02]"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors duration-200 shrink-0",
                      sortBy === option.value
                        ? "bg-primary/10"
                        : "bg-background"
                    )}
                  >
                    {option.icon}
                  </div>
                  <span className="truncate font-semibold">{t(option.labelKey)}</span>
                  {sortBy === option.value && (
                    <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Has Reviews Toggle */}
          <section className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100/50 dark:border-emerald-900/50 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <Label className="text-base font-bold cursor-pointer block mb-1">
                    {t("hasReviewsOnly")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("hasReviewsDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={hasReviews}
                onCheckedChange={setHasReviews}
                className="data-[state=checked]:bg-emerald-500 scale-110"
              />
            </div>
          </section>

          {/* Faculty Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <Building2 className="h-4 w-4" />
              {t("faculty")}
            </div>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger className="h-12 border-input bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-colors rounded-xl px-4 text-base">
                <SelectValue placeholder={t("allFaculties")} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all" className="font-medium py-3">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="ml-1">{t("allFaculties")}</span>
                  </span>
                </SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem
                    key={faculty.faculty_id}
                    value={String(faculty.faculty_id)}
                    className="py-2.5"
                  >
                    {faculty.name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Rating Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <Star className="h-4 w-4" />
              {t("minRating")}
            </div>
            <div className="flex gap-2 p-1.5 bg-muted/30 rounded-xl border border-border/50">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-medium transition-all text-sm relative",
                    minRating === rating
                      ? "bg-background text-yellow-600 dark:text-yellow-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {rating === 0 ? (
                    t("any")
                  ) : (
                    <span className="flex flex-col items-center justify-center gap-1">
                      <span className="font-bold text-base">{rating}</span>
                      <Star
                        className={cn(
                          "h-3 w-3",
                          minRating === rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-current opacity-30"
                        )}
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Category Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <GraduationCap className="h-4 w-4" />
              {t("category")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCategory("")}
                className={cn(
                  "col-span-2 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                  category === ""
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-muted/40 hover:bg-muted hover:scale-[1.02]"
                )}
              >
                <div className="p-2 bg-background rounded-lg shadow-sm">
                  <ClipboardList
                    className={cn(
                      "h-5 w-5",
                      category === "" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <span>{t("allCategories")}</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                    category === cat.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                      : "border-transparent bg-muted/40 hover:bg-muted hover:scale-[1.02]"
                  )}
                >
                  <div className="p-2 bg-background rounded-lg shadow-sm">
                    {cat.icon}
                  </div>
                  <span className="truncate">{t(cat.labelKey)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Grading Type Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
              <ClipboardList className="h-4 w-4" />
              {t("gradingType")}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setGradingType("")}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all duration-200",
                  gradingType === ""
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-muted/40 hover:bg-muted hover:scale-[1.01]"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <ClipboardList
                    className={cn(
                      "h-6 w-6",
                      gradingType === ""
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <div
                    className={cn(
                      "font-bold text-sm mb-0.5",
                      gradingType === "" ? "text-primary" : "text-foreground"
                    )}
                  >
                    {t("allTypes")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("allTypesDesc")}
                  </div>
                </div>
              </button>
              {GRADING_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setGradingType(type.value)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all duration-200",
                    gradingType === type.value
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-transparent bg-muted/40 hover:bg-muted hover:scale-[1.01]"
                  )}
                >
                  <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                    {type.icon}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "font-bold text-sm mb-0.5",
                        gradingType === type.value
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {t(type.labelKey)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(type.descKey)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t p-6 gap-3 sm:gap-3 sticky bottom-0 bg-background/95 backdrop-blur z-20">
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 rounded-xl h-12"
            >
              <X className="h-4 w-4" />
              {t("clear")} ({activeFilterCount})
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="flex-1 gap-2 font-bold rounded-xl h-12 shadow-lg shadow-primary/20"
          >
            {t("apply")}
            <span className="ml-1 opacity-60">
              {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
