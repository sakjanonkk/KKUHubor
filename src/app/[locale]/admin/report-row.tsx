"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, CheckCircle } from "lucide-react";

interface ReportRowProps {
  report: {
    report_id: number;
    reason: string;
    report_date: Date;
    review_id: number;
    content: string;
    reviewer_name: string;
  };
}

export function ReportRow({ report }: ReportRowProps) {
  const router = useRouter();
  const format = useFormatter();
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);

  async function handleDismissReport() {
    if (!confirm(t("dismissConfirm"))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.report_id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success(t("dismissSuccess"));
        router.refresh();
      } else {
        toast.error(t("dismissError"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview() {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${report.review_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        toast.error(t("deleteError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="max-w-md">
        <p className="font-medium text-sm truncate">{report.reviewer_name}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {report.content}
        </p>
      </TableCell>
      <TableCell>{report.reason}</TableCell>
      <TableCell className="whitespace-nowrap">
        {format.dateTime(new Date(report.report_date), {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismissReport}
          disabled={loading}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {t("dismiss")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteReview}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {t("deleteReview")}
        </Button>
      </TableCell>
    </TableRow>
  );
}
