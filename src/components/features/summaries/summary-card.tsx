"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SummaryFile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText, Image, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function getFileIcon(type: string) {
  if (type === "application/pdf") return <FileText className="h-10 w-10 text-red-500" />;
  if (type.startsWith("image/")) return <Image className="h-10 w-10 text-blue-500" />;
  return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtLabel(type: string) {
  if (type === "application/pdf") return "PDF";
  if (type === "image/jpeg") return "JPG";
  if (type === "image/png") return "PNG";
  if (type.includes("wordprocessingml")) return "DOCX";
  if (type.includes("presentationml")) return "PPTX";
  return "FILE";
}

interface SummaryCardProps {
  file: SummaryFile;
}

export function SummaryCard({ file }: SummaryCardProps) {
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const t = useTranslations("Summaries");

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId && file.sessionId && sessionId === file.sessionId) {
      setIsOwner(true);
    }
  }, [file.sessionId]);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    const sessionId = localStorage.getItem("session_id");
    try {
      const res = await fetch(
        `/api/summaries/${file.id}?session_id=${sessionId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        toast.error(t("uploadError"));
      }
    } catch {
      toast.error(t("uploadError"));
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 p-2 rounded-lg bg-muted/50">
            {getFileIcon(file.fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{file.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("by")} {file.uploaderName || t("anonymous")}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-muted font-medium">
                {getFileExtLabel(file.fileType)}
              </span>
              <span>{formatSize(file.fileSize)}</span>
              <span>
                {file.downloadCount} {t("downloads")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a href={`/api/summaries/${file.id}/download`} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
