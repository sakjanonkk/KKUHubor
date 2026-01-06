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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Filter options
const CATEGORIES = [
  { value: "GENERAL", label: "General Education", emoji: "📚" },
  { value: "MAJOR", label: "Major", emoji: "🎯" },
  { value: "ELECTIVE", label: "Elective", emoji: "✨" },
  { value: "FREE_ELECTIVE", label: "Free Elective", emoji: "🆓" },
];

const GRADING_TYPES = [
  { value: "NORM", label: "Norm-referenced", description: "Curve grading" },
  {
    value: "CRITERION",
    label: "Criterion-referenced",
    description: "Fixed criteria",
  },
];

const SORT_OPTIONS = [
  { value: "reviews_desc", label: "Most Reviews", icon: "📊" },
  { value: "rating_desc", label: "Highest Rated", icon: "⭐" },
  { value: "rating_asc", label: "Lowest Rated", icon: "📉" },
  { value: "name_asc", label: "Name (A-Z)", icon: "🔤" },
  { value: "code_asc", label: "Code (A-Z)", icon: "🔢" },
];

interface Faculty {
  faculty_id: number;
  name_th: string;
}

export function CourseFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    router.push(`/courses?${params.toString()}`);
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

    router.push(`/courses?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 relative border-2 hover:border-primary/50 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in-50">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b mb-2">
          <SheetTitle className="text-xl flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filter & Sort
          </SheetTitle>
          <SheetDescription>Customize your course search</SheetDescription>
        </SheetHeader>

        <div className="py-4 px-4 space-y-5">
          {/* Sort By Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              Sort By
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                    sortBy === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span>{option.icon}</span>
                  <span className="truncate">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Faculty Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Faculty
            </div>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger className="h-11 border-2 hover:border-primary/30 transition-colors">
                <SelectValue placeholder="All Faculties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    🏛️ All Faculties
                  </span>
                </SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem
                    key={faculty.faculty_id}
                    value={String(faculty.faculty_id)}
                  >
                    {faculty.name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Rating Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              Minimum Rating
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border-2 font-medium transition-all text-sm",
                    minRating === rating
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                      : "border-muted hover:border-yellow-300 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20"
                  )}
                >
                  {rating === 0 ? (
                    "Any"
                  ) : (
                    <span className="flex items-center justify-center gap-0.5">
                      {rating}
                      <Star className="h-3 w-3 fill-current" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Has Reviews Toggle */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-100 dark:border-green-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label className="text-sm font-semibold cursor-pointer">
                    Has Reviews Only
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show courses with feedback
                  </p>
                </div>
              </div>
              <Switch
                checked={hasReviews}
                onCheckedChange={setHasReviews}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </section>

          {/* Category Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              Category
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCategory("")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                  category === ""
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <span>📋</span>
                <span>All</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                    category === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Grading Type Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardList className="h-4 w-4 text-primary" />
              Grading Type
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setGradingType("")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all",
                  gradingType === ""
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <span className="text-lg">📊</span>
                <div>
                  <div className="font-medium text-sm">All Types</div>
                  <div className="text-xs text-muted-foreground">
                    Show all grading methods
                  </div>
                </div>
              </button>
              {GRADING_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setGradingType(type.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all",
                    gradingType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg">
                    {type.value === "NORM" ? "📈" : "✅"}
                  </span>
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-4 gap-2 sm:gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex-1 gap-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Clear ({activeFilterCount})
            </Button>
          )}
          <Button onClick={handleApply} className="flex-1 gap-2 font-semibold">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
