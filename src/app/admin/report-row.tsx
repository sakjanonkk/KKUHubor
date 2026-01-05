"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);

  async function handleKeepReview() {
    if (!confirm("Are you sure you want to dismiss this report?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.report_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Report dismissed");
        router.refresh();
      } else {
        toast.error("Failed to dismiss report");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview() {
    if (
      !confirm(
        "Are you sure you want to delete this review? This cannot be undone."
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${report.review_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete review");
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
        {new Date(report.report_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleKeepReview}
          disabled={loading}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Keep
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteReview}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
