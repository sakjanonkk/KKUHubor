"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface TagRequest {
  request_id: number;
  tag_name: string;
  course_name: string;
  course_code: string;
  created_at: string;
}

interface TagRequestManagementProps {
  requests: TagRequest[];
}

export function TagRequestManagement({ requests }: TagRequestManagementProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const router = useRouter();
  const t = useTranslations("Admin");

  const handleAction = async (
    requestId: number,
    action: "approve" | "reject"
  ) => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/admin/tags/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (!res.ok) throw new Error("Failed to process request");

      toast.success(action === "approve" ? t("tagApproveSuccess") : t("tagRejectSuccess"));
      router.refresh();
    } catch {
      toast.error(t("tagError"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tagCourse")}</TableHead>
            <TableHead>{t("tagRequested")}</TableHead>
            <TableHead>{t("tagDate")}</TableHead>
            <TableHead className="text-right">{t("tagActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center h-24 text-muted-foreground"
              >
                {t("noTagRequests")}
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <TableRow key={req.request_id}>
                <TableCell>
                  <div className="font-medium">{req.course_code}</div>
                  <div className="text-sm text-muted-foreground">
                    {req.course_name}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="bg-secondary px-2 py-1 rounded-md text-xs font-medium">
                    {req.tag_name}
                  </span>
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {new Date(req.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleAction(req.request_id, "approve")}
                      disabled={processingId === req.request_id}
                    >
                      {processingId === req.request_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleAction(req.request_id, "reject")}
                      disabled={processingId === req.request_id}
                    >
                      {processingId === req.request_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
