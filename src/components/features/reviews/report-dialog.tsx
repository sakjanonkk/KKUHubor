"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface ReportDialogProps {
  reviewId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({
  reviewId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Report");

  async function handleSubmit() {
    if (!reason) {
      toast.error(t("selectReasonError"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, reason }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      toast.success(t("success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Select onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder={t("selectReason")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inappropriate Content">
                  {t("reasons.inappropriate")}
                </SelectItem>
                <SelectItem value="Spam">
                  {t("reasons.spam")}
                </SelectItem>
                <SelectItem value="Misleading Information">
                  {t("reasons.misleading")}
                </SelectItem>
                <SelectItem value="Harassment">
                  {t("reasons.harassment")}
                </SelectItem>
                <SelectItem value="Other">
                  {t("reasons.other")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
