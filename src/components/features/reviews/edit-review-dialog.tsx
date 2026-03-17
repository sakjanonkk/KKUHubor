"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getOrCreateSessionId } from "@/lib/session";
import { generateSemesterOptions } from "@/lib/semester";

interface EditReviewDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReviewDialog({
  review,
  open,
  onOpenChange,
}: EditReviewDialogProps) {
  const router = useRouter();
  const t = useTranslations("Review");
  const tForm = useTranslations("Review.Form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const semesterOptions = generateSemesterOptions();
  // Include the review's existing semester if not in generated options
  if (review.semester && !semesterOptions.includes(review.semester)) {
    semesterOptions.push(review.semester);
  }

  const formSchema = z.object({
    gradeReceived: z.string().min(1, tForm("validation.grade")),
    semester: z.string().min(1, tForm("validation.semester")),
    content: z.string().min(10, tForm("validation.contentLength")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeReceived: review.gradeReceived || "",
      semester: review.semester || "",
      content: review.content,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: review.id,
          session_id: sessionId,
          grade_received: values.gradeReceived,
          semester: values.semester,
          content: values.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      window.dispatchEvent(new CustomEvent("review-updated", {
        detail: { ...review, gradeReceived: values.gradeReceived, semester: values.semester, content: values.content },
      }));

      toast.success(t("editSuccess"));
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error(t("editError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editSubtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gradeReceived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("gradeLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={tForm("select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A", "B+", "B", "C+", "C", "D+", "D", "F", "W"].map(
                          (grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tForm("semesterLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={tForm("semesterPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesterOptions.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm("contentLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tForm("contentPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span
                      className={`text-xs ${
                        (field.value?.length || 0) > 2000
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {field.value?.length || 0}/2000
                    </span>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {t("update")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
