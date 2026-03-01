"use client";

import { useState, useEffect } from "react";
import { SummaryFile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "./summary-card";
import { UploadSummaryDialog } from "./upload-summary-dialog";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface SummariesSectionProps {
  summaryFiles: SummaryFile[];
  courseId: number;
}

export function SummariesSection({ summaryFiles, courseId }: SummariesSectionProps) {
  const t = useTranslations("Summaries");
  const [files, setFiles] = useState<SummaryFile[]>(summaryFiles);

  useEffect(() => {
    const handleAdded = (e: Event) => {
      const newFile = (e as CustomEvent).detail as SummaryFile;
      setFiles((prev) => [newFile, ...prev]);
    };
    const handleDeleted = (e: Event) => {
      const deletedId = (e as CustomEvent).detail as number;
      setFiles((prev) => prev.filter((f) => f.id !== deletedId));
    };
    window.addEventListener("summary-added", handleAdded);
    window.addEventListener("summary-deleted", handleDeleted);
    return () => {
      window.removeEventListener("summary-added", handleAdded);
      window.removeEventListener("summary-deleted", handleDeleted);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          {t("title")}
          {files.length > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {files.length}
            </Badge>
          )}
        </h3>
        <UploadSummaryDialog courseId={courseId} />
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-muted/20 border-border/50 border-dashed animate-in fade-in zoom-in duration-500">
          <Image src="/mascot-no-summaries.png" alt="No summaries" width={160} height={90} className="mb-6" />
          <h3 className="text-2xl font-bold mb-3">{t("noFiles")}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-base leading-relaxed">
            {t("noFilesDescription")}
          </p>
          <UploadSummaryDialog courseId={courseId} />
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, i) => (
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
