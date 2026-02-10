"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Flag } from "lucide-react";

interface ActivityItem {
  type: "review" | "comment" | "report";
  id: number;
  actor: string;
  content: string;
  created_at: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  translations: {
    title: string;
    noActivity: string;
    review: string;
    comment: string;
    report: string;
  };
}

const iconMap = {
  review: ThumbsUp,
  comment: MessageSquare,
  report: Flag,
};

const colorMap = {
  review: "text-blue-500 bg-blue-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  report: "text-red-500 bg-red-500/10",
};

export function RecentActivity({ activities, translations: t }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.noActivity}
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type];
              const color = colorMap[activity.type];
              const typeLabel = t[activity.type];
              return (
                <div key={`${activity.type}-${activity.id}`} className="flex gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.actor}</span>{" "}
                      <span className="text-muted-foreground">{typeLabel}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5" suppressHydrationWarning>
                      {new Date(activity.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
