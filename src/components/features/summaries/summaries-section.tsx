"use client";

import { SummaryFile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "./summary-card";
import { UploadSummaryDialog } from "./upload-summary-dialog";
import { FileText, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

interface SummariesSectionProps {
  summaryFiles: SummaryFile[];
  courseId: number;
}

export function SummariesSection({ summaryFiles, courseId }: SummariesSectionProps) {
  const t = useTranslations("Summaries");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {t("title")}
          {summaryFiles.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {summaryFiles.length}
            </Badge>
          )}
        </h3>
        <UploadSummaryDialog courseId={courseId} />
      </div>

      {summaryFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed animate-in fade-in zoom-in duration-500">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground fill-muted-foreground/20" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">{t("noFiles")}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-base leading-relaxed">
            {t("noFilesDescription")}
          </p>
          <UploadSummaryDialog courseId={courseId} />
        </div>
      ) : (
        <div className="space-y-3">
          {summaryFiles.map((file, i) => (
            <div
              key={file.id}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <SummaryCard file={file} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
