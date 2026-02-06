import { MessageSquare, Award, Calendar } from "lucide-react";

interface CourseStatsProps {
  totalReviews: number;
  avgGrade: string | null;
  commonSemester: string | null;
  t: (key: string) => string;
}

export function CourseStats({
  totalReviews,
  avgGrade,
  commonSemester,
  t,
}: CourseStatsProps) {
  const stats = [
    {
      label: t("totalReviews"),
      value: totalReviews.toString(),
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    avgGrade && {
      label: t("avgGrade"),
      value: avgGrade,
      icon: Award,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    commonSemester && {
      label: t("commonSemester"),
      value: commonSemester,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    icon: any;
    color: string;
    bg: string;
  }[];

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
        >
          <div
            className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
          >
            <stat.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight truncate">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
